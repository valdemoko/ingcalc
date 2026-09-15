import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LIVE_CATEGORIES, getCategory, isValidCategoryKey } from "@/lib/categories";
import { GUIDES, getGuide } from "@/data/guides";
import { getTool, toolPath } from "@/data/tools";
import { pageMetadata, breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ category: g.category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const guide = GUIDES.find((g) => g.category === category);
  if (!guide) return {};
  return pageMetadata({ title: guide.title, description: guide.description, path: `/tools/${category}/guide` });
}

export default async function GuidePage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isValidCategoryKey(category)) notFound();
  const guide = getGuide(category);
  if (!guide || getCategory(category).status !== "live") notFound();

  const cat = getCategory(category);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: cat.name, path: cat.path },
    { name: "Guide", path: `/tools/${category}/guide` },
  ];

  // Resolve tool links for each section.
  const sections = guide.sections.map((s) => ({
    ...s,
    tools: (s.toolLinks ?? []).map((slug) => getTool(slug)).filter(Boolean),
  }));

  return (
    <article className="legal-page">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{guide.title.split("—")[0].trim()}</h1>
      <p className="summary">{guide.summary}</p>

      {sections.map((s, i) => (
        <section key={i} className="prose-section">
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {s.tools.length > 0 && (
            <div className="related-grid">
              {s.tools.map((t) => t && (
                <Link key={t.slug} href={toolPath(t)} className="related-card">
                  <span className="name">{t.name}</span>
                  <span className="cat" style={{ display: "block" }}>{cat.name} calculator</span>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}

      {guide.faqs && guide.faqs.length > 0 && (
        <section className="prose-section">
          <h2>Questions about {cat.name.toLowerCase()} calculations</h2>
          {guide.faqs.map((f, i) => (
            <details className="faq" key={i} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      <section className="prose-section">
        <h2>All {cat.name} calculators</h2>
        <ul className="tool-list">
          {LIVE_CATEGORIES.filter((c) => c.key === category).length > 0 &&
            (await import("@/data/tools")).toolsByCategory(category).map((t) => (
              <li key={t.slug}>
                <Link href={toolPath(t)}>
                  <span className="name">{t.name}</span>
                  <span className="desc" style={{ display: "block" }}>{t.summary}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </article>
  );
}
