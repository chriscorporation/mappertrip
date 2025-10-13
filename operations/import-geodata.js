const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
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

// Validar que venga el argumento file
if (!cliArgs.file) {
  console.error('❌ node operations/import-geodata.js file=departamentos-cordoba.json');
  process.exit(1);
}

const FILE_NAME = cliArgs.file;

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

// Función para calcular el centroide desde un polígono
function calculateCentroid(polygon) {
  if (!polygon || polygon.length === 0) {
    return null;
  }

  let totalLat = 0;
  let totalLng = 0;
  let count = 0;

  polygon.forEach(coord => {
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

async function testConnection() {
  console.log('🔄 Probando conectividad con Supabase...\n');

  const { data, error } = await supabase
    .from('geoplaces')
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
    .from('geoplaces')
    .select('id_ref');

  if (error) {
    console.error('❌ Error al verificar IDs existentes:', error.message);
    return new Set();
  }

  return new Set(data.map(item => item.id_ref).filter(id => id !== null));
}

async function importGeoData() {
  await testConnection();

  // Leer archivo GeoJSON
  console.log(`📂 Leyendo archivo ${FILE_NAME}...\n`);
  const geoData = JSON.parse(fs.readFileSync(`../geojson/${FILE_NAME}`, 'utf8'));

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
      const centroid = calculateCentroid(polygon);

      if (!centroid) {
        console.log(`⚠️  Sin polígono válido para feature ${feature.properties.id}`);
        return null;
      }

      const departamento = capitalizeName(feature.properties.departamento || '');
      const cabecera = capitalizeName(feature.properties.cabecera || '');
      const provincia = capitalizeName(feature.properties.provincia || '');

      return {
        address: `${cabecera}, ${provincia}`,
        id_ref: feature.properties.id,
        country_code: 'AR',
        lat: centroid.lat,
        lng: centroid.lng,
        polygon: polygon,
        type: 'claude',
        status: 'PENDING'
      };
    }).filter(item => item !== null);

    const { data, error } = await supabase
      .from('geoplaces')
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
