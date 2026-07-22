/* ════════════════════════════════════════════
   ÁTOMO STUDIO · Base JavaScript
   Scroll animations · WhatsApp · Smooth scroll
   ════════════════════════════════════════════ */

;(function () {
  'use strict'

  // ─── CONFIG ───
  const CONFIG = {
    // Intersection Observer
    observerThreshold: 0.08,
    observerRootMargin: '0px 0px -40px 0px',
    staggerDelay: 80,           // ms between consecutive items
    recheckOnResize: false,     // re-observe after resize if true

    // WhatsApp
    whatsappSelector: '.whatsapp-float, [data-whatsapp]',
    whatsappDefaultMessage: '¡Hola! Quiero más información.',

    // Smooth scroll
    smoothScrollDuration: 800,  // ms
  }

  // ─── DOM REFS (populated on ready) ───
  let $ = {};

  function cacheDom () {
    $.fadeUp   = document.querySelectorAll('.fade-up');
    $.fadeIn   = document.querySelectorAll('.fade-in');
    $.scaleIn  = document.querySelectorAll('.scale-in');
    $.waBtns   = document.querySelectorAll(CONFIG.whatsappSelector);
    $.navLinks = document.querySelectorAll('a[href^="#"]');
    $.nav      = document.querySelector('.nav-glass, nav');
  }

  // ════════════════════════════════════════════
  //  1. INTERSECTION OBSERVER (scroll animations)
  // ════════════════════════════════════════════

  function initScrollAnimations () {
    // Collect all animatable elements, preserving their original order
    const targets = [ ...$.fadeUp, ...$.fadeIn, ...$.scaleIn ];

    if (!targets.length) return;

    const observer = new IntersectionObserver((entries) => {
      // Group new entries by their parent container for staggered reveal
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        // Find sibling index within its parent for stagger
        const parent = el.parentElement;
        const siblings = parent
          ? [ ...parent.querySelectorAll('.fade-up, .fade-in, .scale-in') ]
          : [ el ];
        const idx = siblings.indexOf(el);
        const delay = idx * CONFIG.staggerDelay;

        setTimeout(() => {
          el.classList.add('visible');
        }, delay);

        observer.unobserve(el);
      });
    }, {
      threshold: CONFIG.observerThreshold,
      rootMargin: CONFIG.observerRootMargin,
    });

    targets.forEach((el) => observer.observe(el));
  }

  // ════════════════════════════════════════════
  //  2. WHATSAPP BUTTON HANDLER
  // ════════════════════════════════════════════

  function initWhatsApp () {
    $.waBtns.forEach((btn) => {
      // Skip if already has href (direct link)
      if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') {
        return;
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();

        // Get phone from data attribute or fallback
        const phone   = this.dataset.phone || '';
        const message = this.dataset.message || CONFIG.whatsappDefaultMessage;

        if (!phone) {
          console.warn('[app.js] WhatsApp button missing data-phone attribute');
          return;
        }

        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
      });
    });
  }

  // ════════════════════════════════════════════
  //  3. SMOOTH SCROLL FOR NAVIGATION
  // ════════════════════════════════════════════

  function initSmoothScroll () {
    $.navLinks.forEach((link) => {
      link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        if (href.startsWith('http') || href.startsWith('https')) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navHeight = ($.nav) ? $.nav.offsetHeight : 64;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth',
        });
      });
    });
  }

  // ════════════════════════════════════════════
  //  4. NAV BACKGROUND ON SCROLL
  // ════════════════════════════════════════════

  function initNavScroll () {
    if (!$.nav) return;

    const updateNav = () => {
      if (window.scrollY > 50) {
        $.nav.style.background = 'rgba(6, 6, 12, 0.95)';
      } else {
        $.nav.style.background = 'rgba(6, 6, 12, 0.8)';
      }
    };

    // Debounced version for performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNav();
          ticking = false;
        });
        ticking = true;
      }
    });

    updateNav(); // initial state
  }

  // ════════════════════════════════════════════
  //  5. NAV ACTIVE LINK HIGHLIGHT
  // ════════════════════════════════════════════

  function initActiveNav () {
    const links = document.querySelectorAll('.nav-link');
    if (!links.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px 0px 0px',
    });

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });
  }

  // ════════════════════════════════════════════
  //  INIT
  // ════════════════════════════════════════════

  function ready (fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    cacheDom();
    initScrollAnimations();
    initWhatsApp();
    initSmoothScroll();
    initNavScroll();
    initActiveNav();
  });

})();
