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
  const searchTypes = ['notes', 'rent', 'tourism', 'secure', 'places'];
  const results = {};

  // Procesar cada tipo de búsqueda
  for (const searchType of searchTypes) {
    // Si el campo ya tiene información, omitir
    if (existing && existing[searchType]) {
      results[searchType] = existing[searchType];
      continue;
    }

    // Llamar a Perplexity para este campo
    try {
      const prompt = PERPLEXITY_PROMPTS[searchType](zone.address, countryName);

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

      // Para "secure" y "rent" agregamos response_format con JSON schema
      if (PERPLEXITY_RESPONSE_SCHEMAS[searchType]) {
        completionConfig.response_format = PERPLEXITY_RESPONSE_SCHEMAS[searchType];
      }

      const completion = await client.chat.completions.create(completionConfig);
      let aiResponse = completion.choices?.[0]?.message?.content;

      // Procesar respuesta según el tipo
      if (searchType === 'secure' && aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          aiResponse = parsed.seguridad;
        } catch (e) {
          console.error('Error parsing secure response:', e);
          aiResponse = null;
        }
      } else if (searchType === 'rent' && aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          const rentValue = parseFloat(parsed.rent);
          if (!isNaN(rentValue)) {
            aiResponse = Math.round(rentValue);
          } else {
            aiResponse = null;
          }
        } catch (e) {
          console.error('Error parsing rent response:', e);
          aiResponse = null;
        }
      }

      if (aiResponse) {
        results[searchType] = aiResponse;
      }
    } catch (error) {
      console.error(`Error executing ${searchType} search:`, error);
      results[searchType] = null;
    }
  }

  // Guardar todos los resultados en un solo upsert
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
  } catch (error) {
    console.error('Error saving perplexity data:', error);
  }
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
      .select('id, address, country_code')
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
