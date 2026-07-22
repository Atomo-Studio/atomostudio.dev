// app.js — SiteDesk shell: auth, sidebar, publicar, páginas cableadas
(function () {
  "use strict";

  const PAGE = document.body.dataset.sdPage || "";

  const SITEDESK_PAGES = new Set([
    "index.html",
    "contenido.html",
    "historial.html",
    "chat.html",
    "productos.html",
    "galeria.html",
    "animaciones.html",
  ]);

  function resolveNextPage(raw) {
    const fallback = "index.html";
    const value = (raw || "").trim();
    if (!value) return fallback;
    if (/^[a-z0-9][a-z0-9._-]*\.html$/i.test(value) && SITEDESK_PAGES.has(value)) {
      return value;
    }
    return fallback;
  }

  function goAfterLogin(nextPage) {
    location.href = resolveNextPage(nextPage);
  }

  const SECTION_LABELS = {
    hero: "Hero principal",
    about: "Bienvenida",
    contact: "Contacto",
    hours: "Horarios",
    social: "Redes sociales",
    footer: "Pie de página",
  };

  const state = {
    user: null,
    site: null,
    profile: null,
    pendingDrafts: 0,
    sections: {},
    conversationId: null,
  };

  function currentProfile() {
    if (state.profile) return state.profile;
    if (window.SiteDeskVerticals && state.site?.vertical) {
      return SiteDeskVerticals.getVerticalProfile(state.site.vertical);
    }
    return window.SiteDeskVerticals
      ? SiteDeskVerticals.getVerticalProfile("generic")
      : { productsNav: "Mis Productos", productsTitle: "Mis Productos" };
  }

  function applyVerticalLabels() {
    const p = currentProfile();
    if (!p) return;

    document.querySelectorAll(".sd-products-nav-label").forEach((el) => {
      el.textContent = p.productsNav;
    });
    document.querySelectorAll(".sd-products-nav-ico").forEach((el) => {
      el.textContent = p.emoji;
    });
    document.querySelectorAll(".sd-products-title").forEach((el) => {
      el.textContent = p.productsTitle;
    });
    document.querySelectorAll(".sd-products-subtitle").forEach((el) => {
      el.textContent = p.productsSubtitle;
    });
    document.querySelectorAll(".sd-products-add").forEach((el) => {
      el.textContent = p.productsAdd;
    });
    document.querySelectorAll(".sd-products-add-empty").forEach((el) => {
      el.textContent = p.productsAddEmpty;
    });
    document.querySelectorAll(".sd-products-tip").forEach((el) => {
      el.textContent = p.productsTip;
    });
    document.querySelectorAll(".sd-quick-products").forEach((el) => {
      el.textContent = p.quickProducts;
    });
    document.querySelectorAll(".sd-quick-products-sub").forEach((el) => {
      el.textContent = p.quickProductsSub;
    });
    document.querySelectorAll(".sd-chat-example").forEach((el) => {
      el.textContent = p.chatExample;
    });
    document.querySelectorAll(".sd-chat-suggestion-add").forEach((el) => {
      const text = p.chatSuggestionAdd || "Agregar un ítem nuevo";
      el.textContent = "➕ " + text;
      el.dataset.prompt = text;
    });
    document.querySelectorAll(".sd-gallery-title").forEach((el) => {
      el.textContent = p.galleryTitle || "Galería de fotos";
    });
    document.querySelectorAll(".sd-gallery-subtitle").forEach((el) => {
      el.textContent = p.gallerySubtitle || "Las fotos que aparecen en su sitio.";
    });
    document.querySelectorAll(".sd-gallery-quick-sub").forEach((el) => {
      el.textContent = p.galleryQuickSub || "A la galería";
    });
    document.querySelectorAll(".sd-anim-section-products").forEach((el) => {
      el.textContent = p.animSectionProducts || p.productsTitle || p.productsNav;
    });
    const animSelectOpt = document.querySelector(".sd-anim-section-products-option");
    if (animSelectOpt) {
      animSelectOpt.textContent =
        "📋 " + (p.animSectionProducts || p.productsTitle || p.productsNav);
    }
    document.querySelectorAll(".sd-preview-emoji").forEach((el) => {
      el.textContent = p.previewEmoji || "📦";
    });
    document.querySelectorAll(".sd-scope-search-label").forEach((el) => {
      el.textContent = (p.productsNav || "productos").toLowerCase();
    });

    const pageTitle = document.querySelector("title");
    if (pageTitle && PAGE === "productos" && p.productsTitle) {
      pageTitle.textContent = p.productsTitle + " · SiteDesk";
    }
    if (pageTitle && PAGE === "galeria" && p.galleryTitle) {
      pageTitle.textContent = p.galleryTitle + " · SiteDesk";
    }
    document.querySelectorAll(".sd-top-products-title").forEach((el) => {
      el.textContent = p.productsTitle;
    });
    document.querySelectorAll(".sd-vertical-label").forEach((el) => {
      el.textContent = p.label || "Negocio general";
    });
    document.querySelectorAll(".sd-vertical-emoji").forEach((el) => {
      el.textContent = p.emoji || "📦";
    });
  }

  function initials(name) {
    if (!name) return "??";
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  function formatRelTime(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs} h`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "ayer";
    if (days < 7) return `hace ${days} días`;
    return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short" });
  }

  function toast(msg, isError) {
    let el = document.getElementById("sd-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "sd-toast";
      el.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;" +
        "padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:500;" +
        "box-shadow:0 8px 30px rgba(0,0,0,.15);max-width:90vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.style.background = isError ? "#fef2f2" : "#ecfdf5";
    el.style.color = isError ? "#b91c1c" : "#047857";
    el.style.border = isError ? "1px solid #fecaca" : "1px solid #a7f3d0";
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 4000);
  }

  async function requireAuth() {
    if (PAGE === "login") return true;
    if (!SiteDeskAuth.get()) {
      const next = encodeURIComponent(PAGE ? PAGE + ".html" : "index.html");
      location.href = "login.html?next=" + next;
      return false;
    }
    try {
      await SiteDeskApi.me();
      return true;
    } catch (err) {
      SiteDeskAuth.clear();
      location.href = "login.html";
      return false;
    }
  }

  function updateDraftBadges() {
    const n = state.pendingDrafts || 0;
    document.querySelectorAll(".sd-drafts-num").forEach((el) => {
      el.textContent = String(n);
    });
    document.querySelectorAll(".sd-drafts-pill").forEach((el) => {
      el.hidden = n === 0;
    });
    document.querySelectorAll(".sb-nav .badge").forEach((el) => {
      if (n > 0) {
        el.textContent = String(n);
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
    document.querySelectorAll(".sd-pending-banner").forEach((el) => {
      el.hidden = n === 0;
    });
    document.querySelectorAll(".sd-pending-count").forEach((el) => {
      el.textContent = String(n);
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sitePublicUrl(site) {
    if (!site?.url) return null;
    return site.url.startsWith("http") ? site.url : "https://" + site.url;
  }

  function updatePublishButtons() {
    const n = state.pendingDrafts || 0;
    document.querySelectorAll(".sd-publish").forEach((btn) => {
      const disabled = n === 0;
      btn.disabled = disabled;
      btn.title = disabled
        ? "No hay cambios pendientes para publicar"
        : "Publicar " + n + " cambio(s) al sitio en vivo";
      btn.setAttribute("aria-disabled", disabled ? "true" : "false");
    });
  }

  function updateViewSiteButtons() {
    const url = sitePublicUrl(state.site);
    document.querySelectorAll(".sd-view-site, .sd-preview-open").forEach((btn) => {
      if (url) {
        btn.hidden = false;
        btn.disabled = false;
        btn.title = "Abrir " + (state.site?.url || "sitio");
      } else {
        btn.hidden = false;
        btn.disabled = true;
        btn.title = "URL del sitio no configurada";
      }
    });
  }

  function heroPreviewFields() {
    const hero = state.sections.hero;
    if (!hero) return null;
    const fields = hero.hasDraft && hero.draft ? hero.draft : hero.published;
    if (!fields || !Object.values(fields).some((v) => v != null && String(v).trim())) {
      return null;
    }
    return fields;
  }

  function renderSitePreview() {
    const body = document.querySelector(".sd-preview-body");
    if (!body) return;

    const fields = heroPreviewFields();
    const url = sitePublicUrl(state.site);
    const liveBadge = document.querySelector(".sd-preview-live");

    if (liveBadge) {
      liveBadge.hidden = !url;
    }

    if (!fields) {
      body.innerHTML =
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;padding:32px;text-align:center;color:var(--text2);">' +
        '<div style="font-size:40px;margin-bottom:12px;" class="sd-preview-emoji">📦</div>' +
        '<p style="font-weight:600;color:var(--text);margin-bottom:6px;">Sin vista previa aún</p>' +
        '<p style="font-size:13px;max-width:280px;line-height:1.5;">' +
        "Edite textos en Contenido o publique su primera sección para ver el hero aquí.</p></div>";
      return;
    }

    const eyebrow = escapeHtml(fields.eyebrow || "");
    const title = escapeHtml(fields.title || state.site?.name || "Su sitio");
    const subtitle = escapeHtml(fields.subtitle || "");
    const cta = escapeHtml(fields.cta || "Contactar");

    body.innerHTML =
      '<div style="position:absolute;inset:0;background:linear-gradient(135deg,#1a1410,#2d1f15);' +
      'color:white;padding:32px;display:flex;flex-direction:column;justify-content:center;">' +
      (eyebrow
        ? '<div style="font-size:11px;letter-spacing:0.3em;color:rgba(255,255,255,0.55);margin-bottom:8px;">' +
          eyebrow +
          "</div>"
        : "") +
      '<div style="font-size:36px;font-weight:700;line-height:1.1;margin-bottom:10px;max-width:70%;">' +
      title.replace(/\n/g, "<br>") +
      "</div>" +
      (subtitle
        ? '<div style="font-size:14px;opacity:0.75;max-width:60%;margin-bottom:20px;">' +
          subtitle +
          "</div>"
        : "") +
      '<div style="display:inline-block;padding:10px 20px;background:#3b82f6;border-radius:8px;' +
      'font-size:13px;font-weight:600;width:fit-content;">' +
      cta +
      "</div></div>";
  }

  async function loadIndexDashboard() {
    try {
      const [contentRes, historyRes] = await Promise.all([
        SiteDeskApi.content(),
        SiteDeskApi.history(),
      ]);
      state.sections = contentRes.sections || {};

      const url = sitePublicUrl(state.site);
      document.querySelectorAll(".sd-stat-site-status").forEach((el) => {
        el.textContent = url ? "En línea" : "Sin URL";
      });
      document.querySelectorAll(".sd-stat-site-dot").forEach((el) => {
        el.style.background = url ? "var(--success)" : "var(--muted)";
      });
      document.querySelectorAll(".sd-stat-site-meta").forEach((el) => {
        el.textContent = url
          ? state.site.url
          : "Configure la URL de su sitio con soporte Átomo";
      });

      const items = historyRes.items || [];
      const last = items[0];
      document.querySelectorAll(".sd-stat-last-update").forEach((el) => {
        el.textContent = last?.createdAt
          ? formatRelTime(last.createdAt)
          : "Sin datos aún";
      });
      document.querySelectorAll(".sd-stat-last-meta").forEach((el) => {
        el.textContent = last?.summary
          ? last.summary
          : "Aún no hay publicaciones registradas";
      });

      renderSitePreview();
    } catch {
      document.querySelectorAll(".sd-stat-last-update").forEach((el) => {
        el.textContent = "Sin datos aún";
      });
      renderSitePreview();
    }
  }

  function updateShell() {
    const site = state.site;
    const user = state.user;
    if (!site) return;

    const clientName = site.clientName || user?.name || user?.email || "Cliente";
    document.querySelectorAll(".sd-site-name").forEach((el) => { el.textContent = site.name || ""; });
    document.querySelectorAll(".sd-site-url-text").forEach((el) => { el.textContent = site.url || ""; });
    document.querySelectorAll(".sd-site-thumb").forEach((el) => { el.textContent = initials(site.name); });
    document.querySelectorAll(".sd-client-name").forEach((el) => { el.textContent = clientName; });
    document.querySelectorAll(".sd-foot-avatar").forEach((el) => { el.textContent = initials(clientName); });
    document.querySelectorAll(".sd-greeting").forEach((el) => {
      el.textContent = "Hola " + clientName + " 👋";
    });
    document.querySelectorAll(".sd-preview-url").forEach((el) => {
      el.textContent = site.url || "Sin URL configurada";
    });
    updateViewSiteButtons();
    updateDraftBadges();
    updateDashboardStats();
    updatePublishButtons();
    applyVerticalLabels();
  }

  function updateDashboardStats() {
    const n = state.pendingDrafts || 0;
    document.querySelectorAll(".sd-stat-drafts").forEach((el) => {
      el.textContent = String(n);
    });
    updatePublishButtons();
  }

  function showVerticalInfo() {
    const main = document.querySelector(".content") || document.querySelector(".main");
    if (!main || main.querySelector(".sd-vertical-info")) return;

    const p = currentProfile();
    const label = state.site?.verticalLabel || p.label || "Negocio general";
    const emoji = p.emoji || "📦";
    const source = state.site?.verticalSource;

    const banner = document.createElement("div");
    banner.className = "sd-vertical-info";
    banner.style.cssText =
      "margin:0 0 20px;padding:14px 18px;border-radius:12px;" +
      "background:var(--blue-soft, #eff6ff);border:1px solid var(--border);" +
      "display:flex;align-items:center;gap:12px;flex-wrap:wrap;";
    banner.innerHTML =
      '<span style="font-size:24px;" class="sd-vertical-emoji">' + emoji + "</span>" +
      '<div style="flex:1;min-width:200px;">' +
      '<div style="font-weight:700;font-size:14px;">Tu sitio: <span class="sd-vertical-label">' +
      label +
      "</span></div>" +
      '<div style="font-size:12.5px;color:var(--text2);margin-top:2px;">' +
      "SiteDesk adapta las etiquetas del panel según el tipo de negocio de su landing." +
      "</div></div>";

    if (new URLSearchParams(location.search).get("adminVertical") === "1") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost";
      btn.style.fontSize = "12px";
      btn.textContent = "Cambiar rubro (admin)";
      btn.addEventListener("click", () => showAdminVerticalOverride(banner));
      banner.appendChild(btn);
    }

    main.insertBefore(banner, main.firstChild);
    if (source && source !== "db") {
      banner.title = "Rubro inferido automáticamente (" + source + ")";
    }
  }

  function showAdminVerticalOverride(anchor) {
    const existing = document.getElementById("sd-admin-vertical-panel");
    if (existing) {
      existing.remove();
      return;
    }
    const options = window.SiteDeskVerticals
      ? SiteDeskVerticals.listVerticalOptions()
      : [];
    const panel = document.createElement("div");
    panel.id = "sd-admin-vertical-panel";
    panel.style.cssText =
      "margin:0 0 20px;padding:16px;border-radius:12px;border:1px dashed var(--border);";
    panel.innerHTML =
      '<p style="font-size:13px;color:var(--text2);margin-bottom:12px;">' +
      "Override manual (solo soporte Átomo). El flujo normal toma el rubro de la landing.</p>" +
      '<div class="sd-vertical-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;"></div>' +
      '<p id="sd-vertical-error" hidden style="color:#b91c1c;margin-top:12px;font-size:13px;"></p>';
    const grid = panel.querySelector(".sd-vertical-grid");
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn";
      btn.style.cssText = "padding:10px;text-align:left;font-size:12px;";
      btn.textContent = opt.emoji + " " + opt.label;
      btn.addEventListener("click", () => selectVertical(opt.id, btn));
      grid.appendChild(btn);
    });
    anchor.insertAdjacentElement("afterend", panel);
  }

  async function selectVertical(vertical, btn) {
    const errEl = document.getElementById("sd-vertical-error");
    if (btn) btn.disabled = true;
    if (errEl) errEl.hidden = true;
    try {
      const res = await SiteDeskApi.setVertical(vertical);
      state.site = res.site;
      state.profile = res.site.profile || SiteDeskVerticals.getVerticalProfile(vertical);
      state.pendingDrafts = res.site.pendingDrafts || 0;
      document.getElementById("sd-admin-vertical-panel")?.remove();
      updateShell();
      showVerticalInfo();
      applyVerticalLabels();
      toast("Rubro actualizado (override admin).");
    } catch (err) {
      if (errEl) {
        errEl.textContent = apiErrorMessage(err);
        errEl.hidden = false;
      }
      if (btn) btn.disabled = false;
    }
  }

  function showNeedsSetup() {
    const main = document.querySelector(".content") || document.querySelector(".main");
    if (!main) return;
    main.innerHTML =
      '<div style="padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;">' +
      "<h1 style=\"font-size:22px;margin-bottom:12px;\">Sitio pendiente de activación</h1>" +
      "<p style=\"color:var(--text2);line-height:1.6;\">Tu cuenta aún no tiene un sitio asignado. " +
      "Contacta a Mario por WhatsApp para activar SiteDesk.</p>" +
      '<a href="https://wa.me/56973994504" class="btn btn-primary" style="margin-top:20px;display:inline-flex;">📱 WhatsApp a Mario</a>' +
      "</div>";
  }

  async function loadSiteContext() {
    const [user, siteRes] = await Promise.all([SiteDeskApi.me(), SiteDeskApi.site()]);
    state.user = user;
    if (siteRes.needsSetup || !siteRes.site) {
      showNeedsSetup();
      return false;
    }
    state.site = siteRes.site;
    state.profile = siteRes.site.profile || null;
    state.pendingDrafts = siteRes.site.pendingDrafts || 0;
    updateShell();
    showVerticalInfo();
    return true;
  }

  async function refreshPending() {
    const siteRes = await SiteDeskApi.site();
    if (siteRes.site) {
      state.pendingDrafts = siteRes.site.pendingDrafts || 0;
      updateDraftBadges();
      updateDashboardStats();
    }
  }

  async function doPublish(btn) {
    if ((state.pendingDrafts || 0) === 0) {
      toast("No hay cambios pendientes para publicar.");
      return;
    }
    if (btn) btn.disabled = true;
    try {
      const res = await SiteDeskApi.publish();
      const n = (res.publishedSections || []).length;
      if (n === 0) {
        toast(res.message || "No hay cambios pendientes para publicar.");
      } else {
        toast("Publicado: " + (res.publishedSections || []).join(", "));
      }
      await refreshPending();
      if (PAGE === "index") {
        await loadHistoryPreview();
        await loadIndexDashboard();
      }
      if (PAGE === "contenido") await loadContentForm();
      if (PAGE === "historial") await loadFullHistory();
    } catch (err) {
      toast(apiErrorMessage(err), true);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindPublishButtons() {
    document.querySelectorAll(".sd-publish").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        doPublish(btn);
      });
    });
  }

  function renderHistoryItem(item, showRevert) {
    const sections = (item.sections || []).map((s) => SECTION_LABELS[s] || s).join(", ");
    const summary = item.summary || ("Publicadas: " + sections);
    return (
      '<div class="tl-item">' +
      '<div class="tl-dot"></div>' +
      '<div class="tl-body">' +
      '<div class="tl-msg">' + summary + "</div>" +
      '<div class="tl-meta">' +
      '<span class="src manual">✋ SiteDesk</span>' +
      formatRelTime(item.createdAt) +
      '<span class="chip live">Publicado</span>' +
      "</div></div>" +
      (showRevert ? '<span class="tl-revert" style="opacity:.4;cursor:default;">—</span>' : "") +
      "</div>"
    );
  }

  async function loadHistoryPreview() {
    const box = document.getElementById("sd-history-preview");
    if (!box) return;
    try {
      const data = await SiteDeskApi.history();
      const items = (data.items || []).slice(0, 5);
      if (!items.length) {
        box.innerHTML = '<p style="padding:16px;color:var(--text2);font-size:13px;">Sin publicaciones aún.</p>';
        return;
      }
      box.innerHTML = '<div class="timeline">' + items.map((i) => renderHistoryItem(i, false)).join("") + "</div>";
    } catch {
      box.innerHTML = "";
    }
  }

  async function loadFullHistory() {
    const box = document.getElementById("sd-history-full");
    if (!box) return;
    try {
      const data = await SiteDeskApi.history();
      const items = data.items || [];
      if (!items.length) {
        box.innerHTML = '<p style="padding:24px;color:var(--text2);">Sin historial de publicaciones.</p>';
        return;
      }
      box.innerHTML =
        '<div class="card" style="padding:0;"><div class="timeline" style="padding:4px 20px;">' +
        items.map((i) => renderHistoryItem(i, true)).join("") +
        "</div></div>";
    } catch (err) {
      box.innerHTML = '<p style="padding:24px;color:#b91c1c;">' + apiErrorMessage(err) + "</p>";
    }
  }

  function sectionFields(section) {
    const data = state.sections[section];
    if (!data) return {};
    return data.hasDraft && data.draft ? data.draft : data.published || {};
  }

  function setFieldValue(el, value) {
    if (el.type === "checkbox") el.checked = !!value;
    else el.value = value != null ? String(value) : "";
  }

  function readFieldValue(el) {
    if (el.type === "checkbox") return el.checked;
    return el.value.trim();
  }

  async function loadContentForm() {
    const data = await SiteDeskApi.content();
    state.sections = data.sections || {};

    document.querySelectorAll(".sd-field").forEach((el) => {
      const section = el.dataset.section;
      const field = el.dataset.field;
      if (!section || !field) return;
      const fields = sectionFields(section);
      setFieldValue(el, fields[field]);
    });

    document.querySelectorAll(".sd-section-card").forEach((card) => {
      const section = card.dataset.section;
      const chip = card.querySelector(".sd-draft-chip");
      if (!chip || !section) return;
      const sec = state.sections[section];
      chip.hidden = !(sec && sec.hasDraft);
    });
  }

  async function saveSection(section) {
    const fields = {};
    document.querySelectorAll('.sd-field[data-section="' + section + '"]').forEach((el) => {
      fields[el.dataset.field] = readFieldValue(el);
    });
    await SiteDeskApi.saveContent({ section, fields });
    await refreshPending();
    const data = await SiteDeskApi.content();
    state.sections = data.sections || {};
    const card = document.querySelector('.sd-section-card[data-section="' + section + '"]');
    const chip = card && card.querySelector(".sd-draft-chip");
    if (chip) chip.hidden = false;
    toast("Borrador guardado (" + (SECTION_LABELS[section] || section) + ").");
  }

  function bindContentForm() {
    document.querySelectorAll(".sd-save-section").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const section = btn.dataset.section;
        btn.disabled = true;
        try {
          await saveSection(section);
        } catch (err) {
          toast(apiErrorMessage(err), true);
        } finally {
          btn.disabled = false;
        }
      });
    });
    document.querySelectorAll(".sd-field").forEach((el) => {
      el.addEventListener("blur", async () => {
        const section = el.dataset.section;
        if (!section) return;
        clearTimeout(el._saveT);
        el._saveT = setTimeout(async () => {
          try {
            await saveSection(section);
          } catch (err) {
            toast(apiErrorMessage(err), true);
          }
        }, 300);
      });
    });
  }

  function appendChatMessage(role, text) {
    const stream = document.querySelector(".sd-chat-stream");
    if (!stream) return;
    const isUser = role === "user";
    const avatar = isUser ? initials(state.user?.name || "Tú") : "Geo";
    const html =
      '<div class="msg"' + (isUser ? ' style="flex-direction: row-reverse;"' : "") + ">" +
      '<div class="msg-avatar' + (isUser ? "" : " ai") + '">' +
      (isUser ? avatar : '<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg>') +
      "</div>" +
      '<div class="msg-body"' + (isUser ? ' style="text-align: right;"' : "") + ">" +
      '<div class="msg-name">' + (isUser ? "Tú" : "Geo") + "</div>" +
      '<div class="msg-content"' +
      (isUser ? ' style="display:inline-block;background:var(--blue-soft);padding:10px 14px;border-radius:14px 14px 4px 14px;text-align:left;"' : "") +
      ">" + escapeHtml(text).replace(/\n/g, "<br>") + "</div></div></div>";
    stream.insertAdjacentHTML("beforeend", html);
    stream.scrollTop = stream.scrollHeight;
  }

  async function sendChatMessage(text) {
    const input = document.querySelector(".sd-chat-input");
    const sendBtn = document.querySelector(".sd-chat-send");
    appendChatMessage("user", text);
    if (input) input.value = "";
    if (sendBtn) sendBtn.disabled = true;

    const thinking = document.createElement("div");
    thinking.className = "msg sd-chat-thinking";
    thinking.innerHTML =
      '<div class="msg-avatar ai"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg></div>' +
      '<div class="msg-body"><div class="msg-name">Geo</div><div class="msg-content" style="color:var(--text2);">Pensando…</div></div>';
    const stream = document.querySelector(".sd-chat-stream");
    stream?.appendChild(thinking);
    stream && (stream.scrollTop = stream.scrollHeight);

    try {
      const res = await SiteDeskApi.chat({
        message: text,
        conversationId: state.conversationId,
      });
      thinking.remove();
      if (res.conversationId != null) state.conversationId = res.conversationId;
      appendChatMessage("assistant", res.reply || "Listo.");
      await refreshPending();
    } catch (err) {
      thinking.remove();
      appendChatMessage("assistant", apiErrorMessage(err));
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function bindChat() {
    const input = document.querySelector(".sd-chat-input");
    const sendBtn = document.querySelector(".sd-chat-send");
    const stream = document.querySelector(".sd-chat-stream");
    if (!input || !stream) return;

    const clientName = () => state.user?.name || state.site?.clientName || "Cliente";
    stream.innerHTML =
      '<div class="msg"><div class="msg-avatar ai"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg></div>' +
      '<div class="msg-body"><div class="msg-name">Geo</div><div class="msg-content">Hola ' +
      clientName() +
      " 👋 ¿En qué le ayudo hoy? Puede pedirme cambios de textos del sitio (horarios, contacto, hero). " +
      "Catálogo y fotos aún están en desarrollo.</div></div></div>";

    const submit = () => {
      const text = input.value.trim();
      if (!text) return;
      sendChatMessage(text);
    };
    sendBtn && sendBtn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    });
    document.querySelectorAll(".suggestions .sug").forEach((el) => {
      el.addEventListener("click", () => {
        const t = el.dataset.prompt || el.textContent.replace(/^[^\s]+\s*/, "").trim();
        input.value = t;
        input.focus();
      });
    });
    document.querySelector(".chat-head .btn-ghost")?.addEventListener("click", () => {
      state.conversationId = null;
      bindChat();
    });
  }

  function bindComingSoonButtons() {
    document.querySelectorAll(".sd-coming-soon").forEach((btn) => {
      const msg = btn.dataset.soonMsg || "Próximamente — esta función estará disponible en una próxima versión.";
      btn.setAttribute("title", msg);
      if (btn.tagName === "A") {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          toast(msg);
        });
        return;
      }
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        toast(msg);
      });
    });
  }

  async function loadProducts() {
    const container = document.getElementById("sd-products-container");
    if (!container) return;
    try {
      const data = await SiteDeskApi.getProducts();
      const items = data.items || [];
      if (items.length === 0) {
        container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text2);">No hay productos aún.</div>';
        return;
      }
      container.innerHTML = items.map(p => `
        <div class="card" style="display:flex; align-items:center; gap:16px; padding:16px; border:1px solid var(--border); border-radius:12px;">
          ${p.thumb_url || p.image_url 
            ? `<img src="${p.thumb_url || p.image_url}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />` 
            : `<div style="width:60px; height:60px; background:var(--bg2); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:24px;">📦</div>`}
          <div style="flex:1;">
            <div style="font-weight:600; font-size:15px; color:var(--text);">${escapeHtml(p.name)}</div>
            <div style="font-size:13px; color:var(--text2);">${escapeHtml(p.description || '')}</div>
          </div>
          <div style="font-weight:600;">$${p.price || 0}</div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-ghost sd-edit-product" data-product='${escapeHtml(JSON.stringify(p))}'>Editar</button>
            <button class="btn btn-ghost sd-delete-product" data-id="${p.id}" style="color:var(--red);">Eliminar</button>
          </div>
        </div>
      `).join("");

      document.querySelectorAll(".sd-edit-product").forEach(btn => {
        btn.addEventListener("click", () => {
          const product = JSON.parse(btn.dataset.product);
          openProductModal(product);
        });
      });

      document.querySelectorAll(".sd-delete-product").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!confirm("¿Eliminar producto?")) return;
          try {
            await SiteDeskApi.deleteProduct(btn.dataset.id);
            toast("Producto eliminado");
            loadProducts();
          } catch (err) {
            toast(apiErrorMessage(err), true);
          }
        });
      });
    } catch (err) {
      container.innerHTML = '<div style="padding:40px; text-align:center; color:red;">' + apiErrorMessage(err) + '</div>';
    }
  }

  function openProductModal(product = null) {
    const modal = document.getElementById("sd-product-modal");
    const form = document.getElementById("sd-product-form");
    const title = document.getElementById("sd-product-modal-title");
    const preview = document.getElementById("sd-product-image-preview");
    
    form.reset();
    preview.style.display = "none";
    preview.src = "";

    if (product) {
      title.textContent = "Editar producto";
      document.getElementById("sd-product-id").value = product.id;
      document.getElementById("sd-product-name").value = product.name || "";
      document.getElementById("sd-product-desc").value = product.description || "";
      document.getElementById("sd-product-price").value = product.price || "";
      if (product.image_url) {
        preview.src = product.thumb_url || product.image_url;
        preview.style.display = "block";
      }
    } else {
      title.textContent = "Agregar producto";
      document.getElementById("sd-product-id").value = "";
    }
    
    modal.hidden = false;
  }

  function bindProductosPage() {
    loadProducts();

    const addBtn = document.querySelector(".sd-products-add-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => openProductModal());
    }

    const form = document.getElementById("sd-product-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("sd-product-save");
        btn.disabled = true;
        btn.textContent = "Guardando...";

        try {
          const id = document.getElementById("sd-product-id").value;
          const name = document.getElementById("sd-product-name").value.trim();
          const description = document.getElementById("sd-product-desc").value.trim();
          const price = parseFloat(document.getElementById("sd-product-price").value) || 0;
          const fileInput = document.getElementById("sd-product-image");
          const preview = document.getElementById("sd-product-image-preview");
          
          let image_url = preview && preview.src && preview.src.startsWith('http') ? preview.src : null;
          let thumb_url = image_url;

          if (fileInput.files.length > 0) {
            btn.textContent = "Subiendo imagen...";
            const upRes = await SiteDeskApi.uploadImage(fileInput.files[0]);
            image_url = upRes.url;
            thumb_url = upRes.thumb_url || upRes.url;
          }

          const data = { name, description, price, image_url, thumb_url };

          if (id) {
            await SiteDeskApi.updateProduct(id, data);
            toast("Producto actualizado");
          } else {
            await SiteDeskApi.createProduct(data);
            toast("Producto creado");
          }

          document.getElementById("sd-product-modal").hidden = true;
          loadProducts();
        } catch (err) {
          toast(apiErrorMessage(err), true);
        } finally {
          btn.disabled = false;
          btn.textContent = "Guardar";
        }
      });
    }
    
    document.querySelectorAll(".sd-products-filter").forEach(btn => {
      btn.classList.add("sd-coming-soon");
      btn.dataset.soonMsg = "Próximamente: filtros de productos.";
    });
    bindComingSoonButtons();
  }

  function bindGaleriaPage() {
    const msg =
      "Próximamente: subida de fotos. Mientras tanto puede pedir cambios por Chat con IA o editar textos en Contenido.";
    document.querySelectorAll(".sd-gallery-upload, .sd-gallery-files, .sd-gallery-upload-btn").forEach((btn) => {
      btn.classList.add("sd-coming-soon");
      btn.dataset.soonMsg = msg;
    });
    const contenidoLink = document.querySelector(".sd-gallery-contenido-link");
    if (contenidoLink) {
      contenidoLink.href = "contenido.html";
    }
    bindComingSoonButtons();
  }

  const ANIM_OPTIONS = [
    { id: "fade", label: "Fade In" },
    { id: "slide-l", label: "Slide Left" },
    { id: "slide-r", label: "Slide Right" },
    { id: "zoom-in", label: "Zoom In" },
    { id: "zoom-out", label: "Zoom Out" },
    { id: "ken", label: "Ken Burns" },
    { id: "parallax", label: "Parallax" },
    { id: "none", label: "Sin animación" },
  ];

  function animStorageKey() {
    return "sitedesk_anim_" + (state.site?.id || state.site?.slug || "default");
  }

  function bindAnimacionesPage() {
    const grid = document.querySelector(".sd-anim-grid");
    const status = document.querySelector(".sd-anim-current");
    const saveBtn = document.querySelector(".sd-anim-save");
    const resetBtn = document.querySelector(".sd-anim-reset");
    if (!grid) return;

    let selected = localStorage.getItem(animStorageKey()) || "ken";

    function renderSelection() {
      grid.querySelectorAll(".anim-card").forEach((card) => {
        const id = card.dataset.animId;
        card.classList.toggle("active", id === selected);
        const check = card.querySelector(".anim-check");
        if (check) check.hidden = id !== selected;
      });
      const opt = ANIM_OPTIONS.find((o) => o.id === selected);
      if (status) {
        status.textContent = "Actualmente: " + (opt ? opt.label : selected);
      }
    }

    grid.querySelectorAll(".anim-card").forEach((card) => {
      card.addEventListener("click", () => {
        selected = card.dataset.animId || "none";
        renderSelection();
      });
    });

    if (saveBtn) {
      saveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        try {
          localStorage.setItem(animStorageKey(), selected);
          toast("Preferencia guardada en este navegador. La sincronización con el sitio estará disponible próximamente.");
        } catch {
          toast("No se pudo guardar la preferencia.", true);
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.preventDefault();
        selected = "ken";
        renderSelection();
        toast("Selección restablecida a Ken Burns.");
      });
    }

    const stored = localStorage.getItem(animStorageKey());
    if (stored) selected = stored;
    renderSelection();
  }

  function bindHistorialFilters() {
    const msg = "Próximamente: filtros de historial.";
    document.querySelectorAll(".sd-history-filter").forEach((btn) => {
      btn.classList.add("sd-coming-soon");
      btn.dataset.soonMsg = msg;
    });
    bindComingSoonButtons();
  }

  function bindIndexExtras() {
    document.querySelectorAll(".sd-preview-open").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = sitePublicUrl(state.site);
        if (url) window.open(url, "_blank");
        else toast("URL del sitio no configurada.", true);
      });
    });
    document.querySelectorAll(".sd-view-site").forEach((btn) => {
      btn.addEventListener("click", () => {
        const url = sitePublicUrl(state.site);
        if (url) window.open(url, "_blank");
        else toast("URL del sitio no configurada.", true);
      });
    });
    bindComingSoonButtons();
  }

  function initLogin() {
    const form = document.getElementById("sd-login-form");
    const googleBtn = document.getElementById("sd-google-login");
    const errEl = document.getElementById("sd-login-error");
    const params = new URLSearchParams(location.search);
    const next = resolveNextPage(params.get("next"));

    const hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const oauthToken = hashParams.get("token");
    const oauthError = hashParams.get("error");
    if (oauthToken) {
      SiteDeskAuth.set(decodeURIComponent(oauthToken));
      history.replaceState({}, "", location.pathname + location.search);
      goAfterLogin(next);
      return;
    }
    if (oauthError) {
      if (errEl) {
        errEl.textContent = decodeURIComponent(oauthError.replace(/\+/g, " "));
        errEl.hidden = false;
      }
      history.replaceState({}, "", location.pathname + location.search);
    }

    if (SiteDeskAuth.get()) {
      goAfterLogin(next);
      return;
    }

    if (googleBtn) {
      googleBtn.addEventListener("click", () => {
        if (USE_MOCK) {
          if (errEl) {
            errEl.textContent = "OAuth no disponible en modo demo.";
            errEl.hidden = false;
          }
          return;
        }
        const url = googleOAuthUrl(next);
        if (url) location.href = url;
      });
    }

    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      if (errEl) errEl.hidden = true;
      try {
        const email = form.email.value.trim();
        const password = form.password.value;
        await SiteDeskApi.login({ email, password });
        goAfterLogin(next);
      } catch (err) {
        if (errEl) {
          errEl.textContent = apiErrorMessage(err);
          errEl.hidden = false;
        }
      } finally {
        btn.disabled = false;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (PAGE === "login") {
      initLogin();
      return;
    }
    if (!(await requireAuth())) return;
    bindPublishButtons();
    try {
      const ok = await loadSiteContext();
      if (!ok) return;
      if (PAGE === "index") {
        await loadIndexDashboard();
        await loadHistoryPreview();
        bindIndexExtras();
      }
      if (PAGE === "contenido") {
        bindContentForm();
        await loadContentForm();
      }
      if (PAGE === "historial") {
        await loadFullHistory();
        bindHistorialFilters();
      }
      if (PAGE === "chat") bindChat();
      if (PAGE === "productos") bindProductosPage();
      if (PAGE === "galeria") bindGaleriaPage();
      if (PAGE === "animaciones") bindAnimacionesPage();
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  });
})();
