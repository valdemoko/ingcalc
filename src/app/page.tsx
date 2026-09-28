import Link from "next/link";
import type { Metadata } from "next";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { TOOLS, toolsByCategory, toolPath } from "@/data/tools";
import { pageMetadata, siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { SearchBox } from "@/components/tool/SearchBox";
import { ToolCard } from "@/components/tools/ToolCard";
import { toSearchItems } from "@/lib/search";
import { GUIDES } from "@/data/guides";

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
  const popular = POPULAR.map((slug) => TOOLS.find((tool) => tool.slug === slug)).filter(
    (tool): tool is NonNullable<typeof tool> => Boolean(tool),
  );
  const searchItems = toSearchItems(TOOLS);

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <section className="hero">
        <span className="hero-kicker">{TOOLS.length} free calculators · {LIVE_CATEGORIES.length} engineering sectors</span>
        <h1>Technical calculators that show their work</h1>
        <p className="summary">
          Accurate calculators for electrical, HVAC, mechanical, construction and solar work —
          each shows the formula, a worked example, assumptions and limitations. Find a tool by name
          or discipline, enter your values, and understand the result. No sign-up.
        </p>
        <div className="hero-search">
          <SearchBox items={searchItems} />
        </div>
        <div className="hero-chips" aria-label="Popular engineering calculations">
          {popular.slice(0, 4).map((tool) => (
            <Link key={tool.slug} href={toolPath(tool)}>{tool.name}</Link>
          ))}
        </div>
      </section>

      <div className="section-head">
        <div><span className="section-kicker">Engineering disciplines</span><h2>Browse by category</h2></div>
        <Link className="section-link" href="/tools">View all {TOOLS.length} tools <span aria-hidden="true">→</span></Link>
      </div>
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

      <div className="section-head"><div><span className="section-kicker">Reference library</span><h2>Design guides</h2></div></div>
      <p className="summary" style={{ marginBottom: 8 }}>
        How each discipline&apos;s calculations fit together — load, conductor, protection,
        economics — with the right calculator at every step.
      </p>
      <div className="related-grid">
        {GUIDES.map((guide) => {
          const category = LIVE_CATEGORIES.find((item) => item.key === guide.category);
          if (!category) return null;
          return (
            <Link key={guide.category} href={`${category.path}/guide`} className="related-card">
              <span className="name">{category.name} design guide</span>
              <span className="cat" style={{ display: "block" }}>{guide.sections.length} reference sections</span>
            </Link>
          );
        })}
      </div>

      <section className="popular-tools">
        <div className="section-head"><div><span className="section-kicker">Quick access</span><h2>Frequently used calculators</h2></div></div>
        <div className="tool-cards">{popular.map((tool) => <ToolCard key={tool.slug} tool={tool} showCategory />)}</div>
      </section>

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
