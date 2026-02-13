import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { addressAutocomplete, getPlaceDetails } from '../services/mapsService';
import { getCurrentOrgId } from '../services/supabaseData';

interface AddressDetails {
  formatted_address: string;
  lat: number;
  lng: number;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  place_id?: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, details?: AddressDetails) => void;
  placeholder?: string;
  countryCode?: string;
  disabled?: boolean;
  className?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Start typing an address...',
  countryCode = 'au',
  disabled = false,
  className = '',
}) => {
  const { companyIntegrations, settings } = useCRM();
  const [suggestions, setSuggestions] = useState<Array<{ description: string; place_id: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDarkMode = settings.branding?.theme === 'dark';

  // Check if Google Maps is configured
  const mapsConfigured = companyIntegrations.some(
    i => i.provider === 'google_maps' && i.is_active
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (!mapsConfigured || input.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const orgId = await getCurrentOrgId();
      const results = await addressAutocomplete(orgId, input, countryCode);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [mapsConfigured, countryCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val); // Pass raw text back

    // Debounce autocomplete
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = async (suggestion: { description: string; place_id: string }) => {
    setSelecting(true);
    setShowDropdown(false);
    setSuggestions([]);

    try {
      const orgId = await getCurrentOrgId();
      const details = await getPlaceDetails(orgId, suggestion.place_id);

      onChange(details.formatted_address, {
        formatted_address: details.formatted_address,
        lat: details.lat,
        lng: details.lng,
        street: details.address_components?.street,
        city: details.address_components?.city,
        state: details.address_components?.state,
        postcode: details.address_components?.postcode,
        country: details.address_components?.country,
        place_id: details.place_id,
      });
    } catch {
      // If place details fail, just use the description
      onChange(suggestion.description);
    } finally {
      setSelecting(false);
    }
  };

  const inputClasses = className || `w-full px-4 py-3 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
    isDarkMode
      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
      : 'bg-slate-50 border-slate-100 text-slate-900 placeholder-slate-400'
  }`;

  // If Maps is not configured, render plain text input
  if (!mapsConfigured) {
    return (
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
      />
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          disabled={disabled || selecting}
          className={`${inputClasses} pl-9`}
        />
        {(loading || selecting) && (
          <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 rounded-xl border shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
        }`}>
          {suggestions.map((s, i) => (
            <button
              key={s.place_id || i}
              type="button"
              onClick={() => handleSelect(s)}
              className={`w-full text-left px-4 py-3 text-xs font-medium flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'text-slate-200 hover:bg-slate-600'
                  : 'text-slate-700 hover:bg-blue-50'
              } ${i > 0 ? (isDarkMode ? 'border-t border-slate-600' : 'border-t border-slate-100') : ''}`}
            >
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span className="truncate">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
