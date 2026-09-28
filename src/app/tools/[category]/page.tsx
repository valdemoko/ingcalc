import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LIVE_CATEGORIES, isValidCategoryKey, getCategory } from "@/lib/categories";
import { toolsByCategory, getTool, toolPath } from "@/data/tools";
import { getGuide } from "@/data/guides";
import { categoryMetadata, breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ToolCard } from "@/components/tools/ToolCard";

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

  // Build grouped display if groups are defined
  const groupedSlugs = new Set(cat.groups?.flatMap((g) => g.slugs) ?? []);
  const ungrouped = tools.filter((t) => !groupedSlugs.has(t.slug));

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

      <section className="page-head">
        <span className="page-kicker">{cat.name}</span>
        <h1>{cat.name} Calculators</h1>
        <p className="summary">{cat.intro}</p>
        <span className="tool-count">{tools.length} calculators</span>
      </section>

      {cat.groups && cat.groups.length > 0 ? (
        cat.groups.map((group) => {
          const groupTools = group.slugs
            .map((s) => getTool(s))
            .filter((t): t is NonNullable<typeof t> => Boolean(t));
          if (groupTools.length === 0) return null;
          return (
            <section key={group.title} className="tool-directory-section">
              <div className="section-head">
                <h2>{group.title}</h2>
                <span className="section-count">{groupTools.length}</span>
              </div>
              {group.description && (
                <p className="tool-directory-intro">{group.description}</p>
              )}
              <div className="tool-cards">
                {groupTools.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          );
        })
      ) : (
        <div className="tool-cards">
          {tools.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      )}

      {ungrouped.length > 0 && cat.groups && cat.groups.length > 0 && (
        <section className="tool-directory-section">
          <div className="section-head">
            <h2>More calculators</h2>
            <span className="section-count">{ungrouped.length}</span>
          </div>
          <div className="tool-cards">
            {ungrouped.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </section>
      )}

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
