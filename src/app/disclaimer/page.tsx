import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Disclaimer — ${siteConfig.name}`,
  description:
    "IngCalc disclaimer: results are reference estimates. Verify critical calculations against applicable codes, standards, manufacturers and qualified professionals.",
  path: "/disclaimer",
  noindex: true,
});

const SECTORS = [
  "Electrical",
  "HVAC & climate",
  "Mechanical engineering",
  "Solar, energy & batteries",
  "Construction",
  "Plumbing & water",
  "CNC & manufacturing",
  "Automotive",
  "Agriculture",
  "Chemistry & laboratory",
];

export default function DisclaimerPage() {
  return (
    <article className="legal-page">
      <h1>Disclaimer</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.disclaimer}</p>

      <h2>What the tools produce</h2>
      <p>
        Every calculator on this site produces <strong>estimates</strong> based on published
        formulas, standard tables and documented assumptions. The result you get depends entirely on
        the values you enter and the model the tool implements. Real installations and products
        depend on many factors no calculator can capture: exact materials, field conditions, load
        diversity, workmanship, tolerances, and the specific editions and local amendments of the
        codes adopted where you work.
      </p>

      <h2>What the tools are not</h2>
      <ul className="checklist">
        <li>Not engineering, electrical, HVAC, structural or construction advice.</li>
        <li>Not a code-compliance determination — only the applicable code, as adopted and amended in your jurisdiction, determines compliance.</li>
        <li>Not a substitute for norms, standards, manufacturer documentation, licensed engineers, technicians, inspectors or other qualified professionals.</li>
        <li>Not certified or independently audited calculations.</li>
      </ul>

      <h2>Sector-specific caution</h2>
      <p>
        The guidance below applies across all sectors this site covers: {SECTORS.join("; ")}.
      </p>
      <ul className="checklist">
        <li><strong>Electrical:</strong> conductor sizing, protection and voltage drop results must be verified against the NEC or your local code as adopted, including ampacity corrections and termination ratings the tools may not model.</li>
        <li><strong>HVAC:</strong> rule-of-thumb load estimates are screening figures only; whole-building design requires proper room-by-room load calculation procedures.</li>
        <li><strong>Mechanical:</strong> fastener torque, drivetrain and pressure calculations assume the stated friction/material conditions — real assemblies may differ.</li>
        <li><strong>Solar &amp; batteries:</strong> electrical safety, string limits, fusing and battery handling have safety-critical failure modes; verify every design against the applicable electrical code and manufacturer limits.</li>
      </ul>

      <h2>Before you act on a result</h2>
      <ul className="checklist">
        <li>Check it against the current edition of the applicable standard or code.</li>
        <li>Read the assumptions and limitations listed on the tool page — they define where the model breaks down.</li>
        <li>Consult a qualified professional for anything safety-related or beyond reference work.</li>
        <li>Never use a single result from this site as the only basis for a decision affecting safety, legality or significant cost.</li>
      </ul>

      <h2>Errors and corrections</h2>
      <p>
        The disclaimer is not a shield for incorrect tools. When a calculation error is reported and
        confirmed, it is fixed and the tool&rsquo;s last-updated date changes. If you believe a
        result is wrong, <Link href="/contact">tell us</Link> — corrections take priority over new
        tools.
      </p>

      <h2>External references</h2>
      <p>
        We link to standards bodies and public references to document methodology. We are not
        affiliated with them and do not reproduce copyrighted standard text.
      </p>
    </article>
  );
}
