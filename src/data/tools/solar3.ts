import type { ToolDefinition } from "@/lib/types";
import { consumptionAudit, inverterSizing, dcAcRatio } from "@/lib/engines/solar3";

export const SOLAR3_TOOLS: ToolDefinition[] = [
  {
    slug: "energy-consumption-calculator",
    category: "solar-energy",
    name: "Energy Consumption Calculator",
    title: "Energy Consumption Calculator — Daily kWh Audit | IngCalc",
    description:
      "Audit daily energy use by appliance group: watts × hours for lighting, refrigeration, electronics and more — with battery and solar array translation.",
    summary:
      "Enter watts and hours for five load groups to get your daily kWh — the load-list number every off-grid or backup system design starts from, translated to battery and array sizes.",
    keywords: ["energy consumption calculator", "daily kwh calculator", "off grid load calculator", "appliance energy audit"],
    inputs: [
      { id: "lightingW", label: "Lighting — total watts", kind: "number", unit: "W", defaultValue: 60, min: 0, step: 10 },
      { id: "lightingH", label: "Lighting — hours/day", kind: "number", unit: "h", defaultValue: 5, min: 0, max: 24, step: 0.5 },
      { id: "refrigerationW", label: "Refrigeration — average watts", kind: "number", unit: "W", defaultValue: 50, min: 0, step: 5, help: "Compressor average while cycling, not nameplate. A typical 12 V fridge averages 40-60 W." },
      { id: "refrigerationH", label: "Refrigeration — run hours/day", kind: "number", unit: "h", defaultValue: 10, min: 0, max: 24, step: 0.5 },
      { id: "electronicsW", label: "Electronics — total watts", kind: "number", unit: "W", defaultValue: 100, min: 0, step: 10 },
      { id: "electronicsH", label: "Electronics — hours/day", kind: "number", unit: "h", defaultValue: 6, min: 0, max: 24, step: 0.5 },
      { id: "cookingW", label: "Cooking — total watts", kind: "number", unit: "W", defaultValue: 0, min: 0, step: 50 },
      { id: "cookingH", label: "Cooking — hours/day", kind: "number", unit: "h", defaultValue: 0, min: 0, max: 24, step: 0.25 },
      { id: "otherW", label: "Pumps / other — total watts", kind: "number", unit: "W", defaultValue: 30, min: 0, step: 10 },
      { id: "otherH", label: "Pumps / other — hours/day", kind: "number", unit: "h", defaultValue: 2, min: 0, max: 24, step: 0.25 },
    ],
    calc: consumptionAudit,
    formula: ["kWh/day = Σ (watts × hours) ÷ 1000", "Battery Ah = Wh ÷ DoD ÷ system V", "Array Wp = Wh ÷ (PSH × derate)"],
    variables: [
      { symbol: "Wh", meaning: "Daily energy per load group", unit: "Wh" },
      { symbol: "DoD", meaning: "Depth of discharge", unit: "—" },
    ],
    howItWorks: [
      "Each group contributes watts × hours; the sum is the daily energy the system must supply.",
      "Refrigeration should use average draw and compressor-run hours, not the 24 h nameplate — the honest way to count cycling loads.",
      "The battery row applies 50% DoD (lead-acid convention) at 12 V; lithium at 80-90% DoD needs less.",
      "The array row uses a 4 PSH / 0.8 derate screening figure; the off-grid calculator refines it with autonomy and worst-month sun.",
    ],
    example:
      "A small cabin: lighting 60 W × 5 h = 300 Wh, fridge 50 W × 10 h = 500 Wh, electronics 100 W × 6 h = 600 Wh, pump 30 W × 2 h = 60 Wh → 1.46 kWh/day. Battery at 50% DoD, 12 V: 243 Ah. Array at 4 PSH: ~456 Wp — a sensible 480 W (2 × 240 W) starter system.",
    interpretation:
      "The load list is where solar designs succeed or fail: optimism here multiplies through every later component. Measure what you can — a plug-in power meter on the fridge beats any table. Loads that run 24/7 (fridge, network gear) dominate; occasional high-watt loads (kettle, microwave) matter less for energy but set the inverter size, which the inverter calculator handles.",
    assumptions: [
      "Average watts × hours for each group — cycling loads need compressor-run hours, not clock hours.",
      "Battery and array rows are screening figures (50% DoD, 4 PSH, 0.8 derate).",
    ],
    limitations: [
      "Does not capture seasonal variation (pumps in summer, heating in winter) — audit per season if loads vary.",
      "Peak simultaneous load is not computed — enter it in the inverter or off-grid calculators.",
    ],
    faqs: [
      {
        q: "How many kWh does a cabin use per day?",
        a: "A modest off-grid cabin runs 1.5-3 kWh/day (lights, fridge, water pump, electronics); a full-size off-grid home typically needs 8-15 kWh/day plus backup for winter. The honest number comes from the load list, not a rule of thumb.",
      },
      {
        q: "How do I count a fridge's consumption?",
        a: "Use average watts while running (often 40-60% of nameplate) times actual compressor-run hours (8-12 h/day typical). A '120 W' fridge averaging 55 W for 10 h is 0.55 kWh/day.",
      },
    ],
    references: [
      { label: "NREL — off-grid PV system sizing guidance", url: "https://www.nrel.gov/solar/" },
    ],
    related: ["off-grid-system-calculator", "inverter-sizing-calculator", "battery-runtime-calculator", "panel-count-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "inverter-sizing-calculator",
    category: "solar-energy",
    name: "Inverter Sizing Calculator",
    title: "Inverter Sizing Calculator — VA, Surge & Power Factor | IngCalc",
    description:
      "Size an inverter from continuous load, surge requirement and power factor. Pure sine guidance and idle-draw warnings included.",
    summary:
      "Enter continuous and surge loads to get the minimum inverter VA rating — with the power-factor conversion and surge margin that prevent nuisance shutdowns.",
    keywords: ["inverter sizing calculator", "inverter size calculator", "what size inverter", "inverter va rating"],
    inputs: [
      { id: "continuousW", label: "Continuous load", kind: "number", unit: "W", defaultValue: 800, min: 1, step: 50,
        help: "Everything that could run at the same time." },
      { id: "surgeW", label: "Largest motor surge", kind: "number", unit: "W", defaultValue: 1200, min: 0, step: 100, optional: true,
        help: "Starting draw of the biggest motor or compressor (typically 2-3× its running watts). Blank if none." },
      { id: "pf", label: "Load power factor", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.5, max: 1, step: 0.05,
        help: "Resistive loads ≈ 1.0; electronics 0.8-0.95; small motors 0.7-0.85." },
    ],
    calc: inverterSizing,
    formula: ["Required VA = max(continuous × 1.25, surge) ÷ PF"],
    variables: [
      { symbol: "S", meaning: "Inverter rating", unit: "VA / W" },
      { symbol: "PF", meaning: "Load power factor", unit: "—" },
    ],
    howItWorks: [
      "Continuous load is multiplied by 1.25 for margin, then divided by power factor — inverters are VA-rated while loads are watt-described.",
      "The surge requirement (biggest motor start) is compared against the continuous figure; the larger wins.",
      "Low power factor inflates the VA need: an 800 W load at PF 0.8 demands 1000 VA, not 800.",
    ],
    example:
      "A cabin with 800 W of simultaneous loads and a fridge that surges to 1200 W at PF 0.9: continuous with margin = 1000 W → 1111 VA; surge = 1333 VA → a 1500 VA pure-sine inverter is the floor. Check its surge rating (usually 2× for 5 s) covers the motor start.",
    interpretation:
      "Inverters fail two ways: sustained overload trips them during normal use (undersized continuous), and motors stall at start (insufficient surge rating). Size continuous generously — future loads always arrive — and verify the surge spec in the datasheet, not the marketing headline. Idle draw is the silent budget killer on small systems: 20 W of standby consumption is 0.5 kWh/day, more than the fridge.",
    assumptions: [
      "Single inverter, sine-wave output assumed for motor and electronics loads.",
      "Power factor of the load mix, not the inverter's own rating convention.",
    ],
    limitations: [
      "Does not size battery current draw: DC amps = VA ÷ battery voltage — verify cables and BMS limits separately.",
      "Parallel/stacked inverter configurations have their own surge-sharing rules.",
    ],
    faqs: [
      {
        q: "What size inverter for a fridge?",
        a: "A fridge running at 150 W typically surges 400-600 W at start — a 1000 VA pure-sine inverter handles it with margin. Never use modified-sine for a fridge compressor: it runs hotter and noisier.",
      },
      {
        q: "Why divide watts by power factor for inverter sizing?",
        a: "Inverter ratings are in VA (voltage × current capacity) while loads are described in watts (real power). Current depends on VA: a 0.8 PF load drawing 800 W pulls 1000 VA through the inverter's transistors and cables.",
      },
    ],
    references: [
      { label: "DOE — inverters and converters for PV systems", url: "https://www.energy.gov/eere/solar/solar-integration-inverters-and-grid-services" },
    ],
    related: ["energy-consumption-calculator", "off-grid-system-calculator", "generator-sizing-calculator", "battery-runtime-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "dc-ac-ratio-calculator",
    category: "solar-energy",
    name: "DC/AC Ratio Calculator",
    title: "DC/AC Ratio Calculator — Array Oversizing & Clipping | IngCalc",
    description:
      "Calculate the DC/AC ratio of a PV system and estimate annual clipping loss from peak-hour production. Inverter oversizing guidance included.",
    summary:
      "Enter array DC size, inverter AC rating and sun hours to get the DC/AC ratio and a screening estimate of how much energy clipping wastes at peak sun.",
    keywords: ["dc ac ratio calculator", "inverter oversizing", "solar clipping calculator", "array to inverter ratio"],
    inputs: [
      { id: "dcKw", label: "Array size (DC, STC)", kind: "number", unit: "kW", defaultValue: 7, min: 0.1, step: 0.5 },
      { id: "acKw", label: "Inverter rating (AC)", kind: "number", unit: "kW", defaultValue: 6, min: 0.1, step: 0.5 },
      { id: "psh", label: "Peak sun hours", kind: "number", unit: "h", defaultValue: 4.5, min: 1, step: 0.1,
        help: "Annual average for your location." },
    ],
    calc: dcAcRatio,
    formula: ["DC/AC ratio = Wp_DC ÷ W_AC", "clipping ≈ f(peak-hour production vs AC rating)"],
    variables: [
      { symbol: "ratio", meaning: "DC-to-AC ratio", unit: ":1" },
      { symbol: "PSH", meaning: "Peak sun hours", unit: "h/day" },
    ],
    howItWorks: [
      "The ratio is simply array watts over inverter watts — the design lever between energy harvest and inverter cost.",
      "Clipping is estimated from peak-hour production: when the array's peak output exceeds the AC rating, the excess is lost.",
      "The screening formula assumes ~15% of the day's ideal energy arrives in the peak hour — a practical single-digit estimate, not a simulation.",
    ],
    example:
      "A 7 kW array on a 6 kW inverter (1.17 ratio) at 4.5 PSH: daily ideal 31.5 kWh, peak-hour output ≈ 4.7 kW — under the 6 kW rating, so clipping ≈ 0%. The same array on a 5 kW inverter (1.4): peak 4.7 kW still clears, but hot clear days push STC output past 7 kW and clipping appears on the best days.",
    interpretation:
      "Mild oversizing (1.15-1.30) usually pays: the array fills morning, evening and cloudy-day production cheaply while the inverter runs at its most efficient flat-top. Clipping losses at 1.2-1.3 are typically 1-3% annually — less than the energy the oversizing gains. Beyond 1.4, verify the inverter's maximum DC input power: many models accept limited oversizing regardless of the clipping math.",
    assumptions: [
      "Screening estimate: real clipping depends on orientation, climate, temperature and inverter curve — PVsyst-grade results need simulation.",
      "Peak-hour share of daily energy ~15% for a fixed-tilt array.",
    ],
    limitations: [
      "Does not model inverter temperature derating, voltage windows or multi-MPPT allocation.",
      "Not suitable for DC-coupled storage systems where clipped energy charges batteries.",
    ],
    faqs: [
      {
        q: "What DC/AC ratio should a solar system have?",
        a: "1.15-1.30 is the modern residential norm. It costs little and captures morning/evening energy, while clipping losses stay in the 1-3% range.",
      },
      {
        q: "Is clipping bad?",
        a: "A little is efficient design — the inverter that never clips is probably undersized on DC and idle at peak sun. Losses beyond ~5% annually suggest re-balancing the array or adding storage to capture the excess.",
      },
    ],
    references: [
      { label: "NREL PVWatts — inverter loss model", url: "https://pvwatts.nrel.gov/" },
    ],
    related: ["solar-panel-output-calculator", "string-sizing-calculator", "solar-savings-calculator", "panel-count-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
