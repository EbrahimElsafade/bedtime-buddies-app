import { defineMcp } from "@lovable.dev/mcp-js";
import listStoriesTool from "./tools/list-stories";
import listCoursesTool from "./tools/list-courses";
import searchContentTool from "./tools/search-content";

export default defineMcp({
  name: "dolphoon-mcp",
  title: "Dolphoon",
  version: "0.1.0",
  instructions:
    "Browse Dolphoon's published stories, courses, and content library for kids. Use `list_stories` and `list_courses` to enumerate content, or `search_content` to search by title keyword.",
  tools: [listStoriesTool, listCoursesTool, searchContentTool],
});
