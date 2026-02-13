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
    const { org_id, input, country_code = 'au' } = await req.json();

    // 3. Validate required fields
    if (!org_id) {
      return jsonResponse({ error: 'org_id is required' }, 400);
    }

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return jsonResponse({ error: 'input is required' }, 400);
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

    // 5. Call Google Places Autocomplete API
    const countryFilter = country_code ? `&components=country:${country_code}` : '';
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${api_key}&types=address${countryFilter}`;

    const response = await fetch(url);
    const data = await response.json();

    // 6. Return simplified suggestions
    const suggestions = (data.predictions || []).map((p: { description: string; place_id: string }) => ({
      description: p.description,
      place_id: p.place_id,
    }));

    return jsonResponse(suggestions, 200);
  } catch (err) {
    console.error('maps-autocomplete error:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});
