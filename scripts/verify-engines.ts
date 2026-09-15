/**
 * Engine verification: asserts known-correct results for every calculation engine.
 * Run with: npm run verify-engines
 */
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

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
} else {
  console.log("\nAll engine checks passed.");
}
