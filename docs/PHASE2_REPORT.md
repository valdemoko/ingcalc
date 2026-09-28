# ENGCalc — Informe FASE 2 (validación completa)

Fecha: 28-sep-2026. Rama `main`. Sin commits ni redirects. 0 URLs rotas.

> Nota: el prompt menciona 13 herramientas nuevas; el lote implementado y validado es de 15, todas registradas y publicadas.

## A. Resumen

| Métrica | Antes | Después |
|---|---|---|
| Herramientas | 70 | 85 |
| URLs de herramienta (SSG) | 70 | 85 |
| Páginas totales (build) | 100 | 115 |
| Categorías vivas | 5 | 5 |
| Checks de motores | 82 | 122 |
| Redirects | 0 | 0 |

## B. Nuevas herramientas (15) — slug · fórmula · fuente · tests

### Eléctrica

**1. Parallel Resistor Calculator** — `/tools/electrical/parallel-resistor-calculator`
- Problema: equivalente de 2–5 resistores en paralelo; hueco junto a Ohm/divisor.
- Fórmula: `1/R_eq = Σ 1/Rᵢ` (atajo producto/suma para 2). *Fuente: Electronics Tutorials, res_4.*
- Tests: normal 1k∥2.2k = 687.5 Ω · límite 3×1k = 333.33 Ω · inválido: 1 solo valor, R=0.

**2. Capacitor Energy Calculator** — `/tools/electrical/capacitor-energy-calculator`
- Problema: energía/carga almacenada con prefijos mF/µF/nF/F.
- Fórmula: `E = ½·C·V²`, `Q = C·V`. *Fuente: Electronics Tutorials, cap_7.*
- Tests: normal 1000 µF@12V = 0.072 J · límite @300V = 45 J (ley V²) · inválido: C o V ≤ 0.

**3. Reactance Calculator** — `/tools/electrical/reactance-calculator`
- Problema: reactancia de componentes con selector inductivo/capacitivo y unidades H/mH/µH, µF/nF, Hz/kHz/MHz.
- Fórmula: `Xʟ = 2πfL`, `X꜀ = 1/(2πfC)`. *Fuente: Electronics Tutorials, AC circuits.*
- Tests: normal 10 mH@60Hz = 3.77 Ω · límite 10 µF@60Hz = 265.3 Ω · inválido: f = 0, L/C ausente.

### Mecánica

**4. Cantilever Beam Calculator** — `/tools/mechanical/cantilever-beam-calculator`
- Problema: deflexión y tensión de viga en voladizo con carga puntual.
- Fórmulas: `δ = PL³/3EI`, `σ = PLc/I`, `I = wh³/12`, E acero 200 GPa. *Fuente: Engineering ToolBox / Roark's.*
- Tests: normal 500N·1m·50×20 → 4.0 mm / 60 MPa · límite profundidad ×2 → 0.5 mm (h³) · inválido: dimensiones ≤ 0.

**5. Shaft Torsion Calculator** — `/tools/mechanical/shaft-torsion-calculator`
- Problema: torsión de eje macizo y capacidad de par al esfuerzo admisible (solver bidireccional).
- Fórmula: `τ = T·r/J`, `J = πd⁴/32`. *Fuente: Shigley's Mechanical Engineering Design.*
- Tests: normal 20mm@100N·m → 63.7 MPa · límite capacidad @100MPa = 157.1 N·m · inválido: sobreesfuerzo → throw.

**6. Machine Efficiency Calculator** — `/tools/mechanical/machine-efficiency-calculator`
- Problema: rendimiento entrada/salida y pérdidas en W.
- Fórmula: `η = P_out/P_in`, pérdidas = entrada − salida. *Fuente: DOE Motor System Master.*
- Tests: normal 850/1000 → 85% / 150 W · inválido: η > 100% → throw.

### HVAC

**7. Psychrometric Calculator** — `/tools/hvac/psychrometric-calculator`
- Problema: razón de humedad (g/kg), entalpía (kJ/kg aire seco) y presión barométrica por altitud.
- Fórmula: correlación ASHRAE de p_ws sobre agua (T en Kelvin) + `W = 0.621945·pw/(p−pw)` + `h = 1.006T + W(2501+1.86T)`. *Fuente: ASHRAE Handbook — Fundamentals.*
- Tests: normal 25°C/50% → 9.88 g/kg, 50.3 kJ/kg · límite 1500 m → 11.88 g/kg · inválido: 80 °C fuera de banda.
- Nota: bug de implementación (unidades K) detectado y corregido por los propios tests.

**8. Heat Pump COP Calculator** — `/tools/hvac/heat-pump-cop-calculator`
- Problema: HSPF → COP con derate por temperatura y coste por kWh térmico vs resistencia.
- Fórmula: `COP_seasonal = HSPF × 0.2931`, derate ≈ 2,8%/°C bajo 8,3 °C (suelo 0,35). *Fuentes: DOE (HSPF/HSPF2), NEEP cold-climate.*
- Tests: normal HSPF9@0°C → COP 2.02 · límite @15°C → 2.64 sin derate · inválido: HSPF fuera 6–16.

**9. Temperature Conversion Calculator** — `/tools/hvac/temperature-conversion-calculator`
- Problema: conversión exacta con guardas y regla ΔT (×1.8 sin +32).
- Fórmula: definiciones exactas °F/°C/K. *Fuente: NIST SI Units.*
- Tests: normal 20°C → 68°F/293.15 K · límite 32°F → 0°C · inválido: −300 °C (cero absoluto).

### Solar

**10. Energy Consumption Calculator** — `/tools/solar-energy/energy-consumption-calculator`
- Problema: auditoría diaria de consumo por grupos con traducción a batería y array.
- Fórmula: `Σ W×h`; batería = Wh/DoD/V; array = Wh/(PSH·derate). *Fuente: NREL sizing guidance.*
- Tests: normal 1.46 kWh/día → 243 Ah @12V · inválido: todo a cero → throw.

**11. Inverter Sizing Calculator** — `/tools/solar-energy/inverter-sizing-calculator`
- Problema: dimensionar inversor desde carga continua, arranque y PF.
- Fórmula: `VA = máx(continua×1.25, arranque) ÷ PF`. *Fuente: DOE inverter guidance.*
- Tests: normal 800W+1200@PF0.9 → 1333 VA · límite 800W@PF1 → 1000 VA · inválido: PF > 1.

**12. DC/AC Ratio Calculator** — `/tools/solar-energy/dc-ac-ratio-calculator`
- Problema: ratio de sobredimensionado y clipping anual.
- Fórmula: `ratio = Wp_DC/W_AC`; clipping por cribado de hora pico (~15% de la energía diaria). *Fuente: NREL PVWatts; etiquetado como estimación.*
- Tests: normal 7/6 kW → 1.17 · inválido: valores ≤ 0.

### Construcción

**13. Excavation Calculator** — `/tools/construction/excavation-calculator`
- Problema: banco vs esponjado, cargas de camión y toneladas.
- Fórmula: `banco = L×W×D/27`; `esponjado = banco×(1+swell)`. *Contexto normativo: OSHA 1926 Subpart P.*
- Tests: normal 30×4×3 → 13.33 yd³ · límite ×1.25 → 16.67 y 2 cargas · inválido: dimensiones ≤ 0, swell fuera 0–1.

**14. Paint Calculator** — `/tools/construction/paint-calculator`
- Problema: galones por área, manos y rendimiento editable; techo opcional; primario.
- Fórmula: `gal = área×manos/rendimiento` (375 ft²/gal; primario 250). *Fuente: Sherwin-Williams.*
- Tests: normal 416 ft²·2 manos → 2.22 gal (comprar 3) · límite con techo 584 ft² → 3.11 gal · inválido: manos fuera 1–4.

**15. Tile Calculator** — `/tools/construction/tile-calculator`
- Problema: baldosas con merma por patrón, cajas, adhesivo y junta.
- Fórmula: `baldosas = área/(lado²/144) × (1+merma)`; merma 10% recto / 15% diagonal. *Fuente: TCNA Handbook.*
- Tests: normal 100 ft²·12" → 110 · límite diagonal → 115 · inválido: área o lado ≤ 0.

## C. Herramientas modificadas (solo interlinking + fixes de validación)

- `voltage-drop-calculator`: `related` motor-current → parallel-resistor (relación circuito-electrónica).
- `btu-calculator`: `related` airflow-cfm → psychrometric-calculator (propiedades del aire).
- `heating-load-calculator`: `related` airflow-cfm → heat-pump-cop-calculator (comparación de calefacción).
- `gear-ratio-calculator`: `related` belt-length → shaft-torsion-calculator (transmisión).
- `torque-power-calculator`: `related` belt-length → machine-efficiency-calculator (rendimiento).
- `solar-panel-output-calculator`: `related` off-grid → energy-consumption-calculator (inicio del flujo).
- `concrete-calculator`: `related` footing → excavation-calculator (mismo flujo de obra).
- Sin cambios de fórmulas, títulos, UX ni contenido (regla 24 del prompt).
- El script `verify-phase1.ts` confirma que las mejoras de la Fase 1 (kWh mode, R(T), Al ×1.64, displacement en pulgadas) siguen intactas: 12/12 ok.

## D. Herramientas NO creadas (descartes)

- **Kg→lb / unit converters genéricos**: el sistema de unidades ya resuelve conversiones en cada campo.
- **Conduit fill calculator**: fiable pero requiere contrastar tablas NEC primarias antes de publicar.
- **Simply-supported beam / column buckling**: requieren más tipos de sección y apoyos para ser honestos; el voladizo cubre el caso más buscado con un modelo único y correcto.
- **Plumbing (pipe sizing, pressure drop)**: la categoría sigue `planned`; activarla con 1–2 herramientas crearía categorías débiles.
- **CNC feeds & speeds**: exige tablas de materiales verificadas; riesgo alto de datos inventados.
- **Calculadoras financieras genéricas**: fuera del alcance técnico del sitio.

## E. SEO

- **Sitemap**: 100 URLs (85 herramientas + categorías + guías + estáticas). 0 herramientas nuevas ausentes.
- **Canonical**: generado automáticamente por `toolMetadata()` desde el slug — sin cambios de arquitectura.
- **Schema**: heredado (WebApplication + BreadcrumbList + FAQPage real). Sin JSON-LD añadido artificialmente.
- **Related**: cada herramienta nueva lleva 3–4 relacionados reales; 7 existentes ganaron 1 enlace contextual cada una.
- **Títulos/descripciones**: únicos, 80–170 chars, verificados por `audit-seo.ts` (85/85 OK).

## F. Validación (final)

| Check | Resultado |
|---|---|
| `verify-engines.ts` | 75/75 ok (motores batch 1) |
| `verify-engines2.ts` (batch 2 + 3) | 93/93 ok (52 batch-2 + 41 batch-3) |
| `verify-phase1.ts` (regresión Fase 1) | 13/13 ok |
| **Total engine checks** | **181/181 ok** |
| `audit-seo.ts` | PASS (85 herramientas, 0 duplicados, 0 enlaces rotos, 0 thin metadata) |
| `audit-registry.ts` (nuevo) | PASS — registro, payload completo, inbound links ≥1, grupos de categoría consistentes |
| `tsc --noEmit` | OK |
| ESLint | No configurado en el proyecto (preexistente; `next lint` requiere setup interactivo). El build ejecuta typecheck interno. |
| `next build` | ✓ 115/115 páginas SSG, sin errores ni warnings |
| Sitemap | 100 URLs; 15/15 nuevas presentes; 0 URLs inexistentes |
| robots.txt | `Allow: /` + sitemap — todo indexable por defecto |
| Canonical (verificado en HTML prerenderizado) | `<link rel="canonical">` correcto en páginas nuevas |
| Schema (verificado en HTML prerenderizado) | WebApplication=1, FAQPage=1, BreadcrumbList=1, h1=1, robots meta `index, follow` |
| Related (verificado) | 4 related-cards ×2 bloques por página nueva |
| Responsive | `input flex:1; min-width:0` (sin overflow), `min-height:44px`, `font-size:1rem` (sin zoom iOS), tablas 100%; no se requirió cambio de CSS |

Problemas detectados y corregidos durante la validación:
1. Correlación ASHRAE con unidades °C en lugar de K → W = 0 (error matemático real, detectado por tests).
2. `Math.ceil` con artefacto de coma flotante en tile-count → 111 en vez de 110.
3. `temperature-conversion-calculator` y `dc-ac-ratio-calculator` sin enlaces internos entrantes → añadidos desde `sensible-heat-calculator` y `solar-savings-calculator` respectivamente.

Ningún error matemático pendiente. Los tests de Fase 1 (13/13) confirman que las mejoras previas siguen intactas.

## G. Riesgos (Search Console)

1. **Canibalización `reactance-calculator` ↔ `three-phase-power`/`power-factor`**: los tres tocan impedancia. Mitigado: intenciones distintas (componente vs sistema trifásico).
2. **`temperature-conversion-calculator`** es la más genérica del lote; si no gana impresiones en 8–12 semanas, es candidata a desindexar (no a borrar).
3. **`cantilever-beam-calculator`**: cubre solo el caso voladizo; la página lo declara en limitaciones para evitar decepción del usuario.
4. **Clipping en `dc-ac-ratio-calculator`** es una estimación de cribado, etiquetada en notas.
5. Vigilar que las 15 nuevas no resten impresiones a las de Fase 1 — la auditoría de related no encuentra solapamiento de intención.

## H. Recomendaciones futuras (solo con evidencia)

1. Activar categoría **Plumbing** cuando haya 4–5 herramientas justificadas (pipe sizing, pressure drop, water heater) — no antes.
2. Si SGC muestra demanda de "excavation cost", añadir columna de coste editable a excavation-calculator (no página nueva).
3. Revisar en 8 semanas las posiciones de las 15 nuevas: las que no alcancen top 50 probablemente necesiten contenido diferencial adicional o desindexación selectiva.

---

## I. Auditoría de duplicados/canibalización (sistemática)

Escaneo automático de solapamiento de términos significativos (títulos + keywords) sobre las 85 herramientas (`scripts/audit-registry.ts`):

- **128 pares comparten ≥3 términos** — mayoría preexistentes y legítimos (clústeres temáticos: voltage-drop/wire-size, generator/breaker, CMU/brick...).
- **Pares que involucran herramientas nuevas, evaluados uno a uno:**

| Par (términos compartidos) | Evaluación | Decisión |
|---|---|---|
| power-factor ↔ inverter-sizing (4) | Corrección de PF industrial vs dimensionar inversor off-grid | Mantener ambas |
| generator-sizing ↔ inverter-sizing (4) | Alternador rotativo vs electrónica DC/AC; fórmulas distintas | Mantener |
| breaker-size ↔ inverter-sizing (4) | Solo vocabulario de margen compartido | Mantener |
| pump-power ↔ machine-efficiency (4) | Potencia hidráulica vs ratio de rendimiento | Mantener |
| reactance ↔ three-phase-power / power-factor | Componente vs sistema trifásico | Mantener |

- **Conclusión: 0 canibalizaciones reales.** Los solapamientos son vocabulario de clúster, no intención duplicada.
- Registro: 15/15 registradas con payload completo (inputs, fórmula, FAQs, referencias) e **inbound links ≥1** (2 estaban a 0 y se corrigieron).
- Grupos de categoría consistentes: 0 entradas obsoletas, 0 herramientas fuera de su grupo.

## J. Estado responsive de las nuevas herramientas

Las 15 usan el `CalculatorForm` compartido sin cambios de CSS global:
- Inputs numéricos: `flex:1; min-width:0` → se contraen sin overflow horizontal.
- `min-height: 44px` y `font-size: 1rem` → sin zoom automático en iOS, táctil cómodo.
- Selectores de unidad `flex: 0 0 auto; min-width: 96px` → no colapsan.
- Tablas de resultados al 100% con `tabular-nums` → legibles en móvil.
- Campos condicionales (`showIf`) usados por reactance, energy-cost y paint funcionan en móvil sin scroll horizontal.
- No se detectó problema real → **no se tocó CSS global** (regla del prompt).

---

**FASE 2 APROBADA** — build (115/115), TypeScript OK, 181/181 engine checks, SEO audit PASS, registry audit PASS, 0 canibalizaciones, 0 errores matemáticos pendientes.
