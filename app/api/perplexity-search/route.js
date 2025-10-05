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

export async function POST(request) {
  try {
    const { zone_id, search_type } = await request.json();

    // Validar parámetros
    if (!zone_id || !search_type) {
      return Response.json(
        { error: 'zone_id y search_type son requeridos' },
        { status: 400 }
      );
    }

    if (!['notes', 'rent', 'tourism', 'secure', 'places'].includes(search_type)) {
      return Response.json(
        { error: 'search_type debe ser: notes, rent, tourism, secure o places' },
        { status: 400 }
      );
    }

    // Obtener información de la zona
    const { data: zone, error: zoneError } = await supabaseRead
      .from('geoplaces')
      .select('id, address, country_code, lat, lng')
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

    // Verificar si ya existe información para este campo específico
    const { data: existing } = await supabaseRead
      .from('perplexity_notes')
      .select(`id, ${search_type}`)
      .eq('zone_id', zone_id)
      .single();

    // Si el campo ya tiene información, no llamar a Perplexity
    if (existing && existing[search_type]) {
      return Response.json({
        success: true,
        zone_id,
        search_type,
        response: existing[search_type],
        skipped: true,
        message: 'Campo ya tiene información, se omitió la llamada a Perplexity'
      });
    }

    const prompt = PERPLEXITY_PROMPTS[search_type](zone.address, countryName, zone.lat, zone.lng);

    // Configuración base para Perplexity
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
    if (PERPLEXITY_RESPONSE_SCHEMAS[search_type]) {
      completionConfig.response_format = PERPLEXITY_RESPONSE_SCHEMAS[search_type];
    }

    // Llamar a Perplexity API
    const completion = await client.chat.completions.create(completionConfig);

    let aiResponse = completion.choices?.[0]?.message?.content;

    // Si es secure o rent, extraer el valor del JSON
    if (search_type === 'secure' && aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse);
        aiResponse = parsed.seguridad;
      } catch (e) {
        console.error('Error parsing secure response:', e);
      }
    } else if (search_type === 'rent' && aiResponse) {
      try {
        const parsed = JSON.parse(aiResponse);
        // Asegurar que es un número válido y redondearlo
        const rentValue = parseFloat(parsed.rent);
        if (!isNaN(rentValue)) {
          aiResponse = Math.round(rentValue);
        } else {
          console.error('Invalid rent value:', parsed.rent);
          aiResponse = null;
        }
      } catch (e) {
        console.error('Error parsing rent response:', e);
        aiResponse = null;
      }
    }

    if (!aiResponse) {
      return Response.json(
        { error: 'No se recibió respuesta del modelo' },
        { status: 500 }
      );
    }

    // Usar upsert para actualizar o insertar en un solo paso
    const { data: result, error: upsertError } = await supabaseWrite
      .from('perplexity_notes')
      .upsert(
        {
          zone_id: zone_id,
          [search_type]: aiResponse,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'zone_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single();

    if (upsertError) throw upsertError;

    return Response.json({
      success: true,
      zone_id,
      search_type,
      response: aiResponse,
      data: result
    });

  } catch (error) {
    console.error('Error en perplexity-search:', error);
    return Response.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
