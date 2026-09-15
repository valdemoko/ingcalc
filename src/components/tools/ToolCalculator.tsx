"use client";

import { getTool } from "@/data/tools";
import { CalculatorForm } from "@/components/tools/CalculatorForm";

/**
 * Server Components cannot pass functions to Client Components, so the tool
 * page passes only the slug; the calc function is resolved here from the
 * registry, which is also bundled for the client.
 */
export function ToolCalculator({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  return <CalculatorForm inputs={tool.inputs} calc={tool.calc} toolName={tool.name} />;
}
