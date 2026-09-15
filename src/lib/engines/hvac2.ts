/**
 * HVAC calculation engines — batch 2. Pure functions.
 * New calculators: dew point (Magnus), duct velocity, cooling cost, heat index,
 * wind chill, heating degree-day energy, sensible heat, fan affinity laws.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Dew point (Magnus formula) with dew-point comfort interpretation. */
export function dewPoint(input: CalcInput): CalcOutput {
  const { values } = input;
  const tempC = values.temp;
  const rh = Math.min(100, Math.max(1, values.rh));
  if (tempC < -40 || tempC > 60) throw new Error("Temperature out of range (-40 to 60 °C)");

  // Magnus-Tetens approximation (valid -40 to 50 °C, ±0.35 °C)
  const a = 17.62, b = 243.12;
  const gamma = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  const dewC = (b * gamma) / (a - gamma);

  const comfort =
    dewC < 10 ? "Dry — comfortable"
    : dewC < 13 ? "Comfortable"
    : dewC < 16 ? "Noticeably humid"
    : dewC < 18 ? "Uncomfortable for most people"
    : dewC < 21 ? "Oppressive"
    : "Severe — dangerous heat stress";

  return {
    rows: [
      { label: "Dew point", value: round(dewC, 1), unit: "°C", decimals: 1, primary: true, hint: comfort },
      { label: "Dew point", value: round(dewC * 1.8 + 32, 1), unit: "°F", decimals: 1, primary: true },
      { label: "Wet bulb (approx.)", value: round(tempC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) + Math.atan(tempC + rh) - Math.atan(rh - 1.676331) + 0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) - 4.686035, 1), unit: "°C", decimals: 1, hint: "Stull approximation." },
    ],
    notes: [
      "Dew point via the Magnus-Tetens formula (valid −40 to 50 °C, accuracy ±0.35 °C).",
      "Dew point ≥ 60 °F (15.5 °C) starts to feel muggy; ≥ 70 °F (21 °C) is oppressive — dew point, not RH, is the better comfort metric.",
      "Condensation forms on surfaces at or below the dew point — critical for cold pipes and windows.",
    ],
  };
}

/** Duct velocity check from airflow and known duct diameter. */
export function ductVelocity(input: CalcInput): CalcOutput {
  const { values } = input;
  const cfm = values.cfm;
  const diameterIn = values.diameter;
  if (cfm <= 0 || diameterIn <= 0) throw new Error("Airflow and diameter must be positive");

  const areaFt2 = (Math.PI * diameterIn * diameterIn) / 4 / 144;
  const fpm = cfm / areaFt2;
  const mps = fpm * 0.00508;
  const guidance =
    fpm < 500 ? "Low — duct may be oversized and waste money"
    : fpm < 700 ? "Good for branch ducts"
    : fpm <= 900 ? "Good for supply trunk"
    : fpm <= 1000 ? "Upper limit for residential — expect some noise"
    : "Too fast for residential — noise and pressure loss; go one size up";

  return {
    rows: [
      { label: "Velocity", value: round(fpm), unit: "fpm", decimals: 0, primary: true, hint: guidance },
      { label: "Velocity (metric)", value: round(mps, 2), unit: "m/s", decimals: 2 },
      { label: "Duct area", value: round(areaFt2, 3), unit: "ft²", decimals: 3 },
      { label: "Friction rate (approx.)", value: round(Math.pow(cfm / (7.82 * Math.pow(diameterIn, 2.5)), 2), 3), unit: "in. w.c./100ft", decimals: 3, hint: "Inverted equal-friction fit." },
    ],
    notes: [
      "Velocity = CFM ÷ duct area. Residential design targets: branches 600 fpm, trunks 700–900 fpm, never above ~1000 fpm.",
      "High velocity = noise + wasted fan energy; low velocity = poor air mixing and larger duct cost.",
      "Return grilles are quieter at 500–600 fpm through the grille face area.",
    ],
  };
}

/** Cooling cost from SEER, runtime and electricity rate. */
export function coolingCost(input: CalcInput): CalcOutput {
  const { values } = input;
  const tons = values.tons;
  const seer = values.seer;
  const hoursDay = values.hoursDay;
  const daysMonth = values.daysMonth;
  const rate = values.rate;
  if (tons <= 0 || seer <= 0 || hoursDay < 0 || rate < 0) throw new Error("Invalid inputs");

  const kw = tons * 12 / seer;
  const kwhDay = kw * hoursDay;
  const kwhMonth = kwhDay * daysMonth;
  const costMonth = kwhMonth * rate;
  const costSeason = costMonth * 6;

  return {
    rows: [
      { label: "Power draw", value: round(kw, 2), unit: "kW", decimals: 2, hint: `kW = tons × 12 ÷ SEER.` },
      { label: "Energy per month", value: round(kwhMonth, 1), unit: "kWh", decimals: 1 },
      { label: "Cost per month", value: round(costMonth, 2), unit: "$", decimals: 2, primary: true },
      { label: "Cost per season (6 months)", value: round(costSeason, 2), unit: "$", decimals: 2, primary: true },
    ],
    notes: [
      "Model: kW = tons × 12 ÷ SEER (a 3-ton 16-SEER unit draws ≈ 2.25 kW at rating conditions).",
      "Actual draw varies with outdoor temperature; this is the rating-point average.",
      "Compare units: upgrading from SEER 13 to 18 saves ~28% of cooling energy at the same runtime.",
    ],
  };
}

/** Heat index (Rothfusz regression, NWS). */
export function heatIndex(input: CalcInput): CalcOutput {
  const { values } = input;
  const tempF = values.temp;
  const rh = Math.min(100, Math.max(2, values.rh));
  if (tempF < 60) throw new Error("Heat index applies above 60 °F — use wind chill below that");

  // NWS Rothfusz regression (degrees F)
  const t = tempF, h = rh;
  const hi =
    -42.379 + 2.04901523 * t + 10.14333127 * h - 0.22475541 * t * h - 0.00683783 * t * t
    - 0.05481717 * h * h + 0.00122874 * t * t * h + 0.00085282 * t * h * h
    - 0.00000199 * t * t * h * h;

  const adj =
    rh < 13 && t >= 80 && t <= 112 ? -((13 - rh) / 4) * Math.sqrt((17 - Math.abs(t - 95)) / 17)
    : rh > 85 && t >= 80 && t <= 87 ? ((rh - 85) / 10) * ((87 - t) / 5)
    : 0;
  const hiAdj = hi + adj;

  const risk =
    hiAdj < 80 ? "Little risk" : hiAdj < 90 ? "Caution — fatigue possible with prolonged exposure"
    : hiAdj < 103 ? "Extreme caution — heat cramps and exhaustion possible"
    : hiAdj < 125 ? "Danger — heat exhaustion likely; heat stroke possible"
    : "Extreme danger — heat stroke imminent";

  return {
    rows: [
      { label: "Heat index", value: round(hiAdj, 1), unit: "°F", decimals: 1, primary: true, hint: risk },
      { label: "Heat index", value: round((hiAdj - 32) / 1.8, 1), unit: "°C", decimals: 1, primary: true },
    ],
    notes: [
      "NWS Rothfusz regression with adjustments — the standard heat index used in US weather warnings.",
      "Applies in shade with light wind; full sun can add up to 15 °F.",
      "Employers (OSHA) use these thresholds for work/rest cycles in hot environments.",
    ],
  };
}

/** Wind chill (NWS formula). */
export function windChill(input: CalcInput): CalcOutput {
  const { values } = input;
  const tempF = values.temp;
  const mph = values.wind;
  if (tempF > 50) throw new Error("Wind chill applies at or below 50 °F");
  if (mph < 3) throw new Error("Wind chill requires wind above 3 mph");

  const wc =
    35.74 + 0.6215 * tempF - 35.75 * Math.pow(mph, 0.16) + 0.4275 * tempF * Math.pow(mph, 0.16);

  const frostbite =
    wc > -15 ? "Low risk" : wc >= -28 ? "10–30 min to frostbite on exposed skin"
    : wc >= -40 ? "5–10 min to frostbite"
    : "Under 5 min to frostbite";

  return {
    rows: [
      { label: "Wind chill", value: round(wc, 1), unit: "°F", decimals: 1, primary: true, hint: frostbite },
      { label: "Wind chill", value: round((wc - 32) / 1.8, 1), unit: "°C", decimals: 1, primary: true },
    ],
    notes: [
      "NWS wind chill formula (valid ≤ 50 °F and ≥ 3 mph).",
      "Wind chill affects people and animals, not machines or pipes — water freezes at 32 °F actual temperature regardless of wind.",
    ],
  };
}

/** Heating energy from degree-days, UA and fuel. */
export function degreeDayEnergy(input: CalcInput): CalcOutput {
  const { values } = input;
  const hdd = values.hdd; // base-65 °F degree-days for the period
  const ua = values.ua; // BTU/h·°F whole-house heat loss coefficient
  const eff = values.eff;
  const fuelCost = values.fuelCost;
  const fuelType = input.raw.fuel ?? "gas";
  if (hdd < 0 || ua <= 0) throw new Error("Invalid inputs");
  if (eff <= 0 || eff > 1) throw new Error("Efficiency must be between 0 and 1");

  // Season energy: UA × HDD (°F-days × BTU/h·°F = BTU). 24 h per day.
  const heatBtu = hdd * ua * 24;
  // Fuel units: therms (gas), kWh (electric), gallons (oil/propane)
  const contentPerUnit = fuelType === "gas" ? 100000 : fuelType === "electric" ? 3412 : fuelType === "oil" ? 138500 : 91333; // BTU per unit
  const units = heatBtu / (contentPerUnit * eff);
  const cost = units * fuelCost;

  return {
    rows: [
      { label: "Heat required", value: Math.round(heatBtu / 1000), unit: "kBTU", decimals: 0, hint: "UA × HDD × 24 h." },
      { label: `Fuel consumed (${fuelType})`, value: round(units, 1), unit: fuelType === "gas" ? "therms" : fuelType === "electric" ? "kWh" : "gal", decimals: 1, primary: true },
      { label: "Heating cost", value: round(cost, 2), unit: "$", decimals: 2, primary: true },
    ],
    notes: [
      "Model: Energy = UA × HDD × 24 ÷ (fuel content × efficiency) — the standard degree-day method.",
      "UA = whole-house heat-loss coefficient; estimate from the heating-load calculator (Load ÷ ΔT).",
      "HDD base 65 °F from local weather data; use the base that matches your thermostat habit for accuracy.",
    ],
  };
}

/** Sensible/latent heat and room airflow from BTU/h. */
export function sensibleHeat(input: CalcInput): CalcOutput {
  const { values } = input;
  const btuh = values.btuh;
  const cfm = values.cfm;
  const deltaT = values.deltaT;
  if (btuh < 0 || cfm < 0 || deltaT < 0) throw new Error("Invalid inputs");

  // Q = 1.08 × CFM × ΔT (sensible, standard air)
  const cfmNeeded = deltaT > 0 ? btuh / (1.08 * deltaT) : NaN;
  const btuhFromAirflow = cfm > 0 ? 1.08 * cfm * deltaT : NaN;
  const tons = btuh / 12000;

  return {
    rows: [
      { label: "Airflow needed for ΔT", value: Number.isFinite(cfmNeeded) ? round(cfmNeeded) : NaN, unit: "CFM", decimals: 0, primary: true, hint: `Q = 1.08 × CFM × ΔT with ΔT = ${round(deltaT, 1)} °F.` },
      { label: "Cooling delivered at entered airflow", value: Number.isFinite(btuhFromAirflow) ? round(btuhFromAirflow) : NaN, unit: "BTU/h", decimals: 0 },
      { label: "Equivalent tons", value: round(tons, 2), unit: "tons", decimals: 2 },
    ],
    notes: [
      "Sensible heat equation: Q (BTU/h) = 1.08 × CFM × ΔT (°F). The 1.08 factor is air density × specific heat at standard conditions.",
      "Metric equivalent: Q (kW) = 1.2 × m³/s × ΔT (°C).",
      "A typical residential system delivers ~350–450 CFM per ton of cooling.",
    ],
  };
}

/** Fan affinity laws: RPM/speed/power relationships. */
export function fanLaws(input: CalcInput): CalcOutput {
  const { values } = input;
  const cfm1 = values.cfm1;
  const rpm1 = values.rpm1;
  const power1 = values.power1;
  const rpm2 = values.rpm2;
  if (cfm1 <= 0 || rpm1 <= 0 || rpm2 <= 0) throw new Error("Invalid inputs");

  const ratio = rpm2 / rpm1;
  const cfm2 = cfm1 * ratio;
  const presRatio = ratio * ratio;
  const powerRatio = ratio * ratio * ratio;
  const power2 = power1 > 0 ? power1 * powerRatio : NaN;

  return {
    rows: [
      { label: "New airflow", value: round(cfm2, 1), unit: "CFM", decimals: 1, primary: true, hint: "CFM scales linearly with RPM." },
      { label: "New static pressure", value: round(presRatio, 3), unit: "×", decimals: 3, hint: "Pressure scales with RPM²." },
      ...(Number.isFinite(power2) ? [{ label: "New power", value: round(power2, 2), unit: "W", decimals: 2, primary: true, hint: "Power scales with RPM³ — 20% faster = 73% more power." }] : []),
    ],
    notes: [
      "Affinity laws: CFM ∝ RPM, Pressure ∝ RPM², Power ∝ RPM³ (same fan, fixed system).",
      "The cubic power law is why variable-speed fans save so much energy at part load.",
      "Duct system pressure follows the fan curve — verify the operating point lands inside the fan's table range.",
    ],
  };
}
