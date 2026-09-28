import type { ReactNode } from "react";

type DiagramProps = { values: Record<string, string> };
type Diagram = (props: DiagramProps) => ReactNode;

function Text({ x, y, children, anchor = "middle" }: { x: number; y: number; children: ReactNode; anchor?: "start" | "middle" | "end" }) {
  return <text x={x} y={y} textAnchor={anchor} className="diagram-label">{children}</text>;
}

const diagrams: Record<string, Diagram> = {
  "voltage-drop-calculator": ({ values }) => (
    <svg viewBox="0 0 600 150" role="img" aria-label={`Circuit from ${values.voltage || "source"} V supply through ${values.wire || "selected"} conductor to a ${values.current || "load"} A load`}>
      <rect x="20" y="42" width="86" height="54" rx="3" className="diagram-node" />
      <Text x={63} y={64}>Source</Text><Text x={63} y={82}>{values.voltage || "—"} V</Text>
      <line x1="106" y1="55" x2="493" y2="55" className="diagram-wire" />
      <line x1="493" y1="84" x2="106" y2="84" className="diagram-return" />
      <rect x="233" y="39" width="134" height="32" rx="3" className="diagram-conductor" />
      <Text x={300} y={59}>{values.wire || "Conductor"} · {values.material || "copper"}</Text>
      <Text x={300} y={105}>Run {values.length || "—"} {values.lengthUnit || "ft"} · return path shown</Text>
      <rect x="493" y="42" width="86" height="54" rx="3" className="diagram-load" />
      <Text x={536} y={64}>Load</Text><Text x={536} y={82}>{values.current || "—"} A</Text>
      <Text x={300} y={137}>Supply → conductor resistance → load</Text>
    </svg>
  ),
  "duct-size-calculator": ({ values }) => (
    <svg viewBox="0 0 600 150" role="img" aria-label={`Airflow duct diagram for ${values.cfm || "selected"} CFM and ${values.friction || "selected"} inches water column friction`}>
      <rect x="28" y="46" width="102" height="62" rx="3" className="diagram-node" />
      <Text x={79} y={73}>Air handler</Text><Text x={79} y={91}>{values.cfm || "—"} CFM</Text>
      <line x1="130" y1="77" x2="482" y2="77" className="diagram-flow" />
      <rect x="195" y="51" width="230" height="52" rx="5" className="diagram-conductor" />
      <Text x={310} y={73}>Round duct diameter</Text><Text x={310} y={91}>{values.friction || "—"} in. w.c. / 100 ft</Text>
      <path d="M 310 108 L 310 131" className="diagram-dimension" />
      <Text x={310} y={146}>Equal-friction sizing</Text>
      <rect x="482" y="54" width="88" height="46" rx="3" className="diagram-load" /><Text x={526} y={82}>Outlet</Text>
    </svg>
  ),
  "off-grid-system-calculator": ({ values }) => (
    <svg viewBox="0 0 600 150" role="img" aria-label="Off-grid solar energy path through array, battery and inverter to the load">
      {[
        { x: 18, title: "PV array", value: `${values.dailyWh || "—"} Wh/day` },
        { x: 165, title: "Charge", value: `${values.psh || "—"} peak sun h` },
        { x: 312, title: "Battery", value: `${values.autonomyDays || "—"} day autonomy` },
        { x: 459, title: "Inverter", value: `${values.systemV || "—"} V DC` },
      ].map((node, index) => (
        <g key={node.title}>
          <rect x={node.x} y="43" width="122" height="56" rx="3" className={index === 2 ? "diagram-load" : "diagram-node"} />
          <Text x={node.x + 61} y={67}>{node.title}</Text><Text x={node.x + 61} y={85}>{node.value}</Text>
          {index < 3 && <path d={`M ${node.x + 122} 71 h 20`} className="diagram-flow" />}
        </g>
      ))}
      <Text x={300} y={130}>Energy path · losses and autonomy are included in the sizing model</Text>
    </svg>
  ),
  "gear-ratio-calculator": ({ values }) => {
    const driver = Number(values.driverTeeth) || 20;
    const driven = Number(values.drivenTeeth) || 40;
    const scale = Math.min(0.72, 112 / Math.max(driver, driven));
    return (
      <svg viewBox="0 0 600 160" role="img" aria-label={`Gear pair: ${driver} driver teeth to ${driven} driven teeth`}>
        <circle cx="174" cy="77" r={Math.max(22, driver * scale)} className="diagram-gear" />
        <circle cx="174" cy="77" r="4" className="diagram-center" />
        <circle cx="390" cy="77" r={Math.max(24, driven * scale)} className="diagram-gear driven" />
        <circle cx="390" cy="77" r="4" className="diagram-center" />
        <Text x={174} y={72}>Driver</Text><Text x={174} y={91}>{values.driverTeeth || "—"} teeth</Text>
        <Text x={390} y={72}>Driven</Text><Text x={390} y={91}>{values.drivenTeeth || "—"} teeth</Text>
        <Text x={174} y={145}>{values.inputRpm || "—"} input RPM</Text>
        <Text x={390} y={145}>Ratio = driven / driver</Text>
        <path d="M 230 77 H 309" className="diagram-flow" />
      </svg>
    );
  },
  "concrete-calculator": ({ values }) => (
    <svg viewBox="0 0 600 170" role="img" aria-label={`Concrete shape dimensions: length ${values.length || values.diameter || "—"}, width ${values.width || "—"}, thickness ${values.thickness || values.height || "—"}`}>
      <path d="M 170 53 L 407 53 L 463 86 L 226 86 Z M 170 53 V 106 L 226 139 V 86 M 226 139 L 463 106 V 86" className="diagram-shape" />
      <path d="M 170 42 H 407 M 170 36 V 48 M 407 36 V 48" className="diagram-dimension" />
      <Text x={288} y={31}>Length · {values.length || values.diameter || "—"} {values.lengthUnit || values.diameterUnit || "ft"}</Text>
      <path d="M 424 48 L 480 80 M 419 53 L 429 43 M 475 85 L 485 75" className="diagram-dimension" />
      <Text x={477} y={46} anchor="start">Width · {values.width || "—"} {values.widthUnit || "ft"}</Text>
      <path d="M 151 54 V 107 M 145 54 H 157 M 145 107 H 157" className="diagram-dimension" />
      <Text x={138} y={83} anchor="end">Depth · {values.thickness || values.height || "—"} {values.thicknessUnit || values.heightUnit || "ft"}</Text>
      <Text x={315} y={162}>Illustrative geometry · dimensions shown in selected units</Text>
    </svg>
  ),
  "cantilever-beam-calculator": ({ values }) => (
    <svg viewBox="0 0 600 170" role="img" aria-label={`Cantilever beam with ${values.load || "selected"} N end load and ${values.length || "selected"} m span`}>
      <path d="M 105 57 H 450 V 96 H 105 Z" className="diagram-beam" />
      <path d="M 92 45 V 108 M 82 51 L 102 61 M 82 67 L 102 77 M 82 83 L 102 93 M 82 99 L 92 104" className="diagram-support" />
      <path d="M 450 28 V 54 M 442 44 L 450 54 L 458 44" className="diagram-dimension" />
      <Text x={450} y={20}>P = {values.load || "—"} N</Text>
      <path d="M 105 127 H 450 M 105 121 V 133 M 450 121 V 133" className="diagram-dimension" />
      <Text x={277} y={148}>L = {values.length || "—"} {values.lengthUnit || "m"} · cantilever span</Text>
    </svg>
  ),
  "string-sizing-calculator": ({ values }) => (
    <svg viewBox="0 0 600 145" role="img" aria-label={`Series solar string with module open circuit voltage ${values.voc || "selected"} volts`}>
      {Array.from({ length: 4 }, (_, index) => (
        <g key={index}>
          <rect x={42 + index * 94} y="39" width="72" height="53" rx="3" className="diagram-node" />
          <Text x={78 + index * 94} y={62}>PV module</Text><Text x={78 + index * 94} y={79}>Voc {values.voc || "—"} V</Text>
          {index < 3 && <path d={`M ${114 + index * 94} 65 h 22`} className="diagram-wire" />}
        </g>
      ))}
      <Text x={300} y={119}>Series voltage adds · cold correction sets maximum Voc</Text>
    </svg>
  ),
  "bolt-torque-calculator": ({ values }) => (
    <svg viewBox="0 0 600 150" role="img" aria-label={`Fastener torque model for ${values.diameter || "selected"} millimeter bolt diameter`}>
      <rect x="89" y="34" width="70" height="28" rx="3" className="diagram-node" />
      <path d="M 112 62 V 118 M 136 62 V 118 M 101 76 H 148 M 101 91 H 148 M 101 106 H 148" className="diagram-fastener" />
      <path d="M 82 118 H 166 L 154 136 H 94 Z" className="diagram-load" />
      <path d="M 183 47 C 211 25 239 40 238 63" className="diagram-dimension" />
      <Text x={210} y={37}>Torque T</Text>
      <Text x={397} y={60}>T = K · F · d</Text>
      <Text x={397} y={84}>d = {values.diameter || "—"} mm</Text>
      <Text x={397} y={107}>K reflects friction · F is preload</Text>
      <Text x={300} y={145}>Torque estimates preload; use the joint specification for approval</Text>
    </svg>
  ),
};

export function ToolDiagram({ slug, values = {} }: { slug: string; values?: Record<string, string> }) {
  const DiagramView = diagrams[slug];
  if (!DiagramView) return null;
  return (
    <figure className="tool-diagram-wrap input-diagram">
      <figcaption className="diagram-heading"><span>System sketch</span><span>Updates from current inputs</span></figcaption>
      <DiagramView values={values} />
    </figure>
  );
}
