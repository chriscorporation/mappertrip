const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para normalizar texto (quitar acentos, mayúsculas, etc)
function normalizeText(text) {
  return text
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Extraer nombre del barrio/departamento del address
function extractLocationFromAddress(address) {
  // Tomar la primera parte antes de la primera coma
  const parts = address.split(',');
  return normalizeText(parts[0]);
}

async function syncPolygons() {
  console.log('🔄 Iniciando sincronización de polígonos...\n');

  // 1. Obtener todos los registros de geoplaces
  const { data: geoplaces, error: errorGeoplaces } = await supabase
    .from('geoplaces')
    .select('id, address, polygon');

  if (errorGeoplaces) {
    console.error('❌ Error al leer geoplaces:', errorGeoplaces.message);
    process.exit(1);
  }

  console.log(`📊 Total de registros en geoplaces: ${geoplaces.length}\n`);

  // 2. Obtener todos los registros de geo_json
  const { data: geoJson, error: errorGeoJson } = await supabase
    .from('geo_json')
    .select('id, name1, name2, polygon, id_ref');

  if (errorGeoJson) {
    console.error('❌ Error al leer geo_json:', errorGeoJson.message);
    process.exit(1);
  }

  console.log(`📊 Total de registros en geo_json: ${geoJson.length}\n`);
  console.log('🚀 Procesando coincidencias...\n');

  let matchCount = 0;
  let noMatchCount = 0;
  let updateCount = 0;
  let errorCount = 0;

  // 3. Procesar cada registro de geoplaces
  for (const geoplace of geoplaces) {
    const locationName = extractLocationFromAddress(geoplace.address);
    const fullAddress = geoplace.address.toUpperCase();

    // Determinar región del address
    const isCABA = fullAddress.includes('CDAD.') || fullAddress.includes('AUTONOMA') ||
                   fullAddress.includes('CIUDAD AUTONOMA');
    const isProvincia = fullAddress.includes('PROVINCIA');

    // Buscar coincidencia en geo_json con prioridad
    let match = null;

    // Paso 1: Match exacto en name2
    match = geoJson.find(gj => {
      const name2Normalized = normalizeText(gj.name2 || '');
      return name2Normalized === locationName;
    });

    // Paso 2: Match exacto en name1
    if (!match) {
      match = geoJson.find(gj => {
        const name1Normalized = normalizeText(gj.name1 || '');
        return name1Normalized === locationName;
      });
    }

    // Paso 3: Match por región específica (CABA o Provincia)
    if (!match && (isCABA || isProvincia)) {
      match = geoJson.find(gj => {
        const name2Normalized = normalizeText(gj.name2 || '');
        const isGjCABA = gj.region === 'ciudad autonoma de buenos aires';
        const isGjProvincia = gj.region === 'buenos aires';

        if (isCABA && isGjCABA && name2Normalized.includes(locationName)) return true;
        if (isProvincia && isGjProvincia && name2Normalized.includes(locationName)) return true;
        return false;
      });
    }

    // Paso 4: Match parcial solo si la palabra está completa (word boundary)
    if (!match) {
      match = geoJson.find(gj => {
        const name2Normalized = normalizeText(gj.name2 || '');
        const regex = new RegExp(`\\b${locationName}\\b`);
        return regex.test(name2Normalized);
      });
    }

    if (match) {
      matchCount++;
      console.log(`✅ Match encontrado: "${geoplace.address}" → ${match.name1} (${match.name2})`);

      // Actualizar geoplaces con polygon y id_ref de geo_json
      const { error: updateError } = await supabase
        .from('geoplaces')
        .update({
          polygon: match.polygon,
          id_ref: match.id_ref
        })
        .eq('id', geoplace.id);

      if (updateError) {
        console.error(`   ❌ Error al actualizar ID ${geoplace.id}:`, updateError.message);
        errorCount++;
      } else {
        updateCount++;
        console.log(`   📝 Actualizado: polygon + id_ref (${match.id_ref})`);
      }
    } else {
      noMatchCount++;
      console.log(`⏭️  Sin match: "${geoplace.address}"`);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 REPORTE FINAL');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📋 Total procesados: ${geoplaces.length}`);
  console.log(`✅ Matches encontrados: ${matchCount}`);
  console.log(`📝 Actualizados exitosamente: ${updateCount}`);
  console.log(`⏭️  Sin coincidencia: ${noMatchCount}`);
  console.log(`❌ Errores al actualizar: ${errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

syncPolygons().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
