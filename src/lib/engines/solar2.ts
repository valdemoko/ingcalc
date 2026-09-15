/**
 * Solar & energy engines — batch 2. Pure functions.
 * New calculators: array electricals (string Voc/Vmp/strings), battery bank from
 * target loads, charge time, savings/payback, optimal tilt, panel count for a target.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Array electricals: string Voc at cold temperature, Vmp, current and inverter match. */
export function arrayElectricals(input: CalcInput): CalcOutput {
  const { values } = input;
  const voc = values.voc;
  const vmp = values.vmp;
  const isc = values.isc;
  const imp = values.imp;
  const panelsPerString = Math.round(values.panelsPerString);
  const strings = Math.round(values.strings);
  const minTempC = values.minTempC;
  const maxDcInput = values.maxDcInput;
  if (voc <= 0 || vmp <= 0 || isc <= 0 || imp <= 0) throw new Error("All panel electrical values are required");
  if (panelsPerString <= 0 || strings <= 0) throw new Error("String and panel counts must be positive");
  if (minTempC < -45 || minTempC > 25) throw new Error("Minimum temperature must be between -45 and 25 °C");

  // Temperature coefficient of Voc: about −0.29%/°C for crystalline silicon.
  // Voc_cold = Voc_STC × (1 + β × (T − 25)); T below 25 °C raises Voc.
  const beta = -0.0029;
  const deltaT = minTempC - 25;
  const vocCold = voc * (1 + beta * deltaT);
  const stringVocCold = vocCold * panelsPerString;
  const stringVmp = vmp * panelsPerString;
  const arrayVmp = stringVmp;
  const arrayIsc = isc * strings;
  const arrayW = vmp * imp * panelsPerString * strings;
  const overVoltage = maxDcInput > 0 && stringVocCold > maxDcInput;

  return {
    rows: [
      { label: "String Voc at cold temp", value: round(stringVocCold, 1), unit: "V", decimals: 1, primary: true, hint: maxDcInput > 0 ? (overVoltage ? `⚠ EXCEEDS inverter max ${maxDcInput} V — reduce panels per string.` : `Within inverter max ${maxDcInput} V.`) : "Compare against the inverter's max DC input." },
      { label: "String Vmp", value: round(stringVmp, 1), unit: "V", decimals: 1, primary: true, hint: "Should fall inside the inverter MPPT window." },
      { label: "Array Isc", value: round(arrayIsc, 1), unit: "A", decimals: 1, hint: "×1.25 for NEC 690 sizing." },
      { label: "Array power (STC)", value: round(arrayW, 0), unit: "W", decimals: 0 },
    ],
    notes: [
      "Voc rises as temperature falls: Voc_cold = Voc_STC × (1 + β×ΔT), β ≈ −0.29%/°C for crystalline silicon (check the datasheet).",
      "The cold-temperature Voc must stay below the inverter's maximum DC input — the most common string-sizing failure.",
      "Vmp at STC should sit inside the inverter's MPPT operating window; at high temperature it drops further (−0.35%/°C approx.).",
    ],
  };
}

/** Battery bank size for a target daily load (standalone check, metric-first). */
export function batteryBankSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const dailyWh = values.dailyWh;
  const systemV = values.systemV;
  const dod = values.dod;
  const autonomyDays = values.autonomyDays;
  if (dailyWh <= 0 || systemV <= 0) throw new Error("Invalid inputs");
  if (dod <= 0 || dod > 1) throw new Error("DoD must be between 0 and 1");
  if (autonomyDays <= 0) throw new Error("Autonomy must be positive");

  const bankWh = (dailyWh * autonomyDays) / dod;
  const bankAh = bankWh / systemV;
  const parallel = 200; // common max Ah per battery for grouping illustration
  const unitsNeeded = Math.ceil(bankAh / parallel);

  return {
    rows: [
      { label: "Bank size", value: round(bankAh, 0), unit: "Ah @ " + systemV + "V", decimals: 0, primary: true },
      { label: "Bank energy", value: round(bankWh / 1000, 2), unit: "kWh", decimals: 2, primary: true },
      { label: "Usable energy", value: round((bankWh * dod) / 1000, 2), unit: "kWh", decimals: 2, hint: "What you can actually draw given the DoD limit." },
      { label: "Typical batteries", value: unitsNeeded, unit: "× 200 Ah blocks", decimals: 0, hint: "Series to reach voltage, parallel to reach Ah." },
    ],
    notes: [
      "Model: bank Ah = (daily Wh × autonomy days) ÷ (system V × DoD).",
      "Series strings must use identical batteries — never mix ages or chemistries in one string.",
      "High parallel counts (>4 strings) need fusing per string and careful balancing.",
    ],
  };
}

/** Battery charge time from charger current and battery capacity. */
export function batteryChargeTime(input: CalcInput): CalcOutput {
  const { values } = input;
  const capacityAh = values.capacityAh;
  const chargerA = values.chargerA;
  const fromPct = values.fromPct;
  const toPct = values.toPct;
  const eff = values.eff;
  if (capacityAh <= 0 || chargerA <= 0) throw new Error("Capacity and charger current must be positive");
  if (fromPct < 0 || toPct > 100 || toPct <= fromPct) throw new Error("Charge window must increase from 0-100");
  if (eff <= 0 || eff > 1) throw new Error("Efficiency must be between 0 and 1");

  const ahNeeded = capacityAh * ((toPct - fromPct) / 100) / eff;
  const hours = ahNeeded / chargerA;
  const cRate = chargerA / capacityAh;

  return {
    rows: [
      { label: "Charge time", value: round(hours, 2), unit: "hours", decimals: 2, primary: true },
      { label: "Charge rate", value: round(cRate, 3), unit: "C", decimals: 3, hint: cRate > 0.5 ? "Above 0.5C — verify the battery allows fast charge." : "Gentle rate, fine for all chemistries." },
      { label: "Energy to restore", value: round(ahNeeded, 1), unit: "Ah", decimals: 1, hint: `Includes ${Math.round((1 - eff) * 100)}% charge losses.` },
    ],
    notes: [
      "Model: time = (Ah × window) ÷ (A × efficiency).",
      "Lead-acid absorption phase slows dramatically above ~80% — the last 20% can take as long as the first 80%.",
      "Lithium charges linearly to nearly 100% but the BMS may reduce current when cold.",
    ],
  };
}

/** Solar savings and simple payback. */
export function solarSavings(input: CalcInput): CalcOutput {
  const { values } = input;
  const systemKw = values.systemKw;
  const psh = values.psh;
  const derate = values.derate;
  const rate = values.rate;
  const costPerWatt = values.costPerWatt;
  const exportRate = values.exportRate ?? 0;
  if (systemKw <= 0 || psh <= 0 || rate < 0 || costPerWatt < 0) throw new Error("Invalid inputs");
  if (derate <= 0 || derate > 1) throw new Error("Derate must be between 0 and 1");

  const kwhYear = systemKw * psh * 365 * derate;
  // Self-consumed portion displaces purchases; exported portion earns the export rate.
  const selfConsumption = Math.min(1, Math.max(0, values.selfConsumption));
  const selfKwh = kwhYear * selfConsumption;
  const exportKwh = kwhYear * (1 - selfConsumption);
  const savingsYear = selfKwh * rate + exportKwh * exportRate;
  const installCost = systemKw * 1000 * costPerWatt;
  const paybackYears = savingsYear > 0 ? installCost / savingsYear : NaN;
  const lifetimeSavings = savingsYear * 25;

  return {
    rows: [
      { label: "Annual production", value: Math.round(kwhYear), unit: "kWh/year", decimals: 0, primary: true },
      { label: "Annual savings", value: round(savingsYear, 2), unit: "$", decimals: 2, primary: true },
      { label: "Installed cost", value: Math.round(installCost), unit: "$", decimals: 0 },
      { label: "Simple payback", value: Number.isFinite(paybackYears) ? round(paybackYears, 1) : NaN, unit: "years", decimals: 1, hint: "No incentives, no degradation, fixed rates." },
      { label: "25-year savings (undiscounted)", value: Math.round(lifetimeSavings), unit: "$", decimals: 0, hint: "Before degradation (~0.5%/yr) and rate changes." },
    ],
    notes: [
      "Production: kWh = kW × PSH × 365 × derate. Savings: self-consumed × retail rate + exported × export rate.",
      "Simple payback ignores degradation (~0.5%/yr), panel cleaning, inverter replacement (~year 12) and electricity inflation.",
      "Net metering rules and time-of-use rates change the economics significantly — use real tariff data.",
    ],
  };
}

/** Optimal solar tilt for latitude and season. */
export function solarTilt(input: CalcInput): CalcOutput {
  const { values } = input;
  const latitude = values.latitude;
  if (latitude < -66 || latitude > 66) throw new Error("Latitude must be between -66 and 66 degrees");
  const season = input.raw.season ?? "year";
  const hemisphere = latitude >= 0 ? "north" : "south";
  const absLat = Math.abs(latitude);

  let tilt: number;
  switch (season) {
    case "winter": tilt = absLat + 15; break;
    case "summer": tilt = Math.max(0, absLat - 15); break;
    default: tilt = absLat; // year-round
  }
  const azimuth = hemisphere === "north" ? 180 : 0; // degrees from north

  const winterGain = tilt === absLat ? 1 : 1; // relative comparisons below
  void winterGain;

  return {
    rows: [
      { label: "Optimal tilt", value: round(tilt, 0), unit: "°", decimals: 0, primary: true, hint: season === "year" ? "Equal to latitude for max annual yield." : season === "winter" ? "Steeper than latitude: latitude + 15°." : "Flatter: latitude − 15°." },
      { label: "Azimuth (true)", value: azimuth, unit: "°", decimals: 0, hint: hemisphere === "north" ? "Due south facing." : "Due north facing." },
      { label: "Latitude used", value: absLat, unit: "°", decimals: 1 },
    ],
    notes: [
      "Rule of thumb: annual optimum tilt ≈ latitude; winter +15°, summer −15° (hemisphere-aware).",
      "Flat-roof ballasted mounts typically use 10–15° regardless — wind loading dominates there.",
      "Shading analysis matters more than 2–3° of tilt angle in most real sites.",
    ],
  };
}

/** Panels needed for a target daily energy. */
export function panelCount(input: CalcInput): CalcOutput {
  const { values } = input;
  const targetKwh = values.targetKwh;
  const panelW = values.panelW;
  const psh = values.psh;
  const derate = values.derate;
  if (targetKwh <= 0 || panelW <= 0 || psh <= 0) throw new Error("Invalid inputs");
  if (derate <= 0 || derate > 1) throw new Error("Derate must be between 0 and 1");

  const requiredWp = (targetKwh * 1000) / (psh * derate);
  const panels = Math.ceil(requiredWp / panelW);
  const installedKw = (panels * panelW) / 1000;

  return {
    rows: [
      { label: "Array size required", value: Math.round(requiredWp), unit: "Wp", decimals: 0, primary: true },
      { label: "Panels needed", value: panels, unit: `× ${panelW} W`, decimals: 0, primary: true, hint: `Rounded up to whole panels.` },
      { label: "Installed array", value: round(installedKw, 2), unit: "kW", decimals: 2 },
      { label: "Monthly output (avg)", value: round(installedKw * psh * 30.44 * derate, 1), unit: "kWh", decimals: 1 },
    ],
    notes: [
      "Model: Wp = daily kWh ÷ (PSH × derate), rounded up per panel.",
      "Use the worst-month PSH if the target must be met year-round.",
      "Roof space check: ~5–7 m² (55–75 ft²) per 400 W panel with access gaps.",
    ],
  };
}
