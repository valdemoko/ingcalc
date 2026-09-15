/**
 * Mechanical calculation engines — batch 2. Pure functions.
 * New calculators: pulley RPM, hydraulic cylinder, gear geometry (module),
 * metal weight, engine displacement, compression ratio, spring rate,
 * torque wrench extension, pump hydraulic power, chain length, bearing life.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Pulley speed from driver/driven diameters. */
export function pulleyRpm(input: CalcInput): CalcOutput {
  const { values } = input;
  const dDriver = values.dDriver;
  const dDriven = values.dDriven;
  const rpmDriver = values.rpmDriver;
  if (dDriver <= 0 || dDriven <= 0 || rpmDriver <= 0) throw new Error("All values must be positive");

  const rpmDriven = rpmDriver * (dDriver / dDriven);
  const beltSpeed = (Math.PI * dDriver * rpmDriver) / 1000 / 60; // m/s

  return {
    rows: [
      { label: "Driven RPM", value: round(rpmDriven, 1), unit: "RPM", decimals: 1, primary: true, hint: "n₂ = n₁ × d₁/d₂." },
      { label: "Speed ratio", value: round(dDriven / dDriver, 3), unit: ":1", decimals: 3 },
      { label: "Belt speed", value: round(beltSpeed, 2), unit: "m/s", decimals: 2, hint: "V-belt maximum ~25–30 m/s; above that, consider synchronous belts." },
    ],
    notes: [
      "Model: driven RPM = driver RPM × (driver diameter ÷ driven diameter), using pitch diameters.",
      "Belt speed above ~30 m/s for V-belts causes centrifugal belt lift and short life.",
      "RPM limits for pulleys depend on bearing ratings and balance quality — check manufacturer data at high speed.",
    ],
  };
}

/** Hydraulic cylinder: force, pressure area relationships. */
export function hydraulicCylinder(input: CalcInput): CalcOutput {
  const { values } = input;
  const bore = values.bore;
  const rod = values.rod;
  const pressure = values.pressure;
  const mode = input.raw.mode ?? "extend";
  if (bore <= 0 || pressure <= 0) throw new Error("Bore and pressure must be positive");
  if (rod < 0) throw new Error("Rod diameter cannot be negative");
  if (rod >= bore) throw new Error("Rod must be smaller than bore");

  const boreM2 = Math.PI * Math.pow(bore / 2000, 2); // m²
  const annM2 = boreM2 - Math.PI * Math.pow(rod / 2000, 2);
  const area = mode === "extend" ? boreM2 : annM2;
  const forceN = pressure * 1e6 * area;

  return {
    rows: [
      { label: "Force", value: round(forceN / 1000, 1), unit: "kN", decimals: 1, primary: true, hint: `${mode === "extend" ? "Full bore area" : "Annulus area"} × pressure.` },
      { label: "Force (imperial)", value: round(forceN * 0.224809, 0), unit: "lbf", decimals: 0, primary: true },
      { label: "Effective area", value: round(area * 1e4, 2), unit: "cm²", decimals: 2 },
      { label: "Retract force", value: round(pressure * 1e6 * annM2 / 1000, 1), unit: "kN", decimals: 1, hint: "Lower than extend force — the rod reduces area." },
    ],
    notes: [
      "Model: F = P × A. Extend uses the full bore area; retract uses the annulus (bore minus rod).",
      "Real force is 5–10% lower due to seal friction and line losses — size the valve and relief accordingly.",
      "Buckling matters for long-stroke cylinders in compression: check the rod column load.",
    ],
  };
}

/** Gear geometry from module and teeth (metric module system). */
export function gearGeometry(input: CalcInput): CalcOutput {
  const { values } = input;
  const module_ = values.module;
  const teeth = values.teeth;
  if (module_ <= 0 || teeth <= 0) throw new Error("Module and teeth must be positive");

  const pitchDia = module_ * teeth;
  const outerDia = pitchDia + 2 * module_;
  const rootDia = pitchDia - 2.5 * module_;
  const circularPitch = Math.PI * module_;
  const toothDepth = 2.25 * module_;

  return {
    rows: [
      { label: "Pitch diameter", value: round(pitchDia, 3), unit: "mm", decimals: 3, primary: true, hint: "d = m × z." },
      { label: "Outside diameter", value: round(outerDia, 3), unit: "mm", decimals: 3 },
      { label: "Root diameter", value: round(rootDia, 3), unit: "mm", decimals: 3 },
      { label: "Circular pitch", value: round(circularPitch, 3), unit: "mm", decimals: 3, hint: "p = π × m." },
      { label: "Whole tooth depth", value: round(toothDepth, 3), unit: "mm", decimals: 3 },
    ],
    notes: [
      "Standard full-depth involute teeth, ISO module system (m = d/z).",
      "Two gears mesh when they share the same module — the geometry above guarantees interchangeability.",
      "Center distance between two meshing gears = (z₁ + z₂) × m / 2.",
    ],
  };
}

/** Metal weight from shape and dimensions. */
const DENSITIES: Record<string, number> = {
  steel: 7.85, stainless: 7.9, aluminum: 2.7, brass: 8.5, copper: 8.96,
  cast_iron: 7.2, titanium: 4.51, lead: 11.34, zinc: 7.14, magnesium: 1.74,
}; // g/cm³

export function metalWeight(input: CalcInput): CalcOutput {
  const shape = input.raw.shape ?? "round";
  const material = input.raw.material ?? "steel";
  const { values } = input;
  const density = DENSITIES[material];
  if (!density) throw new Error("Unknown material");

  let volumeCm3: number;
  switch (shape) {
    case "round": {
      const dia = values.diameter, len = values.length;
      if (!(dia > 0 && len > 0)) throw new Error("Diameter and length must be positive");
      volumeCm3 = Math.PI * Math.pow(dia / 20, 2) * (len / 10);
      break;
    }
    case "square_bar": {
      const side = values.side, len = values.length;
      if (!(side > 0 && len > 0)) throw new Error("Side and length must be positive");
      volumeCm3 = Math.pow(side / 10, 2) * (len / 10);
      break;
    }
    case "plate": {
      const w = values.width, h = values.height, t = values.thickness;
      if (!(w > 0 && h > 0 && t > 0)) throw new Error("Width, height and thickness must be positive");
      volumeCm3 = (w / 10) * (h / 10) * (t / 10);
      break;
    }
    case "tube": {
      const od = values.od, wall = values.wall, len = values.length;
      if (!(od > 0 && wall > 0 && len > 0)) throw new Error("OD, wall and length must be positive");
      if (wall >= od / 2) throw new Error("Wall must be less than half the OD");
      volumeCm3 = Math.PI * (Math.pow(od / 20, 2) - Math.pow((od - 2 * wall) / 20, 2)) * (len / 10);
      break;
    }
    default:
      throw new Error("Unknown shape");
  }

  const kg = (volumeCm3 * density) / 1000;
  const lb = kg * 2.20462;

  return {
    rows: [
      { label: "Weight", value: round(kg, 3), unit: "kg", decimals: 3, primary: true, hint: `${shape.replace("_", " ")}, ${material.replace("_", " ")} (${density} g/cm³).` },
      { label: "Weight", value: round(lb, 2), unit: "lb", decimals: 2, primary: true },
      { label: "Volume", value: round(volumeCm3, 1), unit: "cm³", decimals: 1 },
    ],
    notes: [
      "Nominal densities at room temperature; alloys vary ±1–2%.",
      "Add ~2% for mill tolerance on plate thickness and tube walls when ordering material.",
      "kg per meter for round bar: 0.00617 × d² (d in mm) for steel — useful mental check.",
    ],
  };
}

/** Engine displacement from bore, stroke, cylinders. */
export function engineDisplacement(input: CalcInput): CalcOutput {
  const { values } = input;
  const bore = values.bore;
  const stroke = values.stroke;
  const cylinders = Math.round(values.cylinders);
  if (bore <= 0 || stroke <= 0 || cylinders <= 0) throw new Error("All values must be positive");

  const ccPerCyl = Math.PI * Math.pow(bore / 2, 2) * stroke / 1000; // mm³ → cc
  const totalCc = ccPerCyl * cylinders;
  const liters = totalCc / 1000;
  const cubicInches = totalCc * 0.0610237;

  return {
    rows: [
      { label: "Displacement", value: round(totalCc, 0), unit: "cc", decimals: 0, primary: true },
      { label: "Displacement", value: round(liters, 2), unit: "L", decimals: 2, primary: true },
      { label: "Displacement", value: round(cubicInches, 1), unit: "in³ (CID)", decimals: 1 },
      { label: "Per cylinder", value: round(ccPerCyl, 1), unit: "cc", decimals: 1 },
    ],
    notes: [
      "Model: V = π/4 × bore² × stroke × cylinders (all in the same units).",
      "Displacement alone doesn't determine power — volumetric efficiency, boost and RPM matter as much.",
      "Bore/stroke ratio above 1 = oversquare (revvy); below 1 = undersquare (torquey).",
    ],
  };
}

/** Compression ratio from cylinder and chamber volumes. */
export function compressionRatio(input: CalcInput): CalcOutput {
  const { values } = input;
  const sweptCc = values.sweptCc;
  const chamberCc = values.chamberCc;
  const gasketCc = values.gasketCc ?? 0;
  const pistonCc = values.pistonCc ?? 0;
  if (sweptCc <= 0 || chamberCc < 0) throw new Error("Invalid volumes");

  const clearanceCc = chamberCc + gasketCc + pistonCc;
  const cr = (sweptCc + clearanceCc) / clearanceCc;
  if (clearanceCc <= 0) throw new Error("Clearance volume must be positive");

  return {
    rows: [
      { label: "Compression ratio", value: round(cr, 2), unit: ":1", decimals: 2, primary: true, hint: "CR = (swept + clearance) ÷ clearance." },
      { label: "Clearance volume", value: round(clearanceCc, 2), unit: "cc", decimals: 2 },
    ],
    notes: [
      "Model: CR = (V_swept + V_clearance) / V_clearance, where clearance includes chamber, gasket and piston dome/dish volume.",
      "Piston dome volume is negative dish: enter a negative number for domed pistons.",
      "Pump gas ceiling is roughly 10.5–11:1 static CR (iron heads, less with aluminum chambers or good squish).",
    ],
  };
}

/** Spring rate from coil geometry (helical compression). */
export function springRate(input: CalcInput): CalcOutput {
  const { values } = input;
  const wireDia = values.wireDia;
  const outerDia = values.outerDia;
  const coils = values.coils;
  const shearModulus = values.shearModulus ?? 79300; // N/mm² music wire ≈ 79.3 GPa
  if (wireDia <= 0 || outerDia <= 0 || coils <= 0) throw new Error("All dimensions must be positive");

  const meanDia = outerDia - wireDia;
  const k = (shearModulus * Math.pow(wireDia, 4)) / (8 * Math.pow(meanDia, 3) * coils); // N/mm

  return {
    rows: [
      { label: "Spring rate", value: round(k, 2), unit: "N/mm", decimals: 2, primary: true, hint: "k = G·d⁴ / (8·D³·n)." },
      { label: "Spring rate (imperial)", value: round(k * 5.71015, 2), unit: "lbf/in", decimals: 2, primary: true },
      { label: "Mean coil diameter", value: round(meanDia, 2), unit: "mm", decimals: 2 },
      { label: "Spring index", value: round(meanDia / wireDia, 1), unit: "—", decimals: 1, hint: "Best between 4 and 12; below 4 is hard to make, above 12 unstable." },
    ],
    notes: [
      "Helical compression springs, round wire: k = G·d⁴/(8·D³·n_active). G = 79.3 GPa for music wire, 77.2 GPa for 302 stainless.",
      "n_active excludes dead end coils: subtract 2 for squared ends, 1 for plain ends.",
      "Rate is constant until solid height or stress exceeds the elastic limit.",
    ],
  };
}

/** Torque wrench with extension: corrected setting. */
export function torqueWrenchExtension(input: CalcInput): CalcOutput {
  const { values } = input;
  const setting = values.setting;
  const wrenchLen = values.wrenchLen;
  const extLen = values.extLen;
  if (setting <= 0 || wrenchLen <= 0 || extLen < 0) throw new Error("Invalid inputs");

  // When the extension is in line with the wrench handle (common crowfoot at 90°):
  // T_set = T_target × L / (L + E)
  const corrected = setting * (wrenchLen / (wrenchLen + extLen));
  const effective = setting; // what the wrench will actually deliver at the fastener

  return {
    rows: [
      { label: "Wrench setting to use", value: round(corrected, 1), unit: "N·m", decimals: 1, primary: true, hint: `Set LOWER than target: ${round(corrected, 1)} N·m delivers ${round(setting, 1)} N·m at the fastener.` },
      { label: "Torque at fastener", value: round(setting, 1), unit: "N·m", decimals: 1 },
      { label: "Multiplication factor", value: round((wrenchLen + extLen) / wrenchLen, 3), unit: "×", decimals: 3 },
    ],
    notes: [
      "Model (extension in line with handle): T_set = T_target × L ÷ (L + E). The wrench applies its setting over a longer lever, so it must be reduced.",
      "Measure L from the wrench center of rotation (the drive) to the handle marking, and E from drive to fastener center.",
      "A crowfoot at 90° to the handle does not change the effective length — no correction needed.",
      "If the extension is BEFORE the wrench (on the drive side), the setting equals the target — no correction.",
    ],
  };
}

/** Pump hydraulic power from flow, head and efficiency. */
export function pumpPower(input: CalcInput): CalcOutput {
  const { values } = input;
  const flowLpm = values.flowLpm;
  const headM = values.headM;
  const eff = values.eff;
  const sg = values.sg ?? 1;
  if (flowLpm <= 0 || headM < 0) throw new Error("Invalid inputs");
  if (eff <= 0 || eff > 1) throw new Error("Efficiency must be between 0 and 1");
  if (sg <= 0) throw new Error("Specific gravity must be positive");

  const flowM3s = flowLpm / 60000;
  const hydraulicW = flowM3s * sg * 9810 * headM; // ρgQH with ρg = 9810 N/m³
  const shaftW = hydraulicW / eff;

  return {
    rows: [
      { label: "Hydraulic power", value: round(hydraulicW / 1000, 3), unit: "kW", decimals: 3, hint: "P = ρ·g·Q·H — the water horsepower actually delivered." },
      { label: "Shaft power required", value: round(shaftW / 1000, 3), unit: "kW", decimals: 3, primary: true, hint: `Hydraulic ÷ ${Math.round(eff * 100)}% efficiency.` },
      { label: "Shaft power (hp)", value: round(shaftW / 746, 2), unit: "hp", decimals: 2 },
    ],
    notes: [
      "Model: P_hydraulic = ρ g Q H; shaft power adds the pump efficiency. Motor power adds motor efficiency on top.",
      "Total head = static lift + friction losses — the friction part comes from pipe sizing, not this calculator.",
      "Centrifugal pumps: power varies with flow along the curve; use the duty point, not shutoff.",
    ],
  };
}

/** Roller chain length from sprocket teeth and center distance. */
export function chainLength(input: CalcInput): CalcOutput {
  const { values } = input;
  const t1 = Math.round(values.t1);
  const t2 = Math.round(values.t2);
  const cd = values.cd; // pitch
  const pitch = values.pitch; // mm (e.g. 12.7 for #40)
  if (t1 <= 0 || t2 <= 0 || cd <= 0 || pitch <= 0) throw new Error("All values must be positive");

  // Classical chain-length equation in pitches:
  const Lp =
    2 * (cd / pitch) + (t1 + t2) / 2 + (Math.pow(t2 - t1, 2) * pitch) / (4 * Math.PI * Math.PI * cd);
  const links = Math.ceil(Lp / 2) * 2; // even number of pitches (avoid offset link)
  const lengthMm = links * pitch;

  return {
    rows: [
      { label: "Chain length (theoretical)", value: round(Lp, 2), unit: "pitches", decimals: 2 },
      { label: "Chain length (even links)", value: links, unit: "links", decimals: 0, primary: true, hint: "Rounded up to an even count so no offset link is needed." },
      { label: "Chain length", value: round(lengthMm, 1), unit: "mm", decimals: 1, primary: true },
      { label: "Chain length", value: round(lengthMm / 25.4, 2), unit: "in", decimals: 2 },
    ],
    notes: [
      "Model: L = 2C/p + (T₁+T₂)/2 + p(T₂−T₁)²/(4π²C) — the standard roller-chain equation.",
      "Always use even pitch counts; an offset (half) link is weaker and should be avoided in power transmission.",
      "Pitch: #25 = 6.35 mm, #35 = 9.525 mm, #40 = 12.7 mm, #50 = 15.875 mm, #60 = 19.05 mm.",
    ],
  };
}

/** Ball bearing L10 life from load and speed. */
export function bearingLife(input: CalcInput): CalcOutput {
  const { values } = input;
  const dynamicLoad = values.dynamicLoad; // C, N
  const appliedLoad = values.appliedLoad; // P, N
  const rpm = values.rpm;
  const exponent = input.raw.type === "roller" ? 10 / 3 : 3;
  if (dynamicLoad <= 0 || appliedLoad <= 0 || rpm <= 0) throw new Error("All values must be positive");
  if (appliedLoad > dynamicLoad * 2) throw new Error("Applied load far exceeds dynamic rating — check selection");

  const hours = Math.pow(dynamicLoad / appliedLoad, exponent) * 1e6 / (60 * rpm);
  const revolutions = Math.pow(dynamicLoad / appliedLoad, exponent) * 1e6;

  return {
    rows: [
      { label: "L10 life", value: Math.round(revolutions / 1e6), unit: "million rev", decimals: 0, hint: "90% of identical bearings survive this long." },
      { label: "L10 life", value: Math.round(hours), unit: "hours", decimals: 0, primary: true, hint: `At ${rpm} RPM continuous.` },
      { label: "L10 life", value: round(hours / 8760, 1), unit: "years", decimals: 1 },
    ],
    notes: [
      "Model: L10 = (C/P)^k million revolutions, k = 3 for ball bearings, 10/3 for roller. Hours = L10 × 10⁶ ÷ (60 × RPM).",
      "L10 is a statistical rating, not a guarantee — halving the load extends life 8× for ball bearings.",
      "Real life drops with contamination, misalignment and poor lubrication; clean mounting matters more than rating margins.",
    ],
  };
}
