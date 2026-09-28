import type { ToolDefinition } from "@/lib/types";
import { excavationVolume, paintCoverage, tileCount } from "@/lib/engines/construction3";

const LENGTH = [
  { value: "ft", label: "ft", factor: 1 },
  { value: "m", label: "m", factor: 3.28084 },
  { value: "in", label: "in", factor: 1 / 12 },
  { value: "cm", label: "cm", factor: 1 / 30.48 },
];

export const CONSTRUCTION3_TOOLS: ToolDefinition[] = [
  {
    slug: "excavation-calculator",
    category: "construction",
    name: "Excavation Calculator",
    title: "Excavation Calculator — Volume, Swell & Truckloads | IngCalc",
    description:
      "Calculate excavation volume in bank and loose cubic yards, with soil swell factor, truckloads and weight. Trenches and pits for estimating and disposal.",
    summary:
      "Enter pit or trench dimensions to get the in-ground (bank) volume, the hauled (loose) volume with soil swell applied, and the truckloads disposal will need.",
    keywords: ["excavation calculator", "dirt removal calculator", "soil volume calculator", "excavation hauling calculator", "trench volume"],
    inputs: [
      { id: "length", label: "Length", kind: "number", defaultValue: 30, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "width", label: "Width", kind: "number", defaultValue: 4, min: 0.5, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
        help: "Trench bottom width — account for shoring or sloped sides separately." },
      { id: "depth", label: "Average depth", kind: "number", defaultValue: 3, min: 0.25, step: 0.25, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "swell", label: "Soil swell factor", kind: "number", unit: "0-1", defaultValue: 0.25, min: 0, max: 1, step: 0.05,
        help: "Sand ~0.15, mixed soil ~0.25, clay ~0.30-0.40." },
    ],
    calc: excavationVolume,
    formula: ["Bank yd³ = L × W × D ÷ 27", "Loose yd³ = bank × (1 + swell)", "loads = loose ÷ truck capacity"],
    variables: [
      { symbol: "bank", meaning: "In-ground (undisturbed) volume", unit: "yd³" },
      { symbol: "swell", meaning: "Volume increase after excavation", unit: "—" },
    ],
    howItWorks: [
      "Bank volume is the geometric hole: length × width × depth divided by 27 ft³/yd³.",
      "Excavated soil fluffs up — swell converts bank yards to the loose yards the trucks actually haul.",
      "Truckloads divide loose volume by a common 10 yd³ single-axle dump; scale for your hauler's trucks.",
      "Weight uses a typical loose mixed-soil density (~2600 lb/yd³) since disposal is often priced per ton.",
    ],
    example:
      "A 30 × 4 ft utility trench averaging 3 ft deep: bank = 360 ft³ = 13.3 yd³. Mixed soil at 25% swell: loose = 16.7 yd³ → 2 truckloads (10 yd³) and ~21.7 tons for disposal pricing.",
    interpretation:
      "Bank vs loose is the distinction that breaks disposal estimates: you dig 13 yd³ but haul 17. Sloped or benched sides (OSHA-required over 5 ft in many soils) add real volume beyond the bottom dimensions — a 1:1 slope on a 3 ft trench nearly doubles the surface width. Over-excavation for bedding and grade correction typically adds 10-20% on top; order disposal accordingly.",
    assumptions: [
      "Rectangular trench or pit at bottom dimensions, vertical sides.",
      "Swell factor per soil type: 15% sand, 25% mixed, 30-40% clay.",
      "10 yd³ truck capacity for the load count.",
    ],
    limitations: [
      "Sloped/benched sides, bedding layers and dewatering volumes are not included.",
      "Rock excavation has different swell (~50-80%) and hauling costs.",
    ],
    faqs: [
      {
        q: "How much does excavated soil swell?",
        a: "Sand swells ~15%, common mixed earth ~25%, clay 30-40% — measured as loose volume over bank volume. Compacted backfill returns to roughly bank volume.",
      },
      {
        q: "How many yards are in a truckload of dirt?",
        a: "Typical single-axle dumps carry 10 yd³; tandems 16-20. Weight limits often bind before volume: 10 yd³ of wet clay at ~3000 lb/yd³ is 15 tons — check the truck's payload.",
      },
    ],
    references: [
      { label: "OSHA — trenching and excavation safety (1926 Subpart P)", url: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926SubpartP" },
    ],
    related: ["gravel-calculator", "concrete-calculator", "footing-size-calculator", "asphalt-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "paint-calculator",
    category: "construction",
    name: "Paint Calculator",
    title: "Paint Calculator — Gallons, Coats & Coverage | IngCalc",
    description:
      "Calculate paint gallons for a room from dimensions, coats and spread rate. Walls and optional ceiling, with primer quantity for bare drywall.",
    summary:
      "Enter room dimensions and coats to get paintable area, gallons needed and gallons to buy — with the spread-rate reality of rough or unprimed surfaces.",
    keywords: ["paint calculator", "how much paint do i need", "paint coverage calculator", "gallons of paint per room"],
    inputs: [
      { id: "length", label: "Room length", kind: "number", defaultValue: 14, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "width", label: "Room width", kind: "number", defaultValue: 12, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "height", label: "Wall height", kind: "number", defaultValue: 8, min: 4, max: 16, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft" },
      { id: "coats", label: "Number of coats", kind: "number", unit: "×", defaultValue: 2, min: 1, max: 4, step: 1 },
      {
        id: "ceiling", label: "Include ceiling?", kind: "select",
        options: [
          { value: "no", label: "No — walls only" },
          { value: "yes", label: "Yes — paint the ceiling too" },
        ],
        defaultOption: "no",
      },
      { id: "spread", label: "Spread rate", kind: "number", unit: "ft²/gal", defaultValue: 375, min: 100, max: 600, step: 25, optional: true,
        help: "Interior latex on primed drywall ≈ 375. Rough/unprimed: 250-300. Blank uses 375." },
    ],
    calc: paintCoverage,
    formula: ["wall area = 2 × (L + W) × H", "gallons = area × coats ÷ spread rate"],
    variables: [
      { symbol: "A", meaning: "Paintable area", unit: "ft²" },
      { symbol: "spread", meaning: "Coverage per gallon per coat", unit: "ft²/gal" },
    ],
    howItWorks: [
      "Wall area is the room perimeter × height; the ceiling adds L × W when included.",
      "Gallons multiply area by coats and divide by the spread rate — the single biggest uncertainty in the estimate.",
      "Openings are deliberately not deducted: cut-in labor around doors and windows consumes what the area deduction would save.",
      "Primer spreads slower (~250 ft²/gal) and is computed at one coat for bare drywall.",
    ],
    example:
      "A 14 × 12 ft room with 8 ft ceilings, 2 coats, walls only: walls = 2 × 26 × 8 = 416 ft². Paint = 416 × 2 ÷ 375 = 2.2 gal → buy 3 gallons (rounded up — matching tint later is unreliable). With ceiling: +96 ft² → 2.7 gal → buy 3.",
    interpretation:
      "The spread rate is where estimates die: the 375 ft²/gal on the can assumes smooth primed drywall, ideal application and no waste. Dark-over-light color changes, textured walls and thirsty unprimed board can halve it. Buy the full rounded gallon count — paint is batch-tinted and 'close enough' matching across visits rarely is. One gallon covers a small bedroom's walls once; most rooms with two coats need 2-3 gallons.",
    assumptions: [
      "Rectangular room, standard spray or roller application.",
      "Openings (doors/windows) not deducted — waste and cut-in absorb them.",
      "375 ft²/gal default spread for interior latex on primed drywall.",
    ],
    limitations: [
      "Trim, baseboards and doors are separate quantities with different products.",
      "Textured surfaces, masonry and previously dark walls need adjusted spread rates.",
    ],
    faqs: [
      {
        q: "How much paint for a 12×12 room?",
        a: "Walls 384 ft²; two coats at 375 ft²/gal = 2.05 gal → buy 3 gallons (2 with careful rolling and no color change). Including the ceiling adds ~0.6 gal per coat-pair.",
      },
      {
        q: "Do I need two coats?",
        a: "Two coats is the standard for uniform color and washability; quality paints with good hide sometimes manage one on like-color repaints. Color changes and new drywall always need primer plus two finish coats.",
      },
    ],
    references: [
      { label: "Sherwin-Williams — coverage and application guidance", url: "https://www.sherwin-williams.com/" },
    ],
    related: ["drywall-calculator", "tile-calculator", "stud-wall-calculator", "concrete-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "tile-calculator",
    category: "construction",
    name: "Tile Calculator",
    title: "Tile Calculator — Tiles, Boxes, Thinset & Grout | IngCalc",
    description:
      "Calculate tile count with layout waste, boxes, thinset and grout for floors and walls. Straight or diagonal patterns, with dye-lot ordering guidance.",
    summary:
      "Enter floor area and tile size to get the exact tile count, the order quantity with pattern waste included, and the thinset and grout the job consumes.",
    keywords: ["tile calculator", "how many tiles do i need", "tile square footage calculator", "thinset grout calculator"],
    inputs: [
      { id: "area", label: "Area to tile", kind: "number", defaultValue: 100, min: 1, step: 5,
        unitOptions: [
          { value: "ft2", label: "ft²", factor: 1 },
          { value: "m2", label: "m²", factor: 10.7639 },
        ],
        defaultUnit: "ft2" },
      { id: "tileSize", label: "Tile size (square, side)", kind: "number", unit: "in", defaultValue: 12, min: 1, max: 48, step: 1,
        help: "Use the ACTUAL dimension — nominal 12 in tile is often 11⅞ in." },
      {
        id: "pattern", label: "Layout pattern", kind: "select",
        options: [
          { value: "straight", label: "Straight / stacked (10% waste)" },
          { value: "diagonal", label: "Diagonal (15% waste)" },
        ],
        defaultOption: "straight",
      },
    ],
    calc: tileCount,
    formula: ["tile area = (size in)² ÷ 144 ft²", "tiles = area ÷ tile area × (1 + waste)"],
    variables: [
      { symbol: "A", meaning: "Area to tile", unit: "ft²" },
      { symbol: "waste", meaning: "Cut waste by pattern: 10% straight, 15% diagonal", unit: "—" },
    ],
    howItWorks: [
      "The exact count divides area by the tile's face area; the buy count adds pattern waste and rounds up.",
      "Diagonal layouts cut more edge tiles from each piece, hence the higher 15% waste.",
      "Thinset (~1 lb per 5 ft²) and grout (~1 lb per 8 ft² at 1/8 in joints) are working averages for standard layouts.",
    ],
    example:
      "A 100 ft² floor in 12 in tiles, straight lay: exact = 100 ÷ 1 = 100 tiles; with 10% waste = 110 → buy 11 boxes of 10. Thinset ≈ 20 lb, grout ≈ 12 lb. The same floor diagonal: 100 × 1.15 = 115 → 12 boxes.",
    interpretation:
      "Order everything at once: dye lots vary between production batches, and matching an out-of-stock lot months later is often impossible. Check the actual tile dimensions (nominal sizes shrink after firing) and keep a few spare tiles from the job for future repairs — the 10% waste usually leaves them. Large-format tiles change the labor: flatter substrates, back-buttering and leveling systems become mandatory rather than optional.",
    assumptions: [
      "Square tiles; rectangular layouts need the actual face area per tile.",
      "10% waste straight lay, 15% diagonal — moderate room shape complexity.",
      "Thinset and grout averages for standard 1/4-3/8 in trowels and 1/8 in joints.",
    ],
    limitations: [
      "Mosaic sheets, herringbone and brick-joint patterns have different waste (herringbone can exceed 20%).",
      "Heated floors, membranes and crack isolation add layers not counted here.",
    ],
    faqs: [
      {
        q: "How many 12×12 tiles do I need for 100 square feet?",
        a: "100 tiles exactly, plus 10% waste → 110; buy 11 boxes if they're packed 10 per box. Diagonal layout: 115 tiles.",
      },
      {
        q: "How much waste should I add for tile?",
        a: "10% for straight layouts in simple rooms, 15% diagonal, 15-20% for herringbone or rooms with many corners and jogs. Keep the leftovers — future matching depends on them.",
      },
    ],
    references: [
      { label: "TCNA — Tile Council of North America handbook", url: "https://www.tcnatile.com/" },
    ],
    related: ["paint-calculator", "drywall-calculator", "concrete-calculator", "gravel-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
