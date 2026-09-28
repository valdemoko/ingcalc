import type { CategoryKey, ToolDefinition } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import { ELECTRICAL_TOOLS } from "@/data/tools/electrical";
import { ELECTRICAL2_TOOLS } from "@/data/tools/electrical2";
import { HVAC_TOOLS } from "@/data/tools/hvac";
import { HVAC2_TOOLS } from "@/data/tools/hvac2";
import { MECHANICAL_TOOLS } from "@/data/tools/mechanical";
import { MECHANICAL2_TOOLS } from "@/data/tools/mechanical2";
import { SOLAR_TOOLS } from "@/data/tools/solar";
import { SOLAR2_TOOLS } from "@/data/tools/solar2";
import { CONSTRUCTION_TOOLS } from "@/data/tools/construction";
import { CONSTRUCTION2_TOOLS } from "@/data/tools/construction2";
import { ELECTRICAL3_TOOLS } from "@/data/tools/electrical3";
import { HVAC3_TOOLS } from "@/data/tools/hvac3";
import { MECHANICAL3_TOOLS } from "@/data/tools/mechanical3";
import { SOLAR3_TOOLS } from "@/data/tools/solar3";
import { CONSTRUCTION3_TOOLS } from "@/data/tools/construction3";
import { PLUMBING_TOOLS } from "@/data/tools/plumbing";
import { THERMO_TOOLS } from "@/data/tools/thermo";
import { MANUFACTURING_TOOLS } from "@/data/tools/manufacturing";
import { MECHANICAL4_TOOLS } from "@/data/tools/mechanical4";
import { ELECTRICAL4_TOOLS } from "@/data/tools/electrical4";
import { CONSTRUCTION4_TOOLS } from "@/data/tools/construction4";
import { HVAC4_TOOLS } from "@/data/tools/hvac4";
import { SOLAR4_TOOLS } from "@/data/tools/solar4";

/** The single source of truth for every tool on the site. */
export const TOOLS: ToolDefinition[] = [
  ...ELECTRICAL_TOOLS,
  ...ELECTRICAL2_TOOLS,
  ...HVAC_TOOLS,
  ...HVAC2_TOOLS,
  ...MECHANICAL_TOOLS,
  ...MECHANICAL2_TOOLS,
  ...SOLAR_TOOLS,
  ...SOLAR2_TOOLS,
  ...CONSTRUCTION_TOOLS,
  ...CONSTRUCTION2_TOOLS,
  ...ELECTRICAL3_TOOLS,
  ...HVAC3_TOOLS,
  ...MECHANICAL3_TOOLS,
  ...SOLAR3_TOOLS,
  ...CONSTRUCTION3_TOOLS,
  ...PLUMBING_TOOLS,
  ...THERMO_TOOLS,
  ...MANUFACTURING_TOOLS,
  ...MECHANICAL4_TOOLS,
  ...ELECTRICAL4_TOOLS,
  ...CONSTRUCTION4_TOOLS,
  ...HVAC4_TOOLS,
  ...SOLAR4_TOOLS,
];

export function getTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export function toolsByCategory(category: CategoryKey): ToolDefinition[] {
  return TOOLS.filter((t) => t.category === category);
}

/** All slugs, for duplicate detection in audits. */
export const ALL_SLUGS = new Set(TOOLS.map((t) => t.slug));

/** Canonical tool URL: /tools/{category}/{slug}. */
export function toolPath(t: ToolDefinition): string {
  return `${getCategory(t.category).path}/${t.slug}`;
}
