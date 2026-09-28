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

  const ec = energyCost(I({ watts: 1500, hours: 4, rate: 0.15, quantity: 1 }, { mode: "watts" }));
  check("energy 1500W×4h → 6 kWh/day", ec.rows[0].value as number, 6, 0.01);
  check("energy cost/yr → $328.8", ec.rows[5].value as number, 328.8, 0.01);

  const ecKwh = energyCost(I({ kwhPerDay: 6, rate: 0.15 }, { mode: "kwh" }));
  check("energy kWh-mode 6 kWh/day → 6 kWh/day", ecKwh.rows[0].value as number, 6, 0.001);
  check("energy kWh-mode cost/mo → $27.40", ecKwh.rows[4].value as number, 27.4, 0.01);

  const wrTemp = wireResistance(I({ length: 100, tempC: 20 }, { wire: "12 AWG", material: "copper" }));
  check("wire R 12AWG 100ft @20°C → ~0.320 Ω", wrTemp.rows[0].value as number, 0.396 * (1 + 0.00323 * (20 - 75)), 0.01);
  const wr75 = wireResistance(I({ length: 100, tempC: 75 }, { wire: "12 AWG", material: "copper" }));
  check("wire R 12AWG 100ft @75°C → 0.396 Ω", wr75.rows[0].value as number, 0.396, 0.001);

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

// ---------- batch 3 (phase 2) ----------
import { parallelResistance, capacitorEnergy, reactance } from "../src/lib/engines/electrical3";
import { cantileverBeam, shaftTorsion, machineEfficiency } from "../src/lib/engines/mechanical3";
import { psychrometrics, heatPumpCop, tempConvert } from "../src/lib/engines/hvac3";
import { consumptionAudit, inverterSizing, dcAcRatio } from "../src/lib/engines/solar3";
import { excavationVolume, paintCoverage, tileCount } from "../src/lib/engines/construction3";
{
  // electrical3
  const pr2 = parallelResistance(I({ r1: 1000, r2: 2200 }));
  check("parallel 1k/2.2k → 687.5 Ω", pr2.rows[0].value as number, 687.5, 0.001);
  const pr3 = parallelResistance(I({ r1: 1000, r2: 1000, r3: 1000 }));
  check("parallel 3×1k → 333.3 Ω", pr3.rows[0].value as number, 1000 / 3, 0.001);
  expectError("parallel with one resistor throws", () => parallelResistance(I({ r1: 1000 })));
  expectError("parallel zero resistance throws", () => parallelResistance(I({ r1: 0, r2: 1000 })));

  const ce = capacitorEnergy(I({ capacitance: 1000e-6, voltage: 12 }));
  check("cap 1000µF @12V → 0.072 J", ce.rows[0].value as number, 0.072, 0.001);
  const ceHi = capacitorEnergy(I({ capacitance: 1000e-6, voltage: 300 }));
  check("cap 1000µF @300V → 45 J (V² law)", ceHi.rows[0].value as number, 45, 0.001);

  const rx = reactance(I({ frequency: 60, inductance: 0.01 }, { type: "inductive" }));
  check("Xʟ 10mH @60Hz → 3.77 Ω", rx.rows[0].value as number, 2 * Math.PI * 60 * 0.01, 0.001);
  const rxc = reactance(I({ frequency: 60, capacitance: 10e-6 }, { type: "capacitive" }));
  check("X꜀ 10µF @60Hz → 265.3 Ω", rxc.rows[0].value as number, 1 / (2 * Math.PI * 60 * 10e-6), 0.001);
  expectError("reactance zero frequency throws", () => reactance(I({ frequency: 0, inductance: 0.01 }, { type: "inductive" })));

  // mechanical3
  const cb = cantileverBeam(I({ load: 500, length: 1, height: 50, width: 20 }));
  check("cantilever 500N 1m 50×20 → 4.0 mm", cb.rows[0].value as number, 4.0, 0.03);
  check("cantilever stress → 60 MPa", cb.rows[1].value as number, 60, 0.01);
  const cbTall = cantileverBeam(I({ load: 500, length: 1, height: 100, width: 20 }));
  check("cantilever depth doubled → 0.5 mm (h³)", cbTall.rows[0].value as number, 0.5, 0.03);

  const st = shaftTorsion(I({ diameter: 20, torque: 100, allowable: 100 }));
  check("shaft 20mm @100N·m → 63.66 MPa", st.rows[0].value as number, 63.66, 0.01);
  const stCap = shaftTorsion(I({ diameter: 20, torque: 0, allowable: 100 }));
  check("shaft 20mm capacity @100MPa → 157.1 N·m", stCap.rows[1].value as number, 157.08, 0.01);
  expectError("shaft overstress throws", () => shaftTorsion(I({ diameter: 10, torque: 500, allowable: 100 })));

  const me = machineEfficiency(I({ inputPower: 1000, outputPower: 850 }));
  check("efficiency 850/1000 → 85%", me.rows[0].value as number, 85, 0.001);
  check("losses → 150 W", me.rows[1].value as number, 150, 0.001);
  expectError("efficiency >100% throws", () => machineEfficiency(I({ inputPower: 100, outputPower: 120 })));

  // hvac3
  const ps = psychrometrics(I({ tempC: 25, rh: 50, altitude: 0 }));
  check("psychro 25°C 50% → W ≈ 9.9 g/kg", ps.rows[0].value as number, 9.9, 0.04);
  check("psychro 25°C 50% → h ≈ 50.3 kJ/kg", ps.rows[1].value as number, 50.3, 0.03);
  const psAlt = psychrometrics(I({ tempC: 25, rh: 50, altitude: 1500 }));
  check("psychro @1500m → W ≈ 11.9 g/kg (altitude)", psAlt.rows[0].value as number, 11.9, 0.05);
  expectError("psychro out of range throws", () => psychrometrics(I({ tempC: 80, rh: 50 })));

  const hp = heatPumpCop(I({ hspf: 9, outdoorC: 0, heatLoad: 6, rate: 0.15 }));
  check("heat pump HSPF9 @0°C → COP ≈ 2.02", hp.rows[0].value as number, 9 * 0.2931 * (1 - 0.028 * 8.3), 0.01);
  const hpWarm = heatPumpCop(I({ hspf: 9, outdoorC: 15, heatLoad: 6, rate: 0.15 }));
  check("heat pump @15°C → seasonal COP 2.64 (no derate)", hpWarm.rows[0].value as number, 9 * 0.2931, 0.01);

  const tc = tempConvert(I({ temp: 20 }, { scale: "celsius" }));
  check("20°C → 68°F", tc.rows[1].value as number, 68, 0.001);
  check("20°C → 293.15 K", tc.rows[2].value as number, 293.15, 0.001);
  const tcF = tempConvert(I({ temp: 32 }, { scale: "fahrenheit" }));
  check("32°F → 0°C", tcF.rows[0].value as number, 0, 0.001);
  expectError("below absolute zero throws", () => tempConvert(I({ temp: -300 }, { scale: "celsius" })));

  // solar3
  const ca = consumptionAudit(I({ lightingW: 60, lightingH: 5, refrigerationW: 50, refrigerationH: 10, electronicsW: 100, electronicsH: 6, cookingW: 0, cookingH: 0, otherW: 30, otherH: 2 }));
  check("audit → 1.46 kWh/day", ca.rows[0].value as number, 1.46, 0.01);
  check("audit battery @50%DoD 12V → 243 Ah", ca.rows[2].value as number, (1460 / 0.5) / 12, 0.01);
  expectError("audit all zeros throws", () => consumptionAudit(I({ lightingW: 0, lightingH: 0, refrigerationW: 0, refrigerationH: 0, electronicsW: 0, electronicsH: 0, cookingW: 0, cookingH: 0, otherW: 0, otherH: 0 })));

  const inv = inverterSizing(I({ continuousW: 800, surgeW: 1200, pf: 0.9 }));
  check("inverter max(1111, 1333) → 1333 VA", inv.rows[0].value as number, 1333.3, 0.01);
  const invNoSurge = inverterSizing(I({ continuousW: 800, pf: 1 }));
  check("inverter 800W PF1 → 1000 VA", invNoSurge.rows[0].value as number, 1000, 0.001);
  expectError("inverter PF > 1 throws", () => inverterSizing(I({ continuousW: 800, pf: 1.2 })));

  const dcac = dcAcRatio(I({ dcKw: 7, acKw: 6, psh: 4.5 }));
  check("DC/AC 7/6 → 1.17", dcac.rows[0].value as number, 1.1667, 0.01);

  // construction3
  const ex = excavationVolume(I({ length: 30, width: 4, depth: 3, swell: 0.25 }));
  check("excavation 30×4×3 bank → 13.33 yd³", ex.rows[0].value as number, 13.333, 0.001);
  check("excavation loose ×1.25 → 16.67 yd³", ex.rows[1].value as number, 16.667, 0.001);
  check("excavation → 2 truckloads", ex.rows[2].value as number, 2, 0.001);

  const pc2 = paintCoverage(I({ length: 14, width: 12, height: 8, coats: 2, spread: 375 }, { ceiling: "no" }));
  check("paint 14×12 walls 2 coats → 2.22 gal", pc2.rows[1].value as number, 416 * 2 / 375, 0.01);
  check("paint buy → 3 gal", pc2.rows[2].value as number, 3, 0.001);
  const pcCeil = paintCoverage(I({ length: 14, width: 12, height: 8, coats: 2, spread: 375 }, { ceiling: "yes" }));
  check("paint with ceiling (584 ft²) → 3.11 gal", pcCeil.rows[1].value as number, 584 * 2 / 375, 0.01);

  const tiling = tileCount(I({ area: 100, tileSize: 12 }, { pattern: "straight" }));
  check("tiles 100 ft² 12in → 110 buy", tiling.rows[1].value as number, 110, 0.001);
  const tilingDiag = tileCount(I({ area: 100, tileSize: 12 }, { pattern: "diagonal" }));
  check("tiles diagonal → 115 buy", tilingDiag.rows[1].value as number, 115, 0.001);

  console.log("\nbatch-3 checks done");
}

// ---------- batch 4 (phase 3) ----------
import { seriesResistance, currentDivider, rcTimeConstant } from "../src/lib/engines/electrical4";
import { simpleBeam, hookeLaw, powerFromForce, pulleySystem } from "../src/lib/engines/mechanical4";
import { pipeFlow, pipePressureDrop, pipeSize, pipeVolume, tankVolume } from "../src/lib/engines/plumbing";
import { heatConduction, thermalExpansion, idealGas, sensibleLatentHeat, heatingPower } from "../src/lib/engines/thermo";
import { cuttingSpeed, feedRate, cycleTime, materialRemovalRate, productionRate } from "../src/lib/engines/manufacturing";
import { rampLayout, earthwork, drainageRunoff, lumberWeight } from "../src/lib/engines/construction4";
import { airDensity } from "../src/lib/engines/hvac4";
import { dcCableLoss } from "../src/lib/engines/solar4";

{
  // electrical4
  const sr = seriesResistance(I({ r1: 470, r2: 1000 }));
  check("series 470+1000 → 1470 Ω", sr.rows[0].value as number, 1470, 0.001);
  expectError("series with one resistor throws", () => seriesResistance(I({ r1: 470 })));
  expectError("series negative throws", () => seriesResistance(I({ r1: -470, r2: 1000 })));

  const cd = currentDivider(I({ totalCurrent: 1, r1: 100, r2: 220 }));
  check("divider 1A 100/220 → I1 0.6875 A", cd.rows[0].value as number, 0.6875, 0.001);
  check("divider → I2 0.3125 A", cd.rows[1].value as number, 0.3125, 0.001);
  check("divider R_eq 68.75 Ω", cd.rows[2].value as number, 68.75, 0.001);
  expectError("divider negative current throws", () => currentDivider(I({ totalCurrent: -1, r1: 100, r2: 220 })));

  const rc = rcTimeConstant(I({ resistance: 10000, capacitance: 10e-6, targetPct: 90 }));
  check("RC 10kΩ×10µF → τ 100 ms", rc.rows[0].value as number, 100, 0.001);
  check("RC 5τ → 500 ms", rc.rows[1].value as number, 500, 0.001);
  check("RC t(90%) → 230.3 ms", rc.rows[2].value as number, 230.259, 0.001);
  expectError("RC negative C throws", () => rcTimeConstant(I({ resistance: 10000, capacitance: -1 })));

  // mechanical4
  const sb = simpleBeam(I({ load: 1000, span: 2, height: 100, width: 50 }));
  check("simple beam 1kN 2m 100×50 → 0.2 mm", sb.rows[0].value as number, 0.2, 0.01);
  check("simple beam σ → 6 MPa", sb.rows[1].value as number, 6, 0.01);
  expectError("simple beam zero load throws", () => simpleBeam(I({ load: 0, span: 2, height: 100, width: 50 })));

  const hk = hookeLaw(I({ force: 10000, area: 100, length: 100 }));
  check("Hooke 10kN/100mm² → 100 MPa", hk.rows[0].value as number, 100, 0.001);
  check("Hooke strain @200GPa → 5e-4", hk.rows[1].value as number, 0.0005, 0.001);
  check("Hooke ΔL 100mm → 0.05 mm", hk.rows[2].value as number, 0.05, 0.001);
  const hkE = hookeLaw(I({ force: 10000, area: 100, length: 100, elongation: 0.05 }));
  check("Hooke measured E → 200 GPa", hkE.rows[2].value as number, 200, 0.01);
  expectError("Hooke zero area throws", () => hookeLaw(I({ force: 1000, area: 0 })));

  const pf = powerFromForce(I({ force: 2000, velocity: 1.5 }));
  check("P=F·v 2000N×1.5 → 3000 W", pf.rows[0].value as number, 3000, 0.001);
  check("P=F·v → 4.023 hp", pf.rows[2].value as number, 4.023, 0.01);
  expectError("P=F·v negative velocity throws", () => powerFromForce(I({ force: 100, velocity: -1 })));

  const pu = pulleySystem(I({ inputRpm: 1750, inputTorque: 10, driverDia: 100, drivenDia: 250 }));
  check("pulley 100/250 @1750 → 700 RPM", pu.rows[1].value as number, 700, 0.001);
  check("pulley torque ×2.5×0.95 → 23.75 N·m", pu.rows[2].value as number, 23.75, 0.001);
  expectError("pulley zero diameter throws", () => pulleySystem(I({ inputRpm: 1750, driverDia: 0, drivenDia: 250 })));

  // plumbing
  const pfl = pipeFlow(I({ flow: 30, diameter: 20 }));
  check("pipe flow 30Lpm 20mm → 1.59 m/s", pfl.rows[0].value as number, 1.592, 0.01);
  check("pipe flow ft/s row consistent", pfl.rows[1].value as number, 1.592 * 3.28084, 0.01);
  check("pipe flow gpm row consistent", pfl.rows[2].value as number, 30 * 0.264172, 0.01);
  const pflSlow = pipeFlow(I({ flow: 5, diameter: 20 }));
  check("pipe flow small 5Lpm 20mm → 0.27 m/s", pflSlow.rows[0].value as number, 0.265, 0.01);
  expectError("pipe flow zero flow throws", () => pipeFlow(I({ flow: 0, diameter: 20 })));

  const ppd = pipePressureDrop(I({ flow: 30, diameter: 20, length: 30, roughness: 0.0015 }));
  check("Darcy 30Lpm 20mm 30m Cu → 4.51 m", ppd.rows[0].value as number, 4.51, 0.02);
  check("Darcy → 44.1 kPa", ppd.rows[1].value as number, 44.15, 0.02);
  expectError("Darcy negative roughness throws", () => pipePressureDrop(I({ flow: 30, diameter: 20, length: 30, roughness: -1 })));

  const psz = pipeSize(I({ flow: 30, maxVelocity: 2 }));
  check("pipe size 30Lpm @2m/s → dmin 17.8 mm", psz.rows[0].value as number, 17.84, 0.01);
  check("pipe size → next standard 20 mm", psz.rows[1].value as number, 20, 0.001);
  expectError("pipe size velocity out of range throws", () => pipeSize(I({ flow: 30, maxVelocity: 10 })));

  const pv = pipeVolume(I({ diameter: 15, length: 10 }));
  check("pipe volume 15mm×10m → 1.77 L", pv.rows[0].value as number, 1.767, 0.01);
  check("pipe volume gallons row matches L", pv.rows[1].value as number, 1.767 * 0.264172, 0.01);
  check("pipe volume weight ≈ L (ρ~1)", pv.rows[2].value as number, pv.rows[0].value as number, 0.01);
  const pvLong = pipeVolume(I({ diameter: 50, length: 100 }));
  check("pipe volume 50mm×100m → 196 L", pvLong.rows[0].value as number, 196.35, 0.01);
  // per-100m normalizes length away: 17.67 L/100m at 15mm × (50/15)² area ratio = 196.3
  check("pipe volume per-100m scales with area², not length", pvLong.rows[3].value as number, 17.67 * Math.pow(50 / 15, 2), 0.01);
  expectError("pipe volume zero length throws", () => pipeVolume(I({ diameter: 15, length: 0 })));

  const tv = tankVolume(I({ diameter: 500, height: 1000 }, { shape: "cylinder" }));
  check("tank ⌀500×1000 → 196.3 L", tv.rows[0].value as number, 196.35, 0.01);
  const tvr = tankVolume(I({ length: 1000, width: 600, height: 400 }, { shape: "rectangular" }));
  check("tank 1000×600×400 → 240 L", tvr.rows[0].value as number, 240, 0.001);
  expectError("tank zero height throws", () => tankVolume(I({ diameter: 500, height: 0 }, { shape: "cylinder" })));

  // thermo
  const hc2 = heatConduction(I({ area: 10, deltaT: 20, k1: 0.04, t1: 100, k2: 0.7, t2: 100 }));
  check("wall 100mm wool+100mm brick → U 0.378", hc2.rows[0].value as number, 0.3784, 0.02);
  check("wall R-value → 14.98 (IP)", hc2.rows[1].value as number, 2.642857 * 5.678, 0.01);
  check("wall Q → 75.7 W", hc2.rows[2].value as number, 75.68, 0.02);
  expectError("conduction ΔT=0 throws", () => heatConduction(I({ area: 10, deltaT: 0, k1: 0.04, t1: 100 })));

  const te = thermalExpansion(I({ length: 30, deltaT: 50 }, { material: "steel" }));
  check("steel 30m ΔT50 → 18 mm", te.rows[0].value as number, 18, 0.001);
  const tep = thermalExpansion(I({ length: 30, deltaT: 50 }, { material: "pvc" }));
  check("PVC 30m ΔT50 → 81 mm (4.5×)", tep.rows[0].value as number, 81, 0.01);
  expectError("expansion unknown material throws", () => thermalExpansion(I({ length: 30, deltaT: 50 }, { material: "unobtainium" })));

  const ig = idealGas(I({ volume: 22.4, temperature: 273.15, moles: 1 }));
  check("ideal gas 1mol 22.4L @273.15K → 101.38 kPa", ig.rows[0].value as number, 101.38, 0.001);
  const ig2 = idealGas(I({ pressure: 101.325, temperature: 273.15, moles: 1 }));
  check("ideal gas solve V → 22.41 L", ig2.rows[1].value as number, 22.414, 0.01);
  expectError("ideal gas one known throws", () => idealGas(I({ pressure: 101.325 })));

  const sl = sensibleLatentHeat(I({ mass: 150, deltaT: 50 }, { material: "water" }));
  check("sensible 150kg water ΔT50 → 31395 kJ", sl.rows[0].value as number, 31395, 0.001);
  check("latent fusion 150kg → 50100 kJ", sl.rows[1].value as number, 50100, 0.001);
  expectError("sensible ΔT=0 throws", () => sensibleLatentHeat(I({ mass: 150, deltaT: 0 })));

  const hpa = heatingPower(I({ flow: 20, deltaT: 10 }, { fluid: "water" }));
  check("heating power 20Lpm ΔT10 → 13.92 kW", hpa.rows[0].value as number, 13.924, 0.01);
  check("heating power kWh/h row = kW row", hpa.rows[2].value as number, hpa.rows[0].value as number, 0.001);
  const hpGly = heatingPower(I({ flow: 20, deltaT: 10 }, { fluid: "glycol30" }));
  check("glycol30: 13.92 × (1038×3.65)/(998×4.186) → 12.55 kW", hpGly.rows[0].value as number, 13.924 * (1038 * 3.65) / (998 * 4.186), 0.01);
  if ((hpGly.rows[0].value as number) >= (hpa.rows[0].value as number)) { failures++; console.error("FAIL glycol must carry less heat than water"); }
  expectError("heating power ΔT=0 throws", () => heatingPower(I({ flow: 20, deltaT: 0 })));
  expectError("heating power unknown fluid throws", () => heatingPower(I({ flow: 20, deltaT: 10 }, { fluid: "mercury" })));

  // manufacturing
  const cs = cuttingSpeed(I({ vc: 120, diameter: 12 }));
  check("cutting Vc120 D12 → 3183 RPM", cs.rows[0].value as number, 3183, 0.001);
  const csBig = cuttingSpeed(I({ vc: 200, diameter: 100 }));
  check("cutting Vc200 D100 → 637 RPM (inverse D)", csBig.rows[0].value as number, 636.6, 0.01);
  check("cutting surface-speed check = input Vc", csBig.rows[2].value as number, 200, 0.001);
  expectError("cutting zero diameter throws", () => cuttingSpeed(I({ vc: 120, diameter: 0 })));

  const fr = feedRate(I({ rpm: 3183, chipLoad: 0.05, flutes: 2 }));
  check("feed 3183×0.05×2 → 318 mm/min", fr.rows[0].value as number, 318.3, 0.01);
  const fr4 = feedRate(I({ rpm: 3183, chipLoad: 0.05, flutes: 4 }));
  check("feed 4 flutes doubles → 637 mm/min", fr4.rows[0].value as number, 636.6, 0.01);
  check("feed IPM row = mm/min ÷ 25.4", fr4.rows[1].value as number, 636.6 / 25.4, 0.01);
  expectError("feed 0 flutes throws", () => feedRate(I({ rpm: 3183, chipLoad: 0.05, flutes: 0 })));

  const ct2 = cycleTime(I({ length: 300, feed: 318.3, passes: 1, setup: 2 }));
  check("cycle 300mm @318 → 0.99 min", ct2.rows[0].value as number, 0.993, 0.02);
  check("cycle with setup → 2.99 min", ct2.rows[1].value as number, 2.993, 0.02);
  const ct3 = cycleTime(I({ length: 300, feed: 318.3, passes: 3 }));
  check("cycle 3 passes ≈ 3× (with approach)", ct3.rows[0].value as number, 0.993 * 3, 0.01);
  check("cycle parts/hour = 60/total", ct3.rows[2].value as number, 60 / 2.98, 0.02);
  expectError("cycle negative feed throws", () => cycleTime(I({ length: 300, feed: -1 })));

  const mrr = materialRemovalRate(I({ depth: 2, width: 8, feed: 318.3 }, { operation: "milling" }));
  check("MRR 2×8×318 → 5.09 cm³/min", mrr.rows[0].value as number, 5.093, 0.01);
  const mrt = materialRemovalRate(I({ diameter: 50, depth: 2, feedPerRev: 0.2, rpm: 1000 }, { operation: "turning" }));
  check("MRR turning Vc157 → 62.8 cm³/min", mrt.rows[0].value as number, Math.PI * 50 * 2 * 0.2, 0.01);
  expectError("MRR milling missing feed throws", () => materialRemovalRate(I({ depth: 2, width: 8 }, { operation: "milling" })));

  const prr = productionRate(I({ cycleTime: 2, shiftHours: 8, efficiency: 0.8 }));
  check("production 2min/pc 8h 80% → 192 pcs", prr.rows[0].value as number, 192, 0.001);
  check("production theoretical row = 240", prr.rows[1].value as number, 240, 0.001);
  const prrSmall = productionRate(I({ cycleTime: 0.5, shiftHours: 8, efficiency: 0.75 }));
  check("production 0.5min/pc → 720 pcs", prrSmall.rows[0].value as number, 720, 0.001);
  expectError("production zero cycle throws", () => productionRate(I({ cycleTime: 0, shiftHours: 8, efficiency: 0.8 })));
  expectError("production efficiency >1 throws", () => productionRate(I({ cycleTime: 2, shiftHours: 8, efficiency: 1.5 })));

  // construction4
  const rp = rampLayout(I({ rise: 21 }, { slope: "12" }));
  check("ramp 21in 1:12 → 21 ft run", rp.rows[0].value as number, 21, 0.001);
  check("ramp slope angle → 4.76°", rp.rows[2].value as number, 4.764, 0.01);
  expectError("ramp zero rise throws", () => rampLayout(I({ rise: 0 })));

  const ew = earthwork(I({ length: 60, width: 40, existingElev: 2, targetElev: 0.5 }));
  check("cut-fill 60×40 Δ1.5 → 133.3 yd³", ew.rows[0].value as number, 133.33, 0.01);
  check("cut hauled +25% swell → 166.7 yd³", ew.rows[1].value as number, 166.67, 0.01);
  expectError("earthwork zero width throws", () => earthwork(I({ length: 60, width: 0, existingElev: 2, targetElev: 0.5 })));

  const ro = drainageRunoff(I({ area: 1000, rainfall: 1 }, { surface: "roof" }));
  check("runoff 1000ft² 1in roof → 592 gal", ro.rows[0].value as number, 592.2, 0.01);
  const roConc = drainageRunoff(I({ area: 1000, rainfall: 1 }, { surface: "concrete" }));
  check("runoff concrete C=0.9 → 561 gal (scales with C)", roConc.rows[0].value as number, 592.2 * 0.9 / 0.95, 0.01);
  const roGrass = drainageRunoff(I({ area: 1000, rainfall: 1 }, { surface: "grass" }));
  check("runoff grass C=0.25 → 156 gal", roGrass.rows[0].value as number, 592.2 * 0.25 / 0.95, 0.01);
  expectError("runoff unknown surface throws", () => drainageRunoff(I({ area: 1000, rainfall: 1 }, { surface: "dirt" })));

  const lw = lumberWeight(I({ width: 4, thickness: 2, length: 8, count: 1 }, { species: "pine" }));
  check("lumber 2x4x8 SPF → 8.5 lb", lw.rows[0].value as number, 8.46, 0.02);
  const lw10 = lumberWeight(I({ width: 4, thickness: 2, length: 8, count: 10 }, { species: "pine" }));
  check("lumber ×10 → 85 lb", lw10.rows[1].value as number, 84.6, 0.02);
  expectError("lumber unknown species throws", () => lumberWeight(I({ width: 4, thickness: 2, length: 8, count: 1 }, { species: "teak" })));

  // hvac4
  const ad = airDensity(I({ tempC: 20, rh: 50, altitude: 0 }));
  check("air density 20°C 50% 0m → 1.199 kg/m³", ad.rows[0].value as number, 1.1988, 0.01);
  const adAlt = airDensity(I({ tempC: 20, rh: 50, altitude: 1500 }));
  check("air density @1500m → ~1.00 kg/m³", adAlt.rows[0].value as number, 1.0, 0.02);
  expectError("air density out of range throws", () => airDensity(I({ tempC: 100, rh: 50 })));

  // solar4
  const dc = dcCableLoss(I({ stringV: 320, stringI: 10, length: 30, cableSize: 6 }));
  check("DC cable 320V 10A 30m 6mm² → 1.95 V", dc.rows[0].value as number, 1.95, 0.001);
  check("DC cable loss → 0.61% of Vmp", (dc.rows[0].value as number) / 320 * 100, 0.609, 0.01);
  check("DC cable power lost → 19.5 W", dc.rows[1].value as number, 19.5, 0.001);
  expectError("DC cable zero length throws", () => dcCableLoss(I({ stringV: 320, stringI: 10, length: 0, cableSize: 6 })));

  console.log("\nbatch-4 checks done");
}

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll batch-2/3/4 engine checks passed.");
