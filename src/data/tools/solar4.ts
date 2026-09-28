import type { ToolDefinition } from "@/lib/types";
import { dcCableLoss } from "@/lib/engines/solar4";

export const SOLAR4_TOOLS: ToolDefinition[] = [
  {
    slug: "dc-cable-loss-calculator",
    category: "solar-energy",
    name: "PV DC Cable Loss Calculator",
    title: "PV DC Cable Loss Calculator — Voltage Drop & Power Loss | IngCalc",
    description:
      "Calculate DC voltage drop and power loss in PV string cabling from string voltage, current, run length and cable size — with the 2% design target.",
    summary:
      "Enter string Vmp/Imp, one-way run and cable size to get the DC drop and the watts lost every peak hour — the 25-year tax of undersized PV cable.",
    keywords: ["dc cable loss calculator", "pv voltage drop", "solar wire size calculator", "string cable sizing"],
    inputs: [
      { id: "stringV", label: "String voltage (Vmp)", kind: "number", defaultValue: 320, min: 12, step: 10, unit: "V",
        help: "String Vmp at STC (panels × Vmp each)." },
      { id: "stringI", label: "String current (Imp)", kind: "number", defaultValue: 10, min: 0.5, step: 0.5, unit: "A" },
      { id: "length", label: "One-way run length", kind: "number", defaultValue: 30, min: 0.1, step: 1,
        unitOptions: [
          { value: "m", label: "m", factor: 1 },
          { value: "ft", label: "ft (×0.3048)", factor: 0.3048 },
        ],
        defaultUnit: "m" },
      { id: "cableSize", label: "Cable cross-section", kind: "number", defaultValue: 6, min: 1, step: 0.5,
        unitOptions: [
          { value: "mm2", label: "mm²", factor: 1 },
          { value: "awg10", label: "10 AWG (×5.26)", factor: 5.26 },
          { value: "awg8", label: "8 AWG (×8.37)", factor: 8.37 },
          { value: "awg6", label: "6 AWG (×13.3)", factor: 13.3 },
        ],
        defaultUnit: "mm2",
        help: "Copper. Common PV wire: 4, 6, 10 mm²." },
    ],
    calc: dcCableLoss,
    formula: ["R = ρ × 2L / A        Vd = I × R        P_loss = I² × R"],
    variables: [
      { symbol: "Vd", meaning: "DC voltage drop", unit: "V" },
      { symbol: "ρ", meaning: "Copper resistivity (~0.0195 Ω·mm²/m at 70 °C)", unit: "Ω·mm²/m" },
    ],
    howItWorks: [
      "Loop resistance doubles the one-way run: both PV+ and PV− carry the full current.",
      "Copper resistivity at ~70 °C conductor temperature (0.0195 Ω·mm²/m) — hot rooftop cable is ~13% worse than the 20 °C figure.",
      "Power lost is I²R — the watts the array generates but never reaches the inverter.",
    ],
    example:
      "A 320 V / 10 A string over 30 m one-way on 6 mm² copper: R = 0.0195 × 60/6 = 0.195 Ω. Vd = 1.95 V (0.61%), loss 19.5 W of a 3200 W string. On 4 mm²: 0.87% and 28 W. On 100 m runs the difference between sizes becomes a full percent of production for 25 years.",
    interpretation:
      "DC loss is pure lifetime waste: every watt lost in the cable is lost at peak sun, every day, for the array's life. The 2% design target balances cable cost against production — long runs push toward 6–10 mm² sooner than intuition suggests. Note the asymmetry: losses scale with I², so higher-voltage strings (smaller current) are dramatically kinder to cable — one reason modern 600–1000 V systems displaced 48 V string inverters in residential PV.",
    assumptions: [
      "Copper conductor at ~70 °C operating temperature.",
      "String operating at Vmp/Imp (peak power point).",
    ],
    limitations: [
      "Covers resistive DC loss only — connector resistance and MPP tracking offsets are separate.",
      "Cable ampacity, fuse ratings and temperature derating are separate checks.",
    ],
    faqs: [
      {
        q: "What voltage drop is acceptable for solar DC cabling?",
        a: "≤ 2% is the standard design target (≤ 1% on premium installs). The loss repeats every peak hour for 25+ years, so oversized cable usually pays back.",
      },
      {
        q: "Why do higher-voltage strings lose less in cable?",
        a: "Loss scales with current squared: doubling string voltage halves the current and quarters the loss for the same power and cable — the physics behind modern high-voltage PV design.",
      },
    ],
    references: [
      { label: "NEC Article 690 — PV systems", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ],
    related: ["string-sizing-calculator", "wire-resistance-calculator", "voltage-drop-calculator", "solar-panel-output-calculator"],
    priority: "A",
    lastUpdated: "2026-09-28",
  },
];
