/**
 * Solar engines — batch 4. Pure functions.
 * DC wiring loss for PV strings: resistive voltage drop and power loss,
 * with the DC-specific guidance (2% design target, two conductors).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** DC cable loss from string voltage/current and one-way run length. */
export function dcCableLoss(input: CalcInput): CalcOutput {
  const { values } = input;
  const vmp = values.stringV;
  const imp = values.stringI;
  const lengthM = values.length;
  const sizeMm2 = values.cableSize;
  if (vmp <= 0 || imp <= 0 || lengthM <= 0 || sizeMm2 <= 0) throw new Error("All values must be positive");

  // Copper resistivity: ρ = 0.0172 Ω·mm²/m at 20 °C; ~0.0195 at 70 °C conductor.
  const rho = 0.0195;
  const pathM = 2 * lengthM; // PV+ and PV− both carry current
  const r = (rho * pathM) / sizeMm2;

  const vd = imp * r;
  const lossPct = (vd / vmp) * 100;
  const powerW = vmp * imp; // string power
  const lossW = imp * imp * r;

  return {
    rows: [
      { label: "DC voltage drop", value: round(vd, 2), unit: "V", decimals: 2, primary: true, hint: `${round(lossPct, 2)}% of string Vmp — target ≤ 2% (best practice).` },
      { label: "Power lost", value: round(lossW, 1), unit: "W", decimals: 1, primary: true, hint: `${round((lossW / powerW) * 100, 2)}% of string output, every peak hour.` },
      { label: "Loop resistance", value: round(r, 4), unit: "Ω", decimals: 4, hint: `${sizeMm2} mm² copper at ~70 °C conductor, ${round(pathM, 0)} m round trip.` },
      { label: "String power", value: round(powerW, 0), unit: "W", decimals: 0 },
    ],
    notes: [
      "Model: DC resistive loss — I²R on the full out-and-back path at ~70 °C conductor temperature.",
      "Design target: ≤ 2% DC drop (≤ 1% on premium installs). Every percent is energy lost forever, all day, for 25 years.",
      "Upsizing cable costs once; undersizing taxes production forever — the 4 mm² → 6 mm² step usually pays back in under 5 years on long runs.",
      "Also verify the cable's ampacity and the string's max fuse rating — this tool covers voltage drop only.",
    ],
  };
}
