import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Accessibility — ${siteConfig.name}`,
  description:
    "IngCalc accessibility statement: keyboard navigation, labels, contrast, semantic structure and how to report an accessibility problem.",
  path: "/accessibility",
  noindex: true,
});

export default function AccessibilityPage() {
  return (
    <article className="legal-page">
      <h1>Accessibility</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.accessibility}</p>

      <p>
        IngCalc should be usable by everyone, including people using keyboards only, screen readers,
        magnification or reduced-motion settings. This page describes what we do and how to tell us
        when something doesn&rsquo;t work.
      </p>

      <h2>What we build for</h2>
      <ul className="checklist">
        <li><strong>Keyboard access:</strong> all interactive elements — inputs, buttons, links, FAQ disclosures — are reachable and operable by keyboard, with a visible focus indicator.</li>
        <li><strong>Labels and structure:</strong> every form field has a programmatic label; headings follow a logical hierarchy; landmarks (header, nav, main, footer) organize each page.</li>
        <li><strong>Contrast:</strong> text and interface colors are chosen to meet or approach WCAG 2.1 AA contrast ratios.</li>
        <li><strong>Text resizing:</strong> layouts use responsive units and reflow without horizontal scrolling at common zoom levels.</li>
        <li><strong>Reduced motion:</strong> animations and smooth scrolling are disabled when your system requests reduced motion.</li>
        <li><strong>Tables:</strong> results and variable tables use real table markup with headers and captions where appropriate.</li>
      </ul>

      <h2>Known limitations</h2>
      <p>
        We have not commissioned a formal accessibility audit or certification, and we don&rsquo;t
        claim conformance to a specific WCAG level site-wide. Accessibility is treated as an
        engineering requirement and improved continuously.
      </p>

      <h2>Report a problem</h2>
      <p>
        If something on this site is hard or impossible to use with assistive technology, tell us
        via the <Link href="/contact">contact page</Link> — include the page URL, what you were
        trying to do and the assistive technology involved. Accessibility fixes are prioritized.
      </p>
    </article>
  );
}
