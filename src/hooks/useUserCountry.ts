import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CountryResponse {
  country_code: string;
  country_name: string;
}

export interface UseUserCountryReturn {
  countryCode: string | null;
  countryName: string | null;
  loading: boolean;
  error: string | null;
}

function isCountryResponse(data: unknown): data is CountryResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'country_code' in data &&
    'country_name' in data &&
    typeof (data as CountryResponse).country_code === 'string' &&
    typeof (data as CountryResponse).country_name === 'string'
  );
}

export const useUserCountry = (): UseUserCountryReturn => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountry = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fnError } = await supabase.functions.invoke<CountryResponse>('get-country');

      if (fnError) {
        throw new Error(fnError.message ?? 'Failed to fetch country');
      }

      if (isCountryResponse(data)) {
        setCountryCode(data.country_code);
        setCountryName(data.country_name);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setCountryCode('UNKNOWN');
      setCountryName('Unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountry();
  }, [fetchCountry]);

  return { countryCode, countryName, loading, error };
};
