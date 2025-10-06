const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración de región
const REGION = 'ciudad autonoma de buenos aires';

// Función para normalizar coordenadas según el tipo de geometría
function extractPolygonCoordinates(geometry) {
  if (geometry.type === 'Polygon') {
    // Para Polygon: coordinates[0] contiene el exterior del polígono
    return geometry.coordinates[0];
  } else if (geometry.type === 'MultiPolygon') {
    // Para MultiPolygon: coordinates[0][0] contiene el primer polígono exterior
    return geometry.coordinates[0][0];
  }
  return null;
}

async function testConnection() {
  console.log('🔄 Probando conectividad con Supabase...\n');

  const { data, error } = await supabase
    .from('geo_json')
    .select('count')
    .limit(1);

  if (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }

  console.log('✅ Conexión exitosa a Supabase\n');
}

async function checkExistingIds() {
  const { data, error } = await supabase
    .from('geo_json')
    .select('id_ref');

  if (error) {
    console.error('❌ Error al verificar IDs existentes:', error.message);
    return new Set();
  }

  return new Set(data.map(item => item.id_ref));
}

async function importGeoData() {
  await testConnection();

  // Leer archivo GeoJSON
  console.log('📂 Leyendo archivo departamentos-ciudad_autonoma_de_buenos_aires.json...\n');
  const geoData = JSON.parse(fs.readFileSync('./geojson/departamentos-ciudad_autonoma_de_buenos_aires.json', 'utf8'));

  const features = geoData.features;
  console.log(`📊 Total de features encontrados: ${features.length}\n`);

  // Verificar IDs existentes
  console.log('🔍 Verificando IDs existentes en la base de datos...\n');
  const existingIds = await checkExistingIds();
  console.log(`📝 IDs ya existentes en BD: ${existingIds.size}\n`);

  // Filtrar features que no existen
  const newFeatures = features.filter(f => !existingIds.has(f.properties.id));

  if (newFeatures.length === 0) {
    console.log('✅ Todos los registros ya existen en la base de datos. No hay nada que insertar.');
    return;
  }

  console.log(`📝 Registros nuevos a insertar: ${newFeatures.length}\n`);
  console.log('🚀 Iniciando inserción...\n');

  const BATCH_SIZE = 100;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < newFeatures.length; i += BATCH_SIZE) {
    const batch = newFeatures.slice(i, i + BATCH_SIZE).map(feature => {
      const polygon = extractPolygonCoordinates(feature.geometry);

      return {
        name1: feature.properties.departamento,
        name2: feature.properties.cabecera,
        name3: feature.properties.provincia,
        country_code: 'AR',
        id_ref: feature.properties.id,
        polygon: polygon,
        region: REGION
      };
    });

    const { data, error } = await supabase
      .from('geo_json')
      .insert(batch);

    if (error) {
      console.error(`❌ Error en batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      insertedCount += batch.length;
      const progress = Math.min(i + BATCH_SIZE, newFeatures.length);
      const percentage = ((progress / newFeatures.length) * 100).toFixed(1);
      console.log(`✅ Progreso: ${progress}/${newFeatures.length} (${percentage}%)`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 REPORTE FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Registros insertados: ${insertedCount}`);
  console.log(`❌ Registros con error: ${errorCount}`);
  console.log(`📝 Total de features en archivo: ${features.length}`);
  console.log(`🔄 Registros ya existentes (omitidos): ${existingIds.size}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Ejecutar
importGeoData().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
