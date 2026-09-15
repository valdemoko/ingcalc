import Script from "next/script";
import { siteConfig } from "@/config/site";

/**
 * AdSense integration — disabled until NEXT_PUBLIC_ADSENSE_CLIENT is set.
 * The AdSense script only loads via the consent-gated component in layout.tsx;
 * slots render reserved space (no layout shift) with a clear label.
 */
export function AdSlot({
  slotId,
  format = "auto",
  minHeight = 100,
  label = "Advertisement",
}: {
  slotId: string;
  format?: string;
  minHeight?: number;
  label?: string;
}) {
  const client = siteConfig.adsense.client;
  if (!client || !slotId) return null;

  return (
    <aside className="ad-slot" aria-label={label}>
      <span className="ad-label">{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <Script id={`adsbygoogle-init-${slotId}`} strategy="lazyOnload">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </aside>
  );
}
