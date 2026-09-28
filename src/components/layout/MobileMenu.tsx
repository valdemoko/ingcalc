"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LIVE_CATEGORIES } from "@/lib/categories";

/**
 * Mobile navigation drawer (visible <900px via .menu-toggle).
 * Client component only because of menu open state.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          {open ? (
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <nav
        id="mobile-menu"
        className={`mobile-menu${open ? " open" : ""}`}
        aria-label="Mobile"
        aria-hidden={!open}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          <li>
            <Link href="/tools" onClick={() => setOpen(false)}>
              All tools
            </Link>
          </li>
          <li className="menu-group-label" aria-hidden="true">
            Categories
          </li>
          {LIVE_CATEGORIES.map((c) => (
            <li key={c.key}>
              <Link href={c.path} onClick={() => setOpen(false)}>
                {c.name}
              </Link>
            </li>
          ))}
          <li className="menu-group-label" aria-hidden="true">
            Project
          </li>
          <li>
            <Link href="/about" onClick={() => setOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
