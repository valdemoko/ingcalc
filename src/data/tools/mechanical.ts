import type { ToolDefinition } from "@/lib/types";
import { gearRatio, torquePower, boltTorque, beltLength, tapDrill } from "@/lib/engines/mechanical";

export const MECHANICAL_TOOLS: ToolDefinition[] = [
  {
    slug: "gear-ratio-calculator",
    category: "mechanical",
    name: "Gear Ratio Calculator",
    title: "Gear Ratio Calculator — RPM & Torque from Teeth Count | IngCalc",
    description:
      "Calculate gear ratio from teeth counts, with output RPM and torque including mesh efficiency. Supports single-stage and explained multi-stage use.",
    summary:
      "Enter driver and driven teeth to get the ratio, output speed and output torque — with the mesh efficiency and multi-stage notes spelled out.",
    keywords: ["gear ratio calculator", "gear rpm calculator", "gear torque calculator", "gear reduction"],
    inputs: [
      { id: "driverTeeth", label: "Driver gear teeth", kind: "number", defaultValue: 20, min: 5, step: 1 },
      { id: "drivenTeeth", label: "Driven gear teeth", kind: "number", defaultValue: 60, min: 5, step: 1 },
      { id: "inputRpm", label: "Input speed", kind: "number", unit: "RPM", defaultValue: 1750, min: 0, step: 10, optional: true },
      { id: "inputTorque", label: "Input torque", kind: "number", unit: "N·m", defaultValue: 10, min: 0, step: 0.5, optional: true },
    ],
    calc: gearRatio,
    formula: ["Ratio = N_driven / N_driver", "Output RPM = Input RPM / Ratio", "Output torque ≈ Input torque × Ratio × 0.97"],
    variables: [
      { symbol: "N", meaning: "Number of teeth", unit: "—" },
      { symbol: "n", meaning: "Rotational speed", unit: "RPM" },
      { symbol: "T", meaning: "Torque", unit: "N·m" },
    ],
    howItWorks: [
      "Ratio is driven teeth ÷ driver teeth: a number above 1 means reduction (slower output, more torque).",
      "Output speed divides the input speed by the ratio; output torque multiplies it, reduced by a 97% single-mesh efficiency.",
      "Leave speed or torque blank if you only need the ratio itself.",
    ],
    example:
      "A 20-tooth pinion drives a 60-tooth gear at 1750 RPM with 10 N·m input. Ratio = 3:1. Output = 583 RPM with about 29.1 N·m — a classic 3:1 reduction stage.",
    interpretation:
      "Ratios above 1 reduce speed and multiply torque; below 1 they overdrive. Two-stage gearboxes multiply stage ratios (e.g. 3:1 × 4:1 = 12:1) and lose about 3% per mesh. For belt or chain drives the same math applies using diameter or tooth counts respectively.",
    assumptions: [
      "Single mesh per calculation; 97% efficiency per mesh for spur gears.",
      "Rigid mounting, no backlash dynamics considered.",
    ],
    limitations: [
      "Worm gears have much lower efficiency (30–70%) — do not apply 97% there.",
      "Bevel and helical meshes differ slightly; planetary systems need a different ratio method.",
    ],
    faqs: [
      {
        q: "How do I calculate gear ratio with three gears?",
        a: "Idler gears in between don't change the ratio — only the first driver and last driven matter. For two stages (two shafts), multiply the stage ratios.",
      },
      {
        q: "Does a bigger gear always mean more torque?",
        a: "A larger driven gear multiplies torque and reduces speed. Power stays roughly constant (minus losses): you trade speed for torque.",
      },
    ],
    references: [
      { label: "Machinery's Handbook — gear ratio fundamentals", url: "https://www.industrialpress.com/machinerys-handbook" },
    ],
    related: ["torque-power-calculator", "belt-length-calculator", "tap-drill-calculator", "bolt-torque-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "torque-power-calculator",
    category: "mechanical",
    name: "Torque to Power Calculator",
    title: "Torque to Power Calculator — N·m to kW & hp | IngCalc",
    description:
      "Convert torque and RPM to mechanical power in kW, hp and lb·ft. Includes the exact formulas and the difference between shaft, brake and rated power.",
    summary:
      "Enter torque and rotational speed to get mechanical power in kW and hp, with the torque converted to lb·ft for imperial work.",
    keywords: ["torque to power calculator", "nm to hp", "kw calculator", "torque rpm power formula"],
    inputs: [
      { id: "torque", label: "Torque", kind: "number", defaultValue: 50, min: 0.01, step: 1,
        unitOptions: [
          { value: "Nm", label: "N·m", factor: 1 },
          { value: "lbft", label: "lb·ft", factor: 1.35582 },
        ],
        defaultUnit: "Nm",
      },
      { id: "rpm", label: "Rotational speed", kind: "number", unit: "RPM", defaultValue: 1500, min: 1, step: 10 },
    ],
    calc: torquePower,
    formula: ["P(kW) = T(N·m) × RPM / 9549", "hp = kW × 1.341"],
    variables: [
      { symbol: "P", meaning: "Mechanical power", unit: "kW" },
      { symbol: "T", meaning: "Torque", unit: "N·m" },
      { symbol: "n", meaning: "Rotational speed", unit: "RPM" },
    ],
    howItWorks: [
      "Power is torque times angular velocity: P = T × 2π × n/60, simplified to T × n / 9549 in SI units.",
      "The tool converts the same power to horsepower (1.341 hp per kW) and the torque to lb·ft.",
    ],
    example:
      "A motor delivering 50 N·m at 1500 RPM produces 50 × 1500 / 9549 = 7.85 kW ≈ 10.5 hp — right at the rating of a common 7.5 kW motor at service factor.",
    interpretation:
      "At constant torque, power rises linearly with speed; at constant power, torque falls as speed rises. This is why vehicles feel strong at low RPM (high torque) and electric motors deliver full torque from zero RPM. Compare against motor nameplates: rated power is continuous output, not peak.",
    assumptions: [
      "Steady rotation at the stated speed — no acceleration torque included.",
      "Shaft power at the coupling; drivetrain losses downstream are not considered.",
    ],
    limitations: [
      "Does not apply to linear motion (use P = F × v).",
      "Engine 'brake horsepower' measured at the crank differs from wheel power by drivetrain losses (10–15%).",
    ],
    faqs: [
      {
        q: "How many kW is 100 N·m at 3000 RPM?",
        a: "100 × 3000 / 9549 = 31.4 kW, about 42 hp. The constant 9549 is 60,000/2π — it converts torque × angular velocity into kilowatts directly.",
      },
      {
        q: "What's the difference between kW and hp?",
        a: "They measure the same thing. 1 kW = 1.341 mechanical hp. Europe rates motors in kW; the US traditionally uses hp.",
      },
    ],
    references: [
      { label: "ISO 80000-3 — SI units for rotational mechanics", url: "https://www.iso.org/standard/79916.html" },
    ],
    related: ["gear-ratio-calculator", "bolt-torque-calculator", "belt-length-calculator", "motor-current-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "bolt-torque-calculator",
    category: "mechanical",
    name: "Bolt Torque Calculator",
    title: "Bolt Torque Calculator — Metric Grades 4.6 to 12.9 | IngCalc",
    description:
      "Calculate tightening torque for metric bolts by grade and size, with preload at 75% of proof load and dry or lubricated friction. Includes the K-factor model.",
    summary:
      "Get the tightening torque for a metric bolt from its size, grade and lubrication state — with the preload, stress area and K-factor assumptions documented.",
    keywords: ["bolt torque calculator", "metric bolt torque chart", "torque spec calculator", "bolt preload"],
    inputs: [
      { id: "diameter", label: "Nominal diameter", kind: "number", unit: "mm", defaultValue: 12, min: 3, max: 64, step: 1 },
      {
        id: "grade", label: "Bolt grade (ISO)", kind: "select",
        options: [
          { value: "4.6", label: "4.6 (low strength)" },
          { value: "5.8", label: "5.8" },
          { value: "8.8", label: "8.8 (structural standard)" },
          { value: "10.9", label: "10.9 (high strength)" },
          { value: "12.9", label: "12.9 (highest)" },
        ],
        defaultOption: "8.8",
      },
      {
        id: "lube", label: "Thread condition", kind: "select",
        options: [
          { value: "dry", label: "Dry / as-received (K = 0.20)" },
          { value: "lubricated", label: "Lubricated (K = 0.15)" },
        ],
        defaultOption: "dry",
      },
    ],
    calc: boltTorque,
    formula: ["T = K × F × d", "F = 0.75 × proof stress × tensile stress area"],
    variables: [
      { symbol: "T", meaning: "Tightening torque", unit: "N·m" },
      { symbol: "K", meaning: "Nut factor (friction)", unit: "—" },
      { symbol: "F", meaning: "Bolt preload", unit: "N" },
      { symbol: "d", meaning: "Nominal diameter", unit: "m" },
    ],
    howItWorks: [
      "The tensile stress area is computed from the nominal diameter and the standard coarse pitch (ISO 898 approximation).",
      "Preload is set at 75% of the proof load for the selected grade — the standard design practice for reusable fasteners.",
      "Torque follows T = K × F × d with K = 0.20 dry or 0.15 lubricated, the widely used nut-factor model.",
    ],
    example:
      "An M12 grade 8.8 bolt, dry: stress area ≈ 84.3 mm², proof stress 580 MPa, preload = 0.75 × 580 × 84.3 ≈ 36.7 kN. Torque = 0.2 × 36,700 × 0.012 ≈ 88 N·m (65 lb·ft). Lubricated, the same preload needs only about 66 N·m.",
    interpretation:
      "The torque achieves a target stretch (preload), not the torque itself — lubrication changes the torque needed for the same preload dramatically. If a joint leaks or loosens, check lubrication and reused-bolt conditions before increasing torque. Yield-torque (TTI) bolts and critical gasketed joints must follow manufacturer specs.",
    assumptions: [
      "ISO metric coarse threads, steel bolt and nut, standard washer.",
      "75% of proof load (JOINT NOT PERMANENT). Joints torqued to yield use ~90%.",
    ],
    limitations: [
      "The nut factor varies 0.10–0.25 with coating, plating and washers — real preload scatter is ±25–35% even with controlled torque.",
      "Fine threads, flanged heads and prevailing-torque nuts need specific data.",
      "Aluminum or cast housings may limit clamp load below the bolt's capacity.",
    ],
    faqs: [
      {
        q: "What torque for an M8 8.8 bolt?",
        a: "About 24 N·m dry (18 lb·ft). Lubricated, roughly 18 N·m achieves the same preload — always note the condition used.",
      },
      {
        q: "Why does lubrication reduce torque?",
        a: "Most tightening torque is consumed by thread and underhead friction, not bolt stretch. Reducing friction sends more torque into stretch, so less input torque reaches the same preload.",
      },
    ],
    references: [
      { label: "ISO 898-1 — Mechanical properties of fasteners", url: "https://www.iso.org/standard/64773.html" },
      { label: "VDI 2230 — Systematic calculation of bolted joints", url: "https://www.vdi.de/richtlinien/details/vdi-2230-blatt-1-systematische-berechnung-hochbeanspruchter-schraubenverbindungen" },
    ],
    related: ["tap-drill-calculator", "torque-power-calculator", "gear-ratio-calculator", "belt-length-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "belt-length-calculator",
    category: "mechanical",
    name: "Belt Length Calculator",
    title: "Belt Length Calculator — Pulley Sizes & Center Distance | IngCalc",
    description:
      "Calculate open-belt length from two pulley diameters and center distance, with speed ratio. Classical V-belt/flat-belt geometry, metric and imperial output.",
    summary:
      "Enter both pulley pitch diameters and the center distance to get the belt pitch length in mm and inches, plus the speed ratio.",
    keywords: ["belt length calculator", "v-belt size calculator", "pulley belt length", "belt drive calculation"],
    inputs: [
      { id: "d1", label: "Driver pulley pitch diameter", kind: "number", unit: "mm", defaultValue: 100, min: 10, step: 1 },
      { id: "d2", label: "Driven pulley pitch diameter", kind: "number", unit: "mm", defaultValue: 200, min: 10, step: 1 },
      { id: "cd", label: "Center distance", kind: "number", unit: "mm", defaultValue: 400, min: 20, step: 5 },
    ],
    calc: beltLength,
    formula: ["L = 2C + π(D + d)/2 + (D − d)² / (4C)"],
    variables: [
      { symbol: "L", meaning: "Belt pitch length", unit: "mm" },
      { symbol: "C", meaning: "Center distance", unit: "mm" },
      { symbol: "D, d", meaning: "Large and small pitch diameters", unit: "mm" },
    ],
    howItWorks: [
      "The belt wraps two straight runs plus arcs on each pulley; the classical open-belt equation collapses that geometry into one formula.",
      "Use pitch diameters for V-belts (roughly the groove's effective depth) and outer diameter for flat belts.",
      "The speed ratio comes from the diameter ratio, identical logic to gears.",
    ],
    example:
      "A 100 mm driver and 200 mm driven pulley at 400 mm centers: L = 800 + π×150 + (100)²/1600 = 800 + 471 + 6.25 ≈ 1,277 mm. Order the nearest standard SPZ/A-section belt near 1,275 mm.",
    interpretation:
      "Order the nearest standard belt designation — V-belts come in fixed pitch lengths. If the belt is significantly shorter than calculated, it won't fit around both pulleys; much longer and the tensioner may run out of adjustment. The (D−d)² term shows that large diameter differences demand longer belts for the same center distance.",
    assumptions: [
      "Open (non-crossed) belt drive, both pulleys in the same plane.",
      "Rigid pulleys, no belt slip or creep.",
    ],
    limitations: [
      "Timing belts use pitch (tooth) length — use the manufacturer's pitch-line calculation instead.",
      "Jockey/idler pulleys and serpentine paths are not modeled.",
      "Does not check minimum wrap angle (keep ≥120° on the small pulley for V-belts).",
    ],
    faqs: [
      {
        q: "Should I measure the old belt instead?",
        a: "A worn belt has stretched — measuring it overestimates. Use the geometry calculation, then select the closest standard belt; tensioners absorb the small difference.",
      },
      {
        q: "What is pitch diameter?",
        a: "For V-belts it's the effective diameter at the belt's neutral axis in the groove — slightly larger than the groove bottom, smaller than the outer edge. Manufacturers publish pulley pitch diameters.",
      },
    ],
    references: [
      { label: "Machinery's Handbook — belt drive geometry", url: "https://www.industrialpress.com/machinerys-handbook" },
    ],
    related: ["gear-ratio-calculator", "torque-power-calculator", "bolt-torque-calculator", "tap-drill-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "tap-drill-calculator",
    category: "mechanical",
    name: "Tap Drill Calculator",
    title: "Tap Drill Size Calculator — Metric & 75% Thread | IngCalc",
    description:
      "Calculate tap drill size for metric threads at any thread engagement percentage, with the standard 75% recommendation and nearest drill bit size.",
    summary:
      "Enter the thread major diameter and pitch to get the tap drill at 75% thread, adjustable for other engagement percentages, plus the nearest real drill bit.",
    keywords: ["tap drill calculator", "tap drill size metric", "tap drill chart", "thread engagement drill size"],
    inputs: [
      { id: "major", label: "Major diameter", kind: "number", unit: "mm", defaultValue: 6, min: 1, step: 0.5 },
      { id: "pitch", label: "Thread pitch", kind: "number", unit: "mm", defaultValue: 1, min: 0.25, step: 0.05, help: "M6×1 → 1. M8×1.25 → 1.25. Coarse pitch is standard unless stated." },
      {
        id: "threadPct", label: "Thread engagement", kind: "number", unit: "%", defaultValue: 75, min: 50, max: 100, step: 5,
        help: "75% is standard. 65–70% for hard/tough materials, up to 85% for maximum strength in aluminum.",
      },
    ],
    calc: tapDrill,
    formula: ["Tap drill (75%) = D − P", "Other engagement: drill = D − P × (target% / 75)"],
    variables: [
      { symbol: "D", meaning: "Major diameter", unit: "mm" },
      { symbol: "P", meaning: "Thread pitch", unit: "mm" },
      { symbol: "%", meaning: "Thread engagement percentage", unit: "—" },
    ],
    howItWorks: [
      "A 100% thread would fill the full V; tap drills cut a partial thread. The standard 75% engagement comes from drill = major − pitch.",
      "Higher engagement percentages need a smaller drill: the calculator adjusts the hole linearly to your target.",
      "The nearest larger standard drill bit is suggested since drills come in discrete sizes.",
    ],
    example:
      "M6×1 at 75%: drill = 6 − 1 = 5.0 mm — the classic answer. At 65% for stainless: hole = 6 − 0.65 = 5.35 mm, so a 5.4 mm bit reduces tap breakage risk noticeably.",
    interpretation:
      "75% thread delivers nearly full strength (over 90% of a 100% thread) with far less tapping torque — the standard compromise. In tough alloys, dropping to 65–70% trades a few percent of strength for much lower tap breakage risk. Softer aluminum benefits from 80–85% engagement.",
    assumptions: [
      "ISO metric threads with uniform 60° profile.",
      "Drill produces a round, correctly sized hole (sharp bit, correct speed and coolant).",
    ],
    limitations: [
      "Unified inch threads use drill = major − 1/TPI for 75% — convert to mm or use an inch chart.",
      "Cast iron and gummy stainless sometimes need special tap geometry beyond drill size.",
      "Does not cover pipe threads (NPT/BSP), which taper and use different charts.",
    ],
    faqs: [
      {
        q: "What drill for M8 threads?",
        a: "M8×1.25 coarse: 6.75 mm (8 − 1.25). The nearest common bit is 6.8 mm.",
      },
      {
        q: "Why not drill 100% thread?",
        a: "A full-V thread adds almost no strength but multiplies tapping torque and chip congestion — taps break. 75% is the engineering sweet spot.",
      },
    ],
    references: [
      { label: "ISO 6410 / ISO 68-1 — screw threads representation & profiles", url: "https://www.iso.org/standard/63581.html" },
    ],
    related: ["bolt-torque-calculator", "gear-ratio-calculator", "torque-power-calculator", "belt-length-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
];
