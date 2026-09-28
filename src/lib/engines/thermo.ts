/**
 * Thermodynamics & heat transfer engines. Pure functions.
 * Sources: Fourier conduction; series thermal resistance (U-value);
 * ideal gas law; sensible heat Q = m·c·ΔT; latent heat of fusion/vaporization.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Heat flux through a multilayer wall (Fourier, series resistances). */
export function heatConduction(input: CalcInput): CalcOutput {
  const { values } = input;
  const areaM2 = values.area;
  const dT = values.deltaT;
  if (areaM2 <= 0) throw new Error("Area must be positive");
  if (dT === 0) throw new Error("Temperature difference cannot be zero");

  // Layers: optional three-layer construction, k in W/m·K, thickness in mm.
  const k1 = values.k1;
  const t1 = values.t1;
  const k2 = values.k2 ?? 0;
  const t2 = values.t2 ?? 0;
  const k3 = values.k3 ?? 0;
  const t3 = values.t3 ?? 0;
  if (k1 <= 0 || t1 <= 0) throw new Error("Layer 1 conductivity and thickness are required");

  let rTotal = t1 / 1000 / k1;
  if (k2 > 0 && t2 > 0) rTotal += t2 / 1000 / k2;
  if (k3 > 0 && t3 > 0) rTotal += t3 / 1000 / k3;

  const uValue = 1 / rTotal; // W/m²·K (conduction only — no surface films)
  const qW = uValue * areaM2 * dT;

  return {
    rows: [
      { label: "U-value (conduction)", value: round(uValue, 3), unit: "W/m²·K", decimals: 3, primary: true, hint: "No surface air films — a real wall U is lower." },
      { label: "R-value", value: round(rTotal * 5.678, 2), unit: "ft²·h·°F/BTU", decimals: 2, primary: true, hint: `SI: ${round(rTotal, 4)} m²·K/W.` },
      { label: "Heat flow", value: round(qW, 1), unit: "W", decimals: 1, primary: true, hint: `${round(qW * 3.412, 0)} BTU/h through ${round(areaM2, 1)} m².` },
      { label: "Flux", value: round(uValue * dT, 1), unit: "W/m²", decimals: 1 },
    ],
    notes: [
      "Model: Fourier conduction in series — R = Σ(t/k), U = 1/R, Q = U·A·ΔT.",
      "Real walls add outside/inside air films (R ≈ 0.12 + 0.08 m²·K/W) and thermal bridging at studs — real U ends 10–30% higher (worse).",
      "Typical k (W/m·K): mineral wool 0.035–0.040, EPS 0.035, concrete 1.7, brick 0.7, wood 0.13, glass 1.0.",
      "DeltaT drives everything linearly: doubling the temperature difference doubles the loss.",
    ],
  };
}

/** Linear thermal expansion of a solid between two temperatures. */
export function thermalExpansion(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthM = values.length;
  const dT = values.deltaT;
  const material = input.raw.material ?? "steel";
  if (lengthM <= 0) throw new Error("Length must be positive");

  // Linear expansion coefficients (1e-6 /°C) — room temperature values.
  const alpha: Record<string, number> = {
    steel: 12, stainless: 17.3, aluminum: 23.1, copper: 16.6, brass: 19,
    concrete: 10, glass: 9, pvc: 54, pe: 150, wood: 5,
  };
  const a = alpha[material];
  if (!a) throw new Error("Unknown material");

  const deltaM = a * 1e-6 * lengthM * dT;
  const deltaPct = (deltaM / lengthM) * 100;

  return {
    rows: [
      { label: "Length change", value: round(deltaM * 1000, 2), unit: "mm", decimals: 2, primary: true, hint: `α = ${a} ×10⁻⁶/°C.` },
      { label: "Length change", value: round(deltaM * 39.3701, 3), unit: "in", decimals: 3 },
      { label: "Change", value: round(deltaPct, 4), unit: "%", decimals: 4 },
    ],
    notes: [
      "Model: ΔL = α·L·ΔT with room-temperature linear expansion coefficients.",
      "Practical consequence: a 30 m steel pipe over a 50 °C swing moves 18 mm — expansion loops and guides exist because of this row.",
      "PVC moves 4.5× steel; PE 12× — plastic lines need far more room to grow.",
      "Coefficients vary a few percent with temperature and alloy; use datasheet values for precision work.",
    ],
  };
}

/** Ideal gas law: solve pressure, volume, moles or temperature (n fixed). */
export function idealGas(input: CalcInput): CalcOutput {
  const { values } = input;
  const R = 8.31446; // J/mol·K

  // Known exactly two of (pressure kPa, volume L, temperature K); n optional.
  const p = values.pressure; // kPa
  const v = values.volume; // L
  const t = values.temperature; // K
  const n = values.moles;

  const known = [p, v, t].filter((x) => Number.isFinite(x) && x > 0);
  if (known.length !== 2) throw new Error("Enter exactly two of pressure, volume, temperature");
  if (n !== undefined && n <= 0) throw new Error("Moles must be positive");

  let pOut: number, vOut: number, tOut: number, nOut: number;
  if (!Number.isFinite(p) || p <= 0) {
    // solve p = nRT/V
    nOut = n ?? 1;
    vOut = v!; tOut = t!;
    pOut = (nOut * R * tOut) / (vOut / 1000) / 1000;
  } else if (!Number.isFinite(v) || v <= 0) {
    nOut = n ?? 1;
    pOut = p!; tOut = t!;
    vOut = (nOut * R * tOut) / (pOut * 1000) * 1000;
  } else {
    nOut = n ?? 1;
    pOut = p!; vOut = v!;
    tOut = (pOut * 1000 * (vOut / 1000)) / (nOut * R);
  }

  return {
    rows: [
      { label: "Pressure", value: round(pOut, 2), unit: "kPa", decimals: 2, primary: true, hint: `${round(pOut / 101.325, 3)} atm · ${round(pOut * 0.145038, 2)} psi.` },
      { label: "Volume", value: round(vOut, 3), unit: "L", decimals: 3, primary: true },
      { label: "Temperature", value: round(tOut, 2), unit: "K", decimals: 2, hint: `${round(tOut - 273.15, 1)} °C.` },
      { label: "Moles", value: round(nOut, 3), unit: "mol", decimals: 3 },
    ],
    notes: [
      "Model: pV = nRT with R = 8.314 J/mol·K. If moles are blank, n = 1 mol is assumed so two knowns solve the third.",
      "Temperatures must be absolute (Kelvin) — the classic error is plugging °C into the ideal gas law.",
      "Ideal-gas accuracy: excellent for air and common gases at near-ambient conditions; real-gas corrections matter near condensation.",
      "Air behaves ideally across HVAC ranges; steam near saturation does not — use steam tables there.",
    ],
  };
}

/** Sensible heat to change a mass's temperature, plus water-phase latent heats. */
export function sensibleLatentHeat(input: CalcInput): CalcOutput {
  const { values } = input;
  const massKg = values.mass;
  const dT = values.deltaT;
  const material = input.raw.material ?? "water";
  if (massKg <= 0) throw new Error("Mass must be positive");

  // Specific heats kJ/kg·K
  const cp: Record<string, number> = {
    water: 4.186, air: 1.005, aluminum: 0.90, steel: 0.49, copper: 0.385, concrete: 0.88, oil: 1.97,
  };
  const c = cp[material];
  if (!c) throw new Error("Unknown material");
  if (dT === 0) throw new Error("Temperature difference cannot be zero");

  const qKj = massKg * c * dT;
  const kwh = qKj / 3600;

  // Latent reference for the same mass of water:
  const latentFusionKj = material === "water" ? massKg * 334 : NaN;
  const latentVapKj = material === "water" ? massKg * 2257 : NaN;

  return {
    rows: [
      { label: "Sensible heat", value: round(qKj, 1), unit: "kJ", decimals: 1, primary: true, hint: `Q = m·c·ΔT with c = ${c} kJ/kg·K (${round(kwh, 3)} kWh · ${round(qKj / 1.055, 0)} BTU).` },
      ...(material === "water"
        ? [{ label: "Latent heat to freeze it", value: round(latentFusionKj!, 0), unit: "kJ", decimals: 0, hint: "334 kJ/kg — the energy ice releases melting; ice is a storage medium." }]
        : []),
      ...(material === "water"
        ? [{ label: "Latent heat to boil it dry", value: round(latentVapKj!, 0), unit: "kJ", decimals: 0, hint: "2257 kJ/kg — 5.4× the energy to heat it from 0 to 100 °C." }]
        : []),
    ],
    notes: [
      "Model: Q = m·c·ΔT (no phase change). Specific heats at room temperature, pressure-independent for solids/liquids.",
      "Water's latent heats dwarf sensible heat: boiling dry a kg of water takes 5.4× the energy heating it from freezing to boiling.",
      "This asymmetry is why evaporative cooling, steam heating and condensing boilers work: phase changes move enormous heat at constant temperature.",
      "Air at 1.005 kJ/kg·K underlies the HVAC sensible equation: 1.08 factor = 0.075 lb/ft³ × 0.24 BTU/lb·°F × 60 min/h.",
    ],
  };
}

/** Power to heat a flow of fluid (kW from flow rate and ΔT) — the coil rating number. */
export function heatingPower(input: CalcInput): CalcOutput {
  const { values } = input;
  const flowLpm = values.flow;
  const dT = values.deltaT;
  const material = input.raw.fluid ?? "water";
  if (flowLpm <= 0) throw new Error("Flow must be positive");

  const cp: Record<string, number> = { water: 4.186, glycol30: 3.65, glycol50: 3.1, oil: 1.97 };
  const c = cp[material];
  if (!c) throw new Error("Unknown fluid");
  const density = material === "oil" ? 870 : material.startsWith("glycol") ? (material === "glycol30" ? 1038 : 1062) : 998;
  if (dT === 0) throw new Error("Temperature difference cannot be zero");

  const kw = (flowLpm / 60) * density * c * dT / 1000; // kg/s × kJ/kg·K × K = kW

  return {
    rows: [
      { label: "Heating/cooling power", value: round(kw, 2), unit: "kW", decimals: 2, primary: true, hint: `${round(kw * 3412, 0)} BTU/h · ${round(kw / 3.517, 2)} tons.` },
      { label: "Mass flow", value: round((flowLpm / 60) * density, 2), unit: "kg/s", decimals: 2 },
      { label: "Energy per hour", value: round(kw, 2), unit: "kWh", decimals: 2 },  // kW running 1 h
    ],
    notes: [
      "Model: Q = ṁ·c·ΔT — the rating equation for boilers, coils and chillers.",
      "The classic hydronic shortcut for water: kW ≈ flow(L/min) × ΔT(°C) ÷ 14.3.",
      "Glycol mixtures carry ~12–25% less heat per litre than water — pumps and coils must be resized when glycol is added.",
      "For chilled water, the same equation with the chiller's design ΔT (usually 5–6 °C) gives the tons figure.",
    ],
  };
}
