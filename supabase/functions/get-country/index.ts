import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface CountryResponse {
  country_code: string;
  country_name: string;
}

interface IpApiResponse {
  country_code: string;
  country_name: string;
}

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FALLBACK: CountryResponse = {
  country_code: "UNKNOWN",
  country_name: "Unknown",
};

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  EG: "Egypt",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
  FR: "France",
  DE: "Germany",
  IN: "India",
  BR: "Brazil",
  CA: "Canada",
  AU: "Australia",
  JP: "Japan",
  KW: "Kuwait",
  QA: "Qatar",
  BH: "Bahrain",
  OM: "Oman",
  JO: "Jordan",
  LB: "Lebanon",
  IQ: "Iraq",
  SY: "Syria",
  PS: "Palestine",
  LY: "Libya",
  TN: "Tunisia",
  DZ: "Algeria",
  MA: "Morocco",
  SD: "Sudan",
  YE: "Yemen",
};

function jsonResponse(data: CountryResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchCountryFromApi(): Promise<CountryResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
    });

    if (!res.ok) {
      return FALLBACK;
    }

    const raw: unknown = await res.json();

    if (
      typeof raw === "object" &&
      raw !== null &&
      "country_code" in raw &&
      "country_name" in raw
    ) {
      const typed = raw as IpApiResponse;
      return {
        country_code: String(typed.country_code),
        country_name: String(typed.country_name),
      };
    }

    return FALLBACK;
  } catch {
    return FALLBACK;
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Priority 1: Cloudflare header
    const cfCountry = req.headers.get("cf-ipcountry");
    if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
      const code = cfCountry.toUpperCase();
      return jsonResponse({
        country_code: code,
        country_name: COUNTRY_NAMES[code] ?? code,
      });
    }

    // Priority 2: Vercel header
    const vercelCountry = req.headers.get("x-vercel-ip-country");
    if (vercelCountry) {
      const code = vercelCountry.toUpperCase();
      return jsonResponse({
        country_code: code,
        country_name: COUNTRY_NAMES[code] ?? code,
      });
    }

    // Priority 3: Fallback API
    const result = await fetchCountryFromApi();
    return jsonResponse(result);
  } catch {
    return jsonResponse(FALLBACK, 500);
  }
});
