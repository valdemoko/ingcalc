/**
 * Mechanical calculation engines. Pure functions.
 *
 * Models:
 * - Bolt torque: T = K · F · d with K = 0.2 (dry, lubricated threads vary — stated).
 * - Belt length: classical open-belt (V-belt) geometry equation.
 * - Tap drill: major diameter − pitch (metric), or major − 1/N (imperial).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Gear train: ratio, output speed and torque from driver/driven teeth. */
export function gearRatio(input: CalcInput): CalcOutput {
  const { values } = input;
  const driverTeeth = values.driverTeeth;
  const drivenTeeth = values.drivenTeeth;
  const inputRpm = values.inputRpm;
  const inputTorque = values.inputTorque;
  if (driverTeeth <= 0 || drivenTeeth <= 0) throw new Error("Tooth counts must be positive");

  const ratio = drivenTeeth / driverTeeth;
  const outputRpm = Number.isFinite(inputRpm) ? inputRpm / ratio : NaN;
  const outputTorque = Number.isFinite(inputTorque) && Number.isFinite(inputRpm) ? inputTorque * ratio * 0.97 : NaN; // 97% mesh efficiency

  return {
    rows: [
      { label: "Gear ratio", value: round(ratio, 4), unit: ":1", decimals: 4, primary: true, hint: "Driven ÷ driver teeth. >1 = reduction (slower, more torque)." },
      ...(Number.isFinite(outputRpm) ? [{ label: "Output speed", value: round(outputRpm, 1), unit: "RPM", decimals: 1, primary: true }] : []),
      ...(Number.isFinite(outputTorque) ? [{ label: "Output torque (97% eff.)", value: round(outputTorque, 2), unit: "N·m", decimals: 2 }] : []),
    ],
    notes: [
      "Ratio = N_driven / N_driver. Speed divides by the ratio; ideal torque multiplies by it.",
      "Torque output includes a 97% single-mesh efficiency estimate — real trains lose ~3% per mesh.",
      "For multi-stage trains, multiply stage ratios (use this tool per stage).",
    ],
  };
}

/** Torque ↔ power conversion with both metric and imperial units. */
export function torquePower(input: CalcInput): CalcOutput {
  const { values } = input;
  const torqueNm = values.torque;
  const rpm = values.rpm;
  if (torqueNm <= 0 || rpm <= 0) throw new Error("Torque and speed must be positive");

  const kw = (torqueNm * rpm) / 9549;
  const hp = kw * 1.34102;
  const lbft = torqueNm * 0.737562;

  return {
    rows: [
      { label: "Power", value: round(kw, 2), unit: "kW", decimals: 2, primary: true, hint: "P(kW) = T(N·m) × RPM / 9549." },
      { label: "Power (imperial)", value: round(hp, 2), unit: "hp", decimals: 2, primary: true },
      { label: "Torque (imperial)", value: round(lbft, 1), unit: "lb·ft", decimals: 1 },
    ],
    notes: ["Mechanical power only. Engine brake power differs by accessory and friction losses; shaft power excludes drivetrain losses."],
  };
}

/** Bolt torque to achieve a target preload: T = K · F · d. */
export function boltTorque(input: CalcInput): CalcOutput {
  const { values } = input;
  const diameterMm = values.diameter;
  const boltGrade = input.raw.grade ?? "8.8";
  const lubricated = input.raw.lube === "lubricated";
  const diameterIn = diameterMm / 25.4;
  if (diameterMm <= 0) throw new Error("Diameter must be positive");

  // Tensile stress area (approx., ISO 898): As ≈ 0.7854 · (d − 0.9382·P)²; use coarse pitch estimate.
  const coarsePitch: Record<number, number> = { 3: 0.5, 4: 0.7, 5: 0.8, 6: 1, 8: 1.25, 10: 1.5, 12: 1.75, 16: 2, 20: 2.5, 24: 3, 30: 3.5, 36: 4 };
  const pitch = coarsePitch[Math.round(diameterMm)] ?? Math.round(diameterMm * 0.125 * 100) / 100;
  const as = 0.7854 * Math.pow(diameterMm - 0.9382 * pitch, 2); // mm²
  const proofStress = { "4.6": 240, "5.8": 380, "8.8": 580, "10.9": 830, "12.9": 1100 }[boltGrade] ?? 580; // MPa
  const preloadN = 0.75 * proofStress * as; // 75% of proof load
  const k = lubricated ? 0.15 : 0.2;
  const torqueNm = k * preloadN * (diameterMm / 1000);

  return {
    rows: [
      { label: "Tightening torque", value: round(torqueNm, 1), unit: "N·m", decimals: 1, primary: true },
      { label: "Tightening torque (imperial)", value: round(torqueNm * 0.737562, 1), unit: "lb·ft", decimals: 1, primary: true },
      { label: "Bolt preload", value: round(preloadN / 1000, 1), unit: "kN", decimals: 1, hint: "75% of proof load for grade " + boltGrade },
      { label: "Tensile stress area", value: round(as, 1), unit: "mm²", decimals: 1 },
    ],
    notes: [
      "Model: T = K · F · d with K = 0.2 (dry) or 0.15 (lubricated). Real K varies 0.10–0.25 with thread finish and washer type.",
      `Coarse pitch assumed (${pitch} mm for M${Math.round(diameterMm)}). Fine threads have slightly larger stress area → higher torque.`,
      "Critical joints (gaskets, torque-to-yield) must follow the manufacturer specification, not this estimate.",
    ],
  };
}

/** Open belt (V-belt / flat belt) length from pulley diameters and center distance. */
export function beltLength(input: CalcInput): CalcOutput {
  const { values } = input;
  const d1 = values.d1;
  const d2 = values.d2;
  const cd = values.cd;
  if (d1 <= 0 || d2 <= 0 || cd <= 0) throw new Error("All dimensions must be positive");

  // L = 2C + π(D+d)/2 + (D−d)²/(4C)
  const lengthMm = 2 * cd + (Math.PI * (d2 + d1)) / 2 + Math.pow(d2 - d1, 2) / (4 * cd);
  const speedRatio = d2 / d1;

  return {
    rows: [
      { label: "Belt pitch length", value: round(lengthMm, 1), unit: "mm", decimals: 1, primary: true },
      { label: "Belt length (inches)", value: round(lengthMm / 25.4, 2), unit: "in", decimals: 2, primary: true },
      { label: "Speed ratio", value: round(speedRatio, 3), unit: ":1", decimals: 3, hint: "Driven ÷ driver diameter." },
    ],
    notes: [
      "Classical open-belt geometry: L = 2C + π(D+d)/2 + (D−d)²/(4C).",
      "For V-belts, use pitch diameters (not outer diameters). Order the nearest standard belt section length.",
    ],
  };
}

/** Tap drill size: metric (d − pitch) and unified (d − 1/N). */
export function tapDrill(input: CalcInput): CalcOutput {
  const { values } = input;
  const majorMm = values.major;
  const pitch = values.pitch;
  const threadPct = Math.min(100, Math.max(50, values.threadPct ?? 75));
  if (majorMm <= 0 || pitch <= 0) throw new Error("Diameter and pitch must be positive");

  // Standard 75% engagement: hole = d − p. Adjust linearly against that baseline:
  // drill = D − P × (target% / 75). Higher % → smaller hole → more engagement.
  const drill75 = majorMm - pitch;
  const drill = majorMm - pitch * (threadPct / 75);

  return {
    rows: [
      { label: `Tap drill (${threadPct}% thread)`, value: round(drill, 2), unit: "mm", decimals: 2, primary: true },
      { label: "Tap drill (standard 75%)", value: round(drill75, 2), unit: "mm", decimals: 2, primary: true, hint: "d − p, the standard recommendation." },
      { label: "Nearest drill bit", value: round(Math.ceil(drill75 * 4) / 4, 2), unit: "mm", decimals: 2, hint: "Rounded up to the next 0.25 mm bit." },
    ],
    notes: [
      "Metric formula: tap drill = major diameter − pitch. 75% thread is the standard strength/ease compromise.",
      "Higher thread % = stronger thread but more tapping torque and tap breakage risk in hard materials.",
      "For Unified threads in inches: drill (in) = major (in) − 1/threads-per-inch, for 75% thread.",
    ],
  };
}
