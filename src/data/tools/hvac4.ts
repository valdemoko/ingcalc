import type { ToolDefinition } from "@/lib/types";
import { airDensity } from "@/lib/engines/hvac4";

export const HVAC4_TOOLS: ToolDefinition[] = [
  {
    slug: "air-density-calculator",
    category: "hvac",
    name: "Air Density Calculator",
    title: "Air Density Calculator — Altitude & Humidity | IngCalc",
    description:
      "Calculate moist air density from temperature, altitude and humidity, with the correction factor for fan CFM and the 1.08 sensible-heat equation.",
    summary:
      "Enter temperature, altitude and RH to get air density and the correction factor that fan curves and the 1.08 equation quietly assume away.",
    keywords: ["air density calculator", "air density altitude", "specific volume of air", "fan correction factor"],
    inputs: [
      { id: "tempC", label: "Air temperature", kind: "number", defaultValue: 20, min: -40, max: 80, step: 1,
        unitOptions: [{ value: "C", label: "°C", factor: 1 }, { value: "F", label: "°F (×0.5556)", factor: 0.5556 }],
        defaultUnit: "C" },
      { id: "altitude", label: "Altitude", kind: "number", defaultValue: 0, min: -400, max: 6000, step: 50, unit: "m",
        help: "Sea level 0 · Denver ~1600 · Mexico City ~2240 m." },
      { id: "rh", label: "Relative humidity", kind: "number", unit: "%", defaultValue: 50, min: 0, max: 100, step: 5 },
    ],
    calc: airDensity,
    formula: ["ρ = (p_d·M_d + p_v·M_v) / (R·T)"],
    variables: [
      { symbol: "ρ", meaning: "Moist air density", unit: "kg/m³" },
      { symbol: "p_d, p_v", meaning: "Partial pressures (dry air, vapor)", unit: "kPa" },
    ],
    howItWorks: [
      "Ideal-gas mixture: dry air and water vapor each contribute by their partial pressure and molar mass.",
      "Barometric pressure falls with altitude on the standard atmosphere — the dominant density effect.",
      "The correction factor compares against standard air (1.204 kg/m³, 20 °C, sea level).",
    ],
    example:
      "20 °C, sea level, 50% RH: 1.199 kg/m³ (factor ×0.996 — essentially standard). Denver at 1600 m: barometric 83.5 kPa → 0.996 kg/m³ (×0.83): fans move ~17% less mass and the 1.08 factor becomes 0.89. A 50 °C attic: 1.09 kg/m³ even at sea level.",
    interpretation:
      "Standard air assumptions hide three corrections: altitude (the big one — every 1000 m costs ~9% density), temperature (hot air is thin air), and humidity (wet air is LIGHTER than dry — counterintuitive but real, since water molecules weigh less than N₂/O₂). Fan volume CFM is nearly constant while mass varies, so high-altitude sites get less cooling per CFM and less combustion air — equipment derating tables exist because of this factor.",
    assumptions: [
      "Ideal-gas mixture, standard atmosphere lapse for altitude.",
      "Magnus saturation pressure (accurate to ~0.2% over the range).",
    ],
    limitations: [
      "Not for pressurized systems — only atmospheric conditions.",
      "Fan performance correction also involves pressure ratios, not just density.",
    ],
    faqs: [
      {
        q: "What is the density of air at sea level?",
        a: "About 1.204 kg/m³ (0.075 lb/ft³) at 20 °C — the 'standard air' that fan curves and the 1.08 sensible-heat factor assume. Colder is denser; higher is thinner.",
      },
      {
        q: "Does humid air weigh more?",
        a: "No — it weighs LESS. Water vapor (18 g/mol) displaces heavier dry-air molecules (29 g/mol) at the same pressure and temperature. Humid air is slightly thinner, which is why humid days marginally help aircraft wings and hurt cooling towers' opposite way.",
      },
    ],
    references: [
      { label: "ASHRAE Handbook — Fundamentals, thermophysical properties of air", url: "https://www.ashrae.org/technical-resources/ashrae-handbook" },
    ],
    related: ["psychrometric-calculator", "sensible-heat-calculator", "fan-laws-calculator", "ideal-gas-calculator"],
    priority: "B",
    lastUpdated: "2026-09-28",
  },
];
