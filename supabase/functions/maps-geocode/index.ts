import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

interface GeocodedResult {
  formatted_address: string;
  lat: number;
  lng: number;
  address_components: AddressComponents;
  place_id: string;
}

function extractComponent(components: Array<{ types: string[]; long_name: string; short_name: string }>, type: string): string {
  const match = components.find((c) => c.types.includes(type));
  return match?.long_name ?? '';
}

function extractComponentShort(components: Array<{ types: string[]; long_name: string; short_name: string }>, type: string): string {
  const match = components.find((c) => c.types.includes(type));
  return match?.short_name ?? '';
}

function parseAddressComponents(components: Array<{ types: string[]; long_name: string; short_name: string }>): AddressComponents {
  const streetNumber = extractComponent(components, 'street_number');
  const route = extractComponent(components, 'route');
  const street = [streetNumber, route].filter(Boolean).join(' ');

  return {
    street,
    city: extractComponent(components, 'locality'),
    state: extractComponentShort(components, 'administrative_area_level_1'),
    postcode: extractComponent(components, 'postal_code'),
    country: extractComponentShort(components, 'country'),
  };
}

function buildGeocodedResult(
  formattedAddress: string,
  lat: number,
  lng: number,
  addressComponents: Array<{ types: string[]; long_name: string; short_name: string }>,
  placeId: string,
): GeocodedResult {
  return {
    formatted_address: formattedAddress,
    lat,
    lng,
    address_components: parseAddressComponents(addressComponents),
    place_id: placeId,
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid or expired authentication token' }, 401);
    }

    // 2. Parse request body
    const { org_id, address, lat, lng, place_id } = await req.json();

    // 3. Validate required fields
    if (!org_id) {
      return jsonResponse({ error: 'org_id is required' }, 400);
    }

    const hasAddress = typeof address === 'string' && address.trim().length > 0;
    const hasCoords = typeof lat === 'number' && typeof lng === 'number';
    const hasPlaceId = typeof place_id === 'string' && place_id.trim().length > 0;

    if (!hasAddress && !hasCoords && !hasPlaceId) {
      return jsonResponse({ error: 'At least one of address, lat+lng, or place_id is required' }, 400);
    }

    // 4. Read Google Maps API key from company_integrations
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: mapsConfig, error: configError } = await adminClient
      .from('company_integrations')
      .select('config')
      .eq('org_id', org_id)
      .eq('provider', 'google_maps')
      .eq('is_active', true)
      .single();

    if (configError || !mapsConfig?.config?.api_key) {
      return jsonResponse({ error: 'Google Maps not configured' }, 404);
    }

    const { api_key } = mapsConfig.config;

    // 5. Call the appropriate Google Maps API endpoint
    if (hasPlaceId) {
      // Place Details API
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&key=${api_key}&fields=formatted_address,geometry,address_components`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.result) {
        return jsonResponse({ error: 'No results found' }, 404);
      }

      const result = data.result;
      return jsonResponse(
        buildGeocodedResult(
          result.formatted_address,
          result.geometry.location.lat,
          result.geometry.location.lng,
          result.address_components || [],
          place_id,
        ),
        200,
      );
    }

    // Geocoding API (address or reverse geocode)
    let url: string;
    if (hasAddress) {
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${api_key}`;
    } else {
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${api_key}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return jsonResponse({ error: 'No results found' }, 404);
    }

    const result = data.results[0];
    return jsonResponse(
      buildGeocodedResult(
        result.formatted_address,
        result.geometry.location.lat,
        result.geometry.location.lng,
        result.address_components || [],
        result.place_id,
      ),
      200,
    );
  } catch (err) {
    console.error('maps-geocode error:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});
