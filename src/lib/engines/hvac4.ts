/**
 * HVAC engines — batch 4. Pure functions.
 * Air density from temperature, altitude and humidity — the input every
 * fan, CFM and psychrometric calculation quietly assumes.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Moist air density from dry-bulb temperature, altitude and RH. */
export function airDensity(input: CalcInput): CalcOutput {
  const { values } = input;
  const tC = values.tempC;
  const rh = Math.min(100, Math.max(0, values.rh));
  if (tC < -40 || tC > 80) throw new Error("Temperature out of range (-40 to 80 °C)");
  const altitudeM = values.altitude ?? 0;
  if (altitudeM < -400 || altitudeM > 6000) throw new Error("Altitude out of range (-400 to 6000 m)");

  // Barometric pressure at altitude (standard atmosphere).
  const pTot = 101.325 * Math.pow(1 - 2.25577e-5 * altitudeM, 5.2559); // kPa

  // Saturation pressure via Magnus (adequate to ~0.2% over the range).
  const gammaSat = (17.62 * tC) / (243.12 + tC);
  const pws = 0.6112 * Math.exp(gammaSat); // kPa
  const pw = (rh / 100) * pws;

  // Moist air density: ρ = (p_d·M_d + p_v·M_v)/(R·T)
  const tk = tC + 273.15;
  const rho = ((pTot - pw) * 28.9654 + pw * 18.01528) / (8.31446 * tk); // kg/m³ (pressures in kPa)

  const dryRef = 1.204; // kg/m³ at 20 °C, sea level
  const correction = rho / dryRef;

  return {
    rows: [
      { label: "Air density", value: round(rho, 4), unit: "kg/m³", decimals: 4, primary: true, hint: `${round(rho * 0.062428, 4)} lb/ft³.` },
      { label: "Correction vs standard air", value: round(correction, 3), unit: "×", decimals: 3, primary: true, hint: "Multiply fan CFM and 1.08-equations by this factor." },
      { label: "Barometric pressure", value: round(pTot, 2), unit: "kPa", decimals: 2, hint: `${round(pTot * 0.2953, 2)} inHg at ${altitudeM} m.` },
      { label: "Vapor pressure", value: round(pw * 1000, 0), unit: "Pa", decimals: 0 },
    ],
    notes: [
      "Model: ideal-gas moist air, standard-atmosphere pressure at altitude, Magnus saturation.",
      "Standard air (1.204 kg/m³, 0.075 lb/ft³ at 20 °C/sea level) is what fan curves and the 1.08 factor assume.",
      "Altitude dominates: at 1500 m air is ~15% thinner — fans deliver less mass and high-altitude sites derate equipment.",
      "Hot attics: 50 °C air is ~9% lighter than 20 °C air — one reason attic fans move more CFM for the same mass flow.",
    ],
  };
}
