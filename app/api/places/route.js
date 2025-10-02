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

  // Primero verificar si ya existe
  const { data: existing } = await supabaseRead
    .from('geoplaces')
    .select('id')
    .eq('address', body.address)
    .single();

  if (existing) {
    // Si ya existe, hacer un update en lugar de insert
    const { data, error } = await supabaseWrite
      .from('geoplaces')
      .update({
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        place_id: body.placeId,
        polygon: body.polygon,
        color: body.color || '#22c55e',
        country_code: body.country_code || 'AR',
        is_turistic: body.is_turistic || false
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  // Si no existe, hacer insert normal
  const { data, error } = await supabaseWrite
    .from('geoplaces')
    .insert([{
      address: body.address,
      lat: parseFloat(body.lat),
      lng: parseFloat(body.lng),
      place_id: body.placeId,
      polygon: body.polygon,
      color: body.color || '#22c55e',
      country_code: body.country_code || 'AR',
      is_turistic: body.is_turistic || false
    }])
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

  const { data, error } = await supabaseWrite
    .from('geoplaces')
    .update({
      address: body.address,
      lat: parseFloat(body.lat),
      lng: parseFloat(body.lng),
      place_id: body.placeId,
      polygon: body.polygon,
      color: body.color,
      is_turistic: body.is_turistic
    })
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
