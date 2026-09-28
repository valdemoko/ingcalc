import type { CategoryKey, ToolDefinition } from "@/lib/types";

/** Plain, serializable search item — safe to pass to Client Components. */
export interface SearchItem {
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  /** Canonical path, e.g. /tools/electrical/voltage-drop-calculator */
  path: string;
}

/**
 * Build the serializable list from tool definitions.
 * Lives in lib/ (server-safe): ToolDefinition contains a `calc` function,
 * which cannot cross the server→client boundary — this strips it out.
 */
export function toSearchItems(
  tools: readonly ToolDefinition[],
): SearchItem[] {
  return tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    description: t.description,
    category: t.category,
    path: `/tools/${t.category}/${t.slug}`,
  }));
}
