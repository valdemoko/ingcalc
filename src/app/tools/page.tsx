import Link from "next/link";
import type { Metadata } from "next";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { TOOLS, toolsByCategory } from "@/data/tools";
import { pageMetadata } from "@/lib/seo";
import { SearchBox } from "@/components/tool/SearchBox";
import { toSearchItems } from "@/lib/search";
import { ToolCard } from "@/components/tools/ToolCard";

export const metadata: Metadata = pageMetadata({
  title: "All Technical Calculators & Tools — by Category | IngCalc",
  description:
    "Complete index of free technical calculators: electrical, HVAC, mechanical engineering, construction and solar energy tools, organized by category with formulas and worked examples.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  const SEARCH_ITEMS = toSearchItems(TOOLS);

  return (
    <>
      <section className="page-head">
        <span className="page-kicker">Tool directory</span>
        <h1>All Technical Calculators &amp; Tools</h1>
        <p className="summary">
          Every tool documents its formula, assumptions, limitations and a worked example —
          designed for practitioners who need to understand the result, not just see a number.
        </p>
        <div className="hero-search">
          <SearchBox items={SEARCH_ITEMS} placeholder={`Search ${TOOLS.length} calculators…`} />
        </div>
      </section>

      <div className="stats-band" role="list" aria-label="Library stats">
        <div className="stat" role="listitem">
          <span className="stat-num">{TOOLS.length}</span>
          <span className="stat-label">Calculators</span>
        </div>
        <div className="stat" role="listitem">
          <span className="stat-num">{LIVE_CATEGORIES.length}</span>
          <span className="stat-label">Disciplines</span>
        </div>
        <div className="stat" role="listitem">
          <span className="stat-num">100%</span>
          <span className="stat-label">Free, no sign-up</span>
        </div>
        <div className="stat" role="listitem">
          <span className="stat-num">{LIVE_CATEGORIES.length}</span>
          <span className="stat-label">Design guides</span>
        </div>
      </div>

      {LIVE_CATEGORIES.map((cat) => {
        const tools = toolsByCategory(cat.key);
        if (tools.length === 0) return null;
        return (
          <section key={cat.key} className="tool-directory-section">
            <div className="section-head">
              <h2>
                <Link href={cat.path}>{cat.name}</Link>
              </h2>
              <span className="section-count">
                {tools.length} tool{tools.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="tool-directory-intro">{cat.description}</p>
            <div className="tool-cards">
              {tools.map((t) => (
                <ToolCard key={t.slug} tool={t} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="prose-section">
        <h2>How to use these tools</h2>
        <p>
          Start with the category that matches your problem. Each tool includes a worked example
          with real numbers so you can verify the calculation against your own situation before
          relying on the result.
        </p>
        <p>
          The{" "}
          <Link href="/about">About page</Link>{" "}
          explains how tools are developed, how formulas are sourced and how results are verified.
          If you find an error, <Link href="/contact">report it</Link> — corrections are
          prioritized.
        </p>
      </section>
    </>
  );
}
