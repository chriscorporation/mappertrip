import Perplexity from '@perplexity-ai/perplexity_ai';
import { createClient } from '@supabase/supabase-js';

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

const PROMPTS = {
  notes: (address, country) =>
    `Busca información confiable y reciente de la zona de "${address}, ${country}". Analiza opiniones de policía, viajeros, turistas, locales y extranjeros. Evalúa si esta zona es viable para rentar como turista extranjero: ¿se recomienda o hay que tener precaución? Compara diferentes perspectivas y resume en máximo 60 palabras. Usa formato Markdown para resaltar palabras importantes con negritas. Sin incluir referencias, números entre corchetes ni links.`,

  rent: (address, country) =>
    `Busca opiniones recientes (últimos 6 meses) sobre costos de renta en "${address}, ${country}". Consulta perspectivas de locales, extranjeros que se mudaron recientemente, corredores de rentas e inmobiliarias. Proporciona ÚNICAMENTE el costo promedio mensual en USD para un monoambiente o departamento pequeño (máximo 2 personas). Responde solo con el número promedio, sin rangos.`,

  tourism: (address, country) =>
    `Busca información de agencias de viajes, locales, turistas, extranjeros y policía sobre "${address}, ${country}". Evalúa si esta zona es segura para turistas extranjeros o si debe evitarse. Resume en formato Markdown con máximo 30 palabras. Usa negritas para resaltar palabras importantes. Sin incluir referencias, números entre corchetes ni links.`,

  secure: (address, country) =>
    `Busca información reciente sobre seguridad en "${address}, ${country}". Analiza opiniones de locales, extranjeros residentes, policía y viajeros frecuentes. Responde ÚNICAMENTE con una de estas frases exactas: "Seguridad buena", "Seguridad aceptable", "Seguridad media", "Seguridad baja", o "Sin seguridad".`,

  places: (address, country) =>
    `Busca opiniones, comentarios y recomendaciones de lugares representativos que existan en "${address}, ${country}" o cercanos para visitar. Si no hay atracciones principales, sugiere restaurantes populares, mercados de fin de semana, o eventos importantes que ocurran en la zona. Recomienda al menos 3 a 5 lugares con sus nombres específicos. IMPORTANTE: Usa formato Markdown para poner en negritas **todos los nombres de lugares de interés, atracciones, restaurantes, mercados o eventos**. No debe superar los 200 palabras la respuesta. Sin incluir referencias, números entre corchetes ni links.`
};

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
      const prompt = PROMPTS[searchType](zone.address, countryName);

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
      if (searchType === 'secure') {
        completionConfig.response_format = {
          type: 'json_schema',
          json_schema: {
            schema: {
              type: 'object',
              properties: {
                seguridad: {
                  type: 'string',
                  enum: ["Seguridad buena", "Seguridad aceptable", "Seguridad media", "Seguridad baja", "Sin seguridad"]
                }
              },
              required: ["seguridad"]
            }
          }
        };
      } else if (searchType === 'rent') {
        completionConfig.response_format = {
          type: 'json_schema',
          json_schema: {
            schema: {
              type: 'object',
              properties: {
                rent: {
                  type: 'number'
                }
              },
              required: ["rent"]
            }
          }
        };
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
