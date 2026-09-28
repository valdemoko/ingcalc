/**
 * Manufacturing / CNC engines. Pure functions.
 * Sources: standard machining relations — Vc = π·D·n/1000, MRR formulas,
 * cycle time from path length and feed rate. Cutting data values are
 * starting points; always verify against the tool manufacturer's tables.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Spindle RPM from cutting speed and diameter (turning/milling). */
export function cuttingSpeed(input: CalcInput): CalcOutput {
  const { values } = input;
  const vc = values.vc; // m/min
  const diaMm = values.diameter;
  if (vc <= 0 || diaMm <= 0) throw new Error("Cutting speed and diameter must be positive");

  const rpm = (vc * 1000) / (Math.PI * diaMm);
  const surfaceSpeed = (Math.PI * diaMm * rpm) / 1000;

  return {
    rows: [
      { label: "Spindle speed", value: round(rpm, 0), unit: "RPM", decimals: 0, primary: true, hint: `n = Vc × 1000 / (π × D), Vc = ${vc} m/min.` },
      { label: "Spindle speed", value: round(rpm / 60, 1), unit: "rev/s", decimals: 1 },
      { label: "Surface speed check", value: round(surfaceSpeed, 1), unit: "m/min", decimals: 1 },
    ],
    notes: [
      "Model: Vc = π·D·n/1000 — the fundamental cutting-speed relation, inverted for RPM.",
      "Imperial users: Vc(m/min) × 3.28 = SFM. 100 m/min ≈ 330 SFM.",
      "Typical starting Vc: mild steel with modern coated carbide 150–250 m/min (conservative grades ~100–150), aluminum 300–600, stainless 60–120 (carbide). HSS runs 3–5× lower — always confirm against the insert grade's datasheet.",
      "Machine the nearest available RPM below the calculated value — staying under protects tool life.",
    ],
  };
}

/** Table feed from RPM, chip load and flute count. */
export function feedRate(input: CalcInput): CalcOutput {
  const { values } = input;
  const rpm = values.rpm;
  const chipLoadMm = values.chipLoad;
  const flutes = Math.round(values.flutes);
  if (rpm <= 0 || chipLoadMm <= 0) throw new Error("RPM and chip load must be positive");
  if (flutes < 1 || flutes > 12) throw new Error("Flute count must be between 1 and 12");

  const feedMmMin = rpm * chipLoadMm * flutes;

  return {
    rows: [
      { label: "Table feed", value: round(feedMmMin, 0), unit: "mm/min", decimals: 0, primary: true, hint: `F = n × fz × z (${flutes} flutes × ${chipLoadMm} mm).` },
      { label: "Table feed", value: round(feedMmMin / 25.4, 1), unit: "in/min (IPM)", decimals: 1 },
      { label: "Chip load per tooth", value: round(chipLoadMm * 39.37, 3), unit: "mils (in/1000)", decimals: 3 },
    ],
    notes: [
      "Model: F = n × fz × z — chip load per tooth × teeth × RPM.",
      "Typical fz for carbide endmills: steel 0.03–0.10 mm, aluminum 0.05–0.15 mm, adjusted by diameter and engagement.",
      "Too low a feed rubs and work-hardens the surface; too high chips the edge — start mid-range and listen.",
      "Reduce feed (not speed) for deep engagement, thin walls and long tool overhangs.",
    ],
  };
}

/** Machining cycle time for turning and milling operations. */
export function cycleTime(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthMm = values.length;
  const feedMmMin = values.feed;
  const passes = Math.max(1, Math.round(values.passes ?? 1));
  const setupMin = values.setup ?? 0;
  if (lengthMm <= 0 || feedMmMin <= 0) throw new Error("Length and feed must be positive");
  if (setupMin < 0) throw new Error("Setup time cannot be negative");

  const cutMin = (lengthMm * passes) / feedMmMin + passes * 0.05; // +5 s per pass for approach
  const totalMin = cutMin + setupMin;
  const partsPerHour = totalMin > 0 ? 60 / totalMin : 0;

  return {
    rows: [
      { label: "Cutting time", value: round(cutMin, 2), unit: "min", decimals: 2, primary: true, hint: `${passes} pass(es) + 5 s approach each.` },
      { label: "Cycle time (with setup)", value: round(totalMin, 2), unit: "min", decimals: 2, primary: true },
      { label: "Parts per hour", value: round(partsPerHour, 1), unit: "pcs/h", decimals: 1 },
    ],
    notes: [
      "Model: t = L × passes ÷ F. Add rapid-approach and tool-change allowances for a real quote (5 s/pass included).",
      "Real cycle time also includes tool changes, indexing and rapid moves between features — this covers the main cut.",
      "For quoting, add setup amortized per batch: setup ÷ batch size joins the per-part time.",
      "Optimize the longest cut first: halving the biggest pass beats trimming many small ones.",
    ],
  };
}

/** Material removal rate for milling and turning. */
export function materialRemovalRate(input: CalcInput): CalcOutput {
  const { values } = input;
  const operation = input.raw.operation ?? "milling";
  let cm3Min: number;
  let formula: string;

  if (operation === "milling") {
    const aDepthMm = values.depth;
    const wWidthMm = values.width;
    const feedMmMin = values.feed;
    if (!(aDepthMm > 0 && wWidthMm > 0 && feedMmMin > 0)) throw new Error("Depth, width and feed are required for milling");
    cm3Min = (aDepthMm * wWidthMm * feedMmMin) / 1000;
    formula = `ae ${wWidthMm} mm × ap ${aDepthMm} mm × vf ${feedMmMin} mm/min`;
  } else {
    const diaMm = values.diameter;
    const docMm = values.depth;
    const feedMmRev = values.feedPerRev;
    const rpm = values.rpm;
    if (!(diaMm > 0 && docMm > 0 && feedMmRev > 0 && rpm > 0)) throw new Error("Diameter, depth, feed/rev and RPM are required for turning");
    const vc = (Math.PI * diaMm * rpm) / 1000;
    cm3Min = vc * docMm * feedMmRev;
    formula = `Vc ${round(vc, 0)} m/min × ap ${docMm} mm × fn ${feedMmRev} mm/rev`;
  }

  return {
    rows: [
      { label: "Material removal rate", value: round(cm3Min, 1), unit: "cm³/min", decimals: 1, primary: true, hint: formula },
      { label: "Material removal rate", value: round(cm3Min / 16.387, 3), unit: "in³/min", decimals: 3 },
    ],
    notes: [
      "Milling: MRR = ap × ae × vf. Turning: MRR = Vc × ap × fn.",
      "MRR drives spindle power: P ≈ MRR × specific cutting force (≈2–4 kW per cm³/min in steel, 0.5–1 in aluminum).",
      "Roughing maximizes MRR within machine and fixture limits; finishing sacrifices MRR for surface quality.",
    ],
  };
}

/** Production rate and machine utilization from run time and shift data. */
export function productionRate(input: CalcInput): CalcOutput {
  const { values } = input;
  const cycleMin = values.cycleTime;
  const shiftHours = values.shiftHours;
  const efficiency = values.efficiency;
  if (cycleMin <= 0 || shiftHours <= 0) throw new Error("Cycle time and shift length must be positive");
  if (efficiency <= 0 || efficiency > 1) throw new Error("Efficiency must be between 0 and 1");

  const availableMin = shiftHours * 60 * efficiency;
  const parts = Math.floor(availableMin / cycleMin);
  const utilization = (cycleMin / (shiftHours * 60)) * 100;

  return {
    rows: [
      { label: "Parts per shift", value: parts, unit: "pcs", decimals: 0, primary: true, hint: `${shiftHours} h at ${Math.round(efficiency * 100)}% availability.` },
      { label: "Theoretical parts (100%)", value: Math.floor((shiftHours * 60) / cycleMin), unit: "pcs", decimals: 0 },
      { label: "Machine utilization", value: round(utilization * efficiency, 1), unit: "%", decimals: 1, hint: "Share of clock time actually cutting." },
    ],
    notes: [
      "Model: parts = shift × 60 × availability ÷ cycle time.",
      "Availability bundles setup, breaks, tool changes and minor stoppages — 75–85% is realistic for job shops, 90%+ for dedicated lines.",
      "The gap between theoretical and available output is where OEE improvement programs live.",
    ],
  };
}
