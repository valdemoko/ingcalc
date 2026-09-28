import type { ToolDefinition } from "@/lib/types";
import { psychrometrics, heatPumpCop, tempConvert } from "@/lib/engines/hvac3";

export const HVAC3_TOOLS: ToolDefinition[] = [
  {
    slug: "psychrometric-calculator",
    category: "hvac",
    name: "Psychrometric Calculator",
    title: "Psychrometric Calculator — Humidity Ratio & Enthalpy | IngCalc",
    description:
      "Calculate humidity ratio, enthalpy and dew point from dry-bulb temperature and relative humidity, with altitude-corrected barometric pressure. ASHRAE correlations.",
    summary:
      "Enter dry-bulb temperature and RH to get the moist-air properties coil and load calculations need: humidity ratio (g/kg), enthalpy (kJ/kg dry air) and dew point — altitude corrected.",
    keywords: ["psychrometric calculator", "humidity ratio calculator", "air enthalpy calculator", "moist air properties", "g/kg calculator"],
    inputs: [
      { id: "tempC", label: "Dry-bulb temperature", kind: "number", defaultValue: 25, min: -20, max: 60, step: 0.5,
        unitOptions: [
          { value: "C", label: "°C", factor: 1 },
          { value: "F", label: "°F (×0.5556)", factor: 0.5556 },
        ],
        defaultUnit: "C" },
      { id: "rh", label: "Relative humidity", kind: "number", unit: "%", defaultValue: 50, min: 1, max: 100, step: 1 },
      { id: "altitude", label: "Altitude", kind: "number", unit: "m", defaultValue: 0, min: 0, max: 5000, step: 50, optional: true,
        help: "Barometric pressure falls with altitude and changes the humidity ratio. 0 m = sea level standard." },
    ],
    calc: psychrometrics,
    formula: [
      "p_ws = f(T)   (ASHRAE saturation correlation)",
      "W = 0.621945 × p_w / (p − p_w)",
      "h = 1.006·T + W·(2501 + 1.86·T)   kJ/kg dry air",
    ],
    variables: [
      { symbol: "W", meaning: "Humidity ratio", unit: "kg/kg (shown as g/kg)" },
      { symbol: "h", meaning: "Moist-air enthalpy", unit: "kJ/kg dry air" },
      { symbol: "p_ws", meaning: "Saturation vapor pressure", unit: "kPa" },
      { symbol: "p", meaning: "Barometric pressure at altitude", unit: "kPa" },
    ],
    howItWorks: [
      "Saturation pressure comes from the ASHRAE correlation — the same relation behind psychrometric charts.",
      "The humidity ratio W converts partial vapor pressure into grams of water per kilogram of dry air, the unit HVAC mixing calculations use.",
      "Enthalpy combines sensible heat (1.006·T) with the latent content of the moisture (2501 kJ/kg at reference, adjusted by temperature).",
      "Altitude lowers barometric pressure, which raises W at the same RH — a real effect above ~1000 m that flatland charts miss.",
    ],
    example:
      "25 °C at 50% RH, sea level: p_ws = 3.17 kPa, p_w = 1.58 kPa, W = 9.9 g/kg, h = 50.3 kJ/kg. The same air at 1500 m altitude holds W = 11.9 g/kg — 20% more moisture per kg of dry air, which changes cooling-coil sizing.",
    interpretation:
      "Enthalpy is the number cooling loads are computed from: the enthalpy difference between outdoor and indoor states, times the airflow, gives the total (sensible + latent) load the coil must handle. Two air states with the same temperature but different W have very different enthalpies — humidity is invisible in °C but dominates cooling cost in humid climates.",
    assumptions: [
      "Ideal gas behavior, standard atmosphere lapse for the altitude correction.",
      "ASHRAE correlation accuracy ~0.1% over 0-60 °C.",
    ],
    limitations: [
      "Wet-bulb and specific volume are not computed — use the full chart for complete state-point work.",
      "Correlation band is −20 to 60 °C; outside that, use dedicated psychrometric software.",
    ],
    faqs: [
      {
        q: "What is humidity ratio vs relative humidity?",
        a: "RH is water vapor pressure relative to saturation at the current temperature — it changes when temperature changes. Humidity ratio (g/kg) is absolute moisture per kg of dry air — it only changes when moisture is added or removed, which is why coil and mixing calculations use W.",
      },
      {
        q: "Why does altitude matter in psychrometrics?",
        a: "Lower barometric pressure leaves less room for vapor: at the same RH, thinner air actually carries a higher humidity ratio per kg of dry air. Cooling towers, coils and evaporative coolers all behave differently above ~1000 m.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals, Psychrometrics chapter", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["dew-point-calculator", "sensible-heat-calculator", "cooling-cost-calculator", "airflow-cfm-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "heat-pump-cop-calculator",
    category: "hvac",
    name: "Heat Pump COP Calculator",
    title: "Heat Pump COP Calculator — HSPF, Temperature & Cost | IngCalc",
    description:
      "Convert heat pump HSPF to COP at your outdoor temperature, and compare heating cost against electric resistance — with capacity derating shown.",
    summary:
      "Enter HSPF, outdoor temperature and your rate to get the COP the heat pump actually delivers at that temperature, its derated capacity, and the cost per kWh of heat vs resistance.",
    keywords: ["heat pump cop calculator", "hspf to cop", "heat pump efficiency temperature", "heat pump vs electric heat cost"],
    inputs: [
      { id: "hspf", label: "Heat pump HSPF rating", kind: "number", unit: "BTU/Wh", defaultValue: 9, min: 6, max: 16, step: 0.5,
        help: "HSPF2 or HSPF from the yellow label: 8-10 typical modern, 10-13 premium cold-climate." },
      { id: "outdoorC", label: "Outdoor temperature", kind: "number", defaultValue: 0, min: -30, max: 20, step: 1,
        unitOptions: [
          { value: "C", label: "°C", factor: 1 },
          { value: "F", label: "°F (×0.5556)", factor: 0.5556 },
        ],
        defaultUnit: "C" },
      { id: "heatLoad", label: "Heat needed now", kind: "number", unit: "kW", defaultValue: 6, min: 0.5, step: 0.5 },
      { id: "rate", label: "Electricity rate", kind: "number", unit: "$/kWh", defaultValue: 0.15, min: 0, step: 0.01,
        help: "Example editable value — use your bill's all-in rate." },
    ],
    calc: heatPumpCop,
    formula: ["COP_seasonal = HSPF × 0.2931", "COP(T) ≈ COP_seasonal × [1 − 0.028 × max(0, 8.3 − T)]", "Cost per kWh heat = rate ÷ COP"],
    variables: [
      { symbol: "COP", meaning: "Coefficient of performance (heat out ÷ electric in)", unit: "—" },
      { symbol: "HSPF", meaning: "Heating Seasonal Performance Factor", unit: "BTU/Wh" },
    ],
    howItWorks: [
      "HSPF converts to a seasonal COP by unit conversion: BTU/Wh × 0.2931 (Wh→W).",
      "Air-source COP falls as outdoor temperature drops — roughly 2.8% per °C below 8 °C, floor at ~35% of rating.",
      "Capacity derates too: the heat the pump can deliver shrinks as it gets colder, which is when backup strips engage.",
      "Cost per kWh of heat divides the electric rate by COP — resistance heat is always COP 1.0, the comparison baseline.",
    ],
    example:
      "A 9 HSPF heat pump (seasonal COP 2.64) at 0 °C outdoors: COP ≈ 2.64 × 0.767 = 2.02. Delivering 6 kW of heat draws 3.0 kW — $0.45/h at $0.15. Resistance strips for the same 6 kW: 6 kW, $0.90/h. The heat pump halves the bill even at freezing; at −15 °C the COP lands near 1.6 and capacity drops toward 60%.",
    interpretation:
      "The balance point is the practical limit: as capacity derates and the house load rises with cold, they cross — below it, resistance strips carry the remainder and real seasonal COP lands between the heat pump's and 1.0. Cold-climate units push the balance point down with inverter compressors and vapor injection. Against gas, compare cost per kWh of heat: gas at 85% AFUE and $1.20/therm delivers heat at about $0.041/kWh — competitive only where electricity is cheap or the heat pump's COP is high.",
    assumptions: [
      "Linear COP derate below 8.3 °C — an approximation of inverter and fixed-speed air-source behavior.",
      "HSPF (Seasonal) as the starting point; HSPF2 ratings run ~10% lower numerically for the same unit.",
    ],
    limitations: [
      "Ground-source (geothermal) heat pumps derate far less — this model overstates their cold-weather penalty.",
      "Defrost cycles, auxiliary heat lockouts and duct losses are not modeled.",
    ],
    faqs: [
      {
        q: "What COP does a heat pump have at 0 °F?",
        a: "Modern cold-climate units maintain COP 1.5-2.0 at −18 °C; standard units drop toward 1.2-1.5. Below that, output and COP fall together until backup resistance takes over.",
      },
      {
        q: "How do I convert HSPF to COP?",
        a: "Multiply HSPF by 0.2931. An HSPF 10 unit: seasonal COP 2.93. It is a pure unit conversion — HSPF is BTU of heat per Wh of electricity, COP is the same ratio unitless.",
      },
    ],
    references: [
      { label: "DOE — heat pump efficiency standards (HSPF/HSPF2)", url: "https://www.energy.gov/eere/buildings/appliance-and-equipment-standards-program" },
      { label: "NEEP — cold-climate heat pump performance data", url: "https://neep.org/heating-technology/cold-climate-air-source-heat-pumps" },
    ],
    related: ["degree-day-energy-calculator", "heating-load-calculator", "seer-eer-converter", "energy-cost-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "temperature-conversion-calculator",
    category: "hvac",
    name: "Temperature Conversion Calculator",
    title: "Temperature Conversion Calculator — °C, °F, K | IngCalc",
    description:
      "Convert between Celsius, Fahrenheit and Kelvin exactly, with HVAC-specific ΔT guidance — the difference conversion (×1.8) that load math depends on.",
    summary:
      "Enter a temperature in any scale to get the other two exactly, with the absolute-zero guard and the ΔT conversion rule HVAC calculations actually use.",
    keywords: ["temperature conversion calculator", "celsius to fahrenheit", "fahrenheit to celsius", "temperature converter"],
    inputs: [
      { id: "temp", label: "Temperature", kind: "number", defaultValue: 20, step: 0.5,
        unitOptions: [
          { value: "celsius", label: "°C", factor: 1 },
          { value: "fahrenheit", label: "°F (×0.5556)", factor: 0.5556 },
        ],
        defaultUnit: "celsius" },
      {
        id: "scale", label: "Input scale", kind: "select",
        options: [
          { value: "celsius", label: "Celsius" },
          { value: "fahrenheit", label: "Fahrenheit" },
          { value: "kelvin", label: "Kelvin" },
        ],
        defaultOption: "celsius",
      },
    ],
    calc: tempConvert,
    formula: ["°F = °C × 1.8 + 32", "K = °C + 273.15", "ΔT: °F difference = °C difference × 1.8 (no +32)"],
    variables: [
      { symbol: "T", meaning: "Temperature", unit: "°C / °F / K" },
      { symbol: "ΔT", meaning: "Temperature difference", unit: "°C or K ↔ °F × 1.8" },
    ],
    howItWorks: [
      "Absolute conversions use the exact definitions — no rounded constants.",
      "Input below absolute zero is rejected rather than producing a negative-Kelvin nonsense result.",
      "The notes carry the HVAC-critical rule: temperature DIFFERENCES convert with ×1.8 only, never +32.",
    ],
    example:
      "20 °C = 68 °F = 293.15 K. A 20 °F design ΔT is 11.1 °C — not 52 °F! The ΔT trap is the most common conversion error in HVAC math translated between unit systems.",
    interpretation:
      "The single most common mistake is applying +32 to a temperature difference: a '9 °F split' across a coil is 5 °C, not −12.8 °C. Load formulas (Q = 1.08 × CFM × ΔT) and U-factor math all take ΔT in consistent units — convert the difference with ×1.8, then apply. International equipment specs in °C convert to US practice and back this way without error.",
    assumptions: [
      "Exact scale definitions; no approximation.",
      "Deliberately simple — for weather-feel metrics use the dew point, heat index and wind chill calculators.",
    ],
    limitations: [
      "Temperature conversion only — it cannot substitute for psychrometric or comfort calculations.",
    ],
    faqs: [
      {
        q: "How do I convert Celsius to Fahrenheit?",
        a: "Multiply by 1.8 and add 32: 20 °C → 20 × 1.8 + 32 = 68 °F. For temperature differences, multiply by 1.8 only.",
      },
      {
        q: "What is absolute zero in Fahrenheit?",
        a: "−459.67 °F (0 K, −273.15 °C). The calculator rejects inputs below it instead of returning unphysical results.",
      },
    ],
    references: [
      { label: "NIST — SI units and temperature scales", url: "https://www.nist.gov/pml/weights-and-measures/metric-si/si-units" },
    ],
    related: ["dew-point-calculator", "heat-index-calculator", "sensible-heat-calculator", "heating-load-calculator"],
    priority: "C",
    lastUpdated: "2026-09-28",
  },
];
