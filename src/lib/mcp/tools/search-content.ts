import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "search_content",
  title: "Search content",
  description: "Search published stories and courses on Dolphoon by title keyword.",
  inputSchema: {
    query: z.string().trim().min(1).describe("Keyword to search titles for."),
    limit: z.number().int().min(1).max(25).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    );
    const pattern = `%${query}%`;
    const [stories, courses] = await Promise.all([
      supabase
        .from("stories")
        .select("id, title, is_premium")
        .eq("is_published", true)
        .ilike("title", pattern)
        .limit(limit),
      supabase
        .from("courses")
        .select("id, title, is_premium")
        .eq("is_published", true)
        .ilike("title", pattern)
        .limit(limit),
    ]);
    const result = {
      stories: stories.data ?? [],
      courses: courses.data ?? [],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
