import type { ToolDefinition } from "@/lib/types";
import { rampLayout, earthwork, drainageRunoff, lumberWeight } from "@/lib/engines/construction4";

const LENGTH = [
  { value: "ft", label: "ft", factor: 1 },
  { value: "m", label: "m", factor: 3.28084 },
];

export const CONSTRUCTION4_TOOLS: ToolDefinition[] = [
  {
    slug: "ramp-calculator",
    category: "construction",
    name: "Ramp Calculator",
    title: "Ramp Calculator — Run, Slope & ADA Compliance | IngCalc",
    description:
      "Calculate accessible ramp run, length and slope angle from the rise, with ADA 1:12 reference, landing requirements and the 30 in rise cap explained.",
    summary:
      "Enter the rise to climb and your slope ratio to get the ramp's run, slope length, angle — and how many landings the rise forces.",
    keywords: ["ramp calculator", "ada ramp slope", "wheelchair ramp calculator", "ramp length calculator"],
    inputs: [
      { id: "rise", label: "Total rise to climb", kind: "number", defaultValue: 21, min: 0.5, step: 0.5,
        unitOptions: [
          { value: "in", label: "inches", factor: 1 },
          { value: "cm", label: "cm (×0.3937)", factor: 0.3937 },
        ],
        defaultUnit: "in",
        help: "Door threshold height, deck height, etc." },
      {
        id: "slope", label: "Slope ratio (1 : X)", kind: "select",
        options: [
          { value: "12", label: "1:12 — ADA maximum (8.33%)" },
          { value: "16", label: "1:16 — comfortable" },
          { value: "20", label: "1:20 — no handrails needed (5%)" },
          { value: "10", label: "1:10 — steep, NOT ADA compliant" },
        ],
        defaultOption: "12",
      },
    ],
    calc: rampLayout,
    formula: ["run = rise × slope_ratio        slope_angle = atan(1/X)"],
    variables: [
      { symbol: "rise", meaning: "Vertical height to overcome", unit: "in" },
      { symbol: "run", meaning: "Horizontal ramp length", unit: "ft" },
    ],
    howItWorks: [
      "Run multiplies the rise by the slope ratio: every inch of rise costs 12 inches of run at 1:12.",
      "Slope length is the hypotenuse — the actual board or concrete length along the incline.",
      "Landing count follows the ADA 30-inch-rise-per-run cap, with level landings between runs.",
    ],
    example:
      "A 21 in deck threshold at 1:12: run = 21/12 × 12 = 21 ft (6.4 m), ramp length 21.4 ft, angle 4.76°. Under the 30 in rise cap — one run, no intermediate landings, but the required top and bottom landings still apply.",
    interpretation:
      "The 1:12 limit is why ramps eat space: a 30 in rise demands 30 ft of run before landings — swamped porches switch to switchback configurations with an intermediate landing. 1:20 (5%) avoids handrail and grip requirements entirely, which sometimes makes a longer, gentler ramp the cheaper compliant build. Always verify against your local accessibility code — ADA is the US federal baseline, and jurisdictions add their own.",
    assumptions: [
      "Straight run; switchbacks add landing length between runs.",
      "ADA reference values (US federal); local codes may differ.",
    ],
    limitations: [
      "Handrail, width (36 in clear) and landing dimensions are referenced, not designed.",
      "Not for vehicle ramps (different slope conventions entirely).",
    ],
    faqs: [
      {
        q: "What is the ADA maximum ramp slope?",
        a: "1:12 (8.33%, 4.76°) for ramps, with 30 in maximum rise per run and level landings between. At 1:20 or gentler, the surface is a 'walk' without handrail requirements.",
      },
      {
        q: "How long should a wheelchair ramp be for 3 steps?",
        a: "Three 7 in steps = 21 in rise → 21 ft of run at 1:12. Plan the landings: 60 in level at top and bottom minimum.",
      },
    ],
    references: [
      { label: "ADA Standards — ramps (Section 405)", url: "https://www.access-board.gov/ada/" },
    ],
    related: ["stair-calculator", "roof-pitch-calculator", "concrete-calculator", "stud-wall-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "cut-fill-calculator",
    category: "construction",
    name: "Cut & Fill Calculator",
    title: "Cut & Fill Calculator — Earthwork Volume | IngCalc",
    description:
      "Calculate cut or fill volume for a level building pad from existing and target elevations, with swell/shrink factors for hauling and compaction.",
    summary:
      "Enter pad size and the two elevations to get the cut or fill volume — plus the hauled (cut) or compacted (fill) quantity the site work actually moves.",
    keywords: ["cut and fill calculator", "earthwork volume calculator", "grading calculator", "soil excavation volume"],
    inputs: [
      { id: "length", label: "Pad length", kind: "number", defaultValue: 60, min: 1, step: 5, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "width", label: "Pad width", kind: "number", defaultValue: 40, min: 1, step: 5, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "existingElev", label: "Existing average elevation", kind: "number", defaultValue: 102.5, step: 0.1, unit: "ft" },
      { id: "targetElev", label: "Target (finished) elevation", kind: "number", defaultValue: 101, step: 0.1, unit: "ft",
        help: "Same datum as the existing elevation — difference is what matters." },
    ],
    calc: earthwork,
    formula: ["V = area × |Δelevation| ÷ 27        (bank yd³)"],
    variables: [
      { symbol: "Δ", meaning: "Cut (+) or fill (−) depth", unit: "ft" },
    ],
    howItWorks: [
      "The pad's area times the average elevation difference gives bank volume — in-ground measure.",
      "Cut material swells ~25% when dug (haul more than the hole); imported fill shrinks ~15% when compacted (order more than the void).",
      "Weight uses typical bank-measure soil for disposal pricing.",
    ],
    example:
      "A 60 × 40 ft pad cut 1.5 ft to grade: 2400 ft² × 1.5 ÷ 27 = 133 yd³ bank. Hauling: ~167 yd³ loose ≈ 180 tons off site. The same pad needing 1.5 ft of fill: order ~153 yd³ loose to land 133 compacted.",
    interpretation:
      "Cut vs fill decides the site's economics: balanced pads skip both the haul-off and the import bill, which is why finished-floor elevations get chosen early and deliberately. The swell/shrink pair is the classic estimator trap — you dig 133 and haul 167; you need 133 and order 153. Slopes beyond the pad (side slopes at 2:1 or 3:1) add significant volume on any real grading plan.",
    assumptions: [
      "Flat pad, single average elevation difference — irregular sites need grid/contour methods.",
      "Swell +25% (cut), shrink +15% (fill) for typical mixed soil.",
    ],
    limitations: [
      "No side slopes, topsoil stripping or over-excavation for unsuitable material.",
      "Rock, organic and saturated soils have different swell/shrink values.",
    ],
    faqs: [
      {
        q: "How is cut and fill volume calculated?",
        a: "Volume = area × average depth of cut or fill, divided by 27 for cubic yards. Real sites use grid or cross-section methods because elevations vary across the pad.",
      },
      {
        q: "Why is hauled dirt more than the hole?",
        a: "Excavated soil loosens: bank volume swells ~25% when dug. You dig 100 yd³ and haul about 125 — the truck arithmetic that surprises first-time estimators.",
      },
    ],
    references: [
      { label: "FHWA — earthwork volume methods", url: "https://www.fhwa.dot.gov/construction/" },
    ],
    related: ["excavation-calculator", "gravel-calculator", "concrete-calculator", "footing-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "drainage-runoff-calculator",
    category: "construction",
    name: "Drainage Runoff Calculator",
    title: "Drainage Runoff Calculator — Storm Volume | IngCalc",
    description:
      "Calculate storm runoff volume from roof or paved area, rainfall depth and surface type — the number behind rain barrels, cisterns and drainage design.",
    summary:
      "Enter area, rainfall depth and surface type to get the runoff volume in gallons and litres — the rational-method logic for a single storm event.",
    keywords: ["drainage calculator", "runoff volume calculator", "rain barrel sizing", "stormwater calculator"],
    inputs: [
      { id: "area", label: "Catchment area", kind: "number", defaultValue: 1000, min: 1, step: 50,
        unitOptions: [
          { value: "ft2", label: "ft²", factor: 1 },
          { value: "m2", label: "m² (×10.764)", factor: 10.7639 },
        ],
        defaultUnit: "ft2" },
      { id: "rainfall", label: "Rainfall depth", kind: "number", defaultValue: 1, min: 0.05, step: 0.25,
        unitOptions: [
          { value: "in", label: "inches", factor: 1 },
          { value: "mm", label: "mm (×0.0394)", factor: 0.03937 },
        ],
        defaultUnit: "in",
        help: "Depth of the design storm — 1 in is a useful planning default." },
      {
        id: "surface", label: "Surface type", kind: "select",
        options: [
          { value: "roof", label: "Roof (C = 0.95)" },
          { value: "concrete", label: "Concrete / paving (C = 0.9)" },
          { value: "gravel", label: "Gravel (C = 0.5)" },
          { value: "grass", label: "Grass / lawn (C = 0.25)" },
        ],
        defaultOption: "roof",
      },
    ],
    calc: drainageRunoff,
    formula: ["V = C × i × A"],
    variables: [
      { symbol: "C", meaning: "Runoff coefficient by surface", unit: "—" },
      { symbol: "i", meaning: "Rainfall depth", unit: "in" },
    ],
    howItWorks: [
      "The runoff coefficient reduces rainfall to what the surface actually sheds: roofs ~95%, grass ~25%.",
      "Volume is depth × area × C — a single-event number, in gallons and litres.",
      "1 inch over 1000 ft² of roof is ~623 gallons — the figure rain barrel sizing starts from.",
    ],
    example:
      "A 1000 ft² roof in a 1 in storm: 1000 × (1/12) × 0.95 = 79 ft³ = 592 gallons. A 55-gallon rain barrel fills in a 0.1 in drizzle — real rainwater harvesting needs cisterns, or the first ten minutes of every storm overflows.",
    interpretation:
      "Volume and peak flow answer different questions: this volume sizes storage (cisterns, retention), while pipe and gutter sizing need the peak intensity of the design storm. The runoff coefficient is where the physics hides — impervious surfaces shed nearly everything, lawns drink a quarter. For drainage compliance, your jurisdiction's design storm (often the 10- or 25-year event) sets the rainfall input, not a 1 inch default.",
    assumptions: [
      "Single storm event, uniform over the catchment.",
      "Runoff coefficients: roof 0.95, concrete 0.9, gravel 0.5, grass 0.25 — the conservative (high) end of published ranges (roof 0.75–0.95, concrete 0.80–0.95, lawns 0.05–0.25), so volumes err high for typical surfaces.",
    ],
    limitations: [
      "Peak flow (for pipe sizing) needs storm intensity-duration data, not just depth.",
      "Storage routing, infiltration and evaporation are not modeled.",
    ],
    faqs: [
      {
        q: "How big should a rain barrel be?",
        a: "A 1000 ft² roof sheds ~600 gallons per inch of rain — barrels fill in minutes. Size storage to your use between storms, or accept that most volume overflows.",
      },
      {
        q: "What is the runoff coefficient?",
        a: "The fraction of rainfall that becomes runoff: ~0.95 for roofs, 0.9 concrete, 0.5 gravel, 0.25 lawn. The rest soaks in or evaporates.",
      },
    ],
    references: [
      { label: "EPA — stormwater management best practices", url: "https://www.epa.gov/npdes/stormwater-management-best-practices" },
      { label: "USGBC — common runoff coefficients (HEC-22 ranges)", url: "https://www.usgbc.org/resources/homes-table-8-common-runoff-coefficients" },
    ],
    related: ["tank-volume-calculator", "pipe-size-calculator", "cut-fill-calculator", "gravel-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "lumber-weight-calculator",
    category: "construction",
    name: "Lumber Weight Calculator",
    title: "Lumber Weight Calculator — Board Weight by Species | IngCalc",
    description:
      "Calculate lumber weight per piece and total from nominal size, species and count — dressed dimensions, board feet and vehicle/floor loading context.",
    summary:
      "Enter nominal size, species and count to get the weight per board and the total — the number behind delivery payloads and floor loading checks.",
    keywords: ["lumber weight calculator", "how much does a 2x4 weigh", "board weight calculator", "wood weight calculator"],
    inputs: [
      {
        id: "species", label: "Species / condition", kind: "select",
        options: [
          { value: "pine", label: "SPF / pine (~29 lb/ft³)" },
          { value: "douglas", label: "Douglas fir (~34 lb/ft³)" },
          { value: "oak", label: "Oak (~47 lb/ft³)" },
          { value: "treated", label: "Treated lumber (~40 lb/ft³, wet)" },
        ],
        defaultOption: "pine",
      },
      { id: "thickness", label: "Nominal thickness", kind: "number", defaultValue: 2, min: 1, max: 12, step: 1, unit: "in" },
      { id: "width", label: "Nominal width", kind: "number", defaultValue: 4, min: 1, max: 24, step: 1, unit: "in" },
      { id: "length", label: "Length", kind: "number", defaultValue: 8, min: 1, step: 1,
        unitOptions: [{ value: "ft", label: "ft", factor: 1 }, { value: "m", label: "m", factor: 3.28084 }],
        defaultUnit: "ft" },
      { id: "count", label: "Number of pieces", kind: "number", defaultValue: 100, min: 1, max: 10000, step: 1 },
    ],
    calc: lumberWeight,
    formula: ["weight = dressed_W × dressed_H × L × density"],
    variables: [
      { symbol: "dressed", meaning: "Actual dimensions (nominal − 0.5 in)", unit: "in" },
    ],
    howItWorks: [
      "Dressed dimensions (nominal minus 0.5 in) times length give the real volume; species density converts to weight.",
      "Treated lumber runs heavier — moisture and preservative add 10–20% over dry SPF.",
      "Board feet shown in nominal terms for price comparisons.",
    ],
    example:
      "100 studs of 2×4×8 SPF: dressed 1.5 × 3.5 in × 8 ft = 0.292 ft³ each × 29 lb/ft³ = 8.5 lb each, 847 lb total — a half-ton pickup's payload territory. The same count in treated: ~1170 lb, plus a wet-wood surprise for the trailer's springs.",
    interpretation:
      "Lumber weight matters in three practical places: vehicle payloads (a full bunk of 2×4s is heavier than it looks), floor loading on stacked storage (a few bunks concentrated on one floor bay), and structural dead load (a framed floor's own weight). Wet-treated lumber gains 10–20% weight as it dries — deliveries in the rain weigh what the water weighs.",
    assumptions: [
      "Dressed dimensions (nominal − 0.5 in) for framing lumber.",
      "Densities at ~12% moisture: SPF 29, fir 34, oak 47, treated 40 lb/ft³.",
    ],
    limitations: [
      "Hardwood and exotic species vary widely — use datasheet densities for precision.",
      "Very wet or kiln-fresh lumber can exceed the treated figure.",
    ],
    faqs: [
      {
        q: "How much does a 2x4x8 weigh?",
        a: "About 8–9 lb for dry SPF (1.5 × 3.5 in dressed × 8 ft × 29 lb/ft³). Treated: 11–12 lb.",
      },
      {
        q: "How much does a bunk of lumber weigh?",
        a: "Roughly 150–200 pieces of 2×4×8 per bunk → 1,300–1,700 lb dry. Half a ton plus the pallet — mind the pickup payload and the forklift.",
      },
    ],
    references: [
      { label: "American Wood Council — Wood Handbook ( densities)", url: "https://www.awc.org/" },
      { label: "USDA Forest Products Laboratory — Wood Handbook", url: "https://www.fpl.fs.usda.gov/" },
    ],
    related: ["board-foot-calculator", "metal-weight-calculator", "stud-wall-calculator", "concrete-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
