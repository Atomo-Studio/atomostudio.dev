# SENTINEL AUDIT — Kaba Peluquería

**Auditor:** Sentinel 🛡️
**Fecha:** 2026-05-18 09:24 GMT-4
**Sitio:** [kaba.atomostudio.dev](https://kaba.atomostudio.dev/)

---

## Veredicto Final: ❌ RECHAZADO

El sitio está técnicamente bien construido, pero **no pasa auditoría** por un issue crítico: la galería usa placeholders genéricos (`service1.webp` / `service2.webp` repetidos 9 veces) cuando existen **12 fotos reales de trabajos de Kaba** en `img/`. Esto viola el criterio 9 de Sentinel (Imágenes reales del negocio).

Además, la sección Antes/Después en cortes/index.html también usa placeholders visuales en vez de fotos reales.

---

## Puntaje por Criterio

| # | Criterio | Puntaje (1-10) | Estado |
|---|----------|----------------|--------|
| 1 | **Técnico** | 9/10 | ✅ |
| 2 | **Estructura** | 10/10 | ✅ |
| 3 | **Renderizado** | 8/10 | ⚠️ |
| 4 | **Layout** | 9/10 | ✅ |
| 5 | **No Duplicación** | 10/10 | ✅ |
| 6 | **No Placeholders de Texto** | 7/10 | ⚠️ |
| 7 | **Multi-Página** | 10/10 | ✅ |
| 8 | **Animaciones** | 10/10 | ✅ |
| 9 | **Imágenes** | 2/10 | ❌ **CRÍTICO** |

---

## Issues Críticos (bloquean aprobación)

### 🔴 CR-01: Galería con placeholders genéricos en vez de fotos reales de Kaba
**Archivo:** `galeria/index.html`
**Severidad:** CRÍTICA
**Descripción:** Las 9 imágenes de la galería usan solo 2 archivos genéricos (`service1.webp` y `service2.webp`) repetidos, cuando existen **12 fotos reales** de trabajos de Kaba en `img/` con nombres descriptivos, listas para usar.

**Fotos reales disponibles (12):**
| Archivo | Tipo de contenido (inferido) |
|---|---|
| `kaba_balayage_2.webp` | Balayage |
| `kaba_Bello_balayage.webp` | Balayage |
| `kaba_correccion_color.webp` | Corrección de color |
| `kaba_Chao_canas_hola_luz_Mechas_dorad.webp` | Mechas doradas |
| `kaba_Bello_cambio_peluqueria.webp` | Cambio completo |
| `kaba_Amooo.webp` | Transformación capilar |
| `kaba_Amo_cuando_se_van_como_unas_Barbie.webp` | Trabajo capilar |
| `kaba_aprovechando_ratito.webp` | Trabajo capilar |
| `kaba_Bendiciones_pa_too_el_mundo.webp` | Trabajo capilar |
| `kaba_El_amor_propio_es_el_comienzo_de_t.webp` | Trabajo capilar |
| `kaba_Un_cabello_que_impacta_no_solo.webp` | Trabajo capilar |
| `kaba_Un_detalle_exclusivo_para_una_perso.webp` | Trabajo capilar |

**Impacto:** El sitio promete "más de 300 transformaciones" pero muestra solo 2 imágenes placeholder repetidas. Esto da una impresión de falta de contenido real y desconfianza.

**Acción requerida:** Reemplazar cada `src="../img/service1.webp"` y `src="../img/service2.webp"` con fotos reales de Kaba, asignando cada foto a su categoría correcta (balayage, mechas, uñas). Requiere >5 líneas → **devuelto a Builder 🏗️**.

### 🔴 CR-02: Sección Antes/Después con placeholders visuales
**Archivo:** `cortes/index.html`
**Severidad:** CRÍTICA
**Descripción:** La sección "Antes & Después" muestra dos cajas vacías con emojis 📷 y ✨ como placeholder, en vez de fotos reales de Kaba. Hay comentarios `<!-- TODO: Reemplazar con foto real de Kaba -->` que indican que esto estaba pendiente.

**Impacto:** Una sección clave del sitio (transformaciones) está vacía visualmente. Los clientes potenciales no pueden ver resultados reales.

**Acción requerida:** Insertar fotos reales de transformaciones (before/after) de Kaba en los placeholders. Requiere >5 líneas → **devuelto a Builder 🏗️**.

---

## Issues Menores (no bloquean pero deben corregirse)

### 🟡 MN-01: WhatsApp button muestra texto "(placeholder)"
**Archivo:** `contacto/index.html`
**Severidad:** BAJA
**Detalle:** El botón de WhatsApp dice literalmente "WhatsApp (placeholder)" y la sección de contacto muestra "Número pendiente — contáctanos por AgendaPro".
**Nota:** Se documenta pero **no se rechaza por esto** ya que las instrucciones indican que es aceptable porque el cliente no ha dado el número definitivo.

### 🟡 MN-02: Faltan width/height en nav-logo-img
**Archivo:** Todas las páginas
**Severidad:** BAJA
**Detalle:** El `<img>` del logo en el nav (`<img src="img/logo-oficial.webp" ...>`) no tiene atributos `width`/`height` explícitos. Aunque el logo es pequeño, podría causar un leve Cumulative Layout Shift (CLS).
**Solución:** Agregar `width="130" height="36"` (o dimensiones reales del logo).

### 🟡 MN-03: Sin fotos de uñas en las reales disponibles
**Severidad:** BAJA
**Detalle:** La galería tiene 2 categorías de uñas (Manicura y Pedicura) pero ninguna de las 12 fotos reales parece corresponder a uñas. Puede que no existan aún fotos de trabajos de uñas de Kaba.
**Recomendación:** Considerar si se necesita agregar fotos de uñas o reducir las categorías de filtro temporalmente.

---

## Correcciones Aplicadas

Ninguna. Los issues críticos requieren cambios >5 líneas y contenido editorial (asignación de fotos reales a categorías). Se devuelven a Builder.

---

## Resumen de hallazgos

| Tipo | Cantidad |
|------|----------|
| ✅ Pasaron | 26/35 checks |
| ⚠️ Advertencias | 4 checks |
| ❌ Fallos | 5 checks |
| **🔴 Bloqueantes** | **2** |

---

## Recomendación Final

**❌ No apto para revisión de Mario.**

El sitio es técnicamente excelente — HTML válido, SEO impecable, diseño responsive, animaciones con `prefers-reduced-motion`, estructura multi-página sólida. Forge hizo un buen trabajo en la base técnica.

Sin embargo, **la galería entera usa placeholders genéricos** cuando hay 12 fotos reales esperando ser usadas. Esto es exactamente el tipo de issue que Sentinel debe atrapar: contenido que promete calidad pero no la entrega.

**Pasos para destrabar:**
1. **Builder 🏗️:** Reemplazar todas las referencias a `service1.webp` / `service2.webp` en `galeria/index.html` con fotos reales de Kaba, asignando cada una a su categoría correcta.
2. **Builder 🏗️:** Reemplazar los placeholders de Antes/Después en `cortes/index.html` con fotos reales de transformaciones.
3. **Builder 🏗️ o CEO:** Proveer el número real de WhatsApp de Karla y actualizar el texto del botón y la sección de contacto.
4. **Builder 🏗️:** Evaluar si agregar `width`/`height` al nav logo para evitar CLS.
5. Una vez corregido el issue de la galería, solicitar **reapertura de auditoría Sentinel**.

---

*Auditoría completada por Sentinel 🛡️ — 2026-05-18*
