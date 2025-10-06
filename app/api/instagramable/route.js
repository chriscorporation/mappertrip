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
  try {
    const { data, error } = await supabaseRead
      .from('instagramable_places')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Obtener todas las notas de instagramable places en una sola query
    const placeIds = data.map(place => place.id);
    const { data: notesData } = await supabaseRead
      .from('notes')
      .select('*')
      .eq('related_type', 'instagramable')
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

    // Incluir notas en cada lugar
    const placesWithNotes = data.map(place => ({
      ...place,
      notes: notesByPlaceId[place.id] || []
    }));

    return Response.json(placesWithNotes || []);
  } catch (error) {
    console.error('Error fetching instagramable places:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, link, lat, lng, place_id, country_code } = body;

    const { data, error } = await supabaseWrite
      .from('instagramable_places')
      .insert([
        {
          title,
          description,
          link,
          lat,
          lng,
          place_id,
          country_code,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error creating instagramable place:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabaseWrite
      .from('instagramable_places')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting instagramable place:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
