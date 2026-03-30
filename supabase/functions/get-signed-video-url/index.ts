import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoPath } = await req.json();

    if (!videoPath || typeof videoPath !== "string") {
      return new Response(
        JSON.stringify({ error: "videoPath is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If it's already a full URL, just return it
    if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
      return new Response(
        JSON.stringify({ signedUrl: videoPath }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let hasPremium = false;

    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this video belongs to a free story section
    const { data: storySection } = await adminClient
      .from("story_sections")
      .select("story_id, stories!fk_story_sections_story_id(is_free, is_published)")
      .eq("video", videoPath)
      .maybeSingle();

    if (storySection) {
      const story = (storySection as any).stories;
      if (story?.is_published) {
        if (story.is_free) {
          // Free published story - allow access
        } else if (userId) {
          // Check premium access
          const { data: premium } = await adminClient.rpc("has_premium_access", { _user_id: userId });
          if (!premium) {
            return new Response(
              JSON.stringify({ error: "Premium access required" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // Unpublished - only editors/admins
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: isEditor } = await adminClient.rpc("has_any_role", {
          _user_id: userId,
          _roles: ["editor", "admin"],
        });
        if (!isEditor) {
          return new Response(
            JSON.stringify({ error: "Access denied" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    } else {
      // Check if it belongs to a course lesson
      const { data: lesson } = await adminClient
        .from("course_lessons")
        .select("is_free, course_id, courses!course_lessons_course_id_fkey(is_published, is_free)")
        .eq("video_path", videoPath)
        .maybeSingle();

      if (lesson) {
        const course = (lesson as any).courses;
        if (course?.is_published) {
          if (lesson.is_free || course.is_free) {
            // Free content - allow
          } else if (userId) {
            const { data: premium } = await adminClient.rpc("has_premium_access", { _user_id: userId });
            if (!premium) {
              return new Response(
                JSON.stringify({ error: "Premium access required" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          } else {
            return new Response(
              JSON.stringify({ error: "Authentication required" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          // Unpublished course - editors/admins only
          if (!userId) {
            return new Response(
              JSON.stringify({ error: "Authentication required" }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          const { data: isEditor } = await adminClient.rpc("has_any_role", {
            _user_id: userId,
            _roles: ["editor", "admin"],
          });
          if (!isEditor) {
            return new Response(
              JSON.stringify({ error: "Access denied" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } else {
        // Video path not found in any table - check if user is editor/admin
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "Authentication required" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        const { data: isEditor } = await adminClient.rpc("has_any_role", {
          _user_id: userId,
          _roles: ["editor", "admin"],
        });
        if (!isEditor) {
          return new Response(
            JSON.stringify({ error: "Access denied" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Generate a signed URL valid for 1 hour
    const { data: signedUrlData, error: signError } = await adminClient.storage
      .from("course-videos")
      .createSignedUrl(videoPath, 3600);

    if (signError || !signedUrlData?.signedUrl) {
      console.error("Signed URL error:", signError);
      return new Response(
        JSON.stringify({ error: "Failed to generate video URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: signedUrlData.signedUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
