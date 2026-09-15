import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LIVE_CATEGORIES, isValidCategoryKey, getCategory } from "@/lib/categories";
import { toolsByCategory, toolPath } from "@/data/tools";
import { getGuide } from "@/data/guides";
import { categoryMetadata, breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";

export function generateStaticParams() {
  return LIVE_CATEGORIES.map((c) => ({ category: c.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategoryKey(category)) return {};
  return categoryMetadata(getCategory(category));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!isValidCategoryKey(category) || getCategory(category).status !== "live") notFound();

  const cat = getCategory(category);
  const tools = toolsByCategory(cat.key);
  const crumbs: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: cat.name, path: cat.path },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${cat.name} Calculators`,
            description: cat.description,
            url: cat.path,
            hasPart: tools.map((t) => ({
              "@type": "WebApplication",
              name: t.name,
              url: toolPath(t),
            })),
          },
        ]}
      />
      <Breadcrumbs crumbs={crumbs} />
      <h1>{cat.name} Calculators</h1>
      <p className="summary">{cat.intro}</p>

      <ul className="tool-list">
        {tools.map((t) => (
          <li key={t.slug}>
            <Link href={toolPath(t)}>
              <span className="name">{t.name}</span>
              <span className="desc" style={{ display: "block" }}>{t.description}</span>
            </Link>
          </li>
        ))}
      </ul>

      {getGuide(cat.key) && (
        <section className="prose-section">
          <h2>Design guide</h2>
          <p>
            How these calculations fit together in real projects — the order to run them in, and
            the decisions each one answers.
          </p>
          <div className="related-grid">
            <Link href={`/tools/${cat.key}/guide`} className="related-card">
              <span className="name">{cat.name} design guide</span>
              <span className="cat" style={{ display: "block" }}>Reference · {tools.length} linked calculators</span>
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
