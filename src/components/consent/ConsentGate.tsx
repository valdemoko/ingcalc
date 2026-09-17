"use client";

import { type ReactNode } from "react";
import { useConsent } from "./ConsentBanner";
import { siteConfig } from "@/config/site";

/**
 * Renders `children` (ad/analytics scripts) only after a valid consent signal.
 *
 * - With a Google-certified CMP configured (NEXT_PUBLIC_CMP_SRC): the CMP is
 *   the single source of truth for consent and owns script blocking; the gate
 *   defers to it.
 * - With the built-in banner: scripts render only when the user explicitly
 *   chose "accepted" (persisted in localStorage). "rejected" or undecided
 *   (first visit) → nothing renders and no script is loaded.
 * - AdSense/analytics disabled (env unset): the layout never passes those
 *   scripts in, so nothing loads regardless of consent.
 */
export function ConsentGate({ children }: { children: ReactNode }) {
  if (siteConfig.adsense.cmpSrc) {
    return <>{children}</>;
  }

  const { decision } = useConsent();
  if (decision !== "accepted") return null;
  return <>{children}</>;
}
