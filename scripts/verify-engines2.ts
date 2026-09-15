/**
 * Engine verification batch 2: assertions for the 37 new engines.
 * Run with: npx tsx scripts/verify-engines2.ts
 */
import {
  wireResistance, energyCost, transformerSizing, threePhasePower, voltageDivider,
  resistorColorCode, ledResistor, evChargeTime, generatorSizing, deratingCalc,
  breakerSizing, cableReactance,
} from "../src/lib/engines/electrical2";
import {
  dewPoint, ductVelocity, coolingCost, heatIndex, windChill, degreeDayEnergy,
  sensibleHeat, fanLaws,
} from "../src/lib/engines/hvac2";
import {
  pulleyRpm, hydraulicCylinder, gearGeometry, metalWeight, engineDisplacement,
  compressionRatio, springRate, torqueWrenchExtension, pumpPower, chainLength, bearingLife,
} from "../src/lib/engines/mechanical2";
import {
  arrayElectricals, batteryBankSizing, batteryChargeTime, solarSavings, solarTilt, panelCount,
} from "../src/lib/engines/solar2";

let failures = 0;
function check(name: string, actual: number, expected: number, tol = 0.01) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  if (!ok) { failures++; console.error(`FAIL ${name}: got ${actual}, expected ${expected}`); }
  else console.log(`ok   ${name}: ${actual}`);
}
function expectError(name: string, fn: () => unknown) {
  try { fn(); failures++; console.error(`FAIL ${name}: expected an error`); }
  catch { console.log(`ok   ${name}: throws as expected`); }
}
const I = (values: Record<string, number>, raw: Record<string, string> = {}) => ({ values, raw });

// ---------- electrical2 ----------
{
  const r = wireResistance(I({ length: 100 }, { wire: "12 AWG", material: "copper" }));
  check("wire R 12AWG 100ft RT → 0.396 Ω", r.rows[0].value as number, 0.396, 0.01);
  const ra = wireResistance(I({ length: 100 }, { wire: "12 AWG", material: "aluminum" }));
  check("wire R Al → ×1.64", ra.rows[0].value as number, 0.396 * 1.64, 0.01);

  const ec = energyCost(I({ watts: 1500, hours: 4, rate: 0.15, quantity: 1 }));
  check("energy 1500W×4h → 6 kWh/day", ec.rows[0].value as number, 6, 0.01);
  check("energy cost/yr → $328.8", ec.rows[5].value as number, 328.8, 0.01);

  const ts = transformerSizing(I({ loadKw: 8, pf: 0.85, primaryV: 480, secondaryV: 240, margin: 0.25 }));
  check("transformer 8kW 0.85 +25% → 11.76 kVA", ts.rows[1].value as number, 11.76, 0.01);

  const tp3 = threePhasePower(I({ voltage: 400, current: 20, pf: 0.85 }));
  check("3ph 400V 20A 0.85 → 11.72 kW", tp3.rows[0].value as number, 11.716, 0.01);

  const vd2 = voltageDivider(I({ vin: 12, r1: 10000, r2: 4700 }));
  check("divider 12V 10k/4.7k → 3.837 V", vd2.rows[0].value as number, 3.837, 0.01);

  const rc = resistorColorCode(I({}, { band1: "brown", band2: "black", multiplier: "red", tolerance: "gold" }));
  check("color brown-black-red → 1000 Ω", rc.rows[0].value as number, 1000, 0.001);

  const led = ledResistor(I({ vin: 12, vf: 2.0, iLed: 20, count: 1 }, { wiring: "series" }));
  check("LED 12V 2V 20mA → 500 Ω", led.rows[0].value as number, 500, 0.01);
  expectError("LED supply too low throws", () => ledResistor(I({ vin: 5, vf: 3.2, iLed: 20, count: 2 }, { wiring: "series" })));

  const ev = evChargeTime(I({ batteryKwh: 60, chargerKw: 7.2, fromPct: 20, toPct: 80, eff: 0.9, efficiencyMiKwh: 3.5, rate: 0.15 }));
  check("EV 60kWh 20-80% @7.2kW → 5.56 h", ev.rows[0].value as number, 5.56, 0.01);

  const gs = generatorSizing(I({ runningW: 2000, surgeW: 1800 }));
  check("generator max(2500, 1800) → 2.5 kW", gs.rows[0].value as number, 2.5, 0.01);

  const dr = deratingCalc(I({ baseAmpacity: 35, ambientC: 50, conductors: 9 }));
  check("derating 35A 50°C 9cc → 18.4 A (0.75×0.7×35, NEC)", dr.rows[0].value as number, 18.4, 0.02);

  const bk = breakerSizing(I({ loadA: 24 }, { continuous: "yes" }));
  check("breaker 24A continuous → 30 A", bk.rows[1].value as number, 30, 0.001);

  const cx = cableReactance(I({ length: 200, current: 150 }, { wire: "4/0 AWG" }));
  check("reactance 4/0 200ft 150A → ~4.66 V", cx.rows[3].value as number, 4.66, 0.03);
}

// ---------- hvac2 ----------
{
  const dp = dewPoint(I({ temp: 28, rh: 65 }));
  check("dew point 28°C 65% → ~20.9 °C", dp.rows[0].value as number, 20.9, 0.03);

  const dv = ductVelocity(I({ cfm: 400, diameter: 8 }));
  check("duct velocity 400cfm 8in → 1146 fpm", dv.rows[0].value as number, 1146, 0.01);

  const cc = coolingCost(I({ tons: 3, seer: 14, hoursDay: 8, daysMonth: 30, rate: 0.15 }));
  check("cooling cost 3t 14SEER → $92.6/mo", cc.rows[2].value as number, 92.57, 0.01);

  const hi = heatIndex(I({ temp: 92, rh: 65 }));
  check("heat index 92F 65% → ~108 °F (Rothfusz)", hi.rows[0].value as number, 108.3, 0.01);

  const wc = windChill(I({ temp: 10, wind: 20 }));
  check("wind chill 10F 20mph → ~−9 °F", wc.rows[0].value as number, -9, 0.05);

  const dd = degreeDayEnergy(I({ hdd: 4000, ua: 500, eff: 0.85, fuelCost: 1.2 }, { fuel: "gas" }));
  check("degree-day 4000HDD UA500 → 565 therms", dd.rows[1].value as number, 564.7, 0.01);

  const sh = sensibleHeat(I({ btuh: 24000, cfm: 0, deltaT: 20 }));
  check("sensible 24000BTU ΔT20 → 1111 CFM", sh.rows[0].value as number, 1111, 0.01);

  const fl = fanLaws(I({ cfm1: 1000, rpm1: 1200, power1: 500, rpm2: 900 }));
  check("fan laws 900/1200 → 750 CFM", fl.rows[0].value as number, 750, 0.01);
  check("fan laws power → 210.9 W", fl.rows[2].value as number, 210.94, 0.01);
}

// ---------- mechanical2 ----------
{
  const pr = pulleyRpm(I({ dDriver: 80, dDriven: 200, rpmDriver: 1750 }));
  check("pulley 80→200 @1750 → 700 RPM", pr.rows[0].value as number, 700, 0.01);

  const hc = hydraulicCylinder(I({ bore: 63, rod: 28, pressure: 16 }, { mode: "extend" })); // 16 MPa = 160 bar
  check("cylinder 63mm 160bar → ~49.8 kN", hc.rows[0].value as number, 49.8, 0.02);

  const gg = gearGeometry(I({ module: 2, teeth: 24 }));
  check("gear m2 z24 pitch → 48 mm", gg.rows[0].value as number, 48, 0.001);
  check("gear m2 z24 OD → 52 mm", gg.rows[1].value as number, 52, 0.001);

  const mw = metalWeight(I({ diameter: 20, length: 1000 }, { shape: "round", material: "steel" }));
  check("steel bar d20 L1m → 2.47 kg", mw.rows[0].value as number, 2.469, 0.01);

  const ed = engineDisplacement(I({ bore: 86, stroke: 86, cylinders: 4 }));
  check("displacement 86×86×4 → ~1999 cc", ed.rows[0].value as number, 1998.9, 0.01);

  const cr = compressionRatio(I({ sweptCc: 500, chamberCc: 55, gasketCc: 6, pistonCc: -4 }));
  check("CR 500/57 → 9.77", cr.rows[0].value as number, 9.77, 0.01);

  const sr = springRate(I({ wireDia: 4, outerDia: 25, coils: 8 }));
  check("spring 4mm wire 21mm mean 8 coils → ~34.3 N/mm", sr.rows[0].value as number, 34.3, 0.02);

  const tw = torqueWrenchExtension(I({ setting: 60, wrenchLen: 400, extLen: 75 }));
  check("wrench ext 400+75 @60 → set 50.5", tw.rows[0].value as number, 50.5, 0.01);

  const pp = pumpPower(I({ flowLpm: 100, headM: 20, eff: 0.7, sg: 1 }));
  check("pump 100L/min 20m 70% → 0.467 kW", pp.rows[1].value as number, 0.467, 0.01);

  const cl = chainLength(I({ t1: 17, t2: 34, cd: 400, pitch: 12.7 }));
  check("chain 17/34 @400mm → ~88.5 pitches", cl.rows[0].value as number, 88.5, 0.02);
  check("chain even links → 90", cl.rows[1].value as number, 90, 0.001);

  const bl = bearingLife(I({ dynamicLoad: 14000, appliedLoad: 2000, rpm: 1750 }, { type: "ball" }));
  check("bearing (14/2)³ = 343 Mrev", bl.rows[0].value as number, 343, 0.01);
  expectError("bearing rod≥bore style error (cylinder) ", () => hydraulicCylinder(I({ bore: 20, rod: 25, pressure: 100 })));
}

// ---------- solar2 ----------
{
  const ae = arrayElectricals(I({ voc: 37.6, vmp: 31.4, isc: 10.4, imp: 9.8, panelsPerString: 10, strings: 2, minTempC: -10, maxDcInput: 500 }));
  check("string 10 panels @-10°C → ~414 Voc", ae.rows[0].value as number, 414.4, 0.02);

  const bb = batteryBankSizing(I({ dailyWh: 2000, systemV: 24, dod: 0.85, autonomyDays: 2 }));
  check("bank 2kWh 0.85DoD 2d → 196 Ah", bb.rows[0].value as number, 196, 0.01);

  const ct = batteryChargeTime(I({ capacityAh: 100, chargerA: 20, fromPct: 20, toPct: 100, eff: 0.9 }));
  check("charge 100Ah 20A 20-100% → 4.44 h", ct.rows[0].value as number, 4.44, 0.01);

  const ss = solarSavings(I({ systemKw: 6, psh: 4.5, derate: 0.8, selfConsumption: 0.6, rate: 0.18, exportRate: 0.05, costPerWatt: 2.5 }));
  check("savings 6kW → ~7890 kWh/yr", ss.rows[0].value as number, 7892, 0.02);

  const st = solarTilt(I({ latitude: 40 }, { season: "year" }));
  check("tilt 40° lat → 40°", st.rows[0].value as number, 40, 0.001);
  const stw = solarTilt(I({ latitude: 40 }, { season: "winter" }));
  check("tilt winter → 55°", stw.rows[0].value as number, 55, 0.001);

  const pc = panelCount(I({ targetKwh: 10, panelW: 400, psh: 3.5, derate: 0.8 }));
  check("panels 10kWh 3.5PSH → 3571 Wp", pc.rows[0].value as number, 3571, 0.01);
  check("panels → 9", pc.rows[1].value as number, 9, 0.001);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll batch-2 engine checks passed.");
