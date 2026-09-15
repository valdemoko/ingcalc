/**
 * Electrical calculation engines.
 * Pure functions only — no React, no side effects. Verified by scripts/verify-engines.ts.
 *
 * Conductor data: NEC Chapter 9 Table 8 (DC resistance at 75 °C, uncoated copper)
 * and NEC Table 310.16 (75 °C ampacity column, ≤3 current-carrying conductors).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

export interface Wire {
  /** AWG designation, e.g. "14 AWG" or "4/0 AWG". */
  awg: string;
  /** DC resistance at 75 °C in ohms per 1000 ft (NEC Ch. 9 Table 8). */
  ohmsPerKft: number;
  /** Circular mils area (NEC Ch. 9 Table 8). */
  cmil: number;
  /** Approximate metric cross-section in mm². */
  mm2: number;
  /** 75 °C ampacity for ≤3 current-carrying conductors (NEC Table 310.16). */
  ampacity75: number;
}

export const COPPER_WIRES: Wire[] = [
  { awg: "14 AWG", ohmsPerKft: 3.14, cmil: 4110, mm2: 2.08, ampacity75: 20 },
  { awg: "12 AWG", ohmsPerKft: 1.98, cmil: 6530, mm2: 3.31, ampacity75: 25 },
  { awg: "10 AWG", ohmsPerKft: 1.24, cmil: 10380, mm2: 5.26, ampacity75: 35 },
  { awg: "8 AWG", ohmsPerKft: 0.778, cmil: 16510, mm2: 8.37, ampacity75: 50 },
  { awg: "6 AWG", ohmsPerKft: 0.491, cmil: 26240, mm2: 13.3, ampacity75: 65 },
  { awg: "4 AWG", ohmsPerKft: 0.308, cmil: 41740, mm2: 21.2, ampacity75: 85 },
  { awg: "3 AWG", ohmsPerKft: 0.245, cmil: 52620, mm2: 26.7, ampacity75: 100 },
  { awg: "2 AWG", ohmsPerKft: 0.194, cmil: 66360, mm2: 33.6, ampacity75: 115 },
  { awg: "1 AWG", ohmsPerKft: 0.154, cmil: 83690, mm2: 42.4, ampacity75: 130 },
  { awg: "1/0 AWG", ohmsPerKft: 0.122, cmil: 105600, mm2: 53.5, ampacity75: 150 },
  { awg: "2/0 AWG", ohmsPerKft: 0.0967, cmil: 133100, mm2: 67.4, ampacity75: 175 },
  { awg: "3/0 AWG", ohmsPerKft: 0.0766, cmil: 167800, mm2: 85.0, ampacity75: 200 },
  { awg: "4/0 AWG", ohmsPerKft: 0.0608, cmil: 211600, mm2: 107.0, ampacity75: 230 },
  { awg: "250 kcmil", ohmsPerKft: 0.0515, cmil: 250000, mm2: 127.0, ampacity75: 255 },
  { awg: "350 kcmil", ohmsPerKft: 0.0367, cmil: 350000, mm2: 177.0, ampacity75: 310 },
  { awg: "500 kcmil", ohmsPerKft: 0.0257, cmil: 500000, mm2: 253.0, ampacity75: 380 },
];

export function getWire(awg: string): Wire | undefined {
  return COPPER_WIRES.find((w) => w.awg === awg);
}

/**
 * Voltage drop, single-phase: Vd = 2 × K × I × L / CM (K = ohm·cmil/ft ≈ 12.9 copper 75 °C).
 * Three-phase: √3 factor. Also returns power lost and end-of-line voltage.
 */
export function voltageDrop(input: CalcInput): CalcOutput {
  const { values } = input;
  const voltage = values.voltage;
  const current = values.current;
  const lengthFt = values.length;
  const system = input.raw.system ?? "single";
  const awg = input.raw.wire ?? "12 AWG";
  const wire = getWire(awg);
  if (!wire) throw new Error("Unknown wire size");
  if (voltage <= 0 || current < 0 || lengthFt < 0) throw new Error("Invalid inputs");

  // Circuit length = one-way distance; current path includes the return.
  const pathFt = system === "three" ? lengthFt : 2 * lengthFt;
  const resistance = (wire.ohmsPerKft * pathFt) / 1000;
  const phaseFactor = system === "three" ? Math.sqrt(3) : 1;
  const drop = current * resistance * phaseFactor;
  const dropPct = voltage > 0 ? (drop / voltage) * 100 : 0;
  const endVoltage = voltage - drop;
  const powerLost = current * current * resistance;
  const recommended =
    dropPct > 3
      ? `At ${round(dropPct, 2)}% drop, this exceeds the common 3% branch-circuit guideline — consider a larger conductor.`
      : `At ${round(dropPct, 2)}% drop, this is within the common 3% branch-circuit guideline.`;

  return {
    rows: [
      { label: "Voltage drop", value: drop, unit: "V", decimals: 3, primary: true, hint: "Absolute voltage lost in the conductor path." },
      { label: "Voltage drop", value: dropPct, unit: "%", decimals: 2, primary: true, hint: "Drop as a percentage of source voltage." },
      { label: "Voltage at load", value: endVoltage, unit: "V", decimals: 3, hint: "Voltage available at the load end of the run." },
      { label: "Power lost in the wire", value: powerLost, unit: "W", decimals: 2, hint: "I²R heating loss — this energy is wasted as heat." },
      { label: "Conductor resistance", value: resistance, unit: "Ω", decimals: 4, hint: `Total path resistance (${awg}, ${system === "three" ? "3-phase" : "1-phase"} path).` },
    ],
    notes: [
      `Conductor: ${awg} copper (${wire.mm2} mm² approx.), ${wire.ohmsPerKft} Ω per 1000 ft at 75 °C (NEC Ch. 9 Table 8).`,
      system === "three" ? "Three-phase model: Vd = √3 × I × R × L (one-way length)." : "Single-phase model: Vd = 2 × I × R × L (out-and-back path).",
      recommended,
      "Reactance is ignored — valid for small conductors at DC or low-frequency AC. For large conductors in conduit, AC reactance slightly increases the drop.",
    ],
  };
}

/** Smallest copper conductor whose 75 °C ampacity ≥ load current. */
export function wireSize(input: CalcInput): CalcOutput {
  const { values } = input;
  const load = values.load;
  if (load <= 0) throw new Error("Load current must be greater than zero");
  const candidate = COPPER_WIRES.find((w) => w.ampacity75 >= load);
  const rows: CalcOutput["rows"] = candidate
    ? [
        { label: "Recommended conductor", value: 0, unit: candidate.awg, primary: true },
        { label: "Ampacity (75 °C)", value: candidate.ampacity75, unit: "A", hint: "NEC Table 310.16, ≤3 current-carrying conductors." },
        { label: "Cross-section", value: candidate.mm2, unit: "mm²", decimals: 2 },
        { label: "Margin over load", value: candidate.ampacity75 - load, unit: "A", decimals: 1 },
      ]
    : [
        { label: "Recommended conductor", value: 0, unit: "Above 500 kcmil — parallel conductors required", primary: true },
      ];
  return {
    rows,
    notes: [
      "Based on NEC Table 310.16, 75 °C column, copper, no more than three current-carrying conductors in raceway.",
      "Termination limits (110.14(C)) may require the 60 °C column for circuits ≤100 A; the table here is a starting point, not a code determination.",
      "Continuous loads (3 h+) must be sized at 125% of the load per NEC 210.20(A).",
    ],
  };
}

/** Ohm's law solver: any one blank field is solved from the other two. */
export function ohmsLaw(input: CalcInput): CalcOutput {
  const { values } = input;
  const missing = (["voltage", "current", "resistance"] as const).filter(
    (k) => !Number.isFinite(values[k])
  );
  if (missing.length !== 1) throw new Error("Leave exactly one field blank");
  const [unknown] = missing;
  let v = values.voltage;
  let i = values.current;
  let r = values.resistance;
  if (unknown === "voltage") v = i * r;
  if (unknown === "current") i = v / r;
  if (unknown === "resistance") r = v / i;
  const p = v * i;
  return {
    rows: [
      { label: "Voltage", value: v, unit: "V", decimals: 4, primary: unknown === "voltage" },
      { label: "Current", value: i, unit: "A", decimals: 4, primary: unknown === "current" },
      { label: "Resistance", value: r, unit: "Ω", decimals: 4, primary: unknown === "resistance" },
      { label: "Power", value: p, unit: "W", decimals: 4, hint: "P = V × I (also I²R = V²/R)." },
    ],
    notes: ["Direct-current model (or purely resistive AC). Reactance and power factor are not considered."],
  };
}

/** kVA / kW / hp to amps, single- and three-phase. */
export function ampsFromPower(input: CalcInput): CalcOutput {
  const { values } = input;
  const power = values.power;
  const voltage = values.voltage;
  const pf = values.pf;
  const system = input.raw.system ?? "single";
  const source = input.raw.source ?? "kva";
  if (voltage <= 0 || power <= 0) throw new Error("Power and voltage must be positive");

  let amps: number;
  if (source === "kw") {
    const kva = power / pf;
    amps = system === "three" ? (kva * 1000) / (Math.sqrt(3) * voltage) : (kva * 1000) / voltage;
  } else if (source === "hp") {
    const kva = (power * 746) / 1000 / pf;
    amps = system === "three" ? (kva * 1000) / (Math.sqrt(3) * voltage) : (kva * 1000) / voltage;
  } else {
    amps = system === "three" ? (power * 1000) / (Math.sqrt(3) * voltage) : (power * 1000) / voltage;
  }

  return {
    rows: [
      { label: "Current", value: amps, unit: "A", decimals: 2, primary: true },
      { label: "Apparent power", value: source === "kva" ? power : (power * (source === "hp" ? 0.746 : 1)) / pf, unit: "kVA", decimals: 3 },
      { label: "Real power", value: source === "kva" ? power * pf : power * (source === "hp" ? 0.746 : 1), unit: "kW", decimals: 3 },
    ],
    notes: [
      system === "three" ? "Three-phase: I = kVA × 1000 / (√3 × V)." : "Single-phase: I = kVA × 1000 / V.",
      source === "hp" ? "Motor output converted at 746 W per hp; nameplate FLA from the motor table is preferred for conductor sizing." : "Power factor conversion: kW = kVA × PF.",
    ],
  };
}

/** Power factor correction: capacitor kVAR needed to reach a target PF. */
export function powerFactorCorrection(input: CalcInput): CalcOutput {
  const { values } = input;
  const kw = values.kw;
  const pfNow = values.pfNow;
  const pfTarget = values.pfTarget;
  if (kw <= 0) throw new Error("Load power must be positive");
  if (pfNow <= 0 || pfNow > 1) throw new Error("Current power factor must be between 0 and 1");
  if (pfTarget <= pfNow || pfTarget > 1) throw new Error("Target PF must be greater than current PF and ≤ 1");

  const angleNow = Math.acos(pfNow);
  const angleTarget = Math.acos(pfTarget);
  const kvar = kw * (Math.tan(angleNow) - Math.tan(angleTarget));
  const kvaNow = kw / pfNow;
  const kvaTarget = kw / pfTarget;
  const currentNow = values.voltage > 0 ? (kvaNow * 1000) / values.voltage : 0;
  const currentAfter = values.voltage > 0 ? (kvaTarget * 1000) / values.voltage : 0;

  return {
    rows: [
      { label: "Capacitor size required", value: kvar, unit: "kVAR", decimals: 2, primary: true, hint: "Three-phase capacitor bank needed to reach the target PF." },
      { label: "Apparent power before", value: kvaNow, unit: "kVA", decimals: 2 },
      { label: "Apparent power after", value: kvaTarget, unit: "kVA", decimals: 2, hint: "Freed capacity in the supply transformer." },
      { label: "Current before", value: currentNow, unit: "A", decimals: 1 },
      { label: "Current after", value: currentAfter, unit: "A", decimals: 1 },
      { label: "Current reduction", value: currentNow > 0 ? ((currentNow - currentAfter) / currentNow) * 100 : 0, unit: "%", decimals: 1 },
    ],
    notes: [
      "Method: kVAR = kW × (tan φ₁ − tan φ₂), where φ = arccos(PF). This is the standard utility calculation.",
      "Utilities commonly require 0.90–0.95 PF; correcting above ~0.95 has diminishing returns.",
      "This is load-level correction at a steady load — actual installations use automatic banks with step switching.",
    ],
  };
}

/** Single- and three-phase AC motor full-load current estimate. */
export function motorCurrent(input: CalcInput): CalcOutput {
  const { values } = input;
  const hp = values.hp;
  const voltage = values.voltage;
  const eff = values.eff;
  const pf = values.pf;
  const system = input.raw.system ?? "three";
  if (hp <= 0 || voltage <= 0) throw new Error("Power and voltage must be positive");
  if (eff <= 0 || eff > 1) throw new Error("Efficiency must be between 0 and 1");
  if (pf <= 0 || pf > 1) throw new Error("Power factor must be between 0 and 1");

  const wattsIn = (hp * 746) / eff;
  const amps =
    system === "three"
      ? wattsIn / (Math.sqrt(3) * voltage * pf)
      : wattsIn / (voltage * pf);

  return {
    rows: [
      { label: "Full-load current (estimated)", value: amps, unit: "A", decimals: 1, primary: true },
      { label: "Input power", value: wattsIn / 1000, unit: "kW", decimals: 2 },
      { label: "kVA drawn", value: (system === "three" ? Math.sqrt(3) * voltage * amps : voltage * amps) / 1000, unit: "kVA", decimals: 2 },
    ],
    notes: [
      "Calculated from I = P / (√3 × V × PF × η) for three-phase, I = P / (V × PF × η) for single-phase.",
      "For code purposes, use NEC motor tables (430.248/430.250) — nameplate FLA varies by motor design.",
      "Conductor sizing for motors uses 125% of FLC per NEC 430.22.",
    ],
  };
}
