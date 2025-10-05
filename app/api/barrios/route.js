import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countrySlug = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!countrySlug) {
      return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
    }

    // Get country info
    const { data: countries } = await supabase
      .from('countries')
      .select('name, country_code');

    const country = countries?.find(c => {
      const slug = c.name.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');
      return slug === countrySlug;
    });

    if (!country) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    // Get total count of zones for this country
    const { count } = await supabase
      .from('geoplaces')
      .select('*', { count: 'exact', head: true })
      .eq('country_code', country.country_code);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(count / limit);

    // Get paginated zones for this country
    const { data: places } = await supabase
      .from('geoplaces')
      .select('id, address, lat, lng, country_code, orientation')
      .eq('country_code', country.country_code)
      .range(offset, offset + limit - 1);

    // Get perplexity notes for each zone
    const zonesWithNotes = await Promise.all(
      (places || []).map(async (zone) => {
        const { data: notesData } = await supabase
          .from('perplexity_notes')
          .select('*')
          .eq('zone_id', zone.id)
          .single();

        return { ...zone, perplexityNotes: notesData };
      })
    );

    return NextResponse.json({
      country,
      zones: zonesWithNotes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching barrios:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
