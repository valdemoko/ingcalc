/**
 * Phase-1 regression spot checks: energy cost (kWh mode), wire resistance
 * temperature correction, voltage drop aluminum, generator sizing and
 * engine displacement in inches. Run with: npx tsx scripts/verify-phase1.ts
 */
import { energyCost, wireResistance, generatorSizing } from "../src/lib/engines/electrical2";
import { voltageDrop } from "../src/lib/engines/electrical";
import { engineDisplacement } from "../src/lib/engines/mechanical2";

const I = (values: Record<string, number>, raw: Record<string, string> = {}) => ({ values, raw });

let failures = 0;
function check(name: string, actual: number, expected: number, tol = 0.02) {
  const ok = Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected));
  if (!ok) { failures++; console.error(`FAIL ${name}: got ${actual}, expected ${expected}`); }
  else console.log(`ok   ${name}: ${actual}`);
}

// 1. Energy cost, kWh mode: kWh × price over day/month/year
const ec = energyCost(I({ kwhPerDay: 6, rate: 0.15 }, { mode: "kwh" }));
check("kWh mode: cost/day → 0.90", ec.rows[3].value as number, 0.9, 0.001);
check("kWh mode: cost/month → 27.40", ec.rows[4].value as number, 27.4, 0.001);
check("kWh mode: cost/year → 328.50", ec.rows[5].value as number, 328.5, 0.001);
const ecW = energyCost(I({ watts: 1500, hours: 4, rate: 0.15, quantity: 2 }, { mode: "watts" }));
check("W×h mode ×2 qty: kWh/day → 12", ecW.rows[0].value as number, 12, 0.001);

// 2. Wire resistance temperature correction R(T) = R75 × (1 + α75(T−75))
// 12 AWG copper: 1.98 Ω/kft at 75 °C. α75 = 0.00323 → @20 °C: 1.98 × 0.82235 = 1.628
const r20 = wireResistance(I({ length: 1000, tempC: 20 }, { wire: "12 AWG", material: "copper" }));
check("12AWG Cu @20°C → 1.628 Ω/kft", r20.rows[1].value as number, 1.98 * (1 + 0.00323 * (20 - 75)), 0.001);
const r90 = wireResistance(I({ length: 1000, tempC: 90 }, { wire: "12 AWG", material: "copper" }));
check("12AWG Cu @90°C → 2.066 Ω/kft", r90.rows[1].value as number, 1.98 * (1 + 0.00323 * 15), 0.001);
const r40Al = wireResistance(I({ length: 1000, tempC: 75 }, { wire: "4/0 AWG", material: "aluminum" }));
check("4/0 Al @75°C → 0.0997 Ω/kft (derived ×1.64)", r40Al.rows[1].value as number, 0.0608 * 1.64, 0.001);
check("4/0 Al per-meter row consistent", (r40Al.rows[2].value as number) * 3.28084 * 1000, r40Al.rows[1].value as number, 0.001);

// 3. Voltage drop with aluminum material (×1.64 table ratio)
const vdCu = voltageDrop(I({ voltage: 240, current: 20, length: 150 }, { system: "single", wire: "6 AWG", material: "copper" }));
const vdAl = voltageDrop(I({ voltage: 240, current: 20, length: 150 }, { system: "single", wire: "6 AWG", material: "aluminum" }));
check("VD 6AWG Cu 150ft @20A → 2.952 V", vdCu.rows[0].value as number, 20 * (0.491 * 300 / 1000), 0.001);
check("VD Al = Cu × 1.64", vdAl.rows[0].value as number, vdCu.rows[0].value as number * 1.64, 0.001);

// 4. Generator sizing unchanged
const gs = generatorSizing(I({ runningW: 5000, surgeW: 6000 }));
check("generator max(6250, 6000) → 6.25 kW", gs.rows[0].value as number, 6.25, 0.01);

// 5. Engine displacement with inch inputs (350 Chevy: 4.00 × 3.48 in V8)
const disp = engineDisplacement(I({ bore: 4 * 25.4, stroke: 3.48 * 25.4, cylinders: 8 }));
check("350 Chevy via inches → ~5735 cc", disp.rows[0].value as number, 5735, 0.01);
check("350 Chevy CID row", disp.rows[2].value as number, 350, 0.01);

if (failures > 0) { console.error(`\n${failures} phase-1 regression check(s) FAILED`); process.exit(1); }
console.log("\nPhase-1 improvements verified intact.");
