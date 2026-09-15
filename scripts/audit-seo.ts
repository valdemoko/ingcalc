/**
 * Data & SEO audit over the tool registry.
 * Run with: npx tsx scripts/audit-seo.ts
 */
import { TOOLS } from "../src/data/tools";
import { CATEGORIES, LIVE_CATEGORIES } from "../src/lib/categories";

let problems = 0;
function problem(msg: string) {
  problems++;
  console.error(`PROBLEM: ${msg}`);
}

// 1. Unique slugs
const slugCounts = new Map<string, number>();
for (const t of TOOLS) slugCounts.set(t.slug, (slugCounts.get(t.slug) ?? 0) + 1);
for (const [slug, n] of slugCounts) if (n > 1) problem(`duplicate slug: ${slug} (×${n})`);

// 2. Unique titles & descriptions
const titles = new Map<string, string>();
const descs = new Map<string, string>();
for (const t of TOOLS) {
  if (titles.has(t.title)) problem(`duplicate title: "${t.title}" (${t.slug} vs ${titles.get(t.title)})`);
  else titles.set(t.title, t.slug);
  if (descs.has(t.description)) problem(`duplicate description: ${t.slug} vs ${descs.get(t.description)}`);
  else descs.set(t.description, t.slug);
  if (t.description.length < 80 || t.description.length > 170)
    problem(`description length ${t.description.length} (target 80-170): ${t.slug}`);
  if (t.title.length > 65) problem(`title length ${t.title.length} > 65: ${t.slug}`);
}

// 3. Related links resolve, no self-links, no duplicates
for (const t of TOOLS) {
  if (new Set(t.related).size !== t.related.length) problem(`duplicate related entries: ${t.slug}`);
  for (const r of t.related) {
    if (r === t.slug) problem(`self related link: ${t.slug}`);
    if (!slugCounts.has(r)) problem(`broken related link: ${t.slug} → ${r}`);
  }
  if (t.related.length < 3) problem(`fewer than 3 related tools: ${t.slug}`);
}

// 4. Category consistency
const liveKeys = new Set(LIVE_CATEGORIES.map((c) => c.key));
for (const t of TOOLS) {
  if (!liveKeys.has(t.category)) problem(`tool ${t.slug} in non-live category ${t.category}`);
}
for (const c of LIVE_CATEGORIES) {
  const n = TOOLS.filter((t) => t.category === c.key).length;
  if (n === 0) problem(`live category with no tools: ${c.key}`);
}

// 5. FAQ quality guard (FAQPage schema only for substantive content)
for (const t of TOOLS) {
  for (const f of t.faqs) {
    if (f.a.length < 60) problem(`thin FAQ answer (<60 chars): ${t.slug} — "${f.q}"`);
  }
}

// 6. Route consistency: /tools/[category]/[tool] requires definition path match
// (enforced at runtime by notFound(); verified here statically)
for (const t of TOOLS) {
  const cat = CATEGORIES.find((c) => c.key === t.category);
  if (!cat) problem(`unknown category on ${t.slug}`);
}

// 7. References must be https and non-empty
for (const t of TOOLS) {
  for (const ref of t.references) {
    if (!ref.url.startsWith("https://")) problem(`non-https reference on ${t.slug}: ${ref.url}`);
  }
}

console.log(`\nAudited ${TOOLS.length} tools, ${CATEGORIES.length} categories.`);
if (problems > 0) {
  console.error(`${problems} problem(s) found.`);
  process.exit(1);
}
console.log("Audit passed: no duplicates, no broken links, no thin metadata.");
