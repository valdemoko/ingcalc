import type { ToolDefinition } from "@/lib/types";
import { cuttingSpeed, feedRate, cycleTime, materialRemovalRate, productionRate } from "@/lib/engines/manufacturing";

export const MANUFACTURING_TOOLS: ToolDefinition[] = [
  {
    slug: "cutting-speed-calculator",
    category: "cnc-manufacturing",
    name: "Cutting Speed to RPM Calculator",
    title: "Cutting Speed Calculator — Vc to RPM | IngCalc",
    description:
      "Convert cutting speed (Vc, m/min or SFM) and tool diameter to spindle RPM for milling and turning, with typical carbide starting values.",
    summary:
      "Enter surface speed and diameter to get spindle RPM — the first number every speeds-and-feeds calculation needs, in both metric and SFM.",
    keywords: ["cutting speed calculator", "vc to rpm", "sfm to rpm", "spindle speed calculator", "speeds and feeds"],
    inputs: [
      { id: "vc", label: "Cutting speed (Vc)", kind: "number", defaultValue: 120, min: 1, step: 10,
        unitOptions: [
          { value: "mmin", label: "m/min", factor: 1 },
          { value: "sfm", label: "SFM (×0.3048)", factor: 0.3048 },
        ],
        defaultUnit: "mmin",
        help: "Carbide starting points: mild steel 90–150, stainless 60–120, aluminum 300–600 m/min." },
      { id: "diameter", label: "Tool / workpiece diameter", kind: "number", defaultValue: 12, min: 0.1, step: 1,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm" },
    ],
    calc: cuttingSpeed,
    formula: ["n = Vc × 1000 / (π × D)"],
    variables: [
      { symbol: "n", meaning: "Spindle speed", unit: "RPM" },
      { symbol: "Vc", meaning: "Cutting (surface) speed", unit: "m/min" },
      { symbol: "D", meaning: "Diameter", unit: "mm" },
    ],
    howItWorks: [
      "Surface speed at the tool's edge is π·D per revolution — RPM follows directly from the target Vc.",
      "SFM input converts to metric internally; the answer is the same RPM either way.",
      "The surface-speed check row back-calculates so you can verify a machine-limited RPM choice.",
    ],
    example:
      "Vc 120 m/min with a 12 mm endmill: n = 120,000/(π×12) = 3183 RPM. The nearest machine speed below it keeps tool life honest. A 100 mm facing cut on a lathe at the same Vc: 382 RPM.",
    interpretation:
      "Vc is the material-tool contract: too fast burns coatings and edges, too slow rubs and work-hardens. Machine the nearest available speed BELOW the calculation — the few percent lost RPM costs far less than the tool life gained. Diameter is the lever on small tools (a 3 mm cutter needs 12,700 RPM for the same Vc), which is why machines with high-speed spindles pay for themselves on small-diameter work.",
    assumptions: [
      "Constant surface speed idealization; real machines pick the nearest fixed RPM.",
      "Starting values — tool manufacturers' cutting data override any table here.",
    ],
    limitations: [
      "Does not account for machine rigidity, overhang or chatter conditions — reduce Vc for light machines.",
      "Ceramics, CBN and exotic tooling run outside the typical carbide ranges.",
    ],
    faqs: [
      {
        q: "How do I convert SFM to RPM?",
        a: "RPM = SFM × 3.82 ÷ diameter (inches) — or enter SFM here; the conversion to metric happens internally.",
      },
      {
        q: "What RPM for a 6 mm endmill in aluminum?",
        a: "At Vc 300 m/min: 15,900 RPM — beyond most machine spindles, so run the machine's max RPM and feed by chip load. Small tools are surface-speed starved on standard spindles.",
      },
    ],
    references: [
      { label: "Sandvik Coromant — cutting speed fundamentals", url: "https://www.sandvik.coromant.com/" },
    ],
    related: ["feed-rate-calculator", "machining-cycle-time-calculator", "material-removal-rate-calculator", "torque-power-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "feed-rate-calculator",
    category: "cnc-manufacturing",
    name: "Feed Rate Calculator",
    title: "Feed Rate Calculator — Chip Load to mm/min & IPM | IngCalc",
    description:
      "Calculate table feed from spindle RPM, chip load per tooth and flute count — with the rub-versus-chip warning and typical fz starting values.",
    summary:
      "Enter RPM, chip load and flutes to get feed in mm/min and IPM — the second number of every speeds-and-feeds pair.",
    keywords: ["feed rate calculator", "chip load calculator", "ipm calculator", "cnc feed calculator"],
    inputs: [
      { id: "rpm", label: "Spindle speed", kind: "number", defaultValue: 3183, min: 1, step: 10, unit: "RPM" },
      { id: "chipLoad", label: "Chip load per tooth (fz)", kind: "number", defaultValue: 0.05, min: 0.001, step: 0.005,
        unitOptions: [
          { value: "mm", label: "mm/tooth", factor: 1 },
          { value: "mils", label: "mils (×0.0254)", factor: 0.0254 },
        ],
        defaultUnit: "mm",
        help: "Carbide starting points: steel 0.03–0.10, aluminum 0.05–0.15 mm — scale with diameter." },
      { id: "flutes", label: "Number of flutes", kind: "number", defaultValue: 2, min: 1, max: 12, step: 1 },
    ],
    calc: feedRate,
    formula: ["F = n × fz × z"],
    variables: [
      { symbol: "F", meaning: "Table feed", unit: "mm/min" },
      { symbol: "fz", meaning: "Feed per tooth (chip load)", unit: "mm" },
      { symbol: "z", meaning: "Number of flutes", unit: "—" },
    ],
    howItWorks: [
      "Each flute cuts once per revolution: feed per minute is chip load × flutes × RPM.",
      "Mils input serves US chip-load conventions (0.002 in = 0.0508 mm).",
      "The chip-load row converts back to mils for cross-checking imperial recommendations.",
    ],
    example:
      "3183 RPM, 2 flutes, 0.05 mm fz: F = 3183 × 0.05 × 2 = 318 mm/min (12.5 IPM). Doubling flutes to 4 doubles the feed at the same chip load — productivity hiding in tool selection.",
    interpretation:
      "Chip load is the physical contract: every tooth must take a real chip or it rubs, work-hardens and heats instead of cutting. Too much feed chips the edge or breaks the tool; too little is the more common hobbyist error — squealing, glazing and premature dulling. Adjust down for deep engagement, thin walls and long overhangs; increase (within reason) when the cut sounds clean and chips are the right color.",
    assumptions: [
      "Full slotting convention for starting values; radial engagement modifies effective chip load.",
      "Sharp, healthy tooling — worn tools need feed reductions.",
    ],
    limitations: [
      "Does not compute radial chip thinning compensation (relevant at low stepover in finishing).",
      "Drilling uses per-revolution feed, not per-tooth — different model.",
    ],
    faqs: [
      {
        q: "How do I calculate feed rate for milling?",
        a: "Feed = RPM × chip load × flutes. 10,000 RPM, 4 flutes, 0.03 mm: 1200 mm/min (47 IPM).",
      },
      {
        q: "What happens if my feed is too slow?",
        a: "The tool rubs instead of cutting: heat goes into the tool instead of the chip, work-hardening the surface and dulling the edge prematurely. Squealing and glazing are the audible symptoms.",
      },
    ],
    references: [
      { label: "Sandvik Coromant — feed and chip load guidance", url: "https://www.sandvik.coromant.com/" },
    ],
    related: ["cutting-speed-calculator", "machining-cycle-time-calculator", "material-removal-rate-calculator", "production-rate-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "machining-cycle-time-calculator",
    category: "cnc-manufacturing",
    name: "Machining Time Calculator",
    title: "Machining Time Calculator — Cycle Time & Parts per Hour | IngCalc",
    description:
      "Calculate machining cycle time from cut length, feed and passes — with setup amortization and parts-per-hour for quoting.",
    summary:
      "Enter cut length, feed rate and passes to get cutting time, total cycle and parts per hour — the basis of every machining quote.",
    keywords: ["machining time calculator", "cycle time calculator", "cnc cycle time", "parts per hour calculator"],
    inputs: [
      { id: "length", label: "Cut length", kind: "number", defaultValue: 200, min: 0.1, step: 10,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm" },
      { id: "feed", label: "Feed rate", kind: "number", defaultValue: 318, min: 1, step: 10,
        unitOptions: [
          { value: "mmmin", label: "mm/min", factor: 1 },
          { value: "ipm", label: "IPM (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mmmin" },
      { id: "passes", label: "Number of passes", kind: "number", defaultValue: 2, min: 1, max: 50, step: 1 },
      { id: "setup", label: "Setup / handling per part", kind: "number", defaultValue: 2, min: 0, step: 0.5, unit: "min", optional: true },
    ],
    calc: cycleTime,
    formula: ["t_cut = L × passes ÷ F        (+ 5 s approach per pass)"],
    variables: [
      { symbol: "t", meaning: "Machining time", unit: "min" },
      { symbol: "F", meaning: "Feed rate", unit: "mm/min" },
    ],
    howItWorks: [
      "Cutting time is path length times passes divided by feed — with a 5-second approach allowance per pass.",
      "Setup/handling joins the cycle for the parts-per-hour figure quotes depend on.",
      "For batch jobs, amortize dedicated setup across the batch size before quoting.",
    ],
    example:
      "A 200 mm cut at 318 mm/min, 2 passes: 0.63 × 2 + 0.17 ≈ 1.4 min cutting; with 2 min handling: 3.4 min/cycle → 17.6 parts/hour. Halving the feed rate doubles the cut time — feeds dominate cost on long paths.",
    interpretation:
      "Cycle time is money in machining: at shop rates of $60–120/h, every minute is $1–2 per part. Optimize the longest cut first — a feed increase on the main pass beats micro-optimizing rapids. The parts-per-hour figure is the quoting unit: multiply by your hourly rate, add material and tooling amortization, and the estimate holds up against real invoices.",
    assumptions: [
      "Single continuous cut per pass — multiple features need per-feature summation.",
      "5 s per pass for approach/retract; rapid traverses excluded.",
    ],
    limitations: [
      "Tool changes, indexing and multi-feature programs add time not captured here.",
      "Accelerated/decelerated motion slightly lengthens short-segment cycles.",
    ],
    faqs: [
      {
        q: "How do I calculate machining cycle time?",
        a: "Cut length × passes ÷ feed rate, plus tool changes and handling. A 200 mm cut at 300 mm/min takes 0.67 min per pass.",
      },
      {
        q: "How do I quote a machined part?",
        a: "Cycle time × machine rate + material + setup amortized over the batch + tooling allowance. The parts-per-hour here feeds the first term.",
      },
    ],
    references: [
      { label: "Sandvik Coromant — machining time formulas", url: "https://www.sandvik.coromant.com/" },
    ],
    related: ["cutting-speed-calculator", "feed-rate-calculator", "production-rate-calculator", "material-removal-rate-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "material-removal-rate-calculator",
    category: "cnc-manufacturing",
    name: "Material Removal Rate Calculator",
    title: "Material Removal Rate — MRR for Milling & Turning | IngCalc",
    description:
      "Calculate material removal rate for milling (ae × ap × vf) or turning (Vc × ap × fn) — with the spindle-power implication for steel and aluminum.",
    summary:
      "Pick the operation, enter the engagement figures, and get MRR in cm³/min and in³/min — the number that sizes the spindle power.",
    keywords: ["material removal rate calculator", "mrr calculator", "milling mrr", "turning mrr"],
    inputs: [
      {
        id: "operation", label: "Operation", kind: "select",
        options: [
          { value: "milling", label: "Milling (ae × ap × vf)" },
          { value: "turning", label: "Turning (Vc × ap × fn)" },
        ],
        defaultOption: "milling",
      },
      { id: "depth", label: milling_ap_label(), kind: "number", defaultValue: 2, min: 0.1, step: 0.5, unit: "mm",
        help: "Milling: ap = axial depth. Turning: ap = depth of cut." },
      { id: "width", label: "Stepover (ae)", kind: "number", defaultValue: 8, min: 0.1, step: 1, unit: "mm",
        showIf: (raw) => (raw.operation ?? "milling") === "milling" },
      { id: "feed", label: "Table feed (vf)", kind: "number", defaultValue: 318, min: 1, step: 10, unit: "mm/min",
        showIf: (raw) => (raw.operation ?? "milling") === "milling" },
      { id: "diameter", label: "Workpiece diameter", kind: "number", defaultValue: 100, min: 1, step: 5, unit: "mm",
        showIf: (raw) => raw.operation === "turning" },
      { id: "rpm", label: "Spindle speed", kind: "number", defaultValue: 764, min: 1, step: 10, unit: "RPM",
        showIf: (raw) => raw.operation === "turning" },
      { id: "feedPerRev", label: "Feed per revolution (fn)", kind: "number", defaultValue: 0.25, min: 0.01, step: 0.05, unit: "mm/rev",
        showIf: (raw) => raw.operation === "turning" },
    ],
    calc: materialRemovalRate,
    formula: ["milling: MRR = ap × ae × vf", "turning: MRR = Vc × ap × fn"],
    variables: [
      { symbol: "MRR", meaning: "Material removal rate", unit: "cm³/min" },
      { symbol: "ap, ae", meaning: "Depth and width of engagement", unit: "mm" },
    ],
    howItWorks: [
      "Milling multiplies the swept cross-section by the feed; turning multiplies surface speed by the same cross-section.",
      "The power implication: steel needs roughly 2–4 kW per cm³/min of MRR, aluminum 0.5–1 kW.",
      "Imperial in³/min shown for US machine-spec cross-reference.",
    ],
    example:
      "Milling 2 mm deep × 8 mm stepover at 318 mm/min: MRR = 2 × 8 × 318/1000 = 5.1 cm³/min. In steel that needs ~10–20 kW of spindle — check the machine before pushing feeds. In aluminum: 3–5 kW, comfortable.",
    interpretation:
      "MRR is the productivity metric of roughing: everything else being equal, the shop that removes metal fastest at acceptable tool life wins on price. The limit is spindle power and rigidity, not courage — running MRR beyond the machine's real power stalls the spindle or snaps the tool. Finishing tolerates low MRR for surface quality; roughing should chase the machine's honest ceiling.",
    assumptions: [
      "Continuous engagement at the stated parameters.",
      "Specific cutting forces: steel ~2–4 kW per cm³/min, aluminum ~0.5–1 kW per cm³/min.",
    ],
    limitations: [
      "Does not include tool wear state, chip evacuation limits or chatter constraints.",
      "Drilling and boring MRRs follow different geometry.",
    ],
    faqs: [
      {
        q: "What is MRR in machining?",
        a: "Material removal rate — the volume of metal removed per minute (cm³/min or in³/min). Milling: ae × ap × vf. Turning: Vc × ap × fn.",
      },
      {
        q: "How much power does machining steel need?",
        a: "Roughly 2–4 kW per cm³/min of MRR for steels (unit power ~2–4 kW/cm³/min). A 10 cm³/min roughing pass wants a 20–40 kW spindle.",
      },
    ],
    references: [
      { label: "Sandvik Coromant — metal cutting formulas", url: "https://www.sandvik.coromant.com/" },
    ],
    related: ["cutting-speed-calculator", "feed-rate-calculator", "machining-cycle-time-calculator", "machine-efficiency-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "production-rate-calculator",
    category: "cnc-manufacturing",
    name: "Production Rate Calculator",
    title: "Production Rate Calculator — Parts per Shift | IngCalc",
    description:
      "Calculate parts per shift from cycle time and machine availability — with theoretical-vs-available output and true utilization percentage.",
    summary:
      "Enter cycle time, shift length and availability to get parts per shift and the utilization percentage — the OEE-shaped reality check on capacity plans.",
    keywords: ["production rate calculator", "parts per hour calculator", "machine capacity calculator", "oee calculator"],
    inputs: [
      { id: "cycleTime", label: "Cycle time per part", kind: "number", defaultValue: 3.4, min: 0.01, step: 0.1, unit: "min" },
      { id: "shiftHours", label: "Shift length", kind: "number", defaultValue: 8, min: 0.5, max: 24, step: 0.5, unit: "h" },
      { id: "efficiency", label: "Machine availability", kind: "number", defaultValue: 0.8, min: 0.05, max: 1, step: 0.05,
        help: "Bundles setup, breaks, tool changes and stoppages. Job shops 75–85%, dedicated lines 90%+." },
    ],
    calc: productionRate,
    formula: ["parts = shift × 60 × availability ÷ cycle time"],
    variables: [
      { symbol: "availability", meaning: "Share of clock time the machine can actually run", unit: "—" },
    ],
    howItWorks: [
      "Available minutes multiply the shift by availability; parts divide that by cycle time.",
      "The theoretical row shows the 100%-availability fantasy number for contrast.",
      "Utilization multiplies availability by the cutting share of each cycle.",
    ],
    example:
      "3.4 min cycles on an 8-hour shift at 80% availability: 384 min available ÷ 3.4 = 112 parts. The theoretical 141 parts never existed — planning on them is how missed shipments happen.",
    interpretation:
      "The gap between theoretical and available output is where production improvement lives: setup reduction (SMED), tool-life management and quick-change fixturing attack availability directly. Realistic planning uses measured availability, not hope — and capacity quotes built on the theoretical number systematically over-commit the shop.",
    assumptions: [
      "Uniform cycle time and steady availability across the shift.",
      "One part per cycle — multi-part fixtures divide the cycle accordingly.",
    ],
    limitations: [
      "No batch-size effects: long-setup jobs on short runs land far below the calculated rate.",
      "Scrap and rework rates are not deducted.",
    ],
    faqs: [
      {
        q: "How many parts per hour will my machine make?",
        a: "60 × availability ÷ cycle time. At 80% availability and 3.4 min cycles: 14.1 parts/hour — 113 per 8-hour shift.",
      },
      {
        q: "What is machine availability?",
        a: "The fraction of scheduled time the machine can actually run — after setup, breaks, tool changes and stoppages. 75–85% is typical for job shops.",
      },
    ],
    references: [
      { label: "NIST/MEP — overall equipment effectiveness basics", url: "https://www.nist.gov/mep" },
    ],
    related: ["machining-cycle-time-calculator", "machine-efficiency-calculator", "material-removal-rate-calculator", "feed-rate-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];

function milling_ap_label(): string {
  return "Depth of engagement (ap)";
}
