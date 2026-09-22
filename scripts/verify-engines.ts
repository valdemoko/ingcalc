/**
 * Engine verification: asserts known-correct results for every calculation engine.
 * Run with: npm run verify-engines
 */
import {
  concreteVolume,
  concreteMixRatio,
  cmuBlockWall,
  brickWall,
  rebarGrid,
  footingSize,
  studWall,
  stairLayout,
  roofPitch,
  boardFoot,
  gravelVolume,
  drywallCalc,
  asphaltTonnage,
} from "../src/lib/engines/construction";
import { voltageDrop, ohmsLaw, ampsFromPower, powerFactorCorrection, motorCurrent, getWire } from "../src/lib/engines/electrical";
import { coolingLoad, heatingLoad, ductSize, airflowCfm, efficiencyConvert } from "../src/lib/engines/hvac";
import { gearRatio, torquePower, boltTorque, beltLength, tapDrill } from "../src/lib/engines/mechanical";
import { panelOutput, batteryRuntime, offGridSizing, chargeController } from "../src/lib/engines/solar";
import { round } from "../src/lib/format";

let failures = 0;
function check(name: string, actual: number, expected: number, tol = 0.01) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected}`);
  } else {
    console.log(`ok   ${name}: ${actual}`);
  }
}
function expectError(name: string, fn: () => unknown) {
  try {
    fn();
    failures++;
    console.error(`FAIL ${name}: expected an error, got none`);
  } catch {
    console.log(`ok   ${name}: throws as expected`);
  }
}

const I = (values: Record<string, number>, raw: Record<string, string> = {}) => ({ values, raw });

// ---------- electrical ----------
{
  const w = getWire("12 AWG")!;
  const r = voltageDrop(I({ voltage: 120, current: 15, length: 100 }, { system: "single", wire: "12 AWG" }));
  check("vd 1ph 12AWG 100ft @15A → 5.94 V", r.rows[0].value as number, 5.94, 0.01);
  check("vd % → 4.95", r.rows[1].value as number, 4.95, 0.01);

  const r3 = voltageDrop(I({ voltage: 480, current: 100, length: 200 }, { system: "three", wire: "4 AWG" }));
  check("vd 3ph 4AWG 200ft @100A → 10.66 V", r3.rows[0].value as number, 10.66, 0.01);

  const ohm = ohmsLaw(I({ current: 4.5, resistance: 51.1 }));
  check("ohm V = 230", ohm.rows[0].value as number, 229.95, 0.01);
  expectError("ohm no blank throws", () => ohmsLaw(I({ current: 1, resistance: 1, voltage: 1 })));
  expectError("ohm two blanks throws", () => ohmsLaw(I({ current: 1 })));

  const amp = ampsFromPower(I({ power: 10, voltage: 400 }, { source: "kva", system: "three" }));
  check("10 kVA 3ph 400V → 14.43 A", amp.rows[0].value as number, 14.43, 0.01);
  const amp2 = ampsFromPower(I({ power: 10, voltage: 240 }, { source: "kva", system: "single" }));
  check("10 kVA 1ph 240V → 41.67 A", amp2.rows[0].value as number, 41.67, 0.01);

  const pf = powerFactorCorrection(I({ kw: 50, pfNow: 0.75, pfTarget: 0.95, voltage: 400 }));
  check("PFC 50kW 0.75→0.95 → 27.6 kVAR", pf.rows[0].value as number, 27.6, 0.02);

  const mot = motorCurrent(I({ hp: 10, voltage: 400, eff: 0.9, pf: 0.85 }, { system: "three" }));
  check("10hp 400V 3ph → ~14.06 A", mot.rows[0].value as number, 14.06, 0.02);
  expectError("pf correction target ≤ current throws", () =>
    powerFactorCorrection(I({ kw: 50, pfNow: 0.95, pfTarget: 0.75, voltage: 400 })));
}

// ---------- hvac ----------
{
  const cl = coolingLoad(I({ area: 300, occupants: 2, kitchenWatts: 0 }, { climate: "moderate", insulation: "average", sun: "heavy" }));
  check("cooling 300ft² sunny 2occ → 9450 BTU/h", cl.rows[0].value as number, 9450, 0.01);

  const hl = heatingLoad(I({ area: 1000, deltaT: 60 }, { insulation: "average" }));
  check("heating 1000ft² ΔT60 avg → 4800 BTU/h", hl.rows[0].value as number, 4800, 0.01);

  const ds = ductSize(I({ cfm: 400, friction: 0.08 }));
  check("duct 400cfm@0.08 → ~8.0 in", ds.rows[0].value as number, 8.0, 0.08);

  const af = airflowCfm(I({ volume: 960, ach: 8 }));
  check("airflow 960ft³@8ACH → 128 CFM", af.rows[0].value as number, 128, 0.01);

  const seer = efficiencyConvert(I({ seer: 16 }));
  check("SEER16 → EER 14.0", seer.rows[0].value as number, 14.0, 0.01);
}

// ---------- mechanical ----------
{
  const g = gearRatio(I({ driverTeeth: 20, drivenTeeth: 60, inputRpm: 1750, inputTorque: 10 }));
  check("gear 20:60 → ratio 3", g.rows[0].value as number, 3, 0.001);
  check("gear output rpm → 583.3", g.rows[1].value as number, 583.33, 0.01);
  check("gear output torque → 29.1", g.rows[2].value as number, 29.1, 0.01);

  const tp = torquePower(I({ torque: 50, rpm: 1500 }));
  check("50Nm@1500rpm → 7.85 kW", tp.rows[0].value as number, 7.854, 0.01);

  const bt = boltTorque(I({ diameter: 12 }, { grade: "8.8", lube: "dry" }));
  check("M12 8.8 dry → ~88 N·m", bt.rows[0].value as number, 88, 0.06);

  const bl = beltLength(I({ d1: 100, d2: 200, cd: 400 }));
  check("belt 100/200@400 → ~1277.3 mm", bl.rows[0].value as number, 1277.3, 0.002);

  const td = tapDrill(I({ major: 6, pitch: 1, threadPct: 75 }));
  check("M6 tap drill → 5.0 mm", td.rows[0].value as number, 5.0, 0.001);
}

// ---------- solar ----------
{
  const po = panelOutput(I({ wattPeak: 400, psh: 4.5, derate: 0.8 }));
  check("400W × 4.5PSH × 0.8 → 1.44 kWh/day", po.rows[0].value as number, 1.44, 0.01);

  const br = batteryRuntime(I({ capacityAh: 100, voltage: 12, loadW: 100, dod: 0.5, inverterEff: 0.9 }));
  check("100Ah 12V 100W 50%DoD → 5.4 h", br.rows[0].value as number, 5.4, 0.01);

  const og = offGridSizing(I({ dailyWh: 2000, systemV: 24, dod: 0.85, inverterEff: 0.9, autonomyDays: 2, psh: 3.5, derate: 0.8, peakLoadW: 1500 }));
  check("off-grid 2kWh → battery ~218 Ah", og.rows[0].value as number, 217.8, 0.01);
  check("off-grid → array ~794 Wp", og.rows[2].value as number, 793.7, 0.01);

  const cc = chargeController(I({ arrayW: 800, systemV: 24 }, { type: "mppt" }));
  check("MPPT 800W/24V → 41.7 A", cc.rows[0].value as number, 41.67, 0.01);
  expectError("PWM without Isc throws", () => chargeController(I({ arrayW: 800, systemV: 24 }, { type: "pwm" })));
}

// ---------- construction ----------
{
  // CONCRETE VOLUME — slab 20×12 ft × 4 in = 80 ft³ = 2.963 yd³ (display rounds to 2 dp)
  const cv = concreteVolume(I({ length: 20, width: 12, thickness: 4 / 12 }, { shape: "slab", bagSize: "80" }));
  check("concrete slab 20×12×4in → 2.96 yd³", cv.rows[0].value as number, 2.96, 0.001);
  check("concrete slab → 134 bags 80 lb", cv.rows[1].value as number, 134, 0.001);
  check("concrete slab w/ waste → 140 bags", cv.rows[2].value as number, 140, 0.001);

  // Round column: π/4 × 1² × 8 ft (12 in dia, 8 ft) = 6.283 ft³ = 0.2327 yd³ → 0.23 displayed
  const cc = concreteVolume(I({ diameter: 1, height: 8 }, { shape: "column", bagSize: "60" }));
  check("column 12in×8ft → 0.23 yd³", cc.rows[0].value as number, 0.23, 0.001);

  // Wall: 40×8 ft × 8 in thick
  const cw = concreteVolume(I({ length: 40, height: 8, thickness: 8 / 12 }, { shape: "wall", bagSize: "80" }));
  check("wall 40×8×8in → 7.90 yd³", cw.rows[0].value as number, 7.901, 0.001);

  // CONCRETE MIX RATIO — 1 yd³ of 1:2:3
  const cm = concreteMixRatio(I({ volume: 27 }, { ratio: "1:2:3" }));
  // dry = 27×1.54 = 41.58; cement = 41.58/6 = 6.93 ft³ = 6.93 bags; sand = 13.86 ft³ (0.513 yd³)
  check("mix 1yd³ 1:2:3 → 6.93 cement bags", cm.rows[0].value as number, 6.93, 0.001);
  check("mix 1yd³ → sand 0.513 yd³", cm.rows[1].value as number, 0.5133, 0.001);
  check("mix 1yd³ → gravel 0.77 yd³", cm.rows[2].value as number, 0.77, 0.001);
  // water = 6.93 × 94 × 0.5 lb = 325.7 lb = 39.05 gal
  check("mix 1yd³ → water 39.0 gal", cm.rows[3].value as number, 39.05, 0.002);

  // CMU — 40×8 ft wall, 8×8×16
  const mu = cmuBlockWall(I({ length: 40, height: 8 }, { size: "8x8x16" }));
  // area 320 ft² × 1.125 blocks/ft² × 1.05 = 378 blocks
  check("CMU 40×8 wall → 378 blocks", mu.rows[0].value as number, 378, 0.001);

  // BRICK — 30×8 ft, US modular stretcher: 240 ft² × 6.9 × 1.05 = 1738.8 → 1739
  const bw = brickWall(I({ length: 30, height: 8 }, { standard: "us-modular", bond: "stretcher" }));
  check("brick 30×8 wall → 1739 bricks", bw.rows[0].value as number, 1739, 0.001);

  // REBAR — 24×16 ft slab, #4 @ 18 in
  const rb = rebarGrid(I({ length: 24, width: 16, spacing: 18, thickness: 4, lap: 1.5 }, { bar: "4" }));
  // bars along length: ceil(16×12/18)+1 = 12 (length 24+1.5 = 25.5 ft each)
  // bars along width:  ceil(24×12/18)+1 = 17 (length 16+1.5 = 17.5 ft each)
  // total = 12×25.5 + 17×17.5 = 306 + 297.5 = 603.5 → displayed 604 ft; weight 603.5×0.668 = 403.1 lb
  check("rebar 24×16 #4@18 → 604 ft", rb.rows[0].value as number, 604, 0.001);
  check("rebar → 403 lb", rb.rows[1].value as number, 403, 0.002);
  // As/ft = 12/18 × 0.20 = 0.1333
  check("rebar As/ft → 0.133", rb.rows[4].value as number, 0.1333, 0.001);

  // FOOTING — 20 kips on 2 ksf
  const ft = footingSize(I({ load: 20, bearing: 2 }, { shape: "square" }));
  // A = 1.1×20/2 = 11 ft²; side = 3.317 ft; snap = 3.5 ft; p = 22/12.25 = 1.796 ksf
  check("footing 20kip/2ksf → side 3.32 ft", ft.rows[0].value as number, 3.317, 0.001);
  check("footing snapped → 3.5 ft", ft.rows[1].value as number, 3.5, 0.001);
  check("footing actual pressure → 1.796 ksf", ft.rows[2].value as number, 1.7959, 0.001);

  // STUD WALL — 24 ft, 8 ft, 16 OC, 2 openings
  const sw = studWall(I({ length: 24, height: 8, openings: 2 }, { spacing: "16" }));
  // studs = ceil(288/16)+1+4 = 23; cut = 8×12−4.5 = 91.5 in
  check("stud wall 24ft → 23 studs", sw.rows[0].value as number, 23, 0.001);
  check("stud cut length → 91.5 in", sw.rows[1].value as number, 91.5, 0.001);
  check("plates → 72 ft", sw.rows[2].value as number, 72, 0.001);

  // STAIRS — 108 in rise, 7.5 target, 10 in tread
  const st = stairLayout(I({ rise: 108, riser: 7.5, tread: 10 }));
  check("stair 108in → 14 risers", st.rows[0].value as number, 14, 0.001);
  check("stair riser → 7.714 in", st.rows[1].value as number, 7.7143, 0.001);
  check("stair run → 10.83 ft", st.rows[3].value as number, 10.8333, 0.001);
  check("stair stringer → 14.08 ft", st.rows[4].value as number, Math.sqrt(130 * 130 + 108 * 108) / 12, 0.001);
  check("stair 2r+t → 25.4", st.rows[5].value as number, 2 * (108 / 14) + 10, 0.002);
  expectError("stair with riser > 12 throws", () => stairLayout(I({ rise: 108, riser: 13, tread: 10 })));

  // ROOF PITCH — 6/12 over 1200 ft²
  const rp = roofPitch(I({ rise: 6, area: 1200 }, {}));
  check("roof 6/12 → 26.57°", rp.rows[0].value as number, 26.565, 0.001);
  check("roof 6/12 → 50% slope", rp.rows[1].value as number, 50, 0.001);
  check("roof 6/12 factor → 1.1180", rp.rows[2].value as number, Math.sqrt(180) / 12, 0.001);
  check("roof area → 1341.6 ft²", (rp.rows[2].value as number) * 1200, Math.sqrt(180) / 12 * 1200, 0.001);

  // BOARD FOOT — 10 pcs of 2×4×8 nominal (thickness entered as 8 quarters = 2 in)
  const bf = boardFoot(I({ thickness: 8, width: 4, length: 8, pieces: 10, price: 3.5 }));
  check("board foot 2×4×8 ×10 → 53.33 BF", bf.rows[0].value as number, (8 / 4) * 4 * 8 * 10 / 12, 0.001);
  check("board foot cost → $186.67", bf.rows[1].value as number, 53.3333 * 3.5, 0.001);

  // GRAVEL — 20×12 ft × 4 in of pea gravel (1.4 t/yd³)
  const gv = gravelVolume(I({ length: 20, width: 12, depth: 4 }, { material: "gravel" }));
  // 240 × 4/12 = 80 ft³ = 2.963 yd³ → 4.148 t → order 4.563 t
  check("gravel 20×12×4in → 2.96 yd³", gv.rows[0].value as number, 2.96, 0.001);
  check("gravel → 4.15 tons", gv.rows[1].value as number, 4.15, 0.001);
  check("gravel order margin → 4.56 t", gv.rows[2].value as number, 4.56, 0.001);

  // DRYWALL — 14×12×8 room with ceiling
  const dw = drywallCalc(I({ length: 14, width: 12, height: 8 }, { includeCeiling: "yes", sheet: "4x8", thickness: "0.5" }));
  // walls 2×26×8 = 416 + ceiling 168 = 584 ft²; ×1.15/32 = 20.98 → 21 sheets
  check("drywall 14×12×8 room → 21 sheets", dw.rows[0].value as number, 21, 0.001);
  check("drywall weight → 21×54 = 1134 lb", dw.rows[1].value as number, 1134, 0.001);

  // DRYWALL without ceiling
  const dw2 = drywallCalc(I({ length: 14, width: 12, height: 8 }, { includeCeiling: "no", sheet: "4x12", thickness: "0.5" }));
  // walls only: 416 ft² ×1.15/48 = 9.97 → 10 sheets
  check("drywall walls-only → 10 sheets 4×12", dw2.rows[0].value as number, 10, 0.001);
  expectError("drywall with zero width throws", () => drywallCalc(I({ length: 14, width: 0, height: 8 }, { includeCeiling: "no" })));

  // ASPHALT — 40×12 ft, 3 in compacted
  const at = asphaltTonnage(I({ length: 40, width: 12, depth: 3, price: 120 }, {}));
  // 120 ft³ ×145/2000 = 8.7 t compacted; ×1.25 = 10.875 loose
  check("asphalt 40×12×3in → 8.7 t compacted", at.rows[0].value as number, 8.7, 0.001);
  check("asphalt loose → 10.88 t", at.rows[1].value as number, 10.875, 0.001);
  check("asphalt area → 53.3 yd²", at.rows[2].value as number, 53.333, 0.001);

  // Invalid inputs throw
  expectError("rebar zero slab throws", () => rebarGrid(I({ length: 0, width: 10, spacing: 12 })));
  expectError("footing negative load throws", () => footingSize(I({ load: -5, bearing: 2 })));
  expectError("stair zero rise throws", () => stairLayout(I({ rise: 0, riser: 7.5, tread: 10 })));
}

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
} else {
  console.log("\nAll engine checks passed.");
}
