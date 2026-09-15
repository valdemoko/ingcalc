"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useEffect } from "react";
import { useConsent } from "@/components/consent/ConsentBanner";
import { siteConfig } from "@/config/site";

// Client page: metadata is set via layout-level fallback; we set the document title directly
// because generateMetadata is not available in client components.
export default function ConsentPreferencesPage() {
  const { decision, reopen } = useConsent();
  const cmpConfigured = Boolean(siteConfig.adsense.cmpSrc);

  useEffect(() => {
    document.title = `Consent Preferences — ${siteConfig.name}`;
  }, []);

  useEffect(() => {
    // When the page opens with no decision and no CMP, surface the banner immediately.
    if (!cmpConfigured && decision === null) reopen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <article className="legal-page">
      <h1>Consent Preferences</h1>
      <p>
        This page lets you review and change your cookie and advertising consent at any time. Your
        choice affects whether personalized ads are shown on this site.
      </p>

      {cmpConfigured ? (
        <>
          <h2>Change your preferences</h2>
          <p>
            This site uses a certified consent management platform. To review or change your
            choices, open the cookie settings provided by the consent banner, or clear this
            site&rsquo;s cookies in your browser to be asked again on your next visit.
          </p>
        </>
      ) : (
        <>
          <h2>Your current choice</h2>
          <p>
            {decision === "accepted" && "You have accepted cookies for advertising (personalized ads allowed)."}
            {decision === "rejected" && "You have rejected non-essential cookies. Ads, when shown, are non-personalized."}
            {decision === null && "You haven't made a choice yet — the consent banner should be open now."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "16px 0" }}>
            <button type="button" className="btn" onClick={reopen}>
              Open consent banner
            </button>
          </div>
          <p className="updated">
            Note: if you cleared this site&rsquo;s data, the banner will appear automatically on
            your next visit.
          </p>
        </>
      )}

      <h2>What each choice means</h2>
      <ul className="checklist">
        <li><strong>Accept:</strong> advertising partners may use cookies and similar technologies, including for personalized advertising.</li>
        <li><strong>Reject:</strong> only strictly necessary storage is used; advertising, when shown, is non-personalized.</li>
      </ul>
      <p>
        Calculators run entirely in your browser and are never affected by your consent choice. See
        the <Link href="/cookies">Cookie Policy</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link> for details.
      </p>
    </article>
  );
}
