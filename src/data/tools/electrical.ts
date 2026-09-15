import type { ToolDefinition } from "@/lib/types";
import {
  COPPER_WIRES,
  voltageDrop,
  wireSize,
  ohmsLaw,
  ampsFromPower,
  powerFactorCorrection,
  motorCurrent,
} from "@/lib/engines/electrical";

const wireOptions = COPPER_WIRES.map((w) => ({ value: w.awg, label: w.awg }));

export const ELECTRICAL_TOOLS: ToolDefinition[] = [
  {
    slug: "voltage-drop-calculator",
    category: "electrical",
    name: "Voltage Drop Calculator",
    title: "Voltage Drop Calculator (NEC) — Single & Three Phase | IngCalc",
    description:
      "Calculate voltage drop, % drop, end-of-line voltage and power lost for copper circuits. Single and three phase, AWG and metric, with NEC-based conductor data.",
    summary:
      "Find the voltage drop in a copper circuit — absolute volts, percentage, final load voltage and heat loss. Uses NEC Chapter 9 Table 8 conductor resistances.",
    keywords: ["voltage drop calculator", "voltage drop formula", "wire voltage loss", "3 phase voltage drop"],
    inputs: [
      {
        id: "voltage", label: "Source voltage", kind: "number", unit: "V",
        defaultValue: 120, min: 1, step: 1,
        help: "Nominal system voltage: 120, 208, 240, 277, 480 V in North America.",
      },
      {
        id: "current", label: "Load current", kind: "number", unit: "A",
        defaultValue: 15, min: 0, step: 0.5,
      },
      {
        id: "length", label: "One-way run length", kind: "number",
        defaultValue: 100, min: 0, step: 1,
        unitOptions: [
          { value: "ft", label: "feet", factor: 1 },
          { value: "m", label: "meters", factor: 3.28084 },
        ],
        defaultUnit: "ft",
        help: "Distance from panel to load. The return path is added automatically.",
      },
      {
        id: "wire", label: "Conductor", kind: "select", options: wireOptions, defaultOption: "12 AWG",
      },
      {
        id: "system", label: "System", kind: "select",
        options: [
          { value: "single", label: "Single-phase (2-wire)" },
          { value: "three", label: "Three-phase (3-wire)" },
        ],
        defaultOption: "single",
      },
    ],
    calc: voltageDrop,
    formula: [
      "Single-phase: Vd = 2 × I × R × L",
      "Three-phase:  Vd = √3 × I × R × L",
      "R = conductor resistance per unit length (NEC Ch. 9 Table 8)",
    ],
    variables: [
      { symbol: "Vd", meaning: "Voltage drop", unit: "V" },
      { symbol: "I", meaning: "Load current", unit: "A" },
      { symbol: "R", meaning: "Conductor resistance of the full current path", unit: "Ω" },
      { symbol: "L", meaning: "One-way run length", unit: "ft or m" },
    ],
    howItWorks: [
      "The calculator looks up the DC resistance of the selected copper conductor at 75 °C from NEC Chapter 9 Table 8.",
      "For single-phase circuits the current path is out and back, so the one-way length is doubled. Three-phase circuits use the √3 factor with the one-way length.",
      "The drop is multiplied by the load current to get volts lost, then divided by the source voltage for the percentage.",
      "Power lost as heat is I²R — it grows with the square of the current, which is why undersized cables waste energy.",
    ],
    example:
      "A 120 V circuit feeds a 15 A load through 100 ft of 12 AWG copper. Path resistance = 1.98 Ω/1000 ft × 200 ft = 0.396 Ω. Drop = 15 A × 0.396 Ω = 5.94 V (4.95%). The load sees 114.1 V and 89 W is lost as heat — a size worth reconsidering.",
    interpretation:
      "The NEC recommends (Informational Note, 210.19) keeping branch-circuit drop at or below 3% and total drop (feeder + branch) at or below 5%. Above these values motors lose torque, lights dim and electronics may misbehave. The power-loss figure tells you how much energy is being burned in the cable for the life of the installation.",
    assumptions: [
      "Uncoated copper conductors at 75 °C operating temperature.",
      "DC resistance only — AC reactance is ignored, which is accurate for conductors up to about 1/0 AWG and slightly optimistic for large conductors.",
      "Balanced three-phase load (no neutral current).",
    ],
    limitations: [
      "Aluminum conductors are not included (about 61% higher resistance than copper).",
      "Very long runs at high current in large conduit should be checked with the NEC reactance tables.",
      "Does not verify ampacity, termination temperature ratings or code compliance — voltage drop is a performance metric, not a substitute for circuit sizing.",
    ],
    faqs: [
      {
        q: "What is an acceptable voltage drop?",
        a: "A common guideline from the NEC (Informational Notes to 210.19 and 215.2) is 3% for a branch circuit and 5% total from the service to the load. These are recommendations, not enforceable limits, but exceeding them noticeably degrades motor and lighting performance.",
      },
      {
        q: "Does the length include both directions?",
        a: "No — enter the one-way distance. For single-phase circuits the calculator doubles it because current travels out on one conductor and back on the other. Three-phase uses the one-way length with the √3 factor.",
      },
      {
        q: "Why is my measured drop higher than calculated?",
        a: "Loose or corroded terminations add resistance that isn't in the conductor tables, and a heavily loaded or long service entrance adds feeder drop on top of the branch circuit.",
      },
    ],
    references: [
      { label: "NEC 2014+ Chapter 9, Table 8 — Conductor Properties", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { label: "NEC Informational Note 210.19(A) — branch circuit voltage drop", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["wire-size-calculator", "ohms-law-calculator", "kva-to-amps-calculator", "motor-current-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "wire-size-calculator",
    category: "electrical",
    name: "Wire Size Calculator",
    title: "Wire Size Calculator — AWG & mm² Copper Ampacity | IngCalc",
    description:
      "Find the minimum copper wire size for your load current. NEC Table 310.16 ampacity at 75 °C, AWG and metric cross-sections, with margin over load and code notes.",
    summary:
      "Pick the smallest standard copper conductor whose ampacity covers your load current, with the ampacity margin, metric cross-section and the code caveats that apply.",
    keywords: ["wire size calculator", "wire gauge calculator", "ampacity chart", "copper wire sizing", "AWG ampacity"],
    inputs: [
      {
        id: "load", label: "Load current", kind: "number", unit: "A",
        defaultValue: 30, min: 0.1, step: 0.5,
        help: "Continuous loads (3+ hours) should be entered at 125% per NEC 210.20(A).",
      },
    ],
    calc: wireSize,
    formula: ["Select the smallest conductor with ampacity ≥ load current", "Ampacity from NEC Table 310.16, 75 °C column, ≤3 current-carrying conductors"],
    variables: [
      { symbol: "I", meaning: "Load current", unit: "A" },
      { symbol: "A", meaning: "Conductor ampacity", unit: "A" },
    ],
    howItWorks: [
      "The tool walks the standard copper conductor list (14 AWG up to 500 kcmil) and selects the first size whose 75 °C ampacity meets or exceeds your load current.",
      "It reports the margin between ampacity and load, plus the approximate metric cross-section for comparison with IEC sizing.",
      "Above 500 kcmil the tool indicates that parallel conductors are required — that is the practical code limit for a single raceway set.",
    ],
    example:
      "A 42 A heat pump load. Walking the table: 8 AWG (50 A) is the first size at or above 42 A, with an 8 A margin. Its metric equivalent is 8.4 mm². If the load is continuous, enter 52.5 A instead, which selects 6 AWG (65 A).",
    interpretation:
      "The result is a starting point, not a code determination. Real sizing must also account for termination temperature ratings (60 °C column for circuits ≤100 A in most cases), conductor bundling deratings, ambient temperature correction and continuous-load multipliers. When any of these apply, the required size is larger than the table result.",
    assumptions: [
      "Copper conductors, 75 °C insulation rating, no more than three current-carrying conductors.",
      "Ambient temperature 30 °C, no bundling derating.",
      "Non-continuous load (continuous loads need 125%).",
    ],
    limitations: [
      "Aluminum conductors require two sizes larger on average and are not covered here.",
      "Does not apply the 60 °C termination column required by NEC 110.14(C) for small circuits.",
      "Motor circuits follow NEC Part III of Article 430, not general ampacity.",
    ],
    faqs: [
      {
        q: "What wire size do I need for 30 amps?",
        a: "10 AWG copper is the common answer for a 30 A branch circuit. The table lists 10 AWG at 35 A (75 °C), and the 60 °C column still supports 30 A. Always verify termination ratings and derating conditions.",
      },
      {
        q: "Why does my load need 125% sizing?",
        a: "Continuous loads (running 3 hours or more) must have conductors and overcurrent devices rated at 125% of the continuous current per NEC 210.20(A) and 215.3, to prevent thermal stress at full rated ampacity.",
      },
      {
        q: "Is AWG the same as mm²?",
        a: "No. AWG is a gauge system where each size change is a fixed area ratio; mm² is a direct cross-section. 12 AWG ≈ 3.31 mm², 10 AWG ≈ 5.26 mm². IEC and NEC cables are normally specified in their native system.",
      },
    ],
    references: [
      { label: "NEC Table 310.16 — Allowable Ampacities of Insulated Conductors", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["voltage-drop-calculator", "motor-current-calculator", "kva-to-amps-calculator", "ohms-law-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "ohms-law-calculator",
    category: "electrical",
    name: "Ohm's Law Calculator",
    title: "Ohm's Law Calculator — Solve V, I, R or Power | IngCalc",
    description:
      "Solve any Ohm's law variable: leave one of voltage, current or resistance blank and get it, plus power in watts. Clean, fast and with a worked explanation.",
    summary:
      "Leave exactly one field blank and the calculator solves it from the other two — and shows power as a bonus. The classic V = I × R with all its rearrangements.",
    keywords: ["ohms law calculator", "voltage current resistance", "ohms law wheel", "electrical power calculator"],
    inputs: [
      { id: "voltage", label: "Voltage", kind: "number", unit: "V", min: 0, step: 0.1, optional: true, help: "Leave blank to solve for voltage." },
      { id: "current", label: "Current", kind: "number", unit: "A", min: 0, step: 0.1, optional: true, help: "Leave blank to solve for current." },
      { id: "resistance", label: "Resistance", kind: "number", unit: "Ω", min: 0, step: 0.1, optional: true, help: "Leave blank to solve for resistance." },
    ],
    calc: ohmsLaw,
    formula: ["V = I × R", "I = V / R", "R = V / I", "P = V × I = I² × R = V² / R"],
    variables: [
      { symbol: "V", meaning: "Voltage", unit: "V" },
      { symbol: "I", meaning: "Current", unit: "A" },
      { symbol: "R", meaning: "Resistance", unit: "Ω" },
      { symbol: "P", meaning: "Power", unit: "W" },
    ],
    howItWorks: [
      "Exactly one field must be blank — that is the unknown the calculator solves for.",
      "The tool applies the corresponding rearrangement of Ohm's law and reports all four quantities.",
      "Power is computed from P = V × I, which is equivalent to I²R and V²/R.",
    ],
    example:
      "A 230 V heater draws 4.5 A. Current and voltage known, resistance blank: R = 230 / 4.5 = 51.1 Ω. Power = 230 × 4.5 = 1035 W — about a 1 kW heater.",
    interpretation:
      "Current rises proportionally with voltage and inversely with resistance. If the computed current exceeds the rating of the wiring or device, something must give — a breaker trips, a fuse blows or a conductor overheats. Power tells you the heat or work rate: in resistive loads it all becomes heat.",
    assumptions: [
      "DC circuit or purely resistive AC load (heaters, incandescent lamps).",
      "Fixed resistance — it does not model how resistance changes with temperature.",
    ],
    limitations: [
      "Reactive AC loads (motors, transformers, electronics) need impedance and power factor, not plain resistance.",
      "Non-linear devices (diodes, LED drivers) do not obey Ohm's law in this simple form.",
    ],
    faqs: [
      {
        q: "How do I calculate power from voltage and resistance?",
        a: "Use P = V² / R. For example, 120 V across a 24 Ω element gives 120² / 24 = 600 W.",
      },
      {
        q: "Does Ohm's law work for AC?",
        a: "Only for purely resistive AC loads. With inductive or capacitive loads, replace R with impedance Z and account for power factor: P = V × I × PF.",
      },
    ],
    references: [
      { label: "Ohm's law — NIST/SI electrical units", url: "https://www.nist.gov/si-redefinition" },
    ],
    related: ["voltage-drop-calculator", "wire-size-calculator", "kva-to-amps-calculator", "power-factor-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "kva-to-amps-calculator",
    category: "electrical",
    name: "kVA to Amps Calculator",
    title: "kVA to Amps Calculator — Single & Three Phase | IngCalc",
    description:
      "Convert kVA, kW or horsepower to amps for single and three-phase circuits. Includes kW↔kVA power factor conversion and the exact formulas used.",
    summary:
      "Enter power as kVA, kW or hp and get the current for single or three-phase, with the kW/kVA conversion made explicit and the formulas documented.",
    keywords: ["kva to amps", "kva to amps calculator", "kw to amps", "three phase current calculator", "hp to amps"],
    inputs: [
      {
        id: "source", label: "Power given as", kind: "select",
        options: [
          { value: "kva", label: "kVA (apparent power)" },
          { value: "kw", label: "kW (real power)" },
          { value: "hp", label: "hp (mechanical)" },
        ],
        defaultOption: "kva",
      },
      { id: "power", label: "Power", kind: "number", defaultValue: 10, min: 0.01, step: 0.5, unit: "kVA / kW / hp depending on selection" },
      { id: "voltage", label: "Voltage", kind: "number", unit: "V", defaultValue: 400, min: 1, step: 1 },
      { id: "pf", label: "Power factor", kind: "number", unit: "0-1", defaultValue: 0.8, min: 0.1, max: 1, step: 0.01, help: "Used when converting kW or hp; ignored for kVA input." },
      {
        id: "system", label: "System", kind: "select",
        options: [
          { value: "single", label: "Single-phase" },
          { value: "three", label: "Three-phase" },
        ],
        defaultOption: "three",
      },
    ],
    calc: ampsFromPower,
    formula: [
      "Single-phase: I = kVA × 1000 / V",
      "Three-phase:  I = kVA × 1000 / (√3 × V)",
      "kW → kVA: kVA = kW / PF        hp → kVA: kVA = hp × 0.746 / PF",
    ],
    variables: [
      { symbol: "I", meaning: "Line current", unit: "A" },
      { symbol: "S", meaning: "Apparent power", unit: "kVA" },
      { symbol: "V", meaning: "Line-to-line voltage", unit: "V" },
      { symbol: "PF", meaning: "Power factor", unit: "—" },
    ],
    howItWorks: [
      "kVA input is used directly; kW and hp are first converted to kVA through the power factor (hp at 746 W each).",
      "Single-phase divides kVA by voltage; three-phase divides by √3 times voltage.",
      "The result also shows real and apparent power so the PF conversion is visible.",
    ],
    example:
      "A 10 kVA three-phase load at 400 V draws 10,000 / (1.732 × 400) = 14.4 A per line. The same 10 kVA single-phase at 230 V would draw 43.5 A — the reason three-phase is preferred for larger loads.",
    interpretation:
      "The result is the line current a balanced load draws at steady state. Use it for breaker sizing (with the applicable code multipliers), transformer loading checks and generator sizing. For motors, prefer nameplate FLA or NEC tables — the conversion here assumes the entered power is the electrical input.",
    assumptions: [
      "Balanced three-phase load, sinusoidal conditions.",
      "hp values are mechanical output power converted at 746 W per hp with the entered power factor.",
    ],
    limitations: [
      "Does not include motor inrush, harmonics or unbalance.",
      "Transformers are sized by kVA, but their actual loading also depends on the load's power factor.",
    ],
    faqs: [
      {
        q: "How many amps is 10 kVA at 240 V single-phase?",
        a: "10,000 / 240 = 41.7 A. At 480 V three-phase it would be 1000 / (1.732 × 480) = 12.0 A.",
      },
      {
        q: "Why does power factor matter?",
        a: "kW is the real work; kVA is what the wires must carry. At PF 0.8, delivering 8 kW requires 10 kVA of current capacity. Low PF therefore increases conductor and breaker sizes for the same useful power.",
      },
    ],
    references: [
      { label: "Apparent power and the power triangle — IEEE", url: "https://www.ieee.org/" },
    ],
    related: ["ohms-law-calculator", "motor-current-calculator", "power-factor-calculator", "wire-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "power-factor-calculator",
    category: "electrical",
    name: "Power Factor Correction Calculator",
    title: "Power Factor Correction Calculator — Capacitor kVAR | IngCalc",
    description:
      "Calculate the capacitor kVAR needed to correct power factor from current to target. Shows apparent power freed, current reduction and the tan φ method.",
    summary:
      "Enter load kW, current PF and target PF to get the capacitor bank size in kVAR, the kVA capacity you free up and how much line current drops.",
    keywords: ["power factor correction calculator", "capacitor kvar calculator", "power factor formula", "pf correction sizing"],
    inputs: [
      { id: "kw", label: "Load power", kind: "number", unit: "kW", defaultValue: 50, min: 0.1, step: 1 },
      { id: "pfNow", label: "Current power factor", kind: "number", unit: "0-1", defaultValue: 0.75, min: 0.05, max: 1, step: 0.01 },
      { id: "pfTarget", label: "Target power factor", kind: "number", unit: "0-1", defaultValue: 0.95, min: 0.05, max: 1, step: 0.01 },
      { id: "voltage", label: "Line voltage", kind: "number", unit: "V", defaultValue: 400, min: 1, step: 1, help: "Used for the current-reduction figures." },
    ],
    calc: powerFactorCorrection,
    formula: ["kVAR = kW × (tan φ₁ − tan φ₂)", "φ = arccos(PF)", "kVA = kW / PF"],
    variables: [
      { symbol: "kVAR", meaning: "Reactive power to add", unit: "kVAR" },
      { symbol: "kW", meaning: "Real power of the load", unit: "kW" },
      { symbol: "φ₁, φ₂", meaning: "Phase angles before and after correction", unit: "°" },
    ],
    howItWorks: [
      "The tool converts both power factors to phase angles and takes the difference of their tangents.",
      "That tangent difference times the real power gives the reactive kVAR the capacitor bank must supply.",
      "It then shows the kVA before and after — the freed capacity in transformers and cables — and the line current reduction.",
    ],
    example:
      "A 50 kW load at PF 0.75 draws 66.7 kVA. Correcting to 0.95 needs 50 × (0.882 − 0.329) = 27.6 kVAR. After correction the load draws 52.6 kVA and line current falls by 21% — meaningful capacity released in the same cables.",
    interpretation:
      "Correcting PF does not reduce the energy the load consumes; it reduces the reactive current the supply must carry. Benefits appear as lower demand charges, less voltage drop, freed transformer capacity and lower I²R losses. Most utilities penalize below 0.90–0.95; correcting beyond ~0.95 yields little and risks overvoltage at light load.",
    assumptions: [
      "Steady, linear load — motors and transformers, not harmonic-rich drives.",
      "Correction applied at the load or distribution board, not the utility meter.",
    ],
    limitations: [
      "Loads with variable PF need an automatic capacitor bank with a PF controller, not one fixed bank.",
      "Harmonic-rich environments (VFDs, rectifiers) require detuned/filtered capacitors to avoid resonance.",
      "Do not size capacitors for a motor larger than recommended by NEC 460 — overcorrection can cause self-excitation.",
    ],
    faqs: [
      {
        q: "What is a good power factor?",
        a: "0.95 is a common target: most utility penalties start below 0.90–0.92, and gains above 0.95 are small compared with the capacitor cost.",
      },
      {
        q: "Does correcting power factor save energy?",
        a: "It saves a little — the I²R losses in your cables drop with the current — but the main financial benefit is avoiding reactive demand charges and freeing installed capacity.",
      },
    ],
    references: [
      { label: "NEC Article 460 — Capacitors", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["kva-to-amps-calculator", "ohms-law-calculator", "motor-current-calculator", "voltage-drop-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "motor-current-calculator",
    category: "electrical",
    name: "Motor Current Calculator",
    title: "Motor Current Calculator — FLA from hp & Voltage | IngCalc",
    description:
      "Estimate single or three-phase motor full-load current from hp, voltage, efficiency and power factor. Includes code notes on NEC 430 tables and 125% sizing.",
    summary:
      "Enter motor hp, voltage, efficiency and power factor to estimate full-load current — with the formulas, and clear notes on when to use NEC tables instead.",
    keywords: ["motor current calculator", "motor fla calculator", "hp to amps motor", "3 phase motor current"],
    inputs: [
      { id: "hp", label: "Motor power", kind: "number", unit: "hp", defaultValue: 10, min: 0.1, step: 0.5 },
      { id: "voltage", label: "Voltage", kind: "number", unit: "V", defaultValue: 400, min: 1, step: 1 },
      { id: "eff", label: "Efficiency", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.3, max: 1, step: 0.01, help: "0.9 = 90%. Modern premium-efficiency motors: 0.90–0.95." },
      { id: "pf", label: "Power factor at full load", kind: "number", unit: "0-1", defaultValue: 0.85, min: 0.3, max: 1, step: 0.01 },
      {
        id: "system", label: "System", kind: "select",
        options: [
          { value: "three", label: "Three-phase" },
          { value: "single", label: "Single-phase" },
        ],
        defaultOption: "three",
      },
    ],
    calc: motorCurrent,
    formula: [
      "Three-phase: I = P × 746 / (√3 × V × PF × η)",
      "Single-phase: I = P × 746 / (V × PF × η)",
    ],
    variables: [
      { symbol: "I", meaning: "Full-load current", unit: "A" },
      { symbol: "P", meaning: "Mechanical output power", unit: "hp" },
      { symbol: "η", meaning: "Motor efficiency", unit: "—" },
      { symbol: "PF", meaning: "Power factor at full load", unit: "—" },
    ],
    howItWorks: [
      "Mechanical output (746 W per hp) is divided by efficiency to get electrical input power.",
      "Input power is then converted to current using the three-phase or single-phase formula with the entered power factor.",
      "The kVA drawn is reported so transformer and generator sizing can be checked.",
    ],
    example:
      "A 10 hp, 400 V three-phase motor with η = 0.90 and PF = 0.85: input = 7460 / 0.90 = 8289 W; I = 8289 / (1.732 × 400 × 0.85) = 14.1 A. NEC Table 430.250 lists 14 A for this motor — the estimate matches well.",
    interpretation:
      "This is the steady full-load estimate. Real motors draw 6–8× this current during starting (locked rotor), which determines breaker type and voltage drop during start. For conductor sizing, code practice uses 125% of FLC; for overload protection, use the nameplate FLA.",
    assumptions: [
      "Nameplate hp is the mechanical output; efficiency and PF are at full load.",
      "Induction motor, sinusoidal supply, no VFD harmonics.",
    ],
    limitations: [
      "Not a replacement for NEC tables 430.248/430.250 — use those for code compliance.",
      "Starting (locked-rotor) current is not calculated; it is typically 6–8× FLC.",
    ],
    faqs: [
      {
        q: "What is FLA?",
        a: "Full-load amperes: the current the motor draws at rated horsepower, voltage and frequency. It's stamped on the nameplate and used for overload protection settings.",
      },
      {
        q: "Why do motor tables differ slightly from the calculation?",
        a: "NEC tables use standardized values rounded to cover common designs, and older motors are less efficient than the 0.90–0.95 assumed here. When they differ, the table governs for code purposes.",
      },
    ],
    references: [
      { label: "NEC Article 430 — Motors, Tables 430.248/430.250", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["kva-to-amps-calculator", "wire-size-calculator", "power-factor-calculator", "voltage-drop-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
];
