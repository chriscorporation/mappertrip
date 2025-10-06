import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { id, address, lat, lng, polygon, country_code, id_ref } = await request.json();

    // Validar que polygon esté presente
    if (!polygon) {
      return Response.json(
        { error: 'polygon es requerido' },
        { status: 400 }
      );
    }

    // Validar que polygon sea un array
    if (!Array.isArray(polygon) || polygon.length < 3) {
      return Response.json(
        { error: 'polygon debe ser un array con al menos 3 coordenadas' },
        { status: 400 }
      );
    }

    // Validar formato de coordenadas [lng, lat]
    const isValidPolygon = polygon.every(coord =>
      Array.isArray(coord) &&
      coord.length === 2 &&
      typeof coord[0] === 'number' &&
      typeof coord[1] === 'number'
    );

    if (!isValidPolygon) {
      return Response.json(
        { error: 'Formato de polygon inválido. Debe ser [[lng, lat], ...]' },
        { status: 400 }
      );
    }

    // Cerrar el polígono si no está cerrado (primera coord = última coord)
    const firstCoord = polygon[0];
    const lastCoord = polygon[polygon.length - 1];
    const isClosed = firstCoord[0] === lastCoord[0] && firstCoord[1] === lastCoord[1];

    const closedPolygon = isClosed ? polygon : [...polygon, firstCoord];

    // Si viene ID, actualizar polygon existente
    if (id) {
      const updateData = { polygon: closedPolygon };
      if (id_ref !== undefined) {
        updateData.id_ref = id_ref;
      }

      const { data, error } = await supabase
        .from('geoplaces')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando polygon:', error);
        return Response.json(
          { error: 'Error actualizando polygon', details: error.message },
          { status: 500 }
        );
      }

      return Response.json({
        success: true,
        data,
        message: 'Polygon actualizado exitosamente'
      });
    }

    // Si NO viene ID, crear nuevo geoplace
    // Validar campos requeridos para creación
    if (!address || !lat || !lng || !country_code) {
      return Response.json(
        {
          error: 'Para crear nuevo geoplace se requieren: address, lat, lng, country_code',
          required: ['address', 'lat', 'lng', 'polygon', 'country_code']
        },
        { status: 400 }
      );
    }

    // Insertar en Supabase
    const insertData = {
      address,
      lat,
      lng,
      polygon: closedPolygon,
      country_code
    };

    if (id_ref !== undefined) {
      insertData.id_ref = id_ref;
    }

    const { data, error } = await supabase
      .from('geoplaces')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error insertando geoplace:', error);
      return Response.json(
        { error: 'Error insertando en base de datos', details: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data,
      message: 'Geoplace creado exitosamente'
    });

  } catch (error) {
    console.error('Error en botpolygon:', error);
    return Response.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
