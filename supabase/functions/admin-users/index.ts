import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  action: "create" | "update" | "delete" | "changePassword";
  email?: string;
  password?: string;
  parentName?: string;
  childName?: string;
  preferredLanguage?: string;
  role?: "user" | "editor" | "admin";
  userId?: string;
  isPremium?: boolean;
  subscriptionTier?: string | null;
  subscriptionStart?: string | null;
  subscriptionEnd?: string | null;
  newPassword?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Admin client for privileged operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify caller is authenticated and is admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    console.log("Action:", body.action);

    // CREATE USER
    if (body.action === "create") {
      const { email, password, parentName, childName, preferredLanguage, role } = body;

      if (!email || !password || !parentName) {
        return new Response(
          JSON.stringify({ error: "Email, password, and parent name are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create auth user
      const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          parent_name: parentName,
          child_name: childName || null,
          preferred_language: preferredLanguage || "ar-fos7a",
        },
      });

      if (createError) {
        console.error("Create auth user error:", createError);
        const msg = createError.message?.toLowerCase() || "";
        if (msg.includes("already") || msg.includes("duplicate") || msg.includes("registered")) {
          return new Response(
            JSON.stringify({ error: "This email is already registered" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const newUserId = authData.user!.id;
      console.log("Auth user created:", newUserId);

      // Upsert profile (trigger may have already created it)
      const { error: profileError } = await adminClient.from("profiles").upsert({
        id: newUserId,
        parent_name: parentName,
        child_name: childName || null,
        preferred_language: preferredLanguage || "ar-fos7a",
        is_premium: false,
        total_points: 0,
        unlocked_milestones: [],
      }, { onConflict: "id" });

      if (profileError) {
        console.error("Upsert profile error:", profileError);
        // Rollback: delete auth user
        await adminClient.auth.admin.deleteUser(newUserId);
        return new Response(
          JSON.stringify({ error: "Failed to create user profile" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Profile created:", newUserId);

      // Assign role if not default user
      if (role && role !== "user") {
        const { error: roleError } = await adminClient.from("user_roles").insert({
          user_id: newUserId,
          role: role,
        });
        if (roleError) {
          console.error("Assign role error:", roleError);
        } else {
          console.log("Role assigned:", role);
        }
      }

      return new Response(
        JSON.stringify({ success: true, userId: newUserId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // UPDATE USER
    if (body.action === "update") {
      const { userId, parentName, childName, preferredLanguage, isPremium, subscriptionTier, subscriptionStart, subscriptionEnd } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updates: Record<string, unknown> = {};
      if (parentName !== undefined) updates.parent_name = parentName;
      if (childName !== undefined) updates.child_name = childName || null;
      if (preferredLanguage !== undefined) updates.preferred_language = preferredLanguage;
      if (isPremium !== undefined) updates.is_premium = isPremium;
      if (subscriptionTier !== undefined) updates.subscription_tier = subscriptionTier;
      if (subscriptionStart !== undefined) updates.subscription_start = subscriptionStart;
      if (subscriptionEnd !== undefined) updates.subscription_end = subscriptionEnd;

      const { error: updateError } = await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateError) {
        console.error("Update profile error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User updated:", userId);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CHANGE PASSWORD
    if (body.action === "changePassword") {
      const { userId, newPassword } = body;

      if (!userId || !newPassword) {
        return new Response(
          JSON.stringify({ error: "User ID and new password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (newPassword.length < 8) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 8 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (passwordError) {
        console.error("Change password error:", passwordError);
        return new Response(
          JSON.stringify({ error: "Failed to change password" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Password changed for:", userId);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DELETE USER
    if (body.action === "delete") {
      const { userId } = body;

      if (!userId) {
        return new Response(
          JSON.stringify({ error: "User ID is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Prevent self-deletion
      if (userId === user.id) {
        return new Response(
          JSON.stringify({ error: "Cannot delete your own account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Deleting user:", userId);

      // Delete related data first (cascade manually for tables without FK cascade)
      await adminClient.from("user_roles").delete().eq("user_id", userId);
      await adminClient.from("user_favorites").delete().eq("user_id", userId);
      await adminClient.from("course_favorites").delete().eq("user_id", userId);
      await adminClient.from("user_section_progress").delete().eq("user_id", userId);
      await adminClient.from("user_finished_content").delete().eq("user_id", userId);
      await adminClient.from("profiles").delete().eq("id", userId);

      // Delete from auth
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error("Delete auth user error:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete user" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("User deleted:", userId);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
