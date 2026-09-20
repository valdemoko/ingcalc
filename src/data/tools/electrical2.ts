import type { ToolDefinition } from "@/lib/types";
import {
  COPPER_WIRES,
  wireResistance,
  energyCost,
  transformerSizing,
  threePhasePower,
  voltageDivider,
  resistorColorCode,
  ledResistor,
  evChargeTime,
  generatorSizing,
  deratingCalc,
  breakerSizing,
  cableReactance,
} from "@/lib/engines/electrical2";

const wireOptions = COPPER_WIRES.map((w) => ({ value: w.awg, label: w.awg }));

export const ELECTRICAL2_TOOLS: ToolDefinition[] = [
  {
    slug: "wire-resistance-calculator",
    category: "electrical",
    name: "Wire Resistance Calculator",
    title: "Wire Resistance Calculator — Copper & Aluminum | IngCalc",
    description:
      "Calculate wire resistance from AWG size, length and material. Copper and aluminum, per 1000 ft and per meter, based on NEC Chapter 9 Table 8 data.",
    summary:
      "Find the electrical resistance of any copper or aluminum conductor from the AWG table — round trip and per-unit-length values for voltage drop math.",
    keywords: ["wire resistance calculator", "copper wire resistance", "aluminum wire resistance", "awg resistance table"],
    inputs: [
      { id: "wire", label: "Conductor size", kind: "select", options: wireOptions, defaultOption: "12 AWG" },
      {
        id: "length", label: "One-way length", kind: "number", defaultValue: 100, min: 0, step: 1,
        unitOptions: [{ value: "ft", label: "feet", factor: 1 }, { value: "m", label: "meters", factor: 3.28084 }],
        defaultUnit: "ft",
      },
      {
        id: "material", label: "Material", kind: "select",
        options: [{ value: "copper", label: "Copper" }, { value: "aluminum", label: "Aluminum" }],
        defaultOption: "copper",
      },
    ],
    calc: wireResistance,
    formula: ["R = ρ × L / A", "tabulated: Ω per 1000 ft at 75 °C (NEC Ch. 9 Table 8)"],
    variables: [
      { symbol: "R", meaning: "Resistance", unit: "Ω" },
      { symbol: "ρ", meaning: "Resistivity (material constant)", unit: "Ω·cmil/ft" },
      { symbol: "L", meaning: "Conductor length", unit: "ft" },
      { symbol: "A", meaning: "Cross-section", unit: "circular mils" },
    ],
    howItWorks: [
      "The tool reads the DC resistance at 75 °C from the NEC Chapter 9 Table 8 copper series.",
      "Aluminum applies a 1.64 multiplier — aluminum's resistivity is about 64% higher than copper's at the same geometry.",
      "The round-trip figure doubles the one-way length since both conductors carry current.",
    ],
    example:
      "100 ft of 12 AWG copper, out and back: 1.98 Ω/kft × 0.2 kft × 2 = 0.396 Ω. The same run in aluminum would be 0.649 Ω — 64% more, which is why aluminum circuits need larger conductors for the same drop.",
    interpretation:
      "Resistance is the raw material of every voltage-drop and power-loss calculation. Note that it rises with temperature: the 75 °C table values are about 20% higher than room-temperature measurements, so cold circuits measure slightly better than calculated.",
    assumptions: [
      "Uncoated conductors at 75 °C operating temperature.",
      "DC resistance — AC reactance is separate (see the cable reactance calculator).",
    ],
    limitations: [
      "Coated conductors and tinned copper differ slightly.",
      "Terminations and connections add resistance not included here.",
    ],
    faqs: [
      {
        q: "What is the resistance of 12 AWG copper wire?",
        a: "About 1.98 Ω per 1000 ft at 75 °C (NEC Chapter 9 Table 8). At room temperature it measures roughly 1.6 Ω/kft — resistance rises with temperature.",
      },
      {
        q: "Why is aluminum wire resistance higher?",
        a: "Aluminum's resistivity is about 64% higher than copper's. For the same ampacity, aluminum conductors are roughly two sizes larger, which offsets the cost advantage.",
      },
    ],
    references: [
      { label: "NEC Chapter 9, Table 8 — Conductor Properties", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["voltage-drop-calculator", "wire-size-calculator", "wire-derating-calculator", "cable-reactance-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "energy-cost-calculator",
    category: "electrical",
    name: "Electricity Cost Calculator",
    title: "Electricity Cost Calculator — Appliance Running Cost | IngCalc",
    description:
      "Calculate what any appliance costs to run: kWh per day, month and year plus cost at your electricity rate. Multiplies for multiple identical devices.",
    summary:
      "Enter device watts, hours per day and your rate to get daily, monthly and yearly energy and cost — the standard appliance running-cost calculation.",
    keywords: ["electricity cost calculator", "appliance running cost", "kwh cost calculator", "power consumption calculator"],
    inputs: [
      { id: "watts", label: "Device power", kind: "number", unit: "W", defaultValue: 1500, min: 0.5, step: 10 },
      { id: "quantity", label: "Number of devices", kind: "number", unit: "×", defaultValue: 1, min: 1, max: 1000, step: 1 },
      { id: "hours", label: "Hours running per day", kind: "number", unit: "h", defaultValue: 4, min: 0, max: 24, step: 0.5 },
      { id: "rate", label: "Electricity rate", kind: "number", unit: "$/kWh", defaultValue: 0.15, min: 0, step: 0.01 },
    ],
    calc: energyCost,
    formula: ["kWh = W × hours ÷ 1000", "Cost = kWh × rate"],
    variables: [
      { symbol: "kWh", meaning: "Energy consumed", unit: "kilowatt-hour" },
      { symbol: "W", meaning: "Power draw", unit: "W" },
      { symbol: "rate", meaning: "Price per kWh", unit: "$/kWh" },
    ],
    howItWorks: [
      "Energy = watts × hours ÷ 1000 gives kilowatt-hours; the tool extrapolates to month (30.44 days) and year (365 days).",
      "Cost multiplies energy by your rate — use the all-in rate including delivery charges for real accuracy.",
      "The quantity field multiplies the whole calculation for fleets of identical devices (lights, servers, pumps).",
    ],
    example:
      "A 1500 W space heater running 4 h/day at $0.15/kWh: 6 kWh/day = 182 kWh/month = $27.40/month = $328/year. That number usually convinces people to lower the thermostat.",
    interpretation:
      "The yearly figure is the one to compare against alternatives: a $400 heat-pump replacement of that heater saving 60% pays back in about 2 years. Devices that run 24/7 (fridges, servers, aquariums) dominate household consumption even at modest wattage.",
    assumptions: [
      "Constant wattage while running — devices with compressors cycle and use less.",
      "Flat electricity rate; tiered or time-of-use pricing needs an average.",
    ],
    limitations: [
      "Standby consumption (0.5–5 W when 'off') is not counted — add it for always-on electronics.",
      "Does not model demand charges or fixed connection fees.",
    ],
    faqs: [
      {
        q: "How do I find my electricity rate?",
        a: "Divide the total amount of a bill by the kWh consumed — that all-in figure includes delivery and taxes, which is what you actually pay.",
      },
      {
        q: "How much does leaving a light on cost?",
        a: "A 60 W incandescent on 24/7 at $0.15/kWh costs $79/year. An equivalent 9 W LED costs $12/year — the classic efficiency argument.",
      },
    ],
    references: [
      { label: "EIA — residential electricity prices and consumption", url: "https://www.eia.gov/electricity/" },
    ],
    related: ["ohms-law-calculator", "kva-to-amps-calculator", "cooling-cost-calculator", "ev-charge-time-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "transformer-sizing-calculator",
    category: "electrical",
    name: "Transformer Sizing Calculator",
    title: "Transformer Sizing Calculator — kVA from Load | IngCalc",
    description:
      "Size a single-phase transformer from load kW and power factor, with design margin and primary/secondary currents. Standard kVA ratings listed.",
    summary:
      "Enter load kW, PF and voltages to get the required kVA with margin, plus primary and secondary currents for protection sizing.",
    keywords: ["transformer sizing calculator", "transformer kva calculator", "transformer current calculator"],
    inputs: [
      { id: "loadKw", label: "Load power", kind: "number", unit: "kW", defaultValue: 8, min: 0.1, step: 0.5 },
      { id: "pf", label: "Load power factor", kind: "number", unit: "0-1", defaultValue: 0.85, min: 0.1, max: 1, step: 0.01 },
      { id: "primaryV", label: "Primary voltage", kind: "number", unit: "V", defaultValue: 480, min: 1, step: 1 },
      { id: "secondaryV", label: "Secondary voltage", kind: "number", unit: "V", defaultValue: 240, min: 1, step: 1 },
      { id: "margin", label: "Design margin", kind: "number", unit: "0-1", defaultValue: 0.25, min: 0, max: 1, step: 0.05, help: "0.25 = 25%, the NEC continuous-load practice." },
    ],
    calc: transformerSizing,
    formula: ["kVA = kW / PF", "Required kVA = load kVA × (1 + margin)", "I_primary = kVA × 1000 / V_primary"],
    variables: [
      { symbol: "S", meaning: "Apparent power rating", unit: "kVA" },
      { symbol: "PF", meaning: "Power factor", unit: "—" },
      { symbol: "I₁, I₂", meaning: "Primary / secondary current", unit: "A" },
    ],
    howItWorks: [
      "Load kW converts to kVA through the power factor — transformers are rated in kVA because heating depends on current, not phase.",
      "The margin inflates the requirement for continuous loads and future growth.",
      "Primary and secondary currents follow from the same kVA at each voltage, for conductor and protection sizing.",
    ],
    example:
      "An 8 kW load at PF 0.85 needs 9.4 kVA; with 25% margin, 11.8 kVA → choose the standard 15 kVA transformer. At 480/240 V: primary 31 A, secondary 62.5 A — a 70 A secondary breaker and 4 AWG secondary conductors fit.",
    interpretation:
      "Transformers are rated in kVA, not kW, because their heating depends on current regardless of the load's power factor. A low-PF load forces a bigger transformer for the same useful power — another reason PF correction pays. Standard sizes exist at 15, 25, 37.5, 50, 75 kVA... so round up.",
    assumptions: [
      "Single-phase transformer; three-phase sizing divides by √3 in the current formulas.",
      "Load is steady; motor starting inrush is a separate check.",
    ],
    limitations: [
      "Does not cover inrush/energization protection (NEC 450 rules apply).",
      "Ambient temperature and altitude derating for dry-type units is not applied.",
      "Harmonic-rich loads (K-factor) need specially rated transformers.",
    ],
    faqs: [
      {
        q: "What size transformer for a 10 kW load?",
        a: "At PF 0.9 with 25% margin: 10/0.9 × 1.25 = 13.9 kVA → the standard 15 kVA unit.",
      },
      {
        q: "Why are transformers rated in kVA?",
        a: "Transformer heating comes from copper loss (I²R) and core loss, both driven by voltage and current magnitude — not by the load's phase angle. kVA captures that regardless of PF.",
      },
    ],
    references: [
      { label: "NEC Article 450 — Transformers", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["kva-to-amps-calculator", "three-phase-power-calculator", "wire-size-calculator", "breaker-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "three-phase-power-calculator",
    category: "electrical",
    name: "Three-Phase Power Calculator",
    title: "3-Phase Power Calculator — kW, kVA & kVAR | IngCalc",
    description:
      "Calculate three-phase real, apparent and reactive power from line voltage, current and power factor. The complete power triangle in one step.",
    summary:
      "Enter line voltage, current and PF to get kW, kVA and kVAR for a balanced three-phase load — the full power triangle.",
    keywords: ["3 phase power calculator", "three phase kw calculator", "kva kw kvar", "power triangle calculator"],
    inputs: [
      { id: "voltage", label: "Line-to-line voltage", kind: "number", unit: "V", defaultValue: 400, min: 1, step: 1 },
      { id: "current", label: "Line current", kind: "number", unit: "A", defaultValue: 20, min: 0, step: 0.5 },
      { id: "pf", label: "Power factor", kind: "number", unit: "0-1", defaultValue: 0.85, min: 0.05, max: 1, step: 0.01 },
    ],
    calc: threePhasePower,
    formula: ["P = √3 × V × I × PF", "S = √3 × V × I", "Q = √(S² − P²)"],
    variables: [
      { symbol: "P", meaning: "Real power", unit: "kW" },
      { symbol: "S", meaning: "Apparent power", unit: "kVA" },
      { symbol: "Q", meaning: "Reactive power", unit: "kVAR" },
      { symbol: "PF", meaning: "Power factor = P/S", unit: "—" },
    ],
    howItWorks: [
      "Apparent power comes from √3 × V_LL × I (the standard balanced three-phase formula).",
      "Real power multiplies by PF; reactive power closes the triangle via Pythagoras.",
    ],
    example:
      "400 V, 20 A, PF 0.85: S = 1.732 × 400 × 20 / 1000 = 13.9 kVA; P = 11.8 kW; Q = 7.3 kVAR. The 7.3 kVAR is what a PF-correction bank would target if you wanted PF 1.0.",
    interpretation:
      "The gap between kVA and kW is reactive power — current sloshing between source and load that does no work but heats conductors. Utilities bill large customers for it. Q near zero (PF ≈ 1) means the supply is being used efficiently.",
    assumptions: [
      "Balanced three-phase system — unbalance changes the math substantially.",
      "Sinusoidal waveforms; harmonics distort the PF reading.",
    ],
    limitations: [
      "Does not handle unbalanced loads — measure each phase for those.",
      "True PF with harmonics (distortion PF) differs from displacement PF.",
    ],
    faqs: [
      {
        q: "Why the √3 factor?",
        a: "In a balanced three-phase system, the vector sum of three 120°-shifted phase powers is √3 × V_LL × I — a result of the phase geometry, not an approximation.",
      },
      {
        q: "What is kVAR?",
        a: "Reactive power: the component of current that oscillates between source and inductive load without doing work. It fills magnetic fields in motors and transformers every cycle.",
      },
    ],
    references: [
      { label: "IEEE Std 141 (Red Book) — power factor fundamentals", url: "https://standards.ieee.org/ieee/141/4888/" },
    ],
    related: ["kva-to-amps-calculator", "power-factor-calculator", "motor-current-calculator", "transformer-sizing-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "voltage-divider-calculator",
    category: "electrical",
    name: "Voltage Divider Calculator",
    title: "Voltage Divider Calculator — Resistor Ratio | IngCalc",
    description:
      "Calculate the output voltage of a two-resistor divider, with divider current and per-resistor dissipation. Includes loading warnings for real circuits.",
    summary:
      "Enter Vin, R1 and R2 to get the divider output, its current draw and the power dissipated in each resistor — plus the loading caveats that matter in practice.",
    keywords: ["voltage divider calculator", "resistor divider", "voltage divider formula", "resistor ratio"],
    inputs: [
      { id: "vin", label: "Input voltage", kind: "number", unit: "V", defaultValue: 12, min: 0.01, step: 0.1 },
      { id: "r1", label: "R1 (top)", kind: "number", unit: "Ω", defaultValue: 10000, min: 0.1, step: 100 },
      { id: "r2", label: "R2 (bottom)", kind: "number", unit: "Ω", defaultValue: 4700, min: 0.1, step: 100 },
    ],
    calc: voltageDivider,
    formula: ["Vout = Vin × R2 / (R1 + R2)", "I = Vin / (R1 + R2)"],
    variables: [
      { symbol: "Vout", meaning: "Output voltage", unit: "V" },
      { symbol: "R1, R2", meaning: "Divider resistors", unit: "Ω" },
      { symbol: "I", meaning: "Current through the divider", unit: "A" },
    ],
    howItWorks: [
      "The output is the input scaled by R2/(R1+R2) — the fundamental resistive divider relation.",
      "Divider current and per-resistor power show whether standard 1/4 W parts survive.",
      "The notes flag loading: any current drawn from the output changes the ratio.",
    ],
    example:
      "12 V divided by 10 kΩ / 4.7 kΩ: Vout = 12 × 4.7/14.7 = 3.84 V. Divider current = 0.82 mA, dissipations 6.7 mW and 3.1 mW — safe for any resistor, and light enough to be reasonable for a battery-powered sensor node.",
    interpretation:
      "Dividers trade stiffness against current draw: lower resistances give a stiffer output but waste power. The rule of thumb is divider current ≈ 10× the load current. For ADC inputs, add a buffer or account for the input impedance — a 100 kΩ divider feeding a 10 kΩ ADC input shifts the reading by 9%.",
    assumptions: [
      "Unloaded output or load resistance ≫ R2.",
      "DC or low-frequency signals; stray capacitance affects fast edges.",
    ],
    limitations: [
      "Not a regulator — output sags with load and tracks Vin exactly.",
      "Resistor tolerance (1–5%) sets the accuracy floor; use precision parts for measurement dividers.",
    ],
    faqs: [
      {
        q: "Can I power a device from a voltage divider?",
        a: "No — dividers are for signals, not supplies. Any load current shifts the output; use a regulator (buck, LDO) for power.",
      },
      {
        q: "How do I pick divider resistor values?",
        a: "Start from the load: divider current should be ~10× load current. Then set the ratio R2/(R1+R2) to the target voltage and choose the nearest E96 values.",
      },
    ],
    references: [
      { label: "Electronics Tutorials — voltage divider networks", url: "https://www.electronics-tutorials.ws/dccircuits/voltage-divider.html" },
    ],
    related: ["ohms-law-calculator", "resistor-color-code-calculator", "led-resistor-calculator", "wire-resistance-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "resistor-color-code-calculator",
    category: "electrical",
    name: "Resistor Color Code Calculator",
    title: "Resistor Color Code Calculator — 4 Band Decoder | IngCalc",
    description:
      "Decode 4-band resistor values from band colors: resistance, tolerance and the acceptable range. Standard EIA color code with all twelve colors.",
    summary:
      "Pick the four band colors to read the resistance value, tolerance and min/max range of any 4-band resistor.",
    keywords: ["resistor color code calculator", "resistor color bands", "4 band resistor", "resistor decoder"],
    inputs: [
      {
        id: "band1", label: "Band 1 (first digit)", kind: "select",
        options: [
          { value: "brown", label: "Brown (1)" }, { value: "red", label: "Red (2)" },
          { value: "orange", label: "Orange (3)" }, { value: "yellow", label: "Yellow (4)" },
          { value: "green", label: "Green (5)" }, { value: "blue", label: "Blue (6)" },
          { value: "violet", label: "Violet (7)" }, { value: "grey", label: "Grey (8)" },
          { value: "white", label: "White (9)" }, { value: "black", label: "Black (0)" },
        ],
        defaultOption: "brown",
      },
      {
        id: "band2", label: "Band 2 (second digit)", kind: "select",
        options: [
          { value: "black", label: "Black (0)" }, { value: "brown", label: "Brown (1)" },
          { value: "red", label: "Red (2)" }, { value: "orange", label: "Orange (3)" },
          { value: "yellow", label: "Yellow (4)" }, { value: "green", label: "Green (5)" },
          { value: "blue", label: "Blue (6)" }, { value: "violet", label: "Violet (7)" },
          { value: "grey", label: "Grey (8)" }, { value: "white", label: "White (9)" },
        ],
        defaultOption: "black",
      },
      {
        id: "multiplier", label: "Band 3 (multiplier)", kind: "select",
        options: [
          { value: "black", label: "Black ×1" }, { value: "brown", label: "Brown ×10" },
          { value: "red", label: "Red ×100" }, { value: "orange", label: "Orange ×1k" },
          { value: "yellow", label: "Yellow ×10k" }, { value: "green", label: "Green ×100k" },
          { value: "blue", label: "Blue ×1M" }, { value: "gold", label: "Gold ×0.1" },
          { value: "silver", label: "Silver ×0.01" },
        ],
        defaultOption: "red",
      },
      {
        id: "tolerance", label: "Band 4 (tolerance)", kind: "select",
        options: [
          { value: "brown", label: "Brown ±1%" }, { value: "red", label: "Red ±2%" },
          { value: "green", label: "Green ±0.5%" }, { value: "blue", label: "Blue ±0.25%" },
          { value: "violet", label: "Violet ±0.1%" }, { value: "gold", label: "Gold ±5%" },
          { value: "silver", label: "Silver ±10%" },
        ],
        defaultOption: "gold",
      },
    ],
    calc: resistorColorCode,
    formula: ["R = (digit₁ × 10 + digit₂) × multiplier", "Range = R × (1 ± tolerance)"],
    variables: [
      { symbol: "digit₁₂", meaning: "Two significant digits from bands 1-2", unit: "—" },
      { symbol: "multiplier", meaning: "Power of ten from band 3", unit: "—" },
      { symbol: "tol", meaning: "Tolerance from band 4", unit: "%" },
    ],
    howItWorks: [
      "Bands 1 and 2 give two significant digits; band 3 multiplies by a power of ten (gold = 0.1, silver = 0.01).",
      "Band 4 sets tolerance, which defines the guaranteed min/max range.",
      "Read bands from the end where they cluster nearest — the tolerance band (gold/silver) sits at the far end.",
    ],
    example:
      "Brown-black-red-gold: (1, 0) × 100 = 1,000 Ω = 1 kΩ ±5%, so the part measures 950–1,050 Ω. Yellow-violet-orange-gold: 4.7 kΩ ±5% — the most common through-hole value.",
    interpretation:
      "The tolerance band tells you how much the real part can differ from its marking — critical when a circuit needs 1% parts. If a resistor measures outside its color-coded range, it's damaged or misread (check the orientation).",
    assumptions: [
      "4-band axial through-hole resistors (EIA color code).",
      "Reading direction from the clustered end.",
    ],
    limitations: [
      "5-band precision and 6-band (with temperature coefficient) resistors need their own charts.",
      "SMD resistors use numeric codes (e.g. 103 = 10 kΩ) — not covered here.",
    ],
    faqs: [
      {
        q: "Which end do I start reading from?",
        a: "From the end where the bands are closest together. The gold or silver tolerance band always goes last.",
      },
      {
        q: "What does a gold multiplier band mean?",
        a: "Multiply by 0.1 — used for sub-1-Ω values like 4.7 Ω (yellow-violet-gold-gold).",
      },
    ],
    references: [
      { label: "EIA color code — resistor marking standard", url: "https://www.ecianow.org/" },
    ],
    related: ["voltage-divider-calculator", "led-resistor-calculator", "ohms-law-calculator", "wire-resistance-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "led-resistor-calculator",
    category: "electrical",
    name: "LED Resistor Calculator",
    title: "LED Resistor Calculator — Series & Parallel | IngCalc",
    description:
      "Calculate the current-limiting resistor for one or more LEDs, series or parallel, with power dissipation and nearest standard E12 values.",
    summary:
      "Enter supply voltage, LED forward voltage and current to get the resistor value, its power rating requirement and the nearest standard values to buy.",
    keywords: ["led resistor calculator", "led series resistor", "led current limiting resistor", "led resistor value"],
    inputs: [
      { id: "vin", label: "Supply voltage", kind: "number", unit: "V", defaultValue: 12, min: 0.5, step: 0.5 },
      { id: "vf", label: "LED forward voltage", kind: "number", unit: "V", defaultValue: 2.0, min: 0.5, max: 6, step: 0.1, help: "Red ≈ 2.0 V, green/yellow ≈ 2.1 V, blue/white ≈ 3.2 V." },
      { id: "iLed", label: "LED current", kind: "number", unit: "mA", defaultValue: 20, min: 1, max: 2000, step: 1 },
      { id: "count", label: "Number of LEDs", kind: "number", unit: "×", defaultValue: 1, min: 1, max: 50, step: 1 },
      {
        id: "wiring", label: "Wiring", kind: "select",
        options: [
          { value: "series", label: "Series string (one resistor)" },
          { value: "parallel", label: "Each LED with its own resistor" },
        ],
        defaultOption: "series",
      },
    ],
    calc: ledResistor,
    formula: ["R = (V_supply − n × Vf) / I   (series)", "R = (V_supply − Vf) / I   (per LED, parallel)"],
    variables: [
      { symbol: "R", meaning: "Current-limiting resistor", unit: "Ω" },
      { symbol: "Vf", meaning: "LED forward voltage", unit: "V" },
      { symbol: "I", meaning: "LED forward current", unit: "A" },
    ],
    howItWorks: [
      "The resistor drops the voltage the LEDs don't use: supply minus total forward voltage.",
      "Ohm's law sets the resistance for the target current; P = V_drop × I sets the resistor's minimum power rating.",
      "The nearest E12 standard values are suggested since resistors come in fixed series.",
    ],
    example:
      "A 12 V supply driving one red LED (2.0 V, 20 mA): R = (12 − 2)/0.02 = 500 Ω → nearest standard 510 Ω. Power = 10 × 0.02 = 200 mW → use a 1/2 W resistor, not 1/4 W.",
    interpretation:
      "The resistor converts excess voltage into heat to hold the current steady — that's why power LEDs need switching drivers instead (efficiency). If the calculated power exceeds ~100 mW, step up to a larger package or reconsider the design. Never connect parallel LEDs to one shared resistor: Vf mismatch sends most current through one LED.",
    assumptions: [
      "Constant Vf — it actually varies with current and temperature.",
      "Indicator-class currents (5–25 mA).",
    ],
    limitations: [
      "Not for power LEDs above ~100 mA — use a constant-current driver.",
      "Does not handle mixed colors in series (different Vf per color).",
    ],
    faqs: [
      {
        q: "What resistor for a 12V LED?",
        a: "Depends on the LED: a 12 V 'LED with built-in resistor' needs none; a bare 2 V red LED on 12 V needs (12−2)/0.02 = 500 Ω.",
      },
      {
        q: "Why not connect LEDs directly in parallel?",
        a: "Forward voltage varies part-to-part; the lowest-Vf LED hogs current and burns out, then the next one follows. One resistor per LED, or proper series strings.",
      },
    ],
    references: [
      { label: "LED forward voltage and current — manufacturer datasheets", url: "https://www.vishay.com/en/leds/" },
    ],
    related: ["resistor-color-code-calculator", "voltage-divider-calculator", "ohms-law-calculator", "wire-size-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "ev-charge-time-calculator",
    category: "electrical",
    name: "EV Charging Time Calculator",
    title: "EV Charging Time Calculator — Level 1, 2 & DC Fast | IngCalc",
    description:
      "Calculate EV charging time from battery size and charger power, including charge window, efficiency losses, range added and electricity cost.",
    summary:
      "Enter battery kWh and charger kW to get charging time, grid energy drawn (including losses), range added and cost — for Level 1 through DC fast.",
    keywords: ["ev charging time calculator", "electric car charge time", "ev charging cost", "level 2 charging speed"],
    inputs: [
      { id: "batteryKwh", label: "Battery capacity", kind: "number", unit: "kWh", defaultValue: 60, min: 1, step: 1 },
      { id: "chargerKw", label: "Charging power", kind: "number", unit: "kW", defaultValue: 7.2, min: 0.5, step: 0.1, help: "Level 1 ≈ 1.4 kW, Level 2 ≈ 7.2–19 kW, DC fast 50–350 kW." },
      { id: "fromPct", label: "Starting charge", kind: "number", unit: "%", defaultValue: 20, min: 0, max: 99, step: 1 },
      { id: "toPct", label: "Target charge", kind: "number", unit: "%", defaultValue: 80, min: 1, max: 100, step: 1 },
      { id: "eff", label: "Charging efficiency", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.5, max: 1, step: 0.01, help: "0.9 = 90% for AC Level 2; 0.93 for DC fast." },
      { id: "efficiencyMiKwh", label: "Vehicle efficiency", kind: "number", unit: "mi/kWh", defaultValue: 3.5, min: 0, step: 0.1, optional: true, help: "For the range-added estimate. Blank to skip." },
      { id: "rate", label: "Electricity rate", kind: "number", unit: "$/kWh", defaultValue: 0.15, min: 0, step: 0.01, optional: true },
    ],
    calc: evChargeTime,
    formula: ["Energy = battery kWh × charge window ÷ efficiency", "Time = energy ÷ charger kW"],
    variables: [
      { symbol: "E", meaning: "Energy needed", unit: "kWh" },
      { symbol: "P", meaning: "Charging power", unit: "kW" },
      { symbol: "η", meaning: "Charging efficiency", unit: "—" },
    ],
    howItWorks: [
      "The charge window (e.g. 20→80%) selects the energy actually needed, not the whole battery.",
      "Charging losses (on-board charger + battery thermal management) inflate the grid draw by ~10%.",
      "Time divides energy by charger power; range and cost follow from vehicle efficiency and your rate.",
    ],
    example:
      "A 60 kWh EV from 20% to 80% on a 7.2 kW Level 2 charger: needs 40 kWh ÷ 0.9 = 44.4 kWh from the grid = 6.2 hours. That's ~140 miles of range for about $6.65.",
    interpretation:
      "The 20–80% window is the EV owner's sweet spot: fastest charging, least battery wear, and DC fast-charging tapers hard above 80% (the last 20% can take as long as the first 60%). Level 1 (1.4 kW) adds only ~4–5 miles per hour — fine overnight, useless for quick top-ups.",
    assumptions: [
      "Constant charging power through the window — real DC charging tapers with SOC.",
      "Battery thermal conditioning is included in the efficiency figure.",
    ],
    limitations: [
      "Cold weather can halve DC charging speed until the battery warms.",
      "Shared circuits, derated cables and vehicle limits may reduce power below the charger's rating.",
    ],
    faqs: [
      {
        q: "How long to charge an EV at home?",
        a: "With a 7.2 kW Level 2 charger, most EVs go 20–80% in 5–8 hours. Level 1 (wall outlet) takes 3–4× longer — fine if the car sits all night.",
      },
      {
        q: "Why does DC charging slow down above 80%?",
        a: "Lithium cells accept charge current based on their internal voltage headroom; as they approach full, that headroom shrinks and the BMS cuts current to prevent lithium plating. Charging to 100% is inherently slow.",
      },
    ],
    references: [
      { label: "SAE J1772 — AC charging standard", url: "https://www.sae.org/standards/content/j1772_202101/" },
      { label: "DOE — electric vehicle charging basics", url: "https://afdc.energy.gov/fuels/electricity-stations.html" },
    ],
    related: ["energy-cost-calculator", "generator-sizing-calculator", "breaker-size-calculator", "wire-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "generator-sizing-calculator",
    category: "electrical",
    name: "Generator Size Calculator",
    title: "Generator Size Calculator — Running & Starting Load | IngCalc",
    description:
      "Size a backup generator from running watts and motor surge requirements. Includes the 25% continuous margin and motor starting guidance.",
    summary:
      "Add up your running loads and the biggest motor surge to get the minimum generator rating — with the sizing logic that prevents nuisance shutdowns.",
    keywords: ["generator size calculator", "generator sizing", "what size generator", "backup generator watts"],
    inputs: [
      { id: "runningW", label: "Total running load", kind: "number", unit: "W", defaultValue: 3000, min: 100, step: 100, help: "Everything that runs simultaneously." },
      { id: "surgeW", label: "Largest motor surge", kind: "number", unit: "W", defaultValue: 0, min: 0, step: 100, optional: true, help: "Starting watts of the biggest motor (typically 2–3× its running wattage)." },
    ],
    calc: generatorSizing,
    formula: ["Required = max(running × 1.25, surge)"],
    variables: [
      { symbol: "W_run", meaning: "Simultaneous running load", unit: "W" },
      { symbol: "W_surge", meaning: "Motor starting requirement", unit: "W" },
    ],
    howItWorks: [
      "Running loads are multiplied by 1.25 to keep the generator out of continuous overload.",
      "The larger motor's starting surge is compared directly — induction motors draw 2–3× running power at startup.",
      "The generator must satisfy whichever requirement is larger.",
    ],
    example:
      "Fridge 800 W + furnace fan 600 W + lights 400 W + TV 200 W = 2,000 W running; the furnace fan surges at 1,800 W. Required = max(2,500, 1,800) = 2.5 kW → a 3 kW inverter generator with margin for future loads.",
    interpretation:
      "Undersized generators stall on motor starts and run hot at continuous load; oversized units waste fuel and suffer carbon buildup at light load (wet stacking). The sweet spot is running load at 50–75% of rating. Inverter generators handle electronics cleanly; conventional units are fine for resistive and motor loads.",
    assumptions: [
      "Single largest surge dominates — multiple motors starting simultaneously need their sum.",
      "Resistive and electronic loads have no surge; only motors and compressors do.",
    ],
    limitations: [
      "Air conditioners and well pumps can surge 4–5× — check nameplate LRA.",
      "Transfer switch and grounding requirements are code matters, not sizing ones.",
    ],
    faqs: [
      {
        q: "What size generator for a house?",
        a: "For essentials (fridge, furnace, lights, phone charging): 3–5 kW. Adding a well pump or AC pushes it to 7–10 kW. Whole-house with central AC: 14–20 kW standby units.",
      },
      {
        q: "Why 1.25 times the running load?",
        a: "Generators shouldn't run above ~80% of rating continuously — the margin also absorbs measurement error and future loads.",
      },
    ],
    references: [
      { label: "NEC Article 702 — Optional Standby Systems", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["motor-current-calculator", "energy-cost-calculator", "breaker-size-calculator", "transformer-sizing-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "wire-derating-calculator",
    category: "electrical",
    name: "Wire Derating Calculator",
    title: "Wire Ampacity Derating Calculator — NEC 310.15 | IngCalc",
    description:
      "Apply NEC 310.15 derating: temperature correction factors and conductor fill adjustments. Shows the effective ampacity after both reductions.",
    summary:
      "Enter table ampacity, ambient temperature and conductor count to see the effective ampacity after NEC temperature and fill derating.",
    keywords: ["wire derating calculator", "ampacity derating", "nec 310.15", "conductor fill derating"],
    inputs: [
      { id: "baseAmpacity", label: "Table ampacity (before derating)", kind: "number", unit: "A", defaultValue: 30, min: 1, step: 5, help: "From NEC Table 310.16 for your conductor and insulation." },
      { id: "ambientC", label: "Ambient temperature", kind: "number",
        unitOptions: [
          { value: "C", label: "°C", factor: 1 },
          { value: "F", label: "°F (×0.5556)", factor: 0.5556 },
        ],
        defaultUnit: "C", defaultValue: 30, min: 0, max: 80, step: 1 },
      { id: "conductors", label: "Current-carrying conductors", kind: "number", unit: "×", defaultValue: 3, min: 1, max: 100, step: 1, help: "In the same raceway or cable. Grounds don't count." },
    ],
    calc: deratingCalc,
    formula: ["I_derated = I_table × F_temp × F_fill"],
    variables: [
      { symbol: "F_temp", meaning: "Temperature correction (NEC 310.15(B)(1))", unit: "—" },
      { symbol: "F_fill", meaning: "Fill adjustment (NEC 310.15(C)(1))", unit: "—" },
      { symbol: "I_derated", meaning: "Effective ampacity", unit: "A" },
    ],
    howItWorks: [
      "Temperature correction scales ampacity for ambient above or below 30 °C using the NEC 310.15(B)(1) factors.",
      "Fill adjustment reduces ampacity when more than three current-carrying conductors share a raceway (310.15(C)(1)).",
      "Both factors compound — the effective ampacity is the product.",
    ],
    example:
      "10 AWG THHN (35 A at 75 °C) in an attic at 50 °C with 9 conductors: temp factor 0.88, fill factor 0.7 → 35 × 0.88 × 0.7 = 21.6 A effective. That 30 A circuit is now a 20 A circuit.",
    interpretation:
      "Derating is where most DIY ampacity mistakes happen: a conduit through a hot attic with a dozen conductors can halve a conductor's rating. The design flow is: pick a conductor from the table, apply derating, and confirm the derated ampacity still exceeds the load (with the 125% continuous factor).",
    assumptions: [
      "75 °C insulation column; 90 °C columns allow starting from a higher base.",
      "Uniform loading across conductors.",
    ],
    limitations: [
      "Rooftop installations add a separate adder (NEC 310.15(B)(2)).",
      "Cable trays and underground duct banks have their own ampacity tables.",
    ],
    faqs: [
      {
        q: "Do grounds count for derating?",
        a: "No — equipment grounding conductors never count as current-carrying. Neutrals count unless they carry only unbalanced current of a 3-phase wye set.",
      },
      {
        q: "Why does ambient temperature matter?",
        a: "Conductor insulation has a maximum temperature. Ampacity tables assume 30 °C ambient; hotter surroundings leave less headroom for self-heating, so the allowable current drops.",
      },
    ],
    references: [
      { label: "NEC 310.15 — Ampacity correction and adjustment", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["wire-size-calculator", "wire-resistance-calculator", "breaker-size-calculator", "voltage-drop-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "breaker-size-calculator",
    category: "electrical",
    name: "Breaker Size Calculator",
    title: "Breaker Size Calculator — Standard Ratings | IngCalc",
    description:
      "Find the correct breaker size for a load, including the 125% continuous-load rule and standard breaker ratings from 15 to 400 A.",
    summary:
      "Enter the load current and whether it's continuous to get the design current and the next standard breaker rating — plus the conductor requirement that goes with it.",
    keywords: ["breaker size calculator", "circuit breaker sizing", "what size breaker", "overcurrent protection"],
    inputs: [
      { id: "loadA", label: "Load current", kind: "number", unit: "A", defaultValue: 24, min: 0.1, step: 0.5 },
      {
        id: "continuous", label: "Load type", kind: "select",
        options: [
          { value: "no", label: "Non-continuous (< 3 hours)" },
          { value: "yes", label: "Continuous (3+ hours)" },
        ],
        defaultOption: "no",
      },
    ],
    calc: breakerSizing,
    formula: ["Design A = load × 1.25 (continuous)", "Breaker = next standard rating ≥ design current"],
    variables: [
      { symbol: "I_design", meaning: "Design current", unit: "A" },
      { symbol: "I_breaker", meaning: "Standard breaker rating", unit: "A" },
    ],
    howItWorks: [
      "Continuous loads (3 h+) multiply by 1.25 per NEC 210.20(A) so the breaker doesn't sit at 100% for hours.",
      "The design current is matched to the next standard rating from the 15–400 A series.",
      "The conductor must have ampacity (after derating) at least equal to the design current.",
    ],
    example:
      "A 24 A water heater (continuous): design = 30 A → 30 A breaker and conductors with ≥30 A derated ampacity (10 AWG copper at 75 °C).",
    interpretation:
      "The breaker protects the conductor, not the appliance — so conductor and breaker size together. Going one breaker size up without upsizing the wire is the classic code violation. Standard ratings exist because devices are manufactured in fixed sizes; the next-size-up rule (240.4(B)) has strict conditions.",
    assumptions: [
      "General branch-circuit rules; motor circuits follow NEC 430 with different multipliers.",
      "Standard thermal-magnetic breaker trip characteristics.",
    ],
    limitations: [
      "Motor branch/short-circuit protection can be 2.5× FLC (inverse-time) — this tool is not for motor circuits.",
      "Specific appliance rules (AC units, ranges) override general sizing.",
    ],
    faqs: [
      {
        q: "What breaker for a 20 amp load?",
        a: "A 20 A breaker for non-continuous; if it runs 3+ hours, 25 A design → 25 A breaker with matching conductor.",
      },
      {
        q: "Can I use a bigger breaker than the wire rating?",
        a: "Generally no — the breaker protects the wire. Limited exceptions exist (240.4(B) next-size-up, motor circuits), but they're rule-specific, not general.",
      },
    ],
    references: [
      { label: "NEC 240 — Overcurrent Protection", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["wire-size-calculator", "wire-derating-calculator", "motor-current-calculator", "kva-to-amps-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "cable-reactance-calculator",
    category: "electrical",
    name: "Cable Reactance Calculator",
    title: "AC Cable Reactance & Voltage Drop Calculator | IngCalc",
    description:
      "Calculate AC cable impedance including reactance for large conductors, where NEC Table 9 values matter. More accurate voltage drop for big wire runs.",
    summary:
      "For large conductors where reactance matters: enter size and length to get R, X, Z and the AC voltage drop — the refinement over DC-only drop math.",
    keywords: ["cable reactance calculator", "ac voltage drop", "conductor reactance", "nec table 9"],
    inputs: [
      { id: "wire", label: "Conductor size", kind: "select",
        options: COPPER_WIRES.filter((w) => w.cmil >= 105600).map((w) => ({ value: w.awg, label: w.awg })),
        defaultOption: "1/0 AWG" },
      { id: "length", label: "One-way length", kind: "number", defaultValue: 200, min: 0, step: 10,
        unitOptions: [{ value: "ft", label: "feet", factor: 1 }, { value: "m", label: "meters", factor: 3.28084 }],
        defaultUnit: "ft" },
      { id: "current", label: "Load current", kind: "number", unit: "A", defaultValue: 150, min: 0, step: 5 },
    ],
    calc: cableReactance,
    formula: ["Z = √(R² + X²)", "Vd = I × Z", "X ≈ 0.048 Ω/1000 ft (non-magnetic conduit, 60 Hz)"],
    variables: [
      { symbol: "R", meaning: "Conductor resistance", unit: "Ω" },
      { symbol: "X", meaning: "Inductive reactance", unit: "Ω" },
      { symbol: "Z", meaning: "Impedance", unit: "Ω" },
    ],
    howItWorks: [
      "Resistance comes from the NEC Chapter 9 Table 8 series; reactance uses the Table 9 approximate value for large conductors in non-magnetic conduit.",
      "Impedance combines both vectorially; voltage drop is current × impedance.",
      "For conductors below 1/0 AWG, resistance dominates and the plain voltage-drop calculator is sufficient.",
    ],
    example:
      "4/0 AWG, 200 ft, 150 A single-phase: R = 0.0243 Ω, X = 0.0192 Ω, Z = 0.0311 Ω → drop = 4.66 V. The DC-only calc would give 3.65 V — reactance adds 28% here.",
    interpretation:
      "As conductors get larger, their reactance stops being negligible: at 4/0 and above, X can rival R. That's why long large-conductor runs need the AC method, and why conductor spacing in conduit affects drop. Steel conduit adds reactance versus PVC or aluminum.",
    assumptions: [
      "60 Hz, single-phase round-trip model, non-magnetic conduit.",
      "Uniform conductor spacing (typical random lay).",
    ],
    limitations: [
      "Three-phase systems divide the reactance path differently.",
      "Steel conduit raises X by 20–40%.",
      "Very large busway or parallel sets need engineering software.",
    ],
    faqs: [
      {
        q: "When does reactance matter for voltage drop?",
        a: "Roughly from 1/0 AWG upward in long runs. Below that, resistance dominates and DC math is within a few percent.",
      },
      {
        q: "Does conduit material affect voltage drop?",
        a: "Yes — steel conduit adds inductive reactance (magnetic circuit around the conductors), increasing drop on large conductors. PVC and aluminum don't.",
      },
    ],
    references: [
      { label: "NEC Chapter 9, Table 9 — Reactance Data", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["voltage-drop-calculator", "wire-resistance-calculator", "wire-size-calculator", "wire-derating-calculator"],
    priority: "C",
    lastUpdated: "2026-09-15",
  },
];
