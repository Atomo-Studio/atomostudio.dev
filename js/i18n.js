/**
 * Átomo Studio — i18n Multi-Language Runtime
 * Handles auto-detection, localStorage persistence, and DOM translation
 * Supports: es_CL, es_ES, en_US, fr_FR, pt_BR
 */
(function() {
  'use strict';

  const SUPPORTED_LANGS = ['es_CL', 'es_ES', 'en_US', 'fr_FR', 'pt_BR'];
  const DEFAULT_LANG = 'es_CL';
  const STORAGE_KEY = 'atomo_lang';

  let currentLang = DEFAULT_LANG;
  let translations = {};
  let fallbackTranslations = {};

  /** Normalize browser language to our format */
  function normalizeLang(lang) {
    if (!lang) return null;
    const l = lang.replace('-', '_');
    for (const s of SUPPORTED_LANGS) {
      if (l === s || l.startsWith(s.split('_')[0] + '_')) return s;
    }
    // Partial match: es → es_CL, en → en_US, pt → pt_BR, fr → fr_FR
    const prefix = l.split('_')[0];
    const map = { es: 'es_CL', en: 'en_US', pt: 'pt_BR', fr: 'fr_FR' };
    return map[prefix] || null;
  }

  /** Detect preferred language */
  function detectLang() {
    // 1. localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    // 2. Browser language
    if (navigator.language) {
      const norm = normalizeLang(navigator.language);
      if (norm) return norm;
    }

    // 3. HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
      const norm = normalizeLang(htmlLang);
      if (norm) return norm;
    }

    return DEFAULT_LANG;
  }

  /** Load translation JSON — try /locales/ first, fall back to i18n/ */
  async function loadLang(lang) {
    // Map internal codes to locale file names
    const codeMap = {
      'es_CL': 'es', 'es_ES': 'es', 'en_US': 'en',
      'fr_FR': 'fr', 'pt_BR': 'pt-BR'
    };
    const fileName = codeMap[lang] || lang.split('_')[0];

    // Try 1: /locales/ (root-level structure, project-wide)
    try {
      const resp = await fetch(`/locales/${fileName}.json?_=${Date.now()}`);
      if (resp.ok) return await resp.json();
    } catch (_) {}

    // Try 2: relative i18n/ (per-page fallback, backward compat)
    try {
      const resp = await fetch(`i18n/${lang}.json?_=${Date.now()}`);
      if (resp.ok) return await resp.json();
    } catch (e) {
      console.warn(`[i18n] Failed to load ${lang}:`, e);
    }

    return null;
  }

  /** Translate a text string by looking up the key */
  function translate(text, targetLang) {
    const clean = text.trim();
    if (!clean) return text;

    // Direct key lookup
    const data = targetLang === 'es_CL' ? fallbackTranslations : translations;
    for (const [key, val] of Object.entries(data)) {
      if (val === clean) return clean; // Already matches
    }

    // Try matching by value (reverse lookup)
    const esCL = window.__i18n_es_cl || {};
    for (const [key, val] of Object.entries(esCL)) {
      if (val === clean) {
        return translations[key] || clean;
      }
    }

    return text; // No translation found
  }

  /** Translate meta tags */
  function translateMeta() {
    const metaTags = {
      'description': 'átomo_studio_web_ia_para_pymes_chilenas',
      'og:description': 'átomo_studio_web_ia_para_pymes_chilenas',
      'og:title': 'átomo_studio_web_ia_para_pymes_chilenas',
      'twitter:description': 'átomo_studio_web_ia_para_pymes_chilenas'
    };

    document.querySelectorAll('meta[name], meta[property]').forEach(el => {
      const name = el.getAttribute('name') || el.getAttribute('property');
      if (metaTags[name] && translations[metaTags[name]]) {
        el.setAttribute('content', translations[metaTags[name]]);
      }
    });
  }

  /** Translate title tag */
  function translateTitle() {
    const titleKey = Object.keys(window.__i18n_es_cl || {}).find(
      k => window.__i18n_es_cl[k] === document.title
    );
    if (titleKey && translations[titleKey]) {
      document.title = translations[titleKey];
    }
  }

  /** Translate elements with data-i18n attribute */
  function translateElements() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[key]) {
        // Replace inner HTML, preserving any child elements (icons, etc.)
        // If the element has only one text node, replace it entirely
        if (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
          el.childNodes[0].textContent = translations[key];
        } else if (el.childElementCount === 0) {
          el.textContent = translations[key];
        } else {
          // Element has mixed content — replace text nodes only
          el.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              const t = node.textContent.trim();
              const mappedKey = Object.keys(window.__i18n_es_cl || {}).find(
                k => window.__i18n_es_cl[k] === t
              );
              if (mappedKey && translations[mappedKey]) {
                node.textContent = translations[mappedKey];
              }
            }
          });
        }
      }
    });
  }

  /** Translate input placeholders */
  function translatePlaceholders() {
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[key]) {
        el.setAttribute('placeholder', translations[key]);
      }
    });
  }

  /** Translate alt texts */
  function translateAlts() {
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (translations[key]) {
        el.setAttribute('alt', translations[key]);
      }
    });
  }

  /** Translate HTML lang attribute */
  function updateHtmlLang() {
    const langMap = {
      'es_CL': 'es', 'es_ES': 'es', 'en_US': 'en',
      'fr_FR': 'fr', 'pt_BR': 'pt'
    };
    document.documentElement.lang = langMap[currentLang] || 'es';
  }

  /** Add hreflang links for SEO */
  function addHreflang() {
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
    const existing = document.querySelectorAll('link[hreflang]');
    existing.forEach(el => el.remove());

    const variants = {
      'es-CL': baseUrl + '/',
      'es-ES': baseUrl + '/',
      'en-US': baseUrl + '/?lang=en_US',
      'fr-FR': baseUrl + '/?lang=fr_FR',
      'pt-BR': baseUrl + '/?lang=pt_BR',
      'x-default': baseUrl + '/'
    };

    Object.entries(variants).forEach(([hreflang, href]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
    });
  }

  /** Add language selector UI */
  function addLangSelector() {
    if (document.getElementById('atomo-lang-selector')) return;

    const flags = {
      'es_CL': '🇨🇱',
      'es_ES': '🇪🇸',
      'en_US': '🇬🇧',
      'fr_FR': '🇫🇷',
      'pt_BR': '🇧🇷'
    };

    const labels = {
      'es_CL': 'Español (CL)',
      'es_ES': 'Español (ES)',
      'en_US': 'English',
      'fr_FR': 'Français',
      'pt_BR': 'Português (BR)'
    };

    const selector = document.createElement('div');
    selector.id = 'atomo-lang-selector';
    selector.setAttribute('role', 'navigation');
    selector.setAttribute('aria-label', 'Language selector');
    selector.innerHTML = `
      <button id="atomo-lang-btn" aria-haspopup="true" aria-expanded="false" title="Change language">
        ${flags[currentLang] || '🌐'} <span class="lang-current">${labels[currentLang] || currentLang}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>
      <div id="atomo-lang-dropdown" role="menu" hidden>
        ${SUPPORTED_LANGS.map(l => `
          <button role="menuitem" data-lang="${l}" class="${l === currentLang ? 'active' : ''}">
            ${flags[l]} ${labels[l]}
          </button>
        `).join('')}
      </div>
    `;

    document.body.appendChild(selector);

    // Insert styles — positioned on the LEFT to avoid conflicting with WhatsApp float button
    const styles = document.createElement('style');
    styles.textContent = `
      #atomo-lang-selector {
        position: fixed; bottom: 20px; left: 20px; z-index: 9999;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      #atomo-lang-btn {
        display: flex; align-items: center; gap: 6px;
        background: rgba(15,15,30,0.95); backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1);
        color: #eeeef2; padding: 8px 14px; border-radius: 10px;
        cursor: pointer; font-size: 13px; font-weight: 500;
        transition: all 0.25s; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      }
      #atomo-lang-btn:hover { background: rgba(25,25,50,0.98); border-color: rgba(59,130,246,0.3); }
      #atomo-lang-btn .lang-current { min-width: 60px; text-align: left; }
      #atomo-lang-dropdown {
        position: absolute; bottom: calc(100% + 8px); left: 0;
        background: rgba(15,15,30,0.98); backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
        overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.4);
        min-width: 180px;
      }
      #atomo-lang-dropdown button {
        display: flex; align-items: center; gap: 8px; width: 100%;
        padding: 10px 14px; border: none; background: transparent;
        color: rgba(238,238,242,0.7); cursor: pointer; font-size: 13px;
        text-align: left; transition: all 0.15s;
      }
      #atomo-lang-dropdown button:hover { background: rgba(59,130,246,0.1); color: #eeeef2; }
      #atomo-lang-dropdown button.active { color: #3b82f6; font-weight: 600; }
      @media (max-width: 640px) {
        #atomo-lang-selector { bottom: 16px; left: 16px; }
        #atomo-lang-btn { padding: 6px 10px; font-size: 12px; }
        #atomo-lang-btn .lang-current { display: none; }
        #atomo-lang-dropdown { min-width: 160px; }
      }
    `;
    document.head.appendChild(styles);

    // Toggle dropdown
    const btn = document.getElementById('atomo-lang-btn');
    const dropdown = document.getElementById('atomo-lang-dropdown');

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !dropdown.hidden;
      dropdown.hidden = isOpen;
      btn.setAttribute('aria-expanded', !isOpen);
    });

    // Select language
    dropdown.querySelectorAll('[data-lang]').forEach(item => {
      item.addEventListener('click', async (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        await setLanguage(lang);
        dropdown.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!selector.contains(e.target)) {
        dropdown.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /** Set language and re-translate the page */
  async function setLanguage(lang) {
    if (lang === currentLang && translations) {
      // Already loaded, just update the UI
      updateSelectorUI(lang);
      return;
    }

    if (lang === 'es_CL') {
      // es_CL is the base - restore original text
      localStorage.setItem(STORAGE_KEY, lang);
      localStorage.removeItem('atomo_lang_loaded');
      window.location.reload();
      return;
    }

    const data = await loadLang(lang);
    if (!data) {
      console.warn(`[i18n] Could not load ${lang}, falling back to es_CL`);
      return;
    }

    translations = data;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem('atomo_lang_loaded', lang);

    applyTranslation();
  }

  /** Apply all translations */
  function applyTranslation() {
    translateMeta();
    translateTitle();
    translateElements();
    translatePlaceholders();
    translateAlts();
    updateHtmlLang();
    updateSelectorUI(currentLang);
    addHreflang();
  }

  /** Update the selector button text */
  function updateSelectorUI(lang) {
    const flags = {
      'es_CL': '🇨🇱', 'es_ES': '🇪🇸', 'en_US': '🇬🇧',
      'fr_FR': '🇫🇷', 'pt_BR': '🇧🇷'
    };
    const labels = {
      'es_CL': 'Español (CL)', 'es_ES': 'Español (ES)',
      'en_US': 'English', 'fr_FR': 'Français', 'pt_BR': 'Português (BR)'
    };

    const btn = document.getElementById('atomo-lang-btn');
    const currentSpan = btn?.querySelector('.lang-current');
    if (btn) {
      btn.innerHTML = `${flags[lang] || '🌐'} <span class="lang-current">${labels[lang] || lang}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"/></svg>`;
    }

    // Update active state in dropdown
    document.querySelectorAll('#atomo-lang-dropdown [data-lang]').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-lang') === lang);
    });
  }

  /** Check for ?lang=xxx in URL */
  function getUrlLang() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('lang');
    if (lang && SUPPORTED_LANGS.includes(lang)) return lang;
    return null;
  }

  /** Main initialization */
  async function init() {
    // Store es_CL as the fallback reference
    try {
      const resp = await fetch('i18n/es_CL.json?_=' + Date.now());
      if (resp.ok) {
        window.__i18n_es_cl = await resp.json();
        fallbackTranslations = window.__i18n_es_cl;
      }
    } catch (e) {
      console.warn('[i18n] Could not load es_CL reference');
    }

    // URL param takes priority
    const urlLang = getUrlLang();
    const targetLang = urlLang || detectLang();

    if (targetLang === 'es_CL' || targetLang === DEFAULT_LANG) {
      // Default page — just add the selector
      currentLang = 'es_CL';
      addLangSelector();
      addHreflang();
      updateHtmlLang();
      return;
    }

    // Load target language
    const data = await loadLang(targetLang);
    if (data) {
      translations = data;
      currentLang = targetLang;
      localStorage.setItem(STORAGE_KEY, targetLang);
      applyTranslation();
    }

    // Add selector after translation
    addLangSelector();
    updateSelectorUI(currentLang);
  }

  // Expose globally
  window.__i18n = {
    setLanguage,
    currentLang: () => currentLang,
    translate
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
