"use client";

import type { ChartSpec } from "@/lib/types";

/**
 * Dynamic SVG line chart rendered from engine-computed data (ChartSpec).
 * No new CSS: uses existing classes/variables only (tool-diagram-wrap,
 * diagram-label, inline SVG presentation attributes).
 *
 * It re-renders on every new CalcOutput, so the plot always matches the
 * calculation that produced it — never decorative.
 */
export function ResultChart({ spec }: { spec: ChartSpec }) {
  const W = 560;
  const H = 240;
  const M = { top: 20, right: 20, bottom: 44, left: 64 };

  // Domain from data (padded 5%), including the reference line if present.
  const allY = spec.series.flatMap((s) => s.points.map((p) => p.y));
  if (spec.refLine) allY.push(spec.refLine.y);
  const allX = spec.series.flatMap((s) => s.points.map((p) => p.x));
  let yMin = Math.min(...allY);
  let yMax = Math.max(...allY);
  let xMin = Math.min(...allX);
  let xMax = Math.max(...allX);
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin === yMax) {
    yMin = 0;
    yMax = Math.max(1, yMax);
  }
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax) || xMin === xMax) {
    xMin = 0;
    xMax = Math.max(1, xMax);
  }
  const yPad = (yMax - yMin) * 0.05 || 1;
  yMin -= yPad;
  yMax += yPad;
  const xPad = (xMax - xMin) * 0.05 || 1;
  xMin -= xPad;
  xMax += xPad;

  const sx = (x: number) => M.left + ((x - xMin) / (xMax - xMin)) * (W - M.left - M.right);
  const sy = (y: number) => H - M.bottom - ((y - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);

  // 4 gridlines, rounded to readable steps.
  const yTicks = Array.from({ length: 4 }, (_, i) => yMin + ((yMax - yMin) * (i + 1)) / 5);
  const xTicks = Array.from({ length: 4 }, (_, i) => xMin + ((xMax - xMin) * (i + 1)) / 5);

  const fmt = (n: number) =>
    Math.abs(n) >= 1000 || (Math.abs(n) < 0.01 && n !== 0)
      ? n.toExponential(1)
      : Number(n.toPrecision(4)).toString();

  return (
    <figure className="tool-diagram-wrap" style={{ marginTop: "var(--s4)" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="tool-diagram"
        role="img"
        aria-label={spec.title}
      >
        {/* gridlines + tick labels */}
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line
              x1={M.left}
              y1={sy(t)}
              x2={W - M.right}
              y2={sy(t)}
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text x={M.left - 6} y={sy(t) + 4} textAnchor="end" className="diagram-label" fontSize="10">
              {fmt(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <line
              x1={sx(t)}
              y1={H - M.bottom}
              x2={sx(t)}
              y2={M.top}
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <text x={sx(t)} y={H - M.bottom + 16} textAnchor="middle" className="diagram-label" fontSize="10">
              {fmt(t)}
            </text>
          </g>
        ))}

        {/* axes */}
        <line x1={M.left} y1={M.top} x2={M.left} y2={H - M.bottom} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={M.left} y1={H - M.bottom} x2={W - M.right} y2={H - M.bottom} stroke="var(--ink)" strokeWidth="1.5" />

        {/* reference line */}
        {spec.refLine && (
          <g>
            <line
              x1={M.left}
              y1={sy(spec.refLine.y)}
              x2={W - M.right}
              y2={sy(spec.refLine.y)}
              stroke={spec.refLine.color}
              strokeWidth="1.5"
              strokeDasharray="6,4"
            />
            <text
              x={W - M.right - 4}
              y={sy(spec.refLine.y) - 5}
              textAnchor="end"
              className="diagram-label"
              fontSize="10"
              fill={spec.refLine.color}
            >
              {spec.refLine.label}
            </text>
          </g>
        )}

        {/* data series */}
        {spec.series.map((s, i) => (
          <polyline
            key={i}
            points={s.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
          />
        ))}

        {/* axis titles */}
        <text x={(W + M.left) / 2} y={H - 6} textAnchor="middle" className="diagram-label" fontSize="11">
          {spec.xLabel}
        </text>
        <text
          x={16}
          y={(H - M.bottom + M.top) / 2}
          textAnchor="middle"
          className="diagram-label"
          fontSize="11"
          transform={`rotate(-90 16 ${(H - M.bottom + M.top) / 2})`}
        >
          {spec.yLabel}
        </text>
      </svg>
      <figcaption className="sr-only">{spec.title}</figcaption>
    </figure>
  );
}
