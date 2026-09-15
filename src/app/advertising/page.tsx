import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: `Advertising Disclosure — ${siteConfig.name}`,
  description:
    "How IngCalc is funded: display advertising through Google AdSense, third-party ads, consent-based personalization and editorial independence.",
  path: "/advertising",
  noindex: true,
});

export default function AdvertisingPage() {
  const adsActive = Boolean(siteConfig.adsense.client);

  return (
    <article className="legal-page">
      <h1>Advertising Disclosure</h1>
      <p className="updated">Last updated: {siteConfig.legalLastUpdated.advertising}</p>

      <h2>How this site is funded</h2>
      <p>
        IngCalc is free to use and funded by display advertising. There are no paid subscriptions,
        premium tiers or paid placements inside tools.
      </p>

      <h2>Advertising partners</h2>
      <p>
        {adsActive ? (
          <>
            This site displays advertising through <strong>Google AdSense</strong>. Google and its
            certified partners may serve some of the ads you see.
          </>
        ) : (
          <>
            This site uses <strong>Google AdSense</strong> as its advertising platform. Depending on
            the current configuration, ads may or may not be live at any given moment; when they
            are, Google and its certified partners may serve them.
          </>
        )}
      </p>

      <h2>What this means for you</h2>
      <ul className="checklist">
        <li>
          Third-party vendors and ad networks may serve ads and use advertising technologies
          (cookies and similar mechanisms) subject to your consent where required by law.
        </li>
        <li>
          Whether ads are personalized depends on your consent choice and your settings — see the{" "}
          <Link href="/privacy">Privacy Policy</Link> and{" "}
          <Link href="/consent-preferences">Consent Preferences</Link>.
        </li>
        <li>
          We do not control which specific ads appear. An ad on this site is not an endorsement by
          IngCalc of the advertised product or service.
        </li>
        <li>
          Advertisers have no influence over calculation methods, tool content or editorial
          decisions. Results are never adjusted to favor anyone.
        </li>
      </ul>

      <h2>What we do not do</h2>
      <ul className="checklist">
        <li>We do not place ads in a way that can be confused with tool content or results.</li>
        <li>We do not incentivize clicking ads, and we never ask you to click them.</li>
        <li>We do not accept paid product placements inside calculators.</li>
      </ul>

      <p>
        Questions about advertising? See <Link href="/contact">Contact</Link>.
      </p>
    </article>
  );
}
