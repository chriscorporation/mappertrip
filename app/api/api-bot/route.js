import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente para operaciones de escritura (SERVICE_ROLE_KEY)
const supabaseWrite = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API Bot - Endpoint para alimentar datos desde fuentes externas (Telegram, etc.)
 *
 * POST /api/apibot
 *
 * Body Parameters:
 * - type: 'zone' | 'coworking' | 'instagramable' (REQUIRED)
 * - title: string (REQUIRED) - Usado como nombre/título del lugar
 * - lat: number (REQUIRED) - Latitud
 * - lng: number (REQUIRED) - Longitud
 * - radius_km: 0.5 | 1 | 2 (REQUIRED) - Radio del círculo en kilómetros
 * - insecurity_level_id: 0 | 1 | 2 | 3 | 4 (OPTIONAL - solo para type='zone', default: 0)
 *   * 0 = Seguro
 *   * 1 = Medio
 *   * 2 = Regular
 *   * 3 = Precaución
 *   * 4 = Inseguro
 * - country_code: string (OPTIONAL - default: 'MX')
 * - notes: string (OPTIONAL) - Nota adicional sobre el lugar
 *
 * Ejemplos:
 *
 * 1. Crear zona segura con nota:
 * {
 *   "type": "zone",
 *   "title": "Polanco CDMX",
 *   "lat": 19.4326,
 *   "lng": -99.1332,
 *   "radius_km": 1,
 *   "insecurity_level_id": 0,
 *   "country_code": "MX",
 *   "notes": "Zona residencial exclusiva con seguridad privada"
 * }
 *
 * 2. Crear coworking:
 * {
 *   "type": "coworking",
 *   "title": "WeWork Reforma",
 *   "lat": 19.4284,
 *   "lng": -99.1678,
 *   "radius_km": 0.5,
 *   "country_code": "MX"
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, title, lat, lng, radius_km, insecurity_level_id = 0, country_code = 'MX', notes } = body;

    // Validaciones básicas
    if (!type || !title || !lat || !lng) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: type, title, lat, lng' },
        { status: 400 }
      );
    }

    // Validar type
    const validTypes = ['zone', 'coworking', 'instagramable'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type inválido. Debe ser uno de: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar radius_km solo para zones
    let radiusMeters = null;
    if (type === 'zone') {
      if (!radius_km) {
        return NextResponse.json(
          { error: 'radius_km es requerido para type=zone' },
          { status: 400 }
        );
      }
      const validRadii = [0.5, 1, 2];
      if (!validRadii.includes(radius_km)) {
        return NextResponse.json(
          { error: `radius_km inválido. Debe ser uno de: ${validRadii.join(', ')}` },
          { status: 400 }
        );
      }
      // Convertir km a metros (Google Maps usa metros para el radio)
      radiusMeters = radius_km * 1000;
    }

    // Preparar datos según el tipo
    let tableName;
    let insertData;

    switch (type) {
      case 'zone':
        // Validar insecurity_level_id
        const validLevelIds = [0, 1, 2, 3, 4];
        if (!validLevelIds.includes(insecurity_level_id)) {
          return NextResponse.json(
            { error: `insecurity_level_id inválido. Debe ser uno de: ${validLevelIds.join(', ')} (0=Seguro, 1=Medio, 2=Regular, 3=Precaución, 4=Inseguro)` },
            { status: 400 }
          );
        }

        // Obtener el color desde la base de datos
        const { data: levelData, error: levelError } = await supabaseWrite
          .from('insecurity_level')
          .select('id, color_id, color_insecurity(hex_code)')
          .eq('id', insecurity_level_id)
          .single();

        if (levelError) {
          return NextResponse.json(
            { error: 'Error obteniendo nivel de seguridad', details: levelError.message },
            { status: 500 }
          );
        }

        tableName = 'geoplaces';
        insertData = {
          address: title,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          circle_radius: radiusMeters,
          insecurity_level_id: levelData.id,
          country_code: country_code,
          type: 'external'
        };
        break;

      case 'coworking':
        tableName = 'coworking_places';
        insertData = {
          title: title,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          country_code: country_code,
          type: 'external',
          description: '',  // Campos requeridos por la tabla
          link: ''
        };
        break;

      case 'instagramable':
        tableName = 'instagramable_places';
        insertData = {
          title: title,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          country_code: country_code,
          type: 'external',
          description: '',  // Campos requeridos por la tabla
          link: ''
        };
        break;
    }

    // Insertar en Supabase
    const { data, error } = await supabaseWrite
      .from(tableName)
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error(`Error insertando en ${tableName}:`, error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Si se proporcionó una nota, insertarla en la tabla notes
    let noteData = null;
    if (notes && notes.trim()) {
      const { data: createdNote, error: noteError } = await supabaseWrite
        .from('notes')
        .insert([{
          note_text: notes.trim(),
          related_type: type,
          related_id: data.id
        }])
        .select()
        .single();

      if (noteError) {
        console.error('Error insertando nota:', noteError);
        // No fallar el request completo, solo loguear el error
      } else {
        noteData = createdNote;
      }
    }

    const response = {
      success: true,
      message: `${type} creado exitosamente`,
      data: data,
      note: noteData
    };

    // Solo incluir radius info si es una zona
    if (type === 'zone' && radius_km && radiusMeters) {
      response.radius_km = radius_km;
      response.radius_meters = radiusMeters;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en API Bot:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET - Documentación de la API
export async function GET() {
  return NextResponse.json({
    name: 'API Bot',
    description: 'Endpoint para alimentar datos desde fuentes externas (Telegram, etc.)',
    endpoint: '/api/apibot',
    method: 'POST',
    parameters: {
      required: {
        type: {
          type: 'string',
          options: ['zone', 'coworking', 'instagramable'],
          description: 'Tipo de lugar a crear'
        },
        title: {
          type: 'string',
          description: 'Nombre/título del lugar'
        },
        lat: {
          type: 'number',
          description: 'Latitud'
        },
        lng: {
          type: 'number',
          description: 'Longitud'
        }
      },
      optional: {
        radius_km: {
          type: 'number',
          options: [0.5, 1, 2],
          description: 'Radio del círculo en kilómetros (REQUERIDO solo para type="zone")'
        },
        insecurity_level_id: {
          type: 'number',
          options: [0, 1, 2, 3, 4],
          default: 0,
          description: 'ID del nivel de seguridad (solo para type="zone")',
          levels: {
            0: { name: 'Seguro', color: '#00C853 🟢' },
            1: { name: 'Medio', color: '#2196F3 🔵' },
            2: { name: 'Regular', color: '#FF9800 🟠' },
            3: { name: 'Precaución', color: '#FFC107 🟡' },
            4: { name: 'Inseguro', color: '#F44336 🔴' }
          }
        },
        country_code: {
          type: 'string',
          default: 'MX',
          description: 'Código de país (AR, MX, BR, etc.)'
        },
        notes: {
          type: 'string',
          description: 'Nota adicional sobre el lugar (se guarda en tabla notes)'
        }
      }
    },
    examples: [
      {
        name: 'Crear zona segura con nota',
        request: {
          type: 'zone',
          title: 'Polanco CDMX',
          lat: 19.4326,
          lng: -99.1332,
          radius_km: 1,
          insecurity_level_id: 0,
          country_code: 'MX',
          notes: 'Zona residencial exclusiva con seguridad privada'
        }
      },
      {
        name: 'Crear zona insegura',
        request: {
          type: 'zone',
          title: 'Tepito CDMX',
          lat: 19.4489,
          lng: -99.1236,
          radius_km: 0.5,
          insecurity_level_id: 4,
          country_code: 'MX'
        }
      },
      {
        name: 'Crear coworking',
        request: {
          type: 'coworking',
          title: 'WeWork Reforma',
          lat: 19.4284,
          lng: -99.1678,
          country_code: 'MX'
        }
      },
      {
        name: 'Crear lugar instagramable',
        request: {
          type: 'instagramable',
          title: 'Ángel de la Independencia',
          lat: 19.4270,
          lng: -99.1677,
          country_code: 'MX'
        }
      }
    ]
  });
}
