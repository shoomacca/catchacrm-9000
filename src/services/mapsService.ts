/**
 * Maps Service
 *
 * Frontend helpers for Google Maps operations. Calls the maps-geocode and
 * maps-autocomplete Edge Functions which read per-org Google Maps API keys
 * from the database at runtime.
 */

import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';

async function getAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in first.');
  }
  return session.access_token;
}

export interface GeocodedAddress {
  formatted_address: string;
  lat: number;
  lng: number;
  address_components: {
    street?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  place_id: string;
}

/**
 * Geocode an address string to coordinates and structured components.
 */
export async function geocodeAddress(
  orgId: string,
  address: string
): Promise<GeocodedAddress> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/maps-geocode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ org_id: orgId, address }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Geocoding failed: ${res.status}`);
  }

  return data;
}

/**
 * Reverse geocode coordinates to an address.
 */
export async function reverseGeocode(
  orgId: string,
  lat: number,
  lng: number
): Promise<GeocodedAddress> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/maps-geocode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ org_id: orgId, lat, lng }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Reverse geocoding failed: ${res.status}`);
  }

  return data;
}

/**
 * Get geocoded details for a specific place_id.
 */
export async function getPlaceDetails(
  orgId: string,
  placeId: string
): Promise<GeocodedAddress> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/maps-geocode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ org_id: orgId, place_id: placeId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Place details failed: ${res.status}`);
  }

  return data;
}

/**
 * Address autocomplete - returns suggestions as user types.
 */
export async function addressAutocomplete(
  orgId: string,
  input: string,
  countryCode?: string
): Promise<Array<{ description: string; place_id: string }>> {
  const token = await getAccessToken();

  const res = await fetch(`${SUPABASE_URL}/functions/v1/maps-autocomplete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      org_id: orgId,
      input,
      country_code: countryCode || 'au',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Don't throw for autocomplete - just return empty
    return [];
  }

  return data.suggestions || [];
}
