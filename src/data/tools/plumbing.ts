import type { ToolDefinition } from "@/lib/types";
import { pipeFlow, pipePressureDrop, pipeSize, pipeVolume, tankVolume } from "@/lib/engines/plumbing";

export const PLUMBING_TOOLS: ToolDefinition[] = [
  {
    slug: "pipe-flow-calculator",
    category: "plumbing",
    name: "Pipe Flow Calculator",
    title: "Pipe Flow Calculator — Velocity from Flow & Diameter | IngCalc",
    description:
      "Calculate water velocity in a pipe from flow rate and internal diameter, in m/s, ft/s and gpm — with the supply design range and hammer/erosion warnings.",
    summary:
      "Enter flow and pipe size to get velocity and the verdict: good supply range, noisy, or hammer-and-erosion territory.",
    keywords: ["pipe flow calculator", "pipe velocity calculator", "water velocity in pipe", "gpm to velocity"],
    inputs: [
      { id: "flow", label: "Flow rate", kind: "number", defaultValue: 30, min: 0.1, step: 5,
        unitOptions: [
          { value: "lpm", label: "L/min", factor: 1 },
          { value: "gpm", label: "gpm (×3.785)", factor: 3.785 },
          { value: "lps", label: "L/s", factor: 60 },
        ],
        defaultUnit: "lpm" },
      { id: "diameter", label: "Internal pipe diameter", kind: "number", defaultValue: 20, min: 1, step: 1,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm",
        help: "INTERNAL diameter — schedule 40 walls reduce the nominal bore." },
    ],
    calc: pipeFlow,
    formula: ["V = Q / A        A = π·D²/4"],
    variables: [
      { symbol: "V", meaning: "Flow velocity", unit: "m/s" },
      { symbol: "Q", meaning: "Volumetric flow", unit: "L/min" },
      { symbol: "A", meaning: "Internal cross-section", unit: "mm²" },
    ],
    howItWorks: [
      "Velocity divides the flow by the pipe's internal area — internal diameter, not nominal size.",
      "The verdict bands come from supply design practice: 0.6–2.4 m/s is the cold-water comfort zone.",
      "Imperial equivalents (ft/s, gpm) shown for US-size cross-checking.",
    ],
    example:
      "30 L/min in a 20 mm ID pipe: A = 314 mm², V = 0.5/0.000314 = 1.59 m/s — mid-range, quiet and safe. The same flow in 15 mm ID: 2.83 m/s — noisy and hammer-prone.",
    interpretation:
      "Velocity is the first check in pipe sizing: friction loss scales with V², so doubling velocity quadruples pressure loss per metre. Supply lines live at 0.6–2.4 m/s; hot water stays near 1.5 m/s to limit erosion-corrosion in copper. Drainage lines run slower by design; suction lines of pumps must stay under ~1.2 m/s or cavitation follows.",
    assumptions: [
      "Water at ambient temperature; full-bore flow.",
      "Internal diameter entered directly (use the pipe's ID table for the actual bore).",
    ],
    limitations: [
      "Does not compute pressure loss — use the pipe pressure drop calculator for the friction figure.",
      "Partially-full drainage flow follows different hydraulics (open-channel).",
    ],
    faqs: [
      {
        q: "What velocity should water flow in a pipe?",
        a: "Cold supply: 0.6–2.4 m/s (2–8 ft/s). Hot water: ≤1.5 m/s. Above ~3 m/s you get noise, hammer and erosion — especially in copper.",
      },
      {
        q: "How do I convert GPM to velocity?",
        a: "Velocity = GPM × 3.785 ÷ 60 ÷ (π/4 × ID²) with ID in metres — or just enter gpm here and read the answer.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — water flow and velocity in pipes", url: "https://www.engineeringtoolbox.com/water-velocity-pipe-d_1536.html" },
    ],
    related: ["pipe-size-calculator", "pipe-pressure-drop-calculator", "pipe-volume-calculator", "heating-power-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "pipe-pressure-drop-calculator",
    category: "plumbing",
    name: "Pipe Pressure Drop Calculator",
    title: "Pipe Pressure Drop Calculator — Darcy-Weisbach Loss | IngCalc",
    description:
      "Calculate pressure loss in a pipe run: Darcy-Weisbach head loss with the Swamee-Jain friction factor, in metres, kPa, psi and bar — laminar and turbulent.",
    summary:
      "Enter flow, size, length and material roughness to get head loss and pressure drop — the numbers that decide whether the far shower gets decent pressure.",
    keywords: ["pipe pressure drop calculator", "head loss calculator", "darcy weisbach calculator", "friction loss in pipes"],
    inputs: [
      { id: "flow", label: "Flow rate", kind: "number", defaultValue: 30, min: 0.1, step: 5,
        unitOptions: [
          { value: "lpm", label: "L/min", factor: 1 },
          { value: "gpm", label: "gpm (×3.785)", factor: 3.785 },
        ],
        defaultUnit: "lpm" },
      { id: "diameter", label: "Internal diameter", kind: "number", defaultValue: 20, min: 1, step: 1,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm" },
      { id: "length", label: "Pipe length", kind: "number", defaultValue: 30, min: 0.1, step: 1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "ft", label: "ft", factor: 0.3048 },
        ],
        defaultUnit: "m" },
      { id: "roughness", label: "Pipe roughness", kind: "number", defaultValue: 0.0015, min: 0, step: 0.0005, unit: "mm",
        help: "Copper/PEX ≈ 0.0015 · new steel ≈ 0.045 · old steel ≥ 1." },
    ],
    calc: pipePressureDrop,
    formula: ["h = f · (L/D) · V²/2g", "Δp = ρ·g·h", "f: Swamee-Jain (turbulent), 64/Re (laminar)"],
    variables: [
      { symbol: "h", meaning: "Head loss", unit: "m" },
      { symbol: "f", meaning: "Darcy friction factor", unit: "—" },
      { symbol: "Re", meaning: "Reynolds number", unit: "—" },
    ],
    howItWorks: [
      "Reynolds number from velocity and internal diameter picks the regime: laminar below 2300, turbulent above.",
      "Turbulent friction comes from the Swamee-Jain explicit equation (≈1% vs Colebrook); laminar is the exact 64/Re.",
      "Head loss converts to pressure through ρ·g — about 9.8 kPa per metre of water.",
    ],
    example:
      "30 L/min in 20 mm ID copper over 30 m: V = 1.59 m/s, Re ≈ 31,900 (turbulent), f ≈ 0.0246. h = 0.0246 × 1500 × 0.129 = 4.76 m → 46.6 kPa (6.8 psi) lost. Fittings add 20–50% on top — a real design pressure budget.",
    interpretation:
      "Pressure loss is the budget every distribution system spends: the available pressure at the street minus everything the path consumes must still satisfy the worst fixture (typically 100 kPa / 15 psi for showers). Loss scales with V² and L/D — velocity is the lever, which is why upsizing one trade size transforms long runs. Old steel pipe's rising roughness quietly strangles flow: a 1 mm roughness multiplies friction several-fold versus new copper.",
    assumptions: [
      "Water at 20 °C, straight pipe, full bore.",
      "No elevation change or fitting losses included.",
      "Smooth-wall Darcy-Weisbach model: published copper tables (Hazen-Williams, C = 145) read ~10% higher for small tubes at domestic flows.",
    ],
    limitations: [
      "Fittings, valves and bends dominate short runs — add equivalent length or 20–50% margin.",
      "For other fluids, adjust viscosity and density (this model is water-specific).",
    ],
    faqs: [
      {
        q: "How much pressure do I lose per metre of pipe?",
        a: "It depends on velocity: at 1.5 m/s in 20 mm copper, roughly 1.5 kPa per metre. Loss scales with V², so 3 m/s costs 4× as much.",
      },
      {
        q: "What is the Swamee-Jain equation?",
        a: "An explicit approximation of the Colebrook friction factor: f = 0.25/[log₁₀(ε/3.7D + 5.74/Re⁰·⁹)]². Accurate to about 1% for turbulent water mains without iterating.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — Darcy-Weisbach pressure loss", url: "https://www.engineeringtoolbox.com/darcy-weisbach-d_646.html" },
      { label: "Swamee & Jain (1976) — explicit friction factor equations", url: "https://doi.org/10.1061/(ASCE)0733-9429(1976)102:5(657)" },
      { label: "Copper Development Association — tube sizing (Hazen-Williams tables)", url: "https://copper.org/markets-and-applications/building-construction/strengthening-plumbing-systems/copper-tube-sizing-calculator/" },
    ],
    related: ["pipe-flow-calculator", "pipe-size-calculator", "pump-power-calculator", "pipe-volume-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "pipe-size-calculator",
    category: "plumbing",
    name: "Pipe Size Calculator",
    title: "Pipe Size Calculator — Diameter from Flow & Velocity | IngCalc",
    description:
      "Find the minimum pipe internal diameter for a flow rate and velocity limit, snapped to the next standard trade size, with the actual velocity shown.",
    summary:
      "Enter flow and your velocity ceiling (supply 2.4 m/s, hot 1.5, pump suction 1.2) to get the minimum bore and the next standard size up.",
    keywords: ["pipe size calculator", "pipe diameter calculator", "water pipe sizing", "what size pipe do i need"],
    inputs: [
      { id: "flow", label: "Flow rate", kind: "number", defaultValue: 30, min: 0.1, step: 5,
        unitOptions: [
          { value: "lpm", label: "L/min", factor: 1 },
          { value: "gpm", label: "gpm (×3.785)", factor: 3.785 },
        ],
        defaultUnit: "lpm" },
      { id: "maxVelocity", label: "Velocity limit", kind: "number", defaultValue: 2.4, min: 0.3, max: 5, step: 0.1, unit: "m/s",
        help: "Cold supply 2.4 · hot water 1.5 · pump suction 1.2 · drainage can differ." },
    ],
    calc: pipeSize,
    formula: ["D = √(4Q / (π·V_limit))"],
    variables: [
      { symbol: "D", meaning: "Minimum internal diameter", unit: "mm" },
      { symbol: "V_limit", meaning: "Design velocity ceiling", unit: "m/s" },
    ],
    howItWorks: [
      "Inverts the velocity relation: the smallest bore that keeps the flow at or below the velocity ceiling.",
      "Snaps up to the next standard trade size from a 8–150 mm internal-diameter series.",
      "Reports the actual velocity at the picked size so you can see the margin.",
    ],
    example:
      "30 L/min at a 2.4 m/s limit: D = √(4×0.0005/π/2.4) = 16.3 mm → next standard 20 mm. At 20 mm the actual velocity is 1.59 m/s — comfortable margin, and friction is only 40% of what the minimum bore would have cost.",
    interpretation:
      "Sizing to the velocity ceiling is the fast first pass; real designs also check the pressure budget (friction over the whole run against available pressure) and fixture-unit demand for branch sizing. When in doubt, go one size up: the pipe cost difference is trivial next to the noise, hammer and friction a tight bore adds for the life of the building.",
    assumptions: [
      "Water, full-bore steady flow.",
      "Standard trade internal diameters (8–150 mm series).",
    ],
    limitations: [
      "Fixture-unit demand sizing (probable simultaneous flow) is a separate method — this sizes for a known peak flow.",
      "Gas and compressed-air lines follow different velocity conventions.",
    ],
    faqs: [
      {
        q: "What size pipe for 30 L/min?",
        a: "At a 2.4 m/s supply limit: 20 mm internal. For hot water or long runs, check the pressure loss — 25 mm may still pay for itself.",
      },
      {
        q: "Why limit velocity in pipes?",
        a: "Noise, water hammer and erosion-corrosion all scale with velocity — and friction loss scales with V², quietly eating the pressure budget on every metre.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — pipe sizing charts", url: "https://www.engineeringtoolbox.com/pipe-sizing-d_851.html" },
    ],
    related: ["pipe-flow-calculator", "pipe-pressure-drop-calculator", "pipe-volume-calculator", "tank-volume-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "pipe-volume-calculator",
    category: "plumbing",
    name: "Pipe Volume Calculator",
    title: "Pipe Volume Calculator — Water in a Run | IngCalc",
    description:
      "Calculate the water volume and weight inside a pipe run from internal diameter and length — for flushing, disinfection, glycol batching and dead-leg waste.",
    summary:
      "Enter internal diameter and length to get the litres (or gallons) the pipe holds and what that water weighs — the number behind flushing volumes and recirculation design.",
    keywords: ["pipe volume calculator", "water volume in pipe", "pipe capacity calculator", "gallons in a pipe"],
    inputs: [
      { id: "diameter", label: "Internal diameter", kind: "number", defaultValue: 20, min: 1, step: 1,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm" },
      { id: "length", label: "Pipe length", kind: "number", defaultValue: 30, min: 0.1, step: 1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "ft", label: "ft", factor: 0.3048 },
        ],
        defaultUnit: "m" },
    ],
    calc: pipeVolume,
    formula: ["V = π/4 · d² · L"],
    variables: [
      { symbol: "V", meaning: "Internal volume", unit: "L" },
      { symbol: "d", meaning: "Internal diameter", unit: "mm" },
    ],
    howItWorks: [
      "Cylinder volume with the internal diameter: a 20 mm ID pipe holds 0.314 L per metre.",
      "Weight follows from water's density (≈1 kg/L) — relevant for hanger loads on long horizontal runs.",
      "The per-100 m row normalizes the figure for quick comparisons between sizes.",
    ],
    example:
      "A 50 m dead leg of 20 mm ID pipe: 15.7 L of water that must run off before hot water arrives — and 15.7 L heated and dumped every use. That is exactly the number recirculation loops exist to fix.",
    interpretation:
      "Dead-leg volume is the hidden waste in domestic hot water: every litre of pipe between the heater and the tap is water you heat and pour away. It also sizes disinfection batches (chlorination needs the full system volume) and glycol changes (drain and refill quantities). Weight matters on long suspended runs: water adds ~1 kg per litre to hanger loads.",
    assumptions: [
      "Water at ambient conditions (≈1 kg/L).",
      "Internal dimensions — actual bore, not nominal size.",
    ],
    limitations: [
      "Does not include fittings, valves or fixtures — add their volumes for full-system numbers.",
      "For other liquids, adjust the density for the weight row.",
    ],
    faqs: [
      {
        q: "How much water is in a pipe per metre?",
        a: "15 mm ID: 0.18 L/m. 20 mm: 0.31 L/m. 25 mm: 0.49 L/m. Multiply by the run length for the dead-leg figure.",
      },
      {
        q: "Why does pipe volume matter?",
        a: "Hot-water waste, disinfection dosing, glycol batching and hanger loading all derive from the water a run holds — it is the number behind recirculation economics.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — pipe and tubing volume", url: "https://www.engineeringtoolbox.com/pipe-volume-d_1072.html" },
    ],
    related: ["tank-volume-calculator", "pipe-flow-calculator", "pipe-size-calculator", "sensible-heat-latent-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "tank-volume-calculator",
    category: "plumbing",
    name: "Tank Volume Calculator",
    title: "Tank Volume Calculator — Cylinders & Rectangular Tanks | IngCalc",
    description:
      "Calculate tank capacity in litres, gallons and barrels from cylindrical or rectangular internal dimensions, with full-water weight for floor loading.",
    summary:
      "Enter internal dimensions to get capacity in L/gal, the weight of the water when full, and the barrel equivalent — before freeboard and outlets take their share.",
    keywords: ["tank volume calculator", "tank capacity calculator", "cylinder volume gallons", "water tank sizing"],
    inputs: [
      {
        id: "shape", label: "Tank shape", kind: "select",
        options: [
          { value: "cylinder", label: "Vertical cylinder" },
          { value: "box", label: "Rectangular / box" },
        ],
        defaultOption: "cylinder",
      },
      { id: "diameter", label: "Internal diameter", kind: "number", defaultValue: 600, min: 10, step: 10,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", showIf: (raw) => (raw.shape ?? "cylinder") === "cylinder" },
      { id: "length", label: "Internal length", kind: "number", defaultValue: 1000, min: 10, step: 10,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", showIf: (raw) => raw.shape === "box" },
      { id: "width", label: "Internal width", kind: "number", defaultValue: 600, min: 10, step: 10,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", showIf: (raw) => raw.shape === "box" },
      { id: "height", label: "Internal height / depth", kind: "number", defaultValue: 800, min: 10, step: 10,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm" },
    ],
    calc: tankVolume,
    formula: ["cylinder: V = π/4·d²·h        box: V = L·W·H"],
    variables: [
      { symbol: "V", meaning: "Internal capacity", unit: "L" },
    ],
    howItWorks: [
      "Pure geometry on internal dimensions — wall thickness excluded.",
      "Weight assumes water (≈1 kg/L); other fluids scale by specific gravity.",
      "Barrel conversion uses the US oil barrel (159 L) for fuel-storage cross-reference.",
    ],
    example:
      "A 600 mm × 800 mm vertical cylinder: V = π/4 × 0.36 × 0.8 = 226 L (60 gal), 226 kg of water full. A 1000 × 600 × 800 box: 480 L (127 gal) — check the floor: half a tonne concentrated on small feet.",
    interpretation:
      "Rated capacity is brim volume; usable capacity is what sits between the outlet and the overflow — often 70–85% of rated. When sizing storage (rainwater, buffer tanks, dosing), work backwards from the usable requirement and verify the floor or pad can carry the full weight plus the empty tank. Cylindrical tanks resist pressure better; rectangular ones ship and install more efficiently.",
    assumptions: [
      "Internal measurements at operating condition.",
      "Water density for the weight row.",
    ],
    limitations: [
      "Horizontal cylinders, cones and dished ends need different geometry.",
      "Usable volume (outlet height, freeboard, suction limits) is not deducted.",
    ],
    faqs: [
      {
        q: "How many gallons in a 1000 litre tank?",
        a: "264 US gallons. In oil barrels: 6.3. The calculator shows all three units from the dimensions directly.",
      },
      {
        q: "Why is usable capacity less than rated?",
        a: "Outlets sit above the floor (sediment), pumps need suction head, and overflows require freeboard — plan on 70–85% of the geometric volume.",
      },
    ],
    references: [
      { label: "NIST — units of volume conversions", url: "https://www.nist.gov/pml/weights-and-measures" },
    ],
    related: ["pipe-volume-calculator", "drainage-runoff-calculator", "pipe-size-calculator", "off-grid-system-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
