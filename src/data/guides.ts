import { TOOLS } from "@/data/tools";
import type { CategoryKey } from "@/lib/types";

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  /** Slugs of tools to link naturally within/after this section. */
  toolLinks?: string[];
}

export interface GuideDef {
  category: CategoryKey;
  title: string;
  description: string;
  summary: string;
  sections: GuideSection[];
  faqs?: { q: string; a: string }[];
}

export const GUIDES: GuideDef[] = [
  {
    category: "electrical",
    title: "Electrical Calculations Guide — Wire Sizing, Voltage Drop & Power Basics",
    description:
      "How electricians and engineers size circuits: conductor ampacity, voltage drop limits, power and current relationships, protection and derating. With the calculators for each step.",
    summary:
      "A practical walkthrough of residential and light-commercial circuit design: ampacity, voltage drop, overcurrent protection, transformers and energy cost — each step linked to the calculator that does the math.",
    sections: [
      {
        heading: "The four questions every circuit must answer",
        paragraphs: [
          "Designing an electrical circuit is answering four questions in order. First: how much current does the load draw, continuously? Second: what conductor carries that current without overheating? Third: does that conductor deliver acceptable voltage at the load end? Fourth: what overcurrent device protects the conductor? Each question has a calculator, and skipping one is how circuits end up non-compliant.",
          "The load current comes from the device nameplate or from power divided by voltage — the kVA-to-amps and motor current calculators handle both patterns. Continuous loads (running three hours or more) multiply by 1.25 before anything else happens; that single rule drives most of the sizing that follows.",
        ],
        toolLinks: ["kva-to-amps-calculator", "motor-current-calculator", "breaker-size-calculator"],
      },
      {
        heading: "Ampacity: the conductor's heat budget",
        paragraphs: [
          "A conductor's ampacity is the current it can carry without its insulation exceeding its temperature rating. The NEC table value assumes 30 °C ambient and three current-carrying conductors; real installations routinely violate both assumptions. Attics reach 50 °C, conduit fills hold a dozen conductors, and both corrections stack multiplicatively — a 10 AWG THHN circuit derated for a hot attic with nine conductors drops from 35 A to under 22 A effective ampacity.",
          "The wire size calculator walks the standard copper conductor series; the derating calculator applies the real-world corrections. Do both before trusting any ampacity figure.",
        ],
        toolLinks: ["wire-size-calculator", "wire-derating-calculator", "wire-resistance-calculator"],
      },
      {
        heading: "Voltage drop: the performance limit",
        paragraphs: [
          "Code ampacity keeps the conductor from burning; voltage drop keeps the load working. The NEC's informational guidance suggests 3% for branch circuits and 5% total. Exceed it and motors lose torque, lights dim, and electronics brown out — and the energy wasted as I²R heat in the cable is paid for every hour the circuit runs.",
          "Drop grows with length and current: doubling either doubles the drop. The voltage drop calculator computes it for single and three-phase circuits with NEC conductor data; the cable reactance calculator refines it for large conductors, where inductive reactance rivals resistance.",
        ],
        toolLinks: ["voltage-drop-calculator", "cable-reactance-calculator", "ohms-law-calculator"],
      },
      {
        heading: "Power, power factor and the kVA world",
        paragraphs: [
          "Real power (kW) does work; apparent power (kVA) is what wires and transformers must carry. The gap between them is reactive power, quantified by power factor. Motors at part load and heavily loaded transformers can pull power factor down to 0.7 — meaning 30% more current in every conductor than the useful power requires.",
          "Utilities penalize industrial customers below roughly 0.90 PF; the power factor correction calculator sizes the capacitor bank that fixes it. The three-phase power calculator shows the full power triangle for balanced loads.",
        ],
        toolLinks: ["power-factor-calculator", "three-phase-power-calculator", "transformer-sizing-calculator"],
      },
      {
        heading: "Energy: where electricity becomes money",
        paragraphs: [
          "Power is instantaneous; energy is power × time, and energy is what you buy. A 1,500 W heater running 4 hours consumes 6 kWh — at $0.15/kWh, 90 cents per evening, $328 per year. Multiplying small daily costs by 365 is how efficiency decisions get made rationally.",
          "The energy cost calculator handles appliances and fleets of devices; the EV charging and cooling cost calculators apply the same math to their domains.",
        ],
        toolLinks: ["energy-cost-calculator", "ev-charge-time-calculator", "cooling-cost-calculator"],
      },
    ],
    faqs: [
      {
        q: "What is the difference between kW and kVA?",
        a: "kW is real, usable power. kVA is what the conductors must carry — real and reactive current combined. At power factor 1.0 they're equal; at PF 0.8, a 10 kVA supply delivers only 8 kW of work.",
      },
      {
        q: "Should I size wire for ampacity or voltage drop?",
        a: "Both — whichever demands the larger conductor. Short, high-current circuits are ampacity-limited; long, modest-current circuits are drop-limited. Check both on every run.",
      },
      {
        q: "Is voltage drop a code requirement?",
        a: "The 3%/5% figures appear as informational notes, not enforceable sections — but equipment malfunction from excessive drop creates real liability, and some jurisdictions adopt them as mandatory.",
      },
    ],
  },
  {
    category: "hvac",
    title: "HVAC Design Guide — Load Estimation, Duct Sizing & Airflow Fundamentals",
    description:
      "How heating and cooling systems get sized correctly: load estimation, equipment selection, duct sizing and airflow verification. With the calculators for every step.",
    summary:
      "The practical sequence of HVAC design: estimate the load, pick equipment, size the ducts, verify airflow — each step with its calculator and the pitfalls that cause comfort complaints.",
    sections: [
      {
        heading: "Start with the load, not the equipment",
        paragraphs: [
          "Every good installation starts with the question: how many BTU/h does this space actually need? Rule-of-thumb estimates (the BTU calculator) work for a single room; whole houses deserve a Manual J calculation because oversizing is the most common HVAC defect. An oversized AC short-cycles — it cools the air quickly, shuts off before dehumidifying, and leaves the space cold and clammy while wearing the compressor.",
          "Heating loads follow a parallel logic with a different model: envelope heat loss equals area × U-factor × design temperature difference. The heating load calculator implements that screening model; for equipment selection, a room-by-room calculation is the standard.",
        ],
        toolLinks: ["btu-calculator", "heating-load-calculator", "degree-day-energy-calculator"],
      },
      {
        heading: "Ducts: the circulatory system",
        paragraphs: [
          "Airflow follows the path of least resistance, and duct design decides what resistance every branch sees. The equal-friction method sizes round ducts from airflow and a friction rate (0.08 in. w.c./100 ft is the residential default); the duct size calculator solves the same equation behind the classic ductulator.",
          "Velocity is the check that catches bad layouts: above roughly 1,000 fpm, noise complaints begin. The duct velocity calculator verifies an existing duct, and the sensible heat equation ties airflow to the equipment's capacity — the 1.08 × CFM × ΔT relation is the heartbeat of air-side diagnostics.",
        ],
        toolLinks: ["duct-size-calculator", "duct-velocity-calculator", "sensible-heat-calculator"],
      },
      {
        heading: "Ventilation and moisture",
        paragraphs: [
          "Fresh air is a load and a requirement: exhaust fans are sized by air changes per hour (bathrooms ~8 ACH, kitchens more), and whole-house ventilation runs continuously at a low rate. The airflow calculator converts between CFM and ACH for any room volume.",
          "Moisture is where comfort is won or lost. Dew point — not relative humidity — measures actual moisture content; the dew point calculator shows when conditions turn oppressive and surfaces will condense. Heat index and wind chill translate weather data into human stress for outdoor work planning.",
        ],
        toolLinks: ["airflow-cfm-calculator", "dew-point-calculator", "heat-index-calculator"],
      },
      {
        heading: "Efficiency, cost and the long run",
        paragraphs: [
          "SEER converts to real money through runtime and electricity rates: the AC running cost calculator makes the comparison between a 14 and 18 SEER unit concrete for your climate and rates. The same logic scales to whole-building energy through degree-day analysis — heating fuel consumption follows house heat-loss × degree-days, which is why air-sealing pays before any equipment change.",
          "Fan systems follow the affinity laws: power scales with the cube of speed, so variable-speed control saves enormous energy at part load. The fan laws calculator quantifies it.",
        ],
        toolLinks: ["cooling-cost-calculator", "degree-day-energy-calculator", "fan-laws-calculator", "seer-eer-converter"],
      },
    ],
    faqs: [
      {
        q: "Why is right-sizing HVAC so important?",
        a: "Oversized cooling short-cycles and fails to dehumidify (cold-clammy comfort, mold risk); oversized heating wastes fuel and creates temperature swings. Right-sized equipment runs longer cycles, controls humidity and lasts longer.",
      },
      {
        q: "What friction rate should ducts use?",
        a: "0.08 in. w.c./100 ft is the standard residential starting point. Low-noise designs use 0.06; short industrial runs tolerate more. The whole system should be designed at one rate so it balances.",
      },
      {
        q: "How many CFM per ton of cooling?",
        a: "350–450 CFM/ton: lower in humid climates (better dehumidification), higher in dry ones. Check it with the sensible heat equation against the equipment's measured temperature split.",
      },
    ],
  },
  {
    category: "mechanical",
    title: "Mechanical Design Guide — Power Transmission, Fasteners & Machine Elements",
    description:
      "Core mechanical engineering calculations explained: power transmission through gears, belts and chains; fastener torque; bearings, springs and fluid power. With linked calculators.",
    summary:
      "The calculations that hold machines together: torque and power transmission, fastener preload, bearings, springs, hydraulics and machining basics — each concept linked to its calculator.",
    sections: [
      {
        heading: "Speed, torque and power: the triangle",
        paragraphs: [
          "Mechanical power is torque × rotational speed, always. Gears, belts and chains trade speed for torque at roughly constant power (minus a few percent per mesh). A 3:1 reduction triples torque and cuts speed to a third — that's all a gearbox does, and everything from cordless drills to truck transmissions applies it.",
          "The gear ratio calculator works tooth counts; the pulley RPM calculator works diameters for belt drives; the torque-power calculator converts any combination into kW and hp. Speed ratios compose: two stages multiply.",
        ],
        toolLinks: ["gear-ratio-calculator", "pulley-rpm-calculator", "torque-power-calculator"],
      },
      {
        heading: "Fasteners: torque is a proxy for stretch",
        paragraphs: [
          "A bolted joint works because the bolt stretches and clamps. Torque is just the proxy we control: roughly 90% of tightening torque is consumed by friction, only 10% becomes preload. That's why lubrication changes everything — the same preload needs 25% less torque with oil on the threads.",
          "The bolt torque calculator computes the standard 75%-of-proof target for each ISO grade and size. When an extension or crowfoot sits in line with the handle, the effective lever changes and the wrench setting must be corrected — the torque wrench extension calculator prevents the classic over-torque failure.",
        ],
        toolLinks: ["bolt-torque-calculator", "torque-wrench-extension-calculator", "tap-drill-calculator"],
      },
      {
        heading: "Drivetrain elements: belts, chains, bearings",
        paragraphs: [
          "Belt and chain length geometry sets what you buy; sprocket and pulley diameters set speeds. The belt length and chain length calculators handle the classical wrap equations and recommend even link counts for chains (offset links are weak points).",
          "Bearings fail by fatigue, statistically: L10 life scales with (C/P)³ for ball bearings — halve the load, eight-fold the life. The bearing life calculator turns catalog ratings into hours at your duty point.",
        ],
        toolLinks: ["belt-length-calculator", "chain-length-calculator", "bearing-life-calculator", "gear-geometry-calculator"],
      },
      {
        heading: "Fluid power and structures",
        paragraphs: [
          "Hydraulics multiply force through pressure × area: a 63 mm bore at 160 bar produces 50 kN — five tons from a hand-sized cylinder. The hydraulic cylinder calculator shows extend vs retract (the rod steals area), and the pump power calculator sizes the motor behind the pressure.",
          "Mass matters for structure and shipping: the metal weight calculator handles bar, plate and tube in ten common alloys. Springs follow k = G·d⁴/(8·D³·n) — the fourth-power wire sensitivity is why wire size dominates spring design (spring rate calculator).",
        ],
        toolLinks: ["hydraulic-cylinder-calculator", "pump-power-calculator", "metal-weight-calculator", "spring-rate-calculator"],
      },
    ],
    faqs: [
      {
        q: "Why do most bolted joints fail?",
        a: "Under- or over-torque relative to the friction conditions, fatigue from insufficient preload, and vibration loosening. Proper lubrication discipline and calibrated tools address all three.",
      },
      {
        q: "Gear, belt or chain drive?",
        a: "Gears for precision and compactness; belts for quiet, cheap, overload-tolerant transmission; chains for high torque at moderate speed without slip. Each calculator notes its domain's limits.",
      },
      {
        q: "What is L10 bearing life?",
        a: "The life that 90% of identical bearings exceed under identical load. It's a statistical rating — design targets are typically 30,000+ hours industrial, more for continuous duty.",
      },
    ],
  },
  {
    category: "solar-energy",
    title: "Solar Design Guide — Off-Grid Systems, String Sizing & Economics",
    description:
      "How solar systems get designed: load analysis, panel sizing, battery banks, string voltage limits and payback economics. With the calculators for each decision.",
    summary:
      "The complete solar design sequence: measure the load, size panels and batteries, verify string voltages, choose the controller, and check the economics — each step linked to its calculator.",
    sections: [
      {
        heading: "Everything starts with the load",
        paragraphs: [
          "Solar design is load-first: every watt-hour the system must deliver daily cascades into panel, battery and inverter sizes. List each load, its watts and hours, and sum — the honest number, not the optimistic one. A small cabin lives on 1.5–3 kWh/day; a full off-grid house typically needs 8–15 kWh/day plus generator backup for winter.",
          "The off-grid system calculator takes that daily figure and produces the battery bank and array sizes with every assumption (DoD, autonomy, derate) explicit. The panel count calculator answers the narrower question: how many panels for a kWh target.",
        ],
        toolLinks: ["off-grid-system-calculator", "panel-count-calculator", "battery-bank-calculator"],
      },
      {
        heading: "Batteries: usable energy, not rated energy",
        paragraphs: [
          "Battery ratings mislead until depth of discharge is applied: a 100 Ah AGM battery at 50% DoD delivers 50 Ah; the same size lithium at 90% delivers 90 — and survives 3–5× more cycles. The runtime calculator shows what a given load actually extracts; the charge time calculator shows how long replenishing takes at a given charger current.",
          "The C-rate is the guardrail: lead-acid prefers ≤ 0.2C, lithium tolerates 0.5–1C. Charging too fast causes gassing (flooded lead-acid) or lithium plating (cold Li-ion) — permanent damage.",
        ],
        toolLinks: ["battery-runtime-calculator", "battery-charge-time-calculator", "battery-bank-calculator"],
      },
      {
        heading: "String voltage: the silent killer",
        paragraphs: [
          "Panels rated at 25 °C produce higher voltage when cold — about 0.29% per °C for silicon. A string that measures 400 V at noon can hit 450 V at dawn on a −10 °C day; if the inverter's maximum is 500 V, the margin is thinner than it looks. Exceeding it destroys the inverter, usually instantly and out of warranty.",
          "The string sizing calculator applies the temperature correction against the inverter's absolute maximum and MPPT window. It's the one solar check with catastrophic consequences for getting it wrong.",
        ],
        toolLinks: ["string-sizing-calculator", "charge-controller-calculator", "solar-panel-output-calculator"],
      },
      {
        heading: "Economics: production times price",
        paragraphs: [
          "Production is geometry and weather: array watts × peak sun hours × derate. Economics multiply that by tariffs: self-consumed energy displaces the retail rate (valuable), exports earn the feed-in rate (often a fraction of it). The savings calculator runs the full payback math with honest caveats — degradation, inverter replacement and rate changes excluded.",
          "Tilt is the last refinement: latitude is the annual optimum, ±15° biases winter or summer. The tilt calculator gives the angles and azimuth for your hemisphere. Within ±10° of optimum the yield penalty is only a few percent — orientation and shading matter more.",
        ],
        toolLinks: ["solar-savings-calculator", "solar-tilt-calculator", "solar-panel-output-calculator"],
      },
    ],
    faqs: [
      {
        q: "What derate factor should I use for solar?",
        a: "0.75–0.85 for well-installed fixed systems: inverter ~96%, wiring ~2%, soiling ~3%, temperature ~4–8%. Dusty sites or poor ventilation push it lower — PVWatts' default 0.86 is optimistic for real rooftops.",
      },
      {
        q: "Lithium or lead-acid for off-grid?",
        a: "Lithium (LiFePO4) wins on cycle life (3,000–5,000+ vs 500–1,200), usable capacity (80–90% vs 50% DoD) and weight — the premium pays back within the first battery replacement cycle for most usage patterns.",
      },
      {
        q: "How many days of autonomy do I need?",
        a: "2–3 days suits most climates. Critical loads in cloudy regions justify 4–5; sunny climates with a generator backup can use 1–2.",
      },
    ],
  },
];

export function getGuide(category: CategoryKey) {
  return GUIDES.find((g) => g.category === category);
}
