import type { ToolDefinition } from "@/lib/types";
import {
  concreteVolume,
  concreteMixRatio,
  cmuBlockWall,
  brickWall,
  rebarGrid,
  footingSize,
  studWall,
} from "@/lib/engines/construction";

const FT2 = [
  { value: "ft2", label: "ft²", factor: 1 },
  { value: "m2", label: "m²", factor: 10.7639 },
];

const LENGTH = [
  { value: "ft", label: "ft", factor: 1 },
  { value: "m", label: "m", factor: 3.28084 },
  { value: "in", label: "in", factor: 1 / 12 },
  { value: "cm", label: "cm", factor: 1 / 30.48 },
];

const THICKNESS_IN = [
  { value: "in", label: "in", factor: 1 },
  { value: "cm", label: "cm", factor: 0.393701 },
];

export const CONSTRUCTION_TOOLS: ToolDefinition[] = [
  {
    slug: "concrete-calculator",
    category: "construction",
    name: "Concrete Calculator",
    title: "Concrete Calculator — Slabs, Footings, Walls & Columns | IngCalc",
    description:
      "Calculate concrete volume in cubic yards and bags for slabs, footings, walls and columns. Includes 80/60/40 lb bag counts, 5% waste allowance and weight for delivery.",
    summary:
      "Enter your pour dimensions and get the volume in cubic yards, the bag count for 80, 60 or 40 lb mixes, and the weight — with the 5% waste margin already applied.",
    keywords: ["concrete calculator", "concrete yard calculator", "cubic yards of concrete", "concrete bags calculator", "how much concrete do i need"],
    inputs: [
      {
        id: "shape",
        label: "Pour shape",
        kind: "select",
        options: [
          { value: "slab", label: "Slab (length × width × thickness)" },
          { value: "footing", label: "Footing / grade beam (L × W × D)" },
          { value: "wall", label: "Wall (length × height × thickness)" },
          { value: "column", label: "Round column (diameter × height)" },
          { value: "circular", label: "Round hole / post footing (diameter × depth)" },
        ],
        defaultOption: "slab",
      },
      {
        id: "length", label: "Length", kind: "number", defaultValue: 20, min: 0.1, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
        showIf: (raw) => raw.shape === "slab" || raw.shape === "footing" || raw.shape === "wall",
        help: "Longest horizontal dimension of the pour.",
      },
      {
        id: "width", label: "Width", kind: "number", defaultValue: 12, min: 0.1, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
        showIf: (raw) => raw.shape === "slab" || raw.shape === "footing",
      },
      {
        id: "height", label: "Height / depth", kind: "number", defaultValue: 8, min: 0.1, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
        showIf: (raw) => raw.shape === "wall" || raw.shape === "column" || raw.shape === "circular",
        help: "Wall height, column height, or hole depth.",
      },
      {
        id: "thickness", label: raw_shape_thickness_label(), kind: "number", defaultValue: 4, min: 0.5, step: 0.5, unitOptions: LENGTH, defaultUnit: "in",
        showIf: (raw) => raw.shape === "slab" || raw.shape === "footing" || raw.shape === "wall",
        help: "Slabs: 4 in patio / 5 in driveway / 6 in heavy use.",
      },
      {
        id: "diameter", label: "Diameter", kind: "number", defaultValue: 12, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "in",
        showIf: (raw) => raw.shape === "column" || raw.shape === "circular",
        help: "Sonotube or auger hole diameter.",
      },
      {
        id: "bagSize", label: "Bag size (if bagging it)", kind: "select",
        options: [
          { value: "80", label: "80 lb bag (0.60 ft³)" },
          { value: "60", label: "60 lb bag (0.45 ft³)" },
          { value: "40", label: "40 lb bag (0.30 ft³)" },
        ],
        defaultOption: "80",
      },
    ],
    calc: concreteVolume,
    formula: [
      "Slab/Footing:  V = L × W × t",
      "Wall:          V = L × h × t",
      "Column/Hole:   V = π/4 × d² × h",
      "yd³ = V_ft³ / 27        bags = V_ft³ / bag_yield",
    ],
    variables: [
      { symbol: "V", meaning: "Concrete volume", unit: "ft³ → yd³" },
      { symbol: "L, W, h, t", meaning: "Length, width, height, thickness", unit: "ft or in" },
      { symbol: "bag_yield", meaning: "Mixed yield per bag (0.6 / 0.45 / 0.3 ft³)", unit: "ft³/bag" },
    ],
    howItWorks: [
      "The engine computes the geometric volume of the selected shape in cubic feet.",
      "Cubic yards divide by 27 — the unit ready-mix is ordered in across North America.",
      "Bag counts use published yields: an 80 lb bag mixes to about 0.60 ft³, a 60 lb to 0.45 ft³, a 40 lb to 0.30 ft³.",
      "The recommended order adds 5% for uneven subgrade, spillage and forms that bulge.",
    ],
    example:
      "A 20 × 12 ft patio slab at 4 in thick: 20 × 12 × (4/12) = 80 ft³ = 2.96 yd³. Order 3.25 yd³ of ready-mix (short-load minimums make the 5% margin cheap insurance), or 140 bags of 80 lb mix if mixing by hand — which is roughly 7 hours of mixing for two people, the point where ready-mix becomes the better choice.",
    interpretation:
      "Order ready-mix in 0.25 yd³ increments — round the bag-with-waste figure up to the nearest quarter yard. Under 1 yd³, bagged mix is reasonable; 1–2 yd³ is the painful middle where a small ready-mix truck or a trailer from a batch plant pays off. The weight figure matters for deck footings and raised slabs: concrete at 150 lb/ft³ is heavier than most people budget for.",
    assumptions: [
      "Nominal dimensions on the drawing, not as-dug excavation.",
      "Density 150 lb/ft³ for standard 3000–4000 psi structural mix.",
      "Published bag yields at correct water content — over-watering changes both yield and strength.",
    ],
    limitations: [
      "Openings, chamfers, haunches and keyways are not deducted.",
      "Post holes with belled bottoms or irregular excavation need manual adjustment.",
      "No account for form thickness or concrete lost in congested reinforcing zones.",
    ],
    faqs: [
      {
        q: "How much concrete do I need for a 20×20 4-inch slab?",
        a: "20 × 20 × (4/12) = 133 ft³ = 4.94 yd³. Order 5.25 yd³ with the waste margin. That's about 233 bags of 80 lb mix — firmly ready-mix territory.",
      },
      {
        q: "How many 80 lb bags make one cubic yard?",
        a: "27 ft³ ÷ 0.60 ft³ per bag = 45 bags per cubic yard exactly. For 60 lb bags it's 60 bags; for 40 lb, 90 bags.",
      },
      {
        q: "Should I include waste in the calculation?",
        a: "Yes — the 5% margin is already in the recommended order figure. It covers subgrade irregularities and spillage. Running short mid-pour creates a cold joint, which is a permanent structural weakness; surplus concrete is merely a small cost.",
      },
    ],
    references: [
      { label: "ACI 318 — Building Code Requirements for Structural Concrete", url: "https://www.concrete.org/" },
      { label: "Portland Cement Association — concrete basics", url: "https://www.cement.org/" },
    ],
    sections: [
      {
        title: "Ready-mix vs bagged: where the crossover sits",
        paragraphs: [
          "One cubic yard is 45 bags of 80 lb mix — about 3,600 lb of dry material that must be mixed with roughly 5 gallons of water per bag and placed before it sets. Two people with a portable mixer sustain maybe 15–20 bags per hour; a full yard is a 2.5–3 hour mixing marathon, and the last batches are going down while the first are already curing. That labor math, not the material price, is why anything over a yard almost always goes to the ready-mix truck. The bag route wins for fence posts, small pads and repairs where a truck's minimum-load charge (often $100–150 for less than 3–4 yd³) dwarfs the concrete cost.",
        ],
      },
      {
        title: "Cold joints: the mistake this calculator prevents",
        bullets: [
          "A cold joint forms when fresh concrete lands on concrete that has already set — the two layers never bond chemically.",
          "For any pour over ~2 yd³, plan the delivery so the whole volume is placed within 90 minutes of batch time.",
          "If a second truck is needed, schedule the gap at a construction joint location, never mid-span of a slab.",
        ],
      },
    ],
    related: ["concrete-mix-ratio-calculator", "rebar-grid-calculator", "footing-size-calculator", "gravel-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "concrete-mix-ratio-calculator",
    category: "construction",
    name: "Concrete Mix Ratio Calculator",
    title: "Concrete Mix Ratio Calculator — Cement, Sand & Gravel | IngCalc",
    description:
      "Calculate cement bags, sand, gravel and water for any mix ratio (1:2:3, 1:1.5:3, 1:3:4) and target volume. Uses the 1.54 dry-volume factor and w/c 0.5.",
    summary:
      "Enter the wet volume you need and the mix ratio; get cement bags, sand and gravel volumes, and the water for a 0.5 water-cement ratio — with the shrinkage factor shown.",
    keywords: ["concrete mix ratio calculator", "1:2:3 concrete mix", "cement sand gravel calculator", "concrete mix design calculator", "how many bags of cement"],
    inputs: [
      {
        id: "volume", label: "Wet concrete volume needed", kind: "number", defaultValue: 1, min: 0.01, step: 0.25,
        unitOptions: [
          { value: "yd3", label: "yd³", factor: 27 },
          { value: "ft3", label: "ft³", factor: 1 },
          { value: "m3", label: "m³", factor: 35.3147 },
        ],
        defaultUnit: "yd3",
        help: "The placed, finished volume — what the concrete calculator measures.",
      },
      {
        id: "ratio", label: "Mix ratio (cement:sand:gravel)", kind: "select",
        options: [
          { value: "1:1.5:3", label: "1 : 1.5 : 3 — ~3500-4000 psi structural" },
          { value: "1:2:3", label: "1 : 2 : 3 — ~3000 psi general purpose" },
          { value: "1:3:4", label: "1 : 3 : 4 — ~2500 psi footings, non-critical" },
          { value: "1:2:4", label: "1 : 2 : 4 — ~2800 psi older standard" },
        ],
        defaultOption: "1:2:3",
      },
    ],
    calc: concreteMixRatio,
    formula: [
      "Dry vol = wet vol × 1.54  (voids between sand & gravel fill as water is added)",
      "cement = dry × c/(c+s+g)   sand = dry × s/(c+s+g)   gravel = dry × g/(c+s+g)",
      "cement bags = cement_ft³ / 1.0  (94 lb bag = 1 ft³ bulk)",
      "water = cement_lbw × 0.5  (w/c ratio, by weight)",
    ],
    variables: [
      { symbol: "c:s:g", meaning: "Mix parts by volume", unit: "—" },
      { symbol: "1.54", meaning: "Dry-volume / shrinkage factor", unit: "—" },
      { symbol: "w/c", meaning: "Water-cement ratio by weight", unit: "—" },
    ],
    howItWorks: [
      "Wet volume is multiplied by 1.54 because cement and aggregates compact into voids when water is added — you must batch more dry material than the final volume.",
      "The dry volume is split among ingredients in proportion to the selected ratio.",
      "Cement converts to 94 lb bags at 1 ft³ bulk per bag (the standard US unit).",
      "Water follows the water-cement ratio: 0.5 by weight is the common structural default — every extra gallon above it trades strength for workability.",
    ],
    example:
      "1 yd³ of 1:2:3: dry volume = 1.54 yd³ = 41.6 ft³. Cement share = 41.6/6 = 6.93 ft³ ≈ 7 bags (658 lb). Sand = 13.9 ft³ (0.51 yd³). Gravel = 20.8 ft³ (0.77 yd³). Water = 658 × 0.5 = 329 lb ≈ 39.5 gal. That's what a hand mixer crew needs staged beside the forms before the first shovel.",
    interpretation:
      "The ratio controls strength more than anything except water. Dropping from 1:2:3 to 1:1.5:3 adds ~20% more cement for the same aggregate — roughly 25% stronger concrete. But the w/c ratio dominates: 0.45 vs 0.55 water swings strength by 15–20% in the opposite direction. If the mix is stiff, use a plasticizer or aggregate adjustment, not more water. Hand batches never hit the precision of a batch plant — treat the results as site-mix staging quantities.",
    assumptions: [
      "Volume batching with damp sand (bulked ~20%); oven-dry sand batches slightly richer.",
      "94 lb bags of portland cement at 1 ft³ bulk each.",
      "w/c = 0.5 — suitable for most structural work exposed to weather.",
    ],
    limitations: [
      "Nominal mixes, not a true ACI 211 absolute-volume design for specified 28-day strength.",
      "Aggregate moisture, grading and absorption shift real batches a few percent.",
      "Air-entrained mixes (freeze-thaw climates) replace ~5% of volume with entrained air.",
    ],
    faqs: [
      {
        q: "What does 1:2:3 concrete mean?",
        a: "1 part cement, 2 parts sand, 3 parts gravel by volume — the classic general-purpose site mix, roughly 3000 psi when mixed correctly. It's the starting point for slabs, walks and non-critical footings.",
      },
      {
        q: "Why multiply by 1.54?",
        a: "Dry cement and aggregate contain voids between particles. When water is added, materials settle into those voids and the wet volume is about 65% of the dry batch volume. 1/0.65 ≈ 1.54 is the correction so the finished volume matches what you ordered.",
      },
      {
        q: "How much water should I add?",
        a: "Enough for workability without weeping gray bleed water — the 0.5 w/c here is about 6 gallons per 94 lb bag equivalent. A soupy mix pours easy but loses 20-40% of its strength; a plasticizer adds flow without the strength loss.",
      },
    ],
    references: [
      { label: "ACI 211.1 — Selecting Proportions for Concrete", url: "https://www.concrete.org/" },
      { label: "PCA Design and Control of Concrete Mixtures", url: "https://www.cement.org/" },
    ],
    sections: [
      {
        title: "Water is the whole game",
        paragraphs: [
          "Ask any concrete technologist for the one thing that ruins more concrete than anything else and the answer is always water. Compressive strength tracks the water-cement ratio almost linearly: at w/c 0.40 expect 5000+ psi, at 0.50 about 3500–4000, at 0.60 closer to 2500, and at 0.70 the mix barely holds together. The temptation on site is real — a wet mix flows into forms, levels itself, and finishes easily. It also arrives at 28 days far weaker than the ratio promised. When workability fights strength, the compromise is a mid-range plasticizer, not the hose.",
        ],
      },
    ],
    related: ["concrete-calculator", "footing-size-calculator", "gravel-calculator", "rebar-grid-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "cmu-block-calculator",
    category: "construction",
    name: "CMU Block Calculator",
    title: "CMU Block Calculator — Concrete Blocks & Mortar | IngCalc",
    description:
      "Calculate concrete blocks (CMU) for any wall: 4, 6, 8, 12 inch block counts, mortar bags, sand and wall weight. Nominal dimensions with 5% breakage included.",
    summary:
      "Enter wall dimensions and block size to get the CMU count with joints and breakage included, plus mortar bags, sand volume and the wall's weight for footing checks.",
    keywords: ["cmu calculator", "concrete block calculator", "block wall calculator", "cinder block calculator", "how many blocks do i need"],
    inputs: [
      {
        id: "length", label: "Wall length", kind: "number", defaultValue: 40, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "height", label: "Wall height", kind: "number", defaultValue: 8, min: 0.5, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
        help: "CMU courses are 8 in nominal: an 8 ft wall = 12 courses.",
      },
      {
        id: "size", label: "Block size (W×H×L nominal)", kind: "select",
        options: [
          { value: "8x8x16", label: "8×8×16 in (standard)" },
          { value: "6x8x16", label: "6×8×16 in" },
          { value: "4x8x16", label: "4×8×16 in (partition)" },
          { value: "8x4x16", label: "8×4×16 in (half-high)" },
          { value: "12x8x16", label: "12×8×16 in (foundation)" },
        ],
        defaultOption: "8x8x16",
      },
    ],
    calc: cmuBlockWall,
    formula: [
      "blocks = wall_ft² × blocks_per_ft² × 1.05",
      "blocks_per_ft² = 1 / (nominal_W_ft × nominal_H_ft)",
      "mortar bags ≈ 3 per 130 block    sand ≈ 3 ft³ per 100 block",
    ],
    variables: [
      { symbol: "A", meaning: "Wall face area", unit: "ft²" },
      { symbol: "W×H", meaning: "Block nominal face dimensions (joint included)", unit: "in" },
      { symbol: "1.05", meaning: "Breakage / cutting allowance", unit: "—" },
    ],
    howItWorks: [
      "Nominal block dimensions include the 3/8 in mortar joint — an 8×8×16 CMU actually measures 7⅝ × 7⅝ × 15⅝ in.",
      "Face area per block is computed from the nominal size, so joint spacing is automatically included.",
      "A 5% allowance covers breakage, cuts at corners and openings, and the occasional chipped unit.",
      "Mortar and sand follow the masonry working averages: 3 bags of Type N per 130 block, ~3 ft³ of sand per 100 block.",
    ],
    example:
      "A 40 × 8 ft foundation wall in 8×8×16: area 320 ft², at 112.5 blocks per 100 ft² → 360 block, ×1.05 → 378 block (order 380). Mortar: 378/130 × 3 ≈ 9 bags Type N. Sand: 4 × 3 = 12 ft³. Wall weight: 378 × 35 lb = 13,230 lb ≈ 6.6 tons — sitting on a footing that must spread that plus backfill.",
    interpretation:
      "The count includes joints and 5% breakage — order the whole figure. Bond beams, lintel block and open-bottom units for reinforcing cells come from the same pallet but add cost; a typical residential foundation wall adds 5–10% special units. Half-high block (8×4×16) doubles the block count per area — courses are 4 in, not 8 in, and the labor doubles with them.",
    assumptions: [
      "Running bond, single wythe, standard 3/8 in joints.",
      "8×8×16 CMU at ~35 lb each; other sizes scale by actual weight (6 in ≈ 28 lb, 12 in ≈ 50 lb).",
      "Wall area taken at full length × height — large openings (>20 ft²) should be deducted manually.",
    ],
    limitations: [
      "No lintels, control joints or bond beams itemized.",
      "Reinforced cells (vertical rebar + grout) are separate material not counted here.",
      "Mortar quantities are working averages — severe weather or absorptive block can raise them.",
    ],
    faqs: [
      {
        q: "How many concrete blocks do I need per square foot?",
        a: "For standard 8×8×16 block: 1.125 blocks per ft² of wall face (112.5 per 100 ft²), joints included. Half-high 8×4×16 doubles that to 2.25 per ft².",
      },
      {
        q: "How many bags of mortar per 100 blocks?",
        a: "About 2.3 bags — the working figure is 3 bags per 130 block. Heavily absorptive block in hot weather can push that up 10–15%.",
      },
      {
        q: "Is cinder block the same as CMU?",
        a: "Colloquially yes. True cinder block (ash aggregate) is largely historical; modern CMU uses sand and gravel aggregate and is stronger. The dimensions and counts here apply to both.",
      },
    ],
    references: [
      { label: "NCMA — National Concrete Masonry Association TEK guides", url: "https://ncma.org/" },
      { label: "ACI 530 / TMS 402 — Masonry Building Code", url: "https://www.masonrysociety.org/" },
    ],
    sections: [
      {
        title: "Why nominal dimensions include the joint",
        paragraphs: [
          "Masonry is the one building material specified by its laid size, not its manufactured size. A '16 inch' block plus one 3/8 in joint is 16⅜ in of wall — which means three courses of block plus three joints measure 24 in exactly, and 12 courses of 8-in nominal block build a wall precisely 96 in tall. Every layout in masonry works backward from this: architects dimension walls in course counts because the mortar joint is part of the module. Buying by actual size would leave you 5% short and a course misaligned with the opening heights on the drawing.",
        ],
      },
    ],
    related: ["brick-calculator", "concrete-calculator", "footing-size-calculator", "stud-wall-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "brick-calculator",
    category: "construction",
    name: "Brick Calculator",
    title: "Brick Calculator — US & UK Bricks, Mortar & Bonds | IngCalc",
    description:
      "Calculate bricks for any wall: US modular and UK standard bricks, stretcher/English/Flemish bonds, mortar bags. Counts include joints and 5% waste.",
    summary:
      "Enter wall dimensions, brick standard and bond pattern to get the brick count with joints and waste included, plus the mortar volume in bags.",
    keywords: ["brick calculator", "how many bricks do i need", "brick wall calculator", "bricks per square foot", "masonry calculator"],
    inputs: [
      {
        id: "length", label: "Wall length", kind: "number", defaultValue: 30, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "height", label: "Wall height", kind: "number", defaultValue: 8, min: 0.5, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "standard", label: "Brick standard", kind: "select",
        options: [
          { value: "us-modular", label: "US modular (7⅝ × 2¼ in)" },
          { value: "uk", label: "UK standard (215 × 65 mm)" },
        ],
        defaultOption: "us-modular",
      },
      {
        id: "bond", label: "Bond pattern", kind: "select",
        options: [
          { value: "stretcher", label: "Stretcher (most common)" },
          { value: "english", label: "English (structural, thick walls)" },
          { value: "flemish", label: "Flemish (decorative)" },
        ],
        defaultOption: "stretcher",
      },
    ],
    calc: brickWall,
    formula: [
      "bricks = wall_ft² × bricks_per_ft² × 1.05",
      "US modular stretcher: 6.9 /ft²  (English 13.5, Flemish 10.0)",
      "UK standard stretcher: 60 /m² → × 0.0929 for ft²",
      "mortar_ft³ = bricks/1000 × 0.7 (stretcher) — bags = ft³ / 1.1",
    ],
    variables: [
      { symbol: "A", meaning: "Wall face area", unit: "ft²" },
      { symbol: "per_ft²", meaning: "Bricks per square foot by bond", unit: "1/ft²" },
      { symbol: "1.05", meaning: "Waste and breakage allowance", unit: "—" },
    ],
    howItWorks: [
      "Bricks per square foot come from published counts for each standard and bond — joint spacing built in.",
      "US modular brick (7⅝ × 2¼ in actual) lays 6.9 per ft² in stretcher bond with 3/8 in joints.",
      "UK standard brick lays 60 per m² in stretcher bond; English and Flemish bonds roughly double or 1.45× that.",
      "The 5% allowance covers breakage and cuts; mortar follows the 0.7 ft³ per 1000 brick working average.",
    ],
    example:
      "A 30 × 8 ft garden wall, US modular stretcher: 240 ft² × 6.9 = 1,656 bricks, ×1.05 → 1,739 (order 1,750). Mortar: 1,739/1000 × 0.7 ≈ 1.3 ft³ → 2 bags of 50 lb mortar mix. A UK version of the same wall: 240 ft² = 22.3 m² × 60 = 1,338 bricks + 5% → 1,405.",
    interpretation:
      "Order the calculated count in full strap quantities (usually 500 US / 400 UK per strap). Stretcher bond is what most veneer and garden walls use; English bond doubles the count per area because headers span two wythes — it's a structural pattern, not a veneer one. Brick is heavy: a 30 ft wall at 8 ft is about 5,200 lb, which matters for column-supported canopies and lintel sizing.",
    assumptions: [
      "Single wythe (4 in veneer) wall — double wythe doubles the count.",
      "Standard 3/8 in (10 mm) joints.",
      "US modular brick 7⅝ × 2¼ in face; UK 215 × 65 mm face.",
    ],
    limitations: [
      "Special shapes (soldiers, rowlocks, sills, arches) priced and counted separately.",
      "Mortar estimates are working averages for moderate absorption brick.",
      "Efflorescence, tint variation and pallet-to-pallet color shifts are batch concerns, not count concerns.",
    ],
    faqs: [
      {
        q: "How many bricks per square foot?",
        a: "About 6.9 for US modular brick in stretcher bond with 3/8 in joints. English bond needs ~13.5 per ft²; Flemish ~10. UK standard brick runs 60 per m² (5.6 per ft²) in stretcher.",
      },
      {
        q: "How much waste should I add for bricks?",
        a: "5% covers normal breakage and cuts — it's included in this calculator's count. Add 7–10% if the wall has many corners, pilasters or soldier courses, which force short cuts.",
      },
      {
        q: "What is the difference between stretcher and English bond?",
        a: "Stretcher bond shows only the long face of every brick — a single wythe veneer. English bond alternates courses of stretchers and headers (short face out), producing a two-brick-thick structural wall, which is why it needs about twice the bricks per area.",
      },
    ],
    references: [
      { label: "BIA — Brick Industry Association Technical Notes", url: "https://www.gobrick.com/" },
      { label: "Brick Development Association (UK) — brick calculations", url: "https://www.brick.org.uk/" },
    ],
    sections: [
      {
        title: "Brick counts as a pricing tool",
        paragraphs: [
          "Brick is quoted per thousand, delivered. The count this calculator produces translates directly into a material budget: at $600–900 per thousand for common modular brick, a 240 ft² wall runs $1,000–1,600 in brick alone, plus mortar and labor. Masonry labor typically adds $8–15 per ft² of wall — three to five times the brick cost. That ratio is why the brick count matters most at estimating stage: it's the input to a quote that is dominated by the crew time, and being 10% off on bricks is noise while being 10% off on labor days is money.",
        ],
      },
    ],
    related: ["cmu-block-calculator", "stud-wall-calculator", "concrete-calculator", "board-foot-calculator"],
    priority: "B",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "rebar-grid-calculator",
    category: "construction",
    name: "Rebar Grid Calculator",
    title: "Rebar Calculator — Slab Grid, Weight & Spacing | IngCalc",
    description:
      "Calculate rebar for slabs: bar count both directions, total length with lap splices, weight by bar size (#3–#8), and ACI shrinkage minimum check with spacing chart.",
    summary:
      "Enter slab size, bar size and spacing to get bar counts, total length with laps, weight, and whether the spacing meets the ACI 0.0018 shrinkage minimum — with a spacing chart.",
    keywords: ["rebar calculator", "rebar spacing calculator", "rebar weight calculator", "slab rebar grid", "how much rebar do i need"],
    inputs: [
      {
        id: "length", label: "Slab length", kind: "number", defaultValue: 24, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "width", label: "Slab width", kind: "number", defaultValue: 16, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "bar", label: "Bar size", kind: "select",
        options: [
          { value: "3", label: "#3 (3/8 in) — driveways, walks" },
          { value: "4", label: "#4 (1/2 in) — slabs, most common" },
          { value: "5", label: "#5 (5/8 in) — thicker slabs" },
          { value: "6", label: "#6 (3/4 in) — grade beams" },
          { value: "8", label: "#8 (1 in) — heavy structural" },
        ],
        defaultOption: "4",
      },
      {
        id: "spacing", label: "Bar spacing", kind: "number", defaultValue: 18, min: 3, max: 24, step: 1, unit: "in",
        help: "Slabs on grade: 18 in typical. Suspended slabs: 6–12 in per design.",
      },
      {
        id: "thickness", label: "Slab thickness", kind: "number", defaultValue: 4, min: 2, max: 24, step: 0.5, unitOptions: THICKNESS_IN, defaultUnit: "in",
        help: "Used for the ACI minimum steel check (d ≈ h − 1.5 in cover).",
      },
      {
        id: "lap", label: "Lap splice length", kind: "number", defaultValue: 1.5, min: 0, max: 6, step: 0.5, unit: "ft",
        help: "18 in is common practice for slab-on-grade; structural laps run 30–40 bar diameters.",
      },
    ],
    calc: rebarGrid,
    formula: [
      "bars_per_dir = ceil(dim_in / spacing) + 1",
      "total_len = bars_len × (L + lap) + bars_wid × (W + lap)",
      "weight = total_len × lb_per_ft(bar)",
      "As per ft = (12 / spacing) × bar_area   — compare ACI min 0.0018 × 12 × d",
    ],
    variables: [
      { symbol: "As", meaning: "Steel area per foot of slab width", unit: "in²/ft" },
      { symbol: "d", meaning: "Effective depth (thickness − 1.5 in cover)", unit: "in" },
      { symbol: "0.0018", meaning: "ACI shrinkage/temperature minimum ratio", unit: "—" },
    ],
    howItWorks: [
      "Bar counts use ceil(dimension in inches ÷ spacing) + 1 — bars run full length with a lap at each splice.",
      "Weight uses ASTM A615 bar weights: #4 = 0.668 lb/ft, #5 = 1.043 lb/ft, #8 = 2.670 lb/ft.",
      "The ACI check compares your spacing's steel area against the shrinkage/temperature minimum 0.0018 × b × d.",
      "The chart plots steel area vs spacing for the selected bar with the ACI minimum as a reference line — where the curve crosses the line is the tightest spacing that still passes.",
    ],
    example:
      "A 24 × 16 ft slab, #4 at 18 in OC: bars = ceil(192/18)+1 = 12 one way, ceil(288/18)+1 = 17 the other → 29 bars. Length: 12 × (16+1.5) + 17 × (24+1.5) = 210 + 433.5 = 643.5 ft. Weight: 643.5 × 0.668 = 430 lb. Steel area: 12/18 × 0.20 = 0.133 in²/ft vs ACI min 0.0018 × 12 × 2.5 = 0.054 — passes with margin.",
    interpretation:
      "The weight drives the purchase: rebar is priced per hundredweight (cwt), so 430 lb is 4.3 cwt — at $40–60/cwt, $170–260 of steel. The ACI check is a floor, not a design: structural slabs on grade carrying loads need much more, computed from the actual load pattern. Suspended slabs are a different world entirely — the spacing there comes from flexural design, and this calculator's minimum check does not apply.",
    assumptions: [
      "Two-way grid at uniform spacing; one-way (single direction) layouts need halving.",
      "Full-length bars with lap splices — not welded wire mesh (different product, different math).",
      "1.5 in cover assumed for effective depth in the ACI check.",
    ],
    limitations: [
      "No accounting for chairs, supports or extra bars at corners and openings.",
      "Not a flexural design tool — carrying load through a suspended slab needs structural design.",
      "Lap length for seismic or high-strength applications may exceed the default.",
    ],
    faqs: [
      {
        q: "How much rebar do I need per cubic yard of concrete?",
        a: "Slabs on grade typically run 80–120 lb of steel per yd³ (light reinforcement). The weight this calculator reports, divided by the concrete volume, should land in that range for a typical slab.",
      },
      {
        q: "What spacing should rebar be in a 4 inch slab?",
        a: "18–24 in each way with #3 or #4 bar is the residential norm for a driveway or patio slab. Stepping down to 12 in with #4 roughly doubles the steel and is where heavier-use slabs (RV pads, small shop floors) start.",
      },
      {
        q: "Rebar or wire mesh for a driveway?",
        a: "Both work; they do different jobs. Mesh (WWR) controls shrinkage cracking; rebar holds cracks that do form closed and adds load capacity. For a residential driveway, 6×6 W1.4 mesh is common; rebar at 18 in with #4 is the stronger choice for vehicle turns and soft subgrade.",
      },
    ],
    references: [
      { label: "ACI 318 — Building Code (shrinkage & temperature steel)", url: "https://www.concrete.org/" },
      { label: "ASTM A615 — Deformed Steel Bar Specifications", url: "https://www.astm.org/" },
    ],
    sections: [
      {
        title: "Lap splices: why bars overlap",
        paragraphs: [
          "Two rebar bars never butt end to end — force transfers between them through the concrete surrounding the overlap, a lap splice. The 18 in default here is standard practice for slabs on grade; the theoretical requirement is a multiple of bar diameter (Class B splice ≈ 30× the bar diameter, so 18 in for #4, 24 in for #6). Under-lapping is a hidden defect: the concrete looks fine, the bars are in place, but tension cannot cross the gap — the slab behaves as if unreinforced along that line. When bars are scarce, masons overlap scrap pieces; the lap measurement, not the bar count, is what an inspector checks.",
        ],
      },
    ],
    related: ["concrete-calculator", "concrete-mix-ratio-calculator", "footing-size-calculator", "gravel-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "footing-size-calculator",
    category: "construction",
    name: "Footing Size Calculator",
    title: "Footing Size Calculator — Spread Footing by Load & Soil | IngCalc",
    description:
      "Size a spread footing from column load and allowable soil bearing pressure. Square, rectangular or circular footings with practical 0.5 ft snapping and utilization check.",
    summary:
      "Enter the column load in kips and the soil's allowable bearing in ksf to get the required footing area, snapped to practical dimensions, with the actual bearing pressure shown.",
    keywords: ["footing size calculator", "concrete footing calculator", "spread footing design", "foundation size calculator", "soil bearing capacity"],
    inputs: [
      {
        id: "load", label: "Column / post load", kind: "number", defaultValue: 20, min: 0.1, step: 1,
        unitOptions: [
          { value: "kip", label: "kips", factor: 1 },
          { value: "kn", label: "kN", factor: 0.224809 },
        ],
        defaultUnit: "kip",
        help: "Total service load (dead + live) coming down the column or post.",
      },
      {
        id: "bearing", label: "Allowable soil bearing", kind: "number", defaultValue: 2, min: 0.3, max: 15, step: 0.5,
        unitOptions: [
          { value: "ksf", label: "ksf", factor: 1 },
          { value: "kpa", label: "kPa", factor: 0.0208854 },
        ],
        defaultUnit: "ksf",
        help: "From the geotech report. Typical: sand 1.5–3, stiff clay 2–4, gravel 3–6 ksf.",
      },
      {
        id: "shape", label: "Footing shape", kind: "select",
        options: [
          { value: "square", label: "Square" },
          { value: "circular", label: "Circular (pier / drilled)" },
          { value: "rectangular", label: "Rectangular 1.5:1" },
        ],
        defaultOption: "square",
      },
    ],
    calc: footingSize,
    formula: [
      "A_required = 1.1 × Load / q_allow",
      "square side = √A        circular dia = √(4A/π)",
      "p_actual = 1.1 × Load / A_provided",
    ],
    variables: [
      { symbol: "A", meaning: "Required bearing area", unit: "ft²" },
      { symbol: "q", meaning: "Allowable soil bearing pressure", unit: "ksf" },
      { symbol: "1.1", meaning: "Self-weight allowance (footing + soil above)", unit: "—" },
    ],
    howItWorks: [
      "Required area divides the load by the allowable pressure, with a 10% allowance for the footing's own weight and the soil above it.",
      "Square and circular footings invert the area formula directly; rectangular uses a 1.5:1 aspect for long columns or equipment pads.",
      "The practical size snaps up to the nearest half foot — forms are laid out in whole inches, and half-foot increments match lumber and excavation practice.",
      "The actual bearing pressure with the snapped size shows how much margin the practical size leaves.",
    ],
    example:
      "A deck post carrying 15 kips on soil allowable 2.0 ksf: A = 1.1 × 15 / 2 = 8.25 ft² → side 2.87 ft → practical 3.0 × 3.0 ft. Actual pressure: 16.5/9 = 1.83 ksf → 92% utilization — tight but fine. A 6 × 6 ft would be wasteful here; a 2.5 × 2.5 would overload the soil to 2.64 ksf and settle.",
    interpretation:
      "This is a bearing-only preliminary size — real footing design also checks punching shear (column punching through the footing), one-way shear and the flexural reinforcement in the bottom mat, all of which set the thickness and rebar. The utilization figure tells you whether the snapped size is comfortable (85–95%) or whether you should step up a half foot for construction tolerance. Soil values without a geotech report are guesses: the 'typical' ranges in the notes are for preliminary thinking only, and building a footing on guessed bearing capacity is how foundations settle.",
    assumptions: [
      "Service loads (unfactored) against allowable bearing — the standard ASD preliminary method.",
      "Centered column load, no moment transfer at the base.",
      "Footing bearing at depth with no adjacent surcharge or slope effects.",
    ],
    limitations: [
      "No thickness, shear or flexural steel design — the output is the plan dimension only.",
      "Uplift, moment frames and eccentric loads need full structural design.",
      "Frost depth, expansive soils and water table effects are site-specific and not modeled.",
    ],
    faqs: [
      {
        q: "How big should a footing be for a deck post?",
        a: "A typical residential deck post carries 8–15 kips. On medium soil (2 ksf), that's a 2.5–3 ft square footing at 10–12 in thick with #4 bars each way. Check your local code — many jurisdictions publish prescriptive deck footing tables by post spacing and soil class.",
      },
      {
        q: "What is allowable soil bearing pressure?",
        a: "The maximum pressure the soil can carry with an adequate safety factor against shear failure and excessive settlement — typically 1500–6000 psf for common soils, established by a geotechnical report from actual testing rather than the textbook ranges.",
      },
      {
        q: "Why include footing self-weight?",
        a: "The footing and the soil column above it are dead weight the soil carries in addition to the column load — typically 8–12% extra. Ignoring it oversizes the risk of under-sizing the footing by one increment; including a flat 10% is the standard preliminary allowance.",
      },
    ],
    references: [
      { label: "ACI 318 — Structural Concrete Building Code (footings)", url: "https://www.concrete.org/" },
      { label: "ASCE 7 — Minimum Design Loads", url: "https://www.asce.org/" },
    ],
    sections: [
      {
        title: "Soil bearing numbers without a report",
        paragraphs: [
          "The 'typical' values floating around (sand 1500 psf, clay 2000 psf, gravel 3000 psf) come from old code prescriptive tables and describe soil classes, not your soil. Within a single building lot, bearing capacity can vary 2–3× between a clay pocket and a sand lens. The honest hierarchy: a geotechnical report with actual borings is authoritative; a hand penetrometer or DCP field test gives a defensible estimate; a code table gives a number to start a conversation with an engineer. Residential decks and small additions often proceed on the prescriptive tables in local code — anything with a roof, masonry or more than two stories does not.",
        ],
      },
    ],
    related: ["concrete-calculator", "rebar-grid-calculator", "concrete-mix-ratio-calculator", "cmu-block-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "stud-wall-calculator",
    category: "construction",
    name: "Stud Wall Calculator",
    title: "Stud Wall Calculator — Framing, Plates & Board Feet | IngCalc",
    description:
      "Calculate studs, plates and board feet for framed walls: 16 or 24 in OC layout, openings allowance, cut stud length, sheathing sheets. Includes 3-plate framing.",
    summary:
      "Enter wall dimensions and stud spacing to get the stud count with openings allowance, the cut length above the plates, plate lumber, board feet and sheathing sheets.",
    keywords: ["stud calculator", "stud wall calculator", "how many studs do i need", "framing calculator", "2x4 wall framing"],
    inputs: [
      {
        id: "length", label: "Wall length", kind: "number", defaultValue: 24, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "height", label: "Wall height (floor to ceiling)", kind: "number", defaultValue: 8, min: 2, max: 20, step: 0.25, unitOptions: LENGTH, defaultUnit: "ft",
        help: "8 ft walls frame with a 92⅝ in stud — the cut length here reflects the 3 plates.",
      },
      {
        id: "spacing", label: "Stud spacing (OC)", kind: "select",
        options: [
          { value: "16", label: "16 in OC (standard)" },
          { value: "24", label: "24 in OC (advanced framing)" },
          { value: "12", label: "12 in OC (heavy / tile walls)" },
        ],
        defaultOption: "16",
      },
      {
        id: "openings", label: "Number of door/window openings", kind: "number", defaultValue: 2, min: 0, max: 20, step: 1,
        help: "Each opening adds 2 studs (jack + king) on average.",
      },
    ],
    calc: studWall,
    formula: [
      "studs = ceil(L_in / spacing) + 1 + 2 × openings",
      "stud cut length = H_ft × 12 − 4.5 in  (3 plates × 1.5 in)",
      "board feet = (studs × cut_len + 3 × L) × 5.25 in² / 144",
    ],
    variables: [
      { symbol: "OC", meaning: "On-center spacing between studs", unit: "in" },
      { symbol: "BF", meaning: "Board feet of nominal 2×4 lumber", unit: "BF" },
      { symbol: "1.5×3.5", meaning: "Actual dressed 2×4 section", unit: "in" },
    ],
    howItWorks: [
      "Stud layout divides the wall length by spacing and adds one for the far end — a 24 ft wall at 16 OC has 18 bays + 1 = 19 stud positions.",
      "Each opening adds 2 studs on average: the king stud full height and the jack stud carrying the header.",
      "Cut length subtracts the 3 plates (bottom + doubled top = 4.5 in) from the floor-to-ceiling height.",
      "Board feet use actual dressed dimensions (1.5 × 3.5 in for a 2×4) × total linear feet — the way lumber yards quote framing packages.",
    ],
    example:
      "A 24 ft wall, 8 ft tall, 16 OC, 2 openings: studs = ceil(288/16)+1+4 = 23 studs at 91.5 in cut length. Plates: 3 × 24 = 72 ft. Board feet: 23 × 7.63 ft × 5.25/144 + 72 × 5.25/144 = 6.4 + 2.6 ≈ 9 BF. Sheathing: 24 × 8 / 32 = 6 sheets (order 7 with cuts). A whole 1,200 ft² house walls-out at roughly 900–1,100 studs — this wall scaled up.",
    interpretation:
      "Order studs in units (bundled by the piece), not board feet — the BF figure is for comparing prices or estimating a lumber package. The opening allowance is an average: a 3 ft door needs 2 jack + 2 king studs (4), while a 2 ft window needs 2 of each plus sill and header material — real framing packages itemize headers, sills andcripples separately. Corners and wall intersections need backup studs (3-stud corners): add 2–3 per corner beyond the count here.",
    assumptions: [
      "Single bottom plate + double top plate (standard platform framing).",
      "2×4 studs at the selected OC spacing, dressed to 1.5 × 3.5 in.",
      "Openings counted by number, with 2 studs allowed for each.",
    ],
    limitations: [
      "Headers, sills, cripples and corner/intersection backup studs are not itemized.",
      "Fire blocking, blocking for handrails or cabinets, and wall bracing are extra.",
      "Load-bearing vs non-bearing differences (doubled studs, shear panels) not modeled.",
    ],
    faqs: [
      {
        q: "How many studs do I need for a 12 foot wall?",
        a: "At 16 in OC: ceil(144/16) + 1 = 10 studs for a blank wall. With one door: 12. The calculator's opening allowance covers the average — itemize headers and jack studs for a real framing package.",
      },
      {
        q: "Should I frame at 16 or 24 inches OC?",
        a: "16 in OC is the default: stiffer walls, standard drywall and sheathing spans, easier shelf and TV mounting anywhere. 24 in advanced framing saves 2 studs per 8 ft and some lumber cost, but requires sheathing and drywall rated for the wider span, and insulation works slightly better with less wood. Most builders stay at 16.",
      },
      {
        q: "Why is a stud 92⅝ inches?",
        a: "Three plates (4.5 in) + 92⅝ in stud = 97⅛ in, and one ⅝ in drywall ceiling layer brings the finished floor-to-ceiling to 96 in exactly — an 8 ft ceiling. Pre-cut studs save a cut per stud and standardize the height.",
      },
    ],
    references: [
      { label: "IRC R602 — Wood Wall Framing", url: "https://codes.iccsafe.org/" },
      { label: "American Wood Council — National Design Specification", url: "https://www.awc.org/" },
    ],
    sections: [
      {
        title: "The hidden lumber in a wall",
        paragraphs: [
          "The stud count is the visible part of a framing package. A wall with two windows also carries: a header over each opening (2 × length, doubled for load-bearing), a sill under each window, cripple studs above and below the openings, jack and king studs flanking them, and backup studs at corners and wherever another wall meets. On a house, this hidden lumber adds 30–40% to the bare stud count. The calculator's 2-studs-per-opening allowance covers the flanking members only; estimating the rest requires the actual opening schedule from the plans, which is why real estimators work from the elevations, not from wall length alone.",
        ],
      },
    ],
    related: ["board-foot-calculator", "drywall-calculator", "cmu-block-calculator", "brick-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
];

/** Helper used in a field label above — resolves to a plain string (labels must be static strings). */
function raw_shape_thickness_label(): string {
  return "Thickness";
}
