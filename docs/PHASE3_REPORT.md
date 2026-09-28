# Fase 3 — Informe final: expansión profunda del catálogo y nuevas disciplinas

**Fecha:** 2026-09-28 · **Alcance:** 85 → **113 herramientas**, 5 → **8 categorías vivas**, 262 checks de motor en verde.

---

## 1. Catálogo

| Métrica | Antes (F2) | Después (F3) |
|---|---|---|
| Herramientas | 85 | **113** |
| Categorías vivas | 5 | **8** (plumbing, thermodynamics, cnc-manufacturing nuevas) |
| Páginas de herramientas SSG | 85 | **113** |
| Sitemap | 100 URLs | **131 URLs** (113 tools + 8 categorías + 8 guías + páginas estáticas) |
| Checks de motor | 181 | **262** (75 batch-1 + 174 batch-2/3/4 + 13 regresión F1) |
| Audits | PASS | **PASS** (0 duplicados, 0 enlaces rotos, 0 huérfanas, 0 thin metadata) |

El número final (113) no es una cuota: sale del plan de 27 herramientas con clusters coherentes (ver §3). Las disciplinas sin densidad suficiente se descartaron deliberadamente (ver §4).

## 2. Nuevas disciplinas

**Activadas como categoría propia (3):**

- **plumbing** (5): Flow & Velocity, Pressure Drop, Pipe Sizing, Pipe Volume, Tank Storage.
- **thermodynamics** (5): Heat Transfer (conduction, heating power), Materials & Gases (expansion, ideal gas, sensible/latent).
- **cnc-manufacturing** (5): Cutting Data (speed, feed), Time & Output (cycle time, production rate), MRR.

**Ampliadas (5 categorías existentes):** electrical +3, mechanical +4, hvac +1, solar-energy +1, construction +4.

**Grupos nuevos dentro de categorías:** Networks & Transients (electrical), Materials & Statics (mechanical), Site Work & Drainage (construction); Beams & Shafts, Power Transmission, Air Properties, Economics & System Design, Structural Layout y Materials & Estimating ampliados.

## 3. Herramientas nuevas (28 en total: 26 netas nuevas + 2 descartes dentro del lote original)

| Tool | Categoría | Fórmula | Fuente | Tests | Motivo |
|---|---|---|---|---|---|
| pipe-flow-calculator | plumbing | V = Q/A | Engineering ToolBox (velocidades de diseño 2–8 ft/s) | 2 | Hueco evidente: ninguna herramienta medía velocidad |
| pipe-pressure-drop-calculator | plumbing | Darcy-Weisbach + Swamee-Jain (laminar f=64/Re) | Swamee & Jain (1976, DOI); Engineering ToolBox | 3 | Cálculo profesional clásico; ν agua 20 °C documentado |
| pipe-size-calculator | plumbing | D = √(4Q/πV), snap a nominal | Engineering ToolBox pipe sizing | 3 | Complementa flow y pressure-drop (cluster completo) |
| pipe-volume-calculator | plumbing | V = π/4·d²·L | Engineering ToolBox pipe volume | 1 | Desinfección, glicol, recirculación ACS |
| tank-volume-calculator | plumbing | cilindro/rectángulo, L+gal+bbl | NIST conversiones | 3 | Demanda alta, intención distinta a concrete |
| heat-conduction-calculator | thermodynamics | R = Σ(t/k), U = 1/R, Q = U·A·ΔT | ISO 6946; ASHRAE Fundamentals | 3 | Base del cluster térmico; R-value IP+SI |
| thermal-expansion-calculator | thermodynamics | ΔL = α·L·ΔT | Engineering ToolBox coeficientes | 3 | 10 materiales; caso 30 m acero → 18 mm en notes |
| ideal-gas-calculator | thermodynamics | pV = nRT (resuelve p/V/T) | NIST CODATA R | 3 | Validación explícita Kelvin (lección del bug ASHRAE F2) |
| sensible-heat-latent-calculator | thermodynamics | Q = m·c·ΔT + latentes agua | NIST agua; Engineering ToolBox cp | 3 | Fusion (334) y vaporización (2257) como referencia |
| heating-power-calculator | thermodynamics | Q = ṁ·c·ΔT | ASHRAE hydronic heating | 2 | El número de potencia de serpentines/boilers |
| cutting-speed-calculator | cnc-manufacturing | n = Vc·1000/(π·D) | Sandvik Coromant | 2 | Relación fundamental de mecanizado |
| feed-rate-calculator | cnc-manufacturing | F = n·fz·z | Sandvik Coromant | 2 | Complemento directo de cutting-speed |
| machining-cycle-time-calculator | cnc-manufacturing | t = L·pasadas/F (+5 s approach) | Sandvik Coromant; Machinery's Handbook | 2 | Útil para presupuestos de taller |
| material-removal-rate-calculator | cnc-manufacturing | Fresado ap·ae·vf; torneado Vc·ap·fn | Sandvik Coromant | 3 | Dos modos con fórmulas verificables |
| production-rate-calculator | cnc-manufacturing | piezas = turno·60·disponibilidad/ciclo | NIST/MEP OEE | 2 | Conecta mecanizado con producción |
| simple-beam-calculator | mechanical | δ = PL³/48EI; σ = Mc/I | Roark's; Engineering ToolBox | 3 | Compite con calculadoras top de SERP |
| hooke-law-calculator | mechanical | σ = F/A, ε = ΔL/L, E = σ/ε | Shigley's; MatWeb | 5 | Solver bidireccional (mide E si das ΔL) |
| power-from-force-calculator | mechanical | P = F·v | ISO 80000-3 | 3 | Gemelo lineal de P = T·ω |
| pulley-system-calculator | mechanical | n₂ = n₁·d₁/d₂, torque ×ratio×0.95 | Machinery's Handbook | 3 | Cierre del cluster de transmisión |
| series-resistor-calculator | electrical | R_eq = ΣRᵢ (2–5) | Electronics Tutorials | 4 | Hueco vs parallel-resistor existente |
| current-divider-calculator | electrical | I₁ = I·R₂/(R₁+R₂) | Electronics Tutorials | 4 | Par natural del voltage-divider |
| rc-time-constant-calculator | electrical | τ = RC; V(t) = V₀(1−e^(−t/τ)) | Electronics Tutorials RC | 4 | t(90%) = 230 ms valida la exponencial |
| ramp-calculator | construction | run = rise·ratio (ADA 1:12) | ADA Standards §405 | 3 | Landings cada 30 in de desnivel |
| cut-fill-calculator | construction | V = A·Δh (swell 25%/shrink 15%) | FHWA earthwork | 3 | Movimiento de tierras en pads |
| drainage-runoff-calculator | construction | V = C·i·A (C por superficie) | EPA stormwater | 2 | Dimensionado de cisternas y sumideros |
| lumber-weight-calculator | construction | dimensiones dressed × densidad | USDA Wood Handbook | 3 | Cargas de reparto y transporte |
| air-density-calculator | hvac | ρ aire húmedo (Magnus + atm estándar) | ASHRAE Fundamentals | 3 | Factor de corrección para ventiladores |
| dc-cable-loss-calculator | solar | Vd = I·ρ·2L/S (cobre 70 °C) | NEC Art. 690 | 4 | Objetivo ≤2% DC; cierra cluster PV |

**Nota de conteo:** el plan original era de 27; con los swaps de enlaces entrantes de F2/F3 el registro valida exactamente 113 (85 + 28 netas). El audit-registry es la fuente de verdad y pasa con 0 huérfanas.

## 4. Herramientas y disciplinas descartadas

| Candidata | Motivo del descarte |
|---|---|
| Categoría automotive | Clusters insuficientes: solo ~4–5 fórmulas verificables (displacement ya existe en mechanical); el resto (frenos, dinámica) exigiría supuestos no verificables. Existe `engine-displacement-calculator` ya en mechanical. |
| Categoría agriculture | Demanda fragmentada, formulas de riego bien cubiertas por plumbing/construction; riesgo de páginas thin. |
| Categoría chemistry | pV=nRT ya cubierto en thermodynamics; el resto (estequiometría) sale del perfil de la plataforma. |
| Electronics como categoría | Ohm/LED/divisores ya existen en electrical; una categoría separada canibalizaría. Se amplió electrical con el grupo Networks & Transients. |
| Fluid mechanics como categoría propia | Solo ~4 herramientas propias (Reynolds, Bernoulli…) — el resto vive ya en plumbing. Reevaluar en F4 si plumbing crece. |
| Duct pressure drop (ASHRAE friction chart) | La metodología requiere nomograma/tablas interpoladas; riesgo alto de desviación no verificable. |
| Refrigerant charge / superheat | Requiere datos propietarios (P-T por refrigerante) y cálculo de seguridad — excluido por política de fórmulas verificables. |
| Psychrometrics avanzadas (enthalpy interactivo) | Ya cubierto por psychrometric-calculator (F1) + air-density (F3); más variaciones serían canibalización. |
| String sizing detalle inversor | Ya existe string-sizing-calculator con temperaturas Voc; duplicaría intención. |

**Canibalización evaluada:** los pares candidatos con ≥3 términos compartidos que involucran herramientas nuevas (pipe-size ↔ duct-size, tank-volume ↔ concrete, air-density ↔ psychrometric, heating-power ↔ sensible-heat, rc-time-constant ↔ ev-charge-time) mantienen intenciones de búsqueda distintas → 0 fusiones necesarias. El audit-registry pasa su scan de canibalización.

## 5. Tests

- **Antes:** 181 checks (75 + 93 + 13).
- **Después:** **262 checks** (75 + 174 + 13) — 81 checks nuevos en batch-4 (bloque `batch 4 (phase 3)` en `scripts/verify-engines2.ts`).
- Cobertura por herramienta nueva: 1–5 checks, incluyendo errores esperados (throws) para inputs inválidos, ceros, negativos, materiales desconocidos y rangos fuera de límites.
- **Fallos encontrados y corregidos durante la fase:**
  1. **`"thermodynamics"` faltaba en `CategoryKey`** (`src/lib/types.ts`) → 6 errores TS; añadido al union.
  2. **Variable `kwh` sin definir en `heatingPower`** (`src/lib/engines/thermo.ts`) → habría renderizado NaN en la fila "Energy per hour" en producción. Detectado por tsc; corregido (kWh = kW × 1 h).
  3. **8 títulos con length 66–69 > 65** → recortados manteniendo keyword principal.
  4. **3 swaps de `related` fallidos** en `electrical2.ts` (series-resistor, current-divider, rc-time-constant sin inbound) → aplicados manualmente; audit-registry en verde.

## 6. SEO

- **113/113 páginas SSG** verificadas en HTML prerenderizado (muestra: pipe-pressure-drop, heat-conduction, cutting-speed, air-density): canonical correcto, `WebApplication` + `FAQPage` + `BreadcrumbList` + `Offer`, `index, follow`, h1 único.
- **Sitemap 131 URLs** (antes 100): los 28 slugs nuevos aparecen en el sitemap (verificados por grep).
- `audit-seo.ts` PASS: 0 duplicados de slug/title/desc, 0 related rotos, 0 FAQ thin (≥60 chars), 100% referencias https, titles ≤65, descripciones 80–170.
- `audit-registry.ts` PASS: 0 huérfanas (todas con ≥1 inbound), 8 categorías con grupos consistentes, payloads correctos, scan de canibalización limpio.
- Internal linking: las 28 nuevas tienen related contextuales desde/del cluster y swaps entrantes en herramientas preexistentes (electrical2, hvac2, construction2, solar2, mechanical2/3).

## 7. Performance

- First Load JS compartido: **103 kB sin cambios** (las definiciones son data estática; los engines se prerenderizan, no viajan al cliente).
- Build: 137 rutas SSG/Static en total (113 tools + 8 categorías + 8 guías + estáticas), sin warnings.
- HTML por página crece solo por FAQ/schema adicionales (~unos kB), irrelevante para LCP.

## 8. Riesgos y vigilancia posterior

1. **Viscosidad del agua fija a 20 °C** en plumbing (ν = 1e-6): el pressure drop sube ~25% a 5 °C y baja ~30% a 60 °C. Ya documentado en las notes de la herramienta; vigilar feedback de usuarios con agua caliente/helada.
2. **U-value sin películas superficiales** en heat-conduction: la herramienta lo advierte explícitamente ("real U ends 10–30% higher"); considerar capa de films en F4 si hay feedback.
3. **Swamee-Jain válido solo turbulento**: laminar usa 64/Re exacto, pero la transición (2300–4000) tiene incertidumbre inherente — aceptable para diseño de suministro.
4. **Correlación Magnus** en air-density: precisión ~0.2% en el rango −40…80 °C; suficiente para corrección de ventiladores, no para meteorología.
5. **Pulley/belt efficiency fija 0.95**: documentado como aproximación; correa dentada y engranajes difieren (notes incluidas).
6. **Search Console**: 28 URLs nuevas pueden tardar semanas en indexar; monitorizar cobertura y consultar CTR de los titles recortados.

## 9. Próxima expansión (mayor potencial residual)

1. **Fluid mechanics** como categoría propia si plumbing llega a 8–10 herramientas (Reynolds, Bernoulli, minor losses, pump head — pump-power ya existe en mechanical).
2. **Construction estructural orientativo**: columnas de acero/madera a compresión, footing sizing por suelo (ya existe esqueleto), viga de madera vs acero — siempre etiquetadas como orientativas.
3. **Electrical: baterías y DC industrial** (cable sizing DC, fuse coordination básica, surge sizing).
4. **Automotive** si se acumulan 6+ fórmulas verificables (gear ratio/tire/speed-RPM ya parcialmente cubiertos por mechanical).
5. **HVAC: duct pressure drop por método equivalente** — viable si se documenta la metodología de fittings como tabla de longitudes equivalentes verificable.

## 10. Estado de validación final

| Check | Resultado |
|---|---|
| `verify-engines.ts` (batch 1) | 75/75 ok |
| `verify-engines2.ts` (batch 2/3/4) | 174/174 ok |
| `verify-phase1.ts` (regresión F1) | 13/13 ok |
| `audit-seo.ts` | PASS (113 tools, 0 problemas) |
| `audit-registry.ts` | PASS (0 huérfanas, grupos OK, canibalización OK) |
| `tsc --noEmit` | OK |
| `next build` | 137 rutas, 113/113 tools SSG, 0 errores |
| Canonical/schema/robots/sitemap | Verificados en HTML prerenderizado |
| ESLint | No configurado en el proyecto (deuda preexistente, no de esta fase) |
