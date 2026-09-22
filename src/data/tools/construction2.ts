import type { ToolDefinition } from "@/lib/types";
import {
  stairLayout,
  roofPitch,
  boardFoot,
  gravelVolume,
  drywallCalc,
  asphaltTonnage,
} from "@/lib/engines/construction";

const LENGTH = [
  { value: "ft", label: "ft", factor: 1 },
  { value: "m", label: "m", factor: 3.28084 },
  { value: "in", label: "in", factor: 1 / 12 },
  { value: "cm", label: "cm", factor: 1 / 30.48 },
];

const INCH = [
  { value: "in", label: "in", factor: 1 },
  { value: "cm", label: "cm", factor: 0.393701 },
];

const AREA = [
  { value: "ft2", label: "ft²", factor: 1 },
  { value: "m2", label: "m²", factor: 10.7639 },
];

export const CONSTRUCTION2_TOOLS: ToolDefinition[] = [
  {
    slug: "stair-calculator",
    category: "construction",
    name: "Stair Calculator",
    title: "Stair Calculator — Rise, Run, Stringer & IRC Check | IngCalc",
    description:
      "Calculate stair layout: number of risers, actual riser height, tread count, total run, stringer length and the 2r+t comfort rule — with IRC 7¾ in and 10 in compliance checks.",
    summary:
      "Enter the total rise and target riser to get the full layout — riser count, actual riser height, run, stringer length — with IRC compliance and comfort checks built in.",
    keywords: ["stair calculator", "stair stringer calculator", "riser height calculator", "stair rise and run", "how many steps do i need"],
    inputs: [
      {
        id: "rise", label: "Total rise (floor to floor)", kind: "number", defaultValue: 108, min: 4, max: 500, step: 0.25,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "Finished floor to finished floor — subfloor to subfloor, not ceiling height.",
      },
      {
        id: "riser", label: "Target riser height", kind: "number", defaultValue: 7.5, min: 4, max: 9, step: 0.25,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "7.5 in is the comfort sweet spot; IRC max is 7¾ in.",
      },
      {
        id: "tread", label: "Tread depth (run per step)", kind: "number", defaultValue: 10, min: 8, max: 14, step: 0.25,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "IRC minimum is 10 in; 10–11 in suits most homes.",
      },
    ],
    calc: stairLayout,
    formula: [
      "risers = round(total_rise / target_riser)",
      "actual_riser = total_rise / risers",
      "treads = risers − 1        total_run = treads × tread",
      "stringer = √(total_run² + total_rise²)        comfort = 2r + t",
    ],
    variables: [
      { symbol: "r", meaning: "Riser height (vertical)", unit: "in" },
      { symbol: "t", meaning: "Tread depth (horizontal, nosing to nosing)", unit: "in" },
      { symbol: "2r+t", meaning: "Comfort rule — ideal 24–25.5 in", unit: "in" },
    ],
    howItWorks: [
      "Riser count divides total rise by the target and rounds — the actual riser is then rise ÷ count, so it lands as close to target as whole risers allow.",
      "Treads are one fewer than risers: the finished floor above is the last 'tread'.",
      "Total run multiplies treads by tread depth; the stringer is the hypotenuse of the rise/run triangle.",
      "Two checks run automatically: IRC compliance (max riser 7¾ in, min tread 10 in) and the 2r+t comfort rule.",
    ],
    example:
      "A 108 in floor-to-floor rise targeting 7.5 in risers: 108/7.5 = 14.4 → 14 risers, actual riser = 7.714 in (passes the 7¾ limit). 13 treads × 10 in = 130 in run = 10.83 ft. Stringer: √(130² + 108²) = 168.9 in = 14.08 ft — a 16 ft 2×12 with margin. Comfort: 2(7.714) + 10 = 25.4 in — right in the ideal band.",
    interpretation:
      "The stringer figure is the board length before cutting — a 2×12 is 11.25 in deep, which clears risers up to about 8 in; deeper stairwells or wide stairs need engineered stringers. If the actual riser misses IRC by a hair (7.76–7.9 in), try one more riser: the riser gets shorter and the run lengthens — check that the lower landing has the extra ~10 in. The comfort rule is why some stairs feel wrong despite passing code: code is the floor, 24–25.5 in is where people don't stumble.",
    assumptions: [
      "Straight run stair — L-shapes and winders change the run and stringer layout entirely.",
      "Tread depth measured nosing to nosing (the IRC convention).",
      "Uniform risers: the first step onto the bottom tread must match the rest within 3/8 in (account for finish floor thickness).",
    ],
    limitations: [
      "No headroom check — verify 6 ft 8 in clear above every nosing against the framing above.",
      "No landing, winder or spiral geometry.",
      "Handrail and guard requirements (34–38 in height) are noted but not calculated.",
    ],
    faqs: [
      {
        q: "What is the maximum riser height by code?",
        a: "IRC R311.7 caps residential risers at 7¾ in and requires treads at least 10 in deep. The tightest permitted stair climbs about 7.75 in per step; anything steeper is a variance or a ladder.",
      },
      {
        q: "How do I calculate the number of steps?",
        a: "Divide the total rise by a target riser (7.5 in is comfortable) and round to whole risers. A 9 ft (108 in) rise needs 14 risers at 7.71 in. Treads are always one fewer — the upper floor is the final step.",
      },
      {
        q: "What is the 2r+t rule?",
        a: "Twice the riser plus the tread should land between 24 and 25.5 in — the stride geometry a human leg expects. Steep stairs (high riser) need deeper treads to compensate; shallow treads want higher risers. It's a comfort guideline, not code, but stairs outside it feel wrong within three steps.",
      },
    ],
    references: [
      { label: "IRC R311.7 — Stairways", url: "https://codes.iccsafe.org/" },
      { label: "American Wood Council — stair stringer design", url: "https://www.awc.org/" },
    ],
    sections: [
      {
        title: "Layout before cutting: the stringer math that saves lumber",
        paragraphs: [
          "A 16 ft 2×12 is expensive, and one mis-marked stringer is scrap. Carpenters lay out stringers with a framing square and stair gauges set to the exact riser and tread figures — the numbers this calculator produces to three decimals. Two practical checks before cutting: first, measure the rise from finished floor to finished floor, not framing to framing — a ¾ in hardwood overlay shortens every riser by ¾ in and pushes the bottom step out of tolerance; second, remember the bottom riser is shorter by the tread thickness (the floor itself serves as the bottom tread's top surface). Getting these two right is the difference between a stair that passes inspection and a rebuild.",
        ],
      },
    ],
    related: ["stud-wall-calculator", "board-foot-calculator", "drywall-calculator", "concrete-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "roof-pitch-calculator",
    category: "construction",
    name: "Roof Pitch Calculator",
    title: "Roof Pitch Calculator — Angle, Slope & Roof Area Factor | IngCalc",
    description:
      "Convert roof pitch to angle, percent slope and the area multiplier. Enter the rise per 12 and footprint area to get the actual sloped roof area and rafter factor.",
    summary:
      "Enter the rise per 12 inches of run (and the footprint area) to get the pitch angle, percent grade, rafter factor and the true sloped roof area for shingles and sheathing.",
    keywords: ["roof pitch calculator", "roof slope calculator", "roof angle calculator", "roof area calculator", "rafter length calculator"],
    inputs: [
      {
        id: "rise", label: "Rise per 12 in of run", kind: "number", defaultValue: 6, min: 0.5, max: 24, step: 0.5, unit: "in",
        help: "A 6/12 roof rises 6 in for every 12 in of horizontal run.",
      },
      {
        id: "area", label: "Building footprint area (plan view)", kind: "number", defaultValue: 1200, min: 10, step: 10,
        unitOptions: AREA,
        defaultUnit: "ft2",
        help: "Footprint under the roof — the sloped surface is larger by the pitch factor.",
      },
    ],
    calc: roofPitch,
    formula: [
      "angle = atan(rise / 12)        slope % = rise / 12 × 100",
      "area_factor = √(12² + rise²) / 12",
      "roof_area = footprint × area_factor        rafter = run × area_factor",
    ],
    variables: [
      { symbol: "rise/12", meaning: "Pitch — vertical inches per 12 horizontal", unit: "in/in" },
      { symbol: "factor", meaning: "Roof area multiplier (√(run² + rise²)/run)", unit: "—" },
      { symbol: "run", meaning: "Horizontal distance (half the span)", unit: "ft or in" },
    ],
    howItWorks: [
      "Pitch notation (rise per 12) converts to angle via arctangent and to percent grade directly.",
      "The area factor is the hypotenuse ratio: for each horizontal foot of run, the roof surface spans √(1 + (rise/12)²) feet.",
      "Multiplying the plan-view footprint by this factor gives the actual shingle/sheathing area — what material orders need.",
      "The chart draws the slope line so the pitch is visible, not just numeric.",
    ],
    example:
      "A 6/12 pitch over a 30 × 40 ft footprint (1,200 ft²): angle = atan(0.5) = 26.57°, grade 50%. Area factor = √(144+36)/12 = 1.1180. Roof area = 1,200 × 1.118 = 1,342 ft² — order 14 squares of shingles (1,400 ft² with 5% waste) instead of the 12 the footprint suggests. Rafter per foot of run: 1.118 ft — a 16 ft run rafter spans 17.9 ft of board.",
    interpretation:
      "Shingles and sheathing are ordered by the sloped area — the factor here is the correction most do-it-yourself estimators forget, and it's 2% at 2/12 but 20% at 8/12 and 41% at 12/12. Steep pitches (8/12+) also add staging and labor cost per square. The rafter factor converts horizontal run to board length: take half the building span (plus overhang), multiply, and that's the rafter length before birdsmouth cuts.",
    assumptions: [
      "Gable or hip roof approximated as a single uniform pitch — valleys and hips add cutting waste, not area.",
      "Footprint measured to the outside of the wall plate line.",
      "Overhangs excluded — add their area (perimeter × overhang × factor) separately for orders.",
    ],
    limitations: [
      "Complex roofs (dormers, multiple pitches, gambrel) need per-surface takeoffs.",
      "Low-slope membranes and standing-seam systems have different waste factors than shingles.",
      "No snow/wind load implications — pitch selection for loads is a structural decision.",
    ],
    faqs: [
      {
        q: "How do I convert roof pitch to degrees?",
        a: "Take the arctangent of rise/12. A 6/12 pitch is atan(0.5) = 26.57°, a 12/12 is 45°, and a 4/12 is 18.43°. Roofers quote pitch; engineers quote degrees — this calculator shows both.",
      },
      {
        q: "How much bigger is the roof than the footprint?",
        a: "It depends on pitch: multiply by 1.014 at 2/12, 1.054 at 4/12, 1.118 at 6/12, 1.202 at 8/12, and 1.414 at 12/12. The calculator computes this factor exactly and applies it to your area.",
      },
      {
        q: "What is the minimum pitch for shingles?",
        a: "Standard asphalt shingles need 2:12 minimum, and between 2:12 and 4:12 manufacturers require double underlayment. Below 2:12 the roof must switch to a membrane system (modified bitumen, TPO) because shingles rely on slope to shed water.",
      },
    ],
    references: [
      { label: "IRC R905 — Roof Covering Installation Requirements", url: "https://codes.iccsafe.org/" },
      { label: "GAF — pitch and shingle coverage guidance", url: "https://www.gaf.com/" },
    ],
    sections: [
      {
        title: "Why roofers think in 12s",
        paragraphs: [
          "Pitch-per-12 is a carpenter's convention that survives because a framing square is 12 inches on each leg — set the square on the rafter, mark 12 along the blade and the rise on the tongue, and the diagonal gives the true rafter line. No trigonometry needed on site. The convention also makes mental math possible: every 12 inches of run costs a predictable board length, and squares of shingles convert from footprint by a factor any estimator can carry in their head for common pitches. Metric markets use degrees or percent grade; when reading international drawings, a 30° roof is roughly 7/12 and a 25% grade is about 3/12.",
        ],
      },
    ],
    related: ["stud-wall-calculator", "board-foot-calculator", "drywall-calculator", "stair-calculator"],
    priority: "B",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "board-foot-calculator",
    category: "construction",
    name: "Board Foot Calculator",
    title: "Board Foot Calculator — Lumber Volume & Cost | IngCalc",
    description:
      "Calculate board feet for lumber: thickness in quarter-inches (4/4, 5/4, 6/4), width, length and piece count, with total cost at any price per board foot.",
    summary:
      "Enter nominal thickness, width, length and piece count to get board feet, total volume and cost — using the nominal-dimension convention hardwood is bought and sold by.",
    keywords: ["board foot calculator", "board feet calculator", "lumber calculator", "bf calculator", "hardwood pricing"],
    inputs: [
      {
        id: "thickness", label: "Nominal thickness", kind: "number", defaultValue: 4, min: 1, max: 16, step: 0.25, unit: "quarter-inches (4/4, 5/4, 6/4...)",
        help: "4/4 = 1 in nominal. Hardwood thickness is quoted in quarters of an inch.",
      },
      {
        id: "width", label: "Nominal width", kind: "number", defaultValue: 8, min: 0.5, step: 0.5,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "Random-width hardwood: use the average board width.",
      },
      {
        id: "length", label: "Length", kind: "number", defaultValue: 8, min: 0.5, step: 0.5,
        unitOptions: [
          { value: "ft", label: "ft", factor: 1 },
          { value: "m", label: "m", factor: 3.28084 },
        ],
        defaultUnit: "ft",
      },
      {
        id: "pieces", label: "Number of pieces", kind: "number", defaultValue: 10, min: 1, max: 1000, step: 1,
      },
      {
        id: "price", label: "Price per board foot", kind: "number", defaultValue: 6, min: 0, step: 0.5, unit: "$/BF",
        help: "Set 0 to skip the cost line. Common hardwoods run $4–15/BF retail.",
      },
    ],
    calc: boardFoot,
    formula: [
      "BF = thickness_in × width_in × length_ft / 12   (per piece)",
      "total BF = BF × pieces        cost = total BF × price",
    ],
    variables: [
      { symbol: "BF", meaning: "Board feet — 144 in³ of nominal lumber", unit: "BF" },
      { symbol: "4/4", meaning: "Quarter-inch thickness convention (4/4 = 1 in)", unit: "—" },
      { symbol: "nominal", meaning: "Rough-sawn dimensions before milling", unit: "in" },
    ],
    howItWorks: [
      "One board foot is 144 cubic inches of nominal lumber — a 1 in thick × 12 in wide × 1 ft long board.",
      "Thickness enters in quarter-inches (the 4/4, 5/4, 6/4 hardwood convention), width in inches, length in feet — the three numbers every hardwood quote uses.",
      "Totals multiply by piece count; cost multiplies by your price per BF.",
      "The formula uses nominal dimensions: a 2×4 is 2 in × 4 in for BF purposes even though it dresses to 1.5 × 3.5.",
    ],
    example:
      "Ten 5/4 × 8 in × 8 ft boards of white oak: BF each = (5/4) × 8 × 8 / 12 = 6.67 BF; total = 66.7 BF. At $9/BF: $600. The same stock at a supplier quoting $7/BF is $467 — the 30% price spread that makes the calculation worth doing before driving to the yard.",
    interpretation:
      "Hardwood lumber is sold by the board foot at random widths, so your actual order's BF depends on the boards you pick — the calculation here is an estimate for budgeting: measure or average the stock you'd actually select. Construction softwood (2×4, 2×8) is sold by the piece, so BF applies only when comparing dimensional lumber prices or ordering rough timber. Milled thickness is below nominal — 4/4 hardwood finishes at 13/16 in after surfacing — which is why the nominal convention persists for pricing.",
    assumptions: [
      "Nominal (rough) dimensions throughout — the pricing standard for hardwood.",
      "Random-width lumber averaged; a fixed-width order uses that width.",
      "Price per BF excludes delivery, milling and waste from defects.",
    ],
    limitations: [
      "Actual usable yield is lower — defects, end checks and cut-offs typically consume 20–30% of rough BF.",
      "Not valid for sheet goods (plywood sold by the 4×8 sheet) or dimensional softwood (sold by the piece).",
      "Some yards quote 'Super BF' or surface-measure variants — check local convention.",
    ],
    faqs: [
      {
        q: "How do I calculate board feet?",
        a: "Thickness (in) × width (in) × length (ft) ÷ 12. A 2 in thick × 6 in wide × 10 ft board is 2 × 6 × 10 / 12 = 10 BF. Multiply by piece count for an order.",
      },
      {
        q: "What does 4/4 mean in lumber?",
        a: "Four quarters of an inch — 1 in nominal thickness. Hardwood thickness is always quoted in quarters: 5/4 = 1.25 in, 6/4 = 1.5 in, 8/4 = 2 in. After milling, 4/4 finishes around 13/16 in.",
      },
      {
        q: "Why is a 2×4 not 2 inches by 4 inches?",
        a: "The nominal size is the rough-sawn green dimension; planing and drying shrink it to 1.5 × 3.5 in. Board foot pricing uses the nominal figure — a convention that persists because rough lumber is what sawmills sell by volume.",
      },
    ],
    references: [
      { label: "NHLA — National Hardwood Lumber Association grading rules", url: "https://www.nhla.com/" },
      { label: "American Wood Council — lumber standards", url: "https://www.awc.org/" },
    ],
    sections: [
      {
        title: "Board feet vs the wood you actually get",
        paragraphs: [
          "You pay for nominal board feet but build with less. Three deductions stack between the quote and the finished part: manufacturing defects (knots, splits, warp — graded stock limits but doesn't eliminate them), planing (4/4 rough becomes 13/16 finished), and cut-off waste when parts are laid out on boards of random width. Furniture makers budget 1.3–1.5× the finished part volume in rough BF. The number this calculator produces is the purchasing figure — what you order at the yard — not the yield, and confusing the two is how projects run out of material at 80% completion.",
        ],
      },
    ],
    related: ["stud-wall-calculator", "drywall-calculator", "roof-pitch-calculator", "gravel-calculator"],
    priority: "B",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "gravel-calculator",
    category: "construction",
    name: "Gravel Calculator",
    title: "Gravel Calculator — Tons & Yards by Area and Depth | IngCalc",
    description:
      "Calculate gravel, sand, crushed stone, topsoil or mulch: cubic yards, tonnage by material density, bags for small jobs, with a 10% margin for uneven subgrade.",
    summary:
      "Enter the area and depth to get cubic yards, tonnage for the selected material (gravel, crushed stone, sand, topsoil, mulch), bag count, and the 10% order margin.",
    keywords: ["gravel calculator", "crushed stone calculator", "how much gravel do i need", "aggregate calculator", "tons of gravel per yard"],
    inputs: [
      {
        id: "length", label: "Length", kind: "number", defaultValue: 20, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "width", label: "Width", kind: "number", defaultValue: 12, min: 0.5, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "depth", label: "Depth", kind: "number", defaultValue: 4, min: 0.5, max: 36, step: 0.5,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "Driveways 4–6 in; walkways 2–4 in; decorative 2–3 in.",
      },
      {
        id: "material", label: "Material", kind: "select",
        options: [
          { value: "gravel", label: "Pea gravel / river rock (~1.4 t/yd³)" },
          { value: "crushed", label: "Crushed stone ¾ in (~1.6 t/yd³)" },
          { value: "sand", label: "Sand (~1.5 t/yd³)" },
          { value: "topsoil", label: "Topsoil (~1.0 t/yd³)" },
          { value: "mulch", label: "Mulch / bark (~0.4 t/yd³)" },
        ],
        defaultOption: "gravel",
      },
    ],
    calc: gravelVolume,
    formula: [
      "V_ft³ = L × W × (depth/12)        V_yd³ = V_ft³ / 27",
      "tons = V_yd³ × density(material)        order = tons × 1.1",
    ],
    variables: [
      { symbol: "V", meaning: "Volume to fill", unit: "ft³ → yd³" },
      { symbol: "ρ", meaning: "Loose delivered density by material", unit: "tons/yd³" },
      { symbol: "1.1", meaning: "Margin for uneven subgrade and settling", unit: "—" },
    ],
    howItWorks: [
      "Volume is the simple L × W × depth, converted to cubic yards — the unit landscape suppliers sell by.",
      "Weight converts from volume with the material's loose density: crushed stone packs heaviest at ~1.6 t/yd³, mulch lightest at ~0.4.",
      "The order figure adds 10% because real subgrades are never perfectly flat and loose aggregate settles 10–15% once compacted or walked on.",
      "The bag count (0.5 ft³ bags) prices the retail option for small areas where delivery minimums dominate cost.",
    ],
    example:
      "A 20 × 12 ft walkway at 4 in of pea gravel: 240 ft² × (4/12) = 80 ft³ = 2.96 yd³. Weight: 2.96 × 1.4 = 4.15 tons — order 4.6 tons with margin. Bagged alternative: 160 bags of 0.5 ft³, which is why delivery wins at this size.",
    interpretation:
      "Suppliers sell loose aggregate by the ton and quote minimum loads (often 3–5 tons for delivery). The margin matters in both directions: short and the second truck carries a delivery minimum; long and you own a pile. Compaction changes the math for driveways — crushed stone compacted in lifts loses 10–15% of its loose depth, so a 4 in compacted base needs ~4.5–5 in loose, which is exactly the margin included here. Densities vary by quarry and moisture; the figures here are typical delivered values, not guarantees.",
    assumptions: [
      "Flat area, loose-delivered material at typical moisture.",
      "Densities: gravel 1.4, crushed stone 1.6, sand 1.5, topsoil 1.0, mulch 0.4 tons per yd³.",
      "No existing base material or geotextile accounted.",
    ],
    limitations: [
      "Compacted vs loose: the tonnage is the same but the covered depth shrinks 10–15% after compaction.",
      "Wet sand and gravel weigh 5–10% more than typical figures.",
      "Irregular areas (circular beds, trench runs) need area computed separately.",
    ],
    faqs: [
      {
        q: "How many tons of gravel per cubic yard?",
        a: "About 1.4 tons per yd³ for pea gravel and river rock, 1.5–1.6 for crushed stone and 1.5 for sand. Mulch is much lighter at ~0.4 t/yd³ — which is why mulch deliveries look enormous for the same weight.",
      },
      {
        q: "How deep should gravel be for a driveway?",
        a: "4–6 in of compacted crushed stone for cars; 6–8 in for trucks or soft subgrade, laid in two lifts. At 4 in over a 10 × 20 ft driveway, that's about 2.5 yd³ ≈ 4 tons.",
      },
      {
        q: "How much does a 0.5 cubic foot bag of gravel cover?",
        a: "At 2 in deep, one 0.5 ft³ bag covers 3 ft². A 100 ft² bed at 2 in needs about 34 bags — the point where a loose delivery at a third of the price wins.",
      },
    ],
    references: [
      { label: "USGS — aggregates data", url: "https://www.usgs.gov/centers/national-minerals-information-center/aggregates-information" },
      { label: "NSSGA — National Stone, Sand & Gravel Association", url: "https://www.nssga.org/" },
    ],
    sections: [
      {
        title: "Loose, compacted and the settling surprise",
        paragraphs: [
          "Aggregate is delivered loose and ends up compacted, and the 10–15% volume loss between those states is where first-time estimators get burned. A trench filled level with loose gravel today will sit a half-inch low after the first rain or plate compactor pass. The professional habit is to order by compacted depth but measure loose: target depth × 1.12 for crushed stone, × 1.15 for sand. For driveways this also matters structurally — the base is supposed to be compacted in 2–3 in lifts, and a single 6 in loose lift will never compact uniformly through its thickness. The tonnage doesn't change with compaction; only the depth it settles to does.",
        ],
      },
    ],
    related: ["concrete-calculator", "asphalt-calculator", "footing-size-calculator", "concrete-mix-ratio-calculator"],
    priority: "A",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "drywall-calculator",
    category: "construction",
    name: "Drywall Calculator",
    title: "Drywall Calculator — Sheets, Mud, Tape & Screws | IngCalc",
    description:
      "Calculate drywall sheets (4×8, 4×10, 4×12), joint compound, tape and screws for any room — walls and optional ceiling, with the standard 15% waste allowance.",
    summary:
      "Enter room dimensions to get sheet count by size, board weight for delivery planning, joint compound gallons, tape rolls and screw weight — waste included.",
    keywords: ["drywall calculator", "sheetrock calculator", "how many drywall sheets", "drywall mud calculator", "wallboard calculator"],
    inputs: [
      {
        id: "length", label: "Room length", kind: "number", defaultValue: 14, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "width", label: "Room width", kind: "number", defaultValue: 12, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
        help: "The perimeter needs both dimensions even for walls-only.",
      },
      {
        id: "height", label: "Wall height", kind: "number", defaultValue: 8, min: 4, max: 16, step: 0.5, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "includeCeiling", label: "Include ceiling?", kind: "select",
        options: [
          { value: "yes", label: "Yes — drywall ceiling" },
          { value: "no", label: "No — walls only" },
        ],
        defaultOption: "yes",
      },
    ],
    calc: drywallCalc,
    formula: [
      "wall area = 2 × (L + W) × H        ceiling = L × W (optional)",
      "sheets = ceil(area × 1.15 / sheet_area)        weight = sheets × lb_per_sheet",
      "mud ≈ 1.5 gal per 100 ft²        tape ≈ 0.3 rolls per 100 ft²",
    ],
    variables: [
      { symbol: "A", meaning: "Total board area (walls + ceiling)", unit: "ft²" },
      { symbol: "1.15", meaning: "Waste factor — cuts around openings", unit: "—" },
      { symbol: "54 lb", meaning: "Weight of a standard 1/2 in 4×8 sheet", unit: "lb" },
    ],
    howItWorks: [
      "Wall area is the room perimeter × height; the ceiling (when included) is length × width.",
      "Sheet count divides the area by the sheet size and adds the standard 15% waste for cuts around openings and corners.",
      "Sheet weight uses published figures for 1/2 in standard board (54 lb per 4×8, scaled by size) — the number that matters for whether two people can hang the ceiling.",
      "Compound and tape follow finishing working averages per 100 ft² of board.",
    ],
    example:
      "A 14 × 12 ft room with 8 ft ceilings, drywalled ceiling: walls = 2 × 26 × 8 = 416 ft²; ceiling = 168 ft²; total 584 ft². Sheets: 584 × 1.15 / 32 = 21 sheets of 4×8 (or 17 of 4×12, with fewer butt joints). Weight: 21 × 54 = 1,134 lb. Mud: ~9 gal. Tape: 2 rolls. Screws: ~1.5 lb.",
    interpretation:
      "The sheet count with 15% waste is the order figure — drywall yards sell full units and returns are limited. The weight line is practical: a 4×12 sheet at 81 lb is a two-person lift overhead, which is why 4×8 dominates DIY ceilings. The mud figure covers tape coat plus two finish coats; textured finishes or level-5 finishing add 50–100%. Regular openings (doors, windows) are deliberately not deducted — the waste factor absorbs their cutoffs, and deducting them double-counts the waste allowance.",
    assumptions: [
      "Rectangular room, single layer of 1/2 in standard board.",
      "15% waste — appropriate for a room with normal openings; long walls with no openings run less.",
      "Finishing averages: 1.5 gal compound and 0.3 tape rolls per 100 ft² of board.",
    ],
    limitations: [
      "Not for ceilings over 10 ft, soffits, bulkheads or curved walls — add those areas manually.",
      "Moisture-resistant and fire-rated (Type X) board weighs 5–15% more than standard.",
      "No primer/paint quantities — a different takeoff entirely.",
    ],
    faqs: [
      {
        q: "How many drywall sheets for a 12×12 room?",
        a: "Walls: 2 × 24 × 8 = 384 ft²; ceiling 144 ft²; total 528 ft². At 4×8 sheets with 15% waste: 19 sheets. With 4×12 sheets: 13 sheets — fewer joints, faster finishing.",
      },
      {
        q: "Should I deduct doors and windows?",
        a: "No — the 15% waste allowance already covers the cutoffs those openings generate. Deducting them and adding waste double-counts and leaves you short on the large sheets that hang between openings.",
      },
      {
        q: "How much drywall mud per sheet?",
        a: "About 1.5 gallons per 100 ft² of board covers tape plus two finish coats. A 4×8 sheet is 32 ft², so roughly half a gallon per sheet across a whole job.",
      },
    ],
    references: [
      { label: "USG — Gypsum Construction Handbook", url: "https://www.usg.com/" },
      { label: "ASTM C1396 — Standard Specification for Gypsum Board", url: "https://www.astm.org/" },
    ],
    sections: [
      {
        title: "Sheet length is a finishing decision",
        paragraphs: [
          "The 4×8 sheet is the default because it handles easily, but professional hangers prefer the longest sheet the walls allow: every butt joint (two sheet ends meeting) is a bump to hide, while tapered edge joints (long edges) feather flat naturally. A 24 ft wall hung with 4×8s has two butt joints; with 4×12s it has one; with 4×16s, none. Each eliminated butt joint is an hour of finishing and a visible flat spot avoided. The trade is handling: a 4×12 sheet weighs 81 lb and needs two people or a drywall lift overhead. On walls, order the longest sheet your clear wall length favors; on ceilings, respect the lift capacity.",
        ],
      },
    ],
    related: ["stud-wall-calculator", "board-foot-calculator", "stair-calculator", "roof-pitch-calculator"],
    priority: "B",
    lastUpdated: "2026-09-22",
  },
  {
    slug: "asphalt-calculator",
    category: "construction",
    name: "Asphalt Calculator",
    title: "Asphalt Calculator — Tons of Hot Mix by Area | IngCalc",
    description:
      "Calculate hot mix asphalt tonnage for driveways and parking areas: compacted tons, loose order quantity with 25% compaction allowance, square yards and cost estimate.",
    summary:
      "Enter area and compacted depth to get asphalt tons at 145 lb/ft³, the loose order quantity that accounts for compaction, and the square-yard figure paving quotes use.",
    keywords: ["asphalt calculator", "asphalt tonnage calculator", "how much asphalt do i need", "hot mix calculator", "driveway asphalt tons"],
    inputs: [
      {
        id: "length", label: "Length", kind: "number", defaultValue: 40, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "width", label: "Width", kind: "number", defaultValue: 12, min: 1, step: 1, unitOptions: LENGTH, defaultUnit: "ft",
      },
      {
        id: "depth", label: "Compacted depth", kind: "number", defaultValue: 3, min: 1, max: 12, step: 0.5,
        unitOptions: INCH,
        defaultUnit: "in",
        help: "Residential driveway: 3–4 in compacted. Overlay: 1.5–2 in.",
      },
      {
        id: "price", label: "Price per ton (material)", kind: "number", defaultValue: 120, min: 0, step: 5, unit: "$/ton",
        help: "Material only — labor typically adds 2–4× material cost.",
      },
    ],
    calc: asphaltTonnage,
    formula: [
      "V = L × W × (depth/12)                tons = V × 145 lb/ft³ / 2000",
      "loose tons = compacted tons × 1.25    area_yd² = L × W / 9",
    ],
    variables: [
      { symbol: "ρ", meaning: "Dense-graded hot mix density (compacted)", unit: "lb/ft³" },
      { symbol: "1.25", meaning: "Loose-to-compacted conversion (delivery grows by 25%)", unit: "—" },
      { symbol: "yd²", meaning: "Square yards — how paving is quoted", unit: "yd²" },
    ],
    howItWorks: [
      "Compacted tonnage uses the standard dense-graded hot mix density of 145 lb/ft³ — the figure plants batch to and the figure DOTs specify.",
      "The order quantity adds 25%: asphalt is delivered and placed loose, compacting to roughly 80% of its loose volume.",
      "Area in square yards (L×W/9) because paving contractors quote by the square yard, not the square foot.",
      "Cost multiplies the loose tonnage by your per-ton material price — the honest baseline before labor.",
    ],
    example:
      "A 40 × 12 ft driveway at 3 in compacted: volume = 120 ft³ → 120 × 145 / 2000 = 8.7 tons compacted. Order loose: 8.7 × 1.25 = 10.9 tons. Area: 53.3 yd². Material cost at $120/ton: ~$1,310 — against a total installed price (with labor, base prep, compaction) typically $3,500–5,500.",
    interpretation:
      "Order the loose figure — plants load loose tons and the paver compacts them down. The 25% compaction factor means a 3 in finished mat needs ~3.75 in loose; a crew that places 3 in loose delivers 2.4 in finished, the classic thin-driveway complaint. Depth matters more than anything: 2 in over unprepared base fails in a few winters, while 3–4 in over compacted aggregate with geotextile on soft ground lasts decades. The material price is a third to a quarter of the installed price — quotes that look expensive per ton usually embed the base work.",
    assumptions: [
      "Dense-graded hot mix asphalt at 145 lb/ft³ compacted.",
      "Compaction to 80% of loose volume — standard for properly rolled mats.",
      "Rectangular area over prepared base.",
    ],
    limitations: [
      "Open-graded and lighter mixes run 130–140 lb/ft³ — order tonnage shifts accordingly.",
      "Base preparation, milling, tack coat and grade work are separate line items.",
      "Cold-patch and recycled asphalt (RAP) have different densities and pricing.",
    ],
    faqs: [
      {
        q: "How many tons of asphalt per square yard?",
        a: "At 1 inch compacted depth: about 0.08 ton/yd² (145 lb/ft³ × 1/12 ft × 9 ft²/yd² / 2000). So 3 in ≈ 0.25 t/yd². A 60 yd² driveway at 3 in runs ~15 tons.",
      },
      {
        q: "How thick should an asphalt driveway be?",
        a: "3–4 in compacted over a compacted aggregate base for cars; 4–6 in for RVs or trucks, often in two lifts. The compacted figure is what counts — delivered loose it's 25% thicker.",
      },
      {
        q: "Why is my delivered tonnage higher than the compacted calculation?",
        a: "Plants deliver loose mix that compacts ~20–25% smaller in volume. The same tons are there — they just occupy more space before the roller runs. Ordering by the compacted figure without the conversion is the classic short-order mistake.",
      },
    ],
    references: [
      { label: "Asphalt Institute — MS-2 Mix Design Methods", url: "https://www.asphaltinstitute.org/" },
      { label: "FHWA — asphalt pavement design guidance", url: "https://www.fhwa.dot.gov/pavement/" },
    ],
    sections: [
      {
        title: "The base is the driveway",
        paragraphs: [
          "Asphalt gets blamed for failures that start in the base. A 3 in mat over uncompacted native soil pumps and cracks within a few freeze-thaw cycles; the same mat over 6 in of compacted crushed stone with drainage lasts 20–30 years. When comparing paving quotes, the tonnage of asphalt is almost the least of it — the number that predicts lifespan is how much aggregate base, grading and compaction the quote includes. Quotes that undercut the market by a third are usually thinning the base, not the asphalt. The tonnage this calculator produces is your check that the material portion of the quote is honest — the base line item is where the real quality lives.",
        ],
      },
    ],
    related: ["gravel-calculator", "concrete-calculator", "footing-size-calculator", "concrete-mix-ratio-calculator"],
    priority: "B",
    lastUpdated: "2026-09-22",
  },
];
