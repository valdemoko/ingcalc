import Link from "next/link";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { TOOLS, toolPath } from "@/data/tools";

const RECOMMENDED = [
  "voltage-drop-calculator",
  "btu-calculator",
  "gear-ratio-calculator",
  "off-grid-system-calculator",
];

export default function NotFound() {
  const recommended = RECOMMENDED.map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean);

  return (
    <article>
      <h1>Page not found</h1>
      <p>The page you requested doesn&apos;t exist or may have been moved.</p>

      <h2>Tool categories</h2>
      <ul>
        {LIVE_CATEGORIES.map((c) => (
          <li key={c.key}>
            <Link href={c.path}>{c.name}</Link> — {c.description.slice(0, 80)}…
          </li>
        ))}
      </ul>

      <h2>Popular tools</h2>
      <ul>
        {recommended.map((t) =>
          t ? (
            <li key={t.slug}>
              <Link href={toolPath(t)}>{t.name}</Link>
            </li>
          ) : null,
        )}
      </ul>

      <p>
        Or go back to the <Link href="/">homepage</Link>, browse{" "}
        <Link href="/tools">all tools</Link>, or check the{" "}
        <Link href="/about">About page</Link>.
      </p>
    </article>
  );
}
