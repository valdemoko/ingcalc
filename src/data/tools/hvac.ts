import type { ToolDefinition } from "@/lib/types";
import { coolingLoad, heatingLoad, ductSize, airflowCfm, efficiencyConvert } from "@/lib/engines/hvac";

export const HVAC_TOOLS: ToolDefinition[] = [
  {
    slug: "btu-calculator",
    category: "hvac",
    name: "BTU Calculator",
    title: "BTU Calculator — AC Cooling Load & Room Size | IngCalc",
    description:
      "Estimate the cooling load in BTU/h for any room from floor area, climate, insulation, sun exposure, occupants and appliances. Includes tonnage and CFM guidance.",
    summary:
      "Estimate how many BTU/h your room needs for cooling, based on floor area with documented adjustments for climate, insulation, sun, people and appliances.",
    keywords: ["btu calculator", "air conditioner size calculator", "cooling load calculator", "btu per square foot", "ac tonnage calculator"],
    inputs: [
      {
        id: "area", label: "Room area", kind: "number", defaultValue: 300, min: 10, step: 10,
        unitOptions: [
          { value: "ft2", label: "ft²", factor: 1 },
          { value: "m2", label: "m²", factor: 10.7639 },
        ],
        defaultUnit: "ft2",
      },
      { id: "occupants", label: "People normally in the room", kind: "number", defaultValue: 2, min: 1, max: 50, step: 1 },
      { id: "kitchenWatts", label: "Appliance/equipment power", kind: "number", unit: "W", defaultValue: 0, min: 0, max: 10000, step: 50, help: "TVs, computers, kitchen equipment. 0 for a bedroom." },
      {
        id: "climate", label: "Climate", kind: "select",
        options: [
          { value: "cool", label: "Cool / mild summer" },
          { value: "moderate", label: "Moderate" },
          { value: "hot", label: "Hot / very humid" },
        ],
        defaultOption: "moderate",
      },
      {
        id: "insulation", label: "Insulation", kind: "select",
        options: [
          { value: "poor", label: "Poor (old, uninsulated)" },
          { value: "average", label: "Average" },
          { value: "good", label: "Good (modern code)" },
        ],
        defaultOption: "average",
      },
      {
        id: "sun", label: "Sun exposure", kind: "select",
        options: [
          { value: "shaded", label: "Shaded" },
          { value: "average", label: "Average" },
          { value: "heavy", label: "Very sunny / large windows" },
        ],
        defaultOption: "average",
      },
    ],
    calc: coolingLoad,
    formula: [
      "BTU/h = area × 25 × climate × insulation × sun + 600 × people + 3.412 × appliance W",
    ],
    variables: [
      { symbol: "area", meaning: "Floor area", unit: "ft²" },
      { symbol: "25", meaning: "Baseline cooling load per ft² (8 ft ceiling)", unit: "BTU/h·ft²" },
      { symbol: "600", meaning: "Heat gain per person", unit: "BTU/h" },
      { symbol: "3.412", meaning: "Watts to BTU/h conversion", unit: "BTU/h·W" },
    ],
    howItWorks: [
      "The baseline is 25 BTU/h per square foot — a widely used rule of thumb for rooms with standard 8 ft ceilings.",
      "Multipliers adjust for hot or cool climates, insulation quality and sun exposure, each ±10–15%.",
      "600 BTU/h is added per person (sensible + latent) and 3.412 BTU/h per watt of equipment, since all appliance power ends up as heat.",
    ],
    example:
      "A 300 ft² sunny bedroom with average insulation, moderate climate, 2 occupants and a 150 W TV: 300 × 25 = 7,500; sun ×1.1 → 8,250; + 2 × 600 = 9,450; + 150 × 3.412 = 9,962 BTU/h ≈ 0.8 tons. A 9,000–12,000 BTU/h (0.75–1 ton) mini-split is the right range.",
    interpretation:
      "Round up to the nearest standard equipment size, but do not grossly oversize: an oversized AC short-cycles, dehumidifies poorly and wears out faster. If the result sits between sizes, prefer the smaller one in humid climates. The CFM figure (~400 per ton) is the airflow the equipment should deliver.",
    assumptions: [
      "Standard 8 ft (2.4 m) ceilings — add ~10% per extra foot of ceiling height.",
      "Typical residential envelope; commercial spaces with glass curtain walls need real load calculations.",
      "The 25 BTU/h·ft² baseline assumes reasonably airtight construction.",
    ],
    limitations: [
      "A rule-of-thumb estimate — not a substitute for ACCA Manual J for equipment selection.",
      "Does not model duct losses, orientation per wall, window areas individually or internal latent loads like cooking.",
      "Kitchens with heavy cooking loads need dedicated ventilation sizing.",
    ],
    faqs: [
      {
        q: "How many BTU do I need per square foot?",
        a: "About 20–30 BTU/h per ft² for typical residential rooms — this calculator uses 25 as the baseline and adjusts from there. Hot climates, poor insulation and sunny rooms push it toward 30+.",
      },
      {
        q: "How many BTU is a ton of cooling?",
        a: "One ton of refrigeration = 12,000 BTU/h. A 2-ton system delivers 24,000 BTU/h.",
      },
      {
        q: "Is bigger better for AC?",
        a: "No. Oversized ACs cool the air quickly but shut off before dehumidifying it, leaving rooms cold-clammy. Slightly undersized runs longer, dehumidifies better and maintains steadier comfort.",
      },
    ],
    references: [
      { label: "ACCA Manual J — Residential Load Calculation", url: "https://www.acca.org/standards/technical-manuals" },
    ],
    sections: [
      {
        title: "Why oversizing is worse than undersizing",
        paragraphs: [
          "An oversized AC satisfies the thermostat before it has run long enough to dehumidify — the room reaches temperature while still feeling clammy, and the short cycling wears the compressor and increases demand peaks. A slightly undersized unit runs longer cycles: it dehumidifies properly, holds steadier comfort and typically outlives the oversized neighbor. That asymmetry is why professional sizing errs toward the smaller end when a result falls between two standard sizes, and why multiplying every margin conservatively in this calculator's inputs is the wrong instinct.",
        ],
      },
      {
        title: "When a rule of thumb is not enough",
        bullets: [
          "Rooms with large west- or south-facing glass, vaulted ceilings or kitchens need a room-by-room Manual J calculation — the screening model here averages what those loads separate.",
          "Ducted systems add duct losses the room estimate doesn't include; the duct sizing tool gives the airflow side of that problem.",
          "Mini-split indoor units come in fixed sizes (9k, 12k, 18k BTU/h); pick the nearest size below the result, not above.",
        ],
      },
    ],
    related: ["heating-load-calculator", "duct-size-calculator", "airflow-cfm-calculator", "seer-eer-converter"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "heating-load-calculator",
    category: "hvac",
    name: "Heating Load Calculator",
    title: "Heating Load Calculator — BTU/h & kW Sizing | IngCalc",
    description:
      "Estimate heating load in BTU/h and kW from floor area, design temperature difference and insulation quality. Includes ventilation adjustment guidance.",
    summary:
      "Size a heater from floor area, indoor-outdoor design temperature difference and envelope insulation quality, with the U-factor model documented.",
    keywords: ["heating load calculator", "furnace size calculator", "btu heating calculator", "heater sizing"],
    inputs: [
      {
        id: "area", label: "Floor area", kind: "number", defaultValue: 1000, min: 10, step: 10,
        unitOptions: [
          { value: "ft2", label: "ft²", factor: 1 },
          { value: "m2", label: "m²", factor: 10.7639 },
        ],
        defaultUnit: "ft2",
      },
      {
        id: "deltaT", label: "Design temperature difference", kind: "number", unit: "°F", defaultValue: 60, min: 10, step: 1,
        unitOptions: [
          { value: "F", label: "°F", factor: 1 },
          { value: "C", label: "°C (×1.8)", factor: 1.8 },
        ],
        defaultUnit: "F",
        help: "Indoor design temp minus outdoor design temp. E.g. 70 °F indoors, 10 °F design outdoor = 60 °F.",
      },
      {
        id: "insulation", label: "Insulation quality", kind: "select",
        options: [
          { value: "poor", label: "Poor (U ≈ 0.12)" },
          { value: "average", label: "Average (U ≈ 0.08)" },
          { value: "good", label: "Good (U ≈ 0.06)" },
        ],
        defaultOption: "average",
      },
    ],
    calc: heatingLoad,
    formula: ["Load = Area × U × ΔT", "U = overall envelope heat-transfer coefficient (BTU/h·ft²·°F)"],
    variables: [
      { symbol: "U", meaning: "Whole-envelope U factor", unit: "BTU/h·ft²·°F" },
      { symbol: "ΔT", meaning: "Design temperature difference", unit: "°F" },
      { symbol: "Area", meaning: "Conditioned floor area", unit: "ft²" },
    ],
    howItWorks: [
      "The envelope is reduced to a single U factor based on insulation quality: 0.06 (good), 0.08 (average), 0.12 (poor) BTU/h·ft²·°F.",
      "Load = area × U × design ΔT gives the heat needed to hold the indoor design temperature at the outdoor design temperature.",
      "The result is converted to kW for comparison with electric heaters and heat pump ratings.",
    ],
    example:
      "A 1,000 ft² house with average insulation in a climate with a 60 °F design ΔT: 1,000 × 0.08 × 60 = 4,800 BTU/h envelope loss. Adding ~10% for infiltration gives ≈ 5,300 BTU/h ≈ 1.6 kW — a small heat pump or 5–6 kW electric heater.",
    interpretation:
      "The result is the heat input needed at design conditions — the coldest reasonable weather, not the absolute record. Equipment should be sized near this figure; much larger furnaces short-cycle and cost more. Heat pumps should be checked against their capacity at the local design temperature, not their 47 °F rating.",
    assumptions: [
      "Whole-envelope U factor lumping walls, roof, floor and glazing into one coefficient.",
      "Design conditions per local climate data, not extreme records.",
    ],
    limitations: [
      "No infiltration/ventilation included — add roughly 10% for typical airtightness, more for fireplaces or leaky older homes.",
      "Not valid for passive-solar or high-performance envelopes with U below 0.04.",
      "Use Manual J for final equipment selection.",
    ],
    faqs: [
      {
        q: "How do I find my design temperature difference?",
        a: "Take your indoor design temperature (typically 68–70 °F / 20 °C) and subtract the 99th-percentile winter design temperature for your location, published by ASHRAE or your national weather service.",
      },
      {
        q: "Should I oversize my furnace?",
        a: "No — size to the calculated load with a small margin. Oversized furnaces short-cycle, waste energy and create uneven temperatures.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals (load estimation)", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["btu-calculator", "airflow-cfm-calculator", "duct-size-calculator", "seer-eer-converter"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "duct-size-calculator",
    category: "hvac",
    name: "Duct Size Calculator",
    title: "Duct Size Calculator — Round Duct by Airflow & Friction | IngCalc",
    description:
      "Size round HVAC ducts from airflow (CFM) and friction rate using the ASHRAE equal-friction method. Gives exact diameter, nominal size, velocity and metric equivalent.",
    summary:
      "Enter airflow and your design friction rate to get the round duct diameter, the next nominal size up, and the resulting air velocity — with the ASHRAE equation documented.",
    keywords: ["duct size calculator", "duct diameter calculator", "hvac duct sizing", "round duct cfm chart", "equal friction duct"],
    inputs: [
      { id: "cfm", label: "Airflow", kind: "number", unit: "CFM", defaultValue: 400, min: 10, step: 10 },
      {
        id: "friction", label: "Friction rate", kind: "number", unit: "in. w.c./100 ft", defaultValue: 0.08, min: 0.02, max: 0.5, step: 0.01,
        help: "Residential systems typically 0.06–0.10. Lower = quieter, larger ducts.",
      },
    ],
    calc: ductSize,
    formula: ["Q = 0.455 · A · D^0.61 · ΔP^0.5", "solved for D (galvanized round duct, standard air)"],
    variables: [
      { symbol: "Q", meaning: "Airflow", unit: "CFM" },
      { symbol: "A", meaning: "Duct cross-section area", unit: "ft²" },
      { symbol: "D", meaning: "Duct diameter", unit: "in" },
      { symbol: "ΔP", meaning: "Friction rate", unit: "in. w.c. per 100 ft" },
    ],
    howItWorks: [
      "The tool solves the ASHRAE equal-friction chart equation for diameter by iteration — the same equation behind the classic ductulator.",
      "It reports the exact diameter and snaps it up to the next standard nominal size (4, 5, 6, 7, 8... inches).",
      "Air velocity is checked because noise and pressure drop rise sharply above ~1000 fpm in residential systems.",
    ],
    example:
      "A 400 CFM branch at 0.08 in. w.c./100 ft: exact diameter ≈ 8.0 in, so an 8 in round duct. Velocity comes out around 720 fpm — comfortable. The same 400 CFM in a 6 in duct would run over 1,200 fpm, noisy and lossy.",
    interpretation:
      "The nominal size is what you install. If velocity exceeds about 900–1000 fpm in occupied spaces, go one size up — noise complaints are common above that. Trunk ducts are usually designed at the same friction rate so the whole system balances; each branch takes its CFM share.",
    assumptions: [
      "Round galvanized steel duct, standard air density, clean interior.",
      "Equal-friction design method with a constant friction rate.",
    ],
    limitations: [
      "Flexible duct has 2–4× the resistance of smooth metal — upsize significantly or avoid long flex runs.",
      "Rectangular ducts need equivalent-diameter conversion; this tool sizes round only.",
      "Fittings (elbows, takeoffs) dominate real system pressure loss and are not counted here.",
    ],
    faqs: [
      {
        q: "What friction rate should I use?",
        a: "0.08 in. w.c./100 ft is the common residential default. Use 0.06 for quiet systems or long runs, and higher only for short industrial runs where noise doesn't matter.",
      },
      {
        q: "Does this work for flex duct?",
        a: "Not directly. Fully stretched smooth flex is close, but typical compressed flex can double the friction. Size flex one or two nominal sizes larger than the metal equivalent.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals, Duct Design (equal friction method)", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
      { label: "ACCA Manual D — Residential Duct Systems", url: "https://www.acca.org/standards/technical-manuals" },
    ],
    related: ["btu-calculator", "airflow-cfm-calculator", "heating-load-calculator", "seer-eer-converter"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "airflow-cfm-calculator",
    category: "hvac",
    name: "Airflow / ACH Calculator",
    title: "CFM & Air Changes per Hour Calculator | IngCalc",
    description:
      "Convert between airflow (CFM, L/s, m³/h) and air changes per hour for any room volume. Includes typical ACH targets for bedrooms, bathrooms and kitchens.",
    summary:
      "Enter room volume and target air changes per hour to get the required airflow in CFM, L/s and m³/h — or verify the ACH an existing fan delivers.",
    keywords: ["cfm calculator", "air changes per hour calculator", "ach calculator", "exhaust fan sizing", "ventilation cfm"],
    inputs: [
      {
        id: "volume", label: "Room volume", kind: "number", defaultValue: 1000, min: 10, step: 10,
        unitOptions: [
          { value: "ft3", label: "ft³", factor: 1 },
          { value: "m3", label: "m³", factor: 35.3147 },
        ],
        defaultUnit: "ft3",
        help: "Floor area × ceiling height.",
      },
      { id: "ach", label: "Air changes per hour", kind: "number", unit: "ACH", defaultValue: 6, min: 0, step: 0.5 },
    ],
    calc: airflowCfm,
    formula: ["CFM = (Volume × ACH) / 60", "1 CFM ≈ 0.472 L/s ≈ 1.699 m³/h"],
    variables: [
      { symbol: "CFM", meaning: "Airflow", unit: "ft³/min" },
      { symbol: "Volume", meaning: "Room volume", unit: "ft³" },
      { symbol: "ACH", meaning: "Air changes per hour", unit: "1/h" },
    ],
    howItWorks: [
      "One air change replaces the full room volume once; per minute that is volume/60, multiplied by the ACH target.",
      "The result is shown in CFM, litres per second and cubic metres per hour for international fans.",
    ],
    example:
      "A 10 × 12 ft bathroom with 8 ft ceilings = 960 ft³. At 8 ACH: 960 × 8 / 60 = 128 CFM. The next standard fan size is 130 CFM — or run a 100 CFM fan slightly longer after showers.",
    interpretation:
      "The ACH target depends on the room's job: bathrooms and kitchens need high rates to remove moisture and odors quickly; bedrooms need moderate rates for air quality; whole-house ventilation runs at a low continuous rate. Exceeding the target wastes heating and cooling energy, so pick the target for the room type, not the maximum.",
    assumptions: [
      "Well-mixed room air — real rooms stratify, and effective ventilation is lower than the theoretical value.",
      "Fan rating at typical static pressure; real flow drops with ducting resistance.",
    ],
    limitations: [
      "Does not account for duct losses, backdraft dampers or filter loading.",
      "Codes (IMC/ASHRAE 62.2) may specify airflow directly rather than ACH — check local requirements.",
    ],
    faqs: [
      {
        q: "How many CFM do I need for a bathroom?",
        a: "The common rule is 1 CFM per ft² of floor area, which for a standard bathroom equals about 8 ACH. A 10 × 10 bathroom needs ~100 CFM.",
      },
      {
        q: "What ACH should a bedroom have?",
        a: "5–6 ACH with the door closed is a common target for air quality; whole-house continuous ventilation is much lower, around 0.35 ACH.",
      },
    ],
    references: [
      { label: "ASHRAE Standard 62.2 — Residential Ventilation", url: "https://www.ashrae.org/technical-resources/standards-and-guidelines" },
    ],
    related: ["btu-calculator", "duct-size-calculator", "heating-load-calculator", "seer-eer-converter"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "seer-eer-converter",
    category: "hvac",
    name: "SEER / EER / COP Converter",
    title: "SEER to EER, COP & kW per Ton Converter | IngCalc",
    description:
      "Convert SEER to EER, COP and kW per ton of cooling. Understand what efficiency ratings mean for real electricity costs and how the ratings differ.",
    summary:
      "Enter a SEER rating to see the equivalent EER, COP, kW per ton and tons per kW — with an explanation of what each rating actually measures.",
    keywords: ["seer to eer", "seer calculator", "cop calculator", "kw per ton", "hvac efficiency conversion"],
    inputs: [
      { id: "seer", label: "SEER rating", kind: "number", unit: "BTU/h·W", defaultValue: 16, min: 5, max: 45, step: 0.5 },
    ],
    calc: efficiencyConvert,
    formula: ["EER ≈ SEER × 0.875", "COP = EER / 3.412", "kW/ton = 12 / SEER"],
    variables: [
      { symbol: "SEER", meaning: "Seasonal Energy Efficiency Ratio", unit: "BTU/h per W" },
      { symbol: "EER", meaning: "Energy Efficiency Ratio (95 °F rating point)", unit: "BTU/h per W" },
      { symbol: "COP", meaning: "Coefficient of Performance", unit: "W/W" },
    ],
    howItWorks: [
      "SEER averages efficiency over a seasonal temperature range; EER is a single rating point at 95 °F outdoors.",
      "The DOE-style approximation EER ≈ SEER × 0.875 converts between them.",
      "COP is the dimensionless ratio (EER / 3.412), and kW/ton is the traditional HVAC industry metric (12 / SEER).",
    ],
    example:
      "A 16 SEER heat pump: EER ≈ 14.0, COP ≈ 4.1, and 0.75 kW per ton. In cooling season, each kW of electricity moves about 4.1 kW of heat — a 400% efficient 'heater' in reverse.",
    interpretation:
      "Higher SEER means less electricity per BTU of cooling, but the savings diminish: going from 14 to 16 SEER saves ~12%, from 16 to 18 another ~11%. Whether the premium pays back depends on run hours and electricity price. COP is the universal metric — heat pumps and chillers worldwide are compared with it.",
    assumptions: [
      "The 0.875 SEER→EER factor is a rule of thumb; actual EER depends on the specific unit.",
      "Ratings apply at standard test conditions, not necessarily your climate.",
    ],
    limitations: [
      "Does not apply to gas furnaces (AFUE) or geothermal ratings (COP at different conditions).",
      "Real-world savings depend on climate, duct losses and thermostat habits.",
    ],
    faqs: [
      {
        q: "What SEER should I buy?",
        a: "In hot climates with long cooling seasons, 16–18 SEER usually pays back; in mild climates the jump from 14 to 16 is often the sweet spot. Compare the electricity savings against the price difference for your run hours.",
      },
      {
        q: "Is COP the same as efficiency?",
        a: "For heat pumps, COP above 1 means more heat moved than electricity consumed — possible because the unit moves existing heat rather than creating it. Resistance heat is COP 1.0.",
      },
    ],
    references: [
      { label: "DOE Test Procedures for Central Air Conditioners (SEER/EER)", url: "https://www.energy.gov/eere/buildings/appliance-and-equipment-standards-program" },
    ],
    related: ["btu-calculator", "heating-load-calculator", "duct-size-calculator", "airflow-cfm-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
];
