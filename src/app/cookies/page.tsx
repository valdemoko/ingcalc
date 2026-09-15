import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Cookie Policy — ${siteConfig.name}`,
  description:
    "IngCalc cookie policy: the one storage item we set, what Google AdSense may set when ads are active, and how to change or withdraw consent.",
  path: "/cookies",
  noindex: true,
});

const GOOGLE_ADS_URL = "https://policies.google.com/technologies/ads";
const GOOGLE_ADS_SETTINGS_URL = "https://adssettings.google.com";
const GOOGLE_PARTNER_DATA_URL = "https://policies.google.com/technologies/partner-sites";

export default function CookiesPage() {
  const cmpConfigured = Boolean(siteConfig.adsense.cmpSrc);
  const adsActive = Boolean(siteConfig.adsense.client);

  return (
    <article className="legal-page">
      <h1>Cookie Policy</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.cookies}</p>

      <h2>What cookies are</h2>
      <p>
        Cookies are small pieces of data a website stores in your browser. &ldquo;Local
        storage&rdquo; is a related browser mechanism that serves the same purpose. Neither is
        needed for this site&rsquo;s calculators to work — all math runs in your browser either way.
      </p>

      <h2>What we set ourselves</h2>
      <ul className="checklist">
        <li>
          <code>ingcalc-consent-v1</code> — <strong>local storage</strong>, strictly necessary.
          Stores your consent choice (<code>accepted</code> or <code>rejected</code>) so the consent
          banner doesn&rsquo;t reappear on every page. Contains no personal data, no identifiers,
          and never expires until you clear it.
        </li>
      </ul>
      <p>
        That is the complete list. We set no analytics cookies, no functional cookies and no
        tracking of any kind ourselves. If we ever add analytics, this page will be updated{" "}
        <em>before</em> that goes live.
      </p>

      <h2>What advertising partners may set</h2>
      <p>
        {adsActive
          ? "Advertising is active on this site through Google AdSense."
          : "This site uses Google AdSense as its advertising platform; whether ads are live depends on the current configuration and your consent."}{" "}
        When ad serving is active and you have consented where required:
      </p>
      <ul className="checklist">
        <li>
          Google and its certified partners may set cookies and use similar technologies to deliver,
          cap-frequency and measure advertising. The specific cookies are set by Google&rsquo;s
          domains, vary over time, and are documented by Google — we don&rsquo;t set or control
          them, so we won&rsquo;t invent a table of names here.
        </li>
        <li>
          Details:{" "}
          <a href={GOOGLE_ADS_URL} rel="noopener noreferrer" target="_blank">
            Google&rsquo;s advertising policies
          </a>{" "}
          and{" "}
          <a href={GOOGLE_PARTNER_DATA_URL} rel="noopener noreferrer" target="_blank">
            how Google uses data on partner sites
          </a>
          .
        </li>
        <li>
          If you reject consent, personalized advertising is disabled; any ads shown are
          non-personalized and Google&rsquo;s use of identifiers for personalization is restricted
          accordingly.
        </li>
      </ul>

      <h2>Managing your choices</h2>
      <ul className="checklist">
        <li>
          Change or withdraw consent at any time on the{" "}
          <Link href="/consent-preferences">Consent Preferences</Link> page or via the
          &ldquo;Consent Preferences&rdquo; link in the footer.
        </li>
        {cmpConfigured && (
          <li>
            This site uses a certified CMP — its cookie settings panel controls advertising
            consent in detail.
          </li>
        )}
        <li>
          Block or delete cookies in your browser settings. Clearing this site&rsquo;s data removes
          our consent item and the banner will simply ask again.
        </li>
        <li>
          Opt out of Google personalized ads across sites at{" "}
          <a href={GOOGLE_ADS_SETTINGS_URL} rel="noopener noreferrer" target="_blank">
            adssettings.google.com
          </a>{" "}
          or, in the EU,{" "}
          <a href="https://www.youronlinechoices.com" rel="noopener noreferrer" target="_blank">
            youronlinechoices.com
          </a>
          .
        </li>
      </ul>

      <p>
        See the <Link href="/privacy">Privacy Policy</Link> for the full data picture and your
        rights.
      </p>
    </article>
  );
}
