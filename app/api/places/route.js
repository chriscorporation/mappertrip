import { NextResponse } from 'next/server';
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

// GET - Leer todos los lugares del usuario con nivel de inseguridad y color
export async function GET() {
  const { data, error } = await supabaseRead
    .from('geoplaces')
    .select(`
      *,
      insecurity_level:insecurity_level_id (
        id,
        name,
        color_insecurity:color_id (
          id,
          name,
          hex_code
        )
      )
    `)
    .not('active', 'is', null)  // Solo traer registros con active != null
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Obtener todas las notas de zonas en una sola query
  const placeIds = data.map(place => place.id);
  const { data: notesData } = await supabaseRead
    .from('notes')
    .select('*')
    .eq('related_type', 'zone')
    .in('related_id', placeIds)
    .order('created_at', { ascending: true });

  // Agrupar notas por related_id
  const notesByPlaceId = (notesData || []).reduce((acc, note) => {
    if (!acc[note.related_id]) {
      acc[note.related_id] = [];
    }
    acc[note.related_id].push(note);
    return acc;
  }, {});

  // Normalizar datos para mantener compatibilidad con el frontend
  const normalizedData = data.map(place => ({
    ...place,
    // Añadir información adicional del nivel de seguridad
    safety_level: place.insecurity_level?.name,
    safety_level_id: place.insecurity_level?.id,
    // Incluir notas del lugar
    notes: notesByPlaceId[place.id] || [],
    // Asegurar que active esté presente
    active: place.active ?? null
  }));

  return NextResponse.json(normalizedData);
}

// POST - Crear un nuevo lugar
export async function POST(request) {
  const body = await request.json();

  // Insertar directamente sin verificar duplicados
  // La validación de duplicados se hace en el cliente
  const insertData = {
    address: body.address,
    lat: parseFloat(body.lat),
    lng: parseFloat(body.lng),
    place_id: body.placeId,
    polygon: body.polygon,
    country_code: body.country_code || 'AR',
    active: true  // Nuevas zonas activas por defecto
  };

  // Determinar insecurity_level_id
  if (body.insecurity_level_id !== undefined) {
    insertData.insecurity_level_id = body.insecurity_level_id;
  } else {
    // Default: seguro
    insertData.insecurity_level_id = 0;
  }

  // Agregar circle_radius solo si está definido
  if (body.circle_radius !== undefined) {
    insertData.circle_radius = body.circle_radius;
  }

  const { data, error } = await supabaseWrite
    .from('geoplaces')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT - Actualizar un lugar existente
export async function PUT(request) {
  const body = await request.json();

  // Construir objeto de actualización solo con campos definidos
  const updateData = {};

  if (body.address !== undefined) updateData.address = body.address;
  if (body.lat !== undefined) updateData.lat = parseFloat(body.lat);
  if (body.lng !== undefined) updateData.lng = parseFloat(body.lng);
  if (body.placeId !== undefined) updateData.place_id = body.placeId;
  if (body.polygon !== undefined) updateData.polygon = body.polygon;
  if (body.circle_radius !== undefined) updateData.circle_radius = body.circle_radius;

  // Manejar insecurity_level_id
  if (body.insecurity_level_id !== undefined) {
    updateData.insecurity_level_id = body.insecurity_level_id;
  }

  const { data, error } = await supabaseWrite
    .from('geoplaces')
    .update(updateData)
    .eq('id', body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Eliminar un lugar
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabaseWrite
    .from('geoplaces')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
