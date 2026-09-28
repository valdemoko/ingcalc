/**
 * Mechanical engines — batch 4. Pure functions.
 * New calculators: simply-supported beam (center point load), Hooke's law /
 * statics solver, power from force & velocity, pulley speed ratio solver.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Simply supported beam, point load at midspan (steel, rectangular section). */
export function simpleBeam(input: CalcInput): CalcOutput {
  const { values } = input;
  const loadN = values.load;
  const spanM = values.span;
  const heightMm = values.height;
  const widthMm = values.width;
  if (loadN <= 0 || spanM <= 0 || heightMm <= 0 || widthMm <= 0) {
    throw new Error("All values must be positive");
  }

  const E = 200e9; // Pa, steel
  const b = heightMm / 1000;
  const w = widthMm / 1000;
  const I = (w * b * b * b) / 12;
  const c = b / 2;

  const deflectionM = (loadN * Math.pow(spanM, 3)) / (48 * E * I);
  const maxM = (loadN * spanM) / 4; // midspan moment
  const stressMpa = (maxM * c) / I / 1e6;
  const reactions = loadN / 2;

  return {
    rows: [
      { label: "Midspan deflection", value: round(deflectionM * 1000, 2), unit: "mm", decimals: 2, primary: true, hint: "δ = P·L³/(48·E·I) — point load at center." },
      { label: "Max bending stress", value: round(stressMpa, 1), unit: "MPa", decimals: 1, primary: true, hint: `At midspan: M = P·L/4 = ${round(maxM, 1)} N·m.` },
      { label: "Support reactions", value: round(reactions, 0), unit: "N", decimals: 0, hint: "Half the load each — symmetry." },
      { label: "Utilization vs 250 MPa yield", value: round((stressMpa / 250) * 100, 1), unit: "%", decimals: 1 },
    ],
    notes: [
      "Model: Euler-Bernoulli simply supported beam, point load at midspan. δ = PL³/48EI; M = PL/4.",
      "Compare with the cantilever: same beam and load deflects 16× LESS when both ends are supported — support conditions dominate stiffness.",
      "Serviceability usually governs: L/360 deflection limits are common for floors and walkways.",
      "For distributed loads: δ = 5wL⁴/384EI and M = wL²/8 — a uniform load bends the beam less than a center point load of the same total.",
    ],
  };
}

/** Hooke's law solver: stress, strain, Young's modulus or elongation. */
export function hookeLaw(input: CalcInput): CalcOutput {
  const { values } = input;
  const forceN = values.force;
  const areaMm2 = values.area;
  const lengthMm = values.length;
  const elongationMm = values.elongation;
  if (forceN <= 0 || areaMm2 <= 0) throw new Error("Force and area must be positive");

  const stressMpa = forceN / areaMm2;

  if (Number.isFinite(elongationMm) && elongationMm > 0 && lengthMm > 0) {
    const strain = elongationMm / lengthMm;
    const eGpa = stressMpa / strain / 1000;
    return {
      rows: [
        { label: "Stress (σ)", value: round(stressMpa, 2), unit: "MPa", decimals: 2, primary: true, hint: "σ = F/A." },
        { label: "Strain (ε)", value: round(strain, 6), unit: "—", decimals: 6, primary: true, hint: "ε = ΔL/L." },
        { label: "Young's modulus (E)", value: round(eGpa, 1), unit: "GPa", decimals: 1, hint: "E = σ/ε — steel lands near 200 GPa if the material is steel." },
      ],
      notes: ["Model: σ = F/A, ε = ΔL/L, E = σ/ε (elastic range only).", "A measured E far from the material's datasheet value means the specimen slipped, the gauge was wrong, or yield was exceeded."],
    };
  }

  if (lengthMm <= 0) throw new Error("Enter specimen length (and elongation for strain)");
  const eGpa = values.modulus ?? 200; // default steel
  const strain = stressMpa / (eGpa * 1000);
  const dl = strain * lengthMm;

  return {
    rows: [
      { label: "Stress (σ)", value: round(stressMpa, 2), unit: "MPa", decimals: 2, primary: true, hint: "σ = F/A." },
      { label: "Strain (ε)", value: round(strain, 6), unit: "—", decimals: 6, primary: true, hint: `E = ${eGpa} GPa assumed.` },
      { label: "Elongation (ΔL)", value: round(dl, 3), unit: "mm", decimals: 3, primary: true, hint: `On a ${lengthMm} mm specimen.` },
    ],
    notes: [
      "Model: σ = F/A; strain from σ/ε with the material's E (steel 200 GPa default, aluminum 69, stainless 193).",
      "Valid only in the elastic range — beyond yield the linear relation breaks.",
      "Enter a measured elongation to have the tool compute the actual modulus instead.",
    ],
  };
}

/** Mechanical power from force and velocity (P = F·v), with imperial outputs. */
export function powerFromForce(input: CalcInput): CalcOutput {
  const { values } = input;
  const forceN = values.force;
  const velocityMs = values.velocity;
  if (forceN < 0 || velocityMs < 0) throw new Error("Force and velocity cannot be negative");

  const powerW = forceN * velocityMs;
  return {
    rows: [
      { label: "Power", value: round(powerW, 1), unit: "W", decimals: 1, primary: true, hint: "P = F × v." },
      { label: "Power", value: round(powerW / 1000, 3), unit: "kW", decimals: 3, primary: true },
      { label: "Power", value: round(powerW / 745.7, 3), unit: "hp", decimals: 3 },
    ],
    notes: [
      "Model: P = F·v — the linear-motion twin of P = T·ω for rotation.",
      "Conveyor example: 5 kN belt tension at 1.5 m/s needs 7.5 kW at the drive shaft (before reducer losses).",
      "For lifting: F includes gravity (m·g) — a 100 kg hoist load needs 981 N of force plus acceleration margin.",
    ],
  };
}

/** Pulley system: speed, torque and mechanical advantage from diameters or count. */
export function pulleySystem(input: CalcInput): CalcOutput {
  const { values } = input;
  const rpmIn = values.inputRpm;
  const torqueIn = values.inputTorque;
  const diaIn = values.driverDia;
  const diaOut = values.drivenDia;
  if (rpmIn < 0 || torqueIn < 0) throw new Error("RPM and torque cannot be negative");
  if (diaIn <= 0 || diaOut <= 0) throw new Error("Pulley diameters must be positive");

  const ratio = diaOut / diaIn;
  const rpmOut = rpmIn / ratio;
  const torqueOut = torqueIn * ratio * 0.95; // ~5% belt-drive loss
  const beltSpeedMs = (Math.PI * diaIn / 1000) * (rpmIn / 60);

  return {
    rows: [
      { label: "Speed ratio", value: round(ratio, 3), unit: ":1", decimals: 3, primary: true, hint: "Driven ÷ driver diameter." },
      { label: "Output speed", value: round(rpmOut, 1), unit: "RPM", decimals: 1, primary: true },
      ...(torqueIn > 0 ? [{ label: "Output torque (~95% eff.)", value: round(torqueOut, 2), unit: "N·m", decimals: 2 }] : []),
      { label: "Belt speed", value: round(beltSpeedMs, 2), unit: "m/s", decimals: 2, hint: "V-belts: keep below ~25–30 m/s." },
    ],
    notes: [
      "Model: n₂ = n₁·d₁/d₂; torque multiplies by the inverse ratio (belt ~95% efficient).",
      "Belt drives trade a few percent efficiency for quiet, overload-tolerant transmission — chains run ~2–4% loss, gears 2–3% per mesh.",
      "Use pitch diameters for calculations; outer diameter overstates the ratio on V-belts.",
    ],
  };
}
