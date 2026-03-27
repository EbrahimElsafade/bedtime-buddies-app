import { useEffect, useState } from "react";

export interface CountryData {
  countryCode: string | null;
  countryName: string | null;
  loading: boolean;
  error: string | null;
}

export const useUserCountry = (): CountryData => {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let didCancel = false;

    const getCountry = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) {
          throw new Error(`ipapi.co fetch failed (${res.status})`);
        }

        const data = (await res.json()) as { country_code?: string; country_name?: string };

        if (!didCancel) {
          setCountryCode(data.country_code ?? null);
          setCountryName(data.country_name ?? null);
        }
      } catch (err) {
        if (!didCancel) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
          setCountryCode(null);
          setCountryName(null);
        }
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    getCountry();

    return () => {
      didCancel = true;
    };
  }, []);

  return {
    countryCode,
    countryName,
    loading,
    error,
  };
};
