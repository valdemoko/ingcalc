/**
 * HVAC calculation engines. Pure functions.
 *
 * Models:
 * - Cooling/heating loads: Manual J style rule-of-thumb (BTU/h per ft² with
 *   climate, insulation, sun and occupancy adjustments). Clearly labeled as an
 *   estimate, not a substitute for a room-by-room load calculation.
 * - Duct sizing: equal-friction round duct equation Q = 0.455 · A · D^0.61 · ΔP^0.5
 *   (ASHRAE friction chart approximation for galvanized steel).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Cooling load estimate (BTU/h) from floor area with documented adjustments. */
export function coolingLoad(input: CalcInput): CalcOutput {
  const { values } = input;
  const areaFt2 = values.area;
  if (areaFt2 <= 0) throw new Error("Area must be positive");

  const climateFactor = input.raw.climate ?? "moderate"; // hot: +10%, cool: -10%
  const insulation = input.raw.insulation ?? "average"; // poor +15%, good -10%
  const sun = input.raw.sun ?? "average"; // heavy +10%, shaded -10%
  const occupants = Math.max(1, Math.round(values.occupants));
  const kitchenWatts = values.kitchenWatts;

  let btu = areaFt2 * 25; // baseline ~25 BTU/h per ft² for 8 ft ceilings
  if (climateFactor === "hot") btu *= 1.1;
  if (climateFactor === "cool") btu *= 0.9;
  if (insulation === "poor") btu *= 1.15;
  if (insulation === "good") btu *= 0.9;
  if (sun === "heavy") btu *= 1.1;
  if (sun === "shaded") btu *= 0.9;
  btu += occupants * 600; // sensible+latent per seated person
  btu += kitchenWatts * 3.412; // appliance W → BTU/h

  const tons = btu / 12000;
  const kw = btu * 0.00029307;

  return {
    rows: [
      { label: "Estimated cooling load", value: round(btu), unit: "BTU/h", decimals: 0, primary: true },
      { label: "Nominal equipment size", value: round(tons, 1), unit: "tons", decimals: 1, hint: "Round up to the next standard size (1.5, 2, 2.5, 3...)." },
      { label: "Cooling capacity", value: round(kw, 2), unit: "kW", decimals: 2 },
      { label: "CFM guideline (~400/ton)", value: round(tons * 400), unit: "CFM", decimals: 0, hint: "Typical design airflow for comfort cooling." },
    ],
    notes: [
      "Rule-of-thumb model: 25 BTU/h·ft² baseline adjusted for climate, insulation, sun, occupants (600 BTU/h each) and appliance watts.",
      "This is a screening estimate. A real system should be sized with a room-by-room Manual J calculation — oversizing causes short-cycling and poor dehumidification.",
    ],
  };
}

/** Heating load estimate from area, design temperature difference and adjustment factors. */
export function heatingLoad(input: CalcInput): CalcOutput {
  const { values } = input;
  const areaFt2 = values.area;
  const designDeltaT = values.deltaT;
  if (areaFt2 <= 0) throw new Error("Area must be positive");
  if (designDeltaT <= 0) throw new Error("Temperature difference must be positive");

  const insulation = input.raw.insulation ?? "average";
  const uFactor = insulation === "poor" ? 0.12 : insulation === "good" ? 0.06 : 0.08; // BTU/h·ft²·°F envelope UA

  const btu = areaFt2 * uFactor * designDeltaT;
  const kw = btu * 0.00029307;

  return {
    rows: [
      { label: "Estimated heating load", value: round(btu), unit: "BTU/h", decimals: 0, primary: true },
      { label: "Nominal equipment size", value: round(btu / 100000, 1), unit: "×100 MBH", decimals: 1, hint: "100 MBH = 100,000 BTU/h." },
      { label: "Heating capacity", value: round(kw, 2), unit: "kW", decimals: 2 },
    ],
    notes: [
      "Model: Load = Area × U × ΔT with a whole-envelope U factor (0.06 good / 0.08 average / 0.12 poor insulation).",
      "Excludes ventilation/infiltration air — add 1.1× for typical envelope leakage, more for fireplaces.",
      "Screening estimate only; use Manual J or equivalent for equipment selection.",
    ],
  };
}

/** Round duct diameter from airflow and target friction rate (ASHRAE equal-friction). */
export function ductSize(input: CalcInput): CalcOutput {
  const { values } = input;
  const cfm = values.cfm;
  const friction = values.friction; // in. w.c. per 100 ft
  if (cfm <= 0) throw new Error("Airflow must be positive");
  if (friction <= 0 || friction > 1) throw new Error("Friction rate must be between 0 and 1 in. w.c./100 ft");

  // Equal-friction chart fit for round galvanized duct (standard air):
  // Q ≈ 7.82 · D^2.5 · √ΔP  (Q in CFM, D in inches, ΔP in in. w.c./100 ft).
  // Inverted: D = (Q / (7.82·√ΔP))^(1/2.5). Matches ASHRAE friction charts within ~4%.
  const d = Math.pow(cfm / (7.82 * Math.sqrt(friction)), 0.4);
  const diameter = round(d, 1);
  const velocity = cfm / ((Math.PI * d * d) / 4 / 144);

  // Standard nominal sizes to snap to.
  const nominal = [4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36];
  const snapped = nominal.find((n) => n >= diameter) ?? diameter;

  return {
    rows: [
      { label: "Exact round diameter", value: diameter, unit: "in", decimals: 1, primary: true },
      { label: "Next nominal size", value: snapped, unit: "in", decimals: 0, primary: true, hint: "Use the nominal size; velocity will be slightly lower." },
      { label: "Duct velocity (exact)", value: round(velocity), unit: "fpm", decimals: 0, hint: "Supply trunk 700–900 fpm; branch 600 fpm; keep below ~1000 fpm for noise." },
      { label: "Metric equivalent", value: round(diameter * 25.4), unit: "mm", decimals: 0 },
    ],
    notes: [
      "Solved from the equal-friction chart fit Q ≈ 7.82·D^2.5·√ΔP for round galvanized duct (ASHRAE friction chart approximation, ~4% accuracy).",
      `Friction rate used: ${friction} in. w.c. per 100 ft (typical residential systems are designed at 0.08–0.1).`,
      "Flexible duct has much higher resistance — if used, go one or two nominal sizes larger.",
    ],
  };
}

/** Airflow / air changes per hour from room volume and target ACH, or the reverse. */
export function airflowCfm(input: CalcInput): CalcOutput {
  const { values } = input;
  const volumeFt3 = values.volume;
  const ach = values.ach;
  if (volumeFt3 <= 0) throw new Error("Room volume must be positive");
  if (ach < 0) throw new Error("Air changes must not be negative");

  const cfm = (volumeFt3 * ach) / 60;
  const lps = cfm * 0.471947;
  const m3h = volumeFt3 * 0.0283168 * ach;

  return {
    rows: [
      { label: "Required airflow", value: round(cfm), unit: "CFM", decimals: 0, primary: true },
      { label: "Metric equivalent", value: round(lps), unit: "L/s", decimals: 0 },
      { label: "Volume flow", value: round(m3h), unit: "m³/h", decimals: 0 },
      { label: "Air changes per hour", value: ach, unit: "ACH", decimals: 2 },
    ],
    notes: [
      "Formula: CFM = (Volume × ACH) / 60.",
      "Typical targets: bedrooms 5–6 ACH, bathrooms 8–10 ACH (exhaust), kitchens 15 ACH, general ventilation 0.35 ACH whole-house.",
    ],
  };
}

/** Convert between SEER, EER, COP and kW per ton of cooling. */
export function efficiencyConvert(input: CalcInput): CalcOutput {
  const { values } = input;
  const seer = values.seer;
  if (seer <= 0) throw new Error("SEER must be positive");

  // SEER is a seasonal average over a range of temps; EER here = SEER × 0.875
  // (standard DOE conversion approximation used in code compliance math).
  const eer = seer * 0.875;
  const cop = eer / 3.412;
  const kwPerTon = 12 / seer;
  const tonsPerKw = seer / 12;

  return {
    rows: [
      { label: "EER (estimated)", value: round(eer, 2), unit: "Btu/h per W", decimals: 2, primary: true, hint: "EER ≈ SEER × 0.875 (DOE approximation)." },
      { label: "COP (estimated)", value: round(cop, 2), unit: "W/W", decimals: 2 },
      { label: "Power per ton", value: round(kwPerTon, 2), unit: "kW/ton", decimals: 2 },
      { label: "Tons per kW", value: round(tonsPerKw, 2), unit: "ton/kW", decimals: 2 },
    ],
    notes: [
      "SEER is measured over a seasonal temperature profile; EER is at a single rating point (95 °F). The 0.875 factor is a rule of thumb — actual EER depends on the unit.",
      "COP = EER / 3.412 (1 W = 3.412 BTU/h).",
    ],
  };
}
