import Link from "next/link";
import { siteConfig, currentYear } from "@/config/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { ConsentTrigger } from "@/components/consent/ConsentTrigger";

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav className="footer-col" aria-label={title}>
      <h3>{title}</h3>
      <ul>{children}</ul>
    </nav>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand">
          <BrandMark size={24} />
          Ing<span>Calc</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <Link href="/tools">All tools</Link>
          {LIVE_CATEGORIES.map((c) => (
            <Link key={c.key} href={c.path}>
              {c.name.replace(" & Climate", "").replace(" Engineering", "").replace(", Energy & Batteries", "")}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-brand footer-col">
          <Link href="/" className="brand">
            <BrandMark size={22} />
            Ing<span>Calc</span>
          </Link>
          <p>
            Professional technical calculators, engineering tools and reference resources — every
            tool documents its formula, assumptions and limitations.
          </p>
        </div>

        <FooterCol title="Tools">
          <li><Link href="/tools">All Tools</Link></li>
          {LIVE_CATEGORIES.map((c) => (
            <li key={c.key}>
              <Link href={c.path}>{c.name}</Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="Resources">
          <li><Link href="/tools">Tool Directory</Link></li>
          {LIVE_CATEGORIES.map((c) => (
            <li key={c.key}>
              <Link href={`${c.path}/guide`}>{c.name} Guide</Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="About">
          <li><Link href="/about">About IngCalc</Link></li>
          <li><Link href="/about/author">About the Author</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/accessibility">Accessibility</Link></li>
        </FooterCol>

        <FooterCol title="Legal">
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><Link href="/cookies">Cookie Policy</Link></li>
          <li><Link href="/terms">Terms of Use</Link></li>
          <li><Link href="/disclaimer">Disclaimer</Link></li>
          <li><Link href="/advertising">Advertising Disclosure</Link></li>
          <li><ConsentTrigger>Consent Preferences</ConsentTrigger></li>
        </FooterCol>

        {siteConfig.author.linkedin && (
          <FooterCol title="Professional">
            <li>
              <a href={siteConfig.author.linkedin} rel="noopener noreferrer me" target="_blank">
                LinkedIn profile
              </a>
            </li>
          </FooterCol>
        )}

        <div className="footer-note">
          <p>
            © {currentYear()} {siteConfig.name}. All rights reserved. Created and maintained by{" "}
            {siteConfig.author.name}.
          </p>
        </div>
      </div>
    </footer>
  );
}
