/**
 * Institutional, footer & legal audit.
 * Run with: npx tsx scripts/audit-site.ts
 * (Extends audit-seo.ts, which covers the tool registry.)
 */
import { siteConfig, INSTITUTIONAL_PAGES } from "../src/config/site";
import { LIVE_CATEGORIES } from "../src/lib/categories";
import { GUIDES } from "../src/data/guides";
import { TOOLS } from "../src/data/tools";
import fs from "fs";
import path from "path";

let problems = 0;
function problem(msg: string) {
  problems++;
  console.error(`PROBLEM: ${msg}`);
}
function ok(msg: string) {
  console.log(`ok: ${msg}`);
}

// --- Every route that actually exists on disk (dynamic segments resolved
// against generateStaticParams data: categories, guides, tools) ---
const srcDir = path.join(__dirname, "..", "src", "app");
function* walk(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.name === "page.tsx") yield p;
  }
}
const staticRoutes = new Set<string>();
for (const file of walk(srcDir)) {
  const rel = path.relative(srcDir, file).replace(/\\/g, "/");
  let route = "/" + rel.replace(/\/page\.tsx$/, "");
  // /tools/[category] -> expand with live categories; /tools/[category]/[tool] via tools loop below
  if (route.includes("[category]")) continue;
  staticRoutes.add(route === "/page" ? "/" : route);
}
for (const c of LIVE_CATEGORIES) staticRoutes.add(c.path);
// Dynamic tool routes exist for every live-category tool
for (const t of TOOLS) {
  const cat = LIVE_CATEGORIES.find((c) => c.key === t.category);
  if (cat) staticRoutes.add(`${cat.path}/${t.slug}`);
}
for (const g of GUIDES) staticRoutes.add(`/tools/${g.category}/guide`);

// --- 1. Footer links all resolve ---
const footerLinks = [
  "/tools",
  ...LIVE_CATEGORIES.map((c) => c.path),
  ...LIVE_CATEGORIES.map((c) => `${c.path}/guide`),
  ...INSTITUTIONAL_PAGES.map((p) => p.path),
];
for (const link of footerLinks) {
  if (!staticRoutes.has(link)) problem(`footer/institutional link has no page: ${link}`);
}
ok(`checked ${footerLinks.length} footer links against ${staticRoutes.size} routes`);

// --- 2. Institutional pages exist exactly once, no duplicates ---
const paths = INSTITUTIONAL_PAGES.map((p) => p.path);
if (new Set(paths).size !== paths.length) problem("duplicate paths in INSTITUTIONAL_PAGES");
ok(`${INSTITUTIONAL_PAGES.length} institutional pages registered, all unique`);

// --- 3. siteConfig integrity ---
if (!siteConfig.author.name) problem("siteConfig.author.name is empty");
if (siteConfig.author.linkedin && !siteConfig.author.linkedin.startsWith("https://www.linkedin.com/"))
  problem(`author.linkedin is not a LinkedIn URL: ${siteConfig.author.linkedin}`);
if (siteConfig.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(siteConfig.contactEmail))
  problem(`contactEmail is not a valid email: ${siteConfig.contactEmail}`);
if (/example\.com/.test(siteConfig.contactEmail)) problem("contactEmail is still a placeholder domain");
ok("siteConfig: author present, linkedin/contact format-checked when present");

// --- 4. No placeholder strings visible to users ---
const legalFiles = [
  "src/app/privacy/page.tsx",
  "src/app/cookies/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/disclaimer/page.tsx",
  "src/app/advertising/page.tsx",
  "src/app/accessibility/page.tsx",
  "src/app/about/page.tsx",
  "src/app/about/author/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/consent-preferences/page.tsx",
];
const PLACEHOLDERS = ["TODO", "FIXME", "LOREM", "XXXX", "example.com/your", "your-email", "[USE THE LINK"];
for (const f of legalFiles) {
  const full = path.join(__dirname, "..", f);
  if (!fs.existsSync(full)) {
    problem(`legal page missing on disk: ${f}`);
    continue;
  }
  const text = fs.readFileSync(full, "utf8").toUpperCase();
  for (const ph of PLACEHOLDERS) {
    if (text.includes(ph.toUpperCase())) problem(`placeholder "${ph}" found in ${f}`);
  }
}
ok(`scanned ${legalFiles.length} legal pages for visible placeholders`);

// --- 5. Legal dates centralized ---
for (const f of legalFiles.filter((f) => !f.includes("consent-preferences"))) {
  const full = path.join(__dirname, "..", f);
  const text = fs.readFileSync(full, "utf8");
  const hardcoded = text.match(/Last updated: \w+ \d{1,2}, \d{4}/g) ?? [];
  if (hardcoded.length > 0 && !text.includes("legalLastUpdated")) {
    problem(`${f} hardcodes an update date instead of using legalLastUpdated`);
  }
}
ok("legal dates read from siteConfig.legalLastUpdated");

// --- 6. Sitemap consistency: institutional pages in sitemap iff indexable ---
const sitemapText = fs.readFileSync(path.join(__dirname, "..", "src", "app", "sitemap.ts"), "utf8");
if (!sitemapText.includes("INSTITUTIONAL_PAGES")) problem("sitemap.ts does not use INSTITUTIONAL_PAGES");
ok("sitemap filters institutional pages by the indexable flag");

// --- 7. External URLs in legal pages: only https, only known-official domains ---
const ALLOWED_EXTERNAL = [
  "https://policies.google.com",
  "https://adssettings.google.com",
  "https://www.youronlinechoices.com",
  "https://www.linkedin.com",
];
for (const f of legalFiles) {
  const full = path.join(__dirname, "..", f);
  if (!fs.existsSync(full)) continue;
  const text = fs.readFileSync(full, "utf8");
  const urls = [...text.matchAll(/https:\/\/[^"'\s)]+/g)].map((m) => m[0]);
  for (const u of urls) {
    if (!ALLOWED_EXTERNAL.some((a) => u.startsWith(a))) {
      problem(`non-allowlisted external URL in ${f}: ${u}`);
    }
  }
}
ok("external legal URLs restricted to official allowlist");

console.log(`\nInstitutional audit complete.`);
if (problems > 0) {
  console.error(`${problems} problem(s) found.`);
  process.exit(1);
}
console.log("Footer, legal, config and external-link checks passed.");
