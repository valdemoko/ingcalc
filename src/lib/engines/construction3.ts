/**
 * Construction calculation engines — batch 3.
 * Pure functions. New calculators: excavation volume & truckloads, paint
 * coverage, tile count with layout waste.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Excavation volume for a rectangular pit/trench with swell factor and truckloads. */
export function excavationVolume(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const depthFt = values.depth;
  const swell = values.swell;
  if (lengthFt <= 0 || widthFt <= 0 || depthFt <= 0) throw new Error("All dimensions must be positive");
  if (swell < 0 || swell > 1) throw new Error("Swell must be between 0 and 1 (0.25 = 25%)");

  const bankYd3 = (lengthFt * widthFt * depthFt) / 27;
  const looseYd3 = bankYd3 * (1 + swell);
  // Common dump trucks: 10 yd³ (single axle) to 20 yd³ (tandem).
  const loads = looseYd3 / 10;

  return {
    rows: [
      { label: "Bank volume (in-ground)", value: round(bankYd3, 2), unit: "yd³", decimals: 2, primary: true },
      { label: "Loose volume (hauled)", value: round(looseYd3, 2), unit: "yd³", decimals: 2, primary: true, hint: `Swell +${Math.round(swell * 100)}%: excavated soil occupies more space.` },
      { label: "Truckloads (10 yd³)", value: Math.ceil(loads), unit: "loads", decimals: 0 },
      { label: "Weight (typical mixed soil, ~2600 lb/yd³ loose)", value: round(looseYd3 * 1.3, 1), unit: "tons", decimals: 1, hint: "Moist loam ~2600 lb/yd³ loose; clay and wet soil run heavier." },
    ],
    notes: [
      "Model: bank yd³ = L × W × D ÷ 27; loose = bank × (1 + swell). Swell: sand ~15%, mixed soil ~25%, clay ~30-40%.",
      "Disposal is priced per loose yard or per ton — the hauled figure is what the invoice follows, not the hole size.",
      "Trenches for utilities: add the bell hole over-dig and bedding depth before computing if the contract measures them.",
      "OSHA trench safety (protective systems) applies by depth — this calculator only figures volume.",
    ],
  };
}

/** Paint coverage: gallons from wall area, coats, and the paint's spread rate. */
export function paintCoverage(input: CalcInput): CalcOutput {
  const { values } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const heightFt = values.height;
  const coats = Math.round(values.coats);
  const includeCeiling = (input.raw.ceiling ?? "no") === "yes";
  if (lengthFt <= 0 || widthFt <= 0 || heightFt <= 0) throw new Error("Room dimensions must be positive");
  if (coats < 1 || coats > 4) throw new Error("Coats must be between 1 and 4");

  const wallArea = 2 * (lengthFt + widthFt) * heightFt;
  const ceilingArea = includeCeiling ? lengthFt * widthFt : 0;
  const totalArea = wallArea + ceilingArea;
  // Standard spread: ~350-400 ft²/gal per coat for interior latex; use 375.
  const spreadFt2PerGal = values.spread > 0 ? values.spread : 375;
  const gallons = (totalArea * coats) / spreadFt2PerGal;
  const gallonsBuy = Math.ceil(gallons);

  return {
    rows: [
      { label: "Paintable area", value: round(totalArea, 0), unit: "ft²", decimals: 0, primary: true, hint: `${round(wallArea, 0)} ft² walls${includeCeiling ? ` + ${round(ceilingArea, 0)} ft² ceiling` : ""}.` },
      { label: "Paint needed", value: round(gallons, 2), unit: "gal", decimals: 2, primary: true, hint: `${coats} coat(s) at ${spreadFt2PerGal} ft²/gal.` },
      { label: "Gallons to buy", value: gallonsBuy, unit: "gal", decimals: 0, hint: "Rounded up — tint matching across batches is unreliable." },
      { label: "Primer (1 coat, if bare drywall)", value: round(totalArea / 250, 1), unit: "gal", decimals: 1, hint: "Primer spreads slower: ~250 ft²/gal." },
    ],
    notes: [
      "Model: area × coats ÷ spread rate. Openings are NOT deducted — their cut-in labor consumes what the deduction saves.",
      "Spread rates: 375 ft²/gal is typical interior latex on primed drywall; rough or unprimed surfaces drop to 250-300.",
      "Dark color changes usually need tinted primer plus two coats — count three passes, not two.",
      "One gallon covers a 10×12 room's walls once; a 12×12 with ceiling twice needs about 4 gallons.",
    ],
  };
}

/** Tile count with layout waste for square/rectangular tiles. */
export function tileCount(input: CalcInput): CalcOutput {
  const { values } = input;
  const areaFt2 = values.area;
  const tileIn = values.tileSize;
  const pattern = input.raw.pattern ?? "straight";
  if (areaFt2 <= 0) throw new Error("Area must be positive");
  if (tileIn <= 0) throw new Error("Tile size must be positive");

  const tileFt2 = (tileIn * tileIn) / 144;
  const tilesExact = areaFt2 / tileFt2;
  // Waste: straight 10%, diagonal 15% (more diagonal cuts).
  const wastePct = pattern === "diagonal" ? 0.15 : 0.10;
  // Tiny epsilon guards floating-point exactness (100 tiles × 1.10 = 110.000…01).
  const tilesBuy = Math.ceil(tilesExact * (1 + wastePct) - 1e-9);
  // Thinset & grout: ~1 lb per 5 ft² for thinset; grout depends on joint width, use working average.
  const thinsetLb = areaFt2 / 5;
  const groutLb = areaFt2 / 8;

  return {
    rows: [
      { label: "Tiles exact", value: round(tilesExact, 1), unit: `× ${round(tileIn, 1)} in`, decimals: 1 },
      { label: "Tiles to buy", value: tilesBuy, unit: "tiles", decimals: 0, primary: true, hint: `Includes ${Math.round(wastePct * 100)}% ${pattern === "diagonal" ? "diagonal-cut" : "layout"} waste.` },
      { label: "Boxes (10 tiles)", value: Math.ceil(tilesBuy / 10), unit: "boxes", decimals: 0, hint: "Order whole boxes — dye lots vary between batches." },
      { label: "Thinset / grout", value: round(thinsetLb, 0), unit: "lb", decimals: 0, hint: `~${round(groutLb, 0)} lb grout at typical 1/8 in joints.` },
    ],
    notes: [
      "Model: tiles = area ÷ tile face area, with 10% waste (straight lay) or 15% (diagonal, more cuts).",
      "Dye lots: order everything at once — tile from different production batches varies enough to see on a finished floor.",
      "Check the ACTUAL tile dimensions: nominal 12 in tile is often 11⅞ in; use the real dimension for tight estimates.",
      "Large-format tiles (≥ 15 in) need a flat substrate (1/4 in in 10 ft) and back-buttering — count leveling clips ~2 per tile.",
    ],
  };
}
