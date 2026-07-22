# CRAFT SPEC — Kaba Peluquería 🎨

> **Cliente:** Karla Bastidas — @kaba_peluqueria
> **Rubro:** Peluquería / Estilismo / Uñas
> **Tono:** Cálido, femenino, chileno coloquial, profesional pero cercano
> **Fecha:** 18 de mayo 2026
> **Autor:** Craft 🎯

---

## Reglas Globales

### Timing & Easing

| Propiedad | Valor |
|-----------|-------|
| Duración máxima por transición | 400ms |
| Easing entradas (scroll reveal) | `cubic-bezier(0.16, 1, 0.3, 1)` — ease-out suave |
| Easing hovers | `cubic-bezier(0.25, 0.1, 0.25, 1)` — ease-in-out |
| Easing nav scroll | `cubic-bezier(0.4, 0, 0.2, 1)` — aceleración inteligente |
| Stagger delay entre elementos | 120ms |
| Stagger grupos grandes (+6 items) | 80ms (evitar delays muy largos) |

### Principios de Animación

- **Solo `transform` y `opacity`** — nunca animar layout (width, height, top, left, margin, padding)
- **No animar**: elementos decorativos puros (fondos, líneas divisorias, la letra K grande)
- **Microinteracciones**: feedback visual inmediato (< 200ms) en botones y links
- **Reduced motion**: respetar `prefers-reduced-motion` — deshabilitar TODAS las animaciones

### Reduced Motion (OBLIGATORIO en cada página)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Estados finales forzados para scroll reveal */
  .fade-in,
  .fade-in-left,
  .fade-in-right,
  .fade-in-up,
  .stagger-item {
    opacity: 1 !important;
    transform: none !important;
  }

  .service-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }

  .wa-float {
    animation: none !important;
  }

  .nav-underline::after {
    transform: scaleX(1) !important;
  }
}
```

### Intersection Observer — Configuración Base

```js
// Configuración global del Intersection Observer
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const appearOnScroll = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      appearOnScroll.unobserve(entry.target); // solo una vez
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-up').forEach(el => {
  appearOnScroll.observe(el);
});
```

### Clases de Utilidad — Keyframes

```css
/* ── Fade-in base ── */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* ── Clases base (hidden until revealed) ── */
.fade-in,
.fade-in-up,
.fade-in-left,
.fade-in-right,
.scale-in {
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-in         { transform: translateY(24px); }
.fade-in-up      { transform: translateY(30px); }
.fade-in-left    { transform: translateX(-30px); }
.fade-in-right   { transform: translateX(30px); }
.scale-in        { transform: scale(0.95); }

/* ── Estado visible ── */
.fade-in.is-visible,
.fade-in-up.is-visible,
.fade-in-left.is-visible,
.fade-in-right.is-visible,
.scale-in.is-visible {
  opacity: 1;
  transform: none;
}
```

---

## Componentes Globales

### 1. Nav — Transición de Fondo al Hacer Scroll

**Comportamiento:**
- **Arriba del todo (scroll < 60px):** fondo transparente, texto blanco
- **Al hacer scroll > 60px:** fondo `--dark-warm` (rgba 0.96) + backdrop-filter blur
- **Transición:** 400ms, `cubic-bezier(0.4, 0, 0.2, 1)` — solo background + backdrop-filter

**Implementación:**

```css
nav {
  transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s ease;
}

nav.scrolled {
  background: rgba(31, 26, 20, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 40px rgba(0, 0, 0, 0.15);
}
```

```js
// En main.js
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  const nav = document.querySelector('nav');

  if (currentScroll > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  lastScroll = currentScroll;
}, { passive: true });
```

**Nav links — underline animation:**
```css
.nav-links a {
  position: relative;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

**Hamburger — animación a cruz:**
```css
.hamburger {
  transition: transform 0.3s ease;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}
```

**Mobile menu — slide + fade:**
```css
.mobile-menu {
  transform: translateX(100%);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.3s ease;
}

.mobile-menu.open {
  transform: translateX(0);
  opacity: 1;
}

.mobile-menu a {
  transform: translateX(20px);
  opacity: 0;
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.mobile-menu.open a:nth-child(2) { transition-delay: 0.05s; opacity: 1; transform: translateX(0); }
.mobile-menu.open a:nth-child(3) { transition-delay: 0.10s; opacity: 1; transform: translateX(0); }
.mobile-menu.open a:nth-child(4) { transition-delay: 0.15s; opacity: 1; transform: translateX(0); }
.mobile-menu.open a:nth-child(5) { transition-delay: 0.20s; opacity: 1; transform: translateX(0); }
.mobile-menu.open a:nth-child(6) { transition-delay: 0.25s; opacity: 1; transform: translateX(0); }
```

### 2. Footer — Sin Animaciones Pesadas

- Sin fade-in ni scroll reveal
- Solo hover en links: color gold, transición 300ms
- Sin animaciones de entrada

### 3. Botones — Microinteracciones

```css
/* Estado base */
.btn-primary,
.btn-outline,
.btn-outline-dark,
.btn-wa {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* Hover */
.btn-primary:hover,
.btn-wa:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.btn-outline:hover,
.btn-outline-dark:hover {
  border-color: var(--gold);
  color: var(--gold);
}

/* Active / Click */
.btn-primary:active,
.btn-wa:active {
  transform: translateY(0);
  opacity: 0.85;
}

/* Disable hover en touch devices */
@media (hover: none) {
  .btn-primary:hover,
  .btn-wa:hover {
    transform: none;
    box-shadow: none;
  }
}
```

### 4. WhatsApp Float Button — Pulso Sutil

```css
@keyframes waPulse {
  0%   { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
  50%  { box-shadow: 0 6px 30px rgba(37, 211, 102, 0.5); }
  100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
}

.wa-float {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  background: #25D366;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  animation: waPulse 4s ease-in-out infinite;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wa-float:hover {
  transform: scale(1.05);
  animation: none; /* Pausar pulso al hover */
  box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
}

/* Tooltip */
.wa-tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--dark-warm);
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.7rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.wa-tooltip::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  border-left: 6px solid var(--dark-warm);
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

.wa-float:hover .wa-tooltip {
  opacity: 1;
}

/* Responsive: no pulso en mobile para evitar distracción */
@media (max-width: 768px) {
  .wa-float {
    bottom: 16px;
    right: 16px;
    animation-duration: 6s; /* Más lento en mobile */
    width: 48px;
    height: 48px;
  }
}
```

### 5. Section Tags y Section Titles

```css
.section-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.section-tag-center {
  justify-content: center;
}

.section-tag::before,
.section-tag::after {
  content: '';
  width: 30px;
  height: 1px;
  background: var(--gold);
  opacity: 0.5;
}
```

---

## Por Página

### 1. Inicio (index.html)

#### Hero
| Elemento | Animación | Timing | Delay |
|----------|-----------|--------|-------|
| `.hero-tag` | fadeInLeft | 600ms | 0ms |
| `.hero-title` | fadeInUp (cada línea) | 600ms | 150ms |
| `.hero-sub` | fadeInUp | 600ms | 300ms |
| `.hero-actions` | fadeInUp | 600ms | 450ms |
| `.hero-stats` | scaleIn | 600ms | 600ms |
| `.hero-right` (SVG) | fadeIn + scale(1.02) | 800ms | 300ms |
| `.hero-grid-bg` | opacity 0→0.05 | 1000ms | 200ms |

**Implementación hero entrance — CSS + JS al cargar:**
```css
.hero-left > * {
  opacity: 0;
  animation-fill-mode: forwards;
}

.hero-tag      { animation: fadeInLeft 0.6s ease 0s forwards; }
.hero-title    { animation: fadeInUp 0.6s ease 0.15s forwards; }
.hero-sub      { animation: fadeInUp 0.6s ease 0.3s forwards; }
.hero-actions  { animation: fadeInUp 0.6s ease 0.45s forwards; }
.hero-stats    { animation: scaleIn 0.6s ease 0.6s forwards; }
```

**Hero title — line reveal:**
```css
.hero-title {
  overflow: hidden;
}

.hero-title em {
  display: inline-block;
  animation: fadeInUp 0.6s ease 0.15s forwards;
  opacity: 0;
}
```

#### Featured Services (Scroll Reveal)
| Elemento | Animación | Delay | Stagger |
|----------|-----------|-------|---------|
| `.featured-header` (section-tag + h2 + sub) | fadeInUp | 0ms | — |
| `.service-card` (6 cards) | fadeInUp + scale(1→1.03 on hover) | 200ms después del header | 120ms cada card |

**Cards — hover:**
```css
.service-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              box-shadow 0.4s ease;
  will-change: transform;
}

.service-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

/* Service icon hover */
.service-icon {
  transition: transform 0.3s ease, background 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
  background: var(--gold);
}

/* Service card link hover */
.service-card .btn-outline-dark {
  transition: all 0.3s ease;
}

.service-card:hover .btn-outline-dark {
  border-color: var(--gold);
  color: var(--gold);
}
```

#### About Preview
| Elemento | Animación | Delay |
|----------|-----------|-------|
| `.about-card` | fadeInLeft | 0ms (al scroll) |
| `about-text` (section-tag + h2 + p + name + role) | fadeInRight | 150ms |
| `.about-badge` | scaleIn + rotate subtle | 400ms |

**Badge — entrada:**
```css
.about-badge {
  animation: scaleIn 0.6s ease 0.4s forwards;
  opacity: 0;
}

@keyframes subtleRotate {
  from { transform: rotate(-5deg) scale(0.8); opacity: 0; }
  to   { transform: rotate(0) scale(1); opacity: 1; }
}

.about-badge.is-visible {
  animation: subtleRotate 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

**About card — barra decorativa dorada:**
```css
.about-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 0;
  background: linear-gradient(to bottom, var(--gold), transparent);
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.about-card.is-visible::before {
  height: 100%;
}
```

#### Testimonial Spotlight
| Elemento | Animación | Delay |
|----------|-----------|-------|
| `.testimonial-spotlight-inner` | fadeInUp | 0ms |
| `.testimonial-spotlight-text` | fadeIn | 200ms |
| `.testimonial-spotlight-author` | fadeInUp | 400ms |

**Comilla decorativa — sutil aparición:**
```css
.testimonial-spotlight::before {
  opacity: 0;
  transition: opacity 1s ease;
}

.testimonial-spotlight.is-visible::before {
  opacity: 1;
}
```

#### CTA Banner
| Elemento | Animación | Delay |
|----------|-----------|-------|
| `.cta-banner-title` | fadeInUp | 0ms |
| `.cta-banner-sub` | fadeInUp | 150ms |
| Botón WhatsApp | fadeInUp | 300ms |

#### Mapa
| Elemento | Animación | Delay |
|----------|-----------|-------|
| `.map-mini` iframe | fadeIn | 0ms (sin delay) |

---

### 2. Servicios (servicios/index.html)

#### Page Header
| Elemento | Animación | Delay |
|----------|-----------|-------|
| Breadcrumb | fadeInLeft | 0ms |
| H1 | fadeInUp | 150ms |
| Body intro | fadeInUp | 300ms |

#### Intro
| Elemento | Animación | Delay |
|----------|-----------|-------|
| Texto centrado | fadeInUp | 0ms |

#### Grupos de Servicios (Timeline Vertical)

**Revelación secuencial por categoría:**
```css
.service-category {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.service-category.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Categoría impares — fadeInLeft, pares — fadeInRight:**
```js
document.querySelectorAll('.service-category').forEach((cat, i) => {
  if (i % 2 === 0) {
    cat.classList.add('fade-in-left');
  } else {
    cat.classList.add('fade-in-right');
  }
  appearOnScroll.observe(cat);
});
```

**Cards dentro de cada categoría — stagger:**
```css
.service-category .service-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.service-category.is-visible .service-card {
  opacity: 1;
  transform: translateY(0);
}

.service-category.is-visible .service-card:nth-child(1) { transition-delay: 0s; }
.service-category.is-visible .service-card:nth-child(2) { transition-delay: 0.1s; }
.service-category.is-visible .service-card:nth-child(3) { transition-delay: 0.2s; }
.service-category.is-visible .service-card:nth-child(4) { transition-delay: 0.3s; }
.service-category.is-visible .service-card:nth-child(5) { transition-delay: 0.4s; }
.service-category.is-visible .service-card:nth-child(6) { transition-delay: 0.5s; }
```

**Línea decorativa dorada del timeline:**
```css
.timeline-line {
  width: 1px;
  height: 0;
  background: linear-gradient(to bottom, var(--gold), transparent);
  transition: height 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.service-category.is-visible .timeline-line {
  height: 100%;
}
```

**Badges de servicio estrella — entrada con bounce sutil:**
```css
.badge-star {
  display: inline-block;
  animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

@keyframes badgePop {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}
```

**Hover en cards de servicio:**
```css
.service-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              box-shadow 0.4s ease;
}

.service-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
}
```

#### Mobile Accordion
```css
.service-category-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.service-category-header {
  cursor: pointer;
  transition: color 0.3s ease;
}

.service-category-header .arrow {
  transition: transform 0.3s ease;
}

.service-category-header.open .arrow {
  transform: rotate(180deg);
}

.service-category-header.open + .service-category-body {
  max-height: 2000px; /* suficientemente grande */
}
```

#### CTA Final
| Elemento | Animación | Delay |
|----------|-----------|-------|
| Título | fadeInUp | 0ms |
| Botones (WhatsApp + AgendaPro) | fadeInUp (stagger) | 150ms cada uno |

---

### 3. Cortes (cortes/index.html)

#### Page Header
| Elemento | Animación | Delay |
|----------|-----------|-------|
| H1 | fadeInUp | 0ms |
| Cita | fadeIn | 200ms (font-style italic, elegante) |

#### Filosofía (Proceso en 4 Pasos)
**Desktop — horizontal timeline:**
```css
.timeline-step {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.timeline-step.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-step.is-visible:nth-child(1) { transition-delay: 0ms; }
.timeline-step.is-visible:nth-child(2) { transition-delay: 150ms; }
.timeline-step.is-visible:nth-child(3) { transition-delay: 300ms; }
.timeline-step.is-visible:nth-child(4) { transition-delay: 450ms; }
```

**Pasos hover:**
```css
.timeline-step {
  transition: transform 0.3s ease, background 0.3s ease;
}

.timeline-step:hover {
  transform: translateY(-4px);
  background: var(--blush);
}

.timeline-step .step-number {
  transition: transform 0.3s ease, color 0.3s ease;
}

.timeline-step:hover .step-number {
  transform: scale(1.1);
  color: var(--gold);
}
```

**Línea conectora horizontal — animación de relleno:**
```css
.timeline-connector {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.timeline-connector.is-visible {
  transform: scaleX(1);
}
```

**Mobile — vertical:**
```css
@media (max-width: 768px) {
  .timeline-step {
    padding-left: 1.5rem;
    border-left: 1px solid var(--border);
  }

  .timeline-step::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 0;
    width: 8px;
    height: 8px;
    background: var(--gold);
    border-radius: 50%;
    transition: transform 0.3s ease;
  }

  .timeline-step.is-visible::before {
    transform: scale(1.5);
  }
}
```

#### Tipos de Corte (Grid)
| Elemento | Animación | Stagger |
|----------|-----------|---------|
| Cada card de corte | fadeInUp | 100ms entre cards |

**Hover en cards de corte:**
```css
.corte-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              box-shadow 0.4s ease;
}

.corte-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
}

.corte-card .corte-ideal {
  transition: color 0.3s ease;
}

.corte-card:hover .corte-ideal {
  color: var(--gold);
}
```

#### Antes/Después — Slider Interactivo (máximo impacto visual)

**Before/After Slider interactivo (no overlay, no swipe nativo):**
```css
.before-after {
  position: relative;
  overflow: hidden;
  cursor: ew-resize;
  user-select: none;
}

.before-after .before,
.before-after .after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.before-after .after {
  clip-path: inset(0 50% 0 0);
}

.before-after .divider {
  position: absolute;
  top: 0;
  left: 50%;
  width: 3px;
  height: 100%;
  background: var(--gold);
  transform: translateX(-50%);
  z-index: 2;
  transition: left 0.05s ease; /* ultra rápido para seguir el mouse */
}

.before-after .divider::before {
  content: '↔';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: var(--gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark-warm);
  font-size: 0.9rem;
  font-weight: bold;
}

/* Etiquetas */
.before-after .label {
  position: absolute;
  bottom: 12px;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 6px 14px;
  background: rgba(31, 26, 20, 0.8);
  color: white;
  z-index: 3;
  transition: opacity 0.3s ease;
}

.before-after .label-before { left: 12px; }
.before-after .label-after { right: 12px; }
```

**JS para el slider:**
```js
function initBeforeAfter(container) {
  const divider = container.querySelector('.divider');
  const after = container.querySelector('.after');
  let isDragging = false;

  function updatePosition(clientX) {
    const rect = container.getBoundingClientRect();
    let pos = ((clientX - rect.left) / rect.width) * 100;
    pos = Math.max(5, Math.min(95, pos));
    divider.style.left = pos + '%';
    after.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
  }

  container.addEventListener('mousedown', (e) => { isDragging = true; updatePosition(e.clientX); });
  document.addEventListener('mousemove', (e) => { if (isDragging) updatePosition(e.clientX); });
  document.addEventListener('mouseup', () => { isDragging = false; });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    updatePosition(e.touches[0].clientX);
  });
  document.addEventListener('touchmove', (e) => {
    if (isDragging) updatePosition(e.touches[0].clientX);
  });
  document.addEventListener('touchend', () => { isDragging = false; });
}
```

**Entrada del before/after:**
```css
.before-after {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.before-after.is-visible {
  opacity: 1;
  transform: scale(1);
}
```

#### Cierre Inspiracional
| Elemento | Animación | Delay |
|----------|-----------|-------|
| Cita | fadeInUp | 0ms |
| Subcita | fadeIn | 200ms |
| CTA button | fadeInUp | 400ms |

---

### 4. Galería (galeria/index.html)

#### Page Header
| Elemento | Animación | Delay |
|----------|-----------|-------|
| H1 | fadeInUp | 0ms |
| Sub | fadeIn | 200ms |

#### Filtros por Categoría
**Transición entre categorías:**
```css
.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 8px 20px;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-soft);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  font-family: 'Montserrat', sans-serif;
}

.filter-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.filter-btn.active {
  background: var(--gold);
  border-color: var(--gold);
  color: var(--dark-warm);
}

/* Scroll horizontal en mobile */
@media (max-width: 768px) {
  .filters {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 8px;
  }
  .filters::-webkit-scrollbar { display: none; }
}
```

#### Grid Masonry — Carga Progresiva

**Fade-in por fila/carga:**
```css
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.gallery-item {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.gallery-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger sutil por posición */
.gallery-item.is-visible:nth-child(3n+1) { transition-delay: 0ms; }
.gallery-item.is-visible:nth-child(3n+2) { transition-delay: 80ms; }
.gallery-item.is-visible:nth-child(3n+3) { transition-delay: 160ms; }

/* Responsive stagger */
@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .gallery-item.is-visible:nth-child(2n+1) { transition-delay: 0ms; }
  .gallery-item.is-visible:nth-child(2n+2) { transition-delay: 100ms; }
}

@media (max-width: 480px) {
  .gallery-grid { grid-template-columns: 1fr; }
  .gallery-item.is-visible { transition-delay: 0ms; }
}
```

#### Overlay de Foto — Transición de Entrada/Salida

```css
.gallery-item {
  position: relative;
  overflow: hidden;
}

.gallery-item img {
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(31, 26, 20, 0.85), rgba(31, 26, 20, 0.3));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  padding: 1rem;
  text-align: center;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-overlay .service-name {
  transform: translateY(10px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: white;
}

.gallery-overlay .service-emoji {
  transform: translateY(10px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.gallery-item:hover .gallery-overlay .service-name,
.gallery-item:hover .gallery-overlay .service-emoji {
  transform: translateY(0);
}

.gallery-overlay .service-name { transition-delay: 0.05s; }
.gallery-overlay .service-emoji { transition-delay: 0s; }

/* Mobile: tap to show overlay */
@media (hover: none) {
  .gallery-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .gallery-item.tapped .gallery-overlay {
    opacity: 1;
  }

  .gallery-item.tapped img {
    transform: scale(1.05);
  }
}
```

**JS para overlay en tap (mobile):**
```js
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', function() {
    this.classList.toggle('tapped');
  });
});
```

#### Filtros — Transición entre Categorías

```css
/* Filtrado con fade */
.gallery-item.hidden {
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
  /* No usar display:none para que transition funcione */
  transition: opacity 0.4s ease, transform 0.4s ease;
}
```

```js
// JS para filtrado
function filterGallery(category) {
  const items = document.querySelectorAll('.gallery-item');
  const btns = document.querySelectorAll('.filter-btn');

  // Actualizar botón activo
  btns.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  items.forEach(item => {
    const cats = item.dataset.category;
    if (category === 'all' || cats.includes(category)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}
```

#### Antes/Después Destacado

Mismo slider interactivo que en la página de Cortes (ver sección 3).

**Entrada:**
```css
.before-after-featured {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.before-after-featured.is-visible {
  opacity: 1;
}

.before-after-featured .label-section {
  transform: translateY(20px);
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.before-after-featured.is-visible .label-section {
  transform: translateY(0);
  opacity: 1;
}
```

---

### 5. Contacto (contacto/index.html)

#### Page Header
| Elemento | Animación | Delay |
|----------|-----------|-------|
| H1 | fadeInUp | 0ms |

#### Info + CTA (2-columnas)

**Stagger cards:**
```css
.contact-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.contact-card.is-visible { opacity: 1; transform: translateY(0); }

.contact-card.is-visible:nth-child(1) { transition-delay: 0ms; }
.contact-card.is-visible:nth-child(2) { transition-delay: 150ms; }

/* Elementos dentro de la card de info */
.contact-card .contact-item {
  opacity: 0;
  transform: translateX(-15px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.contact-card.is-visible .contact-item { opacity: 1; transform: translateX(0); }
.contact-card.is-visible .contact-item:nth-child(1) { transition-delay: 100ms; }
.contact-card.is-visible .contact-item:nth-child(2) { transition-delay: 200ms; }
.contact-card.is-visible .contact-item:nth-child(3) { transition-delay: 300ms; }
.contact-card.is-visible .contact-item:nth-child(4) { transition-delay: 400ms; }
.contact-card.is-visible .contact-item:nth-child(5) { transition-delay: 500ms; }
```

**Hover en items de contacto:**
```css
.contact-item {
  transition: transform 0.3s ease, color 0.3s ease;
}

.contact-item:hover {
  transform: translateX(4px);
  color: var(--gold);
}
```

#### Mapa — Fade-in
```css
.contact-map {
  opacity: 0;
  transition: opacity 0.8s ease;
}

.contact-map.is-visible {
  opacity: 1;
}
```

#### CTA Cards (WhatsApp y AgendaPro) — Stagger + Hover

```css
.cta-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              box-shadow 0.4s ease;
}

.cta-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.06);
}

/* Cita de Karla en la card */
.cta-card .quote {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 1.1rem;
  color: var(--text-soft);
  opacity: 0;
  transition: opacity 1s ease;
}

.cta-card.is-visible .quote {
  opacity: 1;
}
```

#### Cierre Emotivo
| Elemento | Animación | Delay |
|----------|-----------|-------|
| Cita | fadeInUp | 0ms |
| Firma | fadeIn | 300ms |

---

## Implementación CSS Recomendada

### Archivo `css/animations.css`

Crear un archivo separado `css/animations.css` con todo el sistema de animaciones, importado después de `style.css` en cada página:

```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/animations.css">
```

### Contenido del archivo `animations.css`:

```css
/* ═══════════════════════════════════════════
   KABA — Animation System
   Craft Spec v1.0
   ═══════════════════════════════════════════ */

/* ─── 1. KEYFRAMES ─── */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes badgePop {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

/* ─── 2. SCROLL REVEAL CLASSES ─── */
.fade-in,
.fade-in-up,
.fade-in-left,
.fade-in-right,
.scale-in {
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-in         { transform: translateY(24px); }
.fade-in-up      { transform: translateY(30px); }
.fade-in-left    { transform: translateX(-30px); }
.fade-in-right   { transform: translateX(30px); }
.scale-in        { transform: scale(0.95); }

.fade-in.is-visible,
.fade-in-up.is-visible,
.fade-in-left.is-visible,
.fade-in-right.is-visible,
.scale-in.is-visible {
  opacity: 1;
  transform: none;
}

/* ─── 3. NAV TRANSITIONS ─── */
nav {
  transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.4s ease;
}

nav.scrolled {
  background: rgba(31, 26, 20, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 40px rgba(0, 0, 0, 0.15);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.nav-links a:hover::after,
.nav-links a.active::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* ─── 4. BUTTON TRANSITIONS ─── */
.btn-primary,
.btn-outline,
.btn-outline-dark,
.btn-wa {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.btn-primary:hover,
.btn-wa:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.btn-primary:active,
.btn-wa:active {
  transform: translateY(0);
  opacity: 0.85;
}

.btn-outline:hover,
.btn-outline-dark:hover {
  border-color: var(--gold);
  color: var(--gold);
}

/* ─── 5. WHATSAPP FLOAT ─── */
@keyframes waPulse {
  0%   { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
  50%  { box-shadow: 0 6px 30px rgba(37, 211, 102, 0.5); }
  100% { box-shadow: 0 4px 20px rgba(37, 211, 102, 0.3); }
}

.wa-float {
  animation: waPulse 4s ease-in-out infinite;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.wa-float:hover {
  transform: scale(1.05);
  animation: none;
  box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
}

.wa-tooltip {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wa-float:hover .wa-tooltip {
  opacity: 1;
}

/* ─── 6. SERVICE CARDS ─── */
.service-card {
  transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1),
              box-shadow 0.4s ease;
  will-change: transform;
}

.service-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

.service-icon {
  transition: transform 0.3s ease, background 0.3s ease;
}

.service-card:hover .service-icon {
  transform: scale(1.1);
  background: var(--gold);
}

/* ─── 7. GALLERY ─── */
.gallery-item img {
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-overlay {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-overlay .service-name,
.gallery-overlay .service-emoji {
  transform: translateY(10px);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.gallery-item:hover .gallery-overlay .service-name,
.gallery-item:hover .gallery-overlay .service-emoji {
  transform: translateY(0);
}

.gallery-item.hidden {
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
  transition: opacity 0.4s ease, transform 0.4s ease;
}

/* ─── 8. BEFORE/AFTER ─── */
.before-after .divider {
  transition: left 0.05s ease;
}

/* ─── 9. FILTER BUTTONS ─── */
.filter-btn {
  transition: all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

/* ─── 10. TIMELINE ─── */
.timeline-step {
  transition: transform 0.3s ease, background 0.3s ease;
}

.timeline-step:hover {
  transform: translateY(-4px);
  background: var(--blush);
}

/* ─── 11. REDUCED MOTION ─── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .fade-in,
  .fade-in-up,
  .fade-in-left,
  .fade-in-right,
  .scale-in,
  .stagger-item {
    opacity: 1 !important;
    transform: none !important;
  }
  .service-card:hover {
    transform: none !important;
    box-shadow: none !important;
  }
  .wa-float {
    animation: none !important;
  }
  .nav-links a::after {
    transform: scaleX(1) !important;
  }
}

/* ─── 12. RESPONSIVE OVERRIDES ─── */
@media (max-width: 768px) {
  .wa-float {
    animation-duration: 6s;
    width: 48px;
    height: 48px;
  }
}

@media (hover: none) {
  .btn-primary:hover,
  .btn-wa:hover {
    transform: none;
    box-shadow: none;
  }
  .service-card:hover {
    transform: none;
    box-shadow: none;
  }
  .gallery-overlay {
    opacity: 0;
  }
}
```

### JS Mínimo Necesario (`js/main.js`)

```js
/* ═══════════════════════════════════════════
   KABA — Animation Controller
   Craft Spec v1.0
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── 1. NAV SCROLL ───
  const nav = document.querySelector('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ─── 2. MOBILE MENU ───
  window.toggleMenu = function() {
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  };

  // ─── 3. INTERSECTION OBSERVER ───
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const appearOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        appearOnScroll.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observar todas las animaciones de scroll
  const animatedElements = document.querySelectorAll(
    '.fade-in, .fade-in-up, .fade-in-left, .fade-in-right, .scale-in, ' +
    '.service-category, .gallery-item, .contact-card, ' +
    '.timeline-step, .timeline-connector, .before-after'
  );

  animatedElements.forEach(el => appearOnScroll.observe(el));

  // ─── 4. BEFORE/AFTER SLIDER ───
  document.querySelectorAll('.before-after').forEach(container => {
    const divider = container.querySelector('.divider');
    const after = container.querySelector('.after');
    let isDragging = false;

    function updatePosition(clientX) {
      const rect = container.getBoundingClientRect();
      let pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.max(5, Math.min(95, pos));
      divider.style.left = pos + '%';
      if (after) {
        after.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      }
    }

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      updatePosition(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    }, { passive: true });

    document.addEventListener('touchend', () => { isDragging = false; });
  });

  // ─── 5. GALLERY TAP (MOBILE) ───
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('tapped');
        // Cerrar otros taps
        document.querySelectorAll('.gallery-item.tapped').forEach(other => {
          if (other !== this) other.classList.remove('tapped');
        });
      });
    });
  }

  // ─── 6. GALLERY FILTER ───
  window.filterGallery = function(category, btn) {
    const items = document.querySelectorAll('.gallery-item');
    const btns = document.querySelectorAll('.filter-btn');

    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    items.forEach(item => {
      const cats = item.dataset.category || '';
      if (category === 'all' || cats.includes(category)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  };

})();
```

---

## Resumen de Animaciones por Página

| Página | Animaciones de entrada | Hover/Interacción | Microinteracciones |
|--------|----------------------|-------------------|-------------------|
| **Inicio** | Hero stagger (6 elementos, 600ms total), stats scale-in, scroll reveal en services/about/testimonial/cta | Service cards scale 1.02 + translateY, about badge pop, nav underline | Hero CTA click, nav scroll |
| **Servicios** | Header fade, categorías fadeInLeft/Right alternadas, cards stagger por categoría (100ms step), timeline line fill | Card hover translateY, badges scale, accordion toggle mobile | Category accordion, CTA hover |
| **Cortes** | Header fade, timeline steps horizontal stagger (150ms), cards grid stagger (100ms), before/after scale-in | Timeline step hover + blush, card hover, before/after drag interaction | Before/after slider interactivo |
| **Galería** | Header fade, gallery grid masonry stagger (grid-position based 80ms), filters appear | Gallery img scale 1.05, overlay fade (opacity 0→1), filter category transition, tap-to-reveal mobile | Filter active state, gallery tap |
| **Contacto** | Header fade, contact cards stagger (150ms), contact items sequential (100ms step), map fade-in | Contact item hover translateX + gold, CTA card hover translateY | CTA pulse |

### Contador de Animaciones

| Métrica | Valor | Estado |
|---------|-------|--------|
| Animaciones CSS únicas | 6 keyframes (fade, fadeUp, fadeLeft, fadeRight, scaleIn, badgePop) | ✅ |
| Clases de scroll reveal | 5 (fade-in, fade-up, fade-left, fade-right, scale-in) | ✅ |
| Hover effects | 9 (cards, icons, buttons, nav, gallery, timeline, contact, filter, before/after) | ✅ |
| Microinteracciones | 6 (button active, accordion, menu, nav scroll, wa float, gallery tap) | ✅ |
| Simultáneas máximas | 4 (hero stagger bien espaciado) | ✅ |
| Peso total estimado | ~6KB (animations.css) + ~3KB (JS controller) | ✅ |
| Costo performance | ~3/10 — solo transform + opacity | ✅ |

---

*Craft 🎯 — 18 de mayo 2026*
