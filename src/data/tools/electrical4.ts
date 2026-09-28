import type { ToolDefinition } from "@/lib/types";
import { seriesResistance, currentDivider, rcTimeConstant } from "@/lib/engines/electrical4";

export const ELECTRICAL4_TOOLS: ToolDefinition[] = [
  {
    slug: "series-resistor-calculator",
    category: "electrical",
    name: "Series Resistor Calculator",
    title: "Series Resistor Calculator — Equivalent Resistance | IngCalc",
    description:
      "Calculate the equivalent resistance of two to five resistors in series, with the largest voltage-share note. The series companion of the parallel calculator.",
    summary:
      "Enter two or more resistor values to get the series equivalent — a straight sum, with the biggest resistor's voltage share shown.",
    keywords: ["series resistor calculator", "resistors in series", "series resistance formula", "series circuit calculator"],
    inputs: [
      { id: "r1", label: "R1", kind: "number", unit: "Ω", defaultValue: 470, min: 0.01, step: 1 },
      { id: "r2", label: "R2", kind: "number", unit: "Ω", defaultValue: 1000, min: 0.01, step: 1 },
      { id: "r3", label: "R3 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
      { id: "r4", label: "R4 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
      { id: "r5", label: "R5 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
    ],
    calc: seriesResistance,
    formula: ["R_eq = R₁ + R₂ + ... + Rₙ"],
    variables: [
      { symbol: "R_eq", meaning: "Equivalent series resistance", unit: "Ω" },
    ],
    howItWorks: [
      "Series resistances simply add — the same current flows through every element.",
      "Voltage divides proportionally: the biggest resistor takes the biggest share of the supply.",
      "The percentage row shows the dominant element's share at a glance.",
    ],
    example:
      "470 Ω + 1 kΩ in series: 1470 Ω. On a 12 V supply, the same 8.16 mA flows through both; the 1 kΩ drops 8.2 V (68%) and the 470 Ω drops 3.8 V — the voltage divider pattern in series form.",
    interpretation:
      "Series adds resistance (and inductance, and capacitor ESR); parallel adds conductance. Series is how you build values you cannot buy, share voltage across elements, or add current limiting. Two caveats: tolerance stacks (±5% parts in series make ±5% of the sum, not of each), and power rating stays per-element — each resistor dissipates its own I²R share.",
    assumptions: [
      "Ideal resistors in a single series path.",
      "Same current through every element (true series connection).",
    ],
    limitations: [
      "No stray effects (lead inductance/capacitance) at high frequency.",
      "Not for mixed series-parallel networks — reduce them in stages.",
    ],
    faqs: [
      {
        q: "What is the formula for resistors in series?",
        a: "Just add them: R_eq = R₁ + R₂ + … The same current flows through all; voltages divide in proportion to each resistance.",
      },
      {
        q: "When should I use series instead of parallel?",
        a: "Series when you need a bigger resistance or to split voltage/power across elements; parallel when you need smaller resistance or to share current.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — resistors in series", url: "https://www.electronics-tutorials.ws/resistor/res_2.html" },
    ],
    related: ["parallel-resistor-calculator", "voltage-divider-calculator", "ohms-law-calculator", "current-divider-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "current-divider-calculator",
    category: "electrical",
    name: "Current Divider Calculator",
    title: "Current Divider Calculator — Branch Currents | IngCalc",
    description:
      "Calculate how current splits between two parallel branches: branch currents, equivalent resistance and percentage share — the dual of the voltage divider.",
    summary:
      "Enter total current and both branch resistances to get each branch's current — remembering the 'opposite resistor' formula that trips everyone once.",
    keywords: ["current divider calculator", "branch current calculator", "parallel current split", "current divider formula"],
    inputs: [
      { id: "totalCurrent", label: "Total current", kind: "number", defaultValue: 1, min: 0.001, step: 0.1,
        unitOptions: [
          { value: "A", label: "A", factor: 1 },
          { value: "mA", label: "mA (×0.001)", factor: 0.001 },
        ],
        defaultUnit: "A" },
      { id: "r1", label: "Branch 1 resistance", kind: "number", unit: "Ω", defaultValue: 100, min: 0.01, step: 1 },
      { id: "r2", label: "Branch 2 resistance", kind: "number", unit: "Ω", defaultValue: 220, min: 0.01, step: 1 },
    ],
    calc: currentDivider,
    formula: ["I₁ = I_total × R₂ / (R₁ + R₂)", "I₂ = I_total − I₁"],
    variables: [
      { symbol: "I₁, I₂", meaning: "Branch currents", unit: "A" },
      { symbol: "R_eq", meaning: "Equivalent parallel resistance", unit: "Ω" },
    ],
    howItWorks: [
      "Both branches share the same voltage; currents split inversely to resistance.",
      "The formula carries the OPPOSITE branch's resistance in the numerator — the classic first-time error.",
      "The percentage share shows dominance: the 100 Ω branch takes more than the 220 Ω branch.",
    ],
    example:
      "1 A total splitting into 100 Ω and 220 Ω: I₁ = 1 × 220/320 = 0.688 A through the 100 Ω branch; the 220 Ω branch takes 0.312 A. Equivalent: 68.8 Ω — lower than either, as parallel always is.",
    interpretation:
      "The current divider is how shunts, current mirrors and parallel loads all work: lower resistance grabs more current. It is also the warning behind paralleling unequal loads — the lowest-value path hogs current and its share of heating. For more than two branches, compute R_eq first and use I_branch = I_total × (R_eq/R_branch).",
    assumptions: [
      "Two parallel branches sharing one voltage node pair.",
      "DC or purely resistive AC.",
    ],
    limitations: [
      "More than two branches needs the equivalent-resistance form.",
      "Reactive branches split current by impedance magnitude and phase — AC adds vector math.",
    ],
    faqs: [
      {
        q: "What is the current divider formula?",
        a: "I₁ = I_total × R₂ ÷ (R₁ + R₂) for two branches — notice the OPPOSITE resistor in the numerator. The smaller resistance draws the larger current.",
      },
      {
        q: "Why does the formula use the opposite resistor?",
        a: "Because branches share the same voltage: I = V/R, and V = I_total × R_eq. Working it through, each branch's current ends up proportional to the OTHER branch's resistance.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — current divider circuit", url: "https://www.electronics-tutorials.ws/dccircuits/current-divider.html" },
    ],
    related: ["parallel-resistor-calculator", "voltage-divider-calculator", "ohms-law-calculator", "series-resistor-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "rc-time-constant-calculator",
    category: "electrical",
    name: "RC Time Constant Calculator",
    title: "RC Time Constant Calculator — τ, Charge Curve & Delay | IngCalc",
    description:
      "Calculate the RC time constant, voltage after any time, and time to reach a target percentage — the 63.2% and 5τ design milestones explained.",
    summary:
      "Enter R and C to get τ, the practical 5τ settle time, the voltage at any instant, and the time to any target — the exponential that governs delays and filters.",
    keywords: ["rc time constant calculator", "rc circuit calculator", "capacitor charging time", "rc delay calculator"],
    inputs: [
      { id: "resistance", label: "Resistance", kind: "number", defaultValue: 10000, min: 0.1, step: 100,
        unitOptions: [
          { value: "ohm", label: "Ω", factor: 1 },
          { value: "kohm", label: "kΩ (×1000)", factor: 1000 },
          { value: "Mohm", label: "MΩ (×1e6)", factor: 1e6 },
        ],
        defaultUnit: "kohm" },
      { id: "capacitance", label: "Capacitance", kind: "number", defaultValue: 10, min: 1e-12, step: 1,
        unitOptions: [
          { value: "uf", label: "µF", factor: 1e-6 },
          { value: "nf", label: "nF", factor: 1e-9 },
          { value: "f", label: "F", factor: 1 },
        ],
        defaultUnit: "uf" },
      { id: "time", label: "Time elapsed (optional)", kind: "number", defaultValue: 0.1, min: 0, step: 0.01,
        unitOptions: [
          { value: "ms", label: "ms (×0.001)", factor: 0.001 },
          { value: "s", label: "s", factor: 1 },
        ],
        defaultUnit: "ms", optional: true,
        help: "Leave blank to skip the instantaneous voltage." },
      { id: "targetPct", label: "Target charge % (optional)", kind: "number", defaultValue: 90, min: 0.1, max: 99.9, step: 1, unit: "%",
        optional: true, help: "Leave blank to skip the time-to-target." },
    ],
    calc: rcTimeConstant,
    formula: ["τ = R × C", "V(t) = V₀ × (1 − e^(−t/τ))", "t(target) = −τ × ln(1 − V/V₀)"],
    variables: [
      { symbol: "τ", meaning: "Time constant", unit: "s" },
      { symbol: "t", meaning: "Elapsed time", unit: "s" },
    ],
    howItWorks: [
      "τ = RC is the circuit's natural clock: 63.2% charged at 1τ, 86.5% at 2τ, 99.3% at 5τ.",
      "The exponential curve answers 'voltage after t' and its inverse 'time to reach V'.",
      "5τ is the engineering 'fully settled' milestone used in debounce and delay design.",
    ],
    example:
      "10 kΩ × 10 µF: τ = 100 ms — 63.2% charged at 100 ms, practically full at 500 ms. To reach 90%: t = −0.1 × ln(0.1) = 230 ms. The same circuit is a low-pass filter with f₋₃dB = 1/(2πRC) = 1.59 Hz.",
    interpretation:
      "The RC exponential is everywhere: switch debounces, reset delays, LED fade, analog filtering and timing circuits all live on this curve. Design lever: pick the time constant you need and solve for R×C, then choose R to respect the currents (high R saves power but invites noise; low C costs money and space). The same τ defines the filter corner f = 1/(2πRC) — the capacitor that delays also filters.",
    assumptions: [
      "Ideal RC — no source impedance, no capacitor ESR or leakage.",
      "Single charging (or discharging) event from a fixed supply.",
    ],
    limitations: [
      "Electrolytic capacitor tolerance (±20%) shifts real timing — design with margin.",
      "Repeated switching (PWM) behavior needs the steady-state ripple analysis, not a single curve.",
    ],
    faqs: [
      {
        q: "What is the RC time constant?",
        a: "τ = R × C seconds — the time to charge to 63.2% (or discharge to 36.8%). After 5τ the circuit is 99.3% settled, the practical 'done' milestone.",
      },
      {
        q: "How long does a capacitor take to charge?",
        a: "Mathematically never 100%; practically 5τ ≈ 99.3%. A 10 kΩ/10 µF pair: 0.5 s. Solve exact targets with t = −τ·ln(1 − V/V₀).",
      },
    ],
    references: [
      { label: "Electronics Tutorials — RC charging circuit", url: "https://www.electronics-tutorials.ws/rc/rc_1.html" },
    ],
    related: ["capacitor-energy-calculator", "reactance-calculator", "ohms-law-calculator", "parallel-resistor-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
