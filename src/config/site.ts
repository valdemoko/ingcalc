/**
 * Single source of truth for the site identity, ownership and integrations.
 * Rebranding / ownership changes = edit this file only.
 *
 * No personal data is invented: fields without a real provided value stay
 * empty and the UI degrades gracefully (e.g. LinkedIn link hidden, contact
 * page shows a notice). Fill the env vars below — never hardcode personal
 * data here directly.
 */
export const siteConfig = {
  name: "IngCalc",
  tagline: "Free technical calculators and engineering tools",
  description:
    "Free, accurate technical calculators for electrical, HVAC, mechanical, solar and engineering work. Clear formulas, worked examples and honest limitations.",

  /** No trailing slash. Override with NEXT_PUBLIC_SITE_URL in production. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://ingcalc.example.com").replace(/\/$/, ""),
  locale: "en_US",

  /** Owner / author. Display name is fixed; the profile URL comes from env. */
  author: {
    name: "Miguel Iglesias Valenzuela",
    /** LinkedIn profile URL. Set NEXT_PUBLIC_AUTHOR_LINKEDIN — empty = link hidden everywhere. */
    linkedin: process.env.NEXT_PUBLIC_AUTHOR_LINKEDIN || "",
  },

  /** Contact email. Set NEXT_PUBLIC_CONTACT_EMAIL — empty = contact page shows a notice. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",

  adsense: {
    /** Publisher ID, e.g. ca-pub-1234567890123456. Empty = ads fully disabled. */
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
    /** Google-certified CMP script URL (e.g. CookieYes) for EEA consent. Empty = disabled. */
    cmpSrc: process.env.NEXT_PUBLIC_CMP_SRC || "",
  },

  analytics: {
    /** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). Empty = analytics disabled. */
    ga4: process.env.NEXT_PUBLIC_GA4_ID || "",
    /** Google Search Console verification content. Empty = no meta tag. */
    searchConsole: process.env.NEXT_PUBLIC_SC_VERIFICATION || "",
  },

  /** Centralized "Last updated" dates for legal pages (update when a policy materially changes). */
  legalLastUpdated: {
    privacy: "September 15, 2026",
    cookies: "September 15, 2026",
    terms: "September 15, 2026",
    disclaimer: "September 15, 2026",
    advertising: "September 15, 2026",
    accessibility: "September 15, 2026",
  },

  foundedYear: 2026,
} as const;

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Registry of every institutional/legal page — footer, audits and sitemap all read this. */
export const INSTITUTIONAL_PAGES = [
  { path: "/about", label: "About IngCalc", indexable: true },
  { path: "/about/author", label: "About the Author", indexable: true },
  { path: "/contact", label: "Contact", indexable: true },
  { path: "/accessibility", label: "Accessibility", indexable: false },
  { path: "/privacy", label: "Privacy Policy", indexable: false },
  { path: "/cookies", label: "Cookie Policy", indexable: false },
  { path: "/terms", label: "Terms of Use", indexable: false },
  { path: "/disclaimer", label: "Disclaimer", indexable: false },
  { path: "/advertising", label: "Advertising Disclosure", indexable: false },
  { path: "/consent-preferences", label: "Consent Preferences", indexable: false },
] as const;

/** The current year, computed once per render — never hardcoded. */
export function currentYear(): number {
  return new Date().getFullYear();
}
