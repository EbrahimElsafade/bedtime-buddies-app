import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export default defineTool({
  name: "list_stories",
  title: "List stories",
  description: "List published stories on Dolphoon with title, category, and premium status.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Max stories to return."),
    category: z.string().optional().describe("Filter by category slug or name."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, category }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    );
    let query = supabase
      .from("stories")
      .select("id, title, category, is_premium, is_published")
      .eq("is_published", true)
      .limit(limit);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { stories: data },
    };
  },
});
