"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useConsent } from "@/components/consent/ConsentBanner";

/**
 * Footer link that reopens the consent banner via the ConsentManager context.
 * Falls back to a link to /consent-preferences when no decision is tracked
 * yet (server render) — the context hydrates and takes over on click.
 */
export function ConsentTrigger({ children }: { children: ReactNode }) {
  const { decision, reopen } = useConsent();

  return (
    <button type="button" className="footer-link-btn" onClick={reopen} data-consent-state={decision ?? "unset"}>
      {children}
    </button>
  );
}

/** Server-safe link to the standalone consent preferences page. */
export function ConsentPreferencesLink({ children }: { children: ReactNode }) {
  return <Link href="/consent-preferences">{children}</Link>;
}
