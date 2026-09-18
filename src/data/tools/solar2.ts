import type { ToolDefinition } from "@/lib/types";
import {
  arrayElectricals,
  batteryBankSizing,
  batteryChargeTime,
  solarSavings,
  solarTilt,
  panelCount,
} from "@/lib/engines/solar2";

export const SOLAR2_TOOLS: ToolDefinition[] = [
  {
    slug: "string-sizing-calculator",
    category: "solar-energy",
    name: "Solar String Size Calculator",
    title: "Solar String Size Calculator — Voc & Inverter Match | IngCalc",
    description:
      "Size PV strings correctly: cold-temperature Voc vs inverter max input, Vmp vs MPPT window, array Isc and power. Prevents the most common design failure.",
    summary:
      "Enter panel electrical specs and string layout to check cold-temperature Voc against the inverter maximum — the check that protects your equipment.",
    keywords: ["solar string size calculator", "pv string sizing", "voc temperature correction", "inverter mppt range"],
    inputs: [
      { id: "voc", label: "Panel Voc (open-circuit voltage)", kind: "number", unit: "V", defaultValue: 37.6, min: 1, step: 0.1 },
      { id: "vmp", label: "Panel Vmp (max power voltage)", kind: "number", unit: "V", defaultValue: 31.4, min: 1, step: 0.1 },
      { id: "isc", label: "Panel Isc (short-circuit current)", kind: "number", unit: "A", defaultValue: 10.4, min: 0.1, step: 0.1 },
      { id: "imp", label: "Panel Imp (max power current)", kind: "number", unit: "A", defaultValue: 9.8, min: 0.1, step: 0.1 },
      { id: "panelsPerString", label: "Panels per string", kind: "number", unit: "×", defaultValue: 8, min: 1, max: 30, step: 1 },
      { id: "strings", label: "Number of strings", kind: "number", unit: "×", defaultValue: 2, min: 1, max: 10, step: 1 },
      { id: "minTempC", label: "Record low temperature", kind: "number", defaultValue: -10, min: -45, max: 25, step: 1,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C",
        help: "Coldest expected temperature at the site — use the record, not the average." },
      { id: "maxDcInput", label: "Inverter max DC input", kind: "number", unit: "V", defaultValue: 500, min: 0, step: 10, optional: true, help: "From the inverter datasheet. Blank to skip the check." },
    ],
    calc: arrayElectricals,
    formula: ["Voc_cold = Voc_STC × (1 + β × (25 − T_min))", "String Voc_cold = Voc_cold × panels", "β ≈ −0.29%/°C (c-Si)"],
    variables: [
      { symbol: "Voc", meaning: "Open-circuit voltage", unit: "V" },
      { symbol: "β", meaning: "Temperature coefficient of Voc", unit: "%/°C" },
      { symbol: "Vmp", meaning: "Voltage at max power", unit: "V" },
    ],
    howItWorks: [
      "Voc rises as panels cool — about 0.29% per °C below the 25 °C rating point for crystalline silicon.",
      "The string's cold Voc (panels × corrected Voc) must stay under the inverter's absolute maximum DC input, or the inverter can be destroyed on the first cold morning.",
      "String Vmp must fall inside the inverter's MPPT operating window; array Isc (×1.25) sizes the DC disconnect and wiring.",
    ],
    example:
      "A 37.6 Voc panel at −10 °C: Voc_cold = 37.6 × (1 + 0.0029 × 35) = 41.4 V. Ten panels: 414 V — fine for a 500 V inverter. Eleven: 455 V, still OK. Fourteen: 580 V — over the limit, and 14-panel strings destroy 500 V inverters in winter.",
    interpretation:
      "String sizing has two hard constraints: cold Voc under the inverter max (a survival limit) and Vmp inside the MPPT window (a harvest limit). Cold Voc is the dangerous one because it happens at dawn on the coldest day with no load current to pull the voltage down. Always use the site's record low, not the average winter temperature.",
    assumptions: [
      "Crystalline silicon temperature coefficient −0.29%/°C — verify against the panel datasheet (bifacial and thin-film differ).",
      "All panels in a string are identical and identically oriented.",
    ],
    limitations: [
      "Partial shading breaks the uniform-string assumption and can push one panel past its voltage limit.",
      "Does not size string fusing (needed above 2 strings) or DC cable ampacity.",
      "Grid-tie string inverters only — battery chargers need the charge controller calculator.",
    ],
    faqs: [
      {
        q: "Why does cold weather increase panel voltage?",
        a: "Silicon's bandgap widens as temperature falls, raising the cell's open-circuit voltage. Voc at −20 °C can be 13% above its STC rating — enough to exceed inverter limits sized at STC.",
      },
      {
        q: "What happens if string Voc exceeds the inverter max?",
        a: "The input capacitors and switches see overvoltage beyond their rating — typically instantaneous, catastrophic failure, usually not covered by warranty.",
      },
    ],
    references: [
      { label: "NEC 690.7 — maximum PV system voltage (temperature-corrected)", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { label: "IEC 62548 — PV array design requirements", url: "https://www.iec.ch/" },
    ],
    sections: [
      {
        title: "The cold-weather limit is the one that kills inverters",
        paragraphs: [
          "String Voc falls as temperature rises — which means the worst-case maximum voltage happens on the coldest clear morning of the year, not on a hot day. A string that measures safely below the inverter's maximum DC input in July can exceed it at −10 °C and destroy the inverter's input stage. This calculator applies the temperature coefficient of Voc from the panel datasheet; skipping that correction using standard test conditions is the single most common string-sizing failure in cold climates.",
        ],
      },
      {
        title: "Two limits to check, in this order",
        bullets: [
          "Maximum Voc (cold, corrected): the string's open-circuit voltage at record-low temperature must stay below the inverter's max DC input — an absolute, destructive limit.",
          "Minimum MPPT voltage (hot): at high cell temperature and full sun, Vmp must stay above the inverter's MPPT floor or the inverter clips power.",
          "Current: strings in parallel add Isc; the combined current must respect the inverter's max input current and the ×1.25 NEC sizing factor on the DC conductors.",
        ],
      },
    ],
    related: ["charge-controller-calculator", "solar-panel-output-calculator", "off-grid-system-calculator", "wire-size-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "battery-bank-calculator",
    category: "solar-energy",
    name: "Battery Bank Size Calculator",
    title: "Battery Bank Size Calculator — Ah from Daily Load | IngCalc",
    description:
      "Calculate battery bank Ah and kWh from daily energy use, system voltage, depth of discharge and autonomy days. Series/parallel layout guidance.",
    summary:
      "Enter your daily energy need and design choices (DoD, autonomy) to get the bank size in Ah and kWh, plus how many battery blocks to arrange.",
    keywords: ["battery bank size calculator", "battery bank ah", "solar battery sizing", "off grid battery"],
    inputs: [
      { id: "dailyWh", label: "Daily energy use", kind: "number", unit: "Wh", defaultValue: 2000, min: 10, step: 50 },
      { id: "systemV", label: "System voltage", kind: "number", unit: "V", defaultValue: 24, min: 6, step: 1 },
      { id: "dod", label: "Depth of discharge", kind: "number", unit: "0-1", defaultValue: 0.5, min: 0.05, max: 1, step: 0.05, help: "0.5 lead-acid, 0.8–0.9 lithium." },
      { id: "autonomyDays", label: "Days of autonomy", kind: "number", unit: "days", defaultValue: 2, min: 0.5, step: 0.5 },
    ],
    calc: batteryBankSizing,
    formula: ["Bank Wh = daily Wh × autonomy ÷ DoD", "Bank Ah = Bank Wh ÷ system V"],
    variables: [
      { symbol: "DoD", meaning: "Usable depth of discharge", unit: "—" },
      { symbol: "Ah", meaning: "Ampere-hour capacity", unit: "Ah" },
    ],
    howItWorks: [
      "Daily energy × autonomy days gives the reserve energy; dividing by DoD sizes the physical bank so you never cross the discharge limit.",
      "Bank Ah follows from the system voltage; the tool shows typical 200 Ah block counts for series/parallel layout.",
    ],
    example:
      "2,000 Wh/day, 24 V, lithium at 0.8 DoD, 2 days autonomy: bank = (2,000 × 2)/0.8 = 5,000 Wh = 208 Ah @ 24 V — one series string of 8× 200 Ah cells, or a 24 V LiFePO4 drop-in pair at 200 Ah each.",
    interpretation:
      "The DoD choice dominates: the same usable energy needs a 100 Ah lithium bank or a 160 Ah AGM bank (0.8 vs 0.5 DoD) — and lithium lasts 3–5× more cycles, which is why the premium pays off in cycle-lifetime cost. Autonomy days set how you ride out clouds; more days = bigger bank but a smaller generator dependence.",
    assumptions: [
      "Constant daily load across the autonomy period.",
      "Batteries at moderate temperature; cold derates capacity.",
    ],
    limitations: [
      "High charge/discharge rates (Peukert) reduce effective lead-acid capacity below the rated figure.",
      "Aging: replace the bank at ~80% of rated capacity.",
    ],
    faqs: [
      {
        q: "How many batteries for a 12V off-grid cabin?",
        a: "Depends on load: 1 kWh/day at 50% DoD and 2 days autonomy = 4 kWh = 333 Ah @ 12 V — four 100 Ah batteries in parallel, or better, one 12 V 300 Ah+ lithium.",
      },
      {
        q: "Should I go 12V, 24V or 48V?",
        a: "Above ~1,500 W continuous or ~1,000 Ah, go 24 V; above 3 kW, 48 V. Higher voltage cuts current, cable size and losses for the same power.",
      },
    ],
    references: [
      { label: "Battery University — series/parallel configurations", url: "https://batteryuniversity.com/article/bu-302-series-configuring-battery-packs" },
    ],
    related: ["battery-runtime-calculator", "off-grid-system-calculator", "battery-charge-time-calculator", "charge-controller-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "battery-charge-time-calculator",
    category: "solar-energy",
    name: "Battery Charge Time Calculator",
    title: "Battery Charge Time Calculator — Ah, Amps & C-Rate | IngCalc",
    description:
      "Calculate battery charging time from capacity, charger current and charge window, with C-rate check and chemistry-specific taper notes.",
    summary:
      "Enter battery Ah, charger amps and the charge window to get realistic charge time — including the C-rate flag that protects battery life.",
    keywords: ["battery charge time calculator", "charging time ah", "battery c rate", "charger sizing"],
    inputs: [
      { id: "capacityAh", label: "Battery capacity", kind: "number", unit: "Ah", defaultValue: 100, min: 1, step: 5 },
      { id: "chargerA", label: "Charger current", kind: "number", unit: "A", defaultValue: 20, min: 0.5, step: 1 },
      { id: "fromPct", label: "From state of charge", kind: "number", unit: "%", defaultValue: 20, min: 0, max: 99, step: 5 },
      { id: "toPct", label: "To state of charge", kind: "number", unit: "%", defaultValue: 100, min: 1, max: 100, step: 5 },
      { id: "eff", label: "Charge efficiency", kind: "number", unit: "0-1", defaultValue: 0.9, min: 0.5, max: 1, step: 0.01, help: "Lead-acid ~0.85, lithium ~0.97." },
    ],
    calc: batteryChargeTime,
    formula: ["Ah needed = capacity × window ÷ efficiency", "Time = Ah ÷ charger A", "C-rate = A ÷ capacity"],
    variables: [
      { symbol: "C", meaning: "C-rate (current relative to capacity)", unit: "—" },
      { symbol: "η", meaning: "Charge acceptance efficiency", unit: "—" },
    ],
    howItWorks: [
      "The charge window converts to Ah; dividing by charger current gives time at the constant-current rate.",
      "The C-rate (charger A ÷ capacity Ah) is checked: above 0.5C needs explicit fast-charge support.",
      "Efficiency inflates the energy the charger must actually deliver.",
    ],
    example:
      "100 Ah battery from 20% to 100% on a 20 A charger at 90% efficiency: 80 Ah ÷ 0.9 = 89 Ah to restore → 4.4 hours at C/5. A 50 A charger on the same battery: 1.8 hours at 0.5C — fast, but verify the battery supports it.",
    interpretation:
      "The C-rate is the battery's comfort metric: lead-acid prefers ≤ 0.2C (C/5) for full absorption; lithium handles 0.5–1C happily. The calculator's figure is the constant-current phase — lead-acid's absorption phase above ~80% stretches the last 20% enormously, so 0–80% time is the honest comparison number.",
    assumptions: [
      "Constant current until the target SOC (real chargers taper).",
      "Battery at moderate temperature.",
    ],
    limitations: [
      "Lead-acid absorption phase can take as long as the bulk phase — total time is longer than calculated.",
      "Cold batteries charge slowly or not at all (lithium BMS blocks sub-zero charging).",
    ],
    faqs: [
      {
        q: "How long to charge a 100Ah battery?",
        a: "At 20 A from 20–100%: about 4.5–5 hours (lithium) or 6–8 hours (lead-acid, with absorption taper).",
      },
      {
        q: "Can I charge a battery too fast?",
        a: "Yes — above the C-rate limit, heat and gassing (lead-acid) or lithium plating (cold Li-ion) damage the battery. Match charger current to the battery's spec.",
      },
    ],
    references: [
      { label: "Battery University — charging with a power supply / CC-CV", url: "https://batteryuniversity.com/article/bu-405-charging-with-a-power-supply" },
    ],
    related: ["battery-bank-calculator", "battery-runtime-calculator", "charge-controller-calculator", "ev-charge-time-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "solar-savings-calculator",
    category: "solar-energy",
    name: "Solar Savings Calculator",
    title: "Solar Payback Calculator — Savings & Simple Payback | IngCalc",
    description:
      "Calculate solar system savings and payback from production, electricity rates, self-consumption and installed cost. 25-year outlook included.",
    summary:
      "Enter system size, sun hours, rates and cost per watt to get annual savings, simple payback and the 25-year figure — with the honest caveats listed.",
    keywords: ["solar savings calculator", "solar payback calculator", "solar roi", "is solar worth it"],
    inputs: [
      { id: "systemKw", label: "System size", kind: "number", unit: "kW", defaultValue: 6, min: 0.5, step: 0.5 },
      { id: "psh", label: "Peak sun hours (average day)", kind: "number", unit: "h", defaultValue: 4.5, min: 1, step: 0.1 },
      { id: "derate", label: "System derate", kind: "number", unit: "0-1", defaultValue: 0.8, min: 0.4, max: 1, step: 0.05 },
      { id: "selfConsumption", label: "Self-consumed share", kind: "number", unit: "0-1", defaultValue: 0.6, min: 0, max: 1, step: 0.05, help: "Share of production you use directly (displaces retail rate). Rest is exported." },
      { id: "rate", label: "Retail electricity rate", kind: "number", unit: "$/kWh", defaultValue: 0.18, min: 0, step: 0.01 },
      { id: "exportRate", label: "Export/feed-in rate", kind: "number", unit: "$/kWh", defaultValue: 0.05, min: 0, step: 0.01, optional: true },
      { id: "costPerWatt", label: "Installed cost", kind: "number", unit: "$/W", defaultValue: 2.5, min: 0.5, step: 0.1 },
    ],
    calc: solarSavings,
    formula: ["kWh/yr = kW × PSH × 365 × derate", "Savings = self kWh × retail + export kWh × export rate", "Payback = cost ÷ annual savings"],
    variables: [
      { symbol: "PSH", meaning: "Peak sun hours", unit: "h/day" },
      { symbol: "η", meaning: "System derate factor", unit: "—" },
      { symbol: "SP", meaning: "Simple payback", unit: "years" },
    ],
    howItWorks: [
      "Annual production comes from size × sun × derate — the same model as the panel output calculator.",
      "Self-consumed energy displaces retail purchases (the valuable part); exports earn the feed-in rate.",
      "Payback divides installed cost by annual savings; the 25-year figure extrapolates undiscounted.",
    ],
    example:
      "A 6 kW system at 4.5 PSH, 0.8 derate: 7,889 kWh/yr. At 60% self-consumption ($0.18) and 40% export ($0.05): savings = 4,733 × 0.18 + 3,156 × 0.05 = $1,010/yr. At $2.50/W ($15,000): 14.9-year payback — or ~9 years with a 30% incentive.",
    interpretation:
      "Self-consumption is the economic lever: every kWh you use yourself is worth the full retail rate; exports often earn 20–30% of that. Battery storage shifts export to self-consumption but adds capital. The payback figure ignores rate inflation (real-world paybacks shrink as rates rise), degradation (~0.5%/yr) and inverter replacement (~year 12).",
    assumptions: [
      "Fixed rates; no escalation or degradation applied.",
      "No incentives, rebates or tax credits included — subtract them from installed cost for real payback.",
    ],
    limitations: [
      "Net-metering policy changes are the biggest real-world risk to export economics.",
      "Roof age, orientation and shading shift production; use site-specific PSH.",
    ],
    faqs: [
      {
        q: "What is a good solar payback period?",
        a: "6–10 years is excellent and typical where rates are high and incentives exist; 12–15 years is marginal but still positive over a 25+ year system life.",
      },
      {
        q: "Do solar panels increase home value?",
        a: "Studies (e.g. Zillow/LBNL) find owned (not leased) systems add roughly the discounted value of remaining savings — typically $10–20k for a standard residential system in the US.",
      },
    ],
    references: [
      { label: "NREL — solar photovoltaic system cost benchmark", url: "https://www.nrel.gov/solar/market-research-analysis/solar-installed-system-cost" },
      { label: "LBNL — Selling Into the Sun (PV home value)", url: "https://emp.lbl.gov/publications/selling-sun-price-premium-analysis" },
    ],
    related: ["solar-panel-output-calculator", "panel-count-calculator", "solar-tilt-calculator", "energy-cost-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "solar-tilt-calculator",
    category: "solar-energy",
    name: "Solar Panel Tilt Calculator",
    title: "Solar Panel Tilt Calculator — Optimal Angle by Latitude | IngCalc",
    description:
      "Find the optimal solar panel tilt for your latitude: annual optimum, winter and summer settings, with azimuth guidance for each hemisphere.",
    summary:
      "Enter your latitude to get the optimal tilt for year-round, winter-biased or summer-biased mounting, with the correct azimuth direction.",
    keywords: ["solar panel tilt calculator", "optimal solar angle", "solar panel angle by zip", "pv tilt latitude"],
    inputs: [
      { id: "latitude", label: "Site latitude", kind: "number", unit: "°", defaultValue: 40, min: -66, max: 66, step: 0.5, help: "Positive = northern hemisphere, negative = southern." },
      {
        id: "season", label: "Optimization target", kind: "select",
        options: [
          { value: "year", label: "Year-round (tilt = latitude)" },
          { value: "winter", label: "Winter-biased (latitude + 15°)" },
          { value: "summer", label: "Summer-biased (latitude − 15°)" },
        ],
        defaultOption: "year",
      },
    ],
    calc: solarTilt,
    formula: ["Tilt_annual ≈ |latitude|", "Tilt_winter ≈ |latitude| + 15°", "Tilt_summer ≈ |latitude| − 15°"],
    variables: [
      { symbol: "φ", meaning: "Site latitude", unit: "°" },
      { symbol: "β", meaning: "Panel tilt from horizontal", unit: "°" },
      { symbol: "γ", meaning: "Azimuth (0° = north, 180° = south)", unit: "°" },
    ],
    howItWorks: [
      "The annual optimum roughly equals latitude — the panel normal then bisects the sun's seasonal arc.",
      "Winter optimization tilts steeper (low winter sun); summer optimization flatter (high sun).",
      "Azimuth: due south in the northern hemisphere, due north in the southern.",
    ],
    example:
      "Latitude 40°N: annual optimum 40°, winter 55°, summer 25°, all facing due south (180°). A flat-roof commercial install would likely use 10–15° ballasted racks regardless, trading ~5–8% yield for wind-load simplicity.",
    interpretation:
      "Tilt matters less than people expect: within ±10° of optimum, annual yield changes only 1–3%. Orientation (azimuth) and shading matter far more. Steeper tilts shed snow and self-clean better with rain; flatter tilts integrate with roofs and reduce wind loading. Adjustable racks gain a few percent by tracking seasons.",
    assumptions: [
      "Clear-sky geometry; local cloud patterns can shift the optimum a few degrees.",
      "Fixed-tilt mounting (not tracking).",
    ],
    limitations: [
      "Rooftop constraints usually dictate tilt — the optimum is academic when the rack follows the roof plane.",
      "Single-axis trackers follow a different optimization entirely.",
    ],
    faqs: [
      {
        q: "What angle should solar panels be?",
        a: "Your latitude is the year-round optimum. Practical rooftop installs usually follow the roof pitch; the yield loss under 10° off-optimum is small.",
      },
      {
        q: "Should I adjust panel angle seasonally?",
        a: "If it's easy (ground mount): +15° in winter, −15° in summer gains ~5–8% annually. On a roof, the access risk and labor usually aren't worth it.",
      },
    ],
    references: [
      { label: "NREL — solar resource and tilt optimization data", url: "https://www.nrel.gov/gis/solar.html" },
      { label: "Global Solar Atlas — location-specific yield", url: "https://globalsolaratlas.info/" },
    ],
    related: ["solar-panel-output-calculator", "solar-savings-calculator", "panel-count-calculator", "string-sizing-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "panel-count-calculator",
    category: "solar-energy",
    name: "Solar Panel Count Calculator",
    title: "How Many Solar Panels Calculator — For a kWh Target | IngCalc",
    description:
      "Calculate how many solar panels you need for a target daily or monthly energy target, with roof-space estimate and array size.",
    summary:
      "Enter your energy target and local sun hours to get the required array Wp, the number of panels and the rough roof area needed.",
    keywords: ["how many solar panels calculator", "solar panel count", "solar array size calculator", "panels for kwh"],
    inputs: [
      { id: "targetKwh", label: "Daily energy target", kind: "number", unit: "kWh", defaultValue: 10, min: 0.1, step: 0.5 },
      { id: "panelW", label: "Panel wattage", kind: "number", unit: "W", defaultValue: 400, min: 50, max: 800, step: 10 },
      { id: "psh", label: "Peak sun hours (worst month)", kind: "number", unit: "h", defaultValue: 3.5, min: 0.5, step: 0.1, help: "Use the worst month for year-round reliability." },
      { id: "derate", label: "System derate", kind: "number", unit: "0-1", defaultValue: 0.8, min: 0.4, max: 1, step: 0.05 },
    ],
    calc: panelCount,
    formula: ["Wp = daily kWh × 1000 ÷ (PSH × derate)", "Panels = Wp ÷ panel W, rounded up"],
    variables: [
      { symbol: "Wp", meaning: "Required array peak wattage", unit: "W" },
      { symbol: "PSH", meaning: "Peak sun hours", unit: "h/day" },
    ],
    howItWorks: [
      "The target energy divided by (sun hours × derate) gives the array wattage that produces it on an average day.",
      "Panels round up to whole units; the installed size and monthly output follow.",
    ],
    example:
      "10 kWh/day target, 400 W panels, 3.5 PSH worst month, 0.8 derate: Wp = 10,000/(3.5 × 0.8) = 3,571 W → 9 panels = 3.6 kW. Monthly average: ~3.6 × 3.5 × 30.4 × 0.8 = 307 kWh/month.",
    interpretation:
      "Use the worst-month PSH if the target is a hard requirement year-round; use the annual average if some seasonal variation is acceptable (grid-tied homes usually accept it). Roof space at ~6 m² per 400 W panel means 9 panels need ~54 m² (580 ft²) of usable roof — check shading and structural capacity next.",
    assumptions: [
      "Uniform panel orientation and no significant shading.",
      "Panel wattage at STC with the derate applied afterwards.",
    ],
    limitations: [
      "Does not account for inverter clipping when DC/AC ratio exceeds ~1.2.",
      "Roof area estimate excludes access walkways and setbacks required by code.",
    ],
    faqs: [
      {
        q: "How many solar panels for 30 kWh per day?",
        a: "At 4 PSH and 0.8 derate: 30,000/(4 × 0.8) = 9,375 W ≈ 24 panels of 400 W. Roughly 6 m² each, so ~145 m² of roof.",
      },
      {
        q: "Should I use worst-month sun hours?",
        a: "For off-grid or hard energy requirements, yes. Grid-tied systems that can draw from the grid can size to the annual average and accept winter shortfalls.",
      },
    ],
    references: [
      { label: "NREL PVWatts — production estimation methodology", url: "https://pvwatts.nrel.gov/" },
    ],
    related: ["solar-panel-output-calculator", "solar-savings-calculator", "off-grid-system-calculator", "battery-bank-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
];
