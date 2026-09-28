import Link from "next/link";
import { siteConfig, currentYear } from "@/config/site";
import { BrandMark } from "@/components/layout/BrandMark";
import { GUIDE_CATEGORY_KEYS, LIVE_CATEGORIES } from "@/lib/categories";
import { ConsentTrigger } from "@/components/consent/ConsentTrigger";
import { CategoriesDropdown } from "@/components/layout/CategoriesDropdown";
import { MobileMenu } from "@/components/layout/MobileMenu";

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
      <div className="header-inner">
        <Link href="/" className="brand" aria-label={`${siteConfig.name} — home`}>
          <BrandMark size={24} />
          Ing<span>Calc</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <Link href="/tools">Tools</Link>
          <CategoriesDropdown />
          <Link href="/tools/mechanical/guide">Guides</Link>
          <Link href="/about">About</Link>
        </nav>
        <MobileMenu />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand footer-col">
          <Link href="/" className="brand">
            <BrandMark size={22} />
            Ing<span>Calc</span>
          </Link>
          <p>Professional engineering calculators and reference tools. Clear methods, traceable formulas, practical context.</p>
        </div>

        <FooterCol title="Tools">
          <li><Link href="/tools">All calculators</Link></li>
          {LIVE_CATEGORIES.map((category) => (
            <li key={category.key}><Link href={category.path}>{category.name}</Link></li>
          ))}
        </FooterCol>

        <FooterCol title="Resources">
          {LIVE_CATEGORIES.filter((category) => GUIDE_CATEGORY_KEYS.includes(category.key)).map((category) => (
            <li key={category.key}><Link href={`${category.path}/guide`}>{category.name} guide</Link></li>
          ))}
          <li><Link href="/accessibility">Accessibility</Link></li>
        </FooterCol>

        <FooterCol title="Project">
          <li><Link href="/about">About IngCalc</Link></li>
          <li><Link href="/about/author">About the author</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          {siteConfig.author.linkedin && (
            <li><a href={siteConfig.author.linkedin} rel="noopener noreferrer me" target="_blank">LinkedIn profile</a></li>
          )}
        </FooterCol>

        <FooterCol title="Legal">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/cookies">Cookies</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/disclaimer">Disclaimer</Link></li>
          <li><Link href="/advertising">Advertising disclosure</Link></li>
          <li><ConsentTrigger>Consent preferences</ConsentTrigger></li>
        </FooterCol>

        <div className="footer-note">
          <p>© {currentYear()} {siteConfig.name}. Created and maintained by {siteConfig.author.name}.</p>
        </div>
      </div>
    </footer>
  );
}
