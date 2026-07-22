# DESIGN SPEC — Kaba Peluquería

> **Cliente:** Karla Bastidas — @kaba_peluqueria
> **Rubro:** Peluquería / Estilismo / Uñas
> **Tono:** Cálido, femenino, chileno coloquial, profesional pero cercano
> **Fecha:** 18 de mayo 2026
> **Autor:** Design 🎨

---

## A. Paleta de Colores

### Validación de Paleta Actual

La paleta actual (`#0e0e0e` negro carbón + `#c9a96e` dorado + `#f8f4ef` crema + `#fdfaf6` blanco cálido) es **visualmente sólida** pero está orientada a un **salón de lujo aspiracional**. Kaba, según el scout report, tiene un vibe **barrio-boutique**: cálido, femenino, rubios beige, tonos nude, toques dorados/rosa. La paleta actual es demasiado oscura y distante para eso.

**Decisión:** Ajustar la paleta — mantener el oro como ancla, pero:
1. Reemplazar el negro carbón (`#0e0e0e`) por un **espresso/marrón oscuro cálido** para fondos oscuros
2. Agregar un **rose gold / blush** como acento secundario
3. Usar **beige y nude** como fondos principales (en lugar de warm-white/cream)
4. Agregar un **rubio beige claro** como tono de acento que conecta con los trabajos de Kaba

### Variables CSS — Paleta Ajustada

```css
:root {
  /* ── Fondos principales ── */
  --ivory:        #fffbf5;   /* Fondo general — blanco cálido con leve nude */
  --beige-base:   #f5ede3;   /* Fondo de secciones alternas — beige suave */
  --cream-warm:   #eae0d0;   /* Fondo de tarjetas/destacados — crema más profundo */

  /* ── Acentos ── */
  --gold:         #c9a96e;   /* MANTENER — el ancla dorada funciona */
  --gold-light:   #e8d5b0;   /* MANTENER — hover dorado claro */
  --rose-gold:    #dbb0a0;   /* NUEVO — rosa dorado suave, acento femenino */
  --blush:        #f0ded8;   /* NUEVO — blush muy suave para fondos de cards */
  --blonde-beige: #d4c8b5;   /* NUEVO — tono rubio beige, conecta con servicios */

  /* ── Oscuros ── */
  --espresso:     #2c241b;   /* NUEVO — marrón oscuro cálido (reemplaza #0e0e0e) */
  --dark-warm:    #1f1a14;   /* NUEVO — casi negro cálido para fondos ultra oscuros */

  /* ── Texto ── */
  --text-dark:    #2c241b;   /* Ajustado — marrón oscuro cálido */
  --text-soft:    #7a6b5d;   /* Ajustado — gris cálido para body text */
  --text-light:   #a89888;   /* NUEVO — gris beige claro para metadata */

  /* ── Bordes ── */
  --border:       rgba(201, 169, 110, 0.25);   /* MANTENER */
  --border-soft:  rgba(219, 176, 160, 0.3);    /* NUEVO — borde rose gold */

  /* ── Estados ── */
  --wa-green:     #25D366;   /* MANTENER */
}
```

### Justificación Cromática

| Color | HEX | Rol | Razón |
|-------|-----|-----|-------|
| `--ivory` | `#fffbf5` | Fondo general | Blanco cálido que evoca los tonos beige/nude del feed de Kaba |
| `--beige-base` | `#f5ede3` | Secciones alternas | Conecta visualmente con el rubio beige, servicio estrella |
| `--gold` | `#c9a96e` | Ancla principal | El dorado funciona como lujo accesible — boutique no ostentoso |
| `--rose-gold` | `#dbb0a0` | Acento femenino | Rosa dorado suave que aporta calidez sin caer en rosa infantil |
| `--espresso` | `#2c241b` | Fondos oscuros | Marrón oscuro cálido mucho más armónico con rubios/beige que el negro puro |
| `--dark-warm` | `#1f1a14` | Hero / nav | Casi negro pero con temperatura cálida — evita el contraste frío |

### Aplicación por Sección

| Sección | Fondo | Texto | Acento |
|---------|-------|-------|--------|
| Hero | `--dark-warm` | `--ivory` / `--gold` | Grid dorado tenue + letra K grande |
| Secciones claras | `--ivory` | `--text-dark` | `--gold` en tags y títulos |
| Secciones alternas | `--beige-base` | `--text-dark` | `--rose-gold` en bordes |
| Tarjetas / cards | `white` / `--blush` | `--text-dark` | `--gold` en hover |
| Testimonial | `--espresso` | `--ivory` | `--gold` en comilla decorativa |
| Footer | `--dark-warm` | `--text-light` | `--gold` en títulos de columna |
| CTA banner | `--cream-warm` | `--text-dark` | `--gold` en itálicas |

---

## B. Tipografía

### Stack Actual (validado — funciona)

| Uso | Fuente | Pesos | Razón |
|-----|--------|-------|-------|
| **Display / Headings** | `Playfair Display` | 400, 400 italic, 700 | Serif elegante y femenino, perfecto para el tono boutique |
| **Body / UI** | `Montserrat` | 300, 400, 500, 600 | Sans-serif limpia que contrasta bien con la display |
| **Testimonials / Quotes** | `Cormorant Garamond` | 300, 300 italic, 400, 600 italic | Serif más liviana y romántica para citas |

### Fallback Chain

```css
--font-display: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
--font-body:     'Montserrat', 'Helvetica Neue', 'Arial', sans-serif;
--font-quote:    'Cormorant Garamond', 'Georgia', 'Times New Roman', serif;
```

### Jerarquía Tipográfica Responsive

| Elemento | Mobile (375px) | Tablet (768px) | Desktop (1200px+) | Font | Letter-spacing |
|----------|---------------|----------------|-------------------|------|----------------|
| **Hero H1** | `clamp(2.8rem, 10vw, 3.5rem)` | `clamp(3.5rem, 6vw, 5rem)` | `clamp(5rem, 7vw, 6.5rem)` | Playfair 400 | `-0.02em` |
| **Page Header H1** | `2.2rem` | `3rem` | `4rem` | Playfair 400 | `-0.01em` |
| **Section H2** | `1.8rem` | `2.2rem` | `clamp(2rem, 3.5vw, 3.2rem)` | Playfair 400 | `0` |
| **Card Title H3** | `1.1rem` | `1.2rem` | `1.3rem` | Playfair 400 | `0` |
| **Body** | `0.85rem` | `0.9rem` | `0.95rem` | Montserrat 400 | `0.02em` |
| **Body Small** | `0.75rem` | `0.8rem` | `0.8rem` | Montserrat 400 | `0.03em` |
| **Label / Tag** | `0.6rem` | `0.65rem` | `0.7rem` | Montserrat 500 | `0.25em` UPPER |
| **Quote** | `1.1rem` | `1.3rem` | `1.5rem` | Cormorant 300 italic | `0` |
| **Nav link** | — | — | `0.7rem` | Montserrat 500 | `0.2em` UPPER |
| **CTA Button** | `0.7rem` | `0.7rem` | `0.75rem` | Montserrat 600 | `0.2em` UPPER |

### Línea de Base (Line Height)

| Elemento | Line Height |
|----------|-------------|
| Hero H1 | `0.95` |
| H2 | `1.1` |
| H3 | `1.3` |
| Body | `1.8` |
| Body small | `1.7` |

---

## C. Jerarquía Visual por Página

### 1. Inicio (index.html)

**Layout general:** Full-width hero → Featured services (3-column grid) → About preview (2-column) → Testimonial spotlight → CTA banner → Mini-map → Footer

#### Hero Section
- **Layout:** Split vertical (izquierda texto, derecha visual decorativo)
  - **Mobile:** Hero texto ocupa 100%, lado derecho se oculta
- **Elemento focal:** Título con el em `Belleza` en dorado — es el gancho visual
- **Jerarquía:**
  ```
  H1 (Hero) → Tagline arriba → Body subtítulo → Botones CTA → Stats abajo
  ```
- **Tratamiento de la letra K grande:** Reducir opacidad a `0.03` para que sea más sutil
- **Stats:** 3 stats abajo a la izquierda, con números grandes en Playfair dorado
- **Imagen:** No hay foto real — el SVG decorativo funciona como placeholder. **Futuro:** reemplazar SVG con fotografía real de Kaba o collage de trabajos

#### Featured Services
- **Layout:** Grid 3-columnas (→ 2 en tablet → 1 en mobile)
- **Jerarquía:**
  ```
  Section tag → H2 "Expertos en transformar tu look" → Body subtítulo
  → Card grid: icono → H3 → body desc → link "Ver detalle"
  ```
- **Espaciado entre secciones:** `8rem` en desktop, `5rem` en mobile
- **Elemento focal:** La card del centro en hover (se levanta 6px + sombra)
- **Iconos:** Emoji como íconos (funcional, pero idealmente reemplazar con SVG inline del color gold)

#### About Preview
- **Layout:** 2-columnas (izquierda: card oscura con datos, derecha: texto)
- **Elemento focal:** Card con el badge circular "10+ años" en dorado — es el gancho visual de esta sección
- **Jerarquía:**
  ```
  Badge circular → Card title (cursiva) → Body card
  → Section tag → H2 → Body párrafos → Nombre → Rol
  ```
- **Espaciado:** Gap `6vw` entre columnas

#### Testimonial Spotlight
- **Layout:** Full-width centrado, comilla decorativa gigante al fondo
- **Elemento focal:** El texto de la cita en Cormorant Garamond cursiva
- **Autor:** Avatar circular con inicial + nombre + detalle

#### CTA Banner
- **Layout:** Full-width centrado
- **Jerarquía:**
  ```
  H2 con em en gold → Body → Botón WhatsApp (verde)
  ```
- **Botón WhatsApp:** Fondo `#25D366`, letra blanca — se destaca del resto

---

### 2. Servicios (servicios/index.html)

**Layout general:** Page header → Intro section → Servicios agrupados por categoría (timeline/accordion) → CTA

#### Page Header
- **Layout:** Full-width con fondo `--dark-warm`, grid de fondo decorativo
- **Jerarquía:**
  ```
  Breadcrumb → H1 con em en gold → Body intro
  ```
- **Tratamiento:** Similar al hero pero más compacto — `padding-top: nav-height + 4rem`

#### Intro
- **Layout:** Centrado, máximo 600px de ancho
- **Texto:** "Todo lo que necesitas para brillar, en un solo lugar."
- **Espaciado:** `4rem` abajo del header, `4rem` arriba de servicios

#### Grupos de Servicios (por categoría)

**Layout: Timeline vertical en desktop, accordion en mobile**

Cada categoría tiene:
1. **Encabezado de categoría:** Emoji + nombre de categoría en H2 con Playfair
2. **Línea decorativa:** Línea vertical dorada que conecta los servicios
3. **Cards de servicio:** Alternando izquierda/derecha en desktop, apiladas en mobile

**Card de servicio:**
```
┌────────────────────────────────────────────┐
│  Título del servicio (H3 — Playfair)        │
│  Descripción (Montserrat body — 0.85rem)    │
│  ⭐ badge "Servicio estrella" (si aplica)    │
│  Precio: "Consultar precio"                  │
└────────────────────────────────────────────┘
```

**Jerarquía visual completa:**
```
H1 "Todo lo que necesitas para brillar"
  ↓
Section tag emoji + "Cortes de Cabello" (H2 con línea decorativa)
  ↓
  Card 1: Corte Personalizado
  Card 2: Corte + Fusión Creativa
  ↓
Section tag emoji + "Coloración" (H2)
  ↓
  Card: Balayage Rubio Beige ⭐
  Card: Balayage Rubio Cobrizo
  Card: Balayage Rubio Sutil
  Card: Mechas Iluminadas
  Card: Mechas Doradas / Chao Canas 👑
  Card: Mechas Creativas / Animal Print 🐆
  Card: Rubias Perfectas — Platinadas
  Card: Rubias Perfectas — Rubio Beige
  Card: Corrección de Color 🔧
  Card: Tintes Completos
  ↓
Section tag emoji + "Manicure & Pedicure" (H2)
  ↓
  Card: Manicura
  Card: Pedicura
  ↓
Section tag emoji + "Tratamientos Capilares" (H2)
  ↓
  Card: Tratamientos Capilares Profesionales
  ↓
CTA: "¿No sabes cuál elegir?" + botones WhatsApp / AgendaPro
```

**Espaciado entre categorías:** `5rem`
**Espaciado entre cards dentro de categoría:** `1.5rem`
**Background alternado:** Fondo `--ivory` para categorías pares, `--beige-base` para impares

#### Mobile Variant (accordion)

En mobile, colapsar las categorías como acordeones:
- Título de categoría clickeable con flecha/ícono de expansión
- Al hacer click, se despliega la lista de servicios
- Animación de altura suave (max-height transition)

---

### 3. Cortes (cortes/index.html)

**Layout general:** Page header → Filosofía (proceso paso a paso) → Tipos de corte (grid) → Cita inspiracional → CTA

#### Page Header
- **Layout:** Full-width oscuro con grid decorativo
- **Título:** "El corte perfecto existe — y es el que nace de ti"
- **Sub:** Cita de Kaba: *"Un cabello que impacta no solo cambia tu look… cambia tu energía."*

#### Filosofía (Proceso en 4 pasos)
- **Layout:** Timeline horizontal en desktop, vertical en mobile
- **4 pasos:** Te escuchamos → Analizamos → Diseñamos → Te transformamos
- **Cada paso:** Número grande en gold (Playfair) + icono + título + descripción breve
- **Línea conectora:** Línea dorada horizontal entre pasos en desktop, vertical en mobile
- **Elemento focal:** El paso activo se resalta con fondo `--blush`

```
[1. Te escuchamos] —— [2. Analizamos] —— [3. Diseñamos] —— [4. Te transformamos]
     🙋‍♀️                   👀                 ✂️                  ✨
```

#### Tipos de Corte (Grid)
- **Layout:** Grid 3-columnas (→ 2 en tablet → 1 en mobile)
- **Card de corte:** Ideal para... + descripción corta
- **Jerarquía por card:**
  ```
  Nombre del corte (H3) → "Ideal para..." (label dorado) → Body descripción
  ```
- **Antes/Después:** Una fila destacada con 2 cards lado a lado (antes / después) — placeholder para fotos reales

#### Cierre Inspiracional
- **Layout:** Full-width centrado sobre fondo `--cream-warm`
- **Texto:** *"El amor propio es el comienzo de todo lo bonito en tu vida."*
- **Y un buen corte es una excelente forma de empezar.* + CTA button
- **Espaciado:** `4rem` arriba y abajo

---

### 4. Galería (galeria/index.html)

**Layout general:** Page header → Intro emotivo → Filtros por categoría → Grid de fotos → Antes/Después destacado → CTA

#### Page Header
- **Título:** "Más de 300 transformaciones y contando. ✨"
- **Sub:** "Esto no es stock. Esto es Kaba real."

#### Filtros por Categoría
- **Layout:** Tabs horizontales (scroll horizontal en mobile)
- **Categorías:** Todas | Balayage | Antes/Después | Mechas | Uñas | Rubias Perfectas
- **Estado activo:** Fondo `--gold`, texto `--dark-warm`
- **Estado inactivo:** Borde `--border`, texto `--text-soft`
- **Animación:** Transición suave de color al cambiar de filtro (CSS transition 0.3s)

#### Grid de Fotos (Masonry)
- **Layout:** Masonry grid 3-columnas con gutter `1rem` (→ 2 en tablet → 1 en mobile)
- **Cada foto:** Aspect-ratio variable (según la foto real)
- **Hover overlay:** Capa semitransparente con el nombre del servicio + emoji
  - Overlay: fondo `--espresso` al 80%, texto blanco
  - Transición: opacity 0 → 1 al hover, 0.4s ease
- **Caption:** Abajo de cada foto, texto descriptivo en Montserrat pequeño (0.7rem)
- **Lazy loading:** `loading="lazy"` en todas las imágenes

#### Antes/Después Destacado
- **Layout:** Dual panel — izquierda "Antes", derecha "Después"
- **Divisor:** Línea vertical dorada o swipe interactive
- **Título:** "Nuestra sección favorita 💛"
- **Slider interactivo (ideal):** En desktop, un before/after slider con comparador. En mobile, dos fotos lado a lado con etiquetas
- **Caption:** Descripción emotiva debajo

**Categorías de fotos y prioridad:**

| Categoría | Prioridad | Cantidad sugerida | Decoración visual |
|-----------|-----------|-------------------|-------------------|
| Balayage | 🔴 Alta | 6-8 fotos | Tag "⭐ Servicio estrella" |
| Antes/Después | 🔴 Alta | 4-6 comparaciones | Slider antes/después |
| Mechas | 🟡 Media | 4-6 fotos | Tag "✨ Creativo" |
| Uñas | 🟡 Media | 2-4 fotos | Tag "💅" |
| Rubias Perfectas | 🟡 Media | 3-4 fotos | Tag "🌟" |

---

### 5. Contacto (contacto/index.html)

**Layout general:** Page header → Info 2-columnas → Horarios → Mapa → CTA WhatsApp

#### Page Header
- **Título:** "¿Lista para brillar? Te esperamos en Kaba. 💛"

#### Info + Formulario (2-columnas)
- **Layout:** Izquierda (60%): info de contacto y horarios | Derecha (40%): formulario o CTA directa

**Lado izquierdo — Tarjeta de Contacto:**
```
┌────────────────────────────────────────┐
│ 📍 Carelmapu 2402, Pedro Aguirre Cerda  │
│ 📱 WhatsApp: [botón]                     │
│ 📸 @kaba_peluqueria                      │
│ 📘 Peluquería Kaba                       │
│                                        │
│ 🕐 Horarios                             │
│ Lun–Sáb: 8:00–19:00                     │
│ Dom: Cerrado                            │
└────────────────────────────────────────┘
```

- **Tarjeta:** Fondo `--ivory`, borde `--border`, padding `2.5rem`

**Lado derecho — CTA directa (no formulario, Kaba usa AgendaPro):**
```
┌────────────────────────────────────────┐
│  💬 Agenda por WhatsApp                 │
│  📅 Agenda en AgendaPro                │
│                                        │
│  "No olviden regalonearse un poquito"   │
│  — Karla 💖                            │
└────────────────────────────────────────┘
```

#### Mapa
- **Layout:** Full-width, aspect-ratio 3:1 (16:9 en mobile)
- **Google Maps embed:** Misma dirección, filtro sepia suave para armonizar con la paleta
- **Espaciado:** Sin padding — el mapa toca los bordes de la pantalla

#### Cierre Emotivo
- **Layout:** Full-width centrado, fondo `--cream-warm`
- **Texto:** Cita inspiracional + firma de Karla
- **Espaciado:** `3rem` arriba y abajo

---

## D. Componentes Reutilizables

### Nav
| Propiedad | Valor |
|-----------|-------|
| Fondo | `rgba(31, 26, 20, 0.96)` (dark-warm con 0.96) |
| Blur | `backdrop-filter: blur(20px)` |
| Altura | `80px` desktop, `64px` mobile |
| Logo | Imagen + texto "KABA" en Playfair gold |
| Links | Montserrat 500, `0.7rem`, `0.2em` letter-spacing, uppercase |
| Hover link | Color gold + underline animation (scaleX 0→1) |
| CTA nav | Fondo gold, texto black, sin underline |
| Mobile | Hamburger → menú fullscreen con Playfair 2rem |

### Footer

| Grid | Proporción |
|------|-----------|
| Columnas | `2fr 1fr 1fr 1fr` (→ `1fr 1fr` tablet → `1fr` mobile) |
| Logo | Playfair 2rem, gold |
| Links | Montserrat 0.75rem, color rgba(255,255,255,0.35), hover gold |
| Títulos columna | Montserrat 0.6rem, uppercase, gold |
| Bottom | Flex row (→ column mobile), borde sutil arriba |

### Botones

| Botón | Default | Hover | Active |
|-------|---------|-------|--------|
| **btn-primary** | Fondo gold, texto black | Fondo gold-light, translateY(-2px) | Opacity 0.9 |
| **btn-outline** | Borde rgba(255,255,255,0.3), texto claro | Borde gold, texto gold | Gold sólido |
| **btn-outline-dark** | Borde gold 0.25, texto dark | Borde gold, texto gold | Gold sólido |
| **btn-wa** | Fondo #25D366, texto white | #1da851, translateY(-2px) | Opacity 0.9 |
| **btn-outline-rose** (NUEVO) | Borde rose-gold 0.25, texto dark | Borde rose-gold, texto rose-gold | Rose-gold sólido |

Especificaciones comunes:
- Padding: `14px 36px`
- Font: Montserrat 600, `0.7rem`, `0.2em` letter-spacing, uppercase
- Transition: `all 0.3s ease`
- Border-radius: `0` (rectos — estética boutique)

### Cards de Servicio

| Propiedad | Valor |
|-----------|-------|
| Fondo | white |
| Borde | `1px solid var(--border)` |
| Padding | `2.5rem` (→ `1.5rem` mobile) |
| Hover | `translateY(-6px)`, `box-shadow: 0 20px 50px rgba(0,0,0,0.08)` |
| Icono | 60x60px, fondo gold, emoji centrado |
| Título | Playfair 1.2rem |
| Transición | `all 0.4s ease` |

### Badges

| Badge | Uso | Estilo |
|-------|-----|--------|
| **⭐ Servicio estrella** | Balayage Rubio Beige | Fondo gold, texto dark, Montserrat 0.5rem uppercase |
| **👑 Chao Canas** | Mechas Doradas | Fondo rose-gold, texto dark |
| **🔧 Corrección** | Corrección de Color | Fondo blush, texto dark |
| **💅** | Uñas | Emoji inline |
| **10+ años** | About badge | Círculo 100px, gold, sombra |

---

## E. Sistema Responsive

### Breakpoints

| Breakpoint | Ancho | Comportamiento clave |
|------------|-------|---------------------|
| Desktop | `≥ 1200px` | Layout completo, grid 3-columnas, timeline horizontal |
| Tablet | `768px – 1199px` | Grid 2-columnas, nav compacto, hero columnas apiladas |
| Mobile | `375px – 767px` | Grid 1-columna, hamburger menu, padding reducido, accordion servicios |
| Small mobile | `< 375px` | Misma estructura mobile, fuentes mínimas aseguradas con clamp() |

### Cambios clave por breakpoint

**768px (tablet → mobile switch):**
- Nav: `--nav-height: 64px`, hamburger visible, links ocultos
- Hero: grid → 1 columna, lado derecho oculto, stats abajo
- About: grid → 1 columna, card va arriba
- Servicios grid: 3 → 2 → 1 columna
- Galería masonry: 3 → 2 → 1 columna
- Footer: 4 → 2 → 1 columna
- Mapa: aspect-ratio 3:1 → 16:9

**480px (mobile small):**
- Botones: full-width (stack vertical en hero)
- Timeline de cortes: horizontal → vertical
- Filters galería: scroll horizontal en vez de wrap
- Espaciados: reducir padding secciones de 8vw → 5vw

### Comportamientos Mobile First

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Hero | Texto full-width, no side image | Texto full-width, no side image | Split 50/50 |
| Servicios | Accordion colapsable | Grid 2-columnas | Timeline + grid 3-col |
| Galería | Masonry 1-col | Masonry 2-col | Masonry 3-col |
| Filtros galería | Scroll horizontal | Wrap | Row centrado |
| Timeline cortes | Vertical, cards apiladas | Vertical, cards apiladas | Horizontal con línea |
| Cartas servicios | Apiladas, 1 por fila | 2 por fila | 3 por fila |

### Animaciones Responsive

| Animación | Desktop | Mobile |
|-----------|---------|--------|
| `fade-in` (scroll reveal) | Sí, stagger progresivo | Sí, sin stagger (todas juntas) |
| Hover cards (translateY) | `-6px` | Deshabilitado (touch) |
| WA float bounce | Sí | Sí (con padding abajo extra) |
| Hover overlay galería | Opacity 0→1 | Tap para mostrar overlay |
| Nav underline | ScaleX animation | No aplica (hamburger) |

### Reduced Motion

Todas las animaciones deben respetar `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in {
    opacity: 1;
    transform: none;
  }
  .service-card:hover {
    transform: none;
  }
  .wa-float {
    animation: none;
  }
}
```

---

## F. Iconografía

| Contexto | Tipo | Dónde |
|----------|------|-------|
| Nav | Logo SVG + texto | Esquina superior izquierda |
| Cards de servicio | Emoji (→ SVG inline futuro) | Centro de cada card |
| Redes sociales | SVG simple (IG, FB) | Footer y sección contacto |
| WhatsApp flotante | SVG inline (ícono de WA) | Esquina inferior derecha |
| Tags de categoría | Emoji decorativo | Encabezados de sección |
| Botones CTA | Emoji inline | Dentro de botones (💬, 📅) |
| Before/After | SVG de comparador | Galería |
| Check / bullet | SVG simple gold | Timeline de cortes |

**Nota:** Los emojis funcionan como placeholder inmediato. En versión 2.0 considerar migrar a SVG inline para consistencia cross-browser.

---

## G. Tono Visual General

| Aspecto | Directriz |
|---------|-----------|
| Temperatura | CÁLIDA — evitar grises fríos, azules, negros puros |
| Densidad visual | AIREADA — mucho espacio blanco/ivory entre secciones |
| Contraste | SUAVE — evitar contrastes violentos |
| Textura | Sutil — el noise overlay actual funciona, mantenerlo en 0.03 |
| Bordes | FINOS — 1px, semitransparentes, nunca bordes gruesos |
| Sombras | LIGERAS — solo en hover de cards, nunca sombras duras |
| Fotos | REALES — sin stock photos, solo trabajos de Kaba |
| Tipografía | ELEGANTE pero LEGIBLE — Playfair para títulos, Montserrat para cuerpo |

---

## H. Performance Budget

| Recurso | Límite | Estado actual |
|---------|--------|---------------|
| Google Fonts | 3 families | ✅ Actual: 3 (Playfair + Montserrat + Cormorant) |
| CSS | < 50KB | ✅ ~14KB |
| JS | < 20KB | ✅ Mínimo |
| Animaciones simultáneas | ≤ 5 | ✅ Scroll reveal + hover cards |
| Animaciones "caras" | 0 | ✅ No hay animaciones de paint/layout pesadas |
| Imágenes | Lazy load | ✅ Todas con `loading="lazy"` |
| Costo total animaciones | ≤ 5/10 | ✅ ~3/10 |

---

## I. Checklist de Accesibilidad (WCAG AA)

- ✅ Contraste: texto dark (#2c241b) sobre ivory (#fffbf5) → ratio > 7:1
- ✅ Contraste: texto gold sobre dark-warm → ratio > 4.5:1 (usar gold-light para cuerpo pequeño)
- ✅ Focus states: todos los interactive elements tienen outline
- ✅ Alt text: todas las imágenes deben tener alt descriptivo
- ✅ Reduced motion: implementado via prefers-reduced-motion
- ✅ Semantic HTML: nav, section, h1-h3, footer
- ✅ Skip link: agregar `skip-to-content` al inicio del body
- ✅ Botones: mínimo 44x44px target size

---

## ⏱️ Tiempo Estimado

- **Análisis y lectura de inputs:** ✅ Completo
- **Validación de paleta:** ✅ Completo
- **Definición de jerarquía visual por página:** ✅ Completo
- **Sistema de componentes:** ✅ Completo
- **Especificación responsive:** ✅ Completo
- **Tiempo total invertido:** ~35 minutos

---

*Design 🎨 — 18 de mayo 2026*
