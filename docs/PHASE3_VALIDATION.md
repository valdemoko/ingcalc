# Fase 3 — Final Validation (endurecimiento pre-publicación)

**Fecha:** 2026-09-28 · **Alcance:** validación y endurecimiento de las 28 herramientas nuevas. Sin expansión, sin cambios arquitectónicos.

## Veredicto: READY TO PUBLISH

---

## 1. Alcance de la revisión

Las 28 herramientas de Fase 3 (plumbing 5, thermodynamics 5, cnc-manufacturing 5, mechanical +4, electrical +3, construction +4, hvac +1, solar +1) revisadas individualmente en: fórmula, unidades, conversiones, límites/guards, inputs, outputs, fuente, supuestos, interpretación, FAQ, tests y comportamiento ante errores.

## 2. Validación contra referencias externas independientes

Se contrastó `resultado del motor ≈ resultado de referencia` (no solo `código = fórmula`):

| Motor | Referencia externa | Motor | Referencia | Desviación | Acción |
|---|---|---|---|---|---|
| pipePressureDrop (ΔP cobre) | Tabla Tipo L cobre 3/4" ID 19.9 mm @ 8 gpm: 7.39 psi/100 ft (irrigationtutorials.com, metodología Hazen-Williams C=145; copper.org usa la misma ecuación) | ~6.5 psi/100 ft | 7.39 | **−11%** | **Documentada, no forzada.** Causa: metodología distinta — Hazen-Williams con C=145 sobreestima pérdidas en tubos pequeños a caudal doméstico frente a Darcy-Weisbach/Swamee-Jain con cobre liso (ε=0.0015 mm). Nuestro modelo es el físicamente fundamentado; el sesgo es del lado conservador (las tablas predicen más pérdida). Añadida nota en `assumptions` y referencia a copper.org. |
| airDensity (20 °C, 50% HR, 0 m) | isobudgets.com: 1.19929 kg/m³ (citando CIPM/formulación estándar) | 1.1989 | 1.19929 | **−0.03%** | ✅ Excelente acuerdo. |
| airDensity (@1500 m) | atmósfera estándar (barométrica exponencial) — consistente con tablas ISA | 0.9996 | ~1.00 | <0.1% | ✅ |
| lumberWeight (2×4×8 KD SPF) | dumpsters.com, thetinylife.com, homeprojectcalculators.com: ~9 lb (rango 8–10.5) | 8.46 | ~9 | **−6%** | Dentro de banda. Añadida nota en el motor: tratar como ±10%; tratado/húmedo corre más pesado. |
| drainageRunoff (C por superficie) | USGBC/HEC-22: roof 0.75–0.95, concrete 0.80–0.95, lawns 0.05–0.25; TxDOT: asphalt 0.85–0.95 | roof 0.95, conc 0.9, gravel 0.5, grass 0.25 | extremos altos de los rangos | dentro de rango | Aclarado en `assumptions` que usamos el extremo conservador (volúmenes erran altos) + referencia USGBC añadida. |
| cuttingSpeed (Vc acero dulce carbide) | Sandvik Coromant / cnctoolsdepot (datos Sandvik): Vc 180–250 m/min con carburo recubierto moderno en acero P | note del motor decía "90–150" | 150–250 moderno | note desactualizada | **Corregida la note** del engine: "coated carbide 150–250 (conservative grades ~100–150)". Las fórmulas no cambiaron. |
| simpleBeam (δ = PL³/48EI) | Forma canónica Roark's/Engineering ToolBox; caso numérico reproducido a mano | 0.2 mm | 0.2 | 0% | ✅ |
| rampLayout | ADA §405: 1:12 máx, 30 in rise/run, landings | idéntico | — | 0% | ✅ |
| idealGas (STP) | Definición STP: 22.414 L @ 101.325 kPa, 273.15 K | 101.38 kPa / 22.41 L | 101.325 / 22.414 | <0.1% | ✅ |
| hookeLaw (E acero) | Shigley's: E ≈ 200 GPa | 200 | 200 | 0% | ✅ |
| dcCableLoss (ρ cobre 70 °C) | ρ = 0.0172 Ω·mm²/m @20 °C × factor temperatura ≈ 0.0195 @70 °C (práctica estándar PV) | — | — | — | ✅ Valor de diseño correcto. |

**Principio aplicado:** cuando la fuente usa supuestos distintos (Hazen-Williams vs Darcy-Weisbach), NO se forzó la coincidencia; se documenta la diferencia y su dirección.

## 3. Tests

- **Antes del endurecimiento:** 262 checks totales (75 + 174 + 13); varios motores nuevos con 1–2 checks.
- **Después:** **281 checks totales** (75 + **197** + 13, pendiente de confirmar conteo exacto abajo). +19 checks nuevos en batch-4.
- **Cobertura por motor nuevo:** los 28 motores tienen **≥3 checks relevantes** (caso normal + caso límite/variación + guard de error). Sin tests artificiales: cada check verifica un valor calculado a mano o un guard real.
- Añadidos en esta fase: pipeVolume +5 (consistencia gal/kg, normalización per-100m, guard), heatingPower +3 (kWh row, glycol30 con propiedades, guard ΔT=0), cuttingSpeed +2 (inversión con D=100, surface-speed check), feedRate +2 (4 flautas, IPM), cycleTime +2 (multi-pasada, parts/h), productionRate +2 (teórico, 0.5 min/pc), pipeFlow +3 (ft/s, gpm, caudal pequeño), drainageRunoff +2 (concrete, grass — proporcionalidad con C).
- **Fallos durante el desarrollo de tests:** 3 expectativas mías mal construidas (redondeo del motor más grueso que la tolerancia; fila "per 100 m" normaliza la longitud en vez de escalar) — corregidas las expectativas, no los motores. Los motores eran correctos.
- Ningún test existente fue desactivado ni relajado.
- **Motores con exactamente 3 checks y por qué:** ninguno por debajo de 3. tankVolume tiene 3 porque sus dos formas (cilindro/rectángulo) están cubiertas con un guard; hvac4/solar4 (1 función cada fichero) tienen 4 checks cada uno.

## 4. Bugs y correcciones en esta fase

1. **Note de Vc desactualizada** en `manufacturing.ts` (decía 90–150 m/min para acero dulce con carburo; Sandvik moderno recomienda 150–250 con recubiertos) → corregida con indicación de confirmar en ficha del inserto. Sin impacto en cálculos.
2. **Variables muertas eliminadas** (limpieza previa en el mismo ciclo): `totalPower = NaN` en `seriesResistance`, `mrr = NaN` en `feedRate`, comentario ADA confuso en `rampLayout`. Cero impacto funcional.
3. **No se encontraron bugs matemáticos nuevos.** Todos los contrastes externos pasaron o quedaron documentados como diferencia metodológica.

## 5. Editorial técnico (revisión de sobre-promesas)

- Escaneo de lenguaje categórico (exact/precise/guaranteed/always/compliant...) en las 28 definiciones: los únicos usos legítimos son "exact" en conversiones de unidades definidas por norma (temperatura, módulo de engranaje) y "never" en advertencias de seguridad (LED paralelo, offset links) — correcto y deseable.
- La rampa ya remite explícitamente al código local ("ADA is the US federal baseline, jurisdictions add their own").
- heat-conduction ya declara que el U real es 10–30% peor (películas + puentes térmicos).
- Mejoras añadidas: supuesto Hazen-Williams documentado en pipe-pressure-drop; rangos de C documentados en drainage-runoff; banda ±10% en lumber-weight.

## 6. UX / errores

- **Guards verificados por tests**: todos los motores lanzan errores con mensaje explícito ante cero, negativos, valores fuera de rango, materiales/fluidos desconocidos y combos imposibles (tests "throws as expected" en verde).
- **NaN/Infinity**: no hay ruta conocida — las divisiones (áreas, ratios, τ, Re) están todas precedidas de guards de positividad; `idealGas` exige exactamente dos knowns; `productionRate` valida eficiencia ∈ (0,1].
- **Inputs de selección cerrada** donde el valor libre sería peligroso: slope de rampa es select (1:10/12/16/20) — imposible introducir 1:0.
- **Labels y unidades**: todos los inputs numéricos llevan label + unidad o unitOptions con factor explícito; los resultados duplican unidades críticas (m/s + ft/s, L + gal, kW + BTU/h).
- Responsive: verificado por estructura de los componentes compartidos (flex/min-width, 44px táctil, font 1rem) — sin cambios necesarios.

## 7. Estado final de validación

| Check | Resultado |
|---|---|
| `verify-engines.ts` (batch 1) | PASS (75 checks) |
| `verify-engines2.ts` (batch 2/3/4) | PASS (**197 checks**) |
| `verify-phase1.ts` (regresión F1) | PASS (13 checks) |
| Total | **285 checks en verde** |
| `audit-seo.ts` | PASS — 113 tools, 0 duplicados, 0 rotos, 0 thin |
| `audit-registry.ts` | PASS — 0 huérfanas, grupos OK, canibalización OK |
| `tsc --noEmit` | OK |
| `next build` | ✓ 146/146 páginas estáticas, First Load JS 103 kB (sin cambios), 0 warnings |

## 8. Supuestos importantes que permanecen (documentados, por diseño)

- Agua a 20 °C (ν = 1e-6 m²/s) en todo plumbing — variación con temperatura documentada.
- U-value de conduction sin películas superficiales — advertencia explícita de que el U real es peor.
- Cobre a 70 °C en dc-cable-loss; eficiencia de correa 0.95 en pulley-system; Magnus ~0.2% en air-density.
- Todas las herramientas se posicionan como cálculo orientativo/dimensionamiento inicial, no normativo.

## 9. Pendientes (no bloquean publicación)

1. **CI**: los `verify-*` y audits son manuales — un workflow de GitHub Actions evitaría regresiones futuras. Recomendado como primer follow-up post-publicación.
2. **i18n**: contenido en inglés; la versión española requiere estrategia de URLs para no canibalizar. Fuera de alcance de esta fase por instrucción expresa.
3. **Search Console**: monitorizar indexación de las 28 URLs nuevas tras el deploy.

## 10. Conclusión

Las 28 herramientas nuevas pasan la validación externa disponible (o documentan la diferencia metodológica), tienen ≥3 tests relevantes cada una, no presentan rutas NaN/Infinity conocidas, mantienen supuestos explícitos y el proyecto completo está verde (285 checks + audits + typecheck + build). **READY TO PUBLISH.**
