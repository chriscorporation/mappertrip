import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Función para esperar N milisegundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para verificar que el servidor esté corriendo
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3025/api/perplexity-populate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    // Si responde (incluso con error 400 por falta de zone_id), el servidor está corriendo
    return true;
  } catch (error) {
    return false;
  }
}

async function processZones() {
  console.log('🚀 Iniciando procesamiento de zonas con active=null\n');

  try {
    // Verificar que el servidor esté corriendo
    console.log('🔍 Verificando que el servidor esté corriendo en http://localhost:3025...');
    const serverRunning = await checkServerRunning();

    if (!serverRunning) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERROR: El servidor no está corriendo');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Este script requiere que el servidor Next.js esté corriendo.\n');
      console.log('Para iniciar el servidor, ejecuta en otra terminal:');
      console.log('  npm run dev\n');
      console.log('El servidor debe estar corriendo en: http://localhost:3025\n');
      process.exit(1);
    }

    console.log('✅ Servidor detectado correctamente\n');

    // Obtener todas las zonas con active=null
    const { data: zones, error } = await supabase
      .from('geoplaces')
      .select('id, address, country_code')
      .is('active', null)
      .order('id');

    if (error) {
      console.error('❌ Error al obtener zonas:', error.message);
      return;
    }

    if (!zones || zones.length === 0) {
      console.log('ℹ️  No se encontraron zonas con active=null');
      return;
    }

    console.log(`✅ Se encontraron ${zones.length} zonas para procesar\n`);

    const results = {
      total: zones.length,
      successful: [],
      failed: [],
      ids: []
    };

    // Iterar sobre cada zona
    for (let i = 0; i < zones.length; i++) {
      const zone = zones[i];
      const current = i + 1;

      console.log(`\n[${current}/${zones.length}] Procesando zona ID: ${zone.id}`);
      console.log(`   Dirección: ${zone.address}`);
      console.log(`   País: ${zone.country_code}`);

      try {
        // Llamar al API endpoint
        const response = await fetch('http://localhost:3025/api/perplexity-populate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ zone_id: zone.id })
        });

        const data = await response.json();

        if (response.ok) {
          console.log(`   ✅ Llamada exitosa: ${data.message}`);
          results.successful.push(zone.id);
          results.ids.push(zone.id);
        } else {
          console.log(`   ❌ Error en la llamada: ${data.error || 'Unknown error'}`);
          results.failed.push({ id: zone.id, error: data.error });
          results.ids.push(zone.id);
        }
      } catch (error) {
        console.log(`   ❌ Error al llamar al API: ${error.message}`);
        results.failed.push({ id: zone.id, error: error.message });
      }

      // Esperar 25 segundos antes de la siguiente llamada (excepto en la última)
      if (current < zones.length) {
        console.log('   ⏳ Esperando 25 segundos...');
        await sleep(25000);
      }
    }

    // Informe final
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📊 INFORME FINAL');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total de zonas procesadas: ${results.total}`);
    console.log(`Llamadas exitosas: ${results.successful.length}`);
    console.log(`Llamadas fallidas: ${results.failed.length}`);

    if (results.successful.length > 0) {
      console.log('\n✅ IDs procesados exitosamente:');
      console.log(results.successful.join(', '));
    }

    if (results.failed.length > 0) {
      console.log('\n❌ IDs con errores:');
      results.failed.forEach(({ id, error }) => {
        console.log(`   - ID ${id}: ${error}`);
      });
    }

    console.log('\n📋 Todos los IDs procesados:');
    console.log(results.ids.join(', '));
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar el script
processZones()
  .then(() => {
    console.log('✨ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
