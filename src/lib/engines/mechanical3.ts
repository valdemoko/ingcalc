/**
 * Mechanical calculation engines — batch 3.
 * Pure functions. New calculators: cantilever beam (tip load), round shaft
 * torsion, machine efficiency (input vs output power).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/**
 * Cantilever beam with a point load at the free end (W-beam/Euler-Bernoulli).
 * Steel E = 200 GPa; rectangular section b tall × w wide, load at tip.
 * δ = P·L³/(3·E·I), σ = M·c/I with M = P·L and c = b/2.
 */
export function cantileverBeam(input: CalcInput): CalcOutput {
  const { values } = input;
  const loadN = values.load;
  const lengthM = values.length;
  const heightMm = values.height; // section depth (bending direction)
  const widthMm = values.width;
  if (loadN <= 0 || lengthM <= 0 || heightMm <= 0 || widthMm <= 0) {
    throw new Error("All values must be positive");
  }

  const E = 200e9; // Pa, structural steel
  const b = heightMm / 1000; // m (depth in bending direction)
  const w = widthMm / 1000; // m
  const I = (w * b * b * b) / 12; // m⁴ — second moment about the bending axis
  const c = b / 2; // extreme fiber distance, m

  const deflectionM = (loadN * Math.pow(lengthM, 3)) / (3 * E * I);
  const momentNm = loadN * lengthM;
  const stressMpa = (momentNm * c) / I / 1e6;

  // Typical structural steel yield 250 MPa (A36); warn approaching it.
  const util = stressMpa / 250;

  return {
    rows: [
      { label: "Tip deflection", value: round(deflectionM * 1000, 2), unit: "mm", decimals: 2, primary: true, hint: "δ = P·L³/(3·E·I), steel E = 200 GPa." },
      { label: "Max bending stress", value: round(stressMpa, 1), unit: "MPa", decimals: 1, primary: true, hint: `At the fixed end: σ = M·c/I with M = ${round(momentNm, 1)} N·m.` },
      { label: "Utilization vs 250 MPa yield", value: round(util * 100, 1), unit: "%", decimals: 1, hint: util > 0.6 ? "Approaching yield — check a bigger section or a support." : "Comfortable margin to typical steel yield." },
      { label: "Section moment of inertia", value: round(I * 1e12, 0), unit: "mm⁴", decimals: 0 },
    ],
    notes: [
      "Model: Euler-Bernoulli cantilever, rectangular section, point load at the free end. δ = P·L³/(3·E·I); σ = P·L·c/I.",
      "Depth enters I cubed — doubling the section depth cuts deflection 8×; width only linearly. Orient the deep way.",
      "Self-weight is not included; add it as an extra tip load (half the beam weight) for long spans.",
      "Stiffness check (deflection ≤ L/360 ≈ common serviceability limit) often governs before stress does.",
    ],
  };
}

/** Round solid shaft: torque from allowable shear stress, and stress from torque. */
export function shaftTorsion(input: CalcInput): CalcOutput {
  const { values } = input;
  const diameterMm = values.diameter;
  const torqueNm = values.torque;
  const allowMpa = values.allowable;
  if (diameterMm <= 0) throw new Error("Diameter must be positive");
  if (torqueNm < 0) throw new Error("Torque cannot be negative");

  const J = (Math.PI * Math.pow(diameterMm / 1000, 4)) / 32; // m⁴ polar moment
  const r = diameterMm / 2000; // m

  let stressMpa: number;
  if (torqueNm > 0) {
    stressMpa = (torqueNm * r) / J / 1e6;
    if (allowMpa > 0 && stressMpa > allowMpa) {
      throw new Error(`Shear stress ${round(stressMpa, 1)} MPa exceeds the allowable ${allowMpa} MPa — increase the diameter`);
    }
  } else {
    if (allowMpa <= 0) throw new Error("Enter a torque or an allowable shear stress");
    stressMpa = allowMpa; // solve torque for the allowable stress
  }

  const capacityNm = (allowMpa * 1e6 * J) / r;
  const powerKwAt1750 = (stressMpa === allowMpa && torqueNm === 0 ? capacityNm : torqueNm) * 1750 / 9549;

  return {
    rows: [
      { label: "Shear stress at surface", value: round(stressMpa, 1), unit: "MPa", decimals: 1, primary: true, hint: "τ = T·r/J (max at the outer surface)." },
      { label: "Torque capacity at allowable", value: round(capacityNm, 1), unit: "N·m", decimals: 1, primary: true, hint: `At τ_allow = ${allowMpa} MPa.` },
      { label: "Power at 1750 RPM", value: round(powerKwAt1750, 2), unit: "kW", decimals: 2, hint: "P = T × RPM / 9549 at typical motor speed." },
      { label: "Polar moment J", value: round(J * 1e12, 0), unit: "mm⁴", decimals: 0 },
    ],
    notes: [
      "Model: solid round shaft, τ = T·r/J with J = πd⁴/32. Torque capacity = τ_allow · J / r.",
      "Common allowable shear: 40% of yield is a conservative machine-design figure (e.g. ~100 MPa for mild steel).",
      "Solid shafts only — hollow shafts (J = π(D⁴−d⁴)/32) carry torque far more efficiently per kg.",
      "Stress concentration at keyways and shoulders reduces real capacity 20–40% — apply a suitable factor.",
    ],
  };
}

/** Machine efficiency from measured input and output power, with losses in watts. */
export function machineEfficiency(input: CalcInput): CalcOutput {
  const { values } = input;
  const inW = values.inputPower;
  const outW = values.outputPower;
  if (inW <= 0 || outW < 0) throw new Error("Invalid power values");
  if (outW > inW) throw new Error("Output exceeds input — check your measurements (efficiency cannot exceed 100%)");

  const eff = outW / inW;
  const lossW = inW - outW;

  return {
    rows: [
      { label: "Efficiency", value: round(eff * 100, 1), unit: "%", decimals: 1, primary: true },
      { label: "Power lost", value: round(lossW, 1), unit: "W", decimals: 1, primary: true, hint: "Turns into heat — this is what the cooling must remove." },
      { label: "Output for 1 kW in", value: round(eff * 1000, 0), unit: "W", decimals: 0 },
    ],
    notes: [
      "Model: η = P_out / P_in. Losses = P_in − P_out, all of it ending as heat.",
      "Motor efficiency peaks near 75–100% of rated load and falls steeply below 50% — an oversized motor wastes real money.",
      "Gearboxes lose ~2–3% per mesh, V-belt drives 3–5%, chains 2–4%: multiply stage efficiencies for a train.",
      "Compare machines at the same duty point; peak efficiencies at different loads are not comparable.",
    ],
  };
}
