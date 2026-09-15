/**
 * Electrical calculation engines — batch 2.
 * Pure functions. New calculators: resistance (solver), energy cost, transformer
 * sizing, 3-phase power, voltage divider, wire color code, LED resistor, EV charge,
 * generator sizing, derating, breaker sizing, cable EMI/inductance reference.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";
import { COPPER_WIRES, getWire } from "./electrical";

/** Wire resistance from material + geometry (length in ft, area in circular mils). */
export function wireResistance(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthFt = values.length;
  const awg = input.raw.wire ?? "12 AWG";
  const material = input.raw.material ?? "copper";
  const wire = getWire(awg);
  if (!wire) throw new Error("Unknown wire size");
  if (lengthFt < 0) throw new Error("Length cannot be negative");

  const rhoFactor = material === "aluminum" ? 1.64 : 1; // Al ≈ 61% more resistance than Cu
  const pathFt = 2 * lengthFt; // out-and-back
  const ohms = (wire.ohmsPerKft * rhoFactor * pathFt) / 1000;
  const ohmsM = (wire.ohmsPerKft * rhoFactor) / 3.28084 / 1000; // per meter

  return {
    rows: [
      { label: "Resistance (round trip)", value: ohms, unit: "Ω", decimals: 4, primary: true, hint: `${lengthFt} ft out and back, at 75 °C.` },
      { label: "Resistance per 1000 ft", value: wire.ohmsPerKft * rhoFactor, unit: "Ω/kft", decimals: 4 },
      { label: "Resistance per meter", value: ohmsM, unit: "Ω/m", decimals: 5 },
      { label: "Cross-section", value: wire.mm2, unit: "mm²", decimals: 2 },
    ],
    notes: [
      `Material: ${material === "aluminum" ? "aluminum (ρ multiplier 1.64 vs copper)" : "uncoated copper"} at 75 °C, from NEC Chapter 9 Table 8.`,
      "Round-trip = twice the one-way length (both conductors carry current).",
      "DC resistance; AC adds a small skin-effect and reactance penalty at larger sizes.",
    ],
  };
}

/** Energy cost from power, hours and electricity rate. */
export function energyCost(input: CalcInput): CalcOutput {
  const { values } = input;
  const watts = values.watts;
  const hours = values.hours;
  const rate = values.rate;
  const qty = values.quantity ?? 1;
  if (watts <= 0 || hours < 0 || rate < 0) throw new Error("Invalid inputs");

  const kwhDay = (watts * qty * hours) / 1000;
  const kwhMonth = kwhDay * 30.44;
  const kwhYear = kwhDay * 365;
  const costDay = kwhDay * rate;
  const costMonth = kwhMonth * rate;
  const costYear = kwhYear * rate;

  return {
    rows: [
      { label: "Energy per day", value: round(kwhDay, 3), unit: "kWh", decimals: 3 },
      { label: "Energy per month", value: round(kwhMonth, 2), unit: "kWh", decimals: 2 },
      { label: "Energy per year", value: round(kwhYear, 1), unit: "kWh", decimals: 1 },
      { label: "Cost per day", value: costDay, unit: "$", decimals: 2 },
      { label: "Cost per month", value: costMonth, unit: "$", decimals: 2, primary: true },
      { label: "Cost per year", value: costYear, unit: "$", decimals: 2, primary: true },
    ],
    notes: [
      "Model: kWh = W × hours ÷ 1000; cost = kWh × rate. Month = 30.44 days, year = 365 days.",
      "Use the actual device wattage (nameplate or metered), not the PSU rating for computers.",
      "Utilities with tiered or time-of-use pricing need an average rate to be accurate.",
    ],
  };
}

/** Transformer sizing: load → required kVA, with 20% design margin and primary/secondary currents. */
export function transformerSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const loadKw = values.loadKw;
  const pf = values.pf;
  const primaryV = values.primaryV;
  const secondaryV = values.secondaryV;
  const margin = values.margin;
  if (loadKw <= 0 || pf <= 0 || pf > 1) throw new Error("Invalid load or power factor");
  if (primaryV <= 0 || secondaryV <= 0) throw new Error("Voltages must be positive");
  if (margin < 0 || margin > 1) throw new Error("Margin must be between 0 and 1");

  const loadKva = loadKw / pf;
  const requiredKva = loadKva * (1 + margin);
  const primaryA = (requiredKva * 1000) / primaryV;
  const secondaryA = (requiredKva * 1000) / secondaryV;

  return {
    rows: [
      { label: "Load apparent power", value: round(loadKva, 2), unit: "kVA", decimals: 2 },
      { label: "Required transformer (with margin)", value: round(requiredKva, 1), unit: "kVA", decimals: 1, primary: true, hint: "Round up to the next standard kVA rating." },
      { label: "Primary current", value: round(primaryA, 1), unit: "A", decimals: 1 },
      { label: "Secondary current", value: round(secondaryA, 1), unit: "A", decimals: 1, primary: true },
    ],
    notes: [
      `Model: kVA = kW ÷ PF, then × (1 + margin). Margin used: ${Math.round(margin * 100)}% (NEC 215.2 continuous-load practice uses 25%).`,
      "Standard single-phase sizes: 0.25, 0.5, 1, 2, 3, 5, 7.5, 10, 15, 25, 37.5, 50, 75, 100 kVA.",
      "Secondary overcurrent protection is typically sized at 125% of secondary rated current (NEC 450.3(B)).",
    ],
  };
}

/** Three-phase power from line voltage and current, with PF and kW/kVA/kVAR. */
export function threePhasePower(input: CalcInput): CalcOutput {
  const { values } = input;
  const voltage = values.voltage;
  const current = values.current;
  const pf = values.pf;
  if (voltage <= 0 || current < 0 || pf <= 0 || pf > 1) throw new Error("Invalid inputs");

  const kva = (Math.sqrt(3) * voltage * current) / 1000;
  const kw = kva * pf;
  const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));

  return {
    rows: [
      { label: "Real power", value: round(kw, 2), unit: "kW", decimals: 2, primary: true, hint: "P = √3 × V × I × PF / 1000." },
      { label: "Apparent power", value: round(kva, 2), unit: "kVA", decimals: 2 },
      { label: "Reactive power", value: round(kvar, 2), unit: "kVAR", decimals: 2, hint: "From the power triangle." },
    ],
    notes: [
      "Balanced three-phase load, line-to-line voltage. For line-to-neutral use V × 3 in the formula (√3 × V_LN = V_LL when balanced).",
      "Power factor 1.0 = purely resistive; motors typically 0.8–0.9 at full load, less at part load.",
    ],
  };
}

/** Voltage divider (resistive): Vout and resistor dissipation. */
export function voltageDivider(input: CalcInput): CalcOutput {
  const { values } = input;
  const vin = values.vin;
  const r1 = values.r1;
  const r2 = values.r2;
  if (vin <= 0) throw new Error("Input voltage must be positive");
  if (r1 <= 0 || r2 <= 0) throw new Error("Resistances must be positive");

  const vout = vin * (r2 / (r1 + r2));
  const current = vin / (r1 + r2);
  const p1 = current * current * r1;
  const p2 = current * current * r2;

  return {
    rows: [
      { label: "Output voltage", value: round(vout, 4), unit: "V", decimals: 4, primary: true, hint: "Vout = Vin × R2/(R1+R2)." },
      { label: "Divider current", value: current * 1000, unit: "mA", decimals: 3 },
      { label: "Power in R1", value: p1 * 1000, unit: "mW", decimals: 3, hint: "Both resistors should be rated ≥ 2× this." },
      { label: "Power in R2", value: p2 * 1000, unit: "mW", decimals: 3 },
    ],
    notes: [
      "Resistive divider: unloaded, DC or low-frequency. Any load on the output reduces Vout.",
      "For signal-level work, keep divider current ≥ 10× the load current for stiffness.",
      "High-impedance loads (ADC inputs) need a buffer or the divider resistance must account for the load.",
    ],
  };
}

/** Resistor color code decoder (4-band). */
const COLOR_DIGITS: Record<string, { digit?: number; multiplier?: number; tol?: number }> = {
  black: { digit: 0, multiplier: 1 },
  brown: { digit: 1, multiplier: 10, tol: 1 },
  red: { digit: 2, multiplier: 100, tol: 2 },
  orange: { digit: 3, multiplier: 1000 },
  yellow: { digit: 4, multiplier: 10000 },
  green: { digit: 5, multiplier: 100000, tol: 0.5 },
  blue: { digit: 6, multiplier: 1000000, tol: 0.25 },
  violet: { digit: 7, multiplier: 10000000, tol: 0.1 },
  grey: { digit: 8, multiplier: 100000000 },
  white: { digit: 9, multiplier: 1000000000 },
  gold: { multiplier: 0.1, tol: 5 },
  silver: { multiplier: 0.01, tol: 10 },
};

export function resistorColorCode(input: CalcInput): CalcOutput {
  const b1 = input.raw.band1 ?? "brown";
  const b2 = input.raw.band2 ?? "black";
  const b3 = input.raw.multiplier ?? "red";
  const b4 = input.raw.tolerance ?? "gold";
  const d1 = COLOR_DIGITS[b1]?.digit;
  const d2 = COLOR_DIGITS[b2]?.digit;
  const mult = COLOR_DIGITS[b3]?.multiplier;
  const tol = COLOR_DIGITS[b4]?.tol;
  if (d1 === undefined || d2 === undefined || mult === undefined) throw new Error("Invalid band colors");

  const value = (d1 * 10 + d2) * mult;
  const tolPct = tol ?? 20;
  const min = value * (1 - tolPct / 100);
  const max = value * (1 + tolPct / 100);

  return {
    rows: [
      { label: "Resistance", value: value, unit: "Ω", decimals: 2, primary: true, hint: `${b1} ${b2} × ${b3}, ±${tolPct}%.` },
      { label: "Minimum", value: min, unit: "Ω", decimals: 2 },
      { label: "Maximum", value: max, unit: "Ω", decimals: 2 },
    ],
    notes: [
      "4-band scheme: two significant digits, multiplier, tolerance. Band 1 is the one nearest an end.",
      "5-band (precision) resistors add a third significant digit band — read those with a 5-band chart.",
    ],
  };
}

/** Series/parallel LED resistor sizing. */
export function ledResistor(input: CalcInput): CalcOutput {
  const { values } = input;
  const vin = values.vin;
  const vf = values.vf;
  const iLed = values.iLed; // mA canonical
  const count = values.count;
  const wiring = input.raw.wiring ?? "series";
  if (vin <= 0 || iLed <= 0) throw new Error("Invalid inputs");
  if (count <= 0) throw new Error("LED count must be positive");

  let vDropNeeded: number;
  if (wiring === "series") {
    vDropNeeded = vin - vf * count;
    if (vDropNeeded <= 0) throw new Error(`Supply too low for ${count} LEDs in series (needs ${(vf * count).toFixed(2)} V)`);
  } else {
    vDropNeeded = vin - vf;
    if (vDropNeeded <= 0) throw new Error("Supply must exceed LED forward voltage");
  }
  const iA = iLed / 1000;
  const resistor = vDropNeeded / iA;
  const power = vDropNeeded * iA;

  return {
    rows: [
      { label: "Resistor value", value: resistor, unit: "Ω", decimals: 1, primary: true, hint: `Nearest standard E12 values: ${nearestE12(resistor).join(" or ")} Ω.` },
      { label: "Resistor power", value: power * 1000, unit: "mW", decimals: 1, primary: true, hint: "Use a resistor rated at least 2× this." },
      { label: "Resistor voltage drop", value: vDropNeeded, unit: "V", decimals: 2 },
      { label: "Circuit current", value: iLed, unit: "mA", decimals: 1 },
    ],
    notes: [
      wiring === "series"
        ? "Series string: one resistor, one current. Resistor = (Vin − n×Vf) / I."
        : "Parallel wiring per LED: one resistor per LED (never share resistors across parallel LEDs).",
      "Standard indicator Vf: red ≈ 1.8–2.0 V, green/yellow ≈ 2.0–2.2 V, blue/white ≈ 3.0–3.4 V — check the datasheet.",
      "For power LEDs (>350 mA) use a constant-current driver, not a resistor.",
    ],
  };
}

function nearestE12(r: number): number[] {
  const e12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  const decade = Math.pow(10, Math.floor(Math.log10(r)));
  const candidates = e12.flatMap((b) => [b * decade, b * decade * 10]);
  const sorted = candidates.filter((c) => c >= r * 0.5 && c <= r * 2).sort((a, b) => Math.abs(a - r) - Math.abs(b - r));
  return sorted.slice(0, 2).map((v) => round(v, 1));
}

/** EV charging time from battery kWh and charger kW, with efficiency. */
export function evChargeTime(input: CalcInput): CalcOutput {
  const { values } = input;
  const batteryKwh = values.batteryKwh;
  const chargerKw = values.chargerKw;
  const fromPct = values.fromPct;
  const toPct = values.toPct;
  const eff = values.eff;
  if (batteryKwh <= 0 || chargerKw <= 0) throw new Error("Invalid inputs");
  if (fromPct < 0 || toPct > 100 || toPct <= fromPct) throw new Error("Charge window must be 0-100 and increasing");
  if (eff <= 0 || eff > 1) throw new Error("Efficiency must be between 0 and 1");

  const energyKwh = batteryKwh * ((toPct - fromPct) / 100) / eff;
  const hours = energyKwh / chargerKw;
  const miles = values.efficiencyMiKwh > 0 ? (energyKwh * eff * values.efficiencyMiKwh) : NaN;
  const cost = values.rate > 0 ? energyKwh * values.rate : NaN;

  return {
    rows: [
      { label: "Charging time", value: round(hours, 2), unit: "hours", decimals: 2, primary: true, hint: `${round(fromPct)}% → ${round(toPct)}% at ${chargerKw} kW.` },
      { label: "Energy delivered to battery", value: round(energyKwh * eff, 2), unit: "kWh", decimals: 2 },
      { label: "Energy drawn from the grid", value: round(energyKwh, 2), unit: "kWh", decimals: 2, hint: `Includes ${Math.round((1 - eff) * 100)}% charging losses.` },
      ...(Number.isFinite(miles) ? [{ label: "Range added (est.)", value: round(miles, 0), unit: "mi", decimals: 0 }] : []),
      ...(Number.isFinite(cost) ? [{ label: "Charging cost", value: round(cost, 2), unit: "$", decimals: 2 }] : []),
    ],
    notes: [
      "Model: time = (battery kWh × charge window) ÷ (charger kW × efficiency).",
      "Charging slows dramatically above ~80% SOC (taper) — 10–80% is much faster than 80–100%.",
      "Typical efficiencies: Level 1/2 ~85–90% on-board AC charging; DC fast charging ~92–95%.",
    ],
  };
}

/** Generator sizing from running and starting (surge) loads. */
export function generatorSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const runningW = values.runningW;
  const surgeW = values.surgeW;
  if (runningW <= 0) throw new Error("Running load must be positive");

  const withMargin = runningW * 1.25;
  const required = Math.max(withMargin, surgeW);
  const kw = required / 1000;

  return {
    rows: [
      { label: "Minimum generator size", value: round(kw, 1), unit: "kW", decimals: 1, primary: true, hint: "The larger of running × 1.25 and the surge requirement." },
      { label: "Running load with margin", value: round(withMargin / 1000, 2), unit: "kW", decimals: 2 },
      ...(surgeW > 0 ? [{ label: "Surge requirement", value: round(surgeW / 1000, 2), unit: "kW", decimals: 2, hint: "Motor starting can draw 2–3× running power." }] : []),
    ],
    notes: [
      "Model: size = max(running × 1.25, surge). The 1.25 margin follows continuous-load practice and keeps the unit out of overload.",
      "Induction motors draw high starting current; compressor and pump loads dominate surge sizing.",
      "Inverter generators handle electronics better; conventional units are fine for resistive and motor loads.",
    ],
  };
}

/** Conductor derating for fill, ambient temperature and conductor count. */
export function deratingCalc(input: CalcInput): CalcOutput {
  const { values } = input;
  const baseAmpacity = values.baseAmpacity;
  const ambientC = values.ambientC;
  const conductors = values.conductors;
  if (baseAmpacity <= 0) throw new Error("Base ampacity must be positive");
  if (ambientC < 0) throw new Error("Ambient temperature must be positive");
  if (conductors < 1) throw new Error("Conductor count must be at least 1");

  // NEC Table 310.15(B)(1) correction factors, 75 °C conductor column.
  let tempFactor = 1;
  if (ambientC > 76) tempFactor = 0.29;
  else if (ambientC > 71) tempFactor = 0.41;
  else if (ambientC > 66) tempFactor = 0.5;
  else if (ambientC > 61) tempFactor = 0.58;
  else if (ambientC > 56) tempFactor = 0.65;
  else if (ambientC > 51) tempFactor = 0.71;
  else if (ambientC > 46) tempFactor = 0.75;
  else if (ambientC > 41) tempFactor = 0.82;
  else if (ambientC > 36) tempFactor = 0.88;
  else if (ambientC > 31) tempFactor = 0.94;
  else if (ambientC > 26) tempFactor = 1.0;
  else if (ambientC > 21) tempFactor = 1.05;
  else if (ambientC > 16) tempFactor = 1.08;
  else if (ambientC > 11) tempFactor = 1.12;
  else if (ambientC > 6) tempFactor = 1.15;
  else tempFactor = 1.18;

  // NEC Table 310.15(C)(1) adjustment for >3 current-carrying conductors.
  let fillFactor = 1;
  const n = Math.round(conductors);
  if (n > 3) {
    if (n <= 6) fillFactor = 0.8;
    else if (n <= 9) fillFactor = 0.7;
    else if (n <= 20) fillFactor = 0.5;
    else if (n <= 30) fillFactor = 0.45;
    else if (n <= 40) fillFactor = 0.4;
    else fillFactor = 0.35;
  }

  const derated = baseAmpacity * tempFactor * fillFactor;

  return {
    rows: [
      { label: "Effective ampacity", value: round(derated, 1), unit: "A", decimals: 1, primary: true, hint: `${baseAmpacity} A × ${tempFactor} (temp) × ${fillFactor} (fill).` },
      { label: "Temperature factor", value: tempFactor, unit: "×", decimals: 2, hint: `NEC 310.15(B)(1) at ${ambientC} °C ambient, 75 °C conductor.` },
      { label: "Fill adjustment", value: fillFactor, unit: "×", decimals: 2, hint: `NEC 310.15(C)(1) for ${n} current-carrying conductors.` },
    ],
    notes: [
      "Model: derated ampacity = table ampacity × temperature correction × fill adjustment (NEC 310.15 methodology, 75 °C ratings).",
      "Factors compound: 12 conductors at 40 °C ambient lose roughly half the table ampacity.",
      "Neutral conductors only count when carrying significant harmonic current; equipment grounds never count.",
    ],
  };
}

/** Breaker/fuse sizing for a load (non-continuous or continuous 125%). */
export function breakerSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const loadA = values.loadA;
  const continuous = input.raw.continuous ?? "no";
  if (loadA <= 0) throw new Error("Load current must be positive");

  const designA = continuous === "yes" ? loadA * 1.25 : loadA;
  const standard = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400];
  const next = standard.find((s) => s >= designA) ?? designA;

  return {
    rows: [
      { label: "Design current", value: round(designA, 1), unit: "A", decimals: 1, hint: continuous === "yes" ? "Load × 1.25 for continuous operation (NEC 210.20(A))." : "Load as entered." },
      { label: "Next standard breaker", value: next, unit: "A", decimals: 0, primary: true },
      { label: "Minimum conductor ampacity", value: round(designA, 1), unit: "A", decimals: 1, primary: true, hint: "Conductor must have ampacity ≥ design current (after derating)." },
    ],
    notes: [
      "Model: design = load × 1.25 when the load runs 3+ hours continuously (NEC 210.20(A)), then round up to the next standard rating.",
      "The next-size-up rule (240.4(B)) allows rounding up when the rating ≤ 800 A and no standard size fits — subject to its conditions.",
      "Motor circuits use separate rules (NEC 430): breaker can be 2.5× FLC for inverse-time breakers.",
    ],
  };
}

/** Cable inductance/reactance estimate (single-phase, non-magnetic conduit). */
export function cableReactance(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthFt = values.length;
  const current = values.current;
  const awg = input.raw.wire ?? "4/0 AWG";
  const wire = getWire(awg);
  if (!wire) throw new Error("Unknown wire size");
  if (lengthFt < 0 || current < 0) throw new Error("Invalid inputs");

  // Approximate reactance for conductors ≥ 1/0 in non-magnetic conduit (NEC Ch.9 Table 9): ~0.048 Ω/1000 ft.
  const xlPerKft = 0.048;
  const xl = (xlPerKft * 2 * lengthFt) / 1000;
  const r = (wire.ohmsPerKft * 2 * lengthFt) / 1000;
  const z = Math.sqrt(r * r + xl * xl);
  const vd = current * z;

  return {
    rows: [
      { label: "Resistance (round trip)", value: r, unit: "Ω", decimals: 4 },
      { label: "Reactance (round trip)", value: xl, unit: "Ω", decimals: 4 },
      { label: "Impedance", value: z, unit: "Ω", decimals: 4 },
      { label: "AC voltage drop", value: vd, unit: "V", decimals: 3, primary: true, hint: "I × Z — reactance matters more as conductors get larger." },
    ],
    notes: [
      "Reactance ≈ 0.048 Ω/1000 ft is the NEC Chapter 9 Table 9 value for large copper conductors in non-magnetic conduit (60 Hz).",
      "For conductors below 1/0 AWG the resistance dominates and this correction is negligible — use the voltage-drop calculator instead.",
      "Steel conduit raises reactance ~20–40% vs non-magnetic raceway.",
    ],
  };
}

// Used by the guide pages to link the wire table.
export { COPPER_WIRES };
