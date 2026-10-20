/**
 * Guarded production deploy (static export -> Workers Static Assets).
 *
 * `NEXT_PUBLIC_*` values are inlined at build time and `.env*` files can carry
 * another project's origin (assesscheck.site once canonicalised to ratecraft.site
 * that way). Process environment wins over every `.env*` file, so the production
 * origin is pinned here and the live site is verified afterwards.
 */
import { spawnSync } from "node:child_process";

const SITE_URL = "https://ingcalc.site";
const env = { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL, STATIC_EXPORT: "1" };

function run(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: "inherit", env, shell: true });
  if (result.status !== 0) {
    console.error(`\nFAILED: ${cmd} ${args.join(" ")}`);
    process.exit(result.status ?? 1);
  }
}

run("npx", ["next", "build"]);
run("npx", ["wrangler", "deploy", "-c", "wrangler.static.jsonc"]);

const host = new URL(SITE_URL).host;

async function verify() {
  const bust = `?_=${Date.now()}`;
  const get = async (path) => (await fetch(`${SITE_URL}${path}${bust}`, { cache: "no-store" })).text();
  const [home, robots, sitemap] = await Promise.all([get("/"), get("/robots.txt"), get("/sitemap.xml")]);

  const canonical = /<link rel="canonical" href="https?:\/\/([^/"]+)/i.exec(home)?.[1];
  const sitemapHosts = new Set([...sitemap.matchAll(/<loc>https?:\/\/([^/<]+)/g)].map((m) => m[1]));
  const robotsSitemapHost = /^Sitemap:\s*https?:\/\/([^/\s]+)/im.exec(robots)?.[1];
  const blocked =
    /^\s*Disallow:\s*\/\s*$/im.test(robots) || /<meta name="robots" content="[^"]*noindex/i.test(home);

  const problems = [];
  if (canonical !== host) problems.push(`canonical host is ${canonical}, expected ${host}`);
  if (robotsSitemapHost !== host) problems.push(`robots.txt sitemap host is ${robotsSitemapHost}, expected ${host}`);
  if (sitemapHosts.size !== 1 || !sitemapHosts.has(host)) problems.push(`sitemap hosts: ${[...sitemapHosts].join(", ")}`);
  if (blocked) problems.push("site is blocking indexing (Disallow: / or noindex)");
  return problems;
}

// A new version takes a short while to replace the old one at every edge location.
let problems = await verify();
for (let attempt = 1; problems.length > 0 && attempt <= 6; attempt++) {
  await new Promise((resolve) => setTimeout(resolve, 10_000));
  problems = await verify();
}

if (problems.length > 0) {
  console.error(`\nPOST-DEPLOY CHECK FAILED:\n - ${problems.join("\n - ")}`);
  process.exit(1);
}
console.log(`\nPost-deploy check OK: canonical, robots and sitemap use ${host} and allow indexing.`);
