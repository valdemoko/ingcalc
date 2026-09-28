"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GUIDE_CATEGORY_KEYS, LIVE_CATEGORIES } from "@/lib/categories";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="mobile-navigation">
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>
      <nav id="mobile-menu" className={`mobile-menu${open ? " open" : ""}`} aria-label="Mobile navigation" aria-hidden={!open} inert={!open}>
        <Link href="/tools" onClick={close}>All tools <span>Browse the full directory</span></Link>
        <p className="menu-group-label">Engineering categories</p>
        {LIVE_CATEGORIES.map((category) => (
          <Link key={category.key} href={category.path} onClick={close}>
            {category.name}<span>{category.path.replace("/tools/", "")}</span>
          </Link>
        ))}
        <p className="menu-group-label">Project</p>
        {LIVE_CATEGORIES.filter((category) => GUIDE_CATEGORY_KEYS.includes(category.key)).map((category) => (
          <Link key={`${category.key}-guide`} href={`${category.path}/guide`} onClick={close}>
            {category.name} guide
          </Link>
        ))}
        <Link href="/about" onClick={close}>About IngCalc</Link>
      </nav>
      {open && <button type="button" className="mobile-menu-backdrop" aria-label="Close navigation menu" onClick={close} />}
    </div>
  );
}
