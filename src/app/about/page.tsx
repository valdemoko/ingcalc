import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/data/tools";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `About ${siteConfig.name} — Who Builds These Calculators`,
  description:
    "IngCalc is a free library of technical calculators maintained by Miguel Iglesias Valenzuela. How tools are developed, verified, updated and funded.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <article className="legal-page">
      <h1>About {siteConfig.name}</h1>
      <p className="updated">Established {siteConfig.foundedYear}</p>

      <h2>What this site is</h2>
      <p>
        {siteConfig.name} is a free library of technical calculators and engineering tools —
        currently {TOOLS.length} tools across electrical, HVAC, mechanical and solar engineering,
        growing by complete clusters rather than isolated calculators.
      </p>
      <p>
        The premise is simple: give users a correct, useful technical answer immediately, and show
        the work behind it. Every tool documents its formula, the standard its constants come from,
        the assumptions it makes and the cases where it will be wrong.
      </p>

      <h2>Who is behind it</h2>
      <p>
        The project is created and maintained by{" "}
        <Link href="/about/author">{siteConfig.author.name}</Link>, who develops the tools, reviews
        the content against technical references and handles corrections and privacy requests. The
        site is funded by advertising, which keeps every tool free and account-free — see the{" "}
        <Link href="/advertising">Advertising Disclosure</Link>.
      </p>

      <h2>How tools are developed</h2>
      <ul className="checklist">
        <li>Each tool starts from a real, recurring technical question — not from a keyword list.</li>
        <li>The calculation model is separated from the page: pure math functions with documented inputs and outputs.</li>
        <li>Constants come from named sources (NEC conductor tables, ASHRAE methods, ISO standards, NREL data) — never arbitrary factors.</li>
        <li>Every engine is verified against reference values with automated mathematical tests before publication.</li>
      </ul>

      <h2>How calculations are reviewed and updated</h2>
      <ul className="checklist">
        <li>Formulas, constants and models are stated on the page — nothing is hidden in the code.</li>
        <li>Assumptions and limitations are listed honestly, including where the tool should not be trusted.</li>
        <li>Tools are reviewed when the underlying standards change; the last-updated date appears on every page.</li>
        <li>Reported errors are fixed before new tools are added — <Link href="/contact">report one</Link>.</li>
      </ul>

      <h2>Quality philosophy</h2>
      <p>
        Fewer tools, done properly, beats a thousand shallow ones. We don&rsquo;t publish a
        calculator just to have the URL: if a tool would be trivial or duplicate an existing one,
        it doesn&rsquo;t ship. Each page exists because it answers a question a practitioner
        actually has.
      </p>

      <h2>What this site is not</h2>
      <p>
        It is not engineering advice and not a substitute for a licensed professional, a code
        inspection or a stamped design — and no tool here is certified. See the{" "}
        <Link href="/disclaimer">full disclaimer</Link>.
      </p>
    </article>
  );
}
