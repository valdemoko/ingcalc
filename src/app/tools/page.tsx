import Link from "next/link";
import type { Metadata } from "next";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { TOOLS, toolsByCategory, toolPath } from "@/data/tools";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "All Technical Calculators & Tools — by Category | IngCalc",
  description:
    "Complete index of free technical calculators: electrical, HVAC, mechanical engineering and solar energy tools, organized by category with formulas and worked examples.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  return (
    <>
      <h1>All Technical Calculators &amp; Tools</h1>
      <p className="summary">
        {TOOLS.length} free calculators across four engineering sectors. Every tool documents its
        formula, assumptions, limitations and a worked example — designed for practitioners who
        need to understand the result, not just see a number.
      </p>

      <section className="tool-directory">
        {LIVE_CATEGORIES.map((cat) => {
          const tools = toolsByCategory(cat.key);
          if (tools.length === 0) return null;
          return (
            <section key={cat.key} className="tool-directory-section">
              <h2>
                <Link href={cat.path}>{cat.name}</Link>
              </h2>
              <p className="tool-directory-intro">{cat.description}</p>
              <ul className="tool-list">
                {tools.map((t) => (
                  <li key={t.slug}>
                    <Link href={toolPath(t)}>
                      <span className="name">{t.name}</span>
                      <span className="desc" style={{ display: "block" }}>
                        {t.summary}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </section>

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


