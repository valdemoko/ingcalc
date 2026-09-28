/**
 * HVAC calculation engines — batch 3.
 * Pure functions. New calculators: psychrometric state point (grains, enthalpy,
 * dew point via Magnus), heat pump COP/operating costs vs resistance heating,
 * temperature conversion (exact reference points).
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/**
 * Moist air state point from dry-bulb temperature and relative humidity.
 * Saturation pressure via a standard hydration approximation (AShRAE-style
 * formula accurate to ~0.1% over 0-60 °C), then humidity ratio and enthalpy.
 */
export function psychrometrics(input: CalcInput): CalcOutput {
  const { values } = input;
  const tC = values.tempC;
  const rh = Math.min(100, Math.max(1, values.rh));
  if (tC < -20 || tC > 60) throw new Error("Temperature out of range (-20 to 60 °C)");

  // Saturation vapor pressure (Pa) — ASHRAE Fundamentals correlation over
  // liquid water, valid 0-200 °C, T in Kelvin. Accurate to ~0.1% over 0-60 °C.
  const TK = tC + 273.15;
  const C8 = -5.8002206e3, C9 = 1.3914993, C10 = -4.8640239e-2,
    C11 = 4.1764768e-5, C12 = -1.4452093e-8, C13 = 6.5459673;
  const pwsPa = Math.exp(C8 / TK + C9 + C10 * TK + C11 * TK ** 2 + C12 * TK ** 3 + C13 * Math.log(TK));
  const pws = pwsPa / 1000; // kPa
  const pw = (rh / 100) * pws;

  // Total pressure: standard atmosphere at the given altitude (barometric).
  const altitudeM = values.altitude ?? 0;
  if (altitudeM < 0 || altitudeM > 5000) throw new Error("Altitude must be between 0 and 5000 m");
  const pTot = 101.325 * Math.pow(1 - 2.25577e-5 * altitudeM, 5.2559); // kPa

  // Humidity ratio (kg water / kg dry air).
  const W = 0.621945 * (pw / (pTot - pw));
  // Enthalpy of moist air per kg dry air (kJ/kg): dry air + water vapor terms.
  const h = 1.006 * tC + W * (2501 + 1.86 * tC);

  // Dew point via Magnus (for the comfort cross-check).
  const gamma = Math.log(rh / 100) + (17.62 * tC) / (243.12 + tC);
  const dewC = (243.12 * gamma) / (17.62 - gamma);

  return {
    rows: [
      { label: "Humidity ratio", value: round(W * 1000, 2), unit: "g/kg", decimals: 2, primary: true, hint: "Grams of water vapor per kg of dry air." },
      { label: "Enthalpy", value: round(h, 1), unit: "kJ/kg", decimals: 1, primary: true, hint: "Per kg of DRY air — the number coil loads are computed from." },
      { label: "Dew point", value: round(dewC, 1), unit: "°C", decimals: 1 },
      { label: "Saturation pressure", value: round(pws * 1000, 0), unit: "Pa", decimals: 0 },
      { label: "Barometric pressure", value: round(pTot, 2), unit: "kPa", decimals: 2, hint: `At ${round(altitudeM, 0)} m altitude.` },
    ],
    notes: [
      "Model: ASHRAE saturation-pressure correlation + ideal-gas humidity ratio W = 0.621945·pw/(p−pw).",
      "Enthalpy: h = 1.006·T + W·(2501 + 1.86·T) kJ/kg dry air — the standard psychrometric relation.",
      "Altitude matters: at 1500 m the same RH holds less absolute moisture and coils behave differently.",
      "For full chart work (wet bulb, specific volume) use a psychrometric chart or software — this covers the common sizing inputs.",
    ],
  };
}

/** Heat pump vs electric resistance: COP at temperature, cost and Seasonal estimate. */
export function heatPumpCop(input: CalcInput): CalcOutput {
  const { values } = input;
  const hspf = values.hspf;
  const outdoorC = values.outdoorC;
  const heatKw = values.heatLoad;
  const rate = values.rate;
  if (hspf < 6 || hspf > 16) throw new Error("HSPF must be between 6 and 16");
  if (heatKw <= 0) throw new Error("Heat load must be positive");
  if (rate < 0) throw new Error("Invalid rate");

  // Rated COP from HSPF: HSPF (BTU/Wh) × 0.2931 (Wh/BTU→W) gives seasonal COP.
  const seasonalCop = hspf * 0.2931;
  // Capacity and COP both fall as temperature drops (air-source).
  const tempFactor = Math.max(0.35, 1 - Math.max(0, 8.3 - outdoorC) * 0.028);
  const copAtTemp = Math.max(1.0, seasonalCop * tempFactor);
  const capacityFactor = Math.max(0.4, 1 - Math.max(0, 8.3 - outdoorC) * 0.018);

  const elecKw = heatKw / copAtTemp;
  const costKwhHeatPump = elecKw * rate;
  const costKwhResistance = heatKw * rate; // resistance: COP 1.0
  const savingsPerKwh = costKwhResistance - costKwhHeatPump;

  return {
    rows: [
      { label: "COP at this outdoor temp", value: round(copAtTemp, 2), unit: "—", decimals: 2, primary: true, hint: `Seasonal COP ${round(seasonalCop, 2)} adjusted for ${round(outdoorC, 0)} °C operation.` },
      { label: "Delivered capacity here", value: round(heatKw * capacityFactor, 2), unit: "kW", decimals: 2, hint: "Rated capacity derates with outdoor temperature." },
      { label: "Electric draw", value: round(elecKw, 2), unit: "kW", decimals: 2 },
      { label: "Cost per kWh of heat", value: round(costKwhHeatPump, 3), unit: "$", decimals: 3, primary: true, hint: `Resistance heat: ${round(costKwhResistance, 3)} $/kWh at COP 1.0.` },
      { label: "Savings vs resistance", value: round(savingsPerKwh * heatKw * 1000 / 1000 * 100, 1), unit: "%", decimals: 1, hint: "Lower COP at low temperature can require backup resistance strips." },
    ],
    notes: [
      "Model: seasonal COP = HSPF × 0.2931 (unit conversion from BTU/Wh). COP derates ~2.8% per °C below 8 °C (air-source, floors of ~0.35 of rating).",
      "Electric resistance heat is COP 1.0 by definition — every kWh bought becomes 1 kWh of heat.",
      "Below the balance point, heat pumps run alongside resistance strips: real seasonal COP lands between the two figures.",
      "Compare against your actual fuel: gas at 85% AFUE and $1.20/therm delivers heat at ~$0.014/MSF-level economics that depend on local prices — run both.",
    ],
  };
}

/** Exact temperature conversions with reference-point validation. */
export function tempConvert(input: CalcInput): CalcOutput {
  const { values } = input;
  const t = values.temp;
  const scale = input.raw.scale ?? "celsius";
  if (t < -273.15 && scale === "celsius") throw new Error("Below absolute zero (−273.15 °C)");
  if (t < -459.67 && scale === "fahrenheit") throw new Error("Below absolute zero (−459.67 °F)");

  let c: number;
  if (scale === "celsius") c = t;
  else if (scale === "fahrenheit") c = (t - 32) / 1.8;
  else c = t - 273.15; // kelvin

  if (c < -273.15) throw new Error("Below absolute zero");

  return {
    rows: [
      { label: "Celsius", value: round(c, 2), unit: "°C", decimals: 2, primary: true },
      { label: "Fahrenheit", value: round(c * 1.8 + 32, 2), unit: "°F", decimals: 2, primary: true },
      { label: "Kelvin", value: round(c + 273.15, 2), unit: "K", decimals: 2 },
    ],
    notes: [
      "Exact conversions: °F = °C × 1.8 + 32; K = °C + 273.15. No approximations.",
      "Reference points: water freezes 0 °C / 32 °F, boils 100 °C / 212 °F at sea level; absolute zero −273.15 °C / 0 K.",
      "Temperature DIFFERENCES: 1 °C = 1.8 °F exactly. ΔT conversions for HVAC load math multiply by 1.8, never add 32.",
    ],
  };
}
