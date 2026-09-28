"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { getCategory } from "@/lib/categories";
import type { SearchItem } from "@/lib/search";

export function SearchBox({ items, placeholder = "Search engineering calculators…" }: { items: readonly SearchItem[]; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return items
      .map((item) => {
        const category = getCategory(item.category).name;
        const nameMatch = item.name.toLocaleLowerCase().includes(term);
        const descriptionMatch = item.description.toLocaleLowerCase().includes(term);
        const categoryMatch = category.toLocaleLowerCase().includes(term);
        const rank = nameMatch ? 0 : descriptionMatch ? 1 : categoryMatch ? 2 : 3;
        return { item, category, rank };
      })
      .filter((result) => result.rank < 3)
      .sort((left, right) => left.rank - right.rank || left.item.name.localeCompare(right.item.name))
      .slice(0, 10);
  }, [items, query]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setSelected((index) => results.length ? Math.min(results.length - 1, Math.max(index + 1, 0)) : -1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" && open && results[selected]) {
      event.preventDefault();
      window.location.assign(results[selected].item.path);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="search-box">
      <form className="search-form" role="search" aria-label="Calculator search" onSubmit={(event) => event.preventDefault()}>
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
          role="combobox"
          aria-label="Search calculators"
          aria-expanded={open}
          aria-controls="search-panel"
          aria-autocomplete="list"
          aria-activedescendant={selected >= 0 && results[selected] ? `search-item-${selected}` : undefined}
          placeholder={placeholder}
          value={query}
          onKeyDown={onKeyDown}
          onChange={(event) => { setQuery(event.target.value); setSelected(-1); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        />
      </form>
      {open && query.trim() && (
        <div id="search-panel" className="search-panel">
          {results.length ? (
            <div className="search-results" role="listbox" aria-label="Matching calculators">
              {results.map(({ item, category }, index) => (
                <Link
                  key={item.slug}
                  id={`search-item-${index}`}
                  role="option"
                  aria-selected={index === selected}
                  href={item.path}
                  className={`search-result${index === selected ? " selected" : ""}`}
                  onMouseEnter={() => setSelected(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setOpen(false)}
                >
                  <span className="search-result-name">{item.name}</span>
                  <span className="search-result-cat">{category}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="search-empty">No calculators match “{query}”. Try a tool name or category.</p>
          )}
        </div>
      )}
      <p className="search-hint">Find a calculation by name, application or engineering discipline.</p>
    </div>
  );
}
