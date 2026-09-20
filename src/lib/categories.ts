import type { CategoryDef, CategoryKey } from "@/lib/types";

/**
 * The 10 initial sectors. `planned` categories are defined here so the
 * architecture is ready, but they get no routes, links or sitemap entries
 * until they have real tools (no thin content).
 */
export const CATEGORIES: CategoryDef[] = [
  {
    key: "electrical",
    name: "Electrical",
    path: "/tools/electrical",
    title: "Electrical Calculators — Voltage Drop, Wire Size, Ohm's Law & More",
    description:
      "Free electrical calculators: voltage drop, wire sizing, Ohm's law, kVA to amps, power factor correction and motor current. Metric and AWG, with formulas and examples.",
    intro:
      "Practical calculators for electricians, electrical engineers and serious DIYers. Wire sizing follows NEC conductor tables; every result shows the formula, the assumptions and the limitations of the model.",
    status: "live",
    groups: [
      {
        title: "Circuit Design & Protection",
        description: "Wire sizing, ampacity derating, overcurrent protection and conductor properties.",
        slugs: ["wire-size-calculator", "wire-derating-calculator", "breaker-size-calculator", "wire-resistance-calculator", "cable-reactance-calculator"],
      },
      {
        title: "Voltage, Current & Power",
        description: "Core electrical relationships: voltage drop, Ohm's law, three-phase power, motor current and power factor.",
        slugs: ["voltage-drop-calculator", "ohms-law-calculator", "kva-to-amps-calculator", "three-phase-power-calculator", "motor-current-calculator", "power-factor-calculator"],
      },
      {
        title: "Components & Electronics",
        description: "Resistor identification, voltage dividers and LED circuit design.",
        slugs: ["resistor-color-code-calculator", "voltage-divider-calculator", "led-resistor-calculator"],
      },
      {
        title: "Power Systems & Energy",
        description: "Transformer sizing, energy costs, EV charging and generator selection.",
        slugs: ["transformer-sizing-calculator", "energy-cost-calculator", "ev-charge-time-calculator", "generator-sizing-calculator"],
      },
    ],
  },
  {
    key: "hvac",
    name: "HVAC & Climate",
    path: "/tools/hvac",
    title: "HVAC Calculators — Cooling Load, Heating Load, Duct Sizing & Airflow",
    description:
      "Free HVAC calculators: cooling and heating BTU load estimates, round duct sizing with friction loss, CFM and air changes per hour, plus SEER, EER and COP conversions.",
    intro:
      "Tools for HVAC technicians, installers and building designers. Load estimates are clearly labeled rule-of-thumb methods; duct sizing uses the standard equal-friction equation for round galvanized duct.",
    status: "live",
    groups: [
      {
        title: "Load Estimation",
        description: "Estimate heating and cooling loads for rooms and buildings.",
        slugs: ["btu-calculator", "heating-load-calculator", "degree-day-energy-calculator"],
      },
      {
        title: "Airflow & Ducts",
        description: "Size ducts, check velocity, convert between CFM and air changes, and apply the sensible heat equation.",
        slugs: ["duct-size-calculator", "airflow-cfm-calculator", "duct-velocity-calculator", "fan-laws-calculator", "sensible-heat-calculator"],
      },
      {
        title: "Comfort & Weather",
        description: "Dew point, heat index and wind chill — the metrics that translate temperature and humidity into human comfort.",
        slugs: ["dew-point-calculator", "heat-index-calculator", "wind-chill-calculator"],
      },
      {
        title: "Efficiency & Cost",
        description: "SEER/EER/COP conversions and air conditioning running costs.",
        slugs: ["seer-eer-converter", "cooling-cost-calculator"],
      },
    ],
  },
  {
    key: "mechanical",
    name: "Mechanical Engineering",
    path: "/tools/mechanical",
    title: "Mechanical Engineering Calculators — Gears, Torque, Bolts & Belts",
    description:
      "Free mechanical calculators: gear ratio and RPM, torque to power conversion, bolt torque and preload, belt length and pulley sizing, tap drill sizes for metric and imperial threads.",
    intro:
      "Calculators for mechanical and manufacturing work: power transmission, fastener torque, belt drives and threading. Each tool documents the formula and the friction or material factors it assumes.",
    status: "live",
    groups: [
      {
        title: "Power Transmission",
        description: "Gears, belts, chains and pulleys — speed ratios, torque conversion and drive geometry.",
        slugs: ["gear-ratio-calculator", "gear-geometry-calculator", "pulley-rpm-calculator", "belt-length-calculator", "chain-length-calculator", "torque-power-calculator"],
      },
      {
        title: "Fasteners & Threading",
        description: "Bolt torque, tap drill sizes and torque wrench corrections.",
        slugs: ["bolt-torque-calculator", "tap-drill-calculator", "torque-wrench-extension-calculator"],
      },
      {
        title: "Engine & Displacement",
        description: "Engine displacement, compression ratio and bore/stroke calculations.",
        slugs: ["engine-displacement-calculator", "compression-ratio-calculator"],
      },
      {
        title: "Machine Elements",
        description: "Bearings, springs, material weight and structural considerations.",
        slugs: ["bearing-life-calculator", "spring-rate-calculator", "metal-weight-calculator"],
      },
      {
        title: "Fluid Power",
        description: "Hydraulic cylinders, pump power and fluid mechanics.",
        slugs: ["hydraulic-cylinder-calculator", "pump-power-calculator"],
      },
    ],
  },
  {
    key: "solar-energy",
    name: "Solar, Energy & Batteries",
    path: "/tools/solar-energy",
    title: "Solar & Battery Calculators — Panel Output, Runtime, Off-Grid Sizing",
    description:
      "Free solar and battery calculators: daily panel energy from peak sun hours, battery runtime with depth of discharge, full off-grid system sizing and charge controller sizing.",
    intro:
      "Design tools for off-grid and backup solar systems. Sizing includes realistic derating factors (inverter efficiency, depth of discharge, temperature) and every assumption is stated on the page.",
    status: "live",
    groups: [
      {
        title: "Panel & Array Design",
        description: "Estimate panel output, count panels, optimize tilt angle and size PV strings.",
        slugs: ["solar-panel-output-calculator", "panel-count-calculator", "solar-tilt-calculator", "string-sizing-calculator", "charge-controller-calculator"],
      },
      {
        title: "Battery & Storage",
        description: "Battery runtime, bank sizing, charge time and complete off-grid system design.",
        slugs: ["battery-runtime-calculator", "battery-bank-calculator", "battery-charge-time-calculator", "off-grid-system-calculator"],
      },
      {
        title: "Economics",
        description: "Solar savings, payback period and system economics.",
        slugs: ["solar-savings-calculator"],
      },
    ],
  },
  {
    key: "construction",
    name: "Construction",
    path: "/tools/construction",
    title: "Construction Calculators",
    description: "Concrete, framing and materials calculators for construction professionals.",
    intro: "Material quantity and structural estimation tools for construction work.",
    status: "planned",
  },
  {
    key: "plumbing",
    name: "Plumbing & Water",
    path: "/tools/plumbing",
    title: "Plumbing & Water Calculators",
    description: "Pipe sizing, flow rate, pressure loss and water heating calculators.",
    intro: "Flow, pressure and pipe sizing tools for plumbing and water systems.",
    status: "planned",
  },
  {
    key: "cnc-manufacturing",
    name: "CNC & Manufacturing",
    path: "/tools/cnc-manufacturing",
    title: "CNC & Manufacturing Calculators",
    description: "Feeds and speeds, cutting time, thread data and machining calculators.",
    intro: "Machining calculators for milling, turning and fabrication work.",
    status: "planned",
  },
  {
    key: "automotive",
    name: "Automotive",
    path: "/tools/automotive",
    title: "Automotive Calculators",
    description: "Engine, drivetrain, electrical and performance calculators for vehicles.",
    intro: "Vehicle-related engineering calculators for mechanics and tuners.",
    status: "planned",
  },
  {
    key: "agriculture",
    name: "Agriculture",
    path: "/tools/agriculture",
    title: "Agriculture Calculators",
    description: "Irrigation, livestock, fuel and yield calculators for farming operations.",
    intro: "Practical calculators for farm planning and equipment sizing.",
    status: "planned",
  },
  {
    key: "chemistry",
    name: "Chemistry & Laboratory",
    path: "/tools/chemistry",
    title: "Chemistry & Lab Calculators",
    description: "Solution preparation, dilution, molarity and unit conversion tools for labs.",
    intro: "Analytical and preparation calculators for laboratory work.",
    status: "planned",
  },
];

export const LIVE_CATEGORIES = CATEGORIES.filter((c) => c.status === "live");

export function getCategory(key: CategoryKey): CategoryDef {
  const cat = CATEGORIES.find((c) => c.key === key);
  if (!cat) throw new Error(`Unknown category: ${key}`);
  return cat;
}

export function isValidCategoryKey(key: string): key is CategoryKey {
  return CATEGORIES.some((c) => c.key === key);
}
