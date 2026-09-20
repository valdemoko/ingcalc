import type { ToolDefinition } from "@/lib/types";
import {
  dewPoint,
  ductVelocity,
  coolingCost,
  heatIndex,
  windChill,
  degreeDayEnergy,
  sensibleHeat,
  fanLaws,
} from "@/lib/engines/hvac2";

export const HVAC2_TOOLS: ToolDefinition[] = [
  {
    slug: "dew-point-calculator",
    category: "hvac",
    name: "Dew Point Calculator",
    title: "Dew Point Calculator — Comfort & Condensation | IngCalc",
    description:
      "Calculate dew point and approximate wet-bulb from temperature and humidity, with comfort interpretation. Magnus formula, °C and °F.",
    summary:
      "Enter air temperature and relative humidity to get dew point, wet bulb and a straight comfort read — dew point, not RH, is the real comfort metric.",
    keywords: ["dew point calculator", "wet bulb calculator", "humidity comfort", "condensation point"],
    inputs: [
      { id: "temp", label: "Air temperature", kind: "number", defaultValue: 25, min: -40, max: 60, step: 0.5,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C" },
      { id: "rh", label: "Relative humidity", kind: "number", unit: "%", defaultValue: 60, min: 1, max: 100, step: 1 },
    ],
    calc: dewPoint,
    formula: ["γ = ln(RH/100) + a·T/(b+T)", "Td = b·γ / (a − γ)   (Magnus-Tetens, a=17.62, b=243.12)"],
    variables: [
      { symbol: "Td", meaning: "Dew point temperature", unit: "°C" },
      { symbol: "T", meaning: "Air temperature", unit: "°C" },
      { symbol: "RH", meaning: "Relative humidity", unit: "%" },
    ],
    howItWorks: [
      "The Magnus-Tetens formula inverts the vapor-pressure relation: dew point is where the current moisture content becomes saturated.",
      "The wet-bulb approximation (Stull) gives the temperature of evaporative cooling — the physical limit of swamp coolers and the metric for heat stress.",
      "Comfort bands come from empirical dew-point comfort research, not the humidity percentage.",
    ],
    example:
      "28 °C at 65% RH: dew point 21.0 °C (70 °F) — 'oppressive'. The same 65% RH at 18 °C gives dew point 11.4 °C, perfectly comfortable. Same RH, completely different feel.",
    interpretation:
      "Dew point is the amount of moisture in the air, expressed as a temperature — it doesn't change with air temperature the way RH does. Air conditioning works largely by cooling air below its dew point and wringing water out. Surfaces (cold pipes, single-pane windows) at or below dew point will condense water — that's the number for mold prevention.",
    assumptions: [
      "Standard atmospheric pressure near sea level; the Magnus approximation shifts slightly at altitude.",
      "Ranges: −40 to 50 °C input, ±0.35 °C accuracy.",
    ],
    limitations: [
      "Does not replace full psychrometric charts when precise enthalpy or humidity ratio is needed.",
      "Wet bulb is an approximation (Stull), accurate within ~1 °C for normal conditions.",
    ],
    faqs: [
      {
        q: "What dew point is uncomfortable?",
        a: "Above 60 °F (15.5 °C) feels muggy to most people; above 70 °F (21 °C) is oppressive. Below 55 °F (13 °C) feels crisp and dry.",
      },
      {
        q: "Why does dew point matter more than humidity %?",
        a: "RH changes with temperature even when moisture content is constant — 50% RH at 30 °C is far more humid air than 50% RH at 15 °C. Dew point measures the actual water content.",
      },
    ],
    references: [
      { label: "Lawrence, M.G. (2005) — the relationship between RH and dew point", url: "https://journals.ametsoc.org/view/journals/bams/86/2/bams-86-2-225.xml" },
      { label: "Stull, R. (2011) — wet-bulb temperature approximation", url: "https://journals.ametsoc.org/view/journals/apme/50/7/jamc-d-11-0143.1.xml" },
    ],
    related: ["heat-index-calculator", "wind-chill-calculator", "btu-calculator", "sensible-heat-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "duct-velocity-calculator",
    category: "hvac",
    name: "Duct Velocity Calculator",
    title: "Duct Velocity Calculator — FPM from CFM & Size | IngCalc",
    description:
      "Check air velocity in a known duct: enter CFM and diameter to get fpm, m/s, duct area and the estimated friction rate. Includes noise guidance.",
    summary:
      "Enter airflow and duct diameter to get velocity and friction rate — the companion check to the duct sizing calculator for existing systems.",
    keywords: ["duct velocity calculator", "fpm calculator", "duct air speed", "hvac velocity check"],
    inputs: [
      { id: "cfm", label: "Airflow", kind: "number", unit: "CFM", defaultValue: 400, min: 10, step: 10 },
      { id: "diameter", label: "Duct diameter", kind: "number", unit: "in", defaultValue: 8, min: 3, max: 60, step: 1 },
    ],
    calc: ductVelocity,
    formula: ["V = Q / A", "A = π·D²/4 (converted to ft²)"],
    variables: [
      { symbol: "V", meaning: "Air velocity", unit: "fpm" },
      { symbol: "Q", meaning: "Airflow", unit: "CFM" },
      { symbol: "A", meaning: "Duct cross-sectional area", unit: "ft²" },
    ],
    howItWorks: [
      "Velocity is airflow divided by duct area — an 8-inch round duct is 0.349 ft², so 400 CFM runs at 1,146 fpm.",
      "The tool inverts the equal-friction fit to estimate what friction rate this velocity implies.",
      "The interpretation flags whether the velocity suits branches or trunks.",
    ],
    example:
      "400 CFM in a 10-inch duct: area = 0.545 ft², velocity = 734 fpm — good trunk velocity. Squeeze it into 8 inches and it jumps to 1,146 fpm: noisy and lossy; that's why the sizing calculator picked 8 in only at lower friction targets.",
    interpretation:
      "Velocity is the noise and energy dial of duct design: every extra 100 fpm adds perceptible noise and squared friction loss. Residential targets: 600 fpm branches, 700–900 fpm trunks, 1000 fpm ceiling. Commercial systems run faster with acoustic treatment. Return-side grilles should stay near 500 fpm at the face.",
    assumptions: [
      "Round duct with uniform flow — flex duct and fittings alter the effective velocity.",
      "Standard air density.",
    ],
    limitations: [
      "Rectangular ducts need equivalent diameter conversion first.",
      "Entry/exit loss coefficients (fittings) dominate total pressure and aren't captured.",
    ],
    faqs: [
      {
        q: "What is a good duct velocity?",
        a: "600 fpm in branches, 700–900 fpm in supply trunks, and under 1000 fpm anywhere in a house. Above that, noise complaints are near-certain.",
      },
      {
        q: "How do I convert rectangular to round velocity?",
        a: "Compute the rectangular duct's area (W × H ÷ 144 ft²) and divide CFM by it — velocity follows from area, not shape.",
      },
    ],
    references: [
      { label: "ACCA Manual D — Residential Duct Systems", url: "https://www.acca.org/standards/technical-manuals" },
    ],
    related: ["duct-size-calculator", "airflow-cfm-calculator", "fan-laws-calculator", "sensible-heat-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "cooling-cost-calculator",
    category: "hvac",
    name: "AC Running Cost Calculator",
    title: "AC Running Cost Calculator — SEER to Dollars | IngCalc",
    description:
      "Calculate air conditioning running cost from tonnage, SEER, runtime and electricity rate. Monthly and seasonal figures for upgrade comparisons.",
    summary:
      "Enter your AC size in tons, its SEER and your runtime to get monthly and seasonal cost — the numbers that decide whether a SEER upgrade pays.",
    keywords: ["ac running cost calculator", "air conditioner cost", "seer savings calculator", "cooling electricity cost"],
    inputs: [
      { id: "tons", label: "AC size", kind: "number", unit: "tons", defaultValue: 3, min: 0.5, max: 20, step: 0.5 },
      { id: "seer", label: "SEER rating", kind: "number", unit: "BTU/h·W", defaultValue: 14, min: 8, max: 30, step: 0.5 },
      { id: "hoursDay", label: "Hours running per day", kind: "number", unit: "h", defaultValue: 8, min: 0, max: 24, step: 0.5 },
      { id: "daysMonth", label: "Days per month", kind: "number", unit: "days", defaultValue: 30, min: 1, max: 31, step: 1 },
      { id: "rate", label: "Electricity rate", kind: "number", unit: "$/kWh", defaultValue: 0.15, min: 0, step: 0.01 },
    ],
    calc: coolingCost,
    formula: ["kW = tons × 12 / SEER", "Cost = kW × hours × days × rate"],
    variables: [
      { symbol: "kW", meaning: "Average electrical draw", unit: "kW" },
      { symbol: "SEER", meaning: "Seasonal efficiency", unit: "BTU/h per W" },
      { symbol: "rate", meaning: "Electricity price", unit: "$/kWh" },
    ],
    howItWorks: [
      "Tons convert to BTU/h (×12,000) and divide by SEER to get average watts drawn at rating conditions.",
      "Multiply by daily runtime and days for monthly kWh, then by rate for cost.",
      "The seasonal figure (6 months) supports upgrade payback comparisons.",
    ],
    example:
      "A 3-ton, 14-SEER unit running 8 h/day: 3 × 12/14 = 2.57 kW → 617 kWh/month → $92/month at $0.15. The same comfort on an 18-SEER unit: 2.0 kW → $72/month. A $20/month difference over a 6-month season is $120/year — a marginal upgrade unless prices or runtime are higher.",
    interpretation:
      "The SEER-to-dollars link shows when efficiency upgrades pay: hot climates with long seasons and high rates make 18+ SEER worthwhile; mild climates rarely justify beyond 16. Runtime matters more than SEER in the equation — shading windows and raising the setpoint 2 °F saves more than a SEER point.",
    assumptions: [
      "Rating-point average draw; real draw varies with outdoor temperature and cycling.",
      "Steady electricity rate.",
    ],
    limitations: [
      "SEER is a seasonal average — actual efficiency at 100 °F is lower (EER).",
      "Duct losses (often 20–30%) are not included — they multiply everything.",
    ],
    faqs: [
      {
        q: "How much does it cost to run AC per hour?",
        a: "A 3-ton 16-SEER unit draws about 2.25 kW → $0.34/hour at $0.15/kWh. Older 10-SEER units of the same size: $0.54/hour.",
      },
      {
        q: "Is a higher SEER worth it?",
        a: "Multiply the kWh difference by your rate and runtime. In hot climates with $0.20+/kWh, yes; in mild climates the 14–16 SEER range is usually the economic ceiling.",
      },
    ],
    references: [
      { label: "DOE — central air conditioner efficiency standards", url: "https://www.energy.gov/eere/buildings/appliance-and-equipment-standards-program" },
    ],
    sections: [
      {
        title: "The input that moves the result most: your actual kWh price",
        paragraphs: [
          "Every cost result scales linearly with the rate you enter, and rates vary more between utilities than equipment efficiency varies between models. Taking the price from a recent bill — not a national average — is the difference between a useful estimate and a decorative number. Time-of-use tariffs add a second layer: running the AC during peak windows can cost 2–3× the off-peak rate, which is why pre-cooling before peak hours is a real strategy where those tariffs exist.",
        ],
      },
      {
        title: "SEER is an average, not a promise",
        bullets: [
          "SEER is measured over a whole cooling season, so a 16 SEER unit at milder part-load conditions can beat its rating while a 14 SEER unit in brutal conditions may match it.",
          "Replacing a 10 SEER unit with 16 SEER cuts cooling energy roughly 35–40% — but only if the new unit is correctly sized; oversizing erases much of the gain through cycling losses.",
          "Compare units at the same rating standard (SEER vs SEER2 differ by test procedure since 2023) — cross-standard comparisons overstate differences.",
        ],
      },
    ],
    related: ["seer-eer-converter", "energy-cost-calculator", "btu-calculator", "heating-load-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "heat-index-calculator",
    category: "hvac",
    name: "Heat Index Calculator",
    title: "Heat Index Calculator — Feels-Like Temperature (NWS) | IngCalc",
    description:
      "Calculate the heat index (feels-like temperature) from air temperature and humidity using the official NWS Rothfusz regression, with risk levels.",
    summary:
      "Enter temperature and humidity to get the heat index and its health risk band — the same formula behind US heat warnings.",
    keywords: ["heat index calculator", "feels like temperature", "heat stress calculator", "apparent temperature"],
    inputs: [
      { id: "temp", label: "Air temperature", kind: "number", defaultValue: 90, min: 60, max: 130, step: 1,
        unitOptions: [{ value: "F", label: "°F", factor: 1 }, { value: "C", label: "°C (×1.8)", factor: 1.8 }],
        defaultUnit: "F" },
      { id: "rh", label: "Relative humidity", kind: "number", unit: "%", defaultValue: 60, min: 2, max: 100, step: 1 },
    ],
    calc: heatIndex,
    formula: ["HI = −42.379 + 2.049T + 10.143H − 0.225TH − 0.0068T² − 0.0548H² + 0.0012T²H + 0.00085TH² − 0.000002T²H²"],
    variables: [
      { symbol: "HI", meaning: "Heat index", unit: "°F" },
      { symbol: "T", meaning: "Air temperature", unit: "°F" },
      { symbol: "H", meaning: "Relative humidity", unit: "%" },
    ],
    howItWorks: [
      "The Rothfusz regression models how humidity reduces sweat evaporation, raising the effective temperature on the body.",
      "Adjustments handle the dry-low-RH and humid-high-RH corners of the chart.",
      "Risk bands follow NWS/OSHA thresholds: caution at 80–90 °F, extreme caution 90–103, danger 103–125.",
    ],
    example:
      "92 °F at 65% RH: heat index ≈ 105 °F — 'danger' band. Workers need water/rest/shade cycles and the body cannot cool effectively through sweat alone.",
    interpretation:
      "Heat index is a health metric, not a comfort score: above 103 °F, heat exhaustion is likely with prolonged exposure and heat stroke becomes possible. It assumes shade and light wind — full sun adds up to 15 °F. Wet-bulb temperature is the stricter industrial metric for work/rest cycles.",
    assumptions: [
      "Shade, light wind, typical human clothing and activity.",
      "Valid from 80–112 °F and 13–85% RH (regression fitted range).",
    ],
    limitations: [
      "Direct sun can add up to 15 °F to the apparent temperature.",
      "Does not include wind (use wet-bulb globe temperature for outdoor work settings).",
    ],
    faqs: [
      {
        q: "What heat index is dangerous?",
        a: "103–125 °F is NWS 'danger': heat exhaustion likely. Above 125 °F is 'extreme danger' — heat stroke is imminent without cooling.",
      },
      {
        q: "Why does humidity make heat worse?",
        a: "Your body cools by evaporating sweat; humid air is already near saturation, so evaporation slows and the cooling effect collapses even though the air temperature is unchanged.",
      },
    ],
    references: [
      { label: "NWS Heat Index — Rothfusz regression documentation", url: "https://www.weather.gov/safety/heat-index" },
      { label: "Steadman, R.G. (1979) — the assessment of sultriness", url: "https://journals.ametsoc.org/view/journals/apme/18/7/1520-0450_1979_018_0861_taospi_2_0_co_2.xml" },
    ],
    related: ["dew-point-calculator", "wind-chill-calculator", "btu-calculator", "cooling-cost-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "wind-chill-calculator",
    category: "hvac",
    name: "Wind Chill Calculator",
    title: "Wind Chill Calculator — NWS Formula & Frostbite Time | IngCalc",
    description:
      "Calculate wind chill from temperature and wind speed using the official NWS formula, with frostbite time estimates for exposed skin.",
    summary:
      "Enter temperature and wind speed to get the wind chill and how quickly frostbite can develop — the official US weather service formula.",
    keywords: ["wind chill calculator", "feels like temperature winter", "frostbite time", "wind chill formula"],
    inputs: [
      { id: "temp", label: "Air temperature", kind: "number", defaultValue: 20, min: -60, max: 50, step: 1,
        unitOptions: [{ value: "F", label: "°F", factor: 1 }, { value: "C", label: "°C (×1.8)", factor: 1.8 }],
        defaultUnit: "F" },
      { id: "wind", label: "Wind speed", kind: "number", defaultValue: 15, min: 3, max: 100, step: 1,
        unitOptions: [{ value: "mph", label: "mph", factor: 1 }, { value: "kmh", label: "km/h (×0.6214)", factor: 0.6214 }],
        defaultUnit: "mph" },
    ],
    calc: windChill,
    formula: ["WC = 35.74 + 0.6215T − 35.75·V^0.16 + 0.4275·T·V^0.16"],
    variables: [
      { symbol: "WC", meaning: "Wind chill temperature", unit: "°F" },
      { symbol: "T", meaning: "Air temperature", unit: "°F" },
      { symbol: "V", meaning: "Wind speed", unit: "mph" },
    ],
    howItWorks: [
      "Wind strips the warm boundary layer of air next to skin, accelerating heat loss — the formula quantifies that as an equivalent still-air temperature.",
      "The 0.16 exponent comes from wind-tunnel testing on human subjects in the 2001 revision of the index.",
      "Frostbite bands estimate time to freezing of exposed tissue.",
    ],
    example:
      "10 °F with 20 mph wind: wind chill ≈ −9 °F — frostbite possible on exposed skin in about 30 minutes. The same 10 °F with 5 mph wind feels like 1 °F: wind speed dominates the risk.",
    interpretation:
      "Wind chill applies to living things only — your car engine, water pipes and heat pump cool to actual air temperature regardless of wind. The practical uses: dressing for wind chill, protecting workers outdoors, and estimating how fast exposed skin freezes. It does not change refrigeration or freezing physics.",
    assumptions: [
      "Standard human model: walking pace, winter clothing on torso, exposed face.",
      "Valid ≤ 50 °F and ≥ 3 mph.",
    ],
    limitations: [
      "Does not apply to objects or to water freezing.",
      "Sunlight can raise apparent temperature several degrees.",
    ],
    faqs: [
      {
        q: "At what wind chill does skin freeze?",
        a: "Around −18 °F wind chill, frostbite takes about 30 minutes on exposed skin; below −35 °F it can happen in under 10 minutes.",
      },
      {
        q: "Does wind chill affect pipes freezing?",
        a: "No. Water freezes at the actual air temperature; wind accelerates heat loss from the pipe but the threshold is 32 °F air, not wind chill.",
      },
    ],
    references: [
      { label: "NWS Wind Chill — formula and frostbite chart", url: "https://www.weather.gov/safety/cold-wind-chill-chart" },
    ],
    related: ["heat-index-calculator", "dew-point-calculator", "heating-load-calculator", "degree-day-energy-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "degree-day-energy-calculator",
    category: "hvac",
    name: "Degree-Day Heating Calculator",
    title: "Degree-Day Energy Calculator — Heating Fuel Estimate | IngCalc",
    description:
      "Estimate heating fuel use and cost from degree-days and house heat-loss coefficient. Supports gas, oil, propane and electric heating.",
    summary:
      "Enter heating degree-days, your home's UA (heat-loss coefficient) and fuel details to get seasonal fuel consumption and cost — the standard degree-day method.",
    keywords: ["degree day calculator", "heating energy estimate", "fuel consumption calculator", "hdd heating"],
    inputs: [
      { id: "hdd", label: "Heating degree-days (base 65°F)", kind: "number", unit: "°F·days", defaultValue: 4000, min: 0, step: 100, help: "Annual HDD for your location (NOAA publishes these)." },
      { id: "ua", label: "House heat-loss coefficient (UA)", kind: "number", unit: "BTU/h·°F", defaultValue: 500, min: 50, step: 10, help: "Load ÷ design ΔT from the heating-load calculator." },
      { id: "eff", label: "Heating system efficiency", kind: "number", unit: "0-1", defaultValue: 0.85, min: 0.3, max: 1, step: 0.01, help: "AFUE for gas/oil; HSPF-based COP for heat pumps." },
      {
        id: "fuel", label: "Fuel type", kind: "select",
        options: [
          { value: "gas", label: "Natural gas (therms, 100 kBTU each)" },
          { value: "electric", label: "Electric (kWh, 3.412 kBTU each)" },
          { value: "oil", label: "Heating oil (gal, 138.5 kBTU each)" },
          { value: "propane", label: "Propane (gal, 91.3 kBTU each)" },
        ],
        defaultOption: "gas",
      },
      { id: "fuelCost", label: "Fuel price", kind: "number", unit: "$ per unit", defaultValue: 1.2, min: 0, step: 0.05 },
    ],
    calc: degreeDayEnergy,
    formula: ["Heat (BTU) = UA × HDD × 24", "Fuel = Heat ÷ (fuel content × efficiency)"],
    variables: [
      { symbol: "HDD", meaning: "Heating degree-days", unit: "°F·day" },
      { symbol: "UA", meaning: "Whole-house heat-loss coefficient", unit: "BTU/h·°F" },
      { symbol: "η", meaning: "System efficiency", unit: "—" },
    ],
    howItWorks: [
      "Each degree-day represents one day averaging 1 °F below 65 °F; total heat needed is UA × HDD × 24 hours.",
      "Fuel consumption divides heat by the fuel's energy content and the system's efficiency.",
      "Fuel contents: gas 100,000 BTU/therm, oil 138,500 BTU/gal, propane 91,300 BTU/gal, electric 3,412 BTU/kWh.",
    ],
    example:
      "A house with UA = 500 BTU/h·°F in a 4,000 HDD climate, 85% gas furnace at $1.20/therm: heat = 500 × 4,000 × 24 = 48 MBTU; fuel = 48,000,000 ÷ (100,000 × 0.85) = 565 therms → $678/season.",
    interpretation:
      "The UA figure is the fingerprint of your envelope: halving it (insulation, air-sealing) halves the fuel bill at any HDD. The calculation also reveals payback comparisons — a heat pump with COP 3 divides the same heat requirement's cost by ~2.5 versus an 85% furnace, before fuel price differences.",
    assumptions: [
      "Linear heat loss with temperature (valid well below the balance point).",
      "HDD base 65 °F matches a 65–68 °F thermostat habit; colder habits should use HDD base 60.",
      "No internal or solar heat gains credited (they typically offset 10–20%).",
    ],
    limitations: [
      "Wind-driven infiltration varies more than the model assumes.",
      "Does not handle heat pumps' declining COP at low temperature — use their seasonal HSPF-based average.",
    ],
    faqs: [
      {
        q: "Where do I find degree-days for my location?",
        a: "NOAA and degree-days.net publish HDD by station and base temperature. Most US climates run 2,000 (mild coastal) to 7,000+ HDD (upper Midwest) per year.",
      },
      {
        q: "What is UA?",
        a: "The whole-house heat-loss coefficient: how many BTU/h your home loses per °F of indoor-outdoor difference. Estimate it as design heating load ÷ design ΔT.",
      },
    ],
    references: [
      { label: "NOAA Climate Data Online — degree-days", url: "https://www.ncdc.noaa.gov/cdo-web/" },
      { label: "Energy degree-days method — degree-days.net", url: "https://www.degreedays.net/introduction" },
    ],
    related: ["heating-load-calculator", "energy-cost-calculator", "dew-point-calculator", "wind-chill-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "sensible-heat-calculator",
    category: "hvac",
    name: "Sensible Heat & Airflow Calculator",
    title: "Sensible Heat Formula Calculator — 1.08 × CFM × ΔT | IngCalc",
    description:
      "Solve the sensible heat equation: find airflow from BTU/h and ΔT, or BTU delivered from known airflow. Metric equivalent included.",
    summary:
      "Work with the core air-side equation Q = 1.08 × CFM × ΔT: enter two values to get the third, with metric conversions and typical target airflows.",
    keywords: ["sensible heat formula", "cfm delta t calculator", "airflow btu calculator", "hvac airside equation"],
    inputs: [
      { id: "btuh", label: "Heat (Q)", kind: "number", unit: "BTU/h", defaultValue: 24000, min: 0, step: 1000, optional: true },
      { id: "cfm", label: "Airflow (CFM)", kind: "number", unit: "CFM", defaultValue: 800, min: 0, step: 50, optional: true },
      { id: "deltaT", label: "Temperature difference (ΔT)", kind: "number", unit: "°F", defaultValue: 20, min: 0, step: 0.5, optional: true, help: "Leave exactly one field blank to solve for it." },
    ],
    calc: sensibleHeat,
    formula: ["Q = 1.08 × CFM × ΔT", "Metric: Q(kW) = 1.2 × m³/s × ΔT(°C)"],
    variables: [
      { symbol: "Q", meaning: "Sensible heat transfer", unit: "BTU/h" },
      { symbol: "CFM", meaning: "Airflow", unit: "ft³/min" },
      { symbol: "ΔT", meaning: "Air temperature change", unit: "°F" },
    ],
    howItWorks: [
      "The 1.08 factor bundles air density (0.075 lb/ft³) and specific heat (0.24 BTU/lb·°F) with the 60 min/h conversion.",
      "Leave one field blank to solve for it: airflow needed, heat delivered, or the resulting ΔT.",
      "The tonnage equivalent connects the answer to equipment sizing.",
    ],
    example:
      "A 2-ton (24,000 BTU/h) system with a 20 °F design ΔT: CFM = 24,000 ÷ (1.08 × 20) = 1,111 CFM — 370 CFM/ton, right in the normal range. If the blower only delivers 800 CFM, the same heat gives ΔT = 27.8 °F: colder supply air, poorer mixing.",
    interpretation:
      "This equation is the air-side heartbeat of HVAC: given equipment capacity and airflow it fixes the supply-to-return temperature split. Low airflow (clogged filter, weak blower) shows up as high ΔT, frozen coils in cooling, and heat exchanger stress in heating. Designers use 350–450 CFM per ton for cooling.",
    assumptions: [
      "Standard air at sea level — high altitude needs a corrected factor (1.08 × density ratio).",
      "Sensible heat only; latent (moisture) heat needs a separate wet-coil calculation.",
    ],
    limitations: [
      "Wet-coil (cooling with dehumidification) conditions need the total heat formula including latent load.",
      "High-altitude installations must correct for air density.",
    ],
    faqs: [
      {
        q: "What CFM per ton should I have?",
        a: "350 CFM/ton in humid climates (better dehumidification), 400 in moderate, up to 450 in dry climates. Outside that range, check airflow and charge.",
      },
      {
        q: "Why is my ΔT too high?",
        a: "Usually low airflow — dirty filter, failing blower, or blocked returns. In heating, an over-fired furnace shows the same symptom.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals, psychrometrics of air conditioning", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["duct-velocity-calculator", "duct-size-calculator", "btu-calculator", "fan-laws-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "fan-laws-calculator",
    category: "hvac",
    name: "Fan Laws Calculator",
    title: "Fan Affinity Laws Calculator — RPM, Pressure & Power | IngCalc",
    description:
      "Apply the fan affinity laws: how airflow, static pressure and power change with fan speed. The cubic power law explains VFD energy savings.",
    summary:
      "Change a fan's RPM and see exactly what happens to airflow, pressure and power — the affinity laws that justify variable-speed drives.",
    keywords: ["fan laws calculator", "affinity laws", "fan rpm calculator", "vfd energy savings"],
    inputs: [
      { id: "cfm1", label: "Current airflow", kind: "number", unit: "CFM", defaultValue: 1000, min: 1, step: 10 },
      { id: "rpm1", label: "Current speed", kind: "number", unit: "RPM", defaultValue: 1200, min: 10, step: 10 },
      { id: "power1", label: "Current power", kind: "number", unit: "W", defaultValue: 500, min: 0, step: 10, optional: true },
      { id: "rpm2", label: "New speed", kind: "number", unit: "RPM", defaultValue: 900, min: 10, step: 10 },
    ],
    calc: fanLaws,
    formula: ["CFM₂ = CFM₁ × (RPM₂/RPM₁)", "P₂ = P₁ × (RPM₂/RPM₁)²", "W₂ = W₁ × (RPM₂/RPM₁)³"],
    variables: [
      { symbol: "n", meaning: "Rotational speed", unit: "RPM" },
      { symbol: "Q", meaning: "Airflow", unit: "CFM" },
      { symbol: "P", meaning: "Static pressure", unit: "in. w.c." },
      { symbol: "W", meaning: "Power", unit: "W" },
    ],
    howItWorks: [
      "Airflow scales linearly with speed — halve the RPM, halve the CFM.",
      "Pressure scales with the square: slower fans face proportionally less system resistance.",
      "Power scales with the cube — the famous cubic law that makes 20% slowdown save ~49% energy.",
    ],
    example:
      "Slowing a 1,200 RPM fan moving 1,000 CFM at 500 W down to 900 RPM: airflow 750 CFM, pressure ratio 0.56, power 211 W — a 58% energy cut for 25% less air. That's the VFD value proposition.",
    interpretation:
      "The cubic law means fan speed is the dominant energy lever: precise airflow control via VFD beats damper throttling massively. It also warns the other direction — a belt slipping slower than spec quietly saves energy but under-vents; and overspeeding a fan 20% above spec demands 73% more motor power.",
    assumptions: [
      "Same fan, same system, constant air density.",
      "Operating point stays on the fan's stable curve (no stall).",
    ],
    limitations: [
      "Static efficiency changes slightly at very low speeds.",
      "Does not apply across different fan sizes — scaling laws for size differ.",
    ],
    faqs: [
      {
        q: "Why does power scale with the cube?",
        a: "Power = flow × pressure. Flow doubles the mass moved; pressure rises with the square of velocity — multiply the effects and you get the cube.",
      },
      {
        q: "How much energy does a VFD save?",
        a: "If it lets you run 20% slower, roughly 49% of fan power — though motor and drive losses shave the real figure to 35–45%.",
      },
    ],
    references: [
      { label: "AMCA International — fan fundamentals and affinity laws", url: "https://www.amca.org/" },
    ],
    related: ["duct-velocity-calculator", "sensible-heat-calculator", "duct-size-calculator", "torque-power-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
];
