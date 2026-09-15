import Link from "next/link";
import type { Metadata } from "next";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { TOOLS, toolsByCategory, toolPath } from "@/data/tools";
import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `${siteConfig.name} — Free Technical Calculators for Engineers`,
  description:
    "Free, accurate technical calculators: voltage drop, wire sizing, HVAC loads, duct sizing, gear ratios, solar sizing and more. Formulas, examples and honest limitations on every page.",
  path: "/",
});

const POPULAR = [
  "voltage-drop-calculator",
  "btu-calculator",
  "wire-size-calculator",
  "off-grid-system-calculator",
  "gear-ratio-calculator",
  "duct-size-calculator",
  "ohms-law-calculator",
  "battery-runtime-calculator",
];

export default function HomePage() {
  const popular = POPULAR.map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean);

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <section className="hero">
        <span className="hero-kicker">{TOOLS.length} free calculators · 4 engineering sectors</span>
        <h1>Free Technical Calculators &amp; Engineering Tools</h1>
        <p className="summary">
          Accurate calculators for electrical, HVAC, mechanical and solar work — every tool shows
          its formula, a worked example, its assumptions and its limitations. No fluff, no sign-up.
        </p>
        <div className="hero-chips" aria-label="Popular tools">
          {popular.map((t) =>
            t ? (
              <a key={t.slug} href={toolPath(t)}>
                {t.name}
              </a>
            ) : null,
          )}
        </div>
      </section>

      <h2>Browse by category</h2>
      <div className="cat-grid">
        {LIVE_CATEGORIES.map((cat) => {
          const tools = toolsByCategory(cat.key);
          return (
            <Link key={cat.key} href={cat.path} className="cat-card">
              <h3>{cat.name}</h3>
              <span className="tool-count">
                {tools.length} tool{tools.length === 1 ? "" : "s"}
              </span>
              <p>{cat.description}</p>
            </Link>
          );
        })}
      </div>

      <h2>Design guides</h2>
      <p className="summary" style={{ marginBottom: 8 }}>
        How each discipline&apos;s calculations fit together — load, conductor, protection,
        economics — with the right calculator at every step.
      </p>
      <div className="related-grid">
        {LIVE_CATEGORIES.map((cat) => (
          <Link key={cat.key} href={`/tools/${cat.key}/guide`} className="related-card">
            <span className="name">{cat.name} design guide</span>
            <span className="cat" style={{ display: "block" }}>Reference</span>
          </Link>
        ))}
      </div>

      <section className="prose-section">
        <h2>Why IngCalc is different</h2>
        <p>
          Most calculator sites give you a number and nothing else. Every tool here documents the
          model it uses — the exact formula, the standard or reference behind the constants, the
          assumptions baked in, and the cases where the result will be wrong. You can defend the
          numbers you get here in front of a client, an inspector or a professor.
        </p>
        <p>
          The library grows by category: complete clusters of related tools (wire sizing connects
          to voltage drop, which connects to motor current) rather than isolated one-off
          calculators.
        </p>
      </section>

      <section className="prose-section">
        <h2>How tools are developed</h2>
        <p>
          Each tool starts from a real, recurring technical question. The calculation model is
          separated from the page as pure math with documented inputs and outputs. Constants come
          from named sources — NEC conductor tables, ASHRAE methods, ISO standards, NREL data.
          Every engine is verified against reference values with automated tests before
          publication.
        </p>
        <p>
          See the <Link href="/about">About page</Link> for the full development process, or{" "}
          <Link href="/about/author">meet the author</Link>.
        </p>
      </section>
    </>
  );
}
