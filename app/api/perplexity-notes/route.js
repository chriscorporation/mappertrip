import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const zone_id = searchParams.get('zone_id');

    if (!zone_id) {
      return Response.json(
        { error: 'zone_id es requerido' },
        { status: 400 }
      );
    }

    // Buscar datos de perplexity para esta zona
    const { data, error } = await supabase
      .from('perplexity_notes')
      .select('*')
      .eq('zone_id', zone_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es válido
      console.error('Error fetching perplexity notes:', error);
      return Response.json(
        { error: 'Error al obtener datos' },
        { status: 500 }
      );
    }

    // Si no hay datos, retornar objeto vacío
    if (!data) {
      return Response.json({
        notes: null,
        rent: null,
        tourism: null,
        secure: null,
        places: null
      });
    }

    return Response.json(data);

  } catch (error) {
    console.error('Error en perplexity-notes:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
