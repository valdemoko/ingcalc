import type { Metadata } from "next";

// Client pages can't export metadata; this segment layout applies noindex
// (the consent UI is a functional page, not search content).
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ConsentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
