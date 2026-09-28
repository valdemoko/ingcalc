/**
 * Phase-2 registry & cannibalization audit.
 * Run with: npx tsx scripts/audit-registry.ts
 */
import { TOOLS } from "../src/data/tools";
import { toolPath } from "../src/data/tools";
import { LIVE_CATEGORIES } from "../src/lib/categories";

const NEW = [
  "parallel-resistor-calculator", "capacitor-energy-calculator", "reactance-calculator",
  "cantilever-beam-calculator", "shaft-torsion-calculator", "machine-efficiency-calculator",
  "psychrometric-calculator", "heat-pump-cop-calculator", "temperature-conversion-calculator",
  "energy-consumption-calculator", "inverter-sizing-calculator", "dc-ac-ratio-calculator",
  "excavation-calculator", "paint-calculator", "tile-calculator",
];

let problems = 0;

// 1. Registration + page payload completeness
console.log("== Registration & publication payload ==");
const inbound = new Map<string, number>();
for (const t of TOOLS) for (const r of t.related) inbound.set(r, (inbound.get(r) ?? 0) + 1);

for (const s of NEW) {
  const t = TOOLS.find((x) => x.slug === s);
  if (!t) { console.error(`NOT REGISTERED: ${s}`); problems++; continue; }
  const issues: string[] = [];
  if (t.inputs.length === 0) issues.push("no inputs");
  if (t.formula.length === 0) issues.push("no formula");
  if (!t.summary || !t.description) issues.push("missing metadata");
  if (t.faqs.length === 0) issues.push("no FAQs");
  if (t.references.length === 0) issues.push("no references");
  if (!inbound.has(s)) issues.push("ZERO inbound internal links");
  const cat = LIVE_CATEGORIES.find((c) => c.key === t.category);
  if (!cat) issues.push("category not live");
  if (issues.length) { console.error(`  ${s}: ${issues.join("; ")}`); problems++; }
  else console.log(`  ok ${toolPath(t)} (inbound: ${inbound.get(s)})`);
}

// 2. Cannibalization scan: shared 2+ significant words in titles/keywords across all 85
console.log("\n== Cannibalization scan (title/keyword overlap) ==");
const STOP = new Set(["calculator", "calc", "and", "of", "the", "a", "to", "for", "in", "vs"]);
function sig(t: { title: string; keywords: string[] }): string[] {
  const words = (t.title + " " + t.keywords.join(" ")).toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/);
  return [...new Set(words.filter((w) => w.length > 3 && !STOP.has(w)))];
}
const sigs = TOOLS.map((t) => ({ slug: t.slug, s: new Set(sig(t)) }));
const pairs: [string, string, number][] = [];
for (let i = 0; i < sigs.length; i++) {
  for (let j = i + 1; j < sigs.length; j++) {
    const shared = [...sigs[i].s].filter((w) => sigs[j].s.has(w));
    if (shared.length >= 3) pairs.push([sigs[i].slug, sigs[j].slug, shared.length]);
  }
}
pairs.sort((a, b) => b[2] - a[2]);
const newSet = new Set(NEW);
console.log(`  ${pairs.length} pairs share ≥3 significant terms; pairs involving NEW tools:`);
for (const [a, b, n] of pairs.slice(0, 25)) {
  const involvesNew = newSet.has(a) || newSet.has(b);
  console.log(`  ${involvesNew ? "NEW " : "    "}${a} <-> ${b} (${n})`);
}

// 3. Category page integrity
console.log("\n== Category groups ==");
for (const c of LIVE_CATEGORIES) {
  const slugs = new Set(TOOLS.filter((t) => t.category === c.key).map((t) => t.slug));
  const listed = new Set((c.groups ?? []).flatMap((g) => g.slugs));
  const stale = [...listed].filter((s) => !slugs.has(s));
  const missing = [...slugs].filter((s) => !listed.has(s));
  if (stale.length) { console.error(`  ${c.key}: group entries not in registry: ${stale}`); problems++; }
  console.log(`  ${c.key}: ${slugs.size} tools, ${missing.length} not in a group (appear in "All")`);
}

// 4. Totals
console.log(`\nTotal tools: ${TOOLS.length}`);
const byCat = new Map<string, number>();
for (const t of TOOLS) byCat.set(t.category, (byCat.get(t.category) ?? 0) + 1);
for (const [c, n] of byCat) console.log(`  ${c}: ${n}`);

if (problems > 0) { console.error(`\n${problems} registry problem(s) found`); process.exit(1); }
console.log("\nRegistry audit passed.");
