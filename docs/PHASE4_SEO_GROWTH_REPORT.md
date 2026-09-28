# Phase 4 — SEO Growth basado en Search Console (informe final)

**Fecha:** 2026-09-28 · **Fuente:** Google Search Console, export oficial `Performance on Search` de la propiedad `https://ingcalc.site`.

## 1. Estado inicial

- **113 herramientas**, 8 categorías vivas, 146 páginas estáticas, sitemap 131 URLs, canonical/schema/breadcrumbs automáticos.
- Regresión previa en verde: 285 engine checks, audit-seo, audit-registry, `tsc`, `build`.
- El sitio se publicó/indexado por primera vez el **16-09-2026** → la ventana "últimos 28 días" contiene datos efectivos del **16 al 25 de septiembre de 2026 (10 días)**, no 28 completos. Limitación estructural: **la muestra es pequeña** y las posiciones medias reflejan un sitio recién indexado, sin historia ni autoridad.

## 2. Datos de Search Console

| Métrica | Valor (16–25 sep 2026) |
|---|---|
| Clicks | 2 (1 btu-calculator, 1 degree-day-energy-calculator) |
| Impressions | 1,354 totales (833 EE.UU., 109 UK, 56 Australia…) |
| CTR medio | ~0.15% |
| Posición media | ~58 (rango de páginas 1.3–95) |
| Queries únicas registradas | ~460 |
| Páginas con impresiones | ~67 |

**Limitaciones declaradas:** ventana efectiva de solo 10 días; sin datos de "Aparición en búsquedas" (export vacío); el GSC no exporta el mapeo query→URL (asociaciones hechas por similitud query↔slug, marcadas como inferencia); CTR de 0% en casi todas las filas porque las posiciones medias altas (58–90) rara vez generan impresiones visibles.

## 3. Análisis de las queries reales

Distribución por familia temática (queries de GSC agrupadas semánticamente):

- **Engine displacement** (~90 imp acumuladas en 15+ variantes: cubic inch, CID, cc, bore/stroke): la familia de impresiones más grande del sitio → `engine-displacement-calculator` (149 imp, pos. 71).
- **Voltage drop** (~60 imp, 20+ variantes incl. NEC y 3-phase): `voltage-drop-calculator` (115 imp, pos. 58).
- **Solar kWh** (~55 imp, 12 variantes): `solar-panel-output-calculator` (86 imp, pos. 48).
- **Wire resistance AWG** (~30 imp): `wire-resistance-calculator` (77 imp, pos. 52).
- **Resistor color code** (~25 imp, 12 variantes): `resistor-color-code-calculator` (69 imp, pos. 71.7).
- **Energy cost** (~30 imp, 15 variantes): `energy-cost-calculator` (68 imp, pos. 58.6) — con las mejores posiciones individuales del sitio: "kwh price calculator" pos. 7.3, "kwh cost calculator" pos. 9.3, "how to calculate electricity cost from watts" pos. 9.7.
- **Air changes per hour** (~15 imp, 8 variantes, pos. media ~17): la página ya cubre ACH en title/keywords/formula → sin gap.
- **Transformer sizing** (~20 imp): página en pos. 82–96, fuera de rango accionable.
- Queries no cubiertas por el catálogo (sin evidencia suficiente para crear nada): load testing, dielectric heating, anode, tapping torque, belleville washer — 1–11 imp cada una.

## 4. Winner pages (con los criterios objetivos solicitados)

| Priority | URL | Impressions | Clicks | CTR | Position | Query count (familia) | Main opportunity | Reason |
|---|---|---|---|---|---|---|---|---|
| HIGH | /tools/mechanical/engine-displacement-calculator | 149 | 0 | 0% | 71.05 | ~15 | Cubrir variantes CID/cubic-inch en title/desc | Mayor volumen de impresiones; familia de queries más grande (~90 imp en variantes CI/CID/cc); la página es relevante pero su title solo decía "CC" |
| HIGH | /tools/electrical/energy-cost-calculator | 68 | 0 | 0% | 58.63 | ~15 | Conservar las posiciones top (7–10) existentes | Las mejores posiciones del sitio (3 queries a pos. 7–10 con 17 imp acumuladas); no tocar title que ya funciona, solo refuerzo menor |
| MEDIUM | /tools/electrical/voltage-drop-calculator | 115 | 0 | 0% | 58.04 | ~20 | Posición — contenido ya excelente | Muchas impresiones pero posición media 58: el contenido/NEC ya está cubierto; requiere autoridad, no más keywords. KEEP (monitorizar) |
| MEDIUM | /tools/electrical/wire-resistance-calculator | 77 | 0 | 0% | 52.29 | ~6 | Toda su familia de queries es AWG-céntrica | El title no decía "AWG"; FAQs ya existen para sus queries top (12 AWG, 4/0 Al) |
| MEDIUM | /tools/solar-energy/solar-panel-output-calculator | 86 | 0 | 0% | 47.95 | ~12 | Ya está en pos. ~19 en la query principal | "solar panels kwh calculator" pos. 18.9: cerca de la página 1; contenido ya cubre kWh/day. KEEP (monitorizar) |
| LOW | /tools/electrical/generator-sizing-calculator | 12 | 0 | 0% | 11.92 | ~4 | Mejor posición real del sitio | "generator sizing calculator" pos. 3.0 — title ya actualizado para reflejar exactamente esa query ganadora |
| LOW | /tools/mechanical/gear-ratio-calculator | 44 | 0 | 0% | 15.5 | ~3 | Mejor posición media de una herramienta | Pos. 15.5 ya con content completo → KEEP AS IS, dejar madurar |
| LOW | /tools/solar-energy/battery-charge-time-calculator | 22 | 0 | 0% | 12.5 | ~2 | Posición 12.5 con 22 imp | Posición 12.5, title/desc/FAQ ya correctos → KEEP AS IS |
| KEEP | /tools/hvac/airflow-cfm-calculator | 27 | 0 | 0% | 55.37 | ~8 (ACH) | Ninguno — ya cubierto | Title/keywords/formula ya incluyen "Air Changes per Hour" explícitamente |
| KEEP | /tools/hvac/btu-calculator | 28 | 1 | 3.57% | 44.54 | ~5 | Primera página con clic real | KEEP AS IS |
| KEEP | /tools/hvac/wind-chill-calculator | 3 | 0 | 0% | 1.33 | — | Ya es #1 en su query | Demostrar que no todo se toca |

## 5. Cambios implementados (con evidencia)

| URL | Evidence (GSC real) | Before | Change | Reason |
|---|---|---|---|---|
| /tools/mechanical/engine-displacement-calculator | 149 imp, pos. 71; familia: "engine cubic inch calculator" 8 imp, "cid calculator" 7, "cubic inch calculator engine" 7, "calculate cubic inches engine" 7, +10 variantes CI/CID | Title: "Engine Displacement Calculator — Bore, Stroke & CC" | Title: "— CC, CID & Cubic Inches"; description ahora incluye "cubic inches (CID) and CI" | La variante CI/CID concentra ~50 imp que el title no reflejaba; suma al title la intención dominante sin stuffing (1 keyword family, sin repetir) |
| /tools/electrical/generator-sizing-calculator | "generator sizing calculator" 6 imp, **pos. 3.0** — la mejor posición real del sitio | Title: "Generator Size Calculator — Running & Starting Load"; keywords sin "sizing" | Title: "Generator Sizing Calculator — What Size Do I Need?"; keywords: "generator sizing calculator", "what size generator do i need", "generator sizing formula" | Google ya nos rankea pos. 3 para "sizing"; el title decía "Size". Alinear exactamente la query ganadora maximiza CTR en la posición donde más se nos ve |
| /tools/electrical/wire-resistance-calculator | 77 imp, pos. 52; queries: "4/0 awg aluminum resistance ohms per 1000 ft" 29 imp (pos. 80), "awg resistance calculator", "copper resistance vs temperature calculator", "wire resistance" | Title sin "AWG"; description sin temperatura | Title: "— AWG Copper & Aluminum"; description añade "with temperature correction" | El 100% de su familia de queries es AWG-céntrica; la query top (29 imp) incluye AWG + temperature context, ya cubierto por el motor pero invisible en metadata |
| /tools/electrical/energy-cost-calculator | "kwh price calculator" pos. 7.3, "kwh cost calculator" pos. 9.3, "how to calculate electricity cost from watts" pos. 9.7 | (sin cambios — título ya contiene "kWh") | Verificado y mantenido | Las mejores posiciones del sitio dependen de un title que ya incluye "kWh" — no tocar lo que funciona |

**Total: 3 title/description modificados. 0 slugs cambiados. 0 URLs nuevas. 0 herramientas nuevas. 0 motores tocados. 0 FAQs artificiales** (se evaluó solar-tilt y airflow-cfm: sus FAQs ya existían, no había gap real).

## 6. Pages left untouched (KEEP AS IS) y por qué

1. **voltage-drop-calculator** (115 imp): el contenido ya es de referencia NEC completa; su posición media (58) es un problema de autoridad de dominio nuevo, no de contenido. Añadir keywords no lo movería.
2. **solar-panel-output-calculator** (86 imp, pos. 18.9 en su query principal): ya casi en página 1; dejar madurar y medir en el siguiente ciclo GSC.
3. **gear-ratio** (15.5), **battery-charge-time** (12.5), **wind-chill** (1.33), **btu** (tiene clic), **airflow-cfm/ACH** (cubierto), **duct-velocity**, **tap-drill** (34.7 en "tapping torque calculator" — query distinta, sin evidencia de intención de herramienta tap-drill), **degree-day-energy** (1 clic, 10% CTR — funciona).
4. Páginas de categoría y guías: sin impresiones significativas aún (electrical guide 9 imp pos. 46; hvac guide 2 imp pos. 4.5) — demasiado pronto para juzgar, no se tocan.

## 7. Canibalización detectada

| Query family | URL A | URL B | Evidence | Action |
|---|---|---|---|---|
| "kwh price/cost calculator" (pos. 7–9) | energy-cost-calculator | cooling-cost-calculator | GSC asigna las impresiones de coste a energy-cost; cooling-cost tiene sus propias queries (SEER/AC) | **Sin acción** — intenciones distintas (electricidad general vs aire acondicionado) |
| "air changes per hour" (pos. 17) | airflow-cfm-calculator | duct-velocity-calculator | Las impresiones ACH apuntan a airflow-cfm, que ya las cubre en title | **Sin acción** |
| "solar calculator kwh" family | solar-panel-output-calculator | solar-savings-calculator | panel-output captura las de producción; savings captura payback | **Sin acción** |

0 casos reales de canibalización con evidencia. No se fusionó ni movió ninguna URL.

## 8. Internal linking

Sin cambios: audit-registry PASS (0 huérfanas, related contextuales verificados). Las páginas optimizadas ya tenían inbound links ≥1 de sus clusters.

## 9. Technical SEO tras los cambios

Build regenerado y verificado: canonical, schema (WebApplication+FAQPage+BreadcrumbList), sitemap 131 URLs (sin cambios — no hay URLs nuevas), sin duplicados de title (audit-seo PASS con los 3 nuevos titles: longitudes 62, 61, 60 ≤65, únicos).

## 10. Validación

| Check | Resultado |
|---|---|
| verify-engines (75) | PASS |
| verify-engines2 (197) | PASS |
| verify-phase1 (13) | PASS |
| audit-seo | PASS — 113 tools, 0 duplicados, 0 thin |
| audit-registry | PASS — 0 huérfanas |
| `tsc --noEmit` | OK |
| `next build` | ✓ 146/146 páginas, 0 warnings |
| Sitemap/canonical/schema | Verificados en HTML prerenderizado |

## 11. Remaining opportunities (requieren más datos, NO acción inmediata)

1. **Posiciones 11–20 con poca muestra** (gear-ratio 15.5, battery-charge-time 12.5, air-changes ~17, "displacement calculator" 14.25): re-evaluar con 60–90 días de datos; si la posición se sostiene, un refuerzo de contenido interno podría empujarlas a página 1.
2. **energy-cost-calculator** en posiciones 7–10 con 0 clics: posiblemente SERP feature o snippet poco atractivo. Revisar CTR real cuando haya >100 imp en esas queries.
3. **Queries informacionales** ("voltage drop formula", "how to calculate..."): el contenido howItWorks/formula ya existe; evaluar en el próximo ciclo si merece una sección "Formula" con anchor.
4. **Queries sin cobertura en el catálogo** (dielectric heating, load testing, tapping torque): 1–11 imp cada una — sin evidencia suficiente para crear herramientas (y esta fase lo prohíbe por defecto).

## 12. Recomendaciones de monitorización

1. **Semana 2–4 post-deploy:** comparar impressions/position de las 3 páginas optimizadas (engine-displacement, generator-sizing, wire-resistance) contra la línea base documentada arriba.
2. **CTR de generator-sizing** en pos. ~3: es la métrica más sensible al cambio de title.
3. **Nuevas variantes CI/CID** que empiecen a mostrar la página de engine-displacement en posiciones <50.
4. Repetir este análisis con ventana de 90 días cuando el sitio tenga ~3 meses de indexación.
5. Considerar CI de los audits (sigue pendiente de fases anteriores).

## 13. Conclusión

Con 10 días de datos y 1,354 impresiones, la evidencia justificaba exactamente **3 cambios de metadata** — y nada más. Todas las demás páginas con tracción o ya cubrían su intención (se verificó leyendo sus definiciones) o necesitan autoridad/tiempo, no más keywords. El criterio "si una página no tiene evidencia suficiente, déjala tranquila" se aplicó literalmente: 10+ páginas con impresiones quedaron explícitamente como KEEP AS IS con su motivo documentado.
