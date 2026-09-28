"use client";

import { useState, useEffect, useRef, useMemo, type KeyboardEvent } from "react";
import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { SearchItem } from "@/lib/search";

interface SearchBoxProps {
  placeholder?: string;
  items: readonly SearchItem[];
}

export function SearchBox({ placeholder = "Search tools…", items }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return items
      .map((t) => {
        const catName = getCategory(t.category).name.toLowerCase();
        const hitName = t.name.toLowerCase().includes(q);
        const hitDesc = t.description.toLowerCase().includes(q);
        const hitCat = catName.includes(q);
        const rank = (hitName ? 0 : 1) + (hitDesc ? 0 : 2) + (hitCat ? 0 : 1);
        return { item: t, catName, rank };
      })
      .filter((r) => r.rank < 4)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 12);
  }, [items, query]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  // Close on outside click and Escape.
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setSelected((s) => Math.min(results.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter" && open && results[selected]) {
      e.preventDefault();
    }
  };

  return (
    <div className="search-box" ref={boxRef}>
      <form
        className="search-form"
        onSubmit={(e) => e.preventDefault()}
        role="search"
        aria-label="Tool search"
      >
        <span className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={open}
          aria-controls="search-panel"
          aria-autocomplete="list"
          aria-activedescendant={results.length ? `search-item-${selected}` : undefined}
          aria-label="Search calculators"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        <span className="search-kbd" aria-hidden="true">
          /
        </span>
      </form>

      {open && (
        <div id="search-panel" ref={panelRef} className="search-panel">
          {!query.trim() ? (
            <div className="search-hint">
              <span>Try a tool, a variable, or a category.</span>
              <span className="search-hint-sub">
                voltage drop · duct size · gear ratio · battery runtime
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p>No tools match “{query}”.</p>
            </div>
          ) : (
            <div className="search-results" role="listbox" aria-label="Search results">
              {results.map((r, i) => (
                <Link
                  key={r.item.slug}
                  id={`search-item-${i}`}
                  role="option"
                  aria-selected={i === selected}
                  href={r.item.path}
                  className={`search-result${i === selected ? " selected" : ""}`}
                  onMouseEnter={() => setSelected(i)}
                  onClick={() => setOpen(false)}
                >
                  <span className="search-result-name">{r.item.name}</span>
                  <span className="search-result-cat">{r.catName}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
