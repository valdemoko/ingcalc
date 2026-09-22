"use client";

import { useMemo, useState } from "react";
import type { CalcInput, CalcOutput, FieldDef } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { ResultChart } from "@/components/tools/ResultChart";

interface Props {
  inputs: FieldDef[];
  calc: (input: CalcInput) => CalcOutput;
  toolName: string;
}

/**
 * Generic calculator form driven entirely by the tool definition.
 * Number values are converted to canonical SI via the selected unit's factor.
 * Select fields pass through as strings on input.raw.
 */
export function CalculatorForm({ inputs, calc, toolName }: Props) {
  // units[fieldId] tracks the currently selected unit value.
  const [units, setUnits] = useState<Record<string, string>>(() =>
    Object.fromEntries(inputs.map((f) => [f.id, f.defaultUnit ?? f.unitOptions?.[0]?.value ?? ""])),
  );
  const [raw, setRaw] = useState<Record<string, string>>(() =>
    Object.fromEntries(inputs.map((f) => [f.id, f.kind === "select" ? (f.defaultOption ?? f.options?.[0]?.value ?? "") : f.defaultValue !== undefined ? String(f.defaultValue) : ""])),
  );
  const [submitted, setSubmitted] = useState<CalcInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalcOutput | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values: Record<string, number> = {};
    const rawOut: Record<string, string> = {};
    let validationError: string | null = null;

    for (const f of inputs) {
      // Hidden conditional fields are excluded from the calculation entirely.
      if (f.showIf && !f.showIf(raw)) continue;
      const val = (raw[f.id] ?? "").trim();
      if (f.kind === "select") {
        rawOut[f.id] = val;
        continue;
      }
      if (val === "") {
        // blank is allowed only for optional fields (solver unknowns)
        if (!f.optional) {
          validationError = `Please enter a value for "${f.label}".`;
          break;
        }
        continue;
      }
      const num = Number(val.replace(",", "."));
      if (!Number.isFinite(num)) {
        validationError = `"${f.label}" must be a number.`;
        break;
      }
      const unit = units[f.id] ? f.unitOptions?.find((u) => u.value === units[f.id]) : undefined;
      const canonical = num * (unit?.factor ?? 1);
      if (f.min !== undefined && canonical < f.min) {
        validationError = `"${f.label}" must be at least ${f.min}${f.unit ? ` ${f.unit}` : ""}.`;
        break;
      }
      if (f.max !== undefined && canonical > f.max) {
        validationError = `"${f.label}" must be at most ${f.max}${f.unit ? ` ${f.unit}` : ""}.`;
        break;
      }
      values[f.id] = canonical;
    }

    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    const input: CalcInput = { values, raw: rawOut };
    try {
      const output = calc(input);
      setError(null);
      setResult(output);
      setSubmitted(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed — check your inputs.");
      setResult(null);
    }
  };

  const reset = () => {
    setRaw(Object.fromEntries(inputs.map((f) => [f.id, f.kind === "select" ? (f.defaultOption ?? "") : f.defaultValue !== undefined ? String(f.defaultValue) : ""])));
    setResult(null);
    setError(null);
    setSubmitted(null);
  };

  /** Fields currently visible: a field with showIf is shown only when its condition holds. */
  const visibleInputs = useMemo(
    () => inputs.filter((f) => !f.showIf || f.showIf(raw)),
    [inputs, raw],
  );

  const fieldId = (id: string) => `f-${id}`;

  return (
    <div className="calc-card">
      <form onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="sr-only">{toolName} inputs</legend>
          {visibleInputs.map((f) => (
            <div className="field" key={f.id}>
              <label htmlFor={fieldId(f.id)}>
                {f.label}
                {f.unit && f.kind === "number" && !f.unitOptions ? ` (${f.unit})` : ""}
              </label>
              <div className="field-row">
                {f.kind === "select" ? (
                  <select
                    id={fieldId(f.id)}
                    value={raw[f.id] ?? ""}
                    onChange={(e) => setRaw({ ...raw, [f.id]: e.target.value })}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <input
                      id={fieldId(f.id)}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={raw[f.id] ?? ""}
                      onChange={(e) => setRaw({ ...raw, [f.id]: e.target.value })}
                      aria-describedby={f.help ? `${fieldId(f.id)}-help` : undefined}
                    />
                    {f.unitOptions && (
                      <select
                        className="unit-select"
                        aria-label={`Unit for ${f.label}`}
                        value={units[f.id] ?? ""}
                        onChange={(e) => setUnits({ ...units, [f.id]: e.target.value })}
                      >
                        {f.unitOptions.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>
              {f.help && (
                <p className="help" id={`${fieldId(f.id)}-help`}>
                  {f.help}
                </p>
              )}
            </div>
          ))}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn">
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={reset}>
              Reset
            </button>
          </div>
        </fieldset>
      </form>

      {error && (
        <p className="error-msg" role="alert">
          {error}
        </p>
      )}

      {result && submitted && (
        <section className="results" aria-live="polite">
          <h2>Results</h2>
          <table className="results-table">
            <caption className="sr-only">Calculation results</caption>
            <thead>
              <tr>
                <th scope="col">Quantity</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className={row.primary ? "primary" : undefined}>
                  <td>
                    {row.label}
                    {row.hint && <span className="hint">{row.hint}</span>}
                  </td>
                  <td className="num">
                    {formatValue(row.value, row.decimals)} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.chart && <ResultChart spec={result.chart} />}
          {result.notes && result.notes.length > 0 && (
            <div className="results-notes">
              <strong>Notes:</strong>
              <ul>
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
