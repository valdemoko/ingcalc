/**
 * Electrical calculation engines — batch 3.
 * Pure functions. New calculators: parallel resistance (2-5 resistors),
 * capacitor energy/charge, inductive & capacitive reactance.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Equivalent resistance of 2-5 resistors in parallel. */
export function parallelResistance(input: CalcInput): CalcOutput {
  const { values } = input;
  const provided = [values.r1, values.r2, values.r3, values.r4, values.r5].filter((r) =>
    Number.isFinite(r),
  );
  if (provided.length < 2) throw new Error("Enter at least two resistances");
  if (provided.some((r) => r <= 0)) throw new Error("Resistances must be positive");

  const conductance = provided.reduce((s, r) => s + 1 / r, 0); // S (siemens)
  const req = 1 / conductance;
  const allEqual = provided.every((r) => Math.abs(r - provided[0]) < 1e-9);

  return {
    rows: [
      {
        label: "Equivalent resistance",
        value: round(req, req < 10 ? 4 : 2),
        unit: "Ω",
        decimals: req < 10 ? 4 : 2,
        primary: true,
      },
      { label: "Resistors used", value: provided.length, unit: "×", decimals: 0 },
      { label: "Total conductance", value: round(conductance * 1000, 3), unit: "mS", decimals: 3 },
    ],
    notes: [
      "Model: 1/R_eq = Σ 1/Rᵢ — the equivalent resistance is always smaller than the smallest branch.",
      allEqual
        ? `${provided.length} equal resistors: R_eq = R ÷ ${provided.length} — the quick mental check.`
        : "Unequal values: the smallest resistor dominates — it carries the most current.",
      "Each branch sees the same voltage; branch currents add to the total.",
    ],
  };
}

/** Energy and charge stored in a capacitor at a given voltage. */
export function capacitorEnergy(input: CalcInput): CalcOutput {
  const { values } = input;
  const capF = values.capacitance; // canonical farads
  const v = values.voltage;
  if (capF <= 0) throw new Error("Capacitance must be positive");
  if (v <= 0) throw new Error("Voltage must be positive");

  const energyJ = 0.5 * capF * v * v;
  const chargeC = capF * v;

  return {
    rows: [
      { label: "Stored energy", value: round(energyJ, 3), unit: "J", decimals: 3, primary: true },
      { label: "Stored energy", value: round(energyJ / 3600, 4), unit: "Wh", decimals: 4 },
      { label: "Charge", value: round(chargeC, 3), unit: "C", decimals: 3, primary: true },
      { label: "Charge", value: round(chargeC / 3.6, 2), unit: "mAh", decimals: 2 },
    ],
    notes: [
      "Model: E = ½·C·V² — stored energy scales with the SQUARE of voltage (double V, quadruple E).",
      "Charge: Q = C·V. The mAh figure is an exact charge conversion (1 mAh = 3.6 C), independent of voltage.",
      "Real capacitors deliver a few percent less (ESR, leakage); supercapacitor stacks lose more to cell balancing.",
    ],
  };
}

/** Inductive or capacitive reactance at a given frequency. */
export function reactance(input: CalcInput): CalcOutput {
  const { values } = input;
  const freq = values.frequency;
  const type = input.raw.type ?? "inductive";
  if (freq <= 0) throw new Error("Frequency must be positive");

  let x: number;
  if (type === "capacitive") {
    const c = values.capacitance;
    if (!(c > 0)) throw new Error("Capacitance must be positive");
    x = 1 / (2 * Math.PI * freq * c);
  } else {
    const l = values.inductance;
    if (!(l > 0)) throw new Error("Inductance must be positive");
    x = 2 * Math.PI * freq * l;
  }

  return {
    rows: [
      {
        label: type === "capacitive" ? "Capacitive reactance" : "Inductive reactance",
        value: round(x, 3),
        unit: "Ω",
        decimals: 3,
        primary: true,
        hint: type === "capacitive" ? "X꜀ = 1/(2πfC)" : "Xʟ = 2πfL",
      },
      { label: "Angular frequency", value: round(2 * Math.PI * freq, 1), unit: "rad/s", decimals: 1 },
    ],
    notes: [
      type === "capacitive"
        ? "Model: X꜀ = 1/(2πfC) — reactance falls as frequency rises; a capacitor blocks DC and passes high frequencies."
        : "Model: Xʟ = 2πfL — reactance rises with frequency; an inductor passes DC and blocks high frequencies.",
      type === "capacitive"
        ? "Current LEADS voltage by 90° in an ideal capacitor."
        : "Current LAGS voltage by 90° in an ideal inductor.",
      "Reactance magnitude only — real components add series resistance (ESR), which matters at high frequency and high current.",
    ],
  };
}
