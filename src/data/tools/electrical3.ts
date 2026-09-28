import type { ToolDefinition } from "@/lib/types";
import { parallelResistance, capacitorEnergy, reactance } from "@/lib/engines/electrical3";

export const ELECTRICAL3_TOOLS: ToolDefinition[] = [
  {
    slug: "parallel-resistor-calculator",
    category: "electrical",
    name: "Parallel Resistor Calculator",
    title: "Parallel Resistor Calculator — Equivalent Resistance | IngCalc",
    description:
      "Calculate the equivalent resistance of two to five resistors in parallel, with conductance and the dominant-branch note. Instant result per EIA color values.",
    summary:
      "Enter two or more resistor values to get the parallel equivalent — always smaller than the smallest branch, with the conductance sum shown.",
    keywords: ["parallel resistor calculator", "resistors in parallel", "parallel resistance formula", "equivalent resistance"],
    inputs: [
      { id: "r1", label: "R1", kind: "number", unit: "Ω", defaultValue: 1000, min: 0.01, step: 1 },
      { id: "r2", label: "R2", kind: "number", unit: "Ω", defaultValue: 2200, min: 0.01, step: 1 },
      { id: "r3", label: "R3 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
      { id: "r4", label: "R4 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
      { id: "r5", label: "R5 (optional)", kind: "number", unit: "Ω", min: 0.01, step: 1, optional: true },
    ],
    calc: parallelResistance,
    formula: ["1/R_eq = 1/R₁ + 1/R₂ + ... + 1/Rₙ", "two resistors shortcut: R_eq = R₁ × R₂ / (R₁ + R₂)"],
    variables: [
      { symbol: "R_eq", meaning: "Equivalent parallel resistance", unit: "Ω" },
      { symbol: "G", meaning: "Conductance sum (1/R)", unit: "S" },
    ],
    howItWorks: [
      "Each parallel branch shares the same voltage; the currents add, so conductances (1/R) add and the equivalent is their reciprocal.",
      "The equivalent resistance is always LOWER than the smallest resistor — adding parallel paths always increases total current capability.",
      "For exactly two resistors the product-over-sum shortcut gives the same answer without fractions.",
      "Equal resistors divide: n equal R in parallel give R/n — two 1 kΩ give 500 Ω, four give 250 Ω.",
    ],
    example:
      "1 kΩ ∥ 2.2 kΩ: product/sum = 1000 × 2200 / 3200 = 687.5 Ω — smaller than either. Adding a third 1 kΩ branch: conductance = 1/1000 + 1/2200 + 1/1000 = 0.002455 S → 407 Ω.",
    interpretation:
      "Parallel resistors divide current (and power) — two equal resistors each dissipate half the total, which is how you stretch a power rating (with derating for sharing mismatch). They also make non-standard values: parallel a 10 kΩ with 100 kΩ to trim down 9.1%. For current sharing to be accurate, resistors should be same tolerance and same technology.",
    assumptions: [
      "Ideal resistors — no stray capacitance or inductance (matters only at high frequency).",
      "Same voltage across every branch (true parallel connection).",
    ],
    limitations: [
      "Power sharing assumes equal-value, equal-tolerance resistors; unequal values dissipate proportionally to their conductance.",
      "Not for series-parallel networks — break those into stages and solve each.",
    ],
    faqs: [
      {
        q: "What is the formula for two resistors in parallel?",
        a: "R_eq = R₁ × R₂ ÷ (R₁ + R₂) — product over sum. Two 10 Ω resistors give 5 Ω; a 10 Ω and 30 Ω give 7.5 Ω.",
      },
      {
        q: "Why is parallel resistance always lower?",
        a: "Every parallel branch is an additional current path at the same voltage — total current can only increase, so the equivalent resistance (V/I) can only decrease.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — resistors in series and parallel", url: "https://www.electronics-tutorials.ws/resistor/res_4.html" },
    ],
    related: ["ohms-law-calculator", "resistor-color-code-calculator", "voltage-divider-calculator", "led-resistor-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "capacitor-energy-calculator",
    category: "electrical",
    name: "Capacitor Energy Calculator",
    title: "Capacitor Energy Calculator — Joules & Charge | IngCalc",
    description:
      "Calculate the energy and charge stored in a capacitor from capacitance and voltage: joules, watt-hours, coulombs and mAh, with the V² relationship explained.",
    summary:
      "Enter capacitance and voltage to get stored energy in joules and Wh, plus charge in coulombs and mAh — the numbers behind flash circuits and supercapacitor backup.",
    keywords: ["capacitor energy calculator", "capacitor joules", "capacitor charge calculator", "capacitor stored energy"],
    inputs: [
      {
        id: "capacitance", label: "Capacitance", kind: "number", defaultValue: 1000, min: 1e-12, step: 1,
        unitOptions: [
          { value: "mF", label: "millifarads (mF)", factor: 0.001 },
          { value: "uF", label: "microfarads (µF)", factor: 1e-6 },
          { value: "nF", label: "nanofarads (nF)", factor: 1e-9 },
          { value: "F", label: "farads (F)", factor: 1 },
        ],
        defaultUnit: "uF",
      },
      { id: "voltage", label: "Voltage", kind: "number", unit: "V", defaultValue: 12, min: 0.1, step: 1 },
    ],
    calc: capacitorEnergy,
    formula: ["E = ½ × C × V²", "Q = C × V"],
    variables: [
      { symbol: "E", meaning: "Stored energy", unit: "J" },
      { symbol: "Q", meaning: "Stored charge", unit: "C" },
      { symbol: "C", meaning: "Capacitance", unit: "F" },
      { symbol: "V", meaning: "Voltage across the capacitor", unit: "V" },
    ],
    howItWorks: [
      "Energy follows E = ½·C·V²: charging a capacitor stores work equal to half the charge times the final voltage.",
      "Charge follows Q = C·V directly — linear in voltage, unlike the energy's square relationship.",
      "The mAh figure converts charge at 1 mAh = 3.6 C; it describes charge, not usable energy at a load voltage.",
    ],
    example:
      "A camera flash capacitor, 1000 µF at 300 V: E = 0.5 × 0.001 × 300² = 45 J — enough for the xenon tube's burst. The same capacitance at 12 V stores just 0.072 J: voltage dominates energy. A 10 F supercapacitor at 2.7 V: 36.5 J, about 0.01 Wh.",
    interpretation:
      "The V² law is the practical takeaway: doubling the voltage quadruples stored energy — and quadruples the arc-flash hazard on power-electronics bus capacitors, which stay charged long after power-off. Supercapacitors hold far less energy per kg than batteries (roughly 5-10 Wh/kg vs 100-250), but accept millions of cycles and deliver enormous power — that trade decides the application.",
    assumptions: [
      "Ideal capacitor; real ESR dissipates a few percent on fast discharge.",
      "Fully charged to V and discharged fully for the energy figure.",
    ],
    limitations: [
      "Capacitor voltage rating must exceed the working voltage with margin (typically 20%+).",
      "Series-connected capacitors share voltage unevenly without balancing resistors.",
    ],
    faqs: [
      {
        q: "How much energy is in a capacitor?",
        a: "E = ½·C·V² joules. A 1000 µF cap at 12 V holds 0.072 J; at 300 V the same cap holds 45 J — 625× more, because voltage enters squared.",
      },
      {
        q: "Why half of C·V²?",
        a: "As the capacitor charges, its voltage rises from 0 to V, so the average voltage during charging is V/2. Energy = Q × V_avg = (C·V) × (V/2) = ½·C·V². The other half is dissipated in the charging resistance — a thermodynamic fact, not a design choice.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — energy stored in a capacitor", url: "https://www.electronics-tutorials.ws/capacitor/cap_7.html" },
    ],
    related: ["ohms-law-calculator", "parallel-resistor-calculator", "battery-runtime-calculator", "reactance-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "reactance-calculator",
    category: "electrical",
    name: "Reactance Calculator",
    title: "Inductive & Capacitive Reactance Calculator | IngCalc",
    description:
      "Calculate inductive reactance (Xʟ = 2πfL) or capacitive reactance (X꜀ = 1/2πfC) at any frequency, with angular frequency and the phase behavior explained.",
    summary:
      "Pick component type, enter the value and frequency, and get the reactance in ohms — the AC 'resistance' of inductors and capacitors.",
    keywords: ["reactance calculator", "inductive reactance", "capacitive reactance", "xl 2pi fl", "impedance of capacitor"],
    inputs: [
      {
        id: "type", label: "Component", kind: "select",
        options: [
          { value: "inductive", label: "Inductor (Xʟ = 2πfL)" },
          { value: "capacitive", label: "Capacitor (X꜀ = 1/2πfC)" },
        ],
        defaultOption: "inductive",
      },
      {
        id: "inductance", label: "Inductance", kind: "number", defaultValue: 10, min: 1e-9, step: 1,
        unitOptions: [
          { value: "H", label: "henries (H)", factor: 1 },
          { value: "mH", label: "millihenries (mH)", factor: 0.001 },
          { value: "uH", label: "microhenries (µH)", factor: 1e-6 },
        ],
        defaultUnit: "mH",
        showIf: (raw) => (raw.type ?? "inductive") === "inductive",
      },
      {
        id: "capacitance", label: "Capacitance", kind: "number", defaultValue: 10, min: 1e-12, step: 1,
        unitOptions: [
          { value: "uF", label: "microfarads (µF)", factor: 1e-6 },
          { value: "nF", label: "nanofarads (nF)", factor: 1e-9 },
          { value: "F", label: "farads (F)", factor: 1 },
        ],
        defaultUnit: "uF",
        showIf: (raw) => raw.type === "capacitive",
      },
      {
        id: "frequency", label: "Frequency", kind: "number", defaultValue: 60, min: 0.01, step: 1,
        unitOptions: [
          { value: "Hz", label: "Hz", factor: 1 },
          { value: "kHz", label: "kHz", factor: 1000 },
          { value: "MHz", label: "MHz", factor: 1e6 },
        ],
        defaultUnit: "Hz",
      },
    ],
    calc: reactance,
    formula: ["Xʟ = 2π × f × L", "X꜀ = 1 / (2π × f × C)"],
    variables: [
      { symbol: "X", meaning: "Reactance magnitude", unit: "Ω" },
      { symbol: "f", meaning: "Frequency", unit: "Hz" },
      { symbol: "L, C", meaning: "Inductance / capacitance", unit: "H, F" },
    ],
    howItWorks: [
      "Inductive reactance rises with frequency: Xʟ = 2πfL — an inductor passes DC and increasingly blocks AC.",
      "Capacitive reactance falls with frequency: X꜀ = 1/(2πfC) — a capacitor blocks DC and passes high frequencies.",
      "Reactance shifts phase: current lags 90° through an inductor, leads 90° through a capacitor — the basis of filters and PF correction.",
    ],
    example:
      "A 10 mH inductor at 60 Hz: Xʟ = 2π × 60 × 0.01 = 3.77 Ω; at 10 kHz it is 628 Ω — 167× higher, why the same coil works as a choke. A 10 µF capacitor at 60 Hz: X꜀ = 265 Ω; at 10 kHz, 1.59 Ω. These are exactly the figures for sizing PF-correction capacitors and filter chokes.",
    interpretation:
      "Reactance is the AC resistance that sets filter corner frequencies (f = 1/2πRC or 1/2π√(LC) for LC), motor-run capacitor sizing, and choke design. It is not loss: an ideal reactance stores and returns energy each cycle, so a capacitor drawing kVARs adds little to your kWh bill — but it does load the conductors, which is why PF correction exists.",
    assumptions: [
      "Ideal components: real parts add series resistance (ESR) and self-resonance above which behavior inverts.",
      "Sinusoidal steady state at the stated frequency.",
    ],
    limitations: [
      "At self-resonant frequency and beyond, real inductors act capacitive (and vice versa).",
      "Magnetic-core inductors lose inductance with DC bias (saturation).",
    ],
    faqs: [
      {
        q: "What is the reactance of a capacitor at 60 Hz?",
        a: "X꜀ = 1/(2π·60·C). A 10 µF capacitor shows 265 Ω; a 100 µF shows 26.5 Ω. Bigger capacitors and higher frequencies both mean lower reactance.",
      },
      {
        q: "Is reactance the same as impedance?",
        a: "Impedance is the vector sum of resistance and reactance: Z = √(R² + X²). Reactance is the imaginary part alone — no energy is lost in ideal reactance, only in the resistive part.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — AC inductance and capacitance", url: "https://www.electronics-tutorials.ws/accircuits/ac-inductance.html" },
    ],
    related: ["three-phase-power-calculator", "power-factor-calculator", "capacitor-energy-calculator", "ohms-law-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
