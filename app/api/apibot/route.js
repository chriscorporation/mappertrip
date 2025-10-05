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
 * - type: 'zone' | 'airbnb' | 'coworking' | 'instagramable' (REQUIRED)
 * - title: string (REQUIRED) - Usado como nombre/título del lugar
 * - lat: number (REQUIRED) - Latitud
 * - lng: number (REQUIRED) - Longitud
 * - radius_km: 0.5 | 1 | 2 (REQUIRED) - Radio del círculo en kilómetros
 * - safety_level: 'seguro' | 'medio' | 'regular' | 'precaucion' | 'inseguro' (OPTIONAL - solo para type='zone')
 * - country_code: string (OPTIONAL - default: 'MX')
 *
 * Ejemplos:
 *
 * 1. Crear zona segura:
 * {
 *   "type": "zone",
 *   "title": "Polanco CDMX",
 *   "lat": 19.4326,
 *   "lng": -99.1332,
 *   "radius_km": 1,
 *   "safety_level": "seguro",
 *   "country_code": "MX"
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
    const { type, title, lat, lng, radius_km, safety_level, country_code = 'MX' } = body;

    // Validaciones básicas
    if (!type || !title || !lat || !lng || !radius_km) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: type, title, lat, lng, radius_km' },
        { status: 400 }
      );
    }

    // Validar type
    const validTypes = ['zone', 'airbnb', 'coworking', 'instagramable'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type inválido. Debe ser uno de: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar radius_km
    const validRadii = [0.5, 1, 2];
    if (!validRadii.includes(radius_km)) {
      return NextResponse.json(
        { error: `radius_km inválido. Debe ser uno de: ${validRadii.join(', ')}` },
        { status: 400 }
      );
    }

    // Convertir km a metros (Google Maps usa metros para el radio)
    const radiusMeters = radius_km * 1000;

    // Preparar datos según el tipo
    let tableName;
    let insertData;

    switch (type) {
      case 'zone':
        // Validar safety_level para zonas
        const validSafetyLevels = ['seguro', 'medio', 'regular', 'precaucion', 'inseguro'];
        if (safety_level && !validSafetyLevels.includes(safety_level)) {
          return NextResponse.json(
            { error: `safety_level inválido. Debe ser uno de: ${validSafetyLevels.join(', ')}` },
            { status: 400 }
          );
        }

        // Mapear safety_level a ID de nivel de inseguridad
        const safetyLevelMap = {
          'seguro': 0,
          'medio': 1,
          'regular': 2,
          'precaucion': 3,
          'inseguro': 4
        };

        // Obtener el color desde la base de datos
        const { data: levelData, error: levelError } = await supabaseWrite
          .from('insecurity_level')
          .select('id, color_id, color_insecurity(hex_code)')
          .eq('id', safetyLevelMap[safety_level] || 0)
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
          color: levelData.color_insecurity.hex_code, // Mantener por compatibilidad
          country_code: country_code,
          type: 'external',
          is_turistic: false
        };
        break;

      case 'airbnb':
        tableName = 'airbnb';
        insertData = {
          title: title,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          circle_radius: radiusMeters,
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
          circle_radius: radiusMeters,
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
          circle_radius: radiusMeters,
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

    return NextResponse.json({
      success: true,
      message: `${type} creado exitosamente`,
      data: data,
      radius_km: radius_km,
      radius_meters: radiusMeters
    });

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
          options: ['zone', 'airbnb', 'coworking', 'instagramable'],
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
        },
        radius_km: {
          type: 'number',
          options: [0.5, 1, 2],
          description: 'Radio del círculo en kilómetros'
        }
      },
      optional: {
        safety_level: {
          type: 'string',
          options: ['seguro', 'medio', 'regular', 'precaucion', 'inseguro'],
          description: 'Nivel de seguridad (solo para type="zone")',
          colors: {
            seguro: '#00C853 🟢 (verde)',
            medio: '#2196F3 🔵 (azul)',
            regular: '#FF9800 🟠 (naranja)',
            precaucion: '#FFC107 🟡 (amarillo)',
            inseguro: '#F44336 🔴 (rojo)'
          }
        },
        country_code: {
          type: 'string',
          default: 'MX',
          description: 'Código de país (AR, MX, BR, etc.)'
        }
      }
    },
    examples: [
      {
        name: 'Crear zona segura',
        request: {
          type: 'zone',
          title: 'Polanco CDMX',
          lat: 19.4326,
          lng: -99.1332,
          radius_km: 1,
          safety_level: 'seguro',
          country_code: 'MX'
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
          safety_level: 'inseguro',
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
          radius_km: 0.5,
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
          radius_km: 0.5,
          country_code: 'MX'
        }
      },
      {
        name: 'Crear Airbnb',
        request: {
          type: 'airbnb',
          title: 'Departamento Centro Histórico',
          lat: 19.4326,
          lng: -99.1332,
          radius_km: 0.5,
          country_code: 'MX'
        }
      }
    ]
  });
}
