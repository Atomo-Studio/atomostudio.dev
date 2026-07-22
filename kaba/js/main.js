/* ═══════════════════════════════════════════
   KABA — Animation Controller (Craft Spec v1.0)
   ═══════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── 1. NAV SCROLL ───
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ─── 2. MOBILE MENU ───
  window.toggleMenu = function() {
    const menu = document.getElementById('mobileMenu');
    const hamburger = document.querySelector('.hamburger');
    if (menu) {
      menu.classList.toggle('open');
      if (hamburger) hamburger.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    }
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
        after.style.clipPath = 'inset(0 ' + (100 - pos) + '% 0 0)';
      }
    }

    container.addEventListener('mousedown', function(e) {
      isDragging = true;
      updatePosition(e.clientX);
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging) updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', function() { isDragging = false; });

    container.addEventListener('touchstart', function(e) {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches[0]) {
        updatePosition(e.touches[0].clientX);
      }
    }, { passive: true });

    document.addEventListener('touchend', function() { isDragging = false; });
  });

  // ─── 5. GALLERY TAP (MOBILE) ───
  if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.gallery-item').forEach(function(item) {
      item.addEventListener('click', function() {
        this.classList.toggle('tapped');
        document.querySelectorAll('.gallery-item.tapped').forEach(function(other) {
          if (other !== this) other.classList.remove('tapped');
        }.bind(this));
      });
    });
  }

  // ─── 6. GALLERY FILTER ───
  window.filterGallery = function(category, btn) {
    var items = document.querySelectorAll('.gallery-item');
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    items.forEach(function(item) {
      var cats = item.dataset.category || '';
      if (category === 'all' || cats.indexOf(category) !== -1) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  };

})();
