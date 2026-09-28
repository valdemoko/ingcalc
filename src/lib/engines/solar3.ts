/**
 * Solar & energy engines — batch 3.
 * Pure functions. New calculators: daily energy consumption audit (appliance
 * table), inverter sizing from loads, DC/AC ratio & annual clipping estimate.
 */
import type { CalcOutput, CalcInput } from "@/lib/types";
import { round } from "@/lib/format";

/** Daily energy audit: watts × hours for five appliance groups, with battery translation. */
export function consumptionAudit(input: CalcInput): CalcOutput {
  const { values } = input;
  const groups = [
    { id: "lighting", label: "Lighting" },
    { id: "refrigeration", label: "Refrigeration" },
    { id: "electronics", label: "Electronics" },
    { id: "cooking", label: "Cooking" },
    { id: "other", label: "Other / pumps" },
  ];
  let totalWh = 0;
  for (const g of groups) {
    const w = values[`${g.id}W`];
    const h = values[`${g.id}H`];
    if (w < 0 || h < 0 || h > 24) throw new Error(`Invalid values for ${g.label}`);
    totalWh += w * h;
  }
  if (totalWh <= 0) throw new Error("Enter at least one load with hours");

  return {
    rows: [
      { label: "Daily consumption", value: round(totalWh / 1000, 2), unit: "kWh/day", decimals: 2, primary: true },
      { label: "Monthly", value: round((totalWh * 30.44) / 1000, 0), unit: "kWh", decimals: 0 },
      { label: "Battery capacity needed (12 V, 50% DoD, 1 day)", value: round((totalWh / 0.5) / 12, 0), unit: "Ah @ 12V", decimals: 0, hint: "Lead-acid sized at 50% DoD. Lithium at 80-90% DoD is smaller." },
      { label: "Solar array for year-round (4 PSH, 0.8 derate)", value: round(totalWh / (4 * 0.8), 0), unit: "Wp", decimals: 0, hint: "Add autonomy days in the off-grid calculator for the full design." },
    ],
    notes: [
      "Model: sum of watts × hours for each appliance group — the load-list method every off-grid design starts from.",
      "Be honest with hours: a fridge 'runs' 8-10 compressor-hours/day, not 24. TVs and chargers add up faster than people expect.",
      "This is the input to the off-grid system calculator, which adds autonomy days, DoD and worst-month sun.",
      "Measure rather than guess where possible: a $15 plug-in power meter beats any estimate for appliances you own.",
    ],
  };
}

/** Inverter sizing from continuous load, surge load and power factor. */
export function inverterSizing(input: CalcInput): CalcOutput {
  const { values } = input;
  const contW = values.continuousW;
  const surgeW = values.surgeW ?? 0;
  const pf = values.pf;
  if (contW <= 0) throw new Error("Continuous load must be positive");
  if (surgeW < 0) throw new Error("Surge cannot be negative");
  if (pf <= 0 || pf > 1) throw new Error("Power factor must be between 0 and 1");

  const withMargin = contW * 1.25;
  const vaNeeded = withMargin / pf;
  const surgeVa = surgeW / pf;
  const required = Math.max(vaNeeded, surgeVa);

  return {
    rows: [
      { label: "Minimum inverter rating", value: round(required, 0), unit: "VA", decimals: 0, primary: true, hint: `The larger of continuous × 1.25 ÷ PF and surge ÷ PF.` },
      { label: "Continuous with margin", value: round(withMargin, 0), unit: "W", decimals: 0 },
      { label: "Apparent power needed", value: round(vaNeeded, 0), unit: "VA", decimals: 0, hint: `At PF ${pf} — low PF loads need more VA than watts.` },
      ...(surgeW > 0 ? [{ label: "Surge requirement", value: round(surgeVa, 0), unit: "VA", decimals: 0, hint: "Motor starts can demand 2-3× running power for 1-2 seconds." }] : []),
    ],
    notes: [
      "Model: size = max(continuous W × 1.25, surge W) ÷ power factor. The 1.25 margin covers measurement error and small future loads.",
      "Pure sine wave output is the safe choice for electronics, induction motors and anything with a transformer — modified sine runs hotter and noisier.",
      "Check the surge rating (usually 2× continuous for 5 s): fridges, pumps and compressors all exceed their running draw at start.",
      "Inverters draw 5-30 W just being on — that idle consumption can dominate a small system's nightly budget; look for eco/search modes.",
    ],
  };
}

/** DC/AC ratio and estimated annual clipping loss. */
export function dcAcRatio(input: CalcInput): CalcOutput {
  const { values } = input;
  const dcKw = values.dcKw;
  const acKw = values.acKw;
  const psh = values.psh;
  if (dcKw <= 0 || acKw <= 0 || psh <= 0) throw new Error("Invalid inputs");

  const ratio = dcKw / acKw;
  // Clipping: production above AC rating is lost. Daily PV energy (kWh) vs AC kWh.
  // Rough estimate: fraction of days where peak production exceeds AC rating,
  // approximated by a normal distribution of daily irradiance around the mean.
  const dailyIdealKwh = dcKw * psh;
  // Peak fraction of ideal daily energy delivered in the peak hour ~ 15%.
  const peakHourKw = dailyIdealKwh * 0.15;
  const clipLossPct =
    peakHourKw > acKw ? Math.min(5, Math.pow((peakHourKw - acKw) / peakHourKw, 1.5) * 100) : 0;

  return {
    rows: [
      { label: "DC/AC ratio", value: round(ratio, 2), unit: ":1", decimals: 2, primary: true },
      { label: "Estimated annual clipping loss", value: round(clipLossPct, 2), unit: "%", decimals: 2, primary: true, hint: clipLossPct > 0 ? "Energy above the AC rating is lost at peak sun hours." : "No significant clipping expected." },
      { label: "Ideal daily production", value: round(dailyIdealKwh, 1), unit: "kWh", decimals: 1, hint: `DC × ${psh} PSH (before derate & clipping).` },
    ],
    notes: [
      "Model: ratio = DC Wp ÷ AC inverter rating. Clipping estimated from peak-hour production vs AC rating — a screening figure, not a simulation.",
      "Residential designs typically run 1.15-1.30 DC/AC: oversizing the array cheaply fills morning/evening production and keeps the inverter at its efficient operating point.",
      "Above ~1.4, clipping losses grow quickly in high-irradiance climates; cold clear winter days also spike array power.",
      "Verify the inverter's MAXIMUM DC input power too — many inverters cap DC oversizing independent of clipping math.",
    ],
  };
}
