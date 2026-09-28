"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIVE_CATEGORIES } from "@/lib/categories";

/**
 * Desktop dropdown for category navigation (visible ≥900px).
 * Opens on hover or click, closes on Escape/outside click, arrow-key navigable.
 */
export function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div
      className="nav-dropdown"
      ref={ref}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`nav-drop-btn${open ? " open" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Categories
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={`nav-drop-panel${open ? " open" : ""}`} role="menu" aria-label="Categories">
        {LIVE_CATEGORIES.map((c) => (
          <Link key={c.key} href={c.path} role="menuitem" onClick={() => setOpen(false)}>
            <span className="nav-drop-name">{c.name}</span>
            <span className="nav-drop-hint">{c.path.replace("/tools/", "")}</span>
          </Link>
        ))}
        <div className="nav-drop-footer">
          <Link href="/tools" role="menuitem" onClick={() => setOpen(false)}>
            All tools →
          </Link>
        </div>
      </div>
    </div>
  );
}
