/**
 * Technical SVG diagrams for key tools.
 * Each diagram is a pure visual aid that explains the concept — not decorative.
 * Only included for tools where a diagram genuinely adds value.
 */

import React from "react";

function ArrowMarker({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
      </marker>
    </defs>
  );
}

const diagrams: Record<string, () => React.ReactElement> = {
  "voltage-drop-calculator": () => (
    <svg viewBox="0 0 600 120" className="tool-diagram" aria-label="Voltage drop circuit diagram">
      <rect x="20" y="30" width="60" height="60" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="50" y="55" textAnchor="middle" className="diagram-label" fontSize="11">Vsource</text>
      <text x="50" y="72" textAnchor="middle" className="diagram-label" fontSize="10">120 V</text>
      <line x1="80" y1="50" x2="200" y2="50" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="140" y="42" textAnchor="middle" className="diagram-label" fontSize="9">L = 100 ft</text>
      <rect x="200" y="40" width="120" height="20" rx="3" fill="var(--blue-50)" stroke="var(--ink)" strokeWidth="1" />
      <text x="260" y="54" textAnchor="middle" className="diagram-label" fontSize="9">R (conductor)</text>
      <line x1="320" y1="50" x2="420" y2="50" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="420" y="30" width="60" height="60" rx="4" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
      <text x="450" y="55" textAnchor="middle" className="diagram-label" fontSize="11">Load</text>
      <text x="450" y="72" textAnchor="middle" className="diagram-label" fontSize="10">15 A</text>
      <line x1="420" y1="90" x2="320" y2="90" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4,3" />
      <line x1="200" y1="90" x2="80" y2="90" stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="4,3" />
      <text x="300" y="105" textAnchor="middle" className="diagram-label" fontSize="8" fill="var(--text-muted)">return path (doubled for single-phase)</text>
      <line x1="260" y1="25" x2="260" y2="15" stroke="var(--amber)" strokeWidth="1" />
      <text x="260" y="12" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">Vdrop = 2 x I x R x L</text>
    </svg>
  ),

  "duct-size-calculator": () => (
    <svg viewBox="0 0 600 140" className="tool-diagram" aria-label="Duct sizing diagram showing airflow path">
      <defs>
        <marker id="arr-duct" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
        </marker>
      </defs>
      <rect x="20" y="40" width="80" height="60" rx="4" fill="var(--blue-50)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="60" y="65" textAnchor="middle" className="diagram-label" fontSize="10">Air</text>
      <text x="60" y="78" textAnchor="middle" className="diagram-label" fontSize="10">Handler</text>
      <rect x="110" y="52" width="200" height="36" rx="3" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="210" y="74" textAnchor="middle" className="diagram-label" fontSize="9">Duct: round galvanized</text>
      <line x1="110" y1="30" x2="300" y2="30" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-duct)" />
      <text x="205" y="25" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">CFM airflow</text>
      <line x1="210" y1="88" x2="210" y2="110" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="180" y="110" width="60" height="20" rx="3" fill="none" stroke="var(--ink)" strokeWidth="1" />
      <text x="210" y="124" textAnchor="middle" className="diagram-label" fontSize="8">Outlet</text>
      <text x="430" y="65" textAnchor="middle" className="diagram-label" fontSize="9">Friction loss</text>
      <text x="430" y="78" textAnchor="middle" className="diagram-label" fontSize="9">per 100 ft</text>
      <text x="430" y="100" textAnchor="middle" className="diagram-label" fontSize="10" fill="var(--amber)">Diameter?</text>
    </svg>
  ),

  "off-grid-system-calculator": () => (
    <svg viewBox="0 0 600 160" className="tool-diagram" aria-label="Off-grid solar system diagram">
      <defs>
        <marker id="arr-offgrid" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
        </marker>
      </defs>
      <rect x="20" y="20" width="80" height="50" rx="4" fill="var(--blue-50)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="60" y="42" textAnchor="middle" className="diagram-label" fontSize="9">Solar</text>
      <text x="60" y="55" textAnchor="middle" className="diagram-label" fontSize="9">Panels</text>
      <line x1="100" y1="45" x2="160" y2="45" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-offgrid)" />
      <rect x="160" y="25" width="90" height="40" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="205" y="42" textAnchor="middle" className="diagram-label" fontSize="8">Charge</text>
      <text x="205" y="53" textAnchor="middle" className="diagram-label" fontSize="8">Controller</text>
      <line x1="250" y1="45" x2="310" y2="45" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-offgrid)" />
      <rect x="310" y="20" width="80" height="50" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="350" y="42" textAnchor="middle" className="diagram-label" fontSize="9">Battery</text>
      <text x="350" y="55" textAnchor="middle" className="diagram-label" fontSize="9">Bank</text>
      <line x1="390" y1="45" x2="440" y2="45" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-offgrid)" />
      <rect x="440" y="25" width="70" height="40" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="475" y="42" textAnchor="middle" className="diagram-label" fontSize="9">Inverter</text>
      <text x="475" y="53" textAnchor="middle" className="diagram-label" fontSize="8">DC to AC</text>
      <line x1="510" y1="45" x2="560" y2="45" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-offgrid)" />
      <rect x="560" y="25" width="30" height="40" rx="4" fill="var(--amber)" stroke="var(--ink)" strokeWidth="1" />
      <text x="575" y="48" textAnchor="middle" className="diagram-label" fontSize="8" fill="white">AC</text>
      <text x="60" y="90" textAnchor="middle" className="diagram-label" fontSize="8">Panel W x hours</text>
      <text x="205" y="90" textAnchor="middle" className="diagram-label" fontSize="8">MPPT or PWM</text>
      <text x="350" y="90" textAnchor="middle" className="diagram-label" fontSize="8">Capacity x DoD</text>
      <text x="475" y="90" textAnchor="middle" className="diagram-label" fontSize="8">Efficiency</text>
      <text x="300" y="120" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--text-muted)">Each stage applies a derating factor</text>
      <text x="300" y="140" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--text-muted)">Total system: panels - controller - battery - inverter - load</text>
    </svg>
  ),

  "gear-ratio-calculator": () => (
    <svg viewBox="0 0 600 130" className="tool-diagram" aria-label="Gear ratio diagram">
      <defs>
        <marker id="arr-gear" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
        </marker>
      </defs>
      <circle cx="120" cy="65" r="40" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="120" cy="65" r="4" fill="var(--amber)" />
      <text x="120" y="62" textAnchor="middle" className="diagram-label" fontSize="10">Driver</text>
      <text x="120" y="75" textAnchor="middle" className="diagram-label" fontSize="9">(teeth = Z1)</text>
      <line x1="160" y1="65" x2="210" y2="65" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-gear)" />
      <text x="185" y="58" textAnchor="middle" className="diagram-label" fontSize="9">mesh</text>
      <circle cx="300" cy="65" r="55" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <circle cx="300" cy="65" r="4" fill="var(--amber)" />
      <text x="300" y="55" textAnchor="middle" className="diagram-label" fontSize="10">Driven</text>
      <text x="300" y="68" textAnchor="middle" className="diagram-label" fontSize="9">(teeth = Z2)</text>
      <text x="120" y="120" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">w1 (input RPM)</text>
      <text x="300" y="120" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">w2 = w1 x Z1 / Z2</text>
      <text x="500" y="60" textAnchor="middle" className="diagram-label" fontSize="10">Ratio =</text>
      <text x="500" y="78" textAnchor="middle" className="diagram-label" fontSize="10">Z2 / Z1</text>
    </svg>
  ),

  "string-sizing-calculator": () => (
    <svg viewBox="0 0 600 130" className="tool-diagram" aria-label="Solar string sizing diagram">
      <defs>
        <marker id="arr-str" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
        </marker>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={30 + i * 70} y={30} width={55} height={40} rx={3} fill="var(--blue-50)" stroke="var(--ink)" strokeWidth={1} />
          <text x={57 + i * 70} y={55} textAnchor="middle" className="diagram-label" fontSize={8}>Panel</text>
          {i < 3 && <line x1={85 + i * 70} y1={50} x2={100 + i * 70} y2={50} stroke="var(--ink)" strokeWidth={1} />}
        </g>
      ))}
      <text x={170} y={25} textAnchor="middle" className="diagram-label" fontSize={9} fill="var(--amber)">Vstring = n x Voc</text>
      <rect x="340" y="30" width="80" height="40" rx="4" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="380" y="55" textAnchor="middle" className="diagram-label" fontSize="9">Inverter</text>
      <line x1="310" y1="50" x2="340" y2="50" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-str)" />
      <text x="380" y={90} textAnchor="middle" className="diagram-label" fontSize={8}>Vmax inverter input</text>
      <text x="380" y={105} textAnchor="middle" className="diagram-label" fontSize={8}>Vmin inverter MPPT range</text>
      <text x="520" y="50" textAnchor="middle" className="diagram-label" fontSize="8">Voc corrects</text>
      <text x="520" y="63" textAnchor="middle" className="diagram-label" fontSize="8">for temperature</text>
    </svg>
  ),

  "bolt-torque-calculator": () => (
    <svg viewBox="0 0 600 120" className="tool-diagram" aria-label="Bolt torque and preload diagram">
      <defs>
        <marker id="arr-bolt" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="var(--amber)" />
        </marker>
      </defs>
      <rect x="80" y="20" width="40" height="25" rx="3" fill="var(--blue-50)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="100" y="37" textAnchor="middle" className="diagram-label" fontSize="8">Head</text>
      <rect x="90" y="45" width="20" height="50" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
      <rect x="75" y="95" width="50" height="20" rx="3" fill="var(--blue-50)" stroke="var(--ink)" strokeWidth="1.5" />
      <text x="100" y="109" textAnchor="middle" className="diagram-label" fontSize="8">Nut</text>
      <rect x="130" y="40" width="60" height="12" fill="var(--ink)" opacity={0.15} />
      <rect x="130" y="55" width="60" height="12" fill="var(--ink)" opacity={0.1} />
      <text x="160" y="35" textAnchor="middle" className="diagram-label" fontSize="8">Joint</text>
      <path d="M 60,30 A 20,20 0 0,1 60,50" fill="none" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-bolt)" />
      <text x="35" y="45" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">T</text>
      <line x1="220" y1="60" x2="280" y2="60" stroke="var(--amber)" strokeWidth="1.5" markerEnd="url(#arr-bolt)" />
      <text x="250" y="52" textAnchor="middle" className="diagram-label" fontSize="9" fill="var(--amber)">Fpreload</text>
      <text x="430" y="45" textAnchor="middle" className="diagram-label" fontSize="10">T = K x F x d</text>
      <text x="430" y="65" textAnchor="middle" className="diagram-label" fontSize="9">K = nut factor (friction)</text>
      <text x="430" y="80" textAnchor="middle" className="diagram-label" fontSize="9">F = desired preload</text>
      <text x="430" y="95" textAnchor="middle" className="diagram-label" fontSize="9">d = nominal bolt diameter</text>
    </svg>
  ),
};

export function ToolDiagram({ slug }: { slug: string }) {
  const Diagram = diagrams[slug];
  if (!Diagram) return null;
  return (
    <figure className="tool-diagram-wrap">
      <Diagram />
      <figcaption className="sr-only">Technical diagram for this calculator</figcaption>
    </figure>
  );
}
