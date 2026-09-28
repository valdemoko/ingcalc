import Link from "next/link";
import { getCategory } from "@/lib/categories";
import { toolPath } from "@/data/tools";
import type { ToolDefinition } from "@/lib/types";

/**
 * Tool card for directory/category pages — the formula chip makes each card
 * recognizable as an engineering tool, not just a link in a list.
 */
export function ToolCard({ tool, showCategory = false }: { tool: ToolDefinition; showCategory?: boolean }) {
  return (
    <Link href={toolPath(tool)} className="tool-card">
      <div className="tool-card-head">
        <span className="tool-card-name">{tool.name}</span>
        {showCategory && (
          <span className="tool-card-cat">{getCategory(tool.category).name}</span>
        )}
      </div>
      <p className="tool-card-desc">{tool.summary}</p>
      {tool.formula.length > 0 && (
        <code className="tool-card-formula" aria-hidden="true">
          {tool.formula[0]}
        </code>
      )}
    </Link>
  );
}
