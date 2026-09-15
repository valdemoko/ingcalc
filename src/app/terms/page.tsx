import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Terms of Use — ${siteConfig.name}`,
  description:
    "IngCalc Terms of Use: acceptance, acceptable use, intellectual property, availability, limitation of liability and how terms may change.",
  path: "/terms",
  noindex: true,
});

export default function TermsPage() {
  return (
    <article className="legal-page">
      <h1>Terms of Use</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.terms}</p>

      <h2>1. Acceptance</h2>
      <p>
        By accessing or using IngCalc you agree to these Terms of Use. If you do not agree, please
        do not use the site.
      </p>

      <h2>2. What the service is</h2>
      <p>
        IngCalc provides free, browser-based technical calculators and reference content for
        engineering-related work. All tools are informational: they produce estimates based on
        published formulas and documented assumptions. They are not professional certifications,
        code-compliance determinations or engineering advice — see the{" "}
        <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>3. Permitted use</h2>
      <ul className="checklist">
        <li>Use the tools freely, for personal or professional reference, at no cost.</li>
        <li>Link to any page from your own site or documents.</li>
      </ul>

      <h2>4. Prohibited use</h2>
      <ul className="checklist">
        <li>Scraping, bulk-reproducing or republishing the tools or editorial content without written permission.</li>
        <li>Selling or bundling access to the site or its content.</li>
        <li>Attempting to disrupt, overload, reverse-engineer for abuse, or gain unauthorized access to the service.</li>
        <li>Generating artificial traffic or interactions, including on advertising (this also violates our ad partners&rsquo; policies).</li>
        <li>Presenting the site or its results as your own product or as certified engineering work.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        The site design, code, tool definitions and editorial text are © {new Date().getFullYear()}{" "}
        {siteConfig.author.name} / {siteConfig.name}. All rights reserved. Underlying formulas,
        standards and engineering principles belong to their respective publishers (NEC, ASHRAE,
        ISO, NREL and others) — we cite and reference them; we do not reproduce copyrighted
        standard text.
      </p>

      <h2>6. Availability and modifications</h2>
      <p>
        The site is provided as-is and as-available. We may add, change, suspend or remove tools or
        content at any time, and we do not guarantee uninterrupted availability. Correctness of any
        specific result is not guaranteed — see the Disclaimer.
      </p>

      <h2>7. External links</h2>
      <p>
        We link to standards bodies and official references to document methodology. We are not
        affiliated with those organizations and are not responsible for third-party content or
        availability.
      </p>

      <h2>8. Your responsibility</h2>
      <p>
        You are responsible for how you use any result obtained here, including verifying it
        against applicable codes, standards, manufacturer documentation and qualified professionals
        before relying on it in practice.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, IngCalc and its operator are not liable for any
        damages arising from use of the site or reliance on calculated results — including
        equipment damage, code violations, financial loss or personal injury.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms; the date above reflects the current version. Continued use after
        changes constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <Link href="/contact">Contact</Link>.
      </p>
    </article>
  );
}
