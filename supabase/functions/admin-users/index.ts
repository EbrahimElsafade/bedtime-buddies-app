import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

// Allowed origins for CORS
const allowedOrigins = [
  'https://dolphoon.com',
  'https://www.dolphoon.com',
  'https://brxbtgzaumryxflkykpp.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080',
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

interface CreateUserRequest {
  action: "create";
  email: string;
  password: string;
  parentName: string;
  childName?: string;
  preferredLanguage?: string;
  role?: "user" | "editor" | "admin";
}

interface UpdateUserRequest {
  action: "update";
  userId: string;
  parentName?: string;
  childName?: string;
  preferredLanguage?: string;
  isPremium?: boolean;
  subscriptionTier?: string;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
}

interface ChangePasswordRequest {
  action: "changePassword";
  userId: string;
  newPassword: string;
}

interface DeleteUserRequest {
  action: "delete";
  userId: string;
}

type AdminUserRequest = CreateUserRequest | UpdateUserRequest | DeleteUserRequest | ChangePasswordRequest;

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
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
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: AdminUserRequest = await req.json();

    if (body.action === "create") {
      const { email, password, parentName, childName, preferredLanguage, role } = body;

      // Create user in auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          parent_name: parentName,
          child_name: childName,
          preferred_language: preferredLanguage || "ar-fos7a",
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user. Please check the provided information." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Assign role if specified
      if (role && role !== "user" && newUser.user) {
        await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role: role,
        });
      }

      return new Response(
        JSON.stringify({ success: true, user: newUser.user }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (body.action === "update") {
      const { userId, parentName, childName, preferredLanguage, isPremium, subscriptionTier, subscriptionStart, subscriptionEnd } = body;

      const updates: Record<string, unknown> = {};
      if (parentName !== undefined) updates.parent_name = parentName;
      if (childName !== undefined) updates.child_name = childName;
      if (preferredLanguage !== undefined) updates.preferred_language = preferredLanguage;
      if (isPremium !== undefined) updates.is_premium = isPremium;
      if (subscriptionTier !== undefined) updates.subscription_tier = subscriptionTier;
      if (subscriptionStart !== undefined) updates.subscription_start = subscriptionStart;
      if (subscriptionEnd !== undefined) updates.subscription_end = subscriptionEnd;

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateError) {
        console.error("Update user error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update user profile." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (body.action === "changePassword") {
      const { userId, newPassword } = body;

      if (!newPassword || newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (passwordError) {
        console.error("Change password error:", passwordError);
        return new Response(
          JSON.stringify({ error: "Failed to update password." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (body.action === "delete") {
      const { userId } = body;

      // Prevent self-deletion
      if (userId === user.id) {
        return new Response(
          JSON.stringify({ error: "Cannot delete your own account" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Delete user from auth (this will cascade to profiles due to FK)
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Delete user error:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete user." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Admin users error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req.headers.get("origin")) } }
    );
  }
};

serve(handler);
