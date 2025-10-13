import Perplexity from '@perplexity-ai/perplexity_ai';
import { createClient } from '@supabase/supabase-js';
import { PERPLEXITY_PROMPTS, PERPLEXITY_RESPONSE_SCHEMAS } from '../../utils/perplexityPrompts';

// Cliente para operaciones de lectura (ANON_KEY)
const supabaseRead = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Cliente para operaciones de escritura (SERVICE_ROLE_KEY)
const supabaseWrite = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const client = new Perplexity({
  apiKey: process.env.PERPLEXITY_API_KEY
});

async function processPerplexityData(zone_id, zone, countryName, existing) {
  console.log(`\n=== Procesando Perplexity para zona ${zone_id} ===`);
  console.log('Zona info:', {
    id: zone_id,
    address: zone.address,
    country: countryName,
    lat: zone.lat,
    lng: zone.lng,
    orientation: zone.orientation
  });

  const searchTypes = ['notes', 'rent', 'tourism', 'secure', 'places', 'orientation'];
  const results = {};
  let orientationValue = null;
  let insecurityLevelId = null;

  // Mapeo de respuestas de Perplexity a insecurity_level_id
  const SECURITY_LEVEL_MAP = {
    'Seguridad buena': 0,
    'Seguridad aceptable': 1,
    'Seguridad media': 2,
    'Seguridad baja': 3,
    'Sin seguridad': 4
  };

  // Procesar cada tipo de búsqueda
  for (const searchType of searchTypes) {
    // Para orientation, verificamos si ya existe en geoplaces
    if (searchType === 'orientation' && zone.orientation) {
      console.log(`⏭️  Orientation ya existe (${zone.orientation}), omitiendo llamada a Perplexity`);
      orientationValue = zone.orientation;
      continue;
    }

    // Si el campo ya tiene información (no null y no vacío), omitir
    if (searchType !== 'orientation' && existing && existing[searchType] !== null && existing[searchType] !== '') {
      console.log(`⏭️  Campo ${searchType} ya tiene contenido, omitiendo llamada a Perplexity`);
      results[searchType] = existing[searchType];
      continue;
    }

    // Llamar a Perplexity para este campo
    try {
      const prompt = PERPLEXITY_PROMPTS[searchType](zone.address, countryName, zone.lat, zone.lng);

      console.log(`\n--- Buscando ${searchType} ---`);
      console.log('Prompt enviado:', prompt);

      const completionConfig = {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'sonar',
        web_search_options: {
          search_recency_filter: 'month'
        }
      };

      // Para campos con schema JSON agregamos response_format
      if (PERPLEXITY_RESPONSE_SCHEMAS[searchType]) {
        completionConfig.response_format = PERPLEXITY_RESPONSE_SCHEMAS[searchType];
      }

      const completion = await client.chat.completions.create(completionConfig);
      let aiResponse = completion.choices?.[0]?.message?.content;

      console.log(`Respuesta ${searchType}:`, aiResponse);

      // Procesar respuesta según el tipo
      if (searchType === 'secure' && aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          aiResponse = parsed.seguridad;
          console.log(`Parsed secure: ${aiResponse}`);

          // Mapear la respuesta al insecurity_level_id
          if (aiResponse && SECURITY_LEVEL_MAP[aiResponse] !== undefined) {
            insecurityLevelId = SECURITY_LEVEL_MAP[aiResponse];
            console.log(`✅ Nivel de seguridad mapeado: "${aiResponse}" → ID ${insecurityLevelId}`);
          } else {
            console.log(`⚠️ Respuesta de seguridad no coincide con enum: "${aiResponse}"`);
          }
        } catch (e) {
          console.error('❌ Error parsing secure response:', e.message);
          console.error('Raw response was:', aiResponse);
          aiResponse = null;
        }
      } else if (searchType === 'rent' && aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          const rentValue = parseFloat(parsed.rent);
          if (!isNaN(rentValue)) {
            aiResponse = Math.round(rentValue);
            console.log(`Parsed rent: ${aiResponse} USD`);
          } else {
            console.log(`⚠️  Rent value is NaN from parsed.rent: ${parsed.rent}`);
            aiResponse = null;
          }
        } catch (e) {
          console.error('❌ Error parsing rent response:', e.message);
          console.error('Raw response was:', aiResponse);
          aiResponse = null;
        }
      } else if (searchType === 'orientation' && aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          orientationValue = parsed.orientacion;
          console.log(`Parsed orientation: ${orientationValue}`);
        } catch (e) {
          console.error('❌ Error parsing orientation response:', e.message);
          console.error('Raw response was:', aiResponse);
          orientationValue = null;
        }
      }

      if (searchType !== 'orientation' && aiResponse) {
        results[searchType] = aiResponse;
        console.log(`✅ ${searchType} guardado exitosamente`);
      }
    } catch (error) {
      console.error(`❌ Error ejecutando búsqueda de ${searchType}:`, error.message);
      console.error('Stack:', error.stack);
      if (searchType !== 'orientation') {
        results[searchType] = null;
      }
    }
  }

  // Guardar perplexity_notes en un solo upsert
  console.log('\n--- Guardando resultados en perplexity_notes ---');
  console.log('Datos a guardar:', { zone_id, ...results });

  try {
    await supabaseWrite
      .from('perplexity_notes')
      .upsert(
        {
          zone_id: zone_id,
          ...results,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'zone_id',
          ignoreDuplicates: false
        }
      );
    console.log('✅ Perplexity notes guardadas exitosamente');
  } catch (error) {
    console.error('❌ Error saving perplexity data:', error.message);
    console.error('Stack:', error.stack);
  }

  // Actualizar orientation, insecurity_level_id, active y status en geoplaces
  const geoplacesUpdate = {
    active: true, // Marcar como activa al finalizar el procesamiento
    status: 'DONE' // Marcar como completada
  };

  if (orientationValue) {
    geoplacesUpdate.orientation = orientationValue;
  }

  if (insecurityLevelId !== null) {
    geoplacesUpdate.insecurity_level_id = insecurityLevelId;
  }

  console.log(`\n--- Actualizando geoplaces con: ${JSON.stringify(geoplacesUpdate)} ---`);
  try {
    await supabaseWrite
      .from('geoplaces')
      .update(geoplacesUpdate)
      .eq('id', zone_id);

    if (orientationValue) {
      console.log(`✅ Orientation guardada: ${orientationValue}`);
    }
    if (insecurityLevelId !== null) {
      console.log(`✅ Nivel de seguridad actualizado: ID ${insecurityLevelId}`);
    }
    console.log(`✅ Zona marcada como activa (active: true)`);
    console.log(`✅ Status actualizado a DONE`);
  } catch (error) {
    console.error('❌ Error updating geoplaces:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log(`\n=== Procesamiento completado para zona ${zone_id} ===\n`);
}

export async function POST(request) {
  try {
    const { zone_id } = await request.json();

    if (!zone_id) {
      return Response.json(
        { error: 'zone_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener información de la zona
    const { data: zone, error: zoneError } = await supabaseRead
      .from('geoplaces')
      .select('id, address, country_code, lat, lng, orientation')
      .eq('id', zone_id)
      .single();

    if (zoneError || !zone) {
      return Response.json(
        { error: 'Zona no encontrada' },
        { status: 404 }
      );
    }

    // Obtener nombre del país
    const { data: country } = await supabaseRead
      .from('countries')
      .select('name')
      .eq('country_code', zone.country_code)
      .single();

    const countryName = country?.name || zone.country_code;

    // Verificar qué campos ya tienen información
    const { data: existing } = await supabaseRead
      .from('perplexity_notes')
      .select('*')
      .eq('zone_id', zone_id)
      .single();

    // Ejecutar el procesamiento en background (sin await)
    processPerplexityData(zone_id, zone, countryName, existing).catch(error => {
      console.error('Error en background processing:', error);
    });

    // Responder inmediatamente
    return Response.json({
      success: true,
      zone_id,
      message: 'Proceso iniciado en background'
    });

  } catch (error) {
    console.error('Error en perplexity-populate:', error);
    return Response.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
