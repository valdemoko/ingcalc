"use client";

import { useMemo, useState } from "react";
import type { CalcInput, CalcOutput, FieldDef } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { ResultChart } from "@/components/tools/ResultChart";
import { ToolDiagram } from "@/components/tools/ToolDiagram";

interface Props {
  inputs: FieldDef[];
  calc: (input: CalcInput) => CalcOutput;
  toolName: string;
  toolSlug: string;
}

function parseInput(fields: FieldDef[], raw: Record<string, string>, units: Record<string, string>) {
  const values: Record<string, number> = {};
  const rawOut: Record<string, string> = {};

  for (const field of fields) {
    if (field.showIf && !field.showIf(raw)) continue;
    const value = (raw[field.id] ?? "").trim();
    if (field.kind === "select") {
      rawOut[field.id] = value;
      continue;
    }
    if (value === "") {
      if (!field.optional) return { error: `Please enter a value for "${field.label}".` };
      continue;
    }
    const number = Number(value.replace(",", "."));
    if (!Number.isFinite(number)) return { error: `"${field.label}" must be a number.` };
    const unit = units[field.id]
      ? field.unitOptions?.find((option) => option.value === units[field.id])
      : undefined;
    const canonical = number * (unit?.factor ?? 1);
    if (field.min !== undefined && canonical < field.min) {
      return { error: `"${field.label}" must be at least ${field.min}${field.unit ? ` ${field.unit}` : ""}.` };
    }
    if (field.max !== undefined && canonical > field.max) {
      return { error: `"${field.label}" must be at most ${field.max}${field.unit ? ` ${field.unit}` : ""}.` };
    }
    values[field.id] = canonical;
  }
  return { input: { values, raw: rawOut } as CalcInput };
}

/** Registry-driven UI; engine outputs remain authoritative for every result and chart. */
export function CalculatorForm({ inputs, calc, toolName, toolSlug }: Props) {
  const [units, setUnits] = useState<Record<string, string>>(() =>
    Object.fromEntries(inputs.map((field) => [field.id, field.defaultUnit ?? field.unitOptions?.[0]?.value ?? ""])),
  );
  const [raw, setRaw] = useState<Record<string, string>>(() =>
    Object.fromEntries(inputs.map((field) => [
      field.id,
      field.kind === "select"
        ? (field.defaultOption ?? field.options?.[0]?.value ?? "")
        : field.defaultValue !== undefined
          ? String(field.defaultValue)
          : "",
    ])),
  );
  const [submitted, setSubmitted] = useState<CalcInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalcOutput | null>(null);

  const runCalculation = (nextRaw: Record<string, string>, nextUnits: Record<string, string>, showError = true) => {
    const parsed = parseInput(inputs, nextRaw, nextUnits);
    if (!parsed.input) {
      setError(showError ? parsed.error ?? "Check the values and try again." : null);
      setResult(null);
      setSubmitted(null);
      return;
    }
    try {
      const output = calc(parsed.input);
      setError(null);
      setResult(output);
      setSubmitted(parsed.input);
    } catch (cause) {
      setError(showError ? cause instanceof Error ? cause.message : "Calculation failed — check your inputs." : null);
      setResult(null);
      setSubmitted(null);
    }
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    runCalculation(raw, units);
  };

  const changeRaw = (id: string, value: string) => {
    const nextRaw = { ...raw, [id]: value };
    setRaw(nextRaw);
    if (submitted) runCalculation(nextRaw, units, false);
    else if (error) setError(null);
  };

  const changeUnit = (id: string, value: string) => {
    const nextUnits = { ...units, [id]: value };
    setUnits(nextUnits);
    if (submitted) runCalculation(raw, nextUnits, false);
    else if (error) setError(null);
  };

  const reset = () => {
    setRaw(Object.fromEntries(inputs.map((field) => [
      field.id,
      field.kind === "select"
        ? (field.defaultOption ?? field.options?.[0]?.value ?? "")
        : field.defaultValue !== undefined
          ? String(field.defaultValue)
          : "",
    ])));
    setResult(null);
    setError(null);
    setSubmitted(null);
  };

  const visibleInputs = useMemo(() => inputs.filter((field) => !field.showIf || field.showIf(raw)), [inputs, raw]);
  const diagramValues = useMemo(() => {
    const values = { ...raw };
    for (const field of inputs) {
      if (field.unitOptions?.length) {
        values[`${field.id}Unit`] = field.unitOptions.find((option) => option.value === units[field.id])?.label ?? "";
      }
    }
    return values;
  }, [inputs, raw, units]);
  const fieldId = (id: string) => `f-${id}`;
  const primary = result?.rows.find((row) => row.primary);

  return (
    <section className="calc-card" aria-label={`${toolName} workspace`}>
      <div className="calc-card-head">
        <span className="calc-card-label">Engineering calculator</span>
        <span className="calc-card-name">{toolName}</span>
      </div>
      <form onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="sr-only">{toolName} inputs</legend>
          <div className="calc-fields">
            {visibleInputs.map((field) => {
              const errorId = `${fieldId(field.id)}-error`;
              const helpId = `${fieldId(field.id)}-help`;
              const descriptions = [error ? errorId : null, field.help ? helpId : null].filter(Boolean).join(" ") || undefined;
              const unitFactor = field.unitOptions?.find((option) => option.value === units[field.id])?.factor ?? 1;
              const min = field.min === undefined ? undefined : field.min / unitFactor;
              const max = field.max === undefined ? undefined : field.max / unitFactor;

              return (
                <div className="field" key={field.id}>
                  <label htmlFor={fieldId(field.id)}>
                    {field.label}
                    {field.unit && field.kind === "number" && !field.unitOptions ? ` (${field.unit})` : ""}
                  </label>
                  <div className="field-row">
                    {field.kind === "select" ? (
                      <select id={fieldId(field.id)} value={raw[field.id] ?? ""} onChange={(event) => changeRaw(field.id, event.target.value)}>
                        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>
                    ) : (
                      <>
                        <input
                          id={fieldId(field.id)}
                          type="number"
                          inputMode="decimal"
                          step={field.step ?? "any"}
                          min={min}
                          max={max}
                          value={raw[field.id] ?? ""}
                          onChange={(event) => changeRaw(field.id, event.target.value)}
                          aria-describedby={descriptions}
                          aria-invalid={Boolean(error)}
                        />
                        {field.unitOptions && (
                          <select className="unit-select" aria-label={`Unit for ${field.label}`} value={units[field.id] ?? ""} onChange={(event) => changeUnit(field.id, event.target.value)}>
                            {field.unitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                  {error && <p className="sr-only" id={errorId}>{error}</p>}
                  {field.help && <p className="help" id={helpId}>{field.help}</p>}
                </div>
              );
            })}
          </div>
          <div className="calc-actions">
            <button type="submit" className="btn">Calculate</button>
            <button type="button" className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
        </fieldset>
      </form>

      <ToolDiagram slug={toolSlug} values={diagramValues} />
      {error && <p className="error-msg" role="alert">{error}</p>}

      {result && submitted && (
        <section className="results" aria-live="polite" aria-atomic="false">
          <div className="results-head">
            <h2>Calculated result</h2>
            <span className="result-status">Updated with current inputs</span>
          </div>
          {primary && (
            <div className="result-hero" key={`${primary.label}-${primary.value}-${primary.unit}`}>
              <span className="result-hero-label">Primary result · {primary.label}</span>
              <span className="result-hero-value">{formatValue(primary.value, primary.decimals)}</span>
              {primary.unit && <span className="result-hero-unit">{primary.unit}</span>}
              {primary.hint && <span className="result-hero-hint">{primary.hint}</span>}
            </div>
          )}
          <table className="results-table">
            <caption className="sr-only">Calculation results for {toolName}</caption>
            <thead><tr><th scope="col">Quantity</th><th scope="col" className="value-heading">Value</th></tr></thead>
            <tbody>
              {result.rows.map((row, index) => (
                <tr key={`${row.label}-${index}`} className={row.primary ? "primary" : undefined}>
                  <td>{row.label}{row.hint && <span className="hint">{row.hint}</span>}</td>
                  <td className="num">{formatValue(row.value, row.decimals)}{row.unit && <span className="result-unit"> {row.unit}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.chart && <ResultChart spec={result.chart} />}
          {result.notes && result.notes.length > 0 && (
            <div className="results-notes">
              <strong>Engineering notes</strong>
              <ul>{result.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
