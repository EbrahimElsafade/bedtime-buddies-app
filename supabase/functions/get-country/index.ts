import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Try headers first
    const cfCountry = req.headers.get("cf-ipcountry");
    if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
      return new Response(
        JSON.stringify({ country_code: cfCountry, country_name: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const vercelCountry = req.headers.get("x-vercel-ip-country");
    if (vercelCountry) {
      return new Response(
        JSON.stringify({ country_code: vercelCountry, country_name: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get IP from x-forwarded-for or fall back to connecting IP
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : null;

    // 3. Call free ipapi.co API
    const apiUrl = ip ? `https://ipapi.co/${ip}/json/` : "https://ipapi.co/json/";
    const resp = await fetch(apiUrl, {
      headers: { "User-Agent": "supabase-edge-function" },
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("ipapi.co error:", resp.status, text);
      return new Response(
        JSON.stringify({ country_code: null, country_name: null, error: "Failed to detect country" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    return new Response(
      JSON.stringify({
        country_code: data.country_code || null,
        country_name: data.country_name || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-country error:", error);
    return new Response(
      JSON.stringify({ country_code: null, country_name: null, error: "Internal error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
