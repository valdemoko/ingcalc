/**
 * Electrical engines — batch 4. Pure functions.
 * New calculators: series resistance (2-5), current divider (2 branches),
 * RC time constant / charging curve.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Equivalent resistance of 2-5 resistors in series. */
export function seriesResistance(input: CalcInput): CalcOutput {
  const { values } = input;
  const provided = [values.r1, values.r2, values.r3, values.r4, values.r5].filter((r) =>
    Number.isFinite(r),
  );
  if (provided.length < 2) throw new Error("Enter at least two resistances");
  if (provided.some((r) => r <= 0)) throw new Error("Resistances must be positive");

  const req = provided.reduce((s, r) => s + r, 0);

  return {
    rows: [
      { label: "Equivalent resistance", value: round(req, 2), unit: "Ω", decimals: 2, primary: true, hint: "R_eq = Σ Rᵢ — just the sum." },
      { label: "Resistors used", value: provided.length, unit: "×", decimals: 0 },
      { label: "Largest share", value: round(Math.max(...provided) / req * 100, 1), unit: "%", decimals: 1, hint: "The biggest resistor takes the biggest voltage share." },
    ],
    notes: [
      "Model: series resistances add. The same current flows through every element; voltages divide proportionally to resistance.",
      "Series is how you build a value you can't buy, or share voltage/power across elements (with matched values).",
      "Contrast with parallel: parallel adds conductance and lowers resistance; series raises it.",
    ],
  };
}

/** Current divider: branch currents and equivalent resistance of two parallel branches. */
export function currentDivider(input: CalcInput): CalcOutput {
  const { values } = input;
  const totalA = values.totalCurrent;
  const r1 = values.r1;
  const r2 = values.r2;
  if (totalA <= 0) throw new Error("Total current must be positive");
  if (r1 <= 0 || r2 <= 0) throw new Error("Resistances must be positive");

  const req = 1 / (1 / r1 + 1 / r2);
  const i1 = totalA * (r2 / (r1 + r2));
  const i2 = totalA - i1;

  return {
    rows: [
      { label: "Current in branch 1", value: round(i1, 3), unit: "A", decimals: 3, primary: true, hint: `I₁ = I_total × R₂/(R₁+R₂).` },
      { label: "Current in branch 2", value: round(i2, 3), unit: "A", decimals: 3, primary: true },
      { label: "Equivalent resistance", value: round(req, 2), unit: "Ω", decimals: 2 },
      { label: "Branch 1 share", value: round((i1 / totalA) * 100, 1), unit: "%", decimals: 1, hint: "The lower resistance takes the larger current." },
    ],
    notes: [
      "Model: two-branch current divider — I₁ = I_total × R₂/(R₁+R₂). The formula's 'opposite' resistor trips people up.",
      "Branches see the same voltage; currents split inversely to resistance.",
      "For more than two branches, compute branch current as I_total × (R_eq/R_branch).",
    ],
  };
}

/** RC circuit: time constant, voltage after t, time to reach a target. */
export function rcTimeConstant(input: CalcInput): CalcOutput {
  const { values } = input;
  const r = values.resistance;
  const cF = values.capacitance;
  if (r <= 0 || cF <= 0) throw new Error("Resistance and capacitance must be positive");

  const tau = r * cF; // seconds
  const t = values.time; // seconds, optional
  const targetPct = values.targetPct; // optional

  const vAtT = (t: number, vSupply = 1) => vSupply * (1 - Math.exp(-t / tau));

  const rows: CalcOutput["rows"] = [
    { label: "Time constant τ", value: round(tau * 1000, 3), unit: "ms", decimals: 3, primary: true, hint: "τ = R × C — 63.2% charged after 1τ, 99.3% after 5τ." },
    { label: "5τ (practically full)", value: round(tau * 5 * 1000, 2), unit: "ms", decimals: 2, primary: true },
  ];
  if (Number.isFinite(t) && t > 0) {
    rows.push({ label: `Voltage after ${round(t, 3)} s`, value: round(vAtT(t) * 100, 2), unit: "% of supply", decimals: 2 });
  }
  if (Number.isFinite(targetPct) && targetPct! > 0 && targetPct! < 100) {
    const tTarget = -tau * Math.log(1 - targetPct! / 100);
    rows.push({ label: `Time to reach ${targetPct}%`, value: round(tTarget * 1000, 3), unit: "ms", decimals: 3, hint: `t = −τ·ln(1 − V/V₀).` });
  }

  return {
    rows,
    notes: [
      "Model: charging V(t) = V₀(1 − e^(−t/τ)) with τ = RC. Discharge is V₀·e^(−t/τ).",
      "The 63.2%/5τ milestones are the design shortcuts: filters, debounces and delay circuits all live on this curve.",
      "RC also sets the −3 dB corner of a low-pass filter: f = 1/(2πRC).",
      "Real capacitors (electrolytics) add ESR and tolerance (±20% typical) — design with margin.",
    ],
  };
}
