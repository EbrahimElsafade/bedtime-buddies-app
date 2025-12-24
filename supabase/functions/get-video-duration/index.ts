import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GetDurationRequest {
  fileId: string;
  lessonId?: string; // If provided, will update the lesson directly
  courseId?: string; // Required if lessonId is provided
}

// Parse Google Service Account key from environment
function getServiceAccountCredentials() {
  const keyJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
  if (!keyJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not configured");
  }
  
  try {
    return JSON.parse(keyJson);
  } catch {
    throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY format");
  }
}

// Generate JWT for Google API authentication
async function generateGoogleJWT(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const privateKeyPem = credentials.private_key;
  const pemContents = privateKeyPem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  
  return `${signatureInput}.${signatureB64}`;
}

// Exchange JWT for access token
async function getAccessToken(credentials: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const jwt = await generateGoogleJWT(credentials);
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Token exchange error:", error);
    throw new Error(`Failed to get access token: ${response.status}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

// Fetch video duration from Google Drive API
async function getVideoDuration(fileId: string, accessToken: string): Promise<number> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=videoMediaMetadata,mimeType,name`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Drive API error:", error);
    
    if (response.status === 404) {
      throw new Error("Video file not found or not accessible");
    }
    throw new Error(`Failed to fetch file metadata: ${response.status}`);
  }
  
  const data = await response.json();
  console.log("File metadata:", JSON.stringify(data));
  
  // Check if it's a video file
  if (!data.mimeType?.startsWith("video/")) {
    throw new Error(`File is not a video (type: ${data.mimeType})`);
  }
  
  // Get duration from videoMediaMetadata
  if (!data.videoMediaMetadata?.durationMillis) {
    throw new Error("Video duration metadata not available. The file may still be processing.");
  }
  
  // Convert milliseconds to seconds
  const durationSeconds = Math.floor(parseInt(data.videoMediaMetadata.durationMillis) / 1000);
  console.log(`Video duration: ${durationSeconds} seconds`);
  
  return durationSeconds;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requesting user has editor/admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create regular client to verify the user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has editor or admin role
    const { data: hasRole, error: roleError } = await supabaseAdmin.rpc("has_any_role", {
      _user_id: user.id,
      _roles: ["editor", "admin"],
    });

    if (roleError || !hasRole) {
      return new Response(
        JSON.stringify({ error: "Editor or admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: GetDurationRequest = await req.json();
    const { fileId, lessonId, courseId } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "fileId is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Fetching duration for Google Drive file: ${fileId}`);

    // Get service account credentials and access token
    const credentials = getServiceAccountCredentials();
    const accessToken = await getAccessToken(credentials);
    
    // Fetch video duration from Google Drive
    const duration = await getVideoDuration(fileId, accessToken);

    // If lessonId is provided, update the lesson directly
    if (lessonId && courseId) {
      console.log(`Updating lesson ${lessonId} with duration ${duration}`);
      
      const { error: updateError } = await supabaseAdmin
        .from("course_lessons")
        .update({ duration })
        .eq("id", lessonId);

      if (updateError) {
        console.error("Failed to update lesson duration:", updateError);
        // Don't fail - still return the duration
      } else {
        console.log("Lesson duration updated successfully");
        
        // The course total_duration will be auto-updated by the database trigger
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        duration,
        message: lessonId ? "Duration fetched and saved" : "Duration fetched"
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error("Get video duration error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to get video duration" 
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
