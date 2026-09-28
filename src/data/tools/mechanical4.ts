import type { ToolDefinition } from "@/lib/types";
import { simpleBeam, hookeLaw, powerFromForce, pulleySystem } from "@/lib/engines/mechanical4";

export const MECHANICAL4_TOOLS: ToolDefinition[] = [
  {
    slug: "simple-beam-calculator",
    category: "mechanical",
    name: "Simply Supported Beam Calculator",
    title: "Simply Supported Beam Calculator — Deflection & Stress | IngCalc",
    description:
      "Calculate midspan deflection and bending stress for a steel simply supported beam with a center point load — with the support-condition comparison explained.",
    summary:
      "Enter the center load, span and rectangular section to get midspan deflection (δ = PL³/48EI), max stress and support reactions — with a utilization check.",
    keywords: ["simply supported beam calculator", "beam deflection calculator", "midspan deflection formula", "beam bending stress"],
    inputs: [
      { id: "load", label: "Point load at midspan", kind: "number", defaultValue: 1000, min: 0.1, step: 10,
        unitOptions: [
          { value: "N", label: "N", factor: 1 },
          { value: "kgf", label: "kgf", factor: 9.80665 },
          { value: "lbf", label: "lbf", factor: 4.44822 },
        ],
        defaultUnit: "N" },
      { id: "span", label: "Span (support to support)", kind: "number", defaultValue: 2, min: 0.01, step: 0.1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "mm", label: "mm", factor: 0.001 },
          { value: "ft", label: "ft", factor: 0.3048 },
        ],
        defaultUnit: "m" },
      { id: "height", label: "Section depth (bending direction)", kind: "number", unit: "mm", defaultValue: 100, min: 1, step: 5 },
      { id: "width", label: "Section width", kind: "number", unit: "mm", defaultValue: 50, min: 1, step: 5 },
    ],
    calc: simpleBeam,
    formula: ["δ = P·L³ / (48·E·I)", "M_max = P·L / 4        σ = M·c/I", "I = w·h³ / 12"],
    variables: [
      { symbol: "δ", meaning: "Midspan deflection", unit: "mm" },
      { symbol: "M", meaning: "Max bending moment at midspan", unit: "N·m" },
      { symbol: "E", meaning: "Young's modulus — 200 GPa (steel)", unit: "GPa" },
    ],
    howItWorks: [
      "Both supports carry half the load; the peak moment sits at midspan where the load applies.",
      "Deflection uses δ = PL³/48EI — the simply-supported companion of the cantilever's PL³/3EI.",
      "Stress is checked against 250 MPa typical steel yield for a utilization read.",
    ],
    example:
      "A 2 m span, 100 × 50 mm section, 1 kN at center: I = 50 × 100³/12 = 4.17e6 mm⁴. Deflection = 1000 × 8/(48 × 200e9 × 4.17e-6) = 0.2 mm. Stress = 500 N·m × 0.05/4.17e-6 = 6 MPa — 2.4% of yield. The same load cantilevered from one end deflects 16× more.",
    interpretation:
      "Support conditions dominate stiffness — both-ends-supported is 16× stiffer than cantilevered, which is why floors span between walls instead of cantilevering from one. The L³ law still rules: double the span and deflection multiplies 8×, the reason long unsupported spans need engineered sections. As with the cantilever, serviceability (L/360) usually binds before stress does.",
    assumptions: [
      "Linear-elastic steel, rectangular section, point load at exact midspan.",
      "Self-weight excluded; lateral-torsional buckling not checked.",
    ],
    limitations: [
      "Distributed loads and off-center loads use different equations (δ = 5wL⁴/384EI for uniform).",
      "No shear deflection on short deep spans; no buckling check on tall thin sections.",
    ],
    faqs: [
      {
        q: "What is the deflection formula for a simply supported beam?",
        a: "For a center point load: δ = P·L³ ÷ (48·E·I). For a uniform load: δ = 5wL⁴ ÷ (384·E·I). Both are linear-elastic midspan values.",
      },
      {
        q: "Why is a supported beam stiffer than a cantilever?",
        a: "Geometry of bending: the cantilever's PL³/3EI versus the supported beam's PL³/48EI — 16× less deflection for identical load and section. Both ends held means both ends resist.",
      },
    ],
    references: [
      { label: "Engineering ToolBox — beam deflection formulas", url: "https://www.engineeringtoolbox.com/beam-stress-deflection-d_1312.html" },
      { label: "Roark's Formulas for Stress and Strain — beam tables", url: "https://www.mheducation.com/" },
    ],
    related: ["cantilever-beam-calculator", "hooke-law-calculator", "heat-conduction-calculator", "shaft-torsion-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "hooke-law-calculator",
    category: "mechanical",
    name: "Hooke's Law Calculator",
    title: "Hooke's Law Calculator — Stress, Strain & E | IngCalc",
    description:
      "Solve Hooke's law: stress (F/A), strain (ΔL/L) and Young's modulus — enter force and area to predict elongation, or enter elongation to measure E.",
    summary:
      "Enter force, area and specimen length to get stress, strain and elongation — or add a measured elongation to compute the material's actual modulus.",
    keywords: ["hooke's law calculator", "stress strain calculator", "young's modulus calculator", "elongation calculator"],
    inputs: [
      { id: "force", label: "Applied force", kind: "number", defaultValue: 10000, min: 0.01, step: 100,
        unitOptions: [
          { value: "N", label: "N", factor: 1 },
          { value: "kN", label: "kN", factor: 1000 },
          { value: "lbf", label: "lbf", factor: 4.44822 },
        ],
        defaultUnit: "N" },
      { id: "area", label: "Cross-section area", kind: "number", defaultValue: 100, min: 0.01, step: 5,
        unitOptions: [
          { value: "mm2", label: "mm²", factor: 1 },
          { value: "cm2", label: "cm² (×100)", factor: 100 },
        ],
        defaultUnit: "mm2" },
      { id: "length", label: "Specimen length", kind: "number", defaultValue: 200, min: 0.1, step: 10,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm" },
      { id: "modulus", label: "Young's modulus (for prediction)", kind: "number", defaultValue: 200, min: 1, step: 1, unit: "GPa", optional: true,
        help: "Steel 200 · stainless 193 · aluminum 69 · brass 100 · titanium 114. Used to predict elongation." },
      { id: "elongation", label: "Measured elongation (to solve E)", kind: "number", min: 0.001, step: 0.01,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm", optional: true,
        help: "Enter a measured ΔL to have the tool compute the actual modulus instead of predicting elongation." },
    ],
    calc: hookeLaw,
    formula: ["σ = F / A        ε = ΔL / L        E = σ / ε"],
    variables: [
      { symbol: "σ", meaning: "Normal stress", unit: "MPa" },
      { symbol: "ε", meaning: "Strain", unit: "—" },
      { symbol: "E", meaning: "Young's modulus", unit: "GPa" },
    ],
    howItWorks: [
      "Stress divides force by area; strain is the relative elongation.",
      "With a known modulus (steel 200 GPa default), the tool predicts elongation from load.",
      "With a measured elongation entered, it inverts the relation to compute the actual E — a tensile-test check.",
    ],
    example:
      "A 10 kN pull on a 100 mm² steel bar, 200 mm long: σ = 100 MPa, ε = 100/200,000 = 0.0005, ΔL = 0.1 mm. A measured 0.098 mm elongation on the same bar gives E = 204 GPa — within 2% of steel's textbook value.",
    interpretation:
      "Hooke's law is the elastic contract: stress and strain stay proportional until yield, then the relation breaks permanently. Steel's stiffness is essentially fixed — alloying changes strength dramatically but stiffness barely at all (all steels ≈ 200 GPa). That surprises people: a stronger steel does not bend less under the same load, it only survives more load. The elastic range is why springs work, and exceeding it is why bent parts stay bent.",
    assumptions: [
      "Linear-elastic behavior below yield; uniform uniaxial loading.",
      "Nominal (engineering) stress — necking beyond yield changes the real area.",
    ],
    limitations: [
      "No Poisson lateral contraction, no buckling for long slender members in compression.",
      "Temperature, strain rate and cyclic loading shift the modulus and limits.",
    ],
    faqs: [
      {
        q: "What is Hooke's law?",
        a: "Stress is proportional to strain below yield: σ = E·ε. Double the load, double the stretch — until the elastic limit, where the proportionality ends permanently.",
      },
      {
        q: "How do I find Young's modulus from a tensile test?",
        a: "E = stress ÷ strain in the elastic region: (F/A) ÷ (ΔL/L). Enter the measured elongation here and the calculator returns E directly.",
      },
    ],
    references: [
      { label: "MatWeb — material property data", url: "https://www.matweb.com/" },
      { label: "Shigley's Mechanical Engineering Design — mechanical properties", url: "https://www.mheducation.com/" },
    ],
    related: ["simple-beam-calculator", "cantilever-beam-calculator", "thermal-expansion-calculator", "spring-rate-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "power-from-force-calculator",
    category: "mechanical",
    name: "Power from Force Calculator",
    title: "Power from Force Calculator — P = F × v | IngCalc",
    description:
      "Calculate mechanical power from force and linear velocity: watts, kW and hp — the linear-motion twin of torque-to-power for conveyors, hoists and actuators.",
    summary:
      "Enter the force you must overcome and the speed you move at to get the power — the first number in sizing any linear drive.",
    keywords: ["power from force calculator", "force velocity power", "conveyor power calculator", "p f v formula"],
    inputs: [
      { id: "force", label: "Force to overcome", kind: "number", defaultValue: 2000, min: 0, step: 100,
        unitOptions: [
          { value: "N", label: "N", factor: 1 },
          { value: "kgf", label: "kgf", factor: 9.80665 },
          { value: "lbf", label: "lbf", factor: 4.44822 },
        ],
        defaultUnit: "N",
        help: "For lifting: weight (m × 9.81). For conveyors: belt tension." },
      { id: "velocity", label: "Velocity", kind: "number", defaultValue: 1.5, min: 0, step: 0.1,
        unitOptions: [
          { value: "ms", label: "m/s", factor: 1 },
          { value: "mmin", label: "m/min (÷60)", factor: 1 / 60 },
          { value: "kmh", label: "km/h (÷3.6)", factor: 1 / 3.6 },
          { value: "fts", label: "ft/s (×0.3048)", factor: 0.3048 },
        ],
        defaultUnit: "ms" },
    ],
    calc: powerFromForce,
    formula: ["P = F × v"],
    variables: [
      { symbol: "P", meaning: "Mechanical power", unit: "W" },
      { symbol: "F", meaning: "Force along the motion", unit: "N" },
      { symbol: "v", meaning: "Velocity along the force", unit: "m/s" },
    ],
    howItWorks: [
      "Power is force times velocity along the force direction — the linear analog of P = T·ω.",
      "Outputs in W, kW and hp connect to motor ratings directly.",
      "For lifting, force includes gravity: a 200 kg hoist load needs 1962 N before acceleration.",
    ],
    example:
      "A conveyor moving 1.5 m/s against 2 kN of belt tension: P = 2000 × 1.5 = 3 kW. With reducer and motor efficiencies (0.9 × 0.92): electrical draw ≈ 3.6 kW — a 4 kW motor with margin. A 200 kg hoist at 0.5 m/s: 981 W mechanical.",
    interpretation:
      "P = F·v explains the trade-off linear drives make: the same power buys double force at half speed. Hoists gear down for force; conveyors run fast for throughput. Remember the chain of efficiencies: motor, reducer, and any screw or belt each take a few percent — the electrical draw exceeds the mechanical power at the load. And acceleration matters at startup: torque at zero speed (locked rotor) is a motor-selection question, not this equation's.",
    assumptions: [
      "Steady velocity along the force direction.",
      "No losses included — add drive efficiency for electrical sizing.",
    ],
    limitations: [
      "Starting/acceleration torque needs separate sizing (motors have peak torque limits).",
      "For rotating systems use the torque-to-power calculator instead.",
    ],
    faqs: [
      {
        q: "How do I calculate power from force and speed?",
        a: "Multiply them: P = F × v. 2 kN at 1.5 m/s is 3 kW. Keep units consistent (N and m/s give watts).",
      },
      {
        q: "How much power to lift 200 kg?",
        a: "Force = 200 × 9.81 = 1962 N. At 0.5 m/s: 981 W ≈ 1 kW mechanical — before motor and gearbox losses.",
      },
    ],
    references: [
      { label: "ISO 80000-3 — SI units for mechanics", url: "https://www.iso.org/standard/79916.html" },
    ],
    related: ["torque-power-calculator", "machine-efficiency-calculator", "hooke-law-calculator", "motor-current-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "pulley-system-calculator",
    category: "mechanical",
    name: "Pulley System Calculator",
    title: "Pulley System Calculator — Speed, Torque & Belt Speed | IngCalc",
    description:
      "Calculate belt-drive speed ratio, output RPM, torque multiplication and belt speed from driver/driven pulley diameters — with the V-belt limits shown.",
    summary:
      "Enter pulley diameters (and optional input RPM/torque) to get the ratio, output speed, belt-driven torque and the belt surface speed check.",
    keywords: ["pulley calculator", "belt drive calculator", "pulley speed ratio", "belt speed calculator"],
    inputs: [
      { id: "driverDia", label: "Driver pulley diameter", kind: "number", defaultValue: 100, min: 1, step: 5,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm" },
      { id: "drivenDia", label: "Driven pulley diameter", kind: "number", defaultValue: 250, min: 1, step: 5,
        unitOptions: [{ value: "mm", label: "mm", factor: 1 }, { value: "in", label: "inches (×25.4)", factor: 25.4 }],
        defaultUnit: "mm" },
      { id: "inputRpm", label: "Input speed", kind: "number", defaultValue: 1750, min: 0, step: 10, unit: "RPM", optional: true },
      { id: "inputTorque", label: "Input torque", kind: "number", defaultValue: 20, min: 0, step: 1,
        unitOptions: [{ value: "Nm", label: "N·m", factor: 1 }, { value: "lbft", label: "lb·ft (×1.356)", factor: 1.356 }],
        defaultUnit: "Nm", optional: true },
    ],
    calc: pulleySystem,
    formula: ["ratio = D_driven / D_driver", "n₂ = n₁ / ratio        T₂ ≈ T₁ × ratio × 0.95"],
    variables: [
      { symbol: "D", meaning: "Pulley (pitch) diameter", unit: "mm" },
      { symbol: "n", meaning: "Rotational speed", unit: "RPM" },
      { symbol: "T", meaning: "Torque", unit: "N·m" },
    ],
    howItWorks: [
      "Surface speed at both pulleys is equal — the ratio inverts the diameter ratio.",
      "Torque multiplies by the ratio less ~5% belt efficiency (slip and hysteresis).",
      "Belt speed checks the centrifugal limit: V-belts live below ~25–30 m/s.",
    ],
    example:
      "100 mm driving 250 mm at 1750 RPM, 20 N·m: ratio 2.5:1, output 700 RPM at ~47.5 N·m. Belt speed = π × 0.1 × 1750/60 = 9.2 m/s — comfortable. Swap the pulleys to overdrive and the same motor runs 4375 RPM out.",
    interpretation:
      "Belt drives are the quiet, cheap, forgiving transmission: they slip under overload (a feature, not a bug), absorb vibration and cost less than gears — at the price of a few percent efficiency and belt maintenance. Use pitch diameters for the math; the outer diameter lies on V-belts. Belt speed's centrifugal ceiling is why very fast drives move to synchronous belts or chains.",
    assumptions: [
      "Pitch diameters entered; ~5% belt-drive efficiency.",
      "No gross slip or belt creep beyond design.",
    ],
    limitations: [
      "Does not size the belt (section and length — see the belt length calculator).",
      "Multi-stage drives compose: multiply stage ratios.",
    ],
    faqs: [
      {
        q: "How do I calculate pulley speed ratio?",
        a: "Driven speed = driver speed × driver diameter ÷ driven diameter. A 100 mm pulley driving a 250 mm pulley at 1750 RPM gives 700 RPM.",
      },
      {
        q: "How fast can a V-belt run?",
        a: "About 25–30 m/s of belt speed before centrifugal lift unloads the contact face. Beyond that, use synchronous belts or different drives.",
      },
    ],
    references: [
      { label: "Machinery's Handbook — belt drive fundamentals", url: "https://www.industrialpress.com/machinerys-handbook" },
    ],
    related: ["pulley-rpm-calculator", "belt-length-calculator", "chain-length-calculator", "gear-ratio-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
