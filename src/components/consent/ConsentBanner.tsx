"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Script from "next/script";
import { siteConfig } from "@/config/site";

const KEY = "ingcalc-consent-v1";
type Decision = "accepted" | "rejected";

interface ConsentState {
  /** Current stored decision, or null if the user hasn't chosen yet. */
  decision: Decision | null;
  /** Open the consent banner again (footer "Consent Preferences" link). */
  reopen: () => void;
}

const ConsentContext = createContext<ConsentState>({ decision: null, reopen: () => {} });

/** Read the current consent decision outside React (footer server-safe helpers can't; use the hook). */
export function useConsent(): ConsentState {
  return useContext(ConsentContext);
}

/**
 * The single consent system for the whole site.
 *
 * - With NEXT_PUBLIC_CMP_SRC set: loads the Google-certified CMP, which owns
 *   the banner and consent storage. The fallback UI and this context stay out
 *   of the way (reopen() is a no-op; the CMP provides its own reopening).
 * - Without a CMP: renders the minimal banner and stores the decision in
 *   localStorage. The footer "Consent Preferences" link reopens it via context.
 */
export function ConsentManager({ children }: { children?: ReactNode }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [cmpConfigured, setCmpConfigured] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored === "accepted" || stored === "rejected") setDecision(stored);
    } catch {
      /* storage unavailable */
    }
    setCmpConfigured(Boolean(siteConfig.adsense.cmpSrc));
  }, []);

  // Certified CMP integration: load the vendor script, which handles consent itself.
  // The app still renders inside the provider so consent-gated scripts can mount.
  if (cmpConfigured) {
    return (
      <ConsentContext.Provider value={{ decision: null, reopen: () => {} }}>
        {children}
        <Script src={siteConfig.adsense.cmpSrc} strategy="afterInteractive" />
      </ConsentContext.Provider>
    );
  }

  const choose = (value: Decision) => {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* storage unavailable */
    }
    setDecision(value);
    setBannerOpen(false);
  };

  const reopen = () => setBannerOpen(true);
  const showBanner = bannerOpen || decision === null;

  return (
    <ConsentContext.Provider value={{ decision, reopen }}>
      {children}
      {showBanner && (
        <div className="consent-banner" role="dialog" aria-label="Cookie consent" aria-modal="false">
          <div className="container">
            <p>
              We use cookies for advertising. Calculators run entirely in your browser and set no
              cookies. See our <Link href="/cookies">Cookie Policy</Link>.
            </p>
            <div className="actions">
              <button className="btn btn-secondary" onClick={() => choose("rejected")}>
                Reject
              </button>
              <button className="btn" onClick={() => choose("accepted")}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}
