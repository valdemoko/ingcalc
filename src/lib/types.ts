/**
 * Core type system for IngCalc.
 *
 * Every tool is a pure data definition: fields + a pure `calc` function +
 * editorial content. Pages, SEO, sitemap and internal linking are generated
 * from these definitions — adding a tool never touches route code.
 */

export type CategoryKey =
  | "electrical"
  | "hvac"
  | "mechanical"
  | "solar-energy"
  | "construction"
  | "plumbing"
  | "cnc-manufacturing"
  | "automotive"
  | "agriculture"
  | "chemistry";

/** A selectable unit. `factor` converts the entered value to the canonical (SI) unit. */
export interface UnitOption {
  value: string;
  label: string;
  factor: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  id: string;
  label: string;
  kind: "number" | "select";
  /** Canonical unit label, shown when the field has a single unit. */
  unit?: string;
  /** User-selectable units; entered value × factor = canonical value. */
  unitOptions?: UnitOption[];
  options?: SelectOption[];
  defaultValue?: number;
  defaultUnit?: string;
  defaultOption?: string;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
  /** Optional fields may be left blank (e.g. solvers where the blank is the unknown). */
  optional?: boolean;
}

/** Engine input: `values` holds canonical numbers, `raw` holds select values and original strings. */
export interface CalcInput {
  values: Record<string, number>;
  raw: Record<string, string>;
}

export interface OutputRow {
  label: string;
  value: number;
  unit: string;
  /** One-line explanation of what this result means. */
  hint?: string;
  /** Primary results render highlighted. */
  primary?: boolean;
  /** Decimal places (default: 4 significant figures). */
  decimals?: number;
}

export interface CalcOutput {
  rows: OutputRow[];
  /** Contextual notes shown under the results (model used, approximations...). */
  notes?: string[];
}

export type CalcFn = (input: CalcInput) => CalcOutput;

export interface VariableDef {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Reference {
  label: string;
  url: string;
}

/**
 * Tool-specific editorial section: a differentiating block that belongs to ONE
 * tool only (professional use case, advanced interpretation, common sizing
 * error...). Never interchangeable between tools — that is the point.
 */
export interface ToolSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface ToolDefinition {
  /** Unique editorial section(s) shown after the interpretation block. Optional. */
  sections?: ToolSection[];
  /** URL slug, unique across the whole site. */
  slug: string;
  category: CategoryKey;
  name: string;
  /** Unique SEO title (<title>). */
  title: string;
  /** Unique meta description (~150-160 chars). */
  description: string;
  /** Short intro shown directly above the calculator (H1 area). */
  summary: string;
  keywords: string[];
  inputs: FieldDef[];
  /** Pure calculation function — no React, no side effects, testable. */
  calc: CalcFn;
  /** Formula lines, rendered in a mono block. */
  formula: string[];
  variables: VariableDef[];
  howItWorks: string[];
  /** Concrete worked example with real numbers. */
  example: string;
  /** How to read/interpret the results. */
  interpretation: string;
  assumptions: string[];
  limitations: string[];
  faqs: FaqItem[];
  references: Reference[];
  /** Slugs of genuinely related tools (3-6, contextual cluster links). */
  related: string[];
  priority: "A" | "B" | "C";
  lastUpdated: string;
}

export type CategoryStatus = "live" | "planned";

export interface CategoryGroup {
  title: string;
  description?: string;
  slugs: string[];
}

export interface CategoryDef {
  key: CategoryKey;
  name: string;
  /** URL segment under /tools/. */
  path: string;
  title: string;
  description: string;
  intro: string;
  status: CategoryStatus;
  /** Thematic groups for the category page. Tools not listed here appear in an "All" section. */
  groups?: CategoryGroup[];
}
