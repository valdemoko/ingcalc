import type { CategoryKey, ToolDefinition } from "@/lib/types";

export interface SearchItem {
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  path: string;
}

export function toSearchItems(tools: readonly ToolDefinition[]): SearchItem[] {
  return tools.map((tool) => ({
    slug: tool.slug,
    name: tool.name,
    description: `${tool.summary} ${tool.description}`,
    category: tool.category,
    path: `/tools/${tool.category}/${tool.slug}`,
  }));
}
