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

    // Buscar todos los datos de perplexity para esta zona
    const { data, error } = await supabase
      .from('perplexity_notes')
      .select('*')
      .eq('zone_id', zone_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching perplexity notes:', error);
      return Response.json(
        { error: 'Error al obtener datos' },
        { status: 500 }
      );
    }

    // Si no hay datos, retornar objeto vacío
    if (!data || data.length === 0) {
      return Response.json({
        notes: null,
        rent: null,
        tourism: null,
        secure: null,
        places: null
      });
    }

    // Consolidar todos los registros en uno solo
    // Priorizar los valores más recientes (no-null) de cada campo
    const consolidated = {
      notes: null,
      rent: null,
      tourism: null,
      secure: null,
      places: null
    };

    for (const record of data) {
      if (record.notes && !consolidated.notes) consolidated.notes = record.notes;
      if (record.rent && !consolidated.rent) consolidated.rent = record.rent;
      if (record.tourism && !consolidated.tourism) consolidated.tourism = record.tourism;
      if (record.secure && !consolidated.secure) consolidated.secure = record.secure;
      if (record.places && !consolidated.places) consolidated.places = record.places;
    }

    return Response.json(consolidated);

  } catch (error) {
    console.error('Error en perplexity-notes:', error);
    return Response.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
