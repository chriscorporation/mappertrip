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
    const { zone_id } = await request.json();

    // Validar parámetros
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

    // Verificar si ya existe orientación
    if (zone.orientation) {
      return Response.json({
        success: true,
        zone_id,
        orientation: zone.orientation,
        skipped: true,
        message: 'La zona ya tiene orientación, se omitió la llamada a Perplexity'
      });
    }

    // Obtener nombre del país
    const { data: country } = await supabaseRead
      .from('countries')
      .select('name')
      .eq('country_code', zone.country_code)
      .single();

    const countryName = country?.name || zone.country_code;

    // Crear prompt
    const prompt = PERPLEXITY_PROMPTS.orientation(zone.address, countryName, zone.lat, zone.lng);

    // Configuración para Perplexity
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
      },
      response_format: PERPLEXITY_RESPONSE_SCHEMAS.orientation
    };

    // Llamar a Perplexity API
    const completion = await client.chat.completions.create(completionConfig);

    let aiResponse = completion.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return Response.json(
        { error: 'No se recibió respuesta del modelo' },
        { status: 500 }
      );
    }

    // Extraer el valor del JSON
    let orientationValue = null;
    try {
      const parsed = JSON.parse(aiResponse);
      orientationValue = parsed.orientacion;
    } catch (e) {
      console.error('Error parsing orientation response:', e);
      return Response.json(
        { error: 'Error al procesar respuesta de Perplexity' },
        { status: 500 }
      );
    }

    if (!orientationValue) {
      return Response.json(
        { error: 'No se pudo determinar la orientación' },
        { status: 500 }
      );
    }

    // Guardar orientación en geoplaces
    const { error: updateError } = await supabaseWrite
      .from('geoplaces')
      .update({ orientation: orientationValue })
      .eq('id', zone_id);

    if (updateError) {
      console.error('Error updating orientation:', updateError);
      return Response.json(
        { error: 'Error al guardar la orientación' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      zone_id,
      orientation: orientationValue
    });

  } catch (error) {
    console.error('Error en perplexity-orientation:', error);
    return Response.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
