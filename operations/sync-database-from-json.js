const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer argumentos de línea de comandos
function parseArguments() {
  const args = process.argv.slice(2);
  const params = {};

  args.forEach(arg => {
    const match = arg.match(/^(\w+)=["']?([^"']+)["']?$/);
    if (match) {
      params[match[1]] = match[2];
    }
  });

  return params;
}

const cliArgs = parseArguments();

// Mostrar ayuda si se solicita
if (cliArgs.help || cliArgs.h) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📖 USO DEL SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('node sync-database-from-json.js [opciones]\n');
  console.log('Opciones:');
  console.log('  field="campo"    Campo por el cual filtrar (name1, name2, name3, etc.)');
  console.log('  value="valor"    Valor a buscar en el campo especificado\n');
  console.log('Ejemplos:');
  console.log('  node sync-database-from-json.js field=name3 value="BUENOS AIRES"');
  console.log('  node sync-database-from-json.js field=name2 value="ALMAGRO"');
  console.log('  node sync-database-from-json.js field=name1 value="ARGENTINA"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(0);
}

// Validar que se enviaron argumentos
if (Object.keys(cliArgs).length === 0) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR: No se enviaron argumentos');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Este script requiere argumentos para ejecutarse de forma segura.\n');
  console.log('Ejemplos de uso:');
  console.log('  node sync-database-from-json.js field=name3 value="CIUDAD AUTONOMA DE BUENOS AIRES"');
  console.log('  node sync-database-from-json.js field=name2 value="ALMAGRO"');
  console.log('  node sync-database-from-json.js field=name3 value="BUENOS AIRES"\n');
  console.log('Para más información ejecuta:');
  console.log('  node sync-database-from-json.js help\n');
  process.exit(1);
}

// Configuración de filtros dinámicos
const FILTER_FIELD = cliArgs.field || 'name3';
const FILTER_VALUE = cliArgs.value || cliArgs.name3 || cliArgs.name2 || cliArgs.name1;

// Validar que se envió un valor
if (!FILTER_VALUE) {
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.error('❌ ERROR: Falta el valor a filtrar');
  console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Debes especificar un valor para filtrar.\n');
  console.log('Ejemplos:');
  console.log('  node sync-database-from-json.js field=name3 value="CIUDAD AUTONOMA DE BUENOS AIRES"');
  console.log('  node sync-database-from-json.js value="BUENOS AIRES"\n');
  process.exit(1);
}

// Función para calcular el centroide desde un polígono
function calculateCentroid(polygon) {
  if (!polygon) {
    return null;
  }

  let coordinates;

  // Manejar diferentes formatos de polígono
  if (Array.isArray(polygon)) {
    // Formato: array simple de coordenadas (como en geo_json)
    coordinates = polygon;
  } else if (polygon.coordinates && Array.isArray(polygon.coordinates)) {
    // Formato: GeoJSON con coordinates
    coordinates = polygon.coordinates[0] || polygon.coordinates;
  } else {
    return null;
  }

  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  // Calcular centro geométrico (promedio de todas las coordenadas)
  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  coordinates.forEach(coord => {
    if (Array.isArray(coord) && coord.length >= 2) {
      // GeoJSON usa [lng, lat]
      totalLng += coord[0];
      totalLat += coord[1];
      count++;
    }
  });

  if (count === 0) {
    return null;
  }

  return {
    lat: totalLat / count,
    lng: totalLng / count
  };
}

// Función para capitalizar texto correctamente
function capitalizeName(text) {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Función para normalizar texto (quitar acentos, mayúsculas)
function normalizeText(text) {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function syncDatabaseFromJson() {
  console.log('🔄 Iniciando sincronización desde geo_json...');
  console.log(`🔍 Filtrando por ${FILTER_FIELD}: "${FILTER_VALUE}"\n`);

  // 1. Obtener todos los barrios desde geo_json filtrados dinámicamente
  const { data: geoJsonBarrios, error: errorGeoJson } = await supabase
    .from('geo_json')
    .select('id_ref, name2, name3, polygon')
    .eq(FILTER_FIELD, FILTER_VALUE);

  if (errorGeoJson) {
    console.error('❌ Error al leer geo_json:', errorGeoJson.message);
    process.exit(1);
  }

  console.log(`📊 Barrios/zonas encontrados en geo_json: ${geoJsonBarrios.length}\n`);

  // 2. Obtener todos los registros existentes en geoplaces
  const { data: existingPlaces, error: errorGeoplaces } = await supabase
    .from('geoplaces')
    .select('address, id_ref');

  if (errorGeoplaces) {
    console.error('❌ Error al leer geoplaces:', errorGeoplaces.message);
    process.exit(1);
  }

  console.log(`📊 Registros existentes en geoplaces: ${existingPlaces.length}\n`);

  // 3. Crear sets de addresses e id_refs existentes
  const existingAddressesNormalized = new Set(
    existingPlaces.map(place => normalizeText(place.address))
  );

  const existingIdRefs = new Set(
    existingPlaces.map(place => place.id_ref).filter(id => id !== null)
  );

  console.log('🔍 Verificando barrios faltantes...\n');

  let insertCount = 0;
  let updateCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  // 4. Procesar cada barrio de geo_json
  for (const barrio of geoJsonBarrios) {
    const name2Normalized = normalizeText(barrio.name2);
    const name3Capitalized = capitalizeName(barrio.name3);
    const name2Capitalized = capitalizeName(barrio.name2);

    // Verificar si ya existe en geoplaces (búsqueda en address o id_ref)
    const addressToCheck = normalizeText(`${barrio.name2}, ${barrio.name3}`);

    // Buscar si ya existe el registro
    const existingByAddress = existingPlaces.find(
      place => normalizeText(place.address) === addressToCheck
    );
    const existingByIdRef = existingPlaces.find(
      place => place.id_ref === barrio.id_ref
    );
    const existingRecord = existingByAddress || existingByIdRef;

    if (existingRecord) {
      // Si existe, actualizar solo el status si está vacío
      const { data: currentData, error: fetchError } = await supabase
        .from('geoplaces')
        .select('status, id')
        .eq('id_ref', barrio.id_ref)
        .single();

      if (fetchError) {
        console.log(`❌ Error al verificar status de: ${name2Capitalized}`);
        errorCount++;
        continue;
      }

      if (!currentData.status || currentData.status === '') {
        const { error: updateError } = await supabase
          .from('geoplaces')
          .update({ status: 'PENDING' })
          .eq('id', currentData.id);

        if (updateError) {
          console.log(`❌ Error al actualizar status de: ${name2Capitalized}`);
          errorCount++;
        } else {
          console.log(`🔄 Status actualizado a PENDING: ${name2Capitalized}`);
          updateCount++;
        }
      } else {
        console.log(`⏭️  Ya existe con status "${currentData.status}": ${name2Capitalized}`);
        skippedCount++;
      }
      continue;
    }

    // Calcular coordenadas del centroide desde el polígono
    const centroid = calculateCentroid(barrio.polygon);

    if (!centroid) {
      console.log(`⚠️  Sin polígono válido para: ${name2Capitalized}`);
      errorCount++;
      continue;
    }

    // Preparar el registro para insertar
    const newRecord = {
      address: `${name2Capitalized}, ${name3Capitalized}`,
      id_ref: barrio.id_ref,
      country_code: 'AR',
      lat: centroid.lat,
      lng: centroid.lng,
      polygon: barrio.polygon,
      type: 'claude',
      status: 'PENDING'
    };

    console.log(`➕ Insertando: ${newRecord.address}`);

    // Insertar en geoplaces
    const { error: insertError } = await supabase
      .from('geoplaces')
      .insert(newRecord);

    if (insertError) {
      console.error(`   ❌ Error al insertar: ${insertError.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ Insertado correctamente (id_ref: ${barrio.id_ref})`);
      insertCount++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 REPORTE FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 Total procesados: ${geoJsonBarrios.length}`);
  console.log(`✅ Insertados exitosamente: ${insertCount}`);
  console.log(`🔄 Status actualizado: ${updateCount}`);
  console.log(`⏭️  Ya existían con status: ${skippedCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

syncDatabaseFromJson().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
