import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseRead = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET - Obtener todos los niveles de inseguridad con sus colores
export async function GET() {
  const { data, error } = await supabaseRead
    .from('insecurity_level')
    .select(`
      id,
      name,
      color_insecurity:color_id (
        id,
        name,
        hex_code,
        gradient_from,
        gradient_to
      )
    `)
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalizar datos para el frontend
  const normalizedData = data.map(level => ({
    id: level.id,
    name: level.name,
    color: level.color_insecurity.hex_code,
    color_name: level.color_insecurity.name,
    gradient_from: level.color_insecurity.gradient_from,
    gradient_to: level.color_insecurity.gradient_to
  }));

  return NextResponse.json(normalizedData);
}
