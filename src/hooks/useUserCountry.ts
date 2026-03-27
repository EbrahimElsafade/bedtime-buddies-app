import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserCountry {
  countryCode: string | null;
  countryName: string | null;
  loading: boolean;
  error: string | null;
}

export const useUserCountry = (): UserCountry => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-country");

        if (cancelled) return;

        if (fnError) {
          setError(fnError.message);
        } else if (data) {
          setCountryCode(data.country_code ?? null);
          setCountryName(data.country_name ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to detect country");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    detect();
    return () => { cancelled = true; };
  }, []);

  return { countryCode, countryName, loading, error };
};
