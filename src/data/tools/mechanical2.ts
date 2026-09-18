import type { ToolDefinition } from "@/lib/types";
import {
  pulleyRpm,
  hydraulicCylinder,
  gearGeometry,
  metalWeight,
  engineDisplacement,
  compressionRatio,
  springRate,
  torqueWrenchExtension,
  pumpPower,
  chainLength,
  bearingLife,
} from "@/lib/engines/mechanical2";

export const MECHANICAL2_TOOLS: ToolDefinition[] = [
  {
    slug: "pulley-rpm-calculator",
    category: "mechanical",
    name: "Pulley RPM Calculator",
    title: "Pulley RPM Calculator — Belt Drive Speeds | IngCalc",
    description:
      "Calculate driven pulley RPM from diameters and driver speed, with belt speed check. For V-belt and flat-belt drives using pitch diameters.",
    summary:
      "Enter both pulley diameters and the driver speed to get the driven RPM and belt surface speed — with the V-belt speed limits flagged.",
    keywords: ["pulley rpm calculator", "belt drive speed", "pulley speed ratio", "v-belt rpm"],
    inputs: [
      { id: "dDriver", label: "Driver pulley pitch diameter", kind: "number", unit: "mm", defaultValue: 80, min: 10, step: 1 },
      { id: "dDriven", label: "Driven pulley pitch diameter", kind: "number", unit: "mm", defaultValue: 200, min: 10, step: 1 },
      { id: "rpmDriver", label: "Driver speed", kind: "number", unit: "RPM", defaultValue: 1750, min: 1, step: 10 },
    ],
    calc: pulleyRpm,
    formula: ["n₂ = n₁ × d₁ / d₂", "v = π × d₁ × n₁ / 60 (belt speed)"],
    variables: [
      { symbol: "n₁, n₂", meaning: "Driver / driven speed", unit: "RPM" },
      { symbol: "d₁, d₂", meaning: "Driver / driven pitch diameter", unit: "mm" },
      { symbol: "v", meaning: "Belt surface speed", unit: "m/s" },
    ],
    howItWorks: [
      "Belt speed is common to both pulleys, so speed inversely tracks diameter: the smaller pulley spins faster.",
      "Pitch diameters (not outer diameters) set the true speed ratio for V-belts.",
      "Belt surface speed is checked against the practical V-belt ceiling of 25–30 m/s.",
    ],
    example:
      "A 1750 RPM motor on an 80 mm pulley driving a 200 mm pulley: driven = 1750 × 80/200 = 700 RPM. Belt speed = π × 0.08 × 1750/60 = 7.3 m/s — comfortable. The same ratio with a 50 mm driver at 3450 RPM runs 9.0 m/s, still fine.",
    interpretation:
      "This is the sizing tool for machine spindles, fans and pumps: pick pulley sizes to land the driven speed where the load wants it, then check belt speed and minimum pulley diameter for the belt section. Small pulleys below the belt's minimum diameter bend the cords excessively and fail early.",
    assumptions: [
      "No belt slip or creep (V-belts slip 1–2% in practice).",
      "Both pulleys in the same plane, open drive.",
    ],
    limitations: [
      "Timing belts use tooth counts, not diameters (see the gear ratio calculator for the same math).",
      "Does not size the belt section or power capacity.",
    ],
    faqs: [
      {
        q: "How do I slow down a motor with pulleys?",
        a: "Put the small pulley on the motor and a larger one on the load: a 2:1 diameter ratio quarters nothing — it halves speed. Two-stage reductions multiply.",
      },
      {
        q: "Why is my driven speed slightly off?",
        a: "V-belt creep (1–2%) and pitch diameter approximations. For exact speeds, use timing belts or gears.",
      },
    ],
    references: [
      { label: "Machinery's Handbook — belt drive speed calculations", url: "https://www.industrialpress.com/machinerys-handbook" },
    ],
    related: ["belt-length-calculator", "gear-ratio-calculator", "torque-power-calculator", "chain-length-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "hydraulic-cylinder-calculator",
    category: "mechanical",
    name: "Hydraulic Cylinder Calculator",
    title: "Hydraulic Cylinder Force Calculator — Extend & Retract | IngCalc",
    description:
      "Calculate hydraulic cylinder force from bore, rod and pressure, for both extend and retract strokes. kN and lbf, with the annulus area explained.",
    summary:
      "Enter bore, rod diameter and system pressure to get extend and retract forces — the rod side is weaker, and this shows exactly by how much.",
    keywords: ["hydraulic cylinder calculator", "cylinder force calculator", "hydraulic pressure force", "piston force"],
    inputs: [
      { id: "bore", label: "Bore diameter", kind: "number", unit: "mm", defaultValue: 63, min: 5, step: 1 },
      { id: "rod", label: "Rod diameter", kind: "number", unit: "mm", defaultValue: 28, min: 0, step: 1 },
      { id: "pressure", label: "System pressure", kind: "number", defaultValue: 160, min: 1, step: 5,
        unitOptions: [{ value: "bar", label: "bar", factor: 0.1 }, { value: "psi", label: "psi (×0.006895)", factor: 0.006895 }],
        defaultUnit: "bar",
        help: "The pressure unit is MPa internally: bar ÷ 10, psi × 0.006895." },
    ],
    calc: hydraulicCylinder,
    formula: ["F_extend = P × π/4 × D_bore²", "F_retract = P × π/4 × (D_bore² − D_rod²)"],
    variables: [
      { symbol: "F", meaning: "Force", unit: "N" },
      { symbol: "P", meaning: "Hydraulic pressure", unit: "MPa" },
      { symbol: "A", meaning: "Effective piston area", unit: "m²" },
    ],
    howItWorks: [
      "Force is pressure times area. Extending uses the full bore area; retracting uses the annulus (bore minus rod).",
      "The retract figure shows the force penalty of the rod — typically 30–50% less than extend at the same pressure.",
    ],
    example:
      "A 63 mm bore, 28 mm rod at 160 bar: extend area = 31.2 cm² → 49.9 kN. Retract area = 25.0 cm² → 40.0 kN — 20% less on the return stroke, which matters when the cylinder pulls a load back.",
    interpretation:
      "The extend/retract asymmetry is a design lever: rodless cylinders push and pull equally; big rods trade retract force for buckling stiffness. Real output is 5–10% below calculated (seals, line losses), and long strokes in compression need rod buckling checks before force checks.",
    assumptions: [
      "Standard double-acting cylinder with round rod.",
      "Neglects seal friction and back-pressure on the exhaust side.",
    ],
    limitations: [
      "Regenerative circuits (rod and cap sides connected) behave differently.",
      "Telescopic and plunger cylinders have distinct areas.",
    ],
    faqs: [
      {
        q: "How much force does a 4-inch cylinder make at 2000 psi?",
        a: "F = 2000 × π × 2² = 25,133 lbf ≈ 12.5 tons extending. Retracting with a 2-inch rod: 18,850 lbf.",
      },
      {
        q: "Why is retract force lower?",
        a: "The rod occupies area on the retract side, so the same pressure acts on less piston area — the annulus.",
      },
    ],
    references: [
      { label: "ISO 6020-2 — hydraulic cylinder mounting dimensions", url: "https://www.iso.org/standard/19488.html" },
    ],
    related: ["pump-power-calculator", "torque-power-calculator", "bolt-torque-calculator", "bearing-life-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "gear-geometry-calculator",
    category: "mechanical",
    name: "Gear Geometry Calculator",
    title: "Gear Geometry Calculator — Module, Pitch & Diameters | IngCalc",
    description:
      "Calculate spur gear geometry from module and tooth count: pitch, outside and root diameters, circular pitch and tooth depth. ISO module system.",
    summary:
      "Enter module and teeth to get the full set of spur gear dimensions — pitch, outside and root diameters, circular pitch and tooth depth.",
    keywords: ["gear geometry calculator", "gear module calculator", "gear pitch diameter", "spur gear dimensions"],
    inputs: [
      { id: "module", label: "Module", kind: "number", unit: "mm", defaultValue: 2, min: 0.3, max: 25, step: 0.25, help: "Standard modules: 1, 1.25, 1.5, 2, 2.5, 3, 4, 5..." },
      { id: "teeth", label: "Number of teeth", kind: "number", unit: "z", defaultValue: 24, min: 6, max: 300, step: 1 },
    ],
    calc: gearGeometry,
    formula: ["d = m × z", "da = d + 2m", "df = d − 2.5m", "p = π × m"],
    variables: [
      { symbol: "m", meaning: "Module", unit: "mm" },
      { symbol: "z", meaning: "Number of teeth", unit: "—" },
      { symbol: "d", meaning: "Pitch diameter", unit: "mm" },
      { symbol: "da, df", meaning: "Addendum (outside) / dedendum (root) circle", unit: "mm" },
    ],
    howItWorks: [
      "The module is the pitch diameter per tooth — it defines the tooth size. Two gears mesh iff they share it.",
      "Pitch diameter is module × teeth; outside adds two addendums (2m), root subtracts 2.5m for standard full-depth teeth.",
      "Circular pitch is the arc spacing between teeth, and whole depth is 2.25m.",
    ],
    example:
      "A module-2, 24-tooth gear: pitch 48 mm, outside 52 mm, root 43 mm, circular pitch 6.28 mm, depth 4.5 mm. Meshing it with a 36-tooth gear needs a center distance of (24+36) × 2/2 = 60 mm.",
    interpretation:
      "The module system makes gears interchangeable: same module means any tooth counts mesh at center distance (z₁+z₂)m/2. Bigger module = stronger teeth but coarser action. For repair work, measuring the outside diameter and counting teeth recovers the module — that's the standard first step in identifying an unknown gear.",
    assumptions: [
      "ISO full-depth involute teeth, 20° pressure angle, no profile shift.",
      "Standard addendum (1m) and dedendum (1.25m).",
    ],
    limitations: [
      "Profile-shifted (corrected) gears change outside and root diameters.",
      "Stub teeth (with 1.8× module depth) and helical gears differ.",
      "US DP (diametral pitch) system: module = 25.4/DP.",
    ],
    faqs: [
      {
        q: "How do I identify an unknown gear's module?",
        a: "Count teeth, measure the outside diameter, then m = (OD − 2×addendum)/z ≈ OD/(z+2). Verify with the circular pitch against mating gears.",
      },
      {
        q: "What module should I use?",
        a: "Match the mating gear exactly — module defines meshing. For new designs, choose from standard series based on torque: bigger loads need bigger modules.",
      },
    ],
    references: [
      { label: "ISO 54 / ISO 6336 — gear modules and load capacity", url: "https://www.iso.org/standard/62336.html" },
    ],
    related: ["gear-ratio-calculator", "chain-length-calculator", "pulley-rpm-calculator", "torque-power-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "metal-weight-calculator",
    category: "mechanical",
    name: "Metal Weight Calculator",
    title: "Metal Weight Calculator — Bar, Plate, Tube | IngCalc",
    description:
      "Calculate the weight of steel, aluminum, stainless, brass and other metals in round bar, square bar, plate and tube shapes. kg and lb.",
    summary:
      "Pick a shape and material, enter dimensions, get the weight in kg and lb — with nominal densities and mill-tolerance guidance.",
    keywords: ["metal weight calculator", "steel weight calculator", "bar weight", "plate weight calculator"],
    inputs: [
      {
        id: "shape", label: "Shape", kind: "select",
        options: [
          { value: "round", label: "Round bar" },
          { value: "square_bar", label: "Square bar" },
          { value: "plate", label: "Plate / sheet" },
          { value: "tube", label: "Round tube / pipe" },
        ],
        defaultOption: "round",
      },
      {
        id: "material", label: "Material", kind: "select",
        options: [
          { value: "steel", label: "Mild steel (7.85)" },
          { value: "stainless", label: "Stainless 304 (7.9)" },
          { value: "aluminum", label: "Aluminum (2.70)" },
          { value: "brass", label: "Brass (8.5)" },
          { value: "copper", label: "Copper (8.96)" },
          { value: "cast_iron", label: "Cast iron (7.2)" },
          { value: "titanium", label: "Titanium (4.51)" },
          { value: "lead", label: "Lead (11.34)" },
        ],
        defaultOption: "steel",
      },
      { id: "diameter", label: "Diameter (round bar)", kind: "number", unit: "mm", defaultValue: 20, min: 0, step: 1, optional: true },
      { id: "side", label: "Side (square bar)", kind: "number", unit: "mm", defaultValue: 20, min: 0, step: 1, optional: true },
      { id: "width", label: "Width (plate)", kind: "number", unit: "mm", defaultValue: 100, min: 0, step: 1, optional: true },
      { id: "height", label: "Length/height (plate)", kind: "number", unit: "mm", defaultValue: 500, min: 0, step: 1, optional: true },
      { id: "thickness", label: "Thickness (plate)", kind: "number", unit: "mm", defaultValue: 6, min: 0, step: 0.5, optional: true },
      { id: "od", label: "Outer diameter (tube)", kind: "number", unit: "mm", defaultValue: 48, min: 0, step: 1, optional: true },
      { id: "wall", label: "Wall thickness (tube)", kind: "number", unit: "mm", defaultValue: 3, min: 0, step: 0.5, optional: true },
      { id: "length", label: "Length", kind: "number", unit: "mm", defaultValue: 1000, min: 0, step: 10 },
    ],
    calc: metalWeight,
    formula: ["Weight = Volume × density", "Round: V = π/4 × d² × L ... Tube: V = π/4 × (OD² − ID²) × L"],
    variables: [
      { symbol: "ρ", meaning: "Material density", unit: "g/cm³" },
      { symbol: "V", meaning: "Volume of the shape", unit: "cm³" },
    ],
    howItWorks: [
      "Volume comes from the standard geometry for each shape; weight is volume × nominal density.",
      "Densities are typical alloy values at room temperature (steel 7.85 g/cm³, aluminum 2.70, etc.).",
    ],
    example:
      "A 20 mm × 1 m round steel bar: V = π/4 × 4 cm² × 100 cm = 314 cm³ → 2.47 kg (5.44 lb). A 48 × 3 mm tube of the same length: 1.06 m of stock weighs 3.36 kg — tubes trade weight for stiffness efficiently.",
    interpretation:
      "Weight drives shipping, structural load and material cost. Order 2% extra for mill tolerance and offcuts. The kg/m figures are also how steel is priced — knowing a 20 mm bar is 2.47 kg/m lets you sanity-check quotes instantly.",
    assumptions: [
      "Nominal densities; specific alloys vary ±1–2%.",
      "Prism shapes with uniform cross-section.",
    ],
    limitations: [
      "Exotic alloys, castings with draft, and machined parts need measured volumes.",
      "Temperature expansion affects weight only trivially.",
    ],
    faqs: [
      {
        q: "How much does a steel plate weigh per m²?",
        a: "Multiply thickness in mm by 7.85: a 6 mm plate is 47.1 kg/m². The rule: kg/m² = 7.85 × t(mm).",
      },
      {
        q: "Why is aluminum so much lighter?",
        a: "Density 2.70 vs steel's 7.85 — about a third. But aluminum's stiffness is also a third, so equal-stiffness parts save less weight than density suggests.",
      },
    ],
    references: [
      { label: "ASM Metals Handbook — density of metals and alloys", url: "https://dl.asminternational.org/handbooks" },
    ],
    related: ["chain-length-calculator", "bearing-life-calculator", "bolt-torque-calculator", "hydraulic-cylinder-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "engine-displacement-calculator",
    category: "mechanical",
    name: "Engine Displacement Calculator",
    title: "Engine Displacement Calculator — Bore, Stroke & CC | IngCalc",
    description:
      "Calculate engine displacement in cc, liters and cubic inches from bore, stroke and cylinder count. Per-cylinder volume included.",
    summary:
      "Enter bore, stroke and cylinders to get total displacement in cc, liters and CID — plus each cylinder's swept volume.",
    keywords: ["engine displacement calculator", "cc calculator", "cubic inch displacement", "engine size calculation"],
    inputs: [
      { id: "bore", label: "Bore", kind: "number", unit: "mm", defaultValue: 86, min: 10, step: 0.5 },
      { id: "stroke", label: "Stroke", kind: "number", unit: "mm", defaultValue: 86, min: 10, step: 0.5 },
      { id: "cylinders", label: "Cylinders", kind: "number", unit: "×", defaultValue: 4, min: 1, max: 16, step: 1 },
    ],
    calc: engineDisplacement,
    formula: ["V = π/4 × bore² × stroke × cylinders"],
    variables: [
      { symbol: "V", meaning: "Swept displacement", unit: "cc" },
      { symbol: "bore", meaning: "Cylinder bore", unit: "mm" },
      { symbol: "stroke", meaning: "Piston stroke", unit: "mm" },
    ],
    howItWorks: [
      "Each cylinder sweeps a cylinder of bore × stroke; π/4 × d² × h gives its volume.",
      "Multiply by cylinder count for total displacement; the tool converts to liters and cubic inches.",
    ],
    example:
      "The classic 86 × 86 mm four-cylinder: π/4 × 8.6² × 8.6 = 499.7 cc per cylinder → 1,999 cc ≈ 2.0 L, 122 CID. Bore it 0.5 mm over: 2,022 cc — the tuner's 'stroker' math in reverse.",
    interpretation:
      "Displacement sets the air an engine can theoretically ingest per cycle — power scales with it, airflow, and volumetric efficiency. The bore/stroke ratio shapes the character: oversquare engines rev higher (short stroke, big valves fit), undersquare make low-end torque. Oversizing bore without flow work buys compression but not power.",
    assumptions: [
      "Cylindrical combustion space swept by the piston (chamber volume excluded — see the compression ratio calculator).",
      "Nominal bore and stroke at room temperature.",
    ],
    limitations: [
      "Wankel engines use a different volume convention (chamber × 2 typically cited).",
      "Does not include gasket/deck clearance volume.",
    ],
    faqs: [
      {
        q: "How do I convert cc to cubic inches?",
        a: "Multiply cc by 0.061 (or divide by 16.387). A 350 CID Chevy is 5,735 cc = 5.7 L; a 2.0 L engine is 122 CID.",
      },
      {
        q: "Does displacement equal power?",
        a: "No — it sets the ceiling. Volumetric efficiency, breathing, compression and RPM decide how much of that ceiling the engine reaches. A 2.0 L turbo can outperform a 3.0 L NA engine.",
      },
    ],
    references: [
      { label: "SAE J604 — engine terminology and definitions", url: "https://www.sae.org/standards/" },
    ],
    related: ["compression-ratio-calculator", "torque-power-calculator", "pulley-rpm-calculator", "gear-ratio-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "compression-ratio-calculator",
    category: "mechanical",
    name: "Compression Ratio Calculator",
    title: "Compression Ratio Calculator — Static CR | IngCalc",
    description:
      "Calculate static compression ratio from swept volume, chamber volume, gasket volume and piston dome/dish. Essential engine building math.",
    summary:
      "Enter swept volume and all clearance volumes (chamber, gasket, piston) to get the true static compression ratio — the number that decides fuel tolerance.",
    keywords: ["compression ratio calculator", "static compression ratio", "engine cr calculator", "chamber volume"],
    inputs: [
      { id: "sweptCc", label: "Swept volume (per cylinder)", kind: "number", unit: "cc", defaultValue: 500, min: 10, step: 5 },
      { id: "chamberCc", label: "Combustion chamber volume", kind: "number", unit: "cc", defaultValue: 55, min: 0, step: 1 },
      { id: "gasketCc", label: "Head gasket volume", kind: "number", unit: "cc", defaultValue: 6, min: 0, step: 0.5, optional: true },
      { id: "pistonCc", label: "Piston dome(+)/dish(−) volume", kind: "number", unit: "cc", defaultValue: -4, min: -30, max: 30, step: 1, optional: true },
    ],
    calc: compressionRatio,
    formula: ["CR = (V_swept + V_clearance) / V_clearance", "V_clearance = chamber + gasket + piston"],
    variables: [
      { symbol: "CR", meaning: "Static compression ratio", unit: ":1" },
      { symbol: "V_clearance", meaning: "All volume above the piston at TDC", unit: "cc" },
    ],
    howItWorks: [
      "CR is total cylinder volume at BDC divided by volume at TDC — the clearance volume collects chamber, gasket and piston features.",
      "Dome pistons subtract volume (they intrude into the chamber); dish pistons add it.",
      "The result is static CR — dynamic CR (after intake closes) is always lower.",
    ],
    example:
      "500 cc swept, 55 cc chamber, 6 cc gasket, 4 cc dome (−4): clearance = 55 + 6 − 4 = 57 cc → CR = 557/57 = 9.77:1. Mill the head to a 48 cc chamber: 510/50 = 10.2:1 — how machine work tunes CR.",
    interpretation:
      "Static CR drives knock tendency: pump gas tops out around 10.5–11:1 static in iron engines, a bit higher with aluminum chambers and good quench. Every 1 point of CR is worth roughly 3–4% thermal efficiency — the reason premium fuel exists and why squish/quench design matters as much as the raw number.",
    assumptions: [
      "Volumes measured or manufacturer-specified at TDC.",
      "Static CR — ignores intake valve closing point (dynamic CR).",
    ],
    limitations: [
      "Dynamic/effective CR depends on cam timing and rod length — build a different number.",
      "Gasket bore vs cylinder bore mismatch changes gasket volume.",
    ],
    faqs: [
      {
        q: "What compression ratio for pump gas?",
        a: "About 10.5:1 static max for iron-head engines on 91 octane; aluminum heads and good chamber design stretch that to 11:1. Beyond that needs race fuel or boost control.",
      },
      {
        q: "Why is my dynamic CR lower?",
        a: "The intake valve closes well after BDC; below a certain RPM the rising piston pushes mixture back out. Dynamic CR uses the volume at intake closing — typically 1.5–2 points lower than static.",
      },
    ],
    references: [
      { label: "SAE — engine compression fundamentals", url: "https://www.sae.org/publications/" },
    ],
    related: ["engine-displacement-calculator", "torque-power-calculator", "pulley-rpm-calculator", "bolt-torque-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "spring-rate-calculator",
    category: "mechanical",
    name: "Spring Rate Calculator",
    title: "Spring Rate Calculator — Helical Compression | IngCalc",
    description:
      "Calculate compression spring rate from wire diameter, coil diameter and active coils. N/mm and lbf/in, with spring index guidance.",
    summary:
      "Enter wire diameter, coil outer diameter and active coils to get the spring rate — the classic k = G·d⁴/(8·D³·n) formula with manufacturability notes.",
    keywords: ["spring rate calculator", "spring constant calculator", "coil spring rate", "spring k formula"],
    inputs: [
      { id: "wireDia", label: "Wire diameter", kind: "number", unit: "mm", defaultValue: 4, min: 0.2, step: 0.1 },
      { id: "outerDia", label: "Coil outer diameter", kind: "number", unit: "mm", defaultValue: 25, min: 1, step: 0.5 },
      { id: "coils", label: "Active coils", kind: "number", unit: "n", defaultValue: 8, min: 2, max: 50, step: 0.5, help: "Total coils minus dead ends: −2 squared ends, −1 plain." },
      { id: "shearModulus", label: "Shear modulus (G)", kind: "number", unit: "N/mm²", defaultValue: 79300, min: 50000, max: 90000, step: 100, optional: true, help: "79,300 music wire, 77,200 stainless 302. Leave default unless you know better." },
    ],
    calc: springRate,
    formula: ["k = G × d⁴ / (8 × D³ × n)"],
    variables: [
      { symbol: "k", meaning: "Spring rate", unit: "N/mm" },
      { symbol: "G", meaning: "Shear modulus of the wire", unit: "N/mm²" },
      { symbol: "d", meaning: "Wire diameter", unit: "mm" },
      { symbol: "D", meaning: "Mean coil diameter", unit: "mm" },
      { symbol: "n", meaning: "Active coils", unit: "—" },
    ],
    howItWorks: [
      "Torsion of the wire dominates spring deflection; the formula collapses that into one rate expression.",
      "Wire diameter enters to the 4th power — a 10% thicker wire is 46% stiffer. Coil diameter enters cubed.",
      "The spring index (D/d) flags manufacturability: below 4 is hard to coil, above 12 is unstable.",
    ],
    example:
      "4 mm wire, 25 mm OD (21 mm mean), 8 active coils, music wire: k = 79,300 × 256 / (8 × 9,261 × 8) = 34.3 N/mm ≈ 196 lbf/in. Loading it 50 mm takes 1,715 N.",
    interpretation:
      "Rate is stiffness, not strength — max load depends on stress, which the Wahl correction factor evaluates. The d⁴ sensitivity means wire size is the design lever; coil count fine-tunes. Doubling active coils halves the rate but doubles travel before solid height.",
    assumptions: [
      "Round wire, helical compression, linear range.",
      "Static loading; fatigue needs stress-life analysis.",
    ],
    limitations: [
      "Wahl stress correction applies at high loads — rate alone doesn't predict failure.",
      "Conical, barrel and torsion springs don't follow this formula.",
    ],
    faqs: [
      {
        q: "How do I make a spring stiffer?",
        a: "Bigger wire (4th power — very effective), smaller coil diameter (3rd power), or fewer active coils (linear). Grinding ends or adding coils is easier than re-coiling.",
      },
      {
        q: "What is spring index?",
        a: "Mean coil diameter ÷ wire diameter. 4–12 manufactures well and performs predictably; outside that range you fight coiling limits or buckling.",
      },
    ],
    references: [
      { label: "SAE J796 / SMI — spring design manual", url: "https://www.smihq.org/" },
    ],
    related: ["bearing-life-calculator", "bolt-torque-calculator", "hydraulic-cylinder-calculator", "torque-wrench-extension-calculator"],
    priority: "C",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "torque-wrench-extension-calculator",
    category: "mechanical",
    name: "Torque Wrench Extension Calculator",
    title: "Torque Wrench Extension Calculator — Crowfoot Setup | IngCalc",
    description:
      "Correct torque wrench settings when using extensions or crowfoot wrenches in line with the handle. Get the reduced setting that hits the target.",
    summary:
      "Using a crowfoot or extension changes the effective lever length. Enter the target, wrench length and extension to get the corrected wrench setting.",
    keywords: ["torque wrench extension calculator", "crowfoot torque correction", "torque adapter formula"],
    inputs: [
      { id: "setting", label: "Target torque at fastener", kind: "number", defaultValue: 60, min: 0.5, step: 1,
        unitOptions: [{ value: "Nm", label: "N·m", factor: 1 }, { value: "lbft", label: "lb·ft", factor: 1.35582 }],
        defaultUnit: "Nm" },
      { id: "wrenchLen", label: "Wrench effective length", kind: "number", unit: "mm", defaultValue: 400, min: 50, step: 5, help: "Drive center to handle grip center." },
      { id: "extLen", label: "Extension length", kind: "number", unit: "mm", defaultValue: 75, min: 0, step: 5, help: "Drive center to fastener center, measured in line with the handle." },
    ],
    calc: torqueWrenchExtension,
    formula: ["T_set = T_target × L / (L + E)"],
    variables: [
      { symbol: "T_set", meaning: "Corrected wrench setting", unit: "N·m" },
      { symbol: "T_target", meaning: "Required torque at the fastener", unit: "N·m" },
      { symbol: "L", meaning: "Wrench effective length", unit: "mm" },
      { symbol: "E", meaning: "Extension length in line with handle", unit: "mm" },
    ],
    howItWorks: [
      "The wrench reads torque at its own drive; an in-line extension adds lever, so the same setting delivers MORE torque at the bolt.",
      "The corrected setting scales down by L/(L+E) to land the target at the fastener.",
      "A 90° crowfoot doesn't change effective length — no correction; an in-line one does.",
    ],
    example:
      "Target 60 N·m, 400 mm wrench, 75 mm in-line crowfoot: T_set = 60 × 400/475 = 50.5 N·m. Set the wrench to 50.5 and it delivers 60 at the bolt — setting 60 would overtorque by 19%.",
    interpretation:
      "The error direction matters: forgetting the correction always overtightens — broken bolts, stripped threads, warped housings. Measure the wrench length from the drive center (knurled grip midpoint) and the extension from drive to fastener center. Extensions on the drive side (between wrench and socket) don't change anything.",
    assumptions: [
      "Extension collinear with the wrench handle (measured center-to-center).",
      "Rigid extension — flexible joints introduce error regardless of correction.",
    ],
    limitations: [
      "Universal joints and swivel adapters change the force path — avoid for critical torques.",
      "90° crowfoot positions need no correction but check the wrench's own spec for offset loads.",
    ],
    faqs: [
      {
        q: "Does a crowfoot change torque?",
        a: "Only if it extends the effective length in line with the handle. At 90°, no change; in line, apply the correction formula.",
      },
      {
        q: "Why does my wrench read lower than the bolt gets?",
        a: "The extension extends the lever: bolt torque = setting × (L+E)/L. Compensate by setting lower — exactly what this calculator computes.",
      },
    ],
    references: [
      { label: "ASME B107.14 — torque wrench calibration and use", url: "https://www.asme.org/codes-standards" },
    ],
    related: ["bolt-torque-calculator", "torque-power-calculator", "spring-rate-calculator", "hydraulic-cylinder-calculator"],
    priority: "A",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "pump-power-calculator",
    category: "mechanical",
    name: "Pump Power Calculator",
    title: "Pump Power Calculator — Hydraulic & Shaft Power | IngCalc",
    description:
      "Calculate pump hydraulic and shaft power from flow, head and efficiency. Water horsepower, brake horsepower and motor sizing in kW and hp.",
    summary:
      "Enter flow, head and efficiency to get hydraulic power (water hp) and shaft power — the numbers for motor selection on any centrifugal pump.",
    keywords: ["pump power calculator", "water horsepower", "pump motor sizing", "hydraulic power formula"],
    inputs: [
      { id: "flowLpm", label: "Flow rate", kind: "number", defaultValue: 100, min: 0.1, step: 5,
        unitOptions: [{ value: "lpm", label: "L/min", factor: 1 }, { value: "gpm", label: "US gal/min (×3.785)", factor: 3.785 }],
        defaultUnit: "lpm" },
      { id: "headM", label: "Total head", kind: "number", unit: "m", defaultValue: 20, min: 0.1, step: 1,
        help: "Static lift + friction losses." },
      { id: "eff", label: "Pump efficiency", kind: "number", unit: "0-1", defaultValue: 0.7, min: 0.1, max: 1, step: 0.01, help: "Centrifugal water pumps: 0.6–0.8; small pumps lower." },
      { id: "sg", label: "Specific gravity of fluid", kind: "number", unit: "—", defaultValue: 1, min: 0.5, max: 2, step: 0.01, optional: true },
    ],
    calc: pumpPower,
    formula: ["P_hydraulic = ρ × g × Q × H", "P_shaft = P_hydraulic / η"],
    variables: [
      { symbol: "P_h", meaning: "Hydraulic (water) power", unit: "W" },
      { symbol: "P_s", meaning: "Shaft (brake) power", unit: "W" },
      { symbol: "Q", meaning: "Volumetric flow", unit: "m³/s" },
      { symbol: "H", meaning: "Total head", unit: "m" },
    ],
    howItWorks: [
      "Hydraulic power is the useful energy given to the fluid: ρgQH — mass flow lifted through head H.",
      "Shaft power divides by pump efficiency; motor nameplate should exceed shaft power with a service factor margin.",
    ],
    example:
      "100 L/min at 20 m head, 70% efficient pump: hydraulic = (0.001667 m³/s × 9810 × 20) = 327 W; shaft = 467 W → a 0.75 kW motor with service factor, or a 1/2 hp motor is marginal.",
    interpretation:
      "Head is total head: static lift plus every friction loss in pipes, fittings and valves. Sizing the motor for the duty point (not shutoff) prevents both overload at runout and waste at deadhead. For viscous fluids or slurries, efficiency drops well below the water-benchmark figure.",
    assumptions: [
      "Newtonian fluid, water-like behavior unless SG is changed.",
      "Steady duty point on the pump curve.",
    ],
    limitations: [
      "Viscosity corrections for oils and sludges are substantial — use pump manufacturer curves.",
      "NPSH and cavitation checks are separate concerns.",
    ],
    faqs: [
      {
        q: "What is water horsepower?",
        a: "The pure hydraulic output: flow × head × specific weight, with no losses. Shaft power = water hp ÷ pump efficiency; motor power adds motor efficiency too.",
      },
      {
        q: "How much power to lift water 10 meters?",
        a: "Per L/s: 0.098 kW hydraulic. At 10 L/s: 0.98 kW — before pump and motor losses, which roughly double the electrical draw in practice.",
      },
    ],
    references: [
      { label: "Hydraulic Institute — pump standards", url: "https://www.pumps.org/" },
    ],
    related: ["hydraulic-cylinder-calculator", "torque-power-calculator", "motor-current-calculator", "fan-laws-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "chain-length-calculator",
    category: "mechanical",
    name: "Chain Length Calculator",
    title: "Roller Chain Length Calculator — Links & Pitch | IngCalc",
    description:
      "Calculate roller chain length from sprocket teeth and center distance, in pitches, links, mm and inches. Recommends even link counts.",
    summary:
      "Enter both sprocket tooth counts, center distance and chain pitch to get the exact chain length — rounded to an even link count to avoid offset links.",
    keywords: ["chain length calculator", "roller chain length", "chain links calculator", "sprocket chain size"],
    inputs: [
      { id: "t1", label: "Small sprocket teeth", kind: "number", unit: "T", defaultValue: 17, min: 8, max: 200, step: 1 },
      { id: "t2", label: "Large sprocket teeth", kind: "number", unit: "T", defaultValue: 34, min: 8, max: 200, step: 1 },
      { id: "cd", label: "Center distance", kind: "number", unit: "mm", defaultValue: 400, min: 20, step: 5 },
      { id: "pitch", label: "Chain pitch", kind: "number", unit: "mm", defaultValue: 12.7, min: 3, max: 80, step: 0.05, help: "#25: 6.35, #35: 9.525, #40: 12.7, #50: 15.875, #60: 19.05 mm." },
    ],
    calc: chainLength,
    formula: ["L(pitches) = 2C/p + (T₁+T₂)/2 + p(T₂−T₁)²/(4π²C)"],
    variables: [
      { symbol: "L", meaning: "Chain length", unit: "pitches" },
      { symbol: "C", meaning: "Center distance", unit: "mm" },
      { symbol: "T₁, T₂", meaning: "Sprocket teeth", unit: "—" },
      { symbol: "p", meaning: "Chain pitch", unit: "mm" },
    ],
    howItWorks: [
      "The classical chain equation wraps straight spans plus arc contact on each sprocket, expressed in pitches.",
      "The result rounds UP to the nearest even pitch count — even counts use a standard connecting link instead of a weaker offset link.",
      "Pitch conversions for ANSI sizes (#25–#60) are built in.",
    ],
    example:
      "17T and 34T sprockets at 400 mm with #40 chain (12.7 mm): L = 63.0 + 25.5 + 0.03 ≈ 88.5 → order 90 pitches (1,143 mm). The offset link would have been needed at 89 — the even 90 avoids it.",
    interpretation:
      "Chain drives wear by pitch elongation: a 'stretched' chain rides higher on sprocket teeth and eventually jumps. Order two links extra with a tensioner, or set center distance adjustable by ±2 pitches. Never reuse an offset link in a power drive — it's the weak point.",
    assumptions: [
      "Standard roller chain, two-sprocket drive, no idlers.",
      "Slight chain tension at installation.",
    ],
    limitations: [
      "Idler sprockets and serpentine paths add length segments — measure those separately.",
      "Chain sag in long horizontal spans needs a catenary allowance.",
    ],
    faqs: [
      {
        q: "How do I measure chain pitch?",
        a: "Center-to-center distance of three consecutive pins, divided by two. 12.7 mm = #40 chain.",
      },
      {
        q: "Why even number of links?",
        a: "An even count closes with a spring-clip connecting link (full strength). Odd counts need an offset link — two pins on a bent side plate, roughly 20–30% weaker.",
      },
    ],
    references: [
      { label: "ANSI/ASME B29.1 — precision power transmission roller chains", url: "https://www.asme.org/codes-standards" },
    ],
    related: ["belt-length-calculator", "pulley-rpm-calculator", "gear-ratio-calculator", "metal-weight-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
  {
    slug: "bearing-life-calculator",
    category: "mechanical",
    name: "Bearing Life Calculator",
    title: "Bearing L10 Life Calculator — Hours & Revolutions | IngCalc",
    description:
      "Calculate ball or roller bearing L10 life from dynamic load rating, applied load and speed. Hours, revolutions and years at the duty point.",
    summary:
      "Enter the bearing's C rating, the actual applied load and RPM to get L10 life — the standard (C/P)³ fatigue calculation for ball bearings.",
    keywords: ["bearing life calculator", "l10 life", "bearing hours calculator", "bearing fatigue life"],
    inputs: [
      { id: "dynamicLoad", label: "Dynamic load rating (C)", kind: "number", unit: "N", defaultValue: 12700, min: 100, step: 100, help: "From the bearing catalog — e.g. 6205: 14.0 kN." },
      { id: "appliedLoad", label: "Applied radial load (P)", kind: "number", unit: "N", defaultValue: 2000, min: 1, step: 50 },
      { id: "rpm", label: "Speed", kind: "number", unit: "RPM", defaultValue: 1750, min: 1, step: 10 },
      {
        id: "type", label: "Bearing type", kind: "select",
        options: [
          { value: "ball", label: "Ball bearing (k = 3)" },
          { value: "roller", label: "Roller bearing (k = 10/3)" },
        ],
        defaultOption: "ball",
      },
    ],
    calc: bearingLife,
    formula: ["L10 = (C/P)^k × 10⁶ revolutions", "Hours = L10 × 10⁶ / (60 × RPM)"],
    variables: [
      { symbol: "C", meaning: "Basic dynamic load rating", unit: "N" },
      { symbol: "P", meaning: "Equivalent applied load", unit: "N" },
      { symbol: "L10", meaning: "Life at 90% survival", unit: "million rev" },
    ],
    howItWorks: [
      "Bearing fatigue follows (C/P)^k: halve the load and ball bearing life rises 8-fold.",
      "L10 means 90% of an identical bearing population exceeds that life — it's statistics, not a guarantee.",
      "Converting to hours uses the operating speed.",
    ],
    example:
      "A 6205 bearing (C = 14 kN) carrying 2 kN at 1,750 RPM: L10 = (14/2)³ = 343 million rev → 3,267 hours... that's why bearing selection starts with the load ratio, not the catalog page. At 500 N the same bearing runs 87,000 hours.",
    interpretation:
      "The cubic law is the designer's lever: modest load reductions buy enormous life. But the model assumes clean lubrication, correct mounting and alignment — contamination and misalignment dominate real failures. For machine design, target L10 ≥ 30,000 h industrial, 100,000+ h for continuous-duty units.",
    assumptions: [
      "Constant radial load; combined loads need the equivalent-load (X/Y) method first.",
      "Proper lubrication, mounting and alignment.",
    ],
    limitations: [
      "Does not account for contamination, misalignment, shock loads or vibration damage.",
      "Axial loads on deep-groove bearings need the X/Y equivalent conversion.",
    ],
    faqs: [
      {
        q: "What does L10 life mean?",
        a: "90% of identical bearings under identical load will exceed that life before fatigue spalling. It's a 90% reliability rating, not a service interval.",
      },
      {
        q: "How do I extend bearing life?",
        a: "Reduce load (larger bearing or better alignment), lubricate correctly, keep contamination out, and avoid shock loading. The cubic law means halving load = 8× life.",
      },
    ],
    references: [
      { label: "ISO 281 — rolling bearing dynamic load ratings and rating life", url: "https://www.iso.org/standard/60624.html" },
    ],
    sections: [
      {
        title: "L10 life is a probability, not a warranty",
        paragraphs: [
          "The rating life this calculator computes is L10: the hours at which 90% of an identical group of bearings survives. Half the group will outlast the figure substantially; 10% will not reach it. Designing a spindle to its L10 life means one machine in ten fails first — which is why critical machinery uses L1 or L5 life (more conservative) and why a bearing that fails before L10 is not proof of a defective part, while one that fails at 20% of L10 usually indicates contamination, misalignment or overloading rather than a bad calculation.",
        ],
      },
    ],
    related: ["metal-weight-calculator", "spring-rate-calculator", "hydraulic-cylinder-calculator", "chain-length-calculator"],
    priority: "B",
    lastUpdated: "2026-09-15",
  },
];
