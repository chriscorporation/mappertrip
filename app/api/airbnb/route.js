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

export async function GET() {
  const { data, error } = await supabaseRead
    .from('airbnb')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Obtener todas las notas de airbnbs en una sola query
  const airbnbIds = data.map(airbnb => airbnb.id);
  const { data: notesData } = await supabaseRead
    .from('notes')
    .select('*')
    .eq('related_type', 'airbnb')
    .in('related_id', airbnbIds)
    .order('created_at', { ascending: true });

  // Agrupar notas por related_id
  const notesByAirbnbId = (notesData || []).reduce((acc, note) => {
    if (!acc[note.related_id]) {
      acc[note.related_id] = [];
    }
    acc[note.related_id].push(note);
    return acc;
  }, {});

  // Incluir notas en cada airbnb
  const airbnbsWithNotes = data.map(airbnb => ({
    ...airbnb,
    notes: notesByAirbnbId[airbnb.id] || []
  }));

  return NextResponse.json(airbnbsWithNotes);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabaseWrite
    .from('airbnb')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
