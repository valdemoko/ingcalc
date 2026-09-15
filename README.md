# IngCalc

Free, technically rigorous online calculators for electrical, HVAC, mechanical
and solar engineering. Built with **Next.js 15 (App Router) + TypeScript**, no
runtime dependencies beyond React/Next. SEO-first architecture designed to
scale to hundreds of tools without code duplication.

## Current coverage

**57 tools** across four categories, plus a reference guide per category:

- **Electrical (18):** circuit design cluster (wire size, voltage drop, derating,
  breakers, reactance), power cluster (Ohm, kVA→A, 3-phase, PF correction,
  transformers, motors, generators), and application cluster (energy cost,
  EV charging, LED resistors, dividers, color codes).
- **HVAC (13):** load estimation (cooling, heating, degree-days), air-side
  (duct sizing, velocity, ACH, sensible heat, fan laws), comfort/health
  (dew point, heat index, wind chill), efficiency and cost.
- **Mechanical (16):** power transmission (gears, pulleys, belts, chains,
  gear geometry), fasteners (torque, wrench extensions, tap drills),
  machine elements (bearings, springs), fluid power (cylinders, pumps),
  engine math, metal weight.
- **Solar & Energy (10):** output and sizing (panels, strings, controllers),
  batteries (runtime, banks, charging), and economics (savings, tilt).

Every tool page includes: the formula, a worked example, result interpretation,
assumptions, limitations, substantive FAQs, technical references, and related
tool links. Reference guides per category tie each cluster together.

## Architecture

```
src/
  config/site.ts          # Single source of truth: brand, URL, AdSense, CMP, contact
  lib/
    types.ts              # ToolDefinition / FieldDef / CalcOutput contract
    categories.ts         # 10 sectors (4 live; planned ones get no routes)
    seo.ts                # Canonical URLs, metadata, JSON-LD builders
    format.ts             # Shared number formatting
    engines/              # Pure calculation functions (no React) — testable
      electrical.ts       #   Voltage drop, wire size, Ohm, kVA, PF, motors (NEC data)
      electrical2.ts      #   Resistance, energy, transformers, 3φ, EV, derating...
      hvac.ts / hvac2.ts  #   Loads, ducts, airflow, psychrometrics, fan laws
      mechanical.ts ...   #   Gears, torque, bolts, belts, cylinders, bearings...
      solar.ts / solar2.ts#   Panels, strings, batteries, savings, tilt
  data/
    tools/                # Tool definitions (metadata + engine + editorial content)
    guides.ts             # Category reference guides (editorial hub pages)
  components/
    tools/                # Generic CalculatorForm + ToolCalculator (client)
    layout/ ads/ consent/ seo/
  app/
    page.tsx, tools/[category]/page.tsx,
    tools/[category]/guide/page.tsx, tools/[category]/[tool]/page.tsx,
    about/ contact/ privacy/ cookies/ terms/ disclaimer/
    sitemap.ts robots.ts
scripts/
  verify-engines.ts       # Batch 1 math assertions (27 checks)
  verify-engines2.ts      # Batch 2 math assertions (52 checks)
  audit-seo.ts            # Duplicate/metadata/internal-link audit
```

**Adding a tool touches exactly two files:** its category file in
`data/tools/` (definition + content) and its engine in `lib/engines/` (math).
Routes, sitemap, breadcrumbs, JSON-LD and related-tool links are automatic.

## Data sources used by the engines

- Conductor resistances and ampacities from **NEC Chapter 9 Table 8** and
  **Table 310.16** (75 °C column); derating factors from **NEC 310.15** method.
- Duct sizing and airflow from the **ASHRAE equal-friction** chart approximation
  and standard residential design practice (ACCA Manual J/D as methodology
  references, not reproduced text).
- Fastener data from **ISO 898** grade stresses with the T = K·F·d nut-factor model.
- Bearing life per **ISO 281** (L10, k = 3 / 10⁄3); chain per ANSI B29.1 geometry.
- PV temperature coefficients and derate methodology per **NREL PVWatts** practice;
  string sizing per NEC 690.7 temperature correction.
- Psychrometrics: **Magnus-Tetens** (dew point) and **Stull** (wet bulb) approximations;
  heat index and wind chill per **NWS** published formulas.

Each tool page lists its specific references. Where a formula is an industry
approximation rather than a standard, the page says so explicitly.

## Commands

```bash
npm run dev            # dev server
npm run build          # production build (all pages static)
npm run typecheck      # tsc --noEmit
npm run verify-engines # batch-1 engine assertions
npx tsx scripts/verify-engines2.ts   # batch-2 engine assertions
npx tsx scripts/audit-seo.ts         # registry audit
```

## Tool page structure (fixed by the template)

H1 → summary → **calculator** → results with per-row hints → how it works →
formula + variables → worked example → interpretation → assumptions →
limitations → FAQ (only when substantive) → related tools → references →
last-updated date.

## SEO

- One canonical per page; unique title/description per tool (enforced by audit).
- Sitemap and robots generated from the registry; planned categories excluded
  (no thin pages).
- JSON-LD: Organization + WebSite (home), BreadcrumbList + WebApplication +
  FAQPage (tools), CollectionPage (categories), BreadcrumbList (guides).
- Internal linking via curated `related` slugs per tool (audit-validated),
  plus editorial link sections inside each category guide.

## Adding a category

1. Flip its `status` to `"live"` in `lib/categories.ts` once it has tools.
2. Add `data/tools/<category>.ts` and register the array in `data/tools/index.ts`.
3. Add an engine file and tests. Optionally add a `GUIDES` entry.

## AdSense & consent

- Set `NEXT_PUBLIC_ADSENSE_CLIENT` to enable ads; without it the site ships
  zero ad code.
- Set `NEXT_PUBLIC_CMP_SRC` to a Google-certified CMP (e.g. CookieYes) for
  EEA/GDPR traffic; a minimal fallback banner exists for development only.
- Ad slots render reserved space (no CLS) and are clearly labeled.

## Environment

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_SITE_URL` must be the
production domain for correct canonicals/sitemap.

## Deployment

Standard Vercel deployment; all pages are statically generated.

## Quality gates (run before every release)

1. `npx tsx scripts/verify-engines.ts` + `scripts/verify-engines2.ts` — all math checks pass
2. `npx tsx scripts/audit-seo.ts` — no duplicates/broken links/thin content
3. `npm run build` — clean static build
