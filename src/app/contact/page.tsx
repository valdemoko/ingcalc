import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Contact — ${siteConfig.name}`,
  description:
    "Contact IngCalc: report a calculation error, suggest a tool, request data deletion or ask about privacy, cookies and advertising.",
  path: "/contact",
});

export default function ContactPage() {
  const email = siteConfig.contactEmail;

  return (
    <article className="legal-page">
      <h1>Contact</h1>

      {email ? (
        <p>
          Email: <a href={`mailto:${email}`}>{email}</a>
        </p>
      ) : (
        <p>
          A public contact email is being set up for this project. In the meantime, use the
          channels noted below. We won&apos;t publish a placeholder address that doesn&apos;t
          work.
        </p>
      )}

      {siteConfig.author.linkedin && (
        <p>
          <a href={siteConfig.author.linkedin} rel="noopener noreferrer me" target="_blank">
            Professional profile on LinkedIn
          </a>
        </p>
      )}

      <h2>General inquiries</h2>
      <p>
        Questions about the project, partnership opportunities or general feedback about the
        site.
      </p>

      <h2>Calculation errors</h2>
      <p>
        This is the highest-priority category. Include:
      </p>
      <ul className="checklist">
        <li>The tool name and URL.</li>
        <li>The inputs you entered.</li>
        <li>The result the tool gave you.</li>
        <li>The result you expected and why — with a reference or source if possible.</li>
      </ul>
      <p>
        Corrections to calculation engines are addressed before new tools are published.
      </p>

      <h2>Content corrections</h2>
      <p>
        If a formula explanation, assumption, limitation, FAQ answer or reference on a tool page
        is wrong or unclear, include the page URL and the specific claim.
      </p>

      <h2>Tool suggestions</h2>
      <p>
        We build tools that solve real, recurring technical problems. If you suggest a tool,
        explain the problem it should solve and why existing tools — here or elsewhere — fall
        short. Suggestions backed by a concrete use case are far more likely to result in a
        published tool.
      </p>

      <h2>Technical problems</h2>
      <p>
        If something is broken — a calculator produces an error, a page does not load, a form
        does not work — include the page URL, your browser and device, and what happened.
      </p>

      <h2>Privacy requests</h2>
      <p>
        Access, correction, deletion, objection or consent questions — see the{" "}
        <Link href="/privacy">Privacy Policy</Link> for your rights. We don&apos;t retain
        databases of personal data, so most requests concern data held by hosting or advertising
        providers, and we&apos;ll help route them appropriately.
      </p>

      <h2>Accessibility problems</h2>
      <p>
        See the <Link href="/accessibility">Accessibility statement</Link> — accessibility
        issues are prioritized alongside calculation errors.
      </p>

      <h2>What we don&apos;t offer</h2>
      <ul className="checklist">
        <li>
          Engineering consultation, project review or code-compliance sign-off — the tools and
          content are for reference only (see the <Link href="/disclaimer">Disclaimer</Link>).
        </li>
        <li>
          Paid placements inside tools; results are never influenced by advertisers (see the{" "}
          <Link href="/advertising">Advertising Disclosure</Link>).
        </li>
      </ul>

      {email && <p>We usually reply within 2–3 business days.</p>}
    </article>
  );
}
