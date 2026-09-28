import type { ToolDefinition } from "@/lib/types";
import { cantileverBeam, shaftTorsion, machineEfficiency } from "@/lib/engines/mechanical3";

export const MECHANICAL3_TOOLS: ToolDefinition[] = [
  {
    slug: "cantilever-beam-calculator",
    category: "mechanical",
    name: "Cantilever Beam Calculator",
    title: "Cantilever Beam Calculator — Deflection & Stress | IngCalc",
    description:
      "Calculate tip deflection and maximum bending stress for a steel cantilever with an end load. Rectangular section, with utilization against 250 MPa yield.",
    summary:
      "Enter the tip load, length and rectangular section to get deflection (δ = PL³/3EI) and bending stress at the fixed end — with a utilization check against steel yield.",
    keywords: ["cantilever beam calculator", "beam deflection calculator", "cantilever deflection formula", "bending stress calculator"],
    inputs: [
      { id: "load", label: "Point load at the tip", kind: "number", defaultValue: 500, min: 0.1, step: 10,
        unitOptions: [
          { value: "N", label: "N", factor: 1 },
          { value: "kgf", label: "kgf", factor: 9.80665 },
          { value: "lbf", label: "lbf", factor: 4.44822 },
        ],
        defaultUnit: "N" },
      { id: "length", label: "Beam length", kind: "number", defaultValue: 1, min: 0.01, step: 0.1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "mm", label: "mm", factor: 0.001 },
          { value: "ft", label: "ft", factor: 0.3048 },
        ],
        defaultUnit: "m" },
      { id: "height", label: "Section depth (bending direction)", kind: "number", unit: "mm", defaultValue: 50, min: 1, step: 1 },
      { id: "width", label: "Section width", kind: "number", unit: "mm", defaultValue: 20, min: 1, step: 1 },
    ],
    calc: cantileverBeam,
    formula: ["δ = P·L³ / (3·E·I)", "σ = M·c / I   with M = P·L, c = h/2", "I = w·h³ / 12   (rectangular section)"],
    variables: [
      { symbol: "δ", meaning: "Tip deflection", unit: "mm" },
      { symbol: "σ", meaning: "Max bending stress at the fixed end", unit: "MPa" },
      { symbol: "I", meaning: "Second moment of area", unit: "mm⁴" },
      { symbol: "E", meaning: "Young's modulus — 200 GPa (steel)", unit: "GPa" },
    ],
    howItWorks: [
      "The rectangular section's second moment I = w·h³/12 drives everything: depth enters cubed, width linearly.",
      "Deflection follows δ = P·L³/(3·E·I) — the cube of length means doubling the span increases deflection 8×.",
      "Bending stress peaks at the fixed end's outer fiber: σ = P·L·(h/2)/I, compared here against 250 MPa typical steel yield.",
    ],
    example:
      "A 1 m steel bar 50 mm deep × 20 mm wide, 500 N at the tip: I = 20 × 50³/12 = 208,333 mm⁴. Deflection = 500 × 1³ / (3 × 200e9 × 2.083e-7) = 4.0 mm. Stress = 500 × 1 × 0.025 / 2.083e-7 = 60 MPa — 24% of yield. Rotate the bar flat-wise (20 deep) and deflection jumps 15×.",
    interpretation:
      "The depth-cubed law is the design lever: mount the section tall, not flat. Check serviceability before strength — a shelf bracket can be far from yield yet still sag visibly; L/360 deflection is a common acceptability limit (2.8 mm on a 1 m span). Add self-weight for long beams (about half the beam mass as an equivalent tip load), and remember fatigue, not yield, governs vibrating cantilevers.",
    assumptions: [
      "Linear-elastic steel, E = 200 GPa, small deflections.",
      "Rectangular solid section; a point load at the free end.",
      "Self-weight and dynamic amplification not included.",
    ],
    limitations: [
      "Aluminum (E = 69 GPa) deflects ~2.9× more — swap E mentally or scale the result.",
      "Short deep beams shear-govern before bending theory applies (rule of thumb: span < 5× depth).",
      "No lateral-torsional buckling check — tall thin sections under heavy load can buckle sideways.",
    ],
    faqs: [
      {
        q: "What is the cantilever deflection formula?",
        a: "δ = P·L³ ÷ (3·E·I) for a point load at the tip. The L³ is why spans are expensive: twice the length deflects eight times as much.",
      },
      {
        q: "How do I make a cantilever stiffer?",
        a: "Increase section depth (cubed effect), shorten the span (cubed), or add support — in that order of effectiveness. Widening the section is the weakest lever (linear).",
      },
    ],
    references: [
      { label: "Engineering ToolBox — beam deflection and stress formulas", url: "https://www.engineeringtoolbox.com/beam-stress-deflection-d_1312.html" },
      { label: "Roark's Formulas for Stress and Strain — cantilever loading cases", url: "https://www.mheducation.com/" },
    ],
    related: ["simple-beam-calculator", "shaft-torsion-calculator", "spring-rate-calculator", "metal-weight-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "shaft-torsion-calculator",
    category: "mechanical",
    name: "Shaft Torsion Calculator",
    title: "Shaft Torsion Calculator — Torque & Shear Stress | IngCalc",
    description:
      "Calculate shear stress in a solid round shaft from torque, or the torque capacity at an allowable stress. Power at 1750 RPM included for motor sizing.",
    summary:
      "Enter shaft diameter and torque to get surface shear stress (τ = Tr/J), or leave torque blank to size the shaft from an allowable stress.",
    keywords: ["shaft torsion calculator", "torsional stress", "torque capacity shaft", "shaft design calculator"],
    inputs: [
      { id: "diameter", label: "Shaft diameter", kind: "number", defaultValue: 20, min: 1, step: 1,
        unitOptions: [
          { value: "mm", label: "mm", factor: 1 },
          { value: "in", label: "inches (×25.4)", factor: 25.4 },
        ],
        defaultUnit: "mm" },
      { id: "torque", label: "Applied torque", kind: "number", unit: "N·m", defaultValue: 100, min: 0, step: 5, optional: true,
        help: "Leave blank to solve for the torque the shaft can carry at the allowable stress." },
      { id: "allowable", label: "Allowable shear stress", kind: "number", unit: "MPa", defaultValue: 100, min: 1, step: 5,
        help: "~40% of yield is a conservative machine-design default (mild steel ≈ 100 MPa)." },
    ],
    calc: shaftTorsion,
    formula: ["τ = T·r / J        J = π·d⁴ / 32", "T_capacity = τ_allow × J / r"],
    variables: [
      { symbol: "τ", meaning: "Shear stress at the outer surface", unit: "MPa" },
      { symbol: "T", meaning: "Torque", unit: "N·m" },
      { symbol: "J", meaning: "Polar moment of inertia", unit: "mm⁴" },
    ],
    howItWorks: [
      "Polar moment J = πd⁴/32 — diameter enters to the fourth power, so small diameter increases buy huge capacity.",
      "Surface shear stress follows τ = T·r/J; it scales linearly from zero at the center to maximum at the surface.",
      "With torque blank, the tool inverts the relation: the largest torque the allowable stress permits.",
    ],
    example:
      "A 20 mm shaft carrying 100 N·m: J = π × 0.02⁴/32 = 1.571e-8 m⁴. τ = 100 × 0.01 / 1.571e-8 = 63.7 MPa — under a 100 MPa allowable. Capacity at 100 MPa: 157 N·m ≈ 28.9 kW at 1750 RPM. A 25 mm shaft on the same torque: stress falls to 26.1 MPa — the d⁴ law at work.",
    interpretation:
      "The fourth-power diameter sensitivity is why shafts are cheap insurance: one size up roughly doubles torque capacity. Two practical deratings come before the theoretical number fails: keyways and shoulders concentrate stress (count on 60-80% of the theoretical capacity), and reversed or shock torsion needs a fatigue allowable well below the static one. Hollow shafts beat solid ones per kilogram — removing the lightly-stressed core barely reduces J.",
    assumptions: [
      "Solid circular shaft, linear-elastic, static torsion.",
      "No keyway, shoulder or hole stress concentrations applied.",
      "Allowable stress is user-set — typical machine-design practice is 40% of yield for static, less for fatigue.",
    ],
    limitations: [
      "Not valid for hollow shafts (use J = π(D⁴−d⁴)/32) or non-circular sections (warping complicates the math).",
      "Critical speeds, torsional vibration and combined bending+torque need full shaft design.",
    ],
    faqs: [
      {
        q: "What size shaft for a given torque?",
        a: "Solve d from τ = 16T/(πd³): d = (16T/πτ)^⅓. For 100 N·m at 100 MPa allowable: d ≈ 17 mm — choose 20 mm for margin and keyway effects.",
      },
      {
        q: "Why does diameter matter so much?",
        a: "Torque capacity scales with d³ (stress) or d⁴ (stiffness): material added at the outer surface, where stress is highest, works hardest. That's also why hollow shafts are efficient.",
      },
    ],
    references: [
      { label: "Shigley's Mechanical Engineering Design — shaft design chapter", url: "https://www.mheducation.com/" },
      { label: "Engineering ToolBox — torsion of shafts", url: "https://www.engineeringtoolbox.com/torsion-shafts-d_947.html" },
    ],
    related: ["torque-power-calculator", "cantilever-beam-calculator", "gear-ratio-calculator", "machine-efficiency-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
  {
    slug: "machine-efficiency-calculator",
    category: "mechanical",
    name: "Machine Efficiency Calculator",
    title: "Machine Efficiency Calculator — Input vs Output Power | IngCalc",
    description:
      "Calculate efficiency from measured input and output power, with the loss in watts that becomes heat. Motor load-point guidance included.",
    summary:
      "Enter input and output power to get efficiency percentage and the watts lost as heat — the number your cooling and energy bill both care about.",
    keywords: ["machine efficiency calculator", "motor efficiency", "efficiency formula", "power loss calculator"],
    inputs: [
      { id: "inputPower", label: "Input power", kind: "number", defaultValue: 1000, min: 0.1, step: 10,
        unitOptions: [
          { value: "W", label: "W", factor: 1 },
          { value: "kW", label: "kW", factor: 1000 },
          { value: "hp", label: "hp", factor: 746 },
        ],
        defaultUnit: "W" },
      { id: "outputPower", label: "Output power", kind: "number", defaultValue: 850, min: 0, step: 10,
        unitOptions: [
          { value: "W", label: "W", factor: 1 },
          { value: "kW", label: "kW", factor: 1000 },
          { value: "hp", label: "hp", factor: 746 },
        ],
        defaultUnit: "W" },
    ],
    calc: machineEfficiency,
    formula: ["η = P_out / P_in × 100%", "P_loss = P_in − P_out"],
    variables: [
      { symbol: "η", meaning: "Efficiency", unit: "%" },
      { symbol: "P_loss", meaning: "Power dissipated as heat", unit: "W" },
    ],
    howItWorks: [
      "Efficiency is the output-to-input ratio; the difference is loss, and every lost watt becomes heat inside or around the machine.",
      "The result is bounded: output above input is physically impossible and the calculator rejects it.",
      "Per-unit output normalizes the figure for comparing machines of different sizes.",
    ],
    example:
      "A motor drawing 1000 W while its dynamometer reads 850 W: η = 85%, losses = 150 W. That 150 W heats the winding — a fan-cooled motor at this load runs warm but fine; the same loss inside a sealed gearbox raises oil temperature 20-30 °C and shortens bearing grease life.",
    interpretation:
      "Efficiency is a load-point property, not a nameplate constant: motors peak near 75-100% load and can drop 10+ points below 50% load — oversized motors waste energy twice (poor efficiency and poor PF). Gear trains compound: two 97% meshes in series deliver 94%. When a machine runs hot, the loss figure tells you the heat load your cooling must remove — that is the engineering use of this number, not just the percentage.",
    assumptions: [
      "Steady-state power measurements at the same instant.",
      "Electrical input (W) or mechanical input — the ratio is unitless either way.",
    ],
    limitations: [
      "Measurement error matters: 5% instrument error on each side swings small efficiencies by double digits.",
      "For drives, add their losses: motor × gearbox × VFD efficiencies multiply.",
    ],
    faqs: [
      {
        q: "How is machine efficiency calculated?",
        a: "η = useful output ÷ total input, ×100%. A pump absorbing 5 kW and delivering 3.5 kW of hydraulic power runs at 70% — the 1.5 kW difference heats the water and the pump.",
      },
      {
        q: "Why do oversized motors waste energy?",
        a: "Motor efficiency peaks at 75-100% of rated load; below 50%, efficiency and power factor both sag while magnetizing current stays constant — you pay for copper and iron losses that don't scale down with the load.",
      },
    ],
    references: [
      { label: "DOE Motor System Master — efficiency and load factor", url: "https://www.energy.gov/eere/amo/motor-system-master" },
    ],
    related: ["power-from-force-calculator", "pump-power-calculator", "motor-current-calculator", "energy-cost-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
