/**
 * Solar & battery calculation engines. Pure functions.
 *
 * Models:
 * - Panel output: E = Wp × PSH × derate (inverter, soiling, temperature ~ 0.8 combined default).
 * - Battery: usable energy = Wh × DoD × inverter efficiency; runtime = usable / load.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Daily energy from panel wattage and peak sun hours. */
export function panelOutput(input: CalcInput): CalcOutput {
  const { values } = input;
  const wattPeak = values.wattPeak;
  const psh = values.psh;
  const derate = values.derate;
  if (wattPeak <= 0) throw new Error("Panel wattage must be positive");
  if (psh <= 0) throw new Error("Peak sun hours must be positive");
  if (derate <= 0 || derate > 1) throw new Error("Derate factor must be between 0 and 1");

  const whDay = wattPeak * psh * derate;
  const kwhDay = whDay / 1000;
  const kwhMonth = kwhDay * 30.44;
  const kwhYear = kwhDay * 365;

  return {
    rows: [
      { label: "Energy per day", value: round(kwhDay, 2), unit: "kWh/day", decimals: 2, primary: true },
      { label: "Energy per day (Wh)", value: round(whDay), unit: "Wh", decimals: 0 },
      { label: "Energy per month (avg)", value: round(kwhMonth, 1), unit: "kWh", decimals: 1 },
      { label: "Energy per year (avg)", value: round(kwhYear, 0), unit: "kWh", decimals: 0 },
    ],
    notes: [
      `Model: E = Wp × PSH × derate, with derate ${derate} (inverter + wiring + soiling + temperature).`,
      "Peak sun hours (PSH) = equivalent hours per day at 1000 W/m². Use local irradiance data (e.g. Global Solar Atlas): ~4–5 PSH is typical for mid-latitudes.",
      "Fixed south-facing tilt at latitude is assumed for northern-hemisphere sites.",
    ],
  };
}

/** Battery runtime for a given load, with depth-of-discharge and inverter losses. */
export function batteryRuntime(input: CalcInput): CalcOutput {
  const { values } = input;
  const capacityAh = values.capacityAh;
  const voltage = values.voltage;
  const loadW = values.loadW;
  const dod = values.dod;
  const inverterEff = values.inverterEff;
  if (capacityAh <= 0 || voltage <= 0) throw new Error("Capacity and voltage must be positive");
  if (loadW <= 0) throw new Error("Load must be positive");
  if (dod <= 0 || dod > 1) throw new Error("Depth of discharge must be between 0 and 1");
  if (inverterEff <= 0 || inverterEff > 1) throw new Error("Inverter efficiency must be between 0 and 1");

  const capacityWh = capacityAh * voltage;
  const usableWh = capacityWh * dod * inverterEff;
  const runtimeH = usableWh / loadW;
  const runtimeHm = Math.floor(runtimeH);
  const runtimeMin = Math.round((runtimeH - runtimeHm) * 60);

  return {
    rows: [
      { label: "Runtime", value: round(runtimeH, 2), unit: "hours", decimals: 2, primary: true },
      { label: "Runtime (h:mm)", value: 0, unit: `${runtimeHm} h ${runtimeMin} min`, primary: true },
      { label: "Battery nominal energy", value: round(capacityWh / 1000, 2), unit: "kWh", decimals: 2 },
      { label: "Usable energy", value: round(usableWh / 1000, 2), unit: "kWh", decimals: 2, hint: "After DoD and inverter losses." },
      { label: "Energy per day at this load", value: round((loadW * 24) / 1000, 2), unit: "kWh/day", decimals: 2 },
    ],
    notes: [
      "Model: usable = Ah × V × DoD × inverter efficiency; runtime = usable ÷ load.",
      "Lead-acid DoD is limited to ~50% for cycle life; LiFePO4 tolerates 80–90%.",
      "Peukert effect ignored: at very high discharge rates (>C/2) lead-acid delivers noticeably less capacity than rated.",
    ],
  };
}

/** Off-grid system sizing: battery bank + panel array for a daily load. */
export function offGridSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const dailyWh = values.dailyWh;
  const systemV = values.systemV;
  const dod = values.dod;
  const inverterEff = values.inverterEff;
  const autonomyDays = values.autonomyDays;
  const psh = values.psh;
  const derate = values.derate;
  const peakLoadW = values.peakLoadW;
  if (dailyWh <= 0 || systemV <= 0) throw new Error("Daily energy and system voltage must be positive");
  if (psh <= 0) throw new Error("Peak sun hours must be positive");

  const loadWithInverter = dailyWh / inverterEff;
  const batteryWh = (loadWithInverter * autonomyDays) / dod;
  const batteryAh = batteryWh / systemV;
  const panelW = loadWithInverter / (psh * derate);
  const inverterW = Number.isFinite(peakLoadW) && peakLoadW > 0 ? peakLoadW * 1.25 : NaN; // 25% surge margin

  return {
    rows: [
      { label: "Battery bank size", value: round(batteryAh), unit: "Ah @ " + systemV + "V", decimals: 0, primary: true },
      { label: "Battery bank energy", value: round(batteryWh / 1000, 2), unit: "kWh", decimals: 2 },
      { label: "Panel array size", value: round(panelW), unit: "Wp", decimals: 0, primary: true, hint: `Recharges the bank in one average sun day (${psh} PSH).` },
      ...(Number.isFinite(inverterW) ? [{ label: "Minimum inverter rating", value: round(inverterW, 0), unit: "W", decimals: 0, hint: "Peak load + 25% margin. Check surge ratings for motor loads." }] : []),
    ],
    notes: [
      "Battery: Wh = (daily Wh ÷ inverter eff.) × autonomy days ÷ DoD. Panels: Wp = daily Wh ÷ (PSH × derate).",
      `DoD ${dod} assumed — 0.5 for lead-acid, 0.8–0.9 for LiFePO4. Autonomy ${autonomyDays} day(s) covers cloudy periods.`,
      "Winter PSH can be 50%+ lower than the annual average at high latitudes; size for the worst month if the system must run year-round.",
      "Battery capacity should also respect the maximum charge rate: charge current ≈ panel W ÷ system V must stay within the battery C-rate limit.",
    ],
  };
}

/** PWM vs MPPT charge controller sizing. */
export function chargeController(input: CalcInput): CalcOutput {
  const { values } = input;
  const arrayW = values.arrayW;
  const systemV = values.systemV;
  const type = input.raw.type ?? "mppt";
  if (arrayW <= 0 || systemV <= 0) throw new Error("Array wattage and system voltage must be positive");

  if (type === "mppt") {
    const maxCurrent = arrayW / systemV;
    return {
      rows: [
        { label: "Minimum controller rating", value: round(maxCurrent * 1.25, 1), unit: "A", decimals: 1, primary: true, hint: "Array watts ÷ system V, +25% safety margin (NEC-style)." },
        { label: "Max power processed", value: round(arrayW / 1000, 2), unit: "kW", decimals: 2 },
      ],
      notes: [
        "MPPT controllers convert excess array voltage into extra current — size by array watts ÷ battery voltage, plus margin.",
        "Also verify the controller's max input voltage against the array open-circuit voltage (cold temperature corrected).",
      ],
    };
  }

  const shortCircuit = values.isc ?? 0;
  if (shortCircuit <= 0) throw new Error("Panel short-circuit current (Isc) is required for PWM sizing");
  const pwmCurrent = shortCircuit * 1.25;
  return {
    rows: [
      { label: "Minimum controller rating", value: round(pwmCurrent, 1), unit: "A", decimals: 1, primary: true, hint: "Array short-circuit current × 1.25." },
    ],
    notes: [
      "PWM controllers pass panel current straight through — size by total array Isc × 1.25, not by wattage.",
      "PWM wastes the voltage difference between panel Vmp and battery voltage; MPPT harvests it (10–30% more energy).",
    ],
  };
}
