import type { ToolDefinition } from "@/lib/types";
import { panelOutput, batteryRuntime, offGridSizing, chargeController } from "@/lib/engines/solar";

export const SOLAR_TOOLS: ToolDefinition[] = [
  {
    slug: "solar-panel-output-calculator",
    category: "solar-energy",
    name: "Solar Panel Output Calculator",
    title: "Solar Panel Output Calculator — kWh per Day | IngCalc",
    description:
      "Calculate solar panel energy output per day, month and year from wattage and local peak sun hours, with a documented derate factor for real-world losses.",
    summary:
      "Enter panel wattage and your location's peak sun hours to get realistic daily, monthly and yearly energy — including the standard loss derate.",
    keywords: ["solar panel output calculator", "kwh per day solar", "solar panel production calculator", "peak sun hours calculator"],
    inputs: [
      { id: "wattPeak", label: "Panel/array wattage", kind: "number", unit: "Wp", defaultValue: 400, min: 1, step: 10, help: "Total Wp for the array (e.g. 10 panels × 400 W = 4000)." },
      { id: "psh", label: "Peak sun hours per day", kind: "number", unit: "h", defaultValue: 4.5, min: 0.5, step: 0.1, help: "Average daily equivalent full-sun hours. Check the Global Solar Atlas for your location." },
      { id: "derate", label: "System derate factor", kind: "number", unit: "0-1", defaultValue: 0.8, min: 0.4, max: 1, step: 0.05, help: "0.8 typical: inverter ~96%, wiring ~2%, soiling ~3%, temperature ~4-8%." },
    ],
    calc: panelOutput,
    formula: ["E = Wp × PSH × derate"],
    variables: [
      { symbol: "E", meaning: "Daily energy", unit: "Wh" },
      { symbol: "Wp", meaning: "Peak wattage (STC)", unit: "W" },
      { symbol: "PSH", meaning: "Peak sun hours", unit: "h/day" },
    ],
    howItWorks: [
      "Panels are rated at Standard Test Conditions (1000 W/m², 25 °C). PSH converts your location's daily irradiance into equivalent full-sun hours.",
      "Multiplying Wp × PSH gives the ideal energy; the derate factor then subtracts real losses (inverter, wiring, soiling, heat).",
      "Daily energy is extrapolated to monthly and yearly averages.",
    ],
    example:
      "A 400 W panel with 4.5 PSH and 0.8 derate: 400 × 4.5 × 0.8 = 1,440 Wh/day ≈ 1.44 kWh/day, ~43 kWh/month, ~525 kWh/year. Ten such panels: ~14.4 kWh/day.",
    interpretation:
      "Real output varies seasonally — a 4.5 PSH annual average might mean 6 PSH in summer and 2.5 in winter at mid-latitudes. Size systems for the worst month if you need year-round reliability. The derate factor dominates long-term yield: dirty panels in dusty climates can fall well below 0.8 without cleaning.",
    assumptions: [
      "Fixed tilt approximately equal to latitude, south-facing (northern hemisphere).",
      "Panel output at STC; real nameplate tolerance ±3%.",
    ],
    limitations: [
      "Does not model shading from trees, chimneys or adjacent rows — partial shading can halve output.",
      "Temperature losses vary widely by climate and mounting airflow.",
      "Grid-tied systems with clipping (DC/AC ratio > 1.2) behave differently.",
    ],
    faqs: [
      {
        q: "How much does a 400 W panel produce per day?",
        a: "Depends on your PSH: at 4.5 PSH with typical losses, about 1.4–1.5 kWh/day. Multiply by 365 for the yearly figure (~525 kWh).",
      },
      {
        q: "What is a good derate factor?",
        a: "0.75–0.85 is realistic for a well-installed fixed system. Optimized string inverters with clean panels can reach 0.85+; dusty or hot rooftops can fall to 0.7.",
      },
    ],
    references: [
      { label: "Global Solar Atlas — World Bank/ESMAP irradiance data", url: "https://globalsolaratlas.info/" },
      { label: "NREL PVWatts — reference derate methodology", url: "https://pvwatts.nrel.gov/" },
    ],
    related: ["battery-runtime-calculator", "off-grid-system-calculator", "charge-controller-calculator", "wire-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "battery-runtime-calculator",
    category: "solar-energy",
    name: "Battery Runtime Calculator",
    title: "Battery Runtime Calculator — Ah to Hours with DoD | IngCalc",
    description:
      "Calculate how long a battery will run a given load, including depth of discharge and inverter efficiency. Shows usable energy and daily consumption.",
    summary:
      "Enter battery Ah and voltage, your load in watts, plus DoD and inverter efficiency, to get realistic runtime — not the naive Ah ÷ A figure.",
    keywords: ["battery runtime calculator", "how long will battery last", "ah to hours", "battery capacity calculator"],
    inputs: [
      { id: "capacityAh", label: "Battery capacity", kind: "number", unit: "Ah", defaultValue: 100, min: 1, step: 5 },
      {
        id: "voltage", label: "Battery voltage", kind: "number", unit: "V", defaultValue: 12, min: 1, step: 1,
      },
      { id: "loadW", label: "Load power", kind: "number", unit: "W", defaultValue: 100, min: 1, step: 10 },
      { id: "dod", label: "Depth of discharge", kind: "number", unit: "0-1", defaultValue: 0.5, min: 0.05, max: 1, step: 0.05, help: "0.5 for lead-acid (cycle life), 0.8–0.9 for lithium." },
      { id: "inverterEff", label: "Inverter efficiency", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.5, max: 1, step: 0.01, help: "Set to 1.0 for DC loads (no inverter)." },
    ],
    calc: batteryRuntime,
    formula: ["Usable Wh = Ah × V × DoD × η_inv", "Runtime (h) = Usable Wh / Load W"],
    variables: [
      { symbol: "Ah", meaning: "Rated capacity", unit: "Ah" },
      { symbol: "DoD", meaning: "Depth of discharge", unit: "—" },
      { symbol: "η", meaning: "Inverter efficiency", unit: "—" },
    ],
    howItWorks: [
      "Nominal energy is Ah × V. DoD limits how much you can draw before recharging; inverter efficiency subtracts conversion losses.",
      "Runtime is usable energy divided by the load — and the tool also shows what the load consumes per day for solar sizing.",
    ],
    example:
      "A 100 Ah 12 V lead-acid battery (DoD 0.5) running a 100 W load through a 90% efficient inverter: usable = 1200 × 0.5 × 0.9 = 540 Wh. Runtime = 5.4 hours — not the 12 hours a naive Ah ÷ A calc suggests.",
    interpretation:
      "The difference between naive and realistic runtime is entirely DoD and efficiency. Draining lead-acid below 50% repeatedly shortens its life dramatically, which is why the DoD cap matters more than the capacity figure. Lithium (LiFePO4) tolerates 80–90% DoD, effectively doubling usable capacity per rated Ah.",
    assumptions: [
      "Constant load power, battery at room temperature.",
      "Peukert effect ignored — accurate for lithium, optimistic for lead-acid at high discharge rates (above ~C/2).",
    ],
    limitations: [
      "Lead-acid capacity drops sharply at high discharge rates and low temperatures.",
      "Inverter no-load consumption (10–30 W) is not subtracted — it matters for small loads over long periods.",
      "Battery capacity degrades with age; a 5-year-old battery may hold 70–80% of rated Ah.",
    ],
    faqs: [
      {
        q: "How long will a 100Ah battery run a fridge?",
        a: "A typical 12 V fridge averages 40–60 W (cycling). At 50 W with a 100 Ah AGM battery at 50% DoD and 90% inverter efficiency: about 10 hours. With LiFePO4 at 90% DoD: ~19 hours.",
      },
      {
        q: "Why not use the full battery capacity?",
        a: "Lead-acid chemistry degrades when deeply discharged — staying above 50% DoD multiplies cycle life several times. Lithium tolerates deep discharge much better.",
      },
    ],
    references: [
      { label: "Battery University — depth of discharge & cycle life", url: "https://batteryuniversity.com/article/bu-808-how-to-prolong-lithium-based-batteries" },
    ],
    related: ["solar-panel-output-calculator", "off-grid-system-calculator", "charge-controller-calculator", "kva-to-amps-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "off-grid-system-calculator",
    category: "solar-energy",
    name: "Off-Grid System Calculator",
    title: "Off-Grid Solar Calculator — Battery & Array Sizing | IngCalc",
    description:
      "Size a complete off-grid system: battery bank Ah, panel array Wp and inverter rating from your daily energy use, autonomy days and sun hours.",
    summary:
      "Enter your daily energy consumption and get the battery bank, solar array and inverter sizes needed — with every sizing factor (DoD, autonomy, derate) explicit.",
    keywords: ["off grid solar calculator", "solar system sizing", "battery bank sizing", "solar array calculator"],
    inputs: [
      { id: "dailyWh", label: "Daily energy use", kind: "number", unit: "Wh", defaultValue: 2000, min: 10, step: 100, help: "Add up all loads × hours. A small cabin is typically 1500–3000 Wh/day." },
      {
        id: "systemV", label: "System voltage", kind: "number", unit: "V", defaultValue: 24, min: 6, step: 1,
        help: "12 V for small systems, 24 V mid-size, 48 V above ~3 kW.",
      },
      { id: "dod", label: "Battery depth of discharge", kind: "number", unit: "0-1", defaultValue: 0.5, min: 0.1, max: 1, step: 0.05 },
      { id: "inverterEff", label: "Inverter efficiency", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.5, max: 1, step: 0.01 },
      { id: "autonomyDays", label: "Days of autonomy", kind: "number", unit: "days", defaultValue: 2, min: 0.5, step: 0.5, help: "Cloudy-day reserve. 2–3 days typical, more for critical loads." },
      { id: "psh", label: "Peak sun hours (worst month)", kind: "number", unit: "h", defaultValue: 3.5, min: 0.5, step: 0.1, help: "Use the WORST month of the year, not the annual average." },
      { id: "derate", label: "System derate factor", kind: "number", unit: "0-1", defaultValue: 0.8, min: 0.4, max: 1, step: 0.05 },
      { id: "peakLoadW", label: "Peak simultaneous load", kind: "number", unit: "W", defaultValue: 1500, min: 0, step: 50, optional: true, help: "Everything that could run at once. Used for inverter sizing." },
    ],
    calc: offGridSizing,
    formula: [
      "Battery Wh = (daily Wh ÷ η_inv) × autonomy days ÷ DoD",
      "Battery Ah = Battery Wh ÷ system V",
      "Array Wp = (daily Wh ÷ η_inv) ÷ (PSH × derate)",
    ],
    variables: [
      { symbol: "Wh", meaning: "Energy", unit: "Wh" },
      { symbol: "DoD", meaning: "Depth of discharge", unit: "—" },
      { symbol: "PSH", meaning: "Peak sun hours", unit: "h/day" },
    ],
    howItWorks: [
      "Daily consumption is first inflated by inverter losses — the battery must supply more than the loads actually use.",
      "The battery bank covers the inflated load for your autonomy days, divided by DoD so the bank never crosses its discharge limit.",
      "The array must replace a full day's consumption within the worst-month sun hours, again after derate.",
      "If a peak load is entered, the inverter is sized 25% above it for surge margin.",
    ],
    example:
      "A cabin using 2,000 Wh/day on a 24 V system, LiFePO4 (DoD 0.85), 2 days autonomy, 3.5 PSH worst month: battery = (2222 × 2) / 0.85 = 5,228 Wh = 218 Ah @ 24 V. Array = 2222 / (3.5 × 0.8) = 794 Wp — round to 800 W (2 × 400 W panels).",
    interpretation:
      "Every input is a design trade-off: more autonomy days mean a bigger bank for cloudy spells; higher DoD (lithium) shrinks the bank; using the worst-month PSH instead of the annual average makes the system work year-round but costs more in panels. Undersizing any factor shows up as dead batteries in winter.",
    assumptions: [
      "Daily energy use is constant across the year.",
      "Array fully recharges the bank each sunny day; generator/backup not included.",
    ],
    limitations: [
      "Charge-rate limit not checked: panel W ÷ system V must stay within the battery's max charge C-rate.",
      "Temperature effects on battery capacity (lead-acid loses ~1%/°C below 20 °C) are not modeled.",
      "Seasonal load variation (pumps, heating) requires sizing per season.",
    ],
    faqs: [
      {
        q: "12V, 24V or 48V system?",
        a: "Above about 1,000 Ah or 1,500 W of continuous load, go 24 V; above 3 kW, 48 V. Higher voltage halves the current, halving cable cost and losses.",
      },
      {
        q: "How many days of autonomy do I need?",
        a: "2–3 days suits most climates. Sunny regions can use 1–2 with a generator backup; critical loads in cloudy climates justify 4–5.",
      },
    ],
    references: [
      { label: "NREL — off-grid PV system design principles", url: "https://www.nrel.gov/research/publications.html" },
      { label: "Global Solar Atlas — monthly PSH data", url: "https://globalsolaratlas.info/" },
    ],
    related: ["battery-runtime-calculator", "solar-panel-output-calculator", "charge-controller-calculator", "wire-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "charge-controller-calculator",
    category: "solar-energy",
    name: "Charge Controller Calculator",
    title: "Charge Controller Sizing Calculator — MPPT & PWM | IngCalc",
    description:
      "Size MPPT or PWM solar charge controllers correctly: MPPT by array watts and system voltage with margin, PWM by array short-circuit current.",
    summary:
      "Pick the controller type and get the minimum amp rating — MPPT from array watts ÷ battery voltage, PWM from total Isc — with the NEC margin applied.",
    keywords: ["charge controller calculator", "mppt sizing", "pwm charge controller", "solar controller amps"],
    inputs: [
      {
        id: "type", label: "Controller type", kind: "select",
        options: [
          { value: "mppt", label: "MPPT (sized by array watts)" },
          { value: "pwm", label: "PWM (sized by array Isc)" },
        ],
        defaultOption: "mppt",
      },
      { id: "arrayW", label: "Total array wattage", kind: "number", unit: "Wp", defaultValue: 800, min: 1, step: 10 },
      {
        id: "systemV", label: "Battery/system voltage", kind: "number", unit: "V", defaultValue: 24, min: 6, step: 1,
      },
      { id: "isc", label: "Array short-circuit current (Isc)", kind: "number", unit: "A", defaultValue: 0, min: 0, step: 0.5, optional: true, help: "Sum of panel Isc in parallel. Required for PWM sizing only." },
    ],
    calc: chargeController,
    formula: [
      "MPPT: I = Array Wp ÷ System V × 1.25",
      "PWM: I = Array Isc × 1.25",
    ],
    variables: [
      { symbol: "I", meaning: "Controller output current rating", unit: "A" },
      { symbol: "Wp", meaning: "Array peak watts", unit: "W" },
      { symbol: "Isc", meaning: "Short-circuit current", unit: "A" },
    ],
    howItWorks: [
      "MPPT controllers down-convert array voltage to battery voltage, boosting current — so they're sized by power (W ÷ V) with a 25% safety margin.",
      "PWM controllers connect panels directly to the battery, so they carry the panels' short-circuit current, again with margin.",
      "The 1.25 factor follows standard NEC-style continuous-load safety practice.",
    ],
    example:
      "An 800 W array on a 24 V battery with an MPPT controller: 800 ÷ 24 = 33.3 A × 1.25 = 41.7 A → a 40 A controller is marginal; 45–60 A is the safe choice. The same array on PWM with 20 A Isc would need 25 A minimum.",
    interpretation:
      "Undersized controllers clip output (MPPT) or overheat (PWM). An oversized controller costs a little more but runs cooler and allows array expansion. Also verify: the controller's max input voltage must exceed the array's cold-temperature Voc, and its max input current must handle the array Isc for MPPT too.",
    assumptions: [
      "Standard lead-acid or lithium battery charging profile.",
      "Array configured within the controller's input voltage window.",
    ],
    limitations: [
      "Does not verify string Voc at record cold temperatures — a critical input-voltage check for MPPT.",
      "Multiple MPPT controllers can be combined; this sizes a single unit.",
      "High-voltage grid-tie systems use string inverters, not charge controllers.",
    ],
    faqs: [
      {
        q: "MPPT or PWM controller?",
        a: "MPPT harvests 10–30% more energy and is worth it for arrays above ~200 W or in cold/cloudy climates. PWM is fine for small, simple systems where the panel Vmp closely matches battery voltage.",
      },
      {
        q: "Can I oversize a charge controller?",
        a: "Yes — a higher amp rating simply runs cooler and allows future expansion. The array, not the controller rating, sets the actual current.",
      },
    ],
    references: [
      { label: "NEC Article 690 — Solar Photovoltaic Systems", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["solar-panel-output-calculator", "off-grid-system-calculator", "battery-runtime-calculator", "wire-size-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
];
