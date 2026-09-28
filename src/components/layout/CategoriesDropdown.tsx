"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIVE_CATEGORIES } from "@/lib/categories";

export function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [open]);

  return (
    <div className="nav-dropdown" ref={root}>
      <button
        className={`nav-drop-btn${open ? " open" : ""}`}
        type="button"
        aria-expanded={open}
        aria-controls="category-menu"
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>(".nav-drop-panel a")?.focus());
          }
        }}
      >
        Categories
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div id="category-menu" className={`nav-drop-panel${open ? " open" : ""}`} aria-hidden={!open} inert={!open}>
        <p className="menu-group-label">Engineering disciplines</p>
        {LIVE_CATEGORIES.map((category) => (
          <Link key={category.key} href={category.path} onClick={() => setOpen(false)}>
            <span className="nav-drop-name">{category.name}</span>
            <span className="nav-drop-hint">{category.path.replace("/tools/", "")}</span>
          </Link>
        ))}
        <div className="nav-drop-footer">
          <Link href="/tools" onClick={() => setOpen(false)}>Browse all calculators</Link>
        </div>
      </div>
    </div>
  );
}
