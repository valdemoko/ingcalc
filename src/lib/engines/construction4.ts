/**
 * Construction engines — batch 4. Pure functions.
 * New calculators: ADA/access ramp layout, earthwork cut & fill (average-end
 * area), simple drainage (rational-method-lite roof/area runoff), lumber weight.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Accessible ramp layout: run, slope compliance and landings (ADA reference). */
export function rampLayout(input: CalcInput): CalcOutput {
  const { values } = input;
  const riseIn = values.rise;
  const slopeRatio = input.raw.slope ?? "12";
  if (riseIn <= 0) throw new Error("Rise must be positive");

  const riseFt = riseIn / 12;
  const runFt = riseFt * Number(slopeRatio);
  const slopeDeg = Math.atan(1 / Number(slopeRatio)) * 180 / Math.PI;
  const rampLenFt = Math.sqrt(runFt * runFt + riseFt * riseFt);

  // ADA: max 30 in of rise per run segment — more rise requires intermediate landings.
  const segments = Math.ceil(riseIn / 30);
  const maxRiseNote = riseIn > 30
    ? `${segments} runs with level landings between (ADA caps 30 in of rise per run)`
    : "Single run — within the 30 in ADA rise cap";

  return {
    rows: [
      { label: "Ramp run (horizontal)", value: round(runFt, 2), unit: "ft", decimals: 2, primary: true, hint: `${round(runFt * 0.3048, 2)} m at 1:${slopeRatio}.` },
      { label: "Ramp length (along slope)", value: round(rampLenFt, 2), unit: "ft", decimals: 2, primary: true },
      { label: "Slope angle", value: round(slopeDeg, 2), unit: "°", decimals: 2, hint: `${round(100 / Number(slopeRatio), 1)}% grade.` },
      { label: "Landings needed", value: segments, unit: "×", decimals: 0, hint: maxRiseNote },
    ],
    notes: [
      "Model: run = rise × slope ratio. 1:12 (8.33%) is the ADA maximum for accessible ramps; 1:20 (5%) needs no handrails.",
      "ADA reference points: 36 in clear width, handrails both sides above 6 in rise, 60 in top/bottom landings, 30 in max rise per run.",
      "This is a layout tool — verify against your jurisdiction's accessibility code, which may differ from ADA.",
      "Steeper than 1:12 is not accessible: it becomes a stair, with different rules entirely.",
    ],
  };
}

/** Cut & fill between two grade elevations on a simple pad (average-end-area style). */
export function earthwork(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const existingFt = values.existingElev;
  const targetFt = values.targetElev;
  if (lengthFt <= 0 || widthFt <= 0) throw new Error("Pad dimensions must be positive");

  const diffFt = targetFt - existingFt;
  const volYd3 = Math.abs((lengthFt * widthFt * Math.abs(diffFt)) / 27);
  const isCut = diffFt < 0;

  // Swell/shrink: cut material swells ~25% for hauling; fill material shrinks when compacted.
  const hauledYd3 = isCut ? volYd3 * 1.25 : volYd3;
  const compactedYd3 = isCut ? volYd3 : volYd3 * 1.15;

  return {
    rows: [
      { label: isCut ? "Cut volume (excavate)" : "Fill volume (import)", value: round(volYd3, 1), unit: "yd³", decimals: 1, primary: true, hint: `Average depth ${round(Math.abs(diffFt), 2)} ft over ${round(lengthFt * widthFt, 0)} ft².` },
      { label: isCut ? "Hauled (loose, +25% swell)" : "Compacted fill needed (+15% shrink)", value: round(isCut ? hauledYd3 : compactedYd3, 1), unit: "yd³", decimals: 1, primary: true },
      { label: "Weight", value: round(volYd3 * 1.35, 1), unit: "tons", decimals: 1, hint: "Mixed soil ≈ 1.35 tons/yd³ bank measure." },
    ],
    notes: [
      "Model: flat-pad average-end approximation — volume = area × average depth difference. Irregular sites need a grid or contour method.",
      "Cut swells ~25% when excavated (haul more truckloads than the hole suggests); imported fill shrinks ~15% when compacted (order more than the void).",
      "Balanced sites (cut ≈ fill) save the two biggest line items: hauling off and importing.",
      "Topsoil stripping and over-excavation for unsuitable material add volume on top of this estimate.",
    ],
  };
}

/** Runoff volume for a roof/paved area from rainfall depth (rational-method-lite). */
export function drainageRunoff(input: CalcInput): CalcOutput {
  const { values } = input;
  const areaFt2 = values.area;
  const rainIn = values.rainfall;
  const surface = input.raw.surface ?? "roof";
  if (areaFt2 <= 0 || rainIn <= 0) throw new Error("Area and rainfall must be positive");

  // Runoff coefficients (C): roof 0.95, concrete 0.9, grass 0.25, gravel 0.5
  const c: Record<string, number> = { roof: 0.95, concrete: 0.9, gravel: 0.5, grass: 0.25 };
  const coeff = c[surface];
  if (!coeff) throw new Error("Unknown surface type");

  // Volume: rain depth × area × C. 1 in over 1 ft² = 0.0833 ft³
  const volumeFt3 = areaFt2 * (rainIn / 12) * coeff;
  const gallons = volumeFt3 * 7.48052;

  return {
    rows: [
      { label: "Runoff volume", value: round(gallons, 0), unit: "gal", decimals: 0, primary: true, hint: `${round(volumeFt3, 1)} ft³ at C = ${coeff} (${surface}).` },
      { label: "Runoff volume", value: round(volumeFt3 * 0.0283168 * 1000, 0), unit: "L", decimals: 0 },
      { label: "Cistern depth check", value: round(volumeFt3 / 27, 2), unit: "yd³", decimals: 2, hint: "Volume of storage this event would fill." },
    ],
    notes: [
      "Model: V = C × i × A — the rational-method volume logic for a single event, C = runoff coefficient.",
      "Rain barrels and cisterns are sized on exactly this number: a 1000 ft² roof sheds ~620 gal in a 1 in storm.",
      "Peak flow (for pipe/gutter sizing) needs storm intensity (in/h) — multiply this tool's logic by your local design storm.",
      "Drainage codes require handling the design storm without property damage — check local intensity-duration data.",
    ],
  };
}

/** Lumber weight by species, size and count. */
export function lumberWeight(input: CalcInput): CalcOutput {
  const { values } = input;
  const species = input.raw.species ?? "pine";
  const nominalW = values.width;
  const nominalH = values.thickness;
  const lengthFt = values.length;
  const count = Math.max(1, Math.round(values.count));
  if (!(nominalW > 0 && nominalH > 0 && lengthFt > 0)) throw new Error("Dimensions must be positive");

  // Dressed dimensions (nominal − 0.5 in on thickness/width for 2x framing)
  const dressedW = nominalW - 0.5;
  const dressedH = nominalH - 0.5;
  if (dressedW <= 0 || dressedH <= 0) throw new Error("Nominal size too small for dressed deduction");

  // Density lb/ft³ at ~12% moisture: SPF 29, DF 34, oak 47, treated 40 (wet)
  const density: Record<string, number> = { pine: 29, douglas: 34, oak: 47, treated: 40 };
  const d = density[species];
  if (!d) throw new Error("Unknown species");

  const ft3 = (dressedW * dressedH / 144) * lengthFt;
  const lbEach = ft3 * d;

  return {
    rows: [
      { label: "Weight per piece", value: round(lbEach, 1), unit: "lb", decimals: 1, primary: true, hint: `${dressedW} × ${dressedH} in dressed × ${lengthFt} ft, ${species} (~${d} lb/ft³).` },
      { label: "Total weight", value: round(lbEach * count, 0), unit: "lb", decimals: 0, primary: true, hint: `${count} pieces — ${round(lbEach * count / 2000, 2)} tons. Vehicle and floor loading matter.` },
      { label: "Board feet (nominal)", value: round((nominalW * nominalH * lengthFt / 12) * count, 1), unit: "BF", decimals: 1 },
    ],
    notes: [
      "Model: dressed dimensions × length × species density. Treated lumber is heavier (moisture + preservative).",
      "A kiln-dried SPF 2×4×8 computes to ~8.5 lb here; published calculators cluster near 9 lb (slightly higher density assumption) — treat this as a ±10% band, wet or treated lumber runs heavier.",
      "The weight matters for: delivery payloads, floor loading of stacked lumber, and ceiling joist storage loads.",
      "Wet lumber runs 10–20% heavier than the 12% moisture figures used here.",
      "Board feet shown for price comparison — framing lumber is sold by the piece.",
    ],
  };
}
