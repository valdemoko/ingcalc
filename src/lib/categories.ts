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
        title: "Networks & Transients",
        description: "Series and parallel networks, current dividers and RC charging behavior.",
        slugs: ["series-resistor-calculator", "current-divider-calculator", "rc-time-constant-calculator"],
      },
      {
        title: "Components & Electronics",
        description: "Resistor identification, parallel networks, reactance, dividers and LED circuit design.",
        slugs: ["resistor-color-code-calculator", "parallel-resistor-calculator", "reactance-calculator", "capacitor-energy-calculator", "voltage-divider-calculator", "led-resistor-calculator"],
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
        title: "Air Properties & Heat Pumps",
        description: "Air density, psychrometric state points, heat pump COP at temperature, and exact temperature conversion.",
        slugs: ["air-density-calculator", "psychrometric-calculator", "heat-pump-cop-calculator", "temperature-conversion-calculator"],
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
        slugs: ["gear-ratio-calculator", "gear-geometry-calculator", "pulley-rpm-calculator", "pulley-system-calculator", "belt-length-calculator", "chain-length-calculator", "torque-power-calculator"],
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
        title: "Beams & Shafts",
        description: "Cantilever deflection and stress, shaft torsion capacity and machine efficiency.",
        slugs: ["cantilever-beam-calculator", "simple-beam-calculator", "shaft-torsion-calculator", "machine-efficiency-calculator"],
      },
      {
        title: "Materials & Statics",
        description: "Stress, strain, elastic modulus and power in linear motion.",
        slugs: ["hooke-law-calculator", "power-from-force-calculator"],
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
        title: "Economics & System Design",
        description: "Load audits, inverter sizing, DC losses, array oversizing and payback economics.",
        slugs: ["energy-consumption-calculator", "inverter-sizing-calculator", "dc-ac-ratio-calculator", "dc-cable-loss-calculator", "solar-savings-calculator"],
      },
    ],
  },
  {
    key: "construction",
    name: "Construction",
    path: "/tools/construction",
    title: "Construction Calculators — Concrete, Masonry, Framing & Materials | IngCalc",
    description:
      "Free construction calculators: concrete volume and mix ratios, CMU block and brick takeoffs, rebar weight, stud walls, stairs, roof pitch, gravel and asphalt tonnage — with formulas, waste factors and IRC/ACI checks.",
    intro:
      "Estimating and layout tools for concrete, masonry, framing and site work. Every calculator states its yield data, density assumptions and code references, separates the geometric result from the ordering figure, and flags where the rule of thumb stops applying.",
    status: "live",
    groups: [
      {
        title: "Concrete & Masonry",
        description: "Volume, mix proportions, block and brick counts, and reinforcement takeoffs.",
        slugs: ["concrete-calculator", "concrete-mix-ratio-calculator", "cmu-block-calculator", "brick-calculator", "rebar-grid-calculator"],
      },
      {
        title: "Structural Layout",
        description: "Footing sizing, wall framing, stairs, ramps and roof geometry — the layout tools.",
        slugs: ["footing-size-calculator", "stud-wall-calculator", "stair-calculator", "ramp-calculator", "roof-pitch-calculator"],
      },
      {
        title: "Site Work & Drainage",
        description: "Earthwork cut and fill, storm runoff volumes and excavation quantities.",
        slugs: ["cut-fill-calculator", "drainage-runoff-calculator", "excavation-calculator"],
      },
      {
        title: "Materials & Estimating",
        description: "Lumber volume and weight, aggregates, finishes and paving quantities.",
        slugs: ["board-foot-calculator", "lumber-weight-calculator", "gravel-calculator", "excavation-calculator", "drywall-calculator", "paint-calculator", "tile-calculator", "asphalt-calculator"],
      },
    ],
  },
  {
    key: "plumbing",
    name: "Plumbing & Water",
    path: "/tools/plumbing",
    title: "Plumbing Calculators — Pipe Sizing, Flow & Pressure Loss",
    description:
      "Free plumbing calculators: pipe velocity and sizing, Darcy-Weisbach pressure loss, water volume in pipes and tank capacity. Metric and imperial, with design velocity guidance.",
    intro:
      "Hydraulic tools for plumbers, installers and designers. Flow calculations use the internal diameter and the Darcy-Weisbach/Swamee-Jain model for pressure loss; every assumption (water at 20 °C, straight-pipe friction) is stated on the page.",
    status: "live",
    groups: [
      {
        title: "Flow & Sizing",
        description: "Velocity checks, pipe sizing from flow limits, and water volume in runs.",
        slugs: ["pipe-flow-calculator", "pipe-size-calculator", "pipe-volume-calculator"],
      },
      {
        title: "Pressure & Storage",
        description: "Pressure loss along runs and tank capacity for storage and dosing.",
        slugs: ["pipe-pressure-drop-calculator", "tank-volume-calculator"],
      },
    ],
  },
  {
    key: "thermodynamics",
    name: "Thermodynamics & Heat Transfer",
    path: "/tools/thermodynamics",
    title: "Thermodynamics Calculators — Conduction, Expansion, Gas Laws & Heat",
    description:
      "Free thermodynamics calculators: wall conduction and U-value, thermal expansion, ideal gas law, sensible and latent heat, and heating power from flow — with sources and worked examples.",
    intro:
      "Heat-transfer and thermodynamic calculations for engineers and students: Fourier conduction with series resistances, material expansion, gas laws and the sensible/latent heat relations behind HVAC and process work.",
    status: "live",
    groups: [
      {
        title: "Heat Transfer",
        description: "Conduction through walls, U-values and heating power from flow rates.",
        slugs: ["heat-conduction-calculator", "heating-power-calculator"],
      },
      {
        title: "Materials & Gases",
        description: "Thermal expansion, ideal gas law and sensible/latent heat of common materials.",
        slugs: ["thermal-expansion-calculator", "ideal-gas-calculator", "sensible-heat-latent-calculator"],
      },
    ],
  },
  {
    key: "cnc-manufacturing",
    name: "CNC & Manufacturing",
    path: "/tools/cnc-manufacturing",
    title: "CNC & Machining Calculators — Speeds, Feeds, Cycle Time & MRR",
    description:
      "Free CNC and machining calculators: spindle RPM from cutting speed, table feed from chip load, cycle time, material removal rate and production planning.",
    intro:
      "Machining calculators for milling and turning: speeds and feeds, cycle-time quoting and removal rates. Starting values only — always verify against the tool manufacturer's cutting data.",
    status: "live",
    groups: [
      {
        title: "Speeds & Feeds",
        description: "Spindle RPM from cutting speed and table feed from chip load.",
        slugs: ["cutting-speed-calculator", "feed-rate-calculator"],
      },
      {
        title: "Production",
        description: "Cycle time, material removal rate and shift production planning.",
        slugs: ["machining-cycle-time-calculator", "material-removal-rate-calculator", "production-rate-calculator"],
      },
    ],
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
