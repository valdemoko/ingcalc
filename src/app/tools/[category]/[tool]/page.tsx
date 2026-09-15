import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LIVE_CATEGORIES, getCategory } from "@/lib/categories";
import { getTool, toolsByCategory, toolPath } from "@/data/tools";
import { toolMetadata, breadcrumbJsonLd, faqJsonLd, toolJsonLd, type Crumb } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CalculatorForm } from "@/components/tools/CalculatorForm";
import { ToolCalculator } from "@/components/tools/ToolCalculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolDiagram } from "@/components/tools/ToolDiagram";

export function generateStaticParams() {
  return LIVE_CATEGORIES.flatMap((cat) =>
    toolsByCategory(cat.key).map((t) => ({ category: cat.key, tool: t.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { tool: slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return toolMetadata(tool, getCategory(tool.category).path);
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool: slug } = await params;
  const tool = getTool(slug);

  // One canonical home per tool: the [category] segment must match the definition.
  if (!tool || tool.category !== category) notFound();

  const cat = getCategory(tool.category);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: cat.name, path: cat.path },
    { name: tool.name, path: toolPath(tool) },
  ];

  const related = tool.related
    .map((s) => getTool(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <article>
      <JsonLd
        data={[breadcrumbJsonLd(crumbs), toolJsonLd(tool, cat.name, cat.path), faqJsonLd(tool.faqs)]}
      />
      <Breadcrumbs crumbs={crumbs} />

      <h1>{tool.name}</h1>
      <p className="summary">{tool.summary}</p>

      <ToolDiagram slug={tool.slug} />

      <ToolCalculator slug={tool.slug} />

      <p className="updated">Last updated: {tool.lastUpdated}</p>

      <section className="prose-section">
        <h2>How the calculation works</h2>
        <ul className="checklist">
          {tool.howItWorks.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>

      <section className="prose-section">
        <h2>Formula</h2>
        <pre className="formula-block">{tool.formula.join("\n")}</pre>
        <table className="vars-table">
          <caption className="sr-only">Formula variables</caption>
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Meaning</th>
              <th scope="col">Unit</th>
            </tr>
          </thead>
          <tbody>
            {tool.variables.map((v, i) => (
              <tr key={i}>
                <td><code>{v.symbol}</code></td>
                <td>{v.meaning}</td>
                <td>{v.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="prose-section">
        <h2>Worked example</h2>
        <div className="example-block">{tool.example}</div>
      </section>

      <section className="prose-section">
        <h2>Interpreting the result</h2>
        <p>{tool.interpretation}</p>
      </section>

      <section className="prose-section">
        <h2>Assumptions</h2>
        <ul className="checklist">
          {tool.assumptions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="prose-section">
        <h2>Limitations</h2>
        <ul className="checklist">
          {tool.limitations.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      </section>

      {tool.faqs.length > 0 && (
        <section className="prose-section">
          <h2>Frequently asked questions</h2>
          {tool.faqs.map((f, i) => (
            <details className="faq" key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      {related.length > 0 && (
        <section className="prose-section">
          <h2>Related tools</h2>
          <div className="related-grid">
            {related.map((r) => (
              <Link key={r.slug} href={toolPath(r)} className="related-card">
                <span className="name">{r.name}</span>
                <span className="cat" style={{ display: "block" }}>
                  {getCategory(r.category).name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {tool.references.length > 0 && (
        <section className="prose-section">
          <h2>Technical references</h2>
          <ul className="ref-list">
            {tool.references.map((r, i) => (
              <li key={i}>
                <a href={r.url} rel="noopener noreferrer nofollow" target="_blank">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}


    </article>
  );
}
