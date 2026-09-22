/**
 * Construction calculation engines. Pure functions — no React, no side effects.
 * Verified by scripts/verify-engines.ts (reference cases) and scripts/audit-engines.ts
 * (independent dimensional checks).
 *
 * Sources for constants:
 * - Bag yields: 80 lb bag ≈ 0.60 ft³, 60 lb bag ≈ 0.45 ft³, 40 lb bag ≈ 0.30 ft³
 *   (published yields for concrete mix, Quikrete-style).
 * - Mix ratios by volume (cement:sand:gravel) with the standard 1.54 dry-volume
 *   factor that accounts for shrinkage of wet ingredients into voids.
 * - CMU: nominal 8×8×16 in, actual 7.625×7.625×15.625 in; 3 bags mortar per 100
 *   block (masonry convention).
 * - Brick: modular 7.625×2.25×3.625 in actual, 8×2.667×4 in nominal with mortar
 *   joints (US modular); UK 215×102.5×65 mm with 10 mm joints.
 * - Studs: 16 in o.c. default, +1 extra stud per opening, +1 for each end/corner.
 * - Stairs: IRC limits — max riser 7¾ in, min tread 10 in, 2r+t ≈ 25 in rule.
 * - Roof pitch: rise per 12 in run convention; area factor = √(run² + rise²)/run
 *   applied per horizontal unit.
 * - Board foot: 1 BF = 144 in³ of nominal lumber.
 * - Gravel: loose densities — gravel 1.4 t/yd³, sand 1.5 t/yd³, crushed stone 1.6 t/yd³,
 *   topsoil 1.0 t/yd³ (typical supplier figures).
 * - Drywall: 4×8 ft sheets, standard 1/2 in sheet ≈ 54 lb; 4×12 ≈ 81 lb.
 * - Asphalt (hot mix): ≈ 145 lb/ft³ compacted ≈ 2.0 US tons per yd³ at 2 in depth
 *   ≈ 0.055 t/yd² — computed from density, not hardcoded per-thickness.
 * - Footing: Allowable bearing q, required area A = Load / q, sized square.
 * - Rebar: #4 bar = 0.5 in dia, area 0.20 in², 0.668 lb/ft (bar table).
 */
import type { CalcOutput, CalcInput, ChartSpec } from "@/lib/types";
import { round } from "@/lib/format";

const FT3_PER_YD3 = 27;

/** Shape geometry helper — returns filled volume in ft³ (canonical input: feet). */
function shapeVolume(values: Record<string, number>, shape: string): number {
  switch (shape) {
    case "slab": {
      const { length, width, thickness } = values;
      return length * width * thickness;
    }
    case "footing": {
      const { length, width, thickness } = values;
      return length * width * thickness;
    }
    case "wall": {
      const { length, height, thickness } = values;
      return length * height * thickness;
    }
    case "column": {
      const { height, diameter } = values;
      return (Math.PI / 4) * diameter * diameter * height;
    }
    case "circular": {
      const { diameter, height } = values;
      return (Math.PI / 4) * diameter * diameter * height;
    }
    default:
      throw new Error("Unknown shape");
  }
}

const BAG_YIELD_LB: Record<string, { yield: number; label: string }> = {
  "80": { yield: 0.6, label: "80 lb" },
  "60": { yield: 0.45, label: "60 lb" },
  "40": { yield: 0.3, label: "40 lb" },
};

/** Concrete volume + bag count for the selected shape. */
export function concreteVolume(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const shape = raw.shape ?? "slab";
  const volumeFt3 = shapeVolume(values, shape);
  if (volumeFt3 <= 0) throw new Error("Volume computed as zero — check your dimensions are positive");

  const volumeYd3 = volumeFt3 / FT3_PER_YD3;
  const bagKey = raw.bagSize ?? "80";
  const bag = BAG_YIELD_LB[bagKey];
  const bags = Math.ceil(volumeFt3 / bag.yield);
  const waste5 = Math.ceil(volumeFt3 * 1.05 / bag.yield);

  return {
    rows: [
      { label: "Concrete volume", value: round(volumeYd3, 2), unit: "yd³", decimals: 2, primary: true, hint: `${round(volumeFt3, 1)} ft³ = ${round(volumeFt3 * 0.0283168, 2)} m³` },
      { label: `Bags needed (${bag.label})`, value: bags, unit: "bags", decimals: 0, hint: `Each ${bag.label} bag yields ${bag.yield} ft³ mixed.` },
      { label: `Bags with 5% waste`, value: waste5, unit: "bags", decimals: 0, hint: "Recommended order for uneven subgrade and spillage." },
      { label: "Weight (approx.)", value: round(volumeFt3 * 150 / 2000, 0), unit: "tons", decimals: 0, hint: "At ~150 lb/ft³ — useful for delivery and slab load checks." },
    ],
    notes: [
      "Nominal shapes only — openings, chamfers and uneven excavation change real volume.",
      "Order ready-mix in 0.25 yd³ increments; most suppliers charge a short-load fee below ~2 yd³.",
      "Bagged mix is economical under ~1 yd³; above that, ready-mix is faster and usually cheaper per yard.",
    ],
  };
}

/** Concrete mix ratio calculator — cement/sand/gravel/water quantities for a target ratio. */
export function concreteMixRatio(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const targetFt3 = values.volume;
  const ratio = (raw.ratio ?? "1:2:3").split(":").map(Number);
  if (ratio.length !== 3 || ratio.some((r) => !Number.isFinite(r) || r < 0)) throw new Error("Invalid mix ratio");
  const [c, s, g] = ratio;
  const total = c + s + g;
  if (total <= 0) throw new Error("Mix ratio must have at least one positive part");

  // Dry volume = wet volume × 1.54 (voids fill when water is added).
  const dryFt3 = targetFt3 * 1.54;
  const cementFt3 = (dryFt3 * c) / total;
  const sandFt3 = (dryFt3 * s) / total;
  const gravelFt3 = (dryFt3 * g) / total;
  // Water-cement ratio 0.5 by weight: cement bulk density ~94 lb/ft³ (1 bag = 94 lb = 1 ft³).
  const cementLb = cementFt3 * 94;
  const waterLb = cementLb * 0.5;
  const waterGal = waterLb / 8.34;
  const cementBags = cementLb / 94; // 94 lb = 1 US bag of portland cement

  return {
    rows: [
      { label: "Portland cement", value: round(cementBags, 2), unit: "bags (94 lb)", decimals: 2, primary: true, hint: `${round(cementFt3, 2)} ft³ loose volume.` },
      { label: "Sand", value: round(sandFt3 / 27, 3), unit: "yd³", decimals: 3, primary: true, hint: `${round(sandFt3, 1)} ft³` },
      { label: "Gravel", value: round(gravelFt3 / 27, 3), unit: "yd³", decimals: 3, primary: true, hint: `${round(gravelFt3, 1)} ft³` },
      { label: "Water", value: round(waterGal, 1), unit: "gal", decimals: 1, hint: "w/c ratio 0.5 — reduce for higher strength, increase workability with plasticizer not water." },
      { label: "Dry volume total", value: round(dryFt3 / 27, 3), unit: "yd³", decimals: 3, hint: "Wet volume × 1.54 shrinkage factor." },
    ],
    notes: [
      `Mix ${c}:${s}:${g} by volume. 1:2:3 ≈ 3000 psi general purpose; 1:1.5:3 ≈ 3500–4000 psi structural; 1:3:4 ≈ 2500 psi footings.`,
      "94 lb bag of portland cement = 1 ft³ bulk. Additives and moisture in sand shift real yields a few percent.",
      "Batch by buckets of the same size, never by shovelfuls — ratio errors are the main cause of weak concrete.",
    ],
  };
}

/** CMU (concrete masonry unit) block wall calculator. */
export function cmuBlockWall(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const wallFt2 = values.length * values.height;
  const sizeKey = raw.size ?? "8x8x16";
  // Face area of ONE block with mortar joint included (nominal dims).
  const nominal: Record<string, { w: number; h: number; label: string }> = {
    "4x8x16": { w: 16 / 12, h: 8 / 12, label: "4×8×16 in" },
    "6x8x16": { w: 16 / 12, h: 8 / 12, label: "6×8×16 in" },
    "8x8x16": { w: 16 / 12, h: 8 / 12, label: "8×8×16 in" },
    "8x4x16": { w: 16 / 12, h: 4 / 12, label: "8×4×16 in (half-high)" },
    "12x8x16": { w: 16 / 12, h: 8 / 12, label: "12×8×16 in" },
  };
  const block = nominal[sizeKey];
  if (!block) throw new Error("Unknown block size");
  const blocksPerFt2 = 1 / (block.w * block.h);
  const blocks = Math.ceil(wallFt2 * blocksPerFt2 * 1.05); // 5% breakage allowance
  const mortarBags = Math.ceil((blocks / 130) * 3); // ~3 bags per 100–130 block
  const sandFt3 = Math.ceil(blocks / 130) * 3; // ~3 ft³ sand per 100 block

  return {
    rows: [
      { label: "Blocks needed", value: blocks, unit: "CMU", decimals: 0, primary: true, hint: `${round(blocksPerFt2 * 100, 1)} blocks per 100 ft² of wall (${block.label} nominal).` },
      { label: "Wall area", value: round(wallFt2, 1), unit: "ft²", decimals: 1 },
      { label: "Mortar (Type N bags)", value: mortarBags, unit: "bags", decimals: 0, hint: "3 bags per 130 block is the working average." },
      { label: "Mason sand", value: sandFt3, unit: "ft³", decimals: 0, hint: "Roughly 1 yd³ sand per 300–350 block delivered." },
      { label: "Wall weight (approx.)", value: round(blocks * 35 / 2000, 2), unit: "tons", decimals: 2, hint: "~35 lb per 8×8×16 CMU — for footing and scaffold checks." },
    ],
    notes: [
      "Nominal dimensions include one 3/8 in mortar joint — actual block is 3/8 in smaller in each face dimension.",
      "Openings over ~20 ft² should be deducted: subtract their area × blocks-per-ft² and add lintel/block credit back.",
      "Reinforced cells, bond beams and control joints add special units not counted here.",
    ],
  };
}

/** Brick wall calculator (US modular and UK standard). */
export function brickWall(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const wallFt2 = values.length * values.height;
  const standard = raw.standard ?? "us-modular";
  const bond = raw.bond ?? "stretcher";

  // Bricks per ft² of wall face, including mortar joints, by bond pattern.
  const perFt2: Record<string, Record<string, number>> = {
    "us-modular": { stretcher: 6.9, english: 13.5, flemish: 10.0 },
    "uk": { stretcher: 60, english: 117, flemish: 87 }, // per m² converted: ×0.0929 → per ft²
  };
  const brickLabel: Record<string, string> = {
    "us-modular": "US modular (7⅝×2¼ in actual, nominal with joints)",
    "uk": "UK standard (215×65 mm + 10 mm joints)",
  };

  let bricksPerUnitArea: number;
  if (standard === "uk") {
    // UK: 60 per m² stretcher → convert to per ft²
    bricksPerUnitArea = perFt2.uk[bond] * 0.0929;
  } else {
    bricksPerUnitArea = perFt2[standard][bond];
  }
  const unitLabel = standard === "uk" ? "UK bricks" : "US modular bricks";
  const bricks = Math.ceil(wallFt2 * bricksPerUnitArea * 1.05); // 5% waste/breakage

  // Mortar: ~0.7 ft³ per 1000 modular bricks (stretcher bond working average)
  const mortarFactor = bond === "stretcher" ? 0.7 : 1.1;
  const mortarFt3 = Math.ceil((bricks / 1000) * mortarFactor);
  const mortarBags = Math.ceil(mortarFt3 / 1.1); // 50 lb bag of dry mortar mix ≈ 1.1 ft³ laid

  return {
    rows: [
      { label: "Bricks needed", value: bricks, unit: unitLabel, decimals: 0, primary: true, hint: `${round(bricksPerUnitArea * 100, 1)} per 100 ft² (${bond} bond, joints included).` },
      { label: "Wall area", value: round(wallFt2, 1), unit: "ft²", decimals: 1 },
      { label: "Mortar volume", value: round(mortarFt3, 1), unit: "ft³", decimals: 1 },
      { label: "Mortar bags (50 lb)", value: mortarBags, unit: "bags", decimals: 0, hint: "50 lb bag of dry mortar mix ≈ 1.1 ft³ laid." },
    ],
    notes: [
      brickLabel[standard],
      bond === "stretcher"
        ? "Stretcher bond: all stretchers, half-brick overlaps — the most common wall pattern."
        : bond === "english"
        ? "English bond: alternating courses of stretchers and headers — thicker, structural walls."
        : "Flemish bond: alternating stretcher and header within each course — decorative double-wythe look.",
      "Single-wythe (4 in) walls assumed; double-wythe doubles the brick count per wall area.",
      "Openings should be deducted from wall area before ordering; add 5% waste (already included).",
    ],
  };
}

/** Rebar grid for slabs: bar count, length with laps, and weight. */
export function rebarGrid(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const spacingIn = values.spacing;
  if (lengthFt <= 0 || widthFt <= 0) throw new Error("Slab dimensions must be positive");
  if (spacingIn <= 0 || spacingIn > 48) throw new Error("Spacing must be between 0 and 48 inches");

  const barSize = raw.bar ?? "4";
  // Bar data (ASTM A615): diameter in, weight lb/ft.
  const bars: Record<string, { dia: number; wgt: number; area: number }> = {
    "3": { dia: 0.375, wgt: 0.376, area: 0.11 },
    "4": { dia: 0.5, wgt: 0.668, area: 0.20 },
    "5": { dia: 0.625, wgt: 1.043, area: 0.31 },
    "6": { dia: 0.75, wgt: 1.502, area: 0.44 },
    "7": { dia: 0.875, wgt: 2.044, area: 0.60 },
    "8": { dia: 1.0, wgt: 2.670, area: 0.79 },
  };
  const bar = bars[barSize];
  if (!bar) throw new Error("Unknown bar size");

  const lapFt = values.lap ?? 1.5; // default 18 in lap splice
  const direction = raw.direction ?? "both";

  // Number of bars: ceil(dimension × 12 / spacing) + 1 per direction.
  const barsAlongLength = direction === "one" ? 0 : Math.ceil((widthFt * 12) / spacingIn) + 1;
  const barsAlongWidth = Math.ceil((lengthFt * 12) / spacingIn) + 1;
  const totalBars = barsAlongLength + barsAlongWidth;

  const totalLengthFt =
    barsAlongLength * (lengthFt + lapFt) + barsAlongWidth * (widthFt + lapFt);
  const totalWeight = totalLengthFt * bar.wgt;

  // Reinforcement ratio check: As per foot of slab width vs 0.0018·b·d (shrinkage/temperature, ACI).
  const areaPerFt = (12 / spacingIn) * bar.area;
  const slabThicknessIn = values.thickness ?? 4;
  const minRatioArea = 0.0018 * 12 * (slabThicknessIn - 1.5); // b=12 in, d ≈ h − 1.5 in cover
  const ratioOk = areaPerFt >= minRatioArea;

  // Chart: steel area per foot vs spacing for the selected bar, with the ACI
  // minimum as a reference line — the crossing point is the tightest allowed spacing.
  const spacings = [4, 6, 8, 10, 12, 16, 18, 24];
  const chart: ChartSpec = {
    title: `Steel area per foot of width vs. spacing (#${barSize} bar)`,
    xLabel: "Bar spacing (in)",
    yLabel: "As per ft of width (in²/ft)",
    refLine: { y: minRatioArea, label: `ACI min ${round(minRatioArea, 3)} in²/ft`, color: "var(--err)" },
    series: [
      {
        label: `#${barSize} bar`,
        color: "var(--blue-600)",
        points: spacings.map((s) => ({ x: s, y: (12 / s) * bar.area })),
      },
    ],
  };

  return {
    rows: [
      { label: "Total rebar length", value: round(totalLengthFt, 0), unit: "ft", decimals: 0, primary: true, hint: `${totalBars} bars at ${spacingIn} in spacing, +${lapFt} ft lap per bar.` },
      { label: "Total rebar weight", value: round(totalWeight, 0), unit: "lb", decimals: 0, primary: true, hint: `#${barSize} bar: ${bar.wgt} lb/ft, ${round(bar.area, 2)} in² cross-section.` },
      { label: `Bars along length`, value: barsAlongLength, unit: "bars", decimals: 0, hint: `Run across the ${round(widthFt, 1)} ft width.` },
      { label: `Bars along width`, value: barsAlongWidth, unit: "bars", decimals: 0, hint: `Run across the ${round(lengthFt, 1)} ft length.` },
      { label: "Steel area per ft of width", value: round(areaPerFt, 3), unit: "in²/ft", decimals: 3, hint: ratioOk ? `Meets ACI 0.0018·b·d minimum (${round(minRatioArea, 3)} in²/ft).` : `Below ACI shrinkage minimum of ${round(minRatioArea, 3)} in²/ft — reduce spacing or increase bar size.` },
    ],
    chart,
    notes: [
      "Lap splice default 18 in (common practice, Class B); structural laps can require 30–40× bar diameter.",
      "Slab-on-grade shrinkage/temperature reinforcement: ACI minimum 0.0018 × gross area in each direction.",
      " chairs/supports every 3–4 ft to hold position during pour; wire ties at intersections.",
    ],
  };
}

/** Spread footing size from column load and allowable soil bearing. */
export function footingSize(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const load = values.load; // kips (canonical)
  const q = values.bearing; // ksf (canonical)
  if (load <= 0) throw new Error("Column load must be positive");
  if (q <= 0 || q > 20) throw new Error("Allowable bearing must be between 0 and 20 ksf");

  const shape = raw.shape ?? "square";
  const selfWeightFactor = 1.1; // footing + soil above (10% of column load typical)
  const requiredArea = (load * selfWeightFactor) / q;

  let result: { label: string; dim: number; area: number };
  if (shape === "square") {
    const side = Math.sqrt(requiredArea);
    result = { label: "Square footing", dim: side, area: side * side };
  } else if (shape === "circular") {
    const dia = Math.sqrt((4 * requiredArea) / Math.PI);
    result = { label: "Circular footing", dim: dia, area: (Math.PI / 4) * dia * dia };
  } else {
    // rectangular with 1.5:1 aspect
    const width = Math.sqrt(requiredArea / 1.5);
    result = { label: "Rectangular footing (1.5:1)", dim: width, area: width * width * 1.5 };
  }

  const nextHalfFt = Math.ceil(result.dim * 2) / 2; // snap up to nearest 0.5 ft
  const actualArea = shape === "rectangular" ? nextHalfFt * (nextHalfFt * 1.5) : nextHalfFt * nextHalfFt;
  const bearingPressure = (load * selfWeightFactor) / actualArea;

  return {
    rows: [
      { label: `${result.label} — required`, value: round(result.dim, 2), unit: shape === "circular" ? "ft diameter" : "ft width", decimals: 2, primary: true, hint: `Area ${round(result.area, 2)} ft².` },
      { label: "Practical size (snap 0.5 ft)", value: nextHalfFt, unit: shape === "circular" ? "ft dia" : "ft", decimals: 1, hint: shape === "rectangular" ? `Plan ${nextHalfFt} × ${round(nextHalfFt * 1.5, 1)} ft.` : undefined },
      { label: "Actual bearing pressure", value: round(bearingPressure, 3), unit: "ksf", decimals: 3, hint: `Allowable ${round(q, 2)} ksf — utilization ${round((bearingPressure / q) * 100, 0)}%.` },
      { label: "Required area", value: round(requiredArea, 2), unit: "ft²", decimals: 2 },
    ],
    notes: [
      "A = Load / q with a 10% allowance for footing self-weight and soil above — the standard preliminary sizing method.",
      "Typical allowable bearing: sand 1.5–3 ksf, stiff clay 2–4 ksf, gravel 3–6 ksf. Always confirm with a geotechnical report.",
      "This sizes for bearing only — punching shear, one-way shear and flexural steel thickness need the column geometry.",
    ],
  };
}

/** Stud wall framing calculator. */
export function studWall(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const lengthFt = values.length;
  const heightFt = values.height;
  const spacingIn = Number(raw.spacing ?? "16"); // spacing arrives as a select string
  if (lengthFt <= 0 || heightFt <= 0) throw new Error("Wall dimensions must be positive");
  if (!Number.isFinite(spacingIn) || spacingIn < 8 || spacingIn > 48) throw new Error("Stud spacing must be between 8 and 48 inches");

  const openings = values.openings ?? 0;
  const plates = 3; // single bottom + double top (standard)
  const studLengthFt = heightFt - (3 * 1.5) / 12; // subtract 3 plates × 1.5 in = 4.5 in

  // Layout: studs at OC spacing along length; +1 for each end.
  const bayCount = Math.ceil((lengthFt * 12) / spacingIn);
  const studsFromLayout = bayCount + 1;
  const extraForOpenings = openings * 2; // 2 jack/king studs added per opening (avg door/window)
  const totalStuds = studsFromLayout + extraForOpenings;

  const plateLengthFt = plates * lengthFt;
  const totalBoardFeet = totalStuds * studLengthFt * (1.5 * 3.5) / 144 + plateLengthFt * (1.5 * 3.5) / 144;

  return {
    rows: [
      { label: "Studs needed", value: totalStuds, unit: "pcs", decimals: 0, primary: true, hint: `${bayCount} bays at ${spacingIn} in OC + 1, plus ${extraForOpenings} for ${openings} opening(s).` },
      { label: "Stud length (cut)", value: round(studLengthFt * 12, 1), unit: "in", decimals: 1, hint: `Wall height ${round(heightFt * 12, 0)} in minus 3 plates (4.5 in total).` },
      { label: "Plate lumber", value: round(plateLengthFt, 0), unit: "ft", decimals: 0, hint: "3 plates (1 bottom + 2 top) run the full wall length." },
      { label: "Board feet (2×4)", value: round(totalBoardFeet, 0), unit: "BF", decimals: 0, hint: "Nominal 2×4 = 1.5×3.5 in actual." },
      { label: "Wall sheathing", value: Math.ceil(lengthFt * heightFt / 32), unit: "sheets (4×8)", decimals: 0, hint: "4×8 sheet = 32 ft²; order 10% extra for cuts (not included)." },
    ],
    notes: [
      "16 in OC is standard for residential walls; 24 in OC works with stronger sheathing and limits drywall cracks.",
      "Openings add 2 studs each on average (jack + king); headers add lumber proportional to opening width.",
      "Corners and intersections need backup studs (3-stud corner) — add 2–3 per corner if applicable.",
    ],
  };
}

/** Stair calculator — rise/run layout with IRC checks. */
export function stairLayout(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const totalRiseIn = values.rise; // canonical inches
  const targetRiserIn = values.riser;
  if (totalRiseIn <= 0) throw new Error("Total rise must be positive");
  if (targetRiserIn <= 0 || targetRiserIn > 12) throw new Error("Target riser must be between 0 and 12 inches");

  // Number of risers = total rise / target, rounded to whole number.
  const risers = Math.round(totalRiseIn / targetRiserIn);
  if (risers < 2) throw new Error("Need at least 2 risers");
  const actualRiser = totalRiseIn / risers;
  const treads = risers - 1; // top landing serves as last tread
  const treadRun = values.tread; // user-set tread depth (canonical inches)
  const totalRunIn = treads * treadRun;
  const stringerLengthIn = Math.sqrt(totalRunIn ** 2 + totalRiseIn ** 2);

  // IRC limits: max riser 7¾ in, min tread 10 in.
  const riserOk = actualRiser <= 7.75;
  const treadOk = treadRun >= 10;
  const comfort = actualRiser * 2 + treadRun; // 2r+t rule, ideal 24–25.5
  const comfortOk = comfort >= 24 && comfort <= 25.5;

  const chart: ChartSpec = {
    title: "Stair profile",
    xLabel: "Horizontal run (in)",
    yLabel: "Height (in)",
    series: [
      {
        label: "Stair profile",
        color: "var(--blue-600)",
        // Step path: for each riser, vertical up then horizontal along the tread.
        points: Array.from({ length: risers * 2 }, (_, i) => {
          const step = Math.floor(i / 2);
          const x = step * treadRun + (i % 2 === 1 ? treadRun : 0);
          const y = (step + 1) * actualRiser;
          return { x, y };
        }),
      },
    ],
  };

  return {
    rows: [
      { label: "Number of risers", value: risers, unit: "risers", decimals: 0, primary: true, hint: `${treads} treads (top floor counts as the last tread).` },
      { label: "Actual riser height", value: round(actualRiser, 3), unit: "in", decimals: 3, primary: true, hint: riserOk ? "Within IRC max of 7¾ in." : "EXCEEDS IRC max of 7¾ in — add a riser or lower the target." },
      { label: "Tread depth", value: round(treadRun, 2), unit: "in", decimals: 2, hint: treadOk ? "Meets IRC min of 10 in." : "BELOW IRC min of 10 in — unsafe and non-compliant." },
      { label: "Total run (footprint)", value: round(totalRunIn / 12, 2), unit: "ft", decimals: 2, primary: true, hint: `${round(totalRunIn, 1)} in horizontal.` },
      { label: "Stringer length", value: round(stringerLengthIn / 12, 2), unit: "ft", decimals: 2, hint: "Hypotenuse — cut before ordering; 2×12 typically clears risers up to ~8 in." },
      { label: "Comfort rule 2r + t", value: round(comfort, 1), unit: "in", decimals: 1, hint: comfortOk ? "Ideal range (24–25.5 in) — comfortable stair." : `Outside the 24–25.5 in comfort band. ${comfort < 24 ? "Steeper than ideal." : "Shallower than ideal."}` },
    ],
    chart,
    notes: [
      "IRC R311.7: max riser 7¾ in, min tread 10 in (measured nose-to-nose), max variation 3/8 in between any two risers or treads.",
      "Headroom min 6 ft 8 in above the nose of any tread — check against the finished floor above.",
      "Handrails required at 34–38 in above nosing; guards if drop exceeds 30 in.",
    ],
  };
}

/** Roof pitch calculator — angle, slope, rafter length, roof area. */
export function roofPitch(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const rise = values.rise; // in, per 12 in run
  const footprintFt2 = values.area;
  if (rise <= 0) throw new Error("Rise must be positive");

  const slopeAngleRad = Math.atan(rise / 12);
  const angleDeg = (slopeAngleRad * 180) / Math.PI;
  const slopePercent = (rise / 12) * 100;
  const areaFactor = Math.sqrt(12 * 12 + rise * rise) / 12;
  const roofAreaFt2 = footprintFt2 * areaFactor;

  const chart: ChartSpec = {
    title: "Roof cross-section",
    xLabel: "Horizontal run (ft)",
    yLabel: "Rise (ft)",
    series: [
      {
        label: "Roof slope",
        color: "var(--signal)",
        points: [
          { x: 0, y: 0 },
          { x: 10, y: 10 * (rise / 12) },
        ],
      },
    ],
  };

  return {
    rows: [
      { label: "Pitch angle", value: round(angleDeg, 2), unit: "°", decimals: 2, primary: true },
      { label: "Slope (grade)", value: round(slopePercent, 1), unit: "%", decimals: 1 },
      { label: "Roof area factor", value: round(areaFactor, 4), unit: "×", decimals: 4, primary: true, hint: `Multiply footprint by this to get actual sloped area — here ${round(roofAreaFt2, 0)} ft² for a ${round(footprintFt2, 0)} ft² footprint.` },
      { label: "Rafter length per ft of run", value: round(Math.sqrt(1 + (rise / 12) ** 2), 3), unit: "ft/ft", decimals: 3 },
    ],
    chart,
    notes: [
      `Pitch ${rise}:12 = ${round(angleDeg, 1)}°. Common range: 4:12 to 8:12 for asphalt shingles (min 2:12 with double underlayment).`,
      "Rafter length = run × factor. Add overhangs separately: each 1 ft of eave overhang adds a full factor of rafter length.",
      "Low-slope roofs (under 3:12) need membrane systems, not standard shingles.",
    ],
  };
}

/** Board foot calculator. */
export function boardFoot(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const thicknessQtr = values.thickness; // canonical: quarter-inches (nominal)
  const widthIn = values.width; // nominal inches
  const lengthFt = values.length;
  const pieces = values.pieces ?? 1;
  const pricePerBf = values.price;

  if (thicknessQtr <= 0 || widthIn <= 0 || lengthFt <= 0) throw new Error("Dimensions must be positive");

  const bfPerPiece = (thicknessQtr / 4) * widthIn * lengthFt / 12;
  const totalBf = bfPerPiece * pieces;
  const cost = pricePerBf > 0 ? totalBf * pricePerBf : undefined;

  return {
    rows: [
      { label: "Board feet", value: round(totalBf, 2), unit: "BF", decimals: 2, primary: true, hint: `${pieces} pc × ${round(bfPerPiece, 3)} BF each.` },
      { label: "Total cost", value: round(cost ?? 0, 2), unit: "$", decimals: 2, hint: pricePerBf > 0 ? `At $${round(pricePerBf, 2)} per BF.` : "Enter a price per BF to see the cost." },
      { label: "Volume (ft³)", value: round(totalBf / 12, 3), unit: "ft³", decimals: 3, hint: "1 BF = 144 in³ = 1/12 ft³ of nominal lumber." },
    ],
    notes: [
      "Board foot uses NOMINAL dimensions: a 2×4×8 is 2 in thick × 4 in wide × 8 ft = 5.33 BF, regardless of the milled 1.5×3.5 in actual size.",
      "Thickness is entered in quarter-inches (4/4, 5/4, 6/4, 8/4) — the standard hardwood lumber convention.",
      "Hardwood lumber is sold by the BF random-width; softwood construction lumber by the piece. This tool prices hardwood.",
    ],
  };
}

/** Gravel / aggregate calculator. */
export function gravelVolume(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const depthIn = values.depth;
  const material = raw.material ?? "gravel";
  if (lengthFt <= 0 || widthFt <= 0 || depthIn <= 0) throw new Error("All dimensions must be positive");

  const volumeFt3 = lengthFt * widthFt * (depthIn / 12);
  const volumeYd3 = volumeFt3 / 27;

  // Densities in tons per yd³ (loose, delivered).
  const density: Record<string, { t: number; label: string }> = {
    gravel: { t: 1.4, label: "Pea gravel / river rock" },
    sand: { t: 1.5, label: "Sand" },
    crushed: { t: 1.6, label: "Crushed stone (¾ in minus)" },
    topsoil: { t: 1.0, label: "Topsoil" },
    mulch: { t: 0.4, label: "Mulch / bark" },
  };
  const mat = density[material];
  if (!mat) throw new Error("Unknown material");
  const tons = volumeYd3 * mat.t;
  const withWaste = tons * 1.1;

  return {
    rows: [
      { label: "Volume needed", value: round(volumeYd3, 2), unit: "yd³", decimals: 2, primary: true, hint: `${round(volumeFt3, 1)} ft³ — order in ½ yd³ increments.` },
      { label: "Weight", value: round(tons, 2), unit: "tons", decimals: 2, primary: true, hint: `${mat.label} at ~${mat.t} t/yd³ loose.` },
      { label: "Order with 10% margin", value: round(withWaste, 2), unit: "tons", decimals: 2, hint: "Uneven subgrade and settling eat the margin." },
      { label: "Bags (0.5 ft³)", value: Math.ceil(volumeFt3 / 0.5), unit: "bags", decimals: 0, hint: "Retail 0.5 ft³ bags — economical only for small areas." },
    ],
    notes: [
      "Densities are loose-delivered figures; compacted in-place weight is 10–15% higher.",
      "Driveways: 4–6 in of crushed stone; decorative beds: 2–3 in; drainage fill: depth per design.",
      "Delivery trucks typically carry 10–20 tons — check access before ordering full loads.",
    ],
  };
}

/** Drywall calculator. */
export function drywallCalc(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  // Wall board area = full room perimeter × height; ceiling adds L × W.
  const widthFt = values.width;
  const wallFt2 = 2 * (values.length + widthFt) * values.height;
  const ceilingFt2 = raw.includeCeiling === "yes" ? values.length * widthFt : 0;
  const totalFt2 = wallFt2 + ceilingFt2;
  if (!Number.isFinite(totalFt2) || values.length <= 0 || widthFt <= 0 || values.height <= 0)
    throw new Error("All room dimensions must be positive");

  const sheetSize = raw.sheet ?? "4x8";
  const sheetArea: Record<string, number> = { "4x8": 32, "4x10": 40, "4x12": 48 };
  const area = sheetArea[sheetSize];
  if (!area) throw new Error("Unknown sheet size");

  // 15% waste factor (standard for drywall — cuts around openings).
  const sheets = Math.ceil((totalFt2 * 1.15) / area);
  const thickness = raw.thickness ?? "0.5";
  const sheetWeight: Record<string, number> = { "0.25": 38, "0.375": 45, "0.5": 54, "0.625": 72 };
  const perSheet = sheetWeight[thickness];
  const totalWeight = sheets * perSheet;

  // Joint compound & tape: ~1.5 gallons mud + 0.3 rolls tape per 100 ft².
  const mudGallons = Math.ceil((totalFt2 / 100) * 1.5);
  const tapeRolls = Math.ceil((totalFt2 / 100) * 0.3);
  const screwsLb = totalFt2 / 400; // ~1 lb of screws per 400 ft² of single layer

  return {
    rows: [
      { label: "Sheets needed", value: sheets, unit: `${sheetSize} sheets`, decimals: 0, primary: true, hint: `${round(totalFt2, 0)} ft² with 15% waste allowance.` },
      { label: "Total weight", value: round(totalWeight, 0), unit: "lb", decimals: 0, hint: `½ in standard sheet ≈ ${perSheet} lb — plan delivery accordingly.` },
      { label: "Joint compound", value: mudGallons, unit: "gal", decimals: 0, hint: "Covers tape + 3 finish coats." },
      { label: "Joint tape", value: tapeRolls, unit: "rolls", decimals: 0 },
      { label: "Screws", value: round(screwsLb, 1), unit: "lb", decimals: 1, hint: "1 lb covers ~400 ft² of single layer." },
    ],
    notes: [
      "Deduct large openings (>20 ft²) from the wall area before entering if precision matters; standard doors/windows need not be deducted (waste factor covers cuts).",
      "Longer sheets (4×12) mean fewer butt joints on walls under 9 ft — worth the handling effort for finishing quality.",
      "Moisture-resistant (green board) and fire-rated (Type X) sheets weigh slightly more.",
    ],
  };
}

/** Asphalt (hot mix) tonnage calculator. */
export function asphaltTonnage(input: CalcInput): CalcOutput {
  const { values, raw } = input;
  const lengthFt = values.length;
  const widthFt = values.width;
  const depthIn = values.depth;
  if (lengthFt <= 0 || widthFt <= 0 || depthIn <= 0) throw new Error("All dimensions must be positive");

  const compactedFt3 = lengthFt * widthFt * (depthIn / 12);
  // Hot mix asphalt density: ~145 lb/ft³ compacted (standard 2 in mat ≈ 110 lb/yd²).
  const densityPcf = 145;
  const looseFactor = 1.25; // loose (delivered, before compaction) is ~25% thicker
  const tons = (compactedFt3 * densityPcf) / 2000;
  const tonsLoose = tons * looseFactor;
  const areaYd2 = (lengthFt * widthFt) / 9;

  return {
    rows: [
      { label: "Asphalt needed (compacted)", value: round(tons, 2), unit: "tons", decimals: 2, primary: true, hint: `${round(compactedFt3, 1)} ft³ at ${densityPcf} lb/ft³ compacted.` },
      { label: "Order quantity (loose)", value: round(tonsLoose, 2), unit: "tons", decimals: 2, primary: true, hint: `+25% to account for compaction from ${depthIn} in loose to ${round(depthIn / 1.25, 2)} in compacted.` },
      { label: "Area", value: round(areaYd2, 1), unit: "yd²", decimals: 1, hint: "Paving is often quoted per square yard." },
      { label: "Cost estimate", value: round(tonsLoose * values.price, 2), unit: "$", decimals: 2, hint: `At $${round(values.price, 0)} per ton (material only — paving labor adds 2–4× the material cost).` },
    ],
    notes: [
      "Typical depths: residential driveway 3–4 in compacted (in 2 lifts); parking areas 4–6 in; overlay 1.5–2 in.",
      "Density 145 lb/ft³ assumes standard dense-graded hot mix; open-graded or lighter mixes run 130–140 lb/ft³.",
      "Hot mix cools fast — small loads from batch plants often carry minimum-load charges.",
    ],
  };
}
