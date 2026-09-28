import type { ToolDefinition } from "@/lib/types";
import { heatConduction, thermalExpansion, idealGas, sensibleLatentHeat, heatingPower } from "@/lib/engines/thermo";

export const THERMO_TOOLS: ToolDefinition[] = [
  {
    slug: "heat-conduction-calculator",
    category: "thermodynamics",
    name: "Heat Conduction Calculator",
    title: "Heat Conduction Calculator — U-Value & Wall Heat Flow | IngCalc",
    description:
      "Calculate heat flow through a wall from up to three layers: series thermal resistances, U-value, R-value and total watts — with the air-film caveat.",
    summary:
      "Enter layer conductivities and thicknesses (up to three) plus area and ΔT to get the U-value, R-value and heat flow through the assembly.",
    keywords: ["heat conduction calculator", "u value calculator", "r value calculator", "wall heat loss calculator", "fourier conduction"],
    inputs: [
      { id: "area", label: "Assembly area", kind: "number", defaultValue: 20, min: 0.1, step: 1,
        unitOptions: [{ value: "m2", label: "m²", factor: 1 }, { value: "ft2", label: "ft² (×0.0929)", factor: 0.0929 }],
        defaultUnit: "m2" },
      { id: "deltaT", label: "Temperature difference (ΔT)", kind: "number", defaultValue: 25, min: 0.5, step: 1,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C" },
      { id: "k1", label: "Layer 1 conductivity (k)", kind: "number", defaultValue: 0.038, min: 0.005, step: 0.001, unit: "W/m·K" },
      { id: "t1", label: "Layer 1 thickness", kind: "number", defaultValue: 100, min: 1, step: 5,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm" },
      { id: "k2", label: "Layer 2 conductivity (optional)", kind: "number", defaultValue: 0.7, min: 0, step: 0.1, unit: "W/m·K", optional: true,
        help: "e.g. brick 0.7 · concrete 1.7 · wood 0.13 · glass 1.0 · mineral wool 0.038" },
      { id: "t2", label: "Layer 2 thickness (optional)", kind: "number", defaultValue: 100, min: 0, step: 5,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", optional: true },
      { id: "k3", label: "Layer 3 conductivity (optional)", kind: "number", min: 0, step: 0.1, unit: "W/m·K", optional: true },
      { id: "t3", label: "Layer 3 thickness (optional)", kind: "number", min: 0, step: 5,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", optional: true },
    ],
    calc: heatConduction,
    formula: ["R = Σ (t/k)        U = 1/R        Q = U · A · ΔT"],
    variables: [
      { symbol: "R", meaning: "Total thermal resistance", unit: "m²·K/W" },
      { symbol: "U", meaning: "U-value (thermal transmittance)", unit: "W/m²·K" },
      { symbol: "Q", meaning: "Heat flow", unit: "W" },
    ],
    howItWorks: [
      "Each layer adds resistance: thickness ÷ conductivity. Series resistances simply add.",
      "U-value is the reciprocal of total R — the number energy codes quote.",
      "Heat flow multiplies U by area and temperature difference; watts convert to BTU/h for US cross-reference.",
    ],
    example:
      "100 mm mineral wool (0.038) + 100 mm brick (0.7): R = 2.63 + 0.143 = 2.78 m²·K/W → U = 0.36 W/m²·K (R-16 imperial). At ΔT 25 °C over 20 m²: Q = 0.36 × 20 × 25 = 180 W — a 180 W heater balances this wall alone.",
    interpretation:
      "The U-value here is conduction-only: real assemblies add inside/outside air films (~R 0.18 m²·K/W combined) and lose performance to thermal bridging — studs every 400 mm can degrade a wall's effective R by 15–25%. Doubling insulation thickness halves conduction through that layer but the law of diminishing returns bites: the first 100 mm saves far more than the next 100. Compare walls on R, not thickness — 50 mm of good insulation beats 100 mm of concrete every time.",
    assumptions: [
      "Steady-state one-dimensional conduction; no air films or bridging included.",
      "Room-temperature conductivities; k rises slightly at extreme temperatures.",
    ],
    limitations: [
      "Not a whole-building energy model — windows, infiltration and thermal mass are separate.",
      "Cavity walls with ventilated air gaps need the gap treated explicitly, not as a solid layer.",
    ],
    faqs: [
      {
        q: "What is the difference between U-value and R-value?",
        a: "They are reciprocals: U = 1/R. R measures resistance to heat flow (higher is better, US convention); U measures how much heat passes (lower is better, European convention).",
      },
      {
        q: "How do I calculate heat loss through a wall?",
        a: "Q = U × A × ΔT. A 20 m² wall at U 0.36 with a 25 °C inside-outside difference loses 180 W — multiply by heating hours for the energy figure.",
      },
    ],
    references: [
      { label: "ISO 6946 — building components thermal resistance", url: "https://www.iso.org/standard/65708.html" },
      { label: "ASHRAE Handbook — Fundamentals, thermal transmission", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["heating-power-calculator", "degree-day-energy-calculator", "thermal-expansion-calculator", "heating-load-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "thermal-expansion-calculator",
    category: "thermodynamics",
    name: "Thermal Expansion Calculator",
    title: "Thermal Expansion Calculator — ΔL = α·L·ΔT | IngCalc",
    description:
      "Calculate linear thermal expansion for steel, aluminum, copper, PVC, PE and more: length change in mm and inches, with expansion-loop context.",
    summary:
      "Enter material, length and temperature swing to get the growth — the number expansion loops, pipe guides and bridge joints exist to absorb.",
    keywords: ["thermal expansion calculator", "linear expansion formula", "pipe expansion", "steel expansion coefficient"],
    inputs: [
      { id: "length", label: "Length", kind: "number", defaultValue: 30, min: 0.01, step: 1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "ft", label: "ft", factor: 0.3048 },
        ],
        defaultUnit: "m" },
      { id: "deltaT", label: "Temperature change", kind: "number", defaultValue: 50, min: -200, max: 400, step: 5,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C",
        help: "Installation temp to extreme temp — e.g. installed at 10 °C reaching 60 °C: ΔT = 50." },
      {
        id: "material", label: "Material", kind: "select",
        options: [
          { value: "steel", label: "Carbon steel (α 12)" },
          { value: "stainless", label: "Stainless 304 (α 17.3)" },
          { value: "aluminum", label: "Aluminum (α 23.1)" },
          { value: "copper", label: "Copper (α 16.6)" },
          { value: "brass", label: "Brass (α 19)" },
          { value: "concrete", label: "Concrete (α 10)" },
          { value: "glass", label: "Glass (α 9)" },
          { value: "pvc", label: "PVC (α 54)" },
          { value: "pe", label: "PE / PEX (α 150)" },
          { value: "wood", label: "Wood, along grain (α 5)" },
        ],
        defaultOption: "steel",
      },
    ],
    calc: thermalExpansion,
    formula: ["ΔL = α · L · ΔT"],
    variables: [
      { symbol: "α", meaning: "Linear expansion coefficient", unit: "×10⁻⁶/°C" },
      { symbol: "ΔL", meaning: "Length change", unit: "mm" },
    ],
    howItWorks: [
      "Linear growth is proportional to length, temperature swing and the material's α coefficient.",
      "Outputs in mm and inches for both metric and imperial detail work.",
      "The percentage row shows why short parts ignore expansion while long runs cannot.",
    ],
    example:
      "A 30 m steel pipe, 10 °C installed reaching 60 °C in service: ΔL = 12e-6 × 30 × 50 = 18 mm. The same run in PE pipe: 225 mm — which is why plastic lines snaked in trenches and anchored with expansion allowances.",
    interpretation:
      "Expansion is invisible until it binds: pipe guides seized by friction turn an 18 mm growth into buckling, and a bridge joint with no gap turns heat into cracked concrete. Design absorbs it three ways — expansion loops (let it flex), sliding guides (let it slide), or expansion joints (cut the run). Aluminum moving 2× steel is why aluminum skins on steel frames need slotted holes.",
    assumptions: [
      "Room-temperature α coefficients; varies a few percent over wide ranges.",
      "Unrestrained member — real anchor and guide stiffness change the stress picture.",
    ],
    limitations: [
      "Computation of induced stress (from restraint) is not included — restrained thermal strain needs σ = E·α·ΔT.",
      "Anisotropic materials (wood) differ along grain vs across.",
    ],
    faqs: [
      {
        q: "How much does steel expand per degree?",
        a: "12 microns per metre per °C — a 30 m run grows 0.36 mm per °C. Over a 50 °C swing that is 18 mm of movement to accommodate.",
      },
      {
        q: "Why do pipes need expansion loops?",
        a: "The pipe will move whether or not you plan for it: unrestrained growth bends things, restrained growth builds stress (E·α·ΔT — hundreds of MPa). Loops let the pipe flex within safe stress.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — thermal expansion coefficients", url: "https://www.engineeringtoolbox.com/linear-expansion-coefficients-d_95.html" },
    ],
    related: ["heat-conduction-calculator", "pipe-volume-calculator", "cantilever-beam-calculator", "hooke-law-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "ideal-gas-calculator",
    category: "thermodynamics",
    name: "Ideal Gas Calculator",
    title: "Ideal Gas Calculator — pV = nRT Solver | IngCalc",
    description:
      "Solve the ideal gas law: enter any two of pressure, volume and temperature to get the third (n fixed), in kPa, litres and Kelvin with unit cross-references.",
    summary:
      "Enter two of pressure/volume/temperature and the ideal gas law solves the third — with the Kelvin trap and unit conversions handled.",
    keywords: ["ideal gas calculator", "pv nrt calculator", "gas law calculator", "boyle charles law"],
    inputs: [
      { id: "pressure", label: "Pressure", kind: "number", defaultValue: 101.325, min: 0, step: 1, optional: true,
        unitOptions: [{ value: "kpa", label: "kPa", factor: 1 }, { value: "bar", label: "bar (×100)", factor: 100 }, { value: "psi", label: "psi (×6.895)", factor: 6.895 }],
        defaultUnit: "kpa",
        help: "Absolute pressure. Leave blank to solve for it." },
      { id: "volume", label: "Volume", kind: "number", defaultValue: 22.4, min: 0, step: 0.1, optional: true,
        unitOptions: [{ value: "l", label: "L", factor: 1 }, { value: "m3", label: "m³ (×1000)", factor: 1000 }],
        defaultUnit: "l",
        help: "Leave blank to solve for it." },
      { id: "temperature", label: "Temperature", kind: "number", defaultValue: 273.15, min: 0, step: 1, optional: true,
        unitOptions: [{ value: "k", label: "K", factor: 1 }, { value: "c", label: "°C (add 273.15)", factor: 1 }],
        defaultUnit: "k",
        help: "ABSOLUTE temperature. Leave blank to solve for it." },
      { id: "moles", label: "Moles (n)", kind: "number", defaultValue: 1, min: 0, step: 0.1, optional: true,
        help: "Blank = 1 mol. 1 mol of ideal gas at 0 °C, 101.325 kPa occupies 22.4 L." },
    ],
    calc: idealGas,
    formula: ["p·V = n·R·T        R = 8.314 J/mol·K"],
    variables: [
      { symbol: "p", meaning: "Absolute pressure", unit: "kPa" },
      { symbol: "V", meaning: "Volume", unit: "L" },
      { symbol: "T", meaning: "Absolute temperature", unit: "K" },
      { symbol: "n", meaning: "Amount of gas", unit: "mol" },
    ],
    howItWorks: [
      "Enter exactly two of p, V, T; the third solves algebraically with the gas constant R.",
      "Moles default to 1 so the reference point (22.4 L at STP) reproduces exactly.",
      "Outputs show every common pressure unit (kPa/atm/psi) to prevent unit slips.",
    ],
    example:
      "1 mol at 273.15 K in 22.4 L: p = (1 × 8.314 × 273.15)/0.0224 = 101.3 kPa — exactly atmospheric, the STP definition. Compress the same gas to half volume at constant temperature: pressure doubles (Boyle). Heat it to 546 K at constant volume: pressure doubles again (Gay-Lussac).",
    interpretation:
      "The gas law is the backbone of pneumatics, HVAC air-side reasoning and tank physics: every 'what happens to pressure when…' question resolves from pV = nRT. Two habits prevent most errors: temperatures in Kelvin (always) and pressures in absolute (gauge + atmospheric). Real gases deviate near condensation — steam work needs steam tables, and high-pressure refrigerants need real-gas data; ambient air is where the ideal model shines.",
    assumptions: [
      "Ideal gas behavior — best for air and common gases near ambient conditions.",
      "Fixed amount of gas when solving the third property.",
    ],
    limitations: [
      "Not valid near condensation or at very high pressure (use real-gas EOS or steam tables).",
      "Does not cover mixtures' partial pressures explicitly (Dalton's law stacks separate calls).",
    ],
    faqs: [
      {
        q: "What is the ideal gas law?",
        a: "pV = nRT: pressure × volume equals moles × gas constant × absolute temperature. It unites Boyle's, Charles's and Avogadro's relations into one equation.",
      },
      {
        q: "Why must temperature be in Kelvin?",
        a: "Because the law is proportional to absolute thermal energy — 0 °C is not zero energy. Using °C produces nonsense (negative pressures, wrong ratios). Always add 273.15.",
      },
    ],
    references: [
      { label: "NIST — CODATA gas constant", url: "https://www.nist.gov/" },
    ],
    related: ["sensible-heat-latent-calculator", "air-density-calculator", "temperature-conversion-calculator", "psychrometric-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "sensible-heat-latent-calculator",
    category: "thermodynamics",
    name: "Sensible & Latent Heat Calculator",
    title: "Sensible & Latent Heat Calculator — Q = m·c·ΔT | IngCalc",
    description:
      "Calculate sensible heat for water, air, metals and concrete with the water-phase latent heats shown for scale — the relations behind HVAC and process heating.",
    summary:
      "Enter mass, material and temperature change to get sensible heat in kJ/kWh/BTU — with the freeze and boil latent heats of water shown for comparison.",
    keywords: ["sensible heat calculator", "latent heat calculator", "q mc delta t", "specific heat calculator"],
    inputs: [
      { id: "mass", label: "Mass", kind: "number", defaultValue: 10, min: 0.01, step: 1,
        unitOptions: [
          { value: "kg", label: "kg", factor: 1 },
          { value: "lb", label: "lb (×0.4536)", factor: 0.4536 },
        ],
        defaultUnit: "kg" },
      { id: "deltaT", label: "Temperature change", kind: "number", defaultValue: 80, min: -500, max: 500, step: 5,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C" },
      {
        id: "material", label: "Material", kind: "select",
        options: [
          { value: "water", label: "Water (c 4.186)" },
          { value: "air", label: "Air (c 1.005)" },
          { value: "aluminum", label: "Aluminum (c 0.90)" },
          { value: "steel", label: "Steel (c 0.49)" },
          { value: "copper", label: "Copper (c 0.385)" },
          { value: "concrete", label: "Concrete (c 0.88)" },
          { value: "oil", label: "Oil (c 1.97)" },
        ],
        defaultOption: "water",
      },
    ],
    calc: sensibleLatentHeat,
    formula: ["Q = m · c · ΔT        (sensible, no phase change)"],
    variables: [
      { symbol: "Q", meaning: "Heat added or removed", unit: "kJ" },
      { symbol: "c", meaning: "Specific heat capacity", unit: "kJ/kg·K" },
    ],
    howItWorks: [
      "Sensible heat is mass × specific heat × temperature change — the energy that moves the thermometer.",
      "For water, the latent rows show the energy of phase change: 334 kJ/kg to freeze, 2257 to boil.",
      "kWh and BTU conversions make the figure comparable with energy bills and equipment ratings.",
    ],
    example:
      "A 150 L (150 kg) hot-water tank from 15 to 65 °C: Q = 150 × 4.186 × 50 = 31,400 kJ = 8.7 kWh. Boiling that tank dry instead needs 150 × 2257 = 338,600 kJ — 11× more. Evaporative coolers and cooling towers exploit exactly this ratio.",
    interpretation:
      "Sensible heat moves the thermometer; latent heat moves the phase. Water's numbers explain most of HVAC: air conditioning spends much of its energy condensing moisture (latent), not cooling air (sensible) — and a kWh is 3600 kJ, so the tank above stores what a 2 kW element delivers in 4.4 hours. Thermal mass (concrete, water) buffers temperature swings because of its high c × density product.",
    assumptions: [
      "Specific heats at room temperature; c varies mildly with temperature.",
      "No phase change within the entered temperature span (sensible only).",
    ],
    limitations: [
      "Latent heats shown only for water at 1 atm (334/2257 kJ/kg).",
      "Mixtures and moist air need psychrometric treatment, not a single c.",
    ],
    faqs: [
      {
        q: "What is the difference between sensible and latent heat?",
        a: "Sensible heat changes temperature (you can feel it with a thermometer); latent heat changes phase at constant temperature — melting ice or condensing steam. Water's latent heats are 80× and 540× the energy of heating it 1 °C.",
      },
      {
        q: "How many kWh to heat a water tank?",
        a: "kWh = litres × ΔT ÷ 860 roughly (water). A 150 L tank over 50 °C: ~8.7 kWh — multiply by your rate for the cost per heat-up.",
      },
    ],
    references: [
      { label: "NIST — thermophysical properties of water", url: "https://www.nist.gov/" },
      { label: "Engineering ToolBox — specific heat of common materials", url: "https://www.engineeringtoolbox.com/specific-heat-capacity-d_391.html" },
    ],
    related: ["heating-power-calculator", "ideal-gas-calculator", "psychrometric-calculator", "heat-conduction-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "heating-power-calculator",
    category: "thermodynamics",
    name: "Heating Power Calculator",
    title: "Heating Power Calculator — kW from Flow & ΔT | IngCalc",
    description:
      "Calculate heating or cooling power from flow rate and temperature difference for water, glycol mixes and oil — the boiler, coil and chiller rating equation.",
    summary:
      "Enter flow and ΔT to get thermal power in kW, BTU/h and tons — with the hydronic shortcut (kW ≈ L/min × ΔT ÷ 14.3) built in.",
    keywords: ["heating power calculator", "kw from lpm", "boiler kw calculator", "chiller tons from flow", "coil capacity calculator"],
    inputs: [
      { id: "flow", label: "Flow rate", kind: "number", defaultValue: 20, min: 0.1, step: 1,
        unitOptions: [
          { value: "lpm", label: "L/min", factor: 1 },
          { value: "gpm", label: "gpm (×3.785)", factor: 3.785 },
        ],
        defaultUnit: "lpm" },
      { id: "deltaT", label: "Temperature difference across the coil", kind: "number", defaultValue: 10, min: 0.5, step: 0.5,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C" },
      {
        id: "fluid", label: "Fluid", kind: "select",
        options: [
          { value: "water", label: "Water" },
          { value: "glycol30", label: "30% glycol" },
          { value: "glycol50", label: "50% glycol" },
          { value: "oil", label: "Thermal oil" },
        ],
        defaultOption: "water",
      },
    ],
    calc: heatingPower,
    formula: ["Q = ṁ · c · ΔT        (ṁ = flow × density)"],
    variables: [
      { symbol: "Q", meaning: "Thermal power", unit: "kW" },
      { symbol: "ṁ", meaning: "Mass flow", unit: "kg/s" },
    ],
    howItWorks: [
      "Mass flow (flow × density) times specific heat times ΔT gives kilowatts directly.",
      "Glycol mixtures carry less heat per litre — the fluid selector applies their real c and ρ.",
      "BTU/h and tons conversions connect to US equipment ratings.",
    ],
    example:
      "A boiler circulating 20 L/min with a 10 °C rise: Q = (20/60) × 998 × 4.186 × 10 / 1000 = 13.9 kW (47,500 BTU/h). The hydronic shortcut: 20 × 10 ÷ 14.3 = 14.0 kW — same answer, no calculator needed.",
    interpretation:
      "This equation runs both directions: pick two of (flow, ΔT, power) and the third follows. A chiller delivering 20 kW at 5 °C design ΔT needs 57 L/min — undersized flow shows up as a bigger ΔT and poor heat exchange. Glycol costs capacity: a 50% mix needs ~20% more flow for the same duty, which is why glycol systems upsize pumps as well as checking freeze protection.",
    assumptions: [
      "Steady flow, no phase change, fluid properties at operating temperature.",
      "Densities: water 998, 30% glycol 1038, 50% glycol 1062, oil 870 kg/m³.",
    ],
    limitations: [
      "Steam systems (phase change) need latent-heat math, not this sensible model.",
      "Does not size the equipment — it converts measured flow/ΔT into duty (or vice versa).",
    ],
    faqs: [
      {
        q: "How do I calculate boiler kW from flow and temperature?",
        a: "kW = flow(L/min) × ΔT(°C) ÷ 14.3 for water. 20 L/min heated 10 °C ≈ 14 kW — verify by measuring both sides of the boiler.",
      },
      {
        q: "Why does glycol reduce heating capacity?",
        a: "Glycol is thicker and carries less heat per litre: a 50% mix has ~26% less heat capacity than water. The same pump and coil deliver proportionally less duty.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals, hydronic heating", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["sensible-heat-latent-calculator", "pipe-flow-calculator", "heat-conduction-calculator", "cooling-cost-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
];
