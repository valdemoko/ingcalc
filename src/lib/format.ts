/** Number formatting shared by all engines and result tables. */

/** Round to `n` decimal places without float drift surprises. */
export function round(n: number, decimals = 2): number {
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/**
 * Format a value for display: fixed decimals when specified,
 * otherwise 4 significant figures with thousands separators.
 */
export function formatValue(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return "—";
  if (decimals !== undefined) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 0.0001 || abs >= 10_000_000)) {
    return value.toExponential(3);
  }
  const figs = 4;
  const rounded = Number(value.toPrecision(figs));
  const integerDigits = Math.max(1, Math.floor(Math.log10(Math.abs(rounded) || 1)) + 1);
  const frac = Math.max(0, figs - integerDigits);
  return rounded.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: frac,
  });
}

export function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}
