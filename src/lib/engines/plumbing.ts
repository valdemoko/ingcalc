/**
 * Plumbing & hydraulics engines. Pure functions.
 * Water at 20 °C: ν = 1.0e-6 m²/s, ρ = 998 kg/m³.
 * Sources: Swamee-Jain friction factor; Darcy-Weisbach head loss.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

const NU_WATER = 1.0e-6; // m²/s kinematic viscosity at 20 °C
const G = 9.80665;

/** Flow velocity from flow rate and internal pipe diameter. */
export function pipeFlow(input: CalcInput): CalcOutput {
  const { values } = input;
  const flowLpm = values.flow; // L/min canonical
  const diaMm = values.diameter;
  if (flowLpm <= 0) throw new Error("Flow must be positive");
  if (diaMm <= 0) throw new Error("Diameter must be positive");

  const qM3s = flowLpm / 60000;
  const dM = diaMm / 1000;
  const area = (Math.PI * dM * dM) / 4;
  const v = qM3s / area; // m/s

  const guidance =
    v < 0.6 ? "Slow — sediment can settle (fine for drainage, low for supply)"
    : v <= 2.4 ? "Good supply velocity (typical design 0.6–2.4 m/s / 2–8 ft/s)"
    : v <= 3.0 ? "High — check noise and water hammer"
    : "Too fast — erosion-corrosion and hammer risk; go up a size";

  return {
    rows: [
      { label: "Velocity", value: round(v, 2), unit: "m/s", decimals: 2, primary: true, hint: guidance },
      { label: "Velocity", value: round(v * 3.28084, 1), unit: "ft/s", decimals: 1, primary: true },
      { label: "Flow", value: round(flowLpm * 0.264172, 1), unit: "gpm", decimals: 1 },
      { label: "Pipe area", value: round(area * 1e6, 1), unit: "mm²", decimals: 1 },
    ],
    notes: [
      "Model: V = Q/A with the pipe's INTERNAL diameter (schedule 40 walls reduce nominal bore).",
      "Cold-water supply design range: 0.6–2.4 m/s (2–8 ft/s). Hot water lower (~1.5 m/s) to limit erosion.",
      "Above ~3 m/s in copper, erosion-corrosion shortens pipe life; noise complaints start around 2.5 m/s.",
    ],
  };
}

/** Darcy-Weisbach head loss and pressure drop with the Swamee-Jain friction factor. */
export function pipePressureDrop(input: CalcInput): CalcOutput {
  const { values } = input;
  const flowLpm = values.flow;
  const diaMm = values.diameter;
  const lengthM = values.length;
  const roughMm = values.roughness;
  if (flowLpm <= 0 || diaMm <= 0 || lengthM <= 0) throw new Error("All values must be positive");
  if (roughMm < 0) throw new Error("Roughness cannot be negative");

  const qM3s = flowLpm / 60000;
  const dM = diaMm / 1000;
  const v = qM3s / ((Math.PI * dM * dM) / 4);
  const re = (v * dM) / NU_WATER;

  let f: number;
  if (re < 2300) {
    f = 64 / Math.max(re, 1); // laminar
  } else {
    // Swamee-Jain (explicit, accurate ~1% vs Colebrook for turbulent water mains)
    const relRough = roughMm / diaMm;
    f = 0.25 / Math.pow(Math.log10(relRough / 3.7 + 5.74 / Math.pow(re, 0.9)), 2);
  }

  const headLossM = f * (lengthM / dM) * (v * v) / (2 * G);
  const pressureKpa = headLossM * 998 * G / 1000; // ρgh

  return {
    rows: [
      { label: "Head loss", value: round(headLossM, 3), unit: "m", decimals: 3, primary: true, hint: "Darcy-Weisbach: h = f·(L/D)·V²/2g." },
      { label: "Pressure drop", value: round(pressureKpa, 1), unit: "kPa", decimals: 1, primary: true, hint: `${round(pressureKpa * 0.145038, 1)} psi · ${round(headLossM / 10.2, 3)} bar.` },
      { label: "Velocity", value: round(v, 2), unit: "m/s", decimals: 2 },
      { label: "Friction factor / Reynolds", value: round(f, 4), unit: "—", decimals: 4, hint: `Re = ${Math.round(re)} (${re < 2300 ? "laminar" : "turbulent"}).` },
    ],
    notes: [
      "Model: Darcy-Weisbach with the Swamee-Jain explicit friction factor (turbulent) or 64/Re (laminar). Water at 20 °C.",
      "Roughness: copper/PEX ≈ 0.0015 mm, new steel ≈ 0.045 mm, old steel ≈ 1 mm+ — aging steel loses capacity fast.",
      "Fittings add equivalent length or minor losses — count 20–50% extra on fitting-heavy runs.",
      "This is straight-pipe friction only: elevation change and fixture pressures are separate.",
    ],
  };
}

/** Smallest standard pipe internal diameter meeting a velocity limit. */
export function pipeSize(input: CalcInput): CalcOutput {
  const { values } = input;
  const flowLpm = values.flow;
  const maxVMs = values.maxVelocity;
  if (flowLpm <= 0) throw new Error("Flow must be positive");
  if (maxVMs < 0.3 || maxVMs > 5) throw new Error("Velocity limit must be between 0.3 and 5 m/s");

  const qM3s = flowLpm / 60000;
  const dMinM = Math.sqrt(4 * qM3s / (Math.PI * maxVMs));
  const dMinMm = dMinM * 1000;

  // Common nominal sizes (internal diameters, mm — sch 40 approx / metric trade sizes)
  const standards = [8, 10, 12, 15, 20, 25, 32, 40, 50, 65, 80, 100, 125, 150];
  const picked = standards.find((s) => s >= dMinMm) ?? Math.ceil(dMinMm);
  const vActual = qM3s / ((Math.PI * Math.pow(picked / 1000, 2)) / 4);

  return {
    rows: [
      { label: "Minimum internal diameter", value: round(dMinMm, 1), unit: "mm", decimals: 1, primary: true },
      { label: "Next standard size", value: picked, unit: "mm", decimals: 0, primary: true, hint: `Actual velocity ${round(vActual, 2)} m/s.` },
      { label: "Velocity at picked size", value: round(vActual * 3.28084, 1), unit: "ft/s", decimals: 1 },
    ],
    notes: [
      "Model: D = √(4Q/πV_limit), snapped up to the next standard trade size.",
      "Supply sizing also needs fixture-unit demand (probable simultaneous flow), not just peak flow — size branches from the load calculation.",
      "Velocity limits: supply 0.6–2.4 m/s; hot water ≤ 1.5 m/s; suction lines of pumps ≤ 1.2 m/s to avoid cavitation.",
    ],
  };
}

/** Water volume contained in a pipe run. */
export function pipeVolume(input: CalcInput): CalcOutput {
  const { values } = input;
  const diaMm = values.diameter;
  const lengthM = values.length;
  if (diaMm <= 0 || lengthM <= 0) throw new Error("Diameter and length must be positive");

  const liters = (Math.PI * Math.pow(diaMm / 2000, 2) * lengthM) * 1000;
  const gallons = liters * 0.264172;
  const weightKg = liters * 0.998;

  return {
    rows: [
      { label: "Water volume", value: round(liters, 2), unit: "L", decimals: 2, primary: true },
      { label: "Water volume", value: round(gallons, 2), unit: "gal", decimals: 2, primary: true },
      { label: "Water weight", value: round(weightKg, 2), unit: "kg", decimals: 2, hint: `${round(weightKg * 2.20462, 1)} lb — matters for hangers on long runs.` },
      { label: "Volume per 100 m", value: round(liters * 100 / Math.max(lengthM, 0.01), 1), unit: "L", decimals: 1 },
    ],
    notes: [
      "Model: V = π/4 · d² · L with internal diameter. A 1/2 in nominal pipe (~15 mm ID) holds 0.18 L/m.",
      "Used for disinfection/flushing volumes, glycol batch mixing, and dead-leg water waste calculations.",
      "Hot-water recirculation design starts from this number: dead volume is the water you run off before heat arrives.",
    ],
  };
}

/** Tank capacity from shape and dimensions. */
export function tankVolume(input: CalcInput): CalcOutput {
  const { values } = input;
  const shape = input.raw.shape ?? "cylinder";
  let liters: number;
  if (shape === "cylinder") {
    const dMm = values.diameter;
    const hMm = values.height;
    if (!(dMm > 0 && hMm > 0)) throw new Error("Diameter and height must be positive");
    liters = Math.PI * Math.pow(dMm / 2000, 2) * (hMm / 1000) * 1000;
  } else {
    const lMm = values.length;
    const wMm = values.width;
    const hMm = values.height;
    if (!(lMm > 0 && wMm > 0 && hMm > 0)) throw new Error("Length, width and height must be positive");
    liters = (lMm / 1000) * (wMm / 1000) * (hMm / 1000) * 1000;
  }

  return {
    rows: [
      { label: "Capacity", value: round(liters, 1), unit: "L", decimals: 1, primary: true },
      { label: "Capacity", value: round(liters * 0.264172, 1), unit: "gal", decimals: 1, primary: true },
      { label: "Capacity (US oil barrels)", value: round(liters * 0.0062898, 2), unit: "bbl", decimals: 2 },
      { label: "Water weight (full)", value: round(liters, 0), unit: "kg", decimals: 0, hint: "1 L ≈ 1 kg — check floor/foundation loading." },
    ],
    notes: [
      "Model: cylinder π/4·d²·h; rectangular L·W·H. Internal dimensions — wall thickness excluded.",
      "Usable capacity is less than brim: freeboard, outlet height and pump suction limits set the real working volume.",
      "A full IBC tote (1000 L) weighs a tonne: verify floor loading for indoor tanks.",
    ],
  };
}
