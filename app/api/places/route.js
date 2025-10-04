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

// GET - Leer todos los lugares del usuario
export async function GET() {
  const { data, error } = await supabaseRead
    .from('geoplaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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
    color: body.color || '#22c55e',
    country_code: body.country_code || 'AR',
    is_turistic: body.is_turistic || false
  };

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
  if (body.color !== undefined) updateData.color = body.color;
  if (body.is_turistic !== undefined) updateData.is_turistic = body.is_turistic;
  if (body.circle_radius !== undefined) updateData.circle_radius = body.circle_radius;

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
