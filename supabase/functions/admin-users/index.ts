import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

// Allowed origins for CORS
const allowedOrigins = [
  'https://dolphoon.com',
  'https://www.dolphoon.com',
  'https://brxbtgzaumryxflkykpp.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://lovable.dev',
];

const getCorsHeaders = (origin: string | null) => {
  // Allow Lovable preview domains (pattern: *.lovable.app)
  const isLovableOrigin = origin && (
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com') ||
    allowedOrigins.includes(origin)
  );
  
  const allowedOrigin = isLovableOrigin ? origin : allowedOrigins[0];
  
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

      console.log("Creating user with email:", email);

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
          JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (!newUser.user) {
        console.error("User created but no user object returned");
        return new Response(
          JSON.stringify({ error: "User creation failed unexpectedly" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("User created in auth:", newUser.user.id);

      // Create profile for the user
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: newUser.user.id,
          parent_name: parentName,
          child_name: childName || null,
          preferred_language: preferredLanguage || "ar-fos7a",
          is_premium: false,
          total_points: 0,
          unlocked_milestones: [],
        });

      if (profileError) {
        console.error("Create profile error:", profileError);
        // If profile creation fails, we should delete the auth user to maintain consistency
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return new Response(
          JSON.stringify({ error: `Failed to create user profile: ${profileError.message}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("Profile created for user:", newUser.user.id);

      // Assign role if specified
      if (role && role !== "user") {
        const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
          user_id: newUser.user.id,
          role: role,
        });
        
        if (roleError) {
          console.error("Assign role error (non-fatal):", roleError);
        } else {
          console.log("Role assigned:", role);
        }
      }

      console.log("User creation complete:", newUser.user.id);
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

      console.log("Delete request for user:", userId);

      // Prevent self-deletion
      if (userId === user.id) {
        console.log("Attempted self-deletion blocked");
        return new Response(
          JSON.stringify({ error: "Cannot delete your own account" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // First, delete related data that might block the deletion
      // Delete user roles
      const { error: rolesDeleteError } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      
      if (rolesDeleteError) {
        console.log("Roles deletion error (non-fatal):", rolesDeleteError);
      }

      // Delete user favorites
      const { error: favoritesDeleteError } = await supabaseAdmin
        .from("user_favorites")
        .delete()
        .eq("user_id", userId);
      
      if (favoritesDeleteError) {
        console.log("Favorites deletion error (non-fatal):", favoritesDeleteError);
      }

      // Delete course favorites
      const { error: courseFavoritesDeleteError } = await supabaseAdmin
        .from("course_favorites")
        .delete()
        .eq("user_id", userId);
      
      if (courseFavoritesDeleteError) {
        console.log("Course favorites deletion error (non-fatal):", courseFavoritesDeleteError);
      }

      // Delete user section progress
      const { error: progressDeleteError } = await supabaseAdmin
        .from("user_section_progress")
        .delete()
        .eq("user_id", userId);
      
      if (progressDeleteError) {
        console.log("Progress deletion error (non-fatal):", progressDeleteError);
      }

      // Delete user finished content
      const { error: finishedDeleteError } = await supabaseAdmin
        .from("user_finished_content")
        .delete()
        .eq("user_id", userId);
      
      if (finishedDeleteError) {
        console.log("Finished content deletion error (non-fatal):", finishedDeleteError);
      }

      // Delete profile
      const { error: profileDeleteError } = await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", userId);
      
      if (profileDeleteError) {
        console.log("Profile deletion error (non-fatal):", profileDeleteError);
      }

      // Delete user from auth
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Delete user auth error:", deleteError);
        console.error("Error details:", JSON.stringify(deleteError, null, 2));
        return new Response(
          JSON.stringify({ error: `Failed to delete user: ${deleteError.message || 'Unknown error'}` }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      console.log("User deleted successfully:", userId);
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
