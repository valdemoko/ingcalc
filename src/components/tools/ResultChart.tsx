"use client";

import type { ChartSpec } from "@/lib/types";

/** Engine-computed chart, rendered as compact responsive SVG without a charting dependency. */
export function ResultChart({ spec }: { spec: ChartSpec }) {
  const width = 560;
  const height = 260;
  const margin = { top: 28, right: 20, bottom: 50, left: 68 };
  const allPoints = spec.series.flatMap((series) => series.points);
  if (!allPoints.length || allPoints.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) return null;
  const allY = allPoints.map((point) => point.y);
  if (spec.refLine && Number.isFinite(spec.refLine.y)) allY.push(spec.refLine.y);
  const allX = allPoints.map((point) => point.x);
  if (!allX.length || !allY.length) return null;

  let yMin = Math.min(...allY);
  let yMax = Math.max(...allY);
  let xMin = Math.min(...allX);
  let xMax = Math.max(...allX);
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) return null;
  if (yMin === yMax) { yMin -= 0.5; yMax += 0.5; }
  if (xMin === xMax) { xMin -= 0.5; xMax += 0.5; }
  const yPadding = (yMax - yMin) * 0.06;
  const xPadding = (xMax - xMin) * 0.04;
  yMin -= yPadding;
  yMax += yPadding;
  xMin -= xPadding;
  xMax += xPadding;

  const x = (value: number) => margin.left + ((value - xMin) / (xMax - xMin)) * (width - margin.left - margin.right);
  const y = (value: number) => height - margin.bottom - ((value - yMin) / (yMax - yMin)) * (height - margin.top - margin.bottom);
  const fmt = (value: number) => Math.abs(value) >= 1000 || (Math.abs(value) < 0.01 && value !== 0)
    ? value.toExponential(1)
    : Number(value.toPrecision(4)).toString();
  const yTicks = Array.from({ length: 4 }, (_, index) => yMin + ((yMax - yMin) * (index + 1)) / 5);
  const xTicks = Array.from({ length: 4 }, (_, index) => xMin + ((xMax - xMin) * (index + 1)) / 5);
  const alternative = spec.series.map((series) => {
    const first = series.points[0];
    const last = series.points[series.points.length - 1];
    return `${series.label}: ${fmt(first?.y ?? 0)} to ${fmt(last?.y ?? 0)} ${spec.yLabel} over ${fmt(first?.x ?? 0)} to ${fmt(last?.x ?? 0)} ${spec.xLabel}`;
  }).join(". ");

  return (
    <figure className="tool-chart" aria-labelledby="chart-title">
      <figcaption className="chart-title"><span id="chart-title">{spec.title}</span><span className="chart-units">{spec.xLabel} · {spec.yLabel}</span></figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="tool-chart-svg" role="img" aria-label={spec.title} aria-describedby="chart-description">
        <desc id="chart-description">{alternative}{spec.refLine ? `. Reference: ${spec.refLine.label}.` : ""}</desc>
        {yTicks.map((tick, index) => (
          <g key={`y-${index}`}>
            <line x1={margin.left} y1={y(tick)} x2={width - margin.right} y2={y(tick)} className="chart-gridline" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="chart-tick">{fmt(tick)}</text>
          </g>
        ))}
        {xTicks.map((tick, index) => (
          <g key={`x-${index}`}>
            <line x1={x(tick)} y1={margin.top} x2={x(tick)} y2={height - margin.bottom} className="chart-gridline vertical" />
            <text x={x(tick)} y={height - margin.bottom + 17} textAnchor="middle" className="chart-tick">{fmt(tick)}</text>
          </g>
        ))}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="chart-axis" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="chart-axis" />
        {spec.refLine && (
          <g>
            <line x1={margin.left} y1={y(spec.refLine.y)} x2={width - margin.right} y2={y(spec.refLine.y)} stroke={spec.refLine.color} className="chart-reference" />
            <text x={width - margin.right - 4} y={y(spec.refLine.y) - 6} textAnchor="end" className="chart-reference-label">{spec.refLine.label}</text>
          </g>
        )}
        {spec.series.map((series, index) => (
          <g key={series.label}>
            <polyline points={series.points.map((point) => `${x(point.x)},${y(point.y)}`).join(" ")} fill="none" stroke={series.color} className="chart-series" />
            {series.points.length === 1 && <circle cx={x(series.points[0].x)} cy={y(series.points[0].y)} r="4" fill={series.color} />}
          </g>
        ))}
        <text x={(width + margin.left) / 2} y={height - 8} textAnchor="middle" className="chart-axis-label">{spec.xLabel}</text>
        <text x={16} y={(height + margin.top - margin.bottom) / 2} textAnchor="middle" className="chart-axis-label" transform={`rotate(-90 16 ${(height + margin.top - margin.bottom) / 2})`}>{spec.yLabel}</text>
      </svg>
      <ul className="chart-legend" aria-label="Chart series">
        {spec.series.map((series) => <li key={series.label}><span style={{ backgroundColor: series.color }} />{series.label}</li>)}
        {spec.refLine && <li><span className="legend-dash" style={{ borderColor: spec.refLine.color }} />{spec.refLine.label}</li>}
      </ul>
      <p className="chart-text-alternative">Text summary: {alternative}{spec.refLine ? ` Reference line: ${spec.refLine.label}.` : ""}</p>
    </figure>
  );
}
