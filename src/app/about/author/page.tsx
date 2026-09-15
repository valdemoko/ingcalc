import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `About the Author — ${siteConfig.name}`,
  description:
    "Miguel Iglesias Valenzuela is the creator and person responsible for IngCalc. He develops, maintains and reviews the tools and content on this site.",
  path: "/about/author",
});

export default function AuthorPage() {
  return (
    <article className="legal-page">
      <h1>About the Author</h1>

      <h2>{siteConfig.author.name}</h2>
      <p>
        Miguel Iglesias Valenzuela is the creator and person responsible for this project. He
        develops and maintains the tools and resources available on this site and reviews the
        content to keep it useful, clear, and up to date.
      </p>

      {siteConfig.author.linkedin && (
        <p>
          <a href={siteConfig.author.linkedin} rel="noopener noreferrer me" target="_blank">
            Professional profile on LinkedIn
          </a>
        </p>
      )}

      <h2>Project responsibility</h2>
      <ul className="checklist">
        <li>Which calculators are published and how they are verified against technical references.</li>
        <li>Corrections to tools and content — reported errors are prioritized (see <Link href="/contact">Contact</Link>).</li>
        <li>The privacy choices described in the <Link href="/privacy">Privacy Policy</Link>.</li>
      </ul>

      <h2>How IngCalc tools are developed</h2>
      <p>
        Every tool on this site follows the same development process. The goal is to produce a
        calculator that a practitioner can trust — not just one that produces a number.
      </p>

      <ol>
        <li>
          <strong>Calculation engine.</strong> Each tool has a standalone calculation function
          separated from the page. The engine is pure math: documented inputs, documented outputs,
          no side effects. This separation means the logic can be tested independently of the UI.
        </li>
        <li>
          <strong>Input validation.</strong> Tools reject unreasonable inputs (negative lengths,
          zero voltages, out-of-range power factors) and explain what went wrong. The goal is to
          prevent nonsensical results rather than silently returning them.
        </li>
        <li>
          <strong>Formula transparency.</strong> Every page shows the exact formula used — not a
          summary, not a description, but the mathematical expression. Users can verify the formula
          against the standard it references.
        </li>
        <li>
          <strong>Constants from named sources.</strong> Conductor resistances come from NEC
          Chapter 9 tables. Duct friction factors follow ASHRAE methods. Bolt torque values come
          from ISO 898 / VDI 2230. No constant is arbitrary.
        </li>
        <li>
          <strong>Assumptions documented.</strong> Every model makes assumptions — steady state,
          linear behavior, standard conditions. These are listed on the page so the user can
          evaluate whether they apply to their situation.
        </li>
        <li>
          <strong>Limitations stated honestly.</strong> If a tool does not cover a case — aluminum
          conductors, variable-frequency drives, extreme temperatures — the page says so. A
          limitation is not a defect; it is information the user needs.
        </li>
        <li>
          <strong>Automated testing.</strong> Each engine is verified against reference values
          using mathematical assertions. When a test fails, the tool is not published until the
          discrepancy is explained and resolved.
        </li>
        <li>
          <strong>Ongoing maintenance.</strong> Tools are reviewed when the underlying standards
          change. Reported errors are fixed before new tools are added. Every page shows a
          last-updated date.
        </li>
      </ol>

      <h2>How to report a problem</h2>
      <p>
        If you find a calculation error, a broken tool or content that is wrong, the fastest
        path is <Link href="/contact">Contact</Link>. Include the tool name, your inputs, the
        result you got and — if possible — the result you expected with a reference. Calculation
        errors are fixed before anything else.
      </p>

      <h2>Editorial independence</h2>
      <p>
        The site is funded by advertising. Advertisers have no influence over calculation methods,
        tool content or editorial decisions — see the{" "}
        <Link href="/advertising">Advertising Disclosure</Link>.
      </p>

      <p>
        Back to <Link href="/about">About IngCalc</Link>.
      </p>
    </article>
  );
}
