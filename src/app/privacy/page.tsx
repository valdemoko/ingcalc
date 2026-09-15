import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Privacy Policy — ${siteConfig.name}`,
  description:
    "IngCalc privacy policy: what data the site and its advertising partners process, local storage, Google AdSense disclosures, and your GDPR/UK/CCPA rights.",
  path: "/privacy",
  noindex: true,
});

// Official Google resources — verified public policy URLs only.
const GOOGLE_PARTNER_DATA_URL =
  "https://policies.google.com/technologies/partner-sites";
const GOOGLE_ADS_URL = "https://policies.google.com/technologies/ads";
const GOOGLE_ADS_SETTINGS_URL = "https://adssettings.google.com";

export default function PrivacyPage() {
  const cmpConfigured = Boolean(siteConfig.adsense.cmpSrc);
  const adsActive = Boolean(siteConfig.adsense.client);
  const email = siteConfig.contactEmail;

  return (
    <article className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.privacy}</p>

      <h2>Who is responsible</h2>
      <p>
        This site is created and maintained by {siteConfig.author.name}. Privacy requests and any
        other enquiries go through the <Link href="/contact">contact page</Link>
        {email ? (
          <> or directly to <a href={`mailto:${email}`}>{email}</a>.</>
        ) : (
          "."
        )}
      </p>

      <h2>Summary</h2>
      <ul className="checklist">
        <li>All calculators run entirely in your browser. The values you enter are never sent to, stored on or associated with our servers.</li>
        <li>We set no analytics or tracking cookies. The only storage we set ourselves is your consent choice (in your browser&rsquo;s local storage).</li>
        <li>Advertising is our only third-party data processing. Where ads are active and you consent, Google AdSense and its partners may use cookies and similar technologies as described below.</li>
      </ul>

      <h2>What we process</h2>
      <h3>Data you enter in calculators</h3>
      <p>
        Nothing. Calculation happens locally in JavaScript on your device. Inputs are not
        transmitted, logged or stored anywhere.
      </p>

      <h3>Technical data (server logs)</h3>
      <p>
        Like essentially all websites, our hosting provider records standard request logs: IP
        address, browser user agent, requested URL and timestamp. These are used for security,
        abuse prevention and debugging, and are retained only for a short period by the hosting
        provider. We do not use them to profile you.
      </p>

      <h3>Local storage</h3>
      <p>
        We store one item in your browser&rsquo;s local storage: <code>ingcalc-consent-v1</code>,
        your cookie consent choice, so we don&rsquo;t show the consent banner repeatedly. It
        contains no personal data. You can clear it any time via your browser (&ldquo;clear site
        data&rdquo;) and the banner will simply ask again.
      </p>

      <h3>Contact by email</h3>
      <p>
        If you email us, we process what you send us (address and message) solely to respond and to
        fix reported issues. We don&rsquo;t add you to mailing lists.
      </p>

      <h2>Advertising and Google AdSense</h2>
      <p>
        {adsActive
          ? "This site displays advertising through Google AdSense."
          : "This site uses Google AdSense as its advertising platform. Depending on the current configuration and your consent, ads may be displayed."}{" "}
        The following applies whenever ad serving is active:
      </p>
      <ul className="checklist">
        <li>Google and its partners may use cookies or similar technologies to serve and measure ads.</li>
        <li>They may read or store information in your browser, and use identifiers or device/browser attributes (IP address, user agent) for ad delivery and measurement.</li>
        <li>Whether advertising is personalized depends on your consent and settings: in the EEA, UK and Switzerland, personalized ads require your consent first; without consent, ads (if shown) are non-personalized.</li>
        <li>Google may use collected data to tailor advertising to this and other partner sites, as described in Google&rsquo;s own policy.</li>
      </ul>
      <p>
        How Google uses data from sites and apps that use its partners&rsquo; services:{" "}
        <a href={GOOGLE_PARTNER_DATA_URL} rel="noopener noreferrer" target="_blank">
          policies.google.com/technologies/partner-sites
        </a>
        . Google&rsquo;s advertising policies and controls:{" "}
        <a href={GOOGLE_ADS_URL} rel="noopener noreferrer" target="_blank">
          policies.google.com/technologies/ads
        </a>
        . You can also opt out of personalized ads in{" "}
        <a href={GOOGLE_ADS_SETTINGS_URL} rel="noopener noreferrer" target="_blank">
          Google Ads Settings
        </a>
        .
      </p>

      <h2>Consent management (EEA / UK / Switzerland)</h2>
      <p>
        {cmpConfigured
          ? "This site uses a Google-certified consent management platform (CMP) to obtain and record your consent choices, including for personalized advertising, in accordance with Google's EU user consent policy."
          : "Where required by law, we present a consent banner before enabling advertising-related storage, and honor a rejection by serving no personalized ads. A Google-certified CMP integration is prepared and will replace the built-in banner as EEA/UK traffic scales."}
      </p>

      <h2>Analytics</h2>
      <p>
        No analytics tool is currently installed. If we enable one in the future, it will load only
        after consent where required, and this policy will be updated before it goes live.
      </p>

      <h2>International transfers</h2>
      <p>
        Our hosting and Google&rsquo;s infrastructure may process data outside your country. Where
        applicable, providers rely on recognized safeguards (such as the EU Standard Contractual
        Clauses) for international transfers.
      </p>

      <h2>Your rights</h2>
      <p>Depending on your jurisdiction (including GDPR/UK GDPR and CCPA/CPRA), you may have the right to:</p>
      <ul className="checklist">
        <li>Access the personal data we hold about you.</li>
        <li>Rectify or delete it.</li>
        <li>Object to or restrict processing, including personalized advertising.</li>
        <li>Withdraw consent at any time (via <Link href="/consent-preferences">Consent Preferences</Link> or your browser settings).</li>
        <li>Data portability where technically applicable.</li>
        <li>Lodge a complaint with your supervisory authority.</li>
      </ul>
      <p>
        To exercise a right, contact us via the <Link href="/contact">contact page</Link>. We don&rsquo;t
        retain databases of personal data, so most requests will concern data held by our
        advertising or hosting providers, which we will help direct appropriately.
      </p>

      <h2>Children</h2>
      <p>
        This site is a professional/technical resource and is not directed at children under 13 (or
        under 16 in the EEA). We do not knowingly collect children&rsquo;s data.
      </p>

      <h2>Security</h2>
      <p>
        The site is served over HTTPS. Because calculators run client-side and we store almost no
        data, the attack surface is minimal by design.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        Material changes will be reflected in the &ldquo;last updated&rdquo; date above. See also
        the <Link href="/cookies">Cookie Policy</Link> and{" "}
        <Link href="/advertising">Advertising Disclosure</Link>.
      </p>
    </article>
  );
}
