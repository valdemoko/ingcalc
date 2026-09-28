import type { VariableDef } from "@/lib/types";

export function FormulaCard({ formula, variables }: { formula: string[]; variables: VariableDef[] }) {
  return (
    <div className="formula-card">
      <div className="formula-card-heading">
        <span className="formula-label">Engineering model</span>
        <span>Formula &amp; notation</span>
      </div>
      <pre className="formula-block">{formula.join("\n")}</pre>
      {variables.length > 0 && (
        <dl className="formula-variables">
          {variables.map((variable, index) => (
            <div key={`${variable.symbol}-${index}`}>
              <dt><code>{variable.symbol}</code></dt>
              <dd>{variable.meaning}<span>{variable.unit}</span></dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
