import { defineTool } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

declare const process: { env: Record<string, string | undefined> };

export default defineTool({
  name: "list_courses",
  title: "List courses",
  description: "List published courses on Dolphoon with title, instructor, and free/premium status.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Max courses to return."),
    language: z.enum(["en", "ar", "fr"]).default("en").describe("Language for title/description."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, language }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase
      .from("courses")
      .select(
        `id, title_${language}, description_${language}, instructor_name_${language}, is_free, min_age, max_age`,
      )
      .eq("is_published", true)
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { courses: data },
    };
  },
});
