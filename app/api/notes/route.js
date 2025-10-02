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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const relatedType = searchParams.get('related_type');
  const relatedId = searchParams.get('related_id');

  const { data, error } = await supabaseRead
    .from('notes')
    .select('*')
    .eq('related_type', relatedType)
    .eq('related_id', relatedId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request) {
  const body = await request.json();

  const { data, error } = await supabaseWrite
    .from('notes')
    .insert([{
      note_text: body.note_text,
      related_type: body.related_type,
      related_id: body.related_id
    }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data[0]);
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { error } = await supabaseWrite
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
