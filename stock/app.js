// app.js — Stock web shell: auth, sidebar, páginas cableadas
(function () {
  "use strict";

  const PAGE = document.body.dataset.stPage || "";

  const STOCK_PAGES = new Set([
    "app.html",
    "productos.html",
    "scanner.html",
    "ventas.html",
    "chat.html",
    "configuracion.html",
  ]);

  function resolveNextPage(raw) {
    const fallback = "app.html";
    const value = (raw || "").trim();
    if (!value) return fallback;
    if (/^[a-z0-9][a-z0-9._-]*\.html$/i.test(value) && STOCK_PAGES.has(value)) {
      return value;
    }
    return fallback;
  }

  function goAfterLogin(nextPage) {
    location.href = resolveNextPage(nextPage);
  }

  const state = {
    user: null,
    business: null,
    profile: null,
    conversationId: null,
    products: [],
    scannerProduct: null,
    scannerQty: 1,
  };

  function currentProfile() {
    if (state.profile) return state.profile;
    if (window.StockVerticals && state.business?.vertical) {
      return StockVerticals.getVerticalProfile(state.business.vertical);
    }
    return window.StockVerticals
      ? StockVerticals.getVerticalProfile("generic")
      : { catalogNav: "Catálogo", productPlural: "productos", productSingular: "producto" };
  }

  function applyVerticalLabels() {
    const p = currentProfile();
    if (!p) return;

    document.querySelectorAll(".st-business-type").forEach((el) => {
      el.textContent = state.business?.rubroLabel || p.businessType || "";
    });
    document.querySelectorAll(".st-catalog-nav").forEach((el) => {
      el.textContent = p.catalogNav || "Catálogo";
    });
    document.querySelectorAll(".st-product-plural").forEach((el) => {
      el.textContent = p.productPlural || "productos";
    });
    document.querySelectorAll(".st-product-singular").forEach((el) => {
      el.textContent = p.productSingular || "producto";
    });
    document.querySelectorAll(".st-chat-example").forEach((el) => {
      el.textContent = p.chatExample || "";
    });

    const pageTitle = document.querySelector("title");
    if (pageTitle && state.business?.name && PAGE !== "login") {
      const suffix = {
        dashboard: "Inicio",
        productos: p.catalogNav || "Catálogo",
        scanner: "Escáner",
        ventas: "Ventas",
        chat: "Geos",
        configuracion: "Configuración",
      }[PAGE];
      if (suffix) pageTitle.textContent = state.business.name + " · " + suffix;
    }
  }

  function applyBusinessData() {
    const biz = state.business;
    const summary = biz?.summary || {};

    document.querySelectorAll(".st-business-name").forEach((el) => {
      el.textContent = biz?.name || "Mi negocio";
    });
    document.querySelectorAll(".st-business-thumb").forEach((el) => {
      el.textContent = initials(biz?.name);
    });
    document.querySelectorAll(".st-client-name").forEach((el) => {
      el.textContent = state.user?.name || state.user?.email || "Usuario";
    });
    document.querySelectorAll(".st-foot-avatar").forEach((el) => {
      el.textContent = initials(state.user?.name || state.user?.email);
    });
    document.querySelectorAll(".st-product-count").forEach((el) => {
      el.textContent = String(summary.productCount ?? "0");
    });
    document.querySelectorAll(".st-products-ok").forEach((el) => {
      const n = summary.productsOk;
      const label = currentProfile().productPlural || "productos";
      el.textContent = n != null ? n + " con stock OK" : "";
    });
    document.querySelectorAll(".st-sales-today").forEach((el) => {
      el.textContent = summary.salesToday || "$0";
    });
    document.querySelectorAll(".st-units-today").forEach((el) => {
      const n = summary.unitsToday;
      el.textContent = n != null ? n + " unidades" : "0 unidades";
    });
    document.querySelectorAll(".st-low-stock-count").forEach((el) => {
      el.textContent = String(summary.lowStockCount ?? "0");
    });
    document.querySelectorAll(".st-low-stock-msg").forEach((el) => {
      const n = summary.lowStockCount ?? 0;
      const label = currentProfile().productPlural || "productos";
      el.textContent = n + " " + label + " en stock bajo";
    });

    applyVerticalLabels();
  }

  function initials(name) {
    if (!name) return "??";
    return String(name)
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
    if (mins < 60) return "hace " + mins + " min";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return "hace " + hrs + " h";
    return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg, isError) {
    let el = document.getElementById("st-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "st-toast";
      el.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;" +
        "padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:500;" +
        "box-shadow:0 8px 30px rgba(0,0,0,.35);max-width:90vw;text-align:center;";
      document.body.appendChild(el);
    }
    el.style.background = isError ? "rgba(127,29,29,0.95)" : "rgba(6,78,59,0.95)";
    el.style.color = "#fff";
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 4000);
  }

  async function requireAuth() {
    if (PAGE === "login") return true;
    if (!StockAuth.get()) {
      const pageFile = location.pathname.split("/").pop() || "app.html";
      const next = encodeURIComponent(pageFile);
      location.href = "login.html?next=" + next;
      return false;
    }
    try {
      await StockApi.me();
      return true;
    } catch (err) {
      StockAuth.clear();
      location.href = "login.html";
      return false;
    }
  }

  function showVerticalSetup() {
    const main = document.querySelector(".st-page-main") || document.getElementById("st-app-main");
    if (!main) return;

    const options = window.StockVerticals ? StockVerticals.listVerticalOptions() : [];

    main.innerHTML =
      '<div style="padding:48px 24px;max-width:640px;margin:0 auto;">' +
      '<h1 style="font-size:24px;margin-bottom:8px;text-align:center;">¿Qué tipo de negocio tiene?</h1>' +
      '<p style="color:var(--text2);line-height:1.6;text-align:center;margin-bottom:28px;">' +
      "Stock adapta el panel a su rubro (ferretería, ropa, carnicería, etc.).</p>" +
      '<div id="st-vertical-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;"></div>' +
      '<p id="st-vertical-error" hidden style="color:var(--error);text-align:center;margin-top:16px;font-size:13px;"></p>' +
      "</div>";

    const grid = document.getElementById("st-vertical-grid");
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-ghost";
      btn.style.cssText =
        "display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:16px;text-align:left;width:100%;";
      btn.innerHTML =
        '<span style="font-size:28px;">' + opt.emoji + "</span>" +
        '<span style="font-weight:700;font-size:14px;">' + opt.label + "</span>" +
        '<span style="font-size:12px;color:var(--text2);line-height:1.4;">' + opt.description + "</span>";
      btn.addEventListener("click", () => selectVertical(opt.id, btn));
      grid.appendChild(btn);
    });
  }

  async function selectVertical(vertical, btn) {
    const errEl = document.getElementById("st-vertical-error");
    if (btn) btn.disabled = true;
    if (errEl) errEl.hidden = true;
    try {
      const res = await StockApi.setVertical(vertical);
      state.business = res.business;
      state.profile = res.business.profile || StockVerticals.getVerticalProfile(vertical);
      location.reload();
    } catch (err) {
      if (errEl) {
        errEl.textContent = apiErrorMessage(err);
        errEl.hidden = false;
      }
      if (btn) btn.disabled = false;
    }
  }

  function showNeedsSetup() {
    const main = document.querySelector(".st-page-main") || document.getElementById("st-app-main");
    if (!main) return;
    main.innerHTML =
      '<div style="padding:48px 24px;text-align:center;max-width:480px;margin:0 auto;">' +
      "<h1 style=\"font-size:22px;margin-bottom:12px;\">Negocio pendiente de activación</h1>" +
      "<p style=\"color:var(--text2);line-height:1.6;\">Tu cuenta aún no tiene Stock activado. " +
      "Contacta a Átomo Studio para activar tu negocio.</p>" +
      '<a href="https://wa.me/56973994504" class="btn btn-primary" style="margin-top:20px;display:inline-flex;">📱 WhatsApp</a>' +
      "</div>";
  }

  async function loadBusinessContext() {
    restoreActiveBusiness();
    const [user, bizRes] = await Promise.all([StockApi.me(), StockApi.business(state.activeBusinessSlug, state.activeBusinessId)]);
    state.user = user;
    if (bizRes.needsSetup || !bizRes.business) {
      showNeedsSetup();
      return false;
    }
    state.business = bizRes.business;
    state.profile = bizRes.business.profile || null;
    applyBusinessData();
    if (bizRes.business.needsVerticalSetup) {
      showVerticalSetup();
      return false;
    }
    loadBusinesses(); // async, no bloquea
    return true;
  }

  // ─── Multi-negocio ───────────────────────────────────
  async function loadBusinesses() {
    try {
      const res = await StockApi.businesses();
      state.businesses = res.items || [];
      if (state.businesses.length <= 1) return;
      renderBusinessSelector();
    } catch (err) {
      console.log('Multi-negocio: sin data', err);
    }
  }

  function renderBusinessSelector() {
    let sel = document.getElementById('st-business-selector');
    if (!sel) {
      sel = document.createElement('select');
      sel.id = 'st-business-selector';
      sel.style.cssText = 'background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:8px;padding:6px 8px;font-size:13px;cursor:pointer;max-width:200px;';
      sel.addEventListener('change', () => switchBusiness(sel.value));
    }
    sel.innerHTML = (state.businesses || []).map(b => {
      const sel = b.id === (state.business?.id || state.activeBusinessId) ? ' selected' : '';
      return `<option value="${b.id}|${b.slug}"${sel}>${escapeHtml(b.name)}</option>`;
    }).join('');

    // Insertar en header o navbar
    const header = document.querySelector('.st-header-right, .top-bar-right, .header-actions');
    if (header && !document.getElementById('st-business-selector')) {
      header.prepend(sel);
    }
    // Fallback: insertar al inicio del main
    if (!header && !document.getElementById('st-business-selector')) {
      const main = document.querySelector('.st-page-main, #st-app-main, main');
      if (main) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'padding:8px 16px;text-align:right;';
        wrap.appendChild(sel);
        main.prepend(wrap);
      }
    }
  }

  async function switchBusiness(val) {
    const [id, slug] = val.split('|');
    state.activeBusinessId = parseInt(id);
    state.activeBusinessSlug = slug;
    localStorage.setItem('stock_active_business', val);
    try {
      const res = await StockApi.business(null, parseInt(id));
      state.business = res;
      state.profile = null;
      if (window.StockVerticals && res.vertical) {
        state.profile = StockVerticals.getVerticalProfile(res.vertical);
      }
      applyBusinessData();
      location.reload();
    } catch (err) {
      console.error('Error cambiando negocio:', err);
      toast('Error al cambiar de negocio', true);
    }
  }

  function restoreActiveBusiness() {
    const saved = localStorage.getItem('stock_active_business');
    if (saved) {
      const [id, slug] = saved.split('|');
      state.activeBusinessId = parseInt(id);
      state.activeBusinessSlug = slug;
    }
  }

  function bindMobileNav() {
    const nav = document.querySelector(".mobile-nav");
    if (!nav || !PAGE) return;
    nav.querySelectorAll("[data-st-nav]").forEach((link) => {
      if (link.dataset.stNav === PAGE) link.classList.add("active");
    });
  }

  function bindLogout() {
    document.querySelectorAll(".st-logout").forEach((btn) => {
      btn.addEventListener("click", () => {
        StockAuth.clear();
        location.href = "login.html";
      });
    });
  }

  function renderSaleRow(sale) {
    const channel = sale.channel === "online" ? "Online" : "Presencial";
    return (
      '<div class="prod-row">' +
      '<div class="prod-thumb">' + escapeHtml(sale.emoji || "📦") + "</div>" +
      '<div class="prod-meta">' +
      '<div class="prod-name">' + escapeHtml(sale.productName) + "</div>" +
      '<div class="prod-sub">' + formatRelTime(sale.createdAt) + " · " + channel + "</div>" +
      "</div>" +
      "<div>" +
      '<div class="prod-price">' + formatCLP(sale.total) + "</div>" +
      '<div class="prod-stock">×' + sale.quantity + "</div>" +
      "</div></div>"
    );
  }

  async function loadDashboard() {
    const salesBox = document.getElementById("st-recent-sales");
    const lowBox = document.getElementById("st-low-stock-list");
    if (!salesBox && !lowBox) return;

    try {
      const data = await StockApi.dashboard();
      if (data.summary && state.business) {
        state.business.summary = data.summary;
        applyBusinessData();
      }

      if (salesBox) {
        const sales = data.recentSales || [];
        salesBox.innerHTML = sales.length
          ? sales.map(renderSaleRow).join("")
          : '<p style="padding:12px 0;color:var(--text2);font-size:13px;">Sin ventas registradas hoy.</p>';
      }

      if (lowBox) {
        const low = data.lowStockProducts || [];
        lowBox.innerHTML = low.length
          ? low
              .map(
                (p) =>
                  '<a href="productos.html?q=' +
                  encodeURIComponent(p.name) +
                  '" class="prod-row" style="text-decoration:none;color:inherit;">' +
                  '<div class="prod-thumb">' +
                  escapeHtml(p.emoji) +
                  "</div>" +
                  '<div class="prod-meta"><div class="prod-name">' +
                  escapeHtml(p.name) +
                  '</div><div class="prod-sub">Stock: ' +
                  p.stock +
                  " / mín " +
                  p.stockMin +
                  "</div></div>" +
                  '<span class="chip err">Reponer</span></a>'
              )
              .join("")
          : '<p style="padding:12px 0;color:var(--text2);font-size:13px;">Todo el stock está OK.</p>';
      }
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  }

  function productCardHtml(p) {
    const badges = [];
    if (p.lowStock) badges.push('<span class="badge err">⚠ ' + p.stock + '</span>');
    if (p.destacado) badges.push('<span class="badge gold">★ Destacado</span>');
    if (p.esNuevo) badges.push('<span class="badge green">🆕 Nuevo</span>');
    if (p.tag && !p.destacado && !p.esNuevo) badges.push('<span class="badge">' + escapeHtml(p.tag) + '</span>');
    const badgeHtml = badges.length ? '<div class="prod-badges">' + badges.join('') + '</div>' : '';

    const imgHtml = p.foto_url
      ? '<img src="' + escapeHtml(p.foto_url) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"/>'
      : '<span style="font-size:32px;">' + escapeHtml(p.emoji) + '</span>';

    return (
      '<div class="prod-card st-product-card" data-id="' +
      p.id +
      '">' +
      badgeHtml +
      '<div class="prod-card-img">' +
      imgHtml +
      "</div>" +
      '<div class="prod-card-name">' +
      escapeHtml(p.name) +
      "</div>" +
      (p.marca ? '<div class="prod-card-brand">' + escapeHtml(p.marca) + '</div>' : '') +
      '<div class="prod-card-stock">stock: ' +
      p.stock +
      "</div>" +
      '<div class="prod-card-price">' +
      formatCLP(p.price) +
      "</div>" +
      '<div class="prod-card-actions">' +
      '<button type="button" class="btn btn-ghost st-edit-product" data-id="' +
      p.id +
      '">Editar</button>' +
      '<button type="button" class="btn btn-primary st-sell-product" data-id="' +
      p.id +
      '">Vender</button>' +
      "</div></div>"
    );
  }

  async function loadProducts() {
    const grid = document.getElementById("st-product-grid");
    if (!grid) return;

    const qEl = document.getElementById("st-product-search");
    const q = qEl ? qEl.value.trim() : new URLSearchParams(location.search).get("q") || "";
    if (qEl && q) qEl.value = q;

    const activeChip = document.querySelector(".st-cat-chip.active");
    const category = activeChip?.dataset.category || "";
    const lowOnly = document.getElementById("st-filter-low")?.checked;

    try {
      const data = await StockApi.products({ q, category: category || undefined, lowStock: lowOnly });
      state.products = data.items || [];
      grid.innerHTML = state.products.length
        ? state.products.map(productCardHtml).join("")
        : '<div class="card" style="grid-column:1/-1;text-align:center;padding:32px;color:var(--text2);">No hay productos. Agregá el primero con el botón de arriba.</div>';

      bindProductActions();
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  }

  async function renderCategoryChips() {
    const box = document.getElementById("st-categories");
    if (!box) return;
    const params = new URLSearchParams(location.search);
    const active = params.get("cat") || "";

    // Obtener categorías reales del negocio desde la API
    let cats = [];
    try {
      const res = await StockApi.categories();
      cats = (res.items || []).map(c => c.nombre);
    } catch (_) {
      // fallback: usar perfil
      cats = currentProfile().categories || [];
    }

    box.innerHTML =
      '<button type="button" class="chip st-cat-chip' +
      (active ? "" : " blue") +
      '" data-category="">Todos</button>' +
      cats
        .map(
          (c) =>
            '<button type="button" class="chip st-cat-chip' +
            (active === c ? " blue" : "") +
            '" data-category="' +
            escapeHtml(c) +
            '">' +
            escapeHtml(c) +
            "</button>"
        )
        .join("") +
      '<button type="button" class="chip err st-cat-chip" data-low="1">⚠ Stock bajo</button>';

    box.querySelectorAll(".st-cat-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        if (chip.dataset.low) {
          const f = document.getElementById("st-filter-low");
          if (f) f.checked = true;
        } else {
          box.querySelectorAll(".st-cat-chip").forEach((c) => c.classList.remove("blue"));
          chip.classList.add("blue");
          const f = document.getElementById("st-filter-low");
          if (f) f.checked = false;
        }
        loadProducts();
      });
    });
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = false; el.setAttribute('aria-hidden', 'false'); }
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.hidden = true; el.setAttribute('aria-hidden', 'true'); }
  }

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(m => {
        m.hidden = true;
      });
    }
  });

  // Click outside modal to close
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop') && !e.target.hidden) {
      e.target.hidden = true;
    }
  });

  function fillProductForm(product) {
    const form = document.getElementById("st-product-form");
    if (!form) return;
    form.dataset.id = product?.id || "";
    form.name.value = product?.name || "";
    form.barcode.value = product?.barcode || "";
    form.category.value = product?.category || "";
    form.emoji.value = product?.emoji || "📦";
    form.price.value = product?.price ?? "";
    form.stock.value = product?.stock ?? "";
    form.stockMin.value = product?.stockMin ?? 5;
    // Nuevos campos
    form.sku.value = product?.sku || product?.barcode || "";
    form.talla.value = product?.talla || "";
    form.material.value = product?.material || "";
    form.color.value = product?.color || "";
    form.marca.value = product?.marca || "";
    form.descripcion.value = product?.descripcion || "";
    form.dimensiones.value = product?.dimensiones || "";
    form.foto_url.value = product?.foto_url || "";

    // Mostrar/ocultar campo de talla según vertical
    const tallaGroup = document.querySelector('.st-talla-group');
    const vertical = (state.business?.vertical || '').toLowerCase();
    if (tallaGroup) {
      tallaGroup.hidden = !vertical.includes('cloth') && !vertical.includes('retail');
      if (!tallaGroup.hidden) {
        populateTallaOptions(form.talla, product?.talla);
      }
    }

    const title = document.getElementById("st-product-modal-title");
    if (title) title.textContent = product ? "Editar producto" : "Agregar producto";
    const delBtn = document.getElementById("st-delete-product");
    if (delBtn) delBtn.hidden = !product?.id;
  }

  function populateTallaOptions(selectEl, selectedValue) {
    const tallas = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42', 'Única'];
    selectEl.innerHTML = tallas.map(t => {
      const label = t || 'Sin talla';
      const sel = t === selectedValue ? ' selected' : '';
      return `<option value="${t}"${sel}>${label}</option>`;
    }).join('');
  }

  async function saveProductForm(e) {
    e.preventDefault();
    const form = document.getElementById("st-product-form");
    if (!form) return;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    const payload = {
      name: form.name.value.trim(),
      barcode: form.barcode.value.trim(),
      category: form.category.value.trim(),
      emoji: form.emoji.value.trim() || "📦",
      price: parseInt(form.price.value, 10) || 0,
      stock: parseInt(form.stock.value, 10) || 0,
      stockMin: parseInt(form.stockMin.value, 10) || 5,
      sku: form.sku?.value?.trim() || form.barcode.value.trim(),
      talla: form.talla?.value || null,
      material: form.material?.value?.trim() || null,
      color: form.color?.value?.trim() || null,
      marca: form.marca?.value?.trim() || null,
      descripcion: form.descripcion?.value?.trim() || null,
      dimensiones: form.dimensiones?.value?.trim() || null,
      foto_url: form.foto_url?.value?.trim() || null,
    };
    try {
      if (form.dataset.id) {
        await StockApi.updateProduct(parseInt(form.dataset.id, 10), payload);
        toast("Producto actualizado.");
      } else {
        await StockApi.createProduct(payload);
        toast("Producto creado.");
      }
      closeModal("st-product-modal");
      await loadProducts();
      const bizRes = await StockApi.business();
      if (bizRes.business) {
        state.business = bizRes.business;
        applyBusinessData();
      }
    } catch (err) {
      toast(apiErrorMessage(err), true);
    } finally {
      btn.disabled = false;
    }
  }

  function bindProductActions() {
    document.querySelectorAll(".st-edit-product").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        const product = state.products.find((p) => p.id === id);
        if (product) {
          fillProductForm(product);
          openModal("st-product-modal");
        }
      });
    });
    document.querySelectorAll(".st-sell-product").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id, 10);
        location.href = "ventas.html?product=" + id;
      });
    });
    document.querySelectorAll(".st-product-card").forEach((card) => {
      card.addEventListener("click", () => {
        const id = parseInt(card.dataset.id, 10);
        const product = state.products.find((p) => p.id === id);
        if (product) {
          fillProductForm(product);
          openModal("st-product-modal");
        }
      });
    });
  }

  function bindProductsPage() {
    renderCategoryChips();
    const params = new URLSearchParams(location.search);
    if (params.get("low") === "1") {
      const f = document.getElementById("st-filter-low");
      if (f) f.checked = true;
    }
    const search = document.getElementById("st-product-search");
    if (search) {
      let t;
      search.addEventListener("input", () => {
        clearTimeout(t);
        t = setTimeout(loadProducts, 300);
      });
    }
    document.getElementById("st-add-product")?.addEventListener("click", () => {
      fillProductForm(null);
      openModal("st-product-modal");
    });
    document.getElementById("st-import-products")?.addEventListener("click", () => {
      const input = document.getElementById("st-import-file");
      input?.click();
    });
    document.getElementById("st-import-file")?.addEventListener("change", async (event) => {
      const input = event.target;
      if (!input || !input.files || input.files.length === 0) return;
      const file = input.files[0];
      const feedback = document.getElementById("st-import-feedback");
      if (feedback) feedback.textContent = "Importando archivo...";
      try {
        const res = await StockApi.importProducts(file);
        await loadProducts();
        if (feedback) {
          feedback.textContent = `Importados: ${res.imported}. ${res.products.length} productos cargados.`;
        }
        toast(`Importados ${res.imported} productos.`);
      } catch (err) {
        if (feedback) feedback.textContent = "Error al importar CSV.";
        toast(apiErrorMessage(err), true);
      } finally {
        if (input) input.value = "";
      }
    });
    document.getElementById("st-product-form")?.addEventListener("submit", saveProductForm);
    document.getElementById("st-delete-product")?.addEventListener("click", async () => {
      const form = document.getElementById("st-product-form");
      const id = parseInt(form?.dataset.id || "", 10);
      if (!id || !confirm("¿Eliminar este producto del catálogo?")) return;
      try {
        await StockApi.deleteProduct(id);
        toast("Producto eliminado.");
        closeModal("st-product-modal");
        await loadProducts();
      } catch (err) {
        toast(apiErrorMessage(err), true);
      }
    });
    document.querySelectorAll(".st-modal-close").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.dataset.modal));
    });
    document.getElementById("st-go-scanner")?.addEventListener("click", () => {
      location.href = "scanner.html";
    });
    loadProducts();
  }

  function renderScannerResult() {
    const box = document.getElementById("st-scanner-result");
    if (!box) return;
    const p = state.scannerProduct;
    if (!p) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const total = p.price * state.scannerQty;
    box.innerHTML =
      '<div class="card">' +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">' +
      '<div class="prod-card-img" style="width:72px;height:72px;aspect-ratio:auto;margin:0;flex-shrink:0;font-size:32px;">' +
      escapeHtml(p.emoji) +
      "</div>" +
      '<div><div style="font-size:16px;font-weight:700;">' +
      escapeHtml(p.name) +
      '</div><div style="font-size:11px;color:var(--text3);font-family:monospace;">' +
      escapeHtml(p.barcode) +
      "</div>" +
      (p.lowStock ? '<span class="chip warn" style="margin-top:6px;">Stock bajo</span>' : "") +
      "</div></div>" +
      '<div class="stat-row" style="margin-bottom:14px;">' +
      '<div class="stat-card"><div class="stat-label">Stock</div><div class="stat-num">' +
      p.stock +
      '</div></div><div class="stat-card"><div class="stat-label">Precio</div><div class="stat-num">' +
      formatCLP(p.price) +
      "</div></div></div>" +
      '<div class="qty-control">' +
      '<button type="button" class="qty-btn st-qty-minus">−</button>' +
      '<div class="qty-display st-qty-display">' +
      state.scannerQty +
      "</div>" +
      '<button type="button" class="qty-btn plus st-qty-plus">+</button></div>' +
      '<div style="text-align:center;margin-bottom:14px;font-size:13px;color:var(--text2);">Total: <strong>' +
      formatCLP(total) +
      "</strong></div>" +
      '<button type="button" class="btn btn-primary btn-block st-sale-presencial" style="margin-bottom:8px;">🛍 Venta presencial</button>' +
      '<button type="button" class="btn btn-ghost btn-block st-sale-online">📦 Venta online</button>' +
      "</div>";

    box.querySelector(".st-qty-minus")?.addEventListener("click", () => {
      state.scannerQty = Math.max(1, state.scannerQty - 1);
      renderScannerResult();
    });
    box.querySelector(".st-qty-plus")?.addEventListener("click", () => {
      state.scannerQty = Math.min(state.scannerProduct.stock, state.scannerQty + 1);
      renderScannerResult();
    });
    box.querySelector(".st-sale-presencial")?.addEventListener("click", () => registerScannerSale("presencial"));
    box.querySelector(".st-sale-online")?.addEventListener("click", () => registerScannerSale("online"));
  }

  async function lookupBarcode(code) {
    const trimmed = (code || "").trim();
    if (!trimmed) {
      toast("Ingresá un código de barras.", true);
      return;
    }
    try {
      const res = await StockApi.lookupBarcode(trimmed);
      state.scannerProduct = res.product;
      state.scannerQty = 1;
      renderScannerResult();
      if (navigator.vibrate) navigator.vibrate(80);
    } catch (err) {
      state.scannerProduct = null;
      renderScannerResult();
      if (err instanceof ApiError && err.status === 404) {
        offerCreateProduct(trimmed);
      } else {
        toast(apiErrorMessage(err), true);
      }
    }
  }

  function offerCreateProduct(barcode) {
    const trimmed = (barcode || "").trim();
    if (!trimmed) return;
    if (!confirm("Producto no encontrado. ¿Crear uno nuevo con código " + trimmed + "?")) return;
    fillProductForm(null);
    const form = document.getElementById("st-product-form");
    if (form) form.barcode.value = trimmed;
    const input = document.getElementById("st-barcode-input");
    if (input) input.value = trimmed;
    openModal("st-product-modal");
  }

  let html5QrCode = null;
  let cameraScanLocked = false;

  function barcodeScanFormats() {
    if (typeof Html5QrcodeSupportedFormats === "undefined") return undefined;
    return [
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.ITF,
    ];
  }

  async function closeCameraScanner() {
    const modal = document.getElementById("st-camera-modal");
    const status = document.getElementById("st-camera-status");
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
        html5QrCode.clear();
      } catch (_) {
        /* cámara ya detenida */
      }
      html5QrCode = null;
    }
    cameraScanLocked = false;
    if (modal) modal.hidden = true;
    if (status) status.textContent = "Apuntá el código de barras…";
  }

  async function openCameraScanner() {
    if (typeof Html5Qrcode === "undefined") {
      toast("No se pudo cargar el lector de cámara. Recargá la página.", true);
      return;
    }

    const modal = document.getElementById("st-camera-modal");
    const status = document.getElementById("st-camera-status");
    if (!modal) return;

    await closeCameraScanner();
    modal.hidden = false;
    cameraScanLocked = false;
    if (status) status.textContent = "Apuntá el código de barras a la cámara…";

    html5QrCode = new Html5Qrcode("st-camera-reader");
    const scanConfig = {
      fps: 10,
      qrbox: { width: 280, height: 120 },
      aspectRatio: 1.777778,
    };
    const formats = barcodeScanFormats();
    if (formats) scanConfig.formatsToSupport = formats;

    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        scanConfig,
        (decodedText) => {
          if (cameraScanLocked) return;
          cameraScanLocked = true;
          const code = (decodedText || "").trim();
          closeCameraScanner().then(() => {
            const input = document.getElementById("st-barcode-input");
            if (input) input.value = code;
            lookupBarcode(code);
          });
        },
        () => {
          /* lectura en curso — ignorar ruido */
        }
      );
    } catch (err) {
      cameraScanLocked = false;
      html5QrCode = null;
      if (status) {
        status.textContent =
          "No pudimos abrir la cámara. Verificá permisos del navegador o usá el campo manual.";
      }
      toast("Cámara no disponible. Usá el código manual o un lector USB.", true);
    }
  }

  async function registerScannerSale(channel) {
    if (!state.scannerProduct) return;
    try {
      await StockApi.createSale({
        productId: state.scannerProduct.id,
        quantity: state.scannerQty,
        channel,
      });
      toast("Venta registrada · " + formatCLP(state.scannerProduct.price * state.scannerQty));
      state.scannerProduct = null;
      state.scannerQty = 1;
      const input = document.getElementById("st-barcode-input");
      if (input) {
        input.value = "";
        input.focus();
      }
      renderScannerResult();
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  }

  function bindScannerPage() {
    const input = document.getElementById("st-barcode-input");
    const form = document.getElementById("st-barcode-form");
    const scanButton = document.getElementById("st-btn-escanear");
    const fallbackText = document.getElementById("st-scanner-fallback");

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const hasCamera = devices.some((device) => device.kind === "videoinput");
        if (!hasCamera) {
          if (fallbackText) fallbackText.hidden = false;
          if (scanButton) scanButton.hidden = true;
        } else {
          if (fallbackText) fallbackText.hidden = true;
        }
      });
    }

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      lookupBarcode(input?.value);
    });

    input?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const code = e.target.value.trim();
        if (code) lookupBarcode(code);
        e.target.value = "";
      }
    });

    document.getElementById("st-btn-escanear")?.addEventListener("click", () => {
      openCameraScanner();
    });
    document.getElementById("st-camera-cancel")?.addEventListener("click", () => {
      closeCameraScanner();
    });
    document.getElementById("st-scanner-add")?.addEventListener("click", () => {
      fillProductForm(null);
      openModal("st-product-modal");
    });
    document.getElementById("st-product-form")?.addEventListener("submit", saveProductForm);
    document.querySelectorAll(".st-modal-close").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.dataset.modal));
    });
    if (input) input.focus();
  }

  async function loadSalesPage() {
    const select = document.getElementById("st-sale-product");
    const list = document.getElementById("st-sales-list");
    const params = new URLSearchParams(location.search);
    const preselect = params.get("product");

    try {
      const [productsRes, salesRes] = await Promise.all([
        StockApi.products(),
        StockApi.sales({ limit: 30 }),
      ]);
      state.products = productsRes.items || [];

      if (select) {
        select.innerHTML =
          '<option value="">Seleccioná un producto</option>' +
          state.products
            .map(
              (p) =>
                '<option value="' +
                p.id +
                '"' +
                (preselect === String(p.id) ? " selected" : "") +
                ">" +
                escapeHtml(p.name) +
                " — stock " +
                p.stock +
                " — " +
                formatCLP(p.price) +
                "</option>"
            )
            .join("");
      }

      if (list) {
        const sales = salesRes.items || [];
        const countEl = document.getElementById("st-sales-count");
        if (countEl) countEl.textContent = String(sales.length);
        list.innerHTML = sales.length
          ? sales.map(renderSaleRow).join("")
          : '<p style="padding:16px;color:var(--text2);">Sin ventas registradas.</p>';
      }
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  }

  function bindSalesPage() {
    const form = document.getElementById("st-sale-form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const productId = parseInt(form.productId.value, 10);
        const quantity = parseInt(form.quantity.value, 10) || 1;
        const channel = form.channel.value;
        await StockApi.createSale({ productId, quantity, channel });
        toast("Venta registrada.");
        form.reset();
        await loadSalesPage();
        const bizRes = await StockApi.business();
        if (bizRes.business) {
          state.business = bizRes.business;
          applyBusinessData();
        }
      } catch (err) {
        toast(apiErrorMessage(err), true);
      } finally {
        btn.disabled = false;
      }
    });
    loadSalesPage();
  }

  function appendChatMessage(role, text) {
    const stream = document.querySelector(".st-chat-stream");
    if (!stream) return;
    const isUser = role === "user";
    const avatar = isUser ? initials(state.user?.name || "Tú") : "";
    const aiIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg>';
    const html =
      '<div class="msg' +
      (isUser ? " you" : "") +
      '">' +
      '<div class="msg-avatar' +
      (isUser ? "" : " ai") +
      '">' +
      (isUser ? avatar : aiIcon) +
      "</div>" +
      '<div class="msg-body">' +
      '<div class="msg-name">' +
      (isUser ? "Tú" : "Geo") +
      "</div>" +
      '<div class="msg-content">' +
      escapeHtml(text).replace(/\n/g, "<br>") +
      "</div></div></div>";
    stream.insertAdjacentHTML("beforeend", html);
    stream.scrollTop = stream.scrollHeight;
  }

  async function sendChatMessage(text) {
    const input = document.querySelector(".st-chat-input");
    appendChatMessage("user", text);
    if (input) input.value = "";
    const thinking = document.createElement("div");
    thinking.className = "msg st-chat-thinking";
    thinking.innerHTML =
      '<div class="msg-avatar ai"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg></div>' +
      '<div class="msg-body"><div class="msg-name">Geo</div><div class="msg-content" style="color:var(--text2);">Pensando…</div></div>';
    const stream = document.querySelector(".st-chat-stream");
    stream?.appendChild(thinking);
    stream && (stream.scrollTop = stream.scrollHeight);
    try {
      const res = await StockApi.chat({
        message: text,
        conversationId: state.conversationId,
      });
      thinking.remove();
      if (res.conversationId != null) state.conversationId = res.conversationId;
      appendChatMessage("assistant", res.reply || "Listo.");
    } catch (err) {
      thinking.remove();
      appendChatMessage("assistant", apiErrorMessage(err));
    }
  }

  function bindChat() {
    const input = document.querySelector(".st-chat-input");
    const sendBtn = document.querySelector(".st-chat-send");
    const stream = document.querySelector(".st-chat-stream");
    if (!input || !stream) return;

    const clientName = state.user?.name || state.business?.name || "Cliente";
    const example = currentProfile().chatExample || '"¿Qué vendí más esta semana?"';
    stream.innerHTML =
      '<div class="msg"><div class="msg-avatar ai"><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1.4" fill="white"/></svg></div>' +
      '<div class="msg-body"><div class="msg-name">Geo</div><div class="msg-content">Hola ' +
      escapeHtml(clientName) +
      " 👋 Soy Geos 3.1. Puedo ayudarte con tu inventario: consultas de stock, ventas y " +
      example +
      ".</div></div></div>";

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
    document.querySelectorAll(".st-chat-sug").forEach((el) => {
      if (el.classList.contains("st-chat-example")) {
        const ex = (currentProfile().chatExample || "").replace(/^["']|["']$/g, "");
        if (ex) {
          el.dataset.prompt = ex;
          el.textContent = "💬 " + ex;
        } else {
          el.hidden = true;
        }
      }
      el.addEventListener("click", () => {
        const t = el.dataset.prompt || el.textContent.replace(/^[^\s]+\s*/, "").trim();
        input.value = t;
        input.focus();
      });
    });
    document.querySelector(".st-chat-clear")?.addEventListener("click", () => {
      state.conversationId = null;
      bindChat();
    });
  }

  async function bindSettingsPage() {
    const form = document.getElementById("st-settings-form");
    const verticalSelect = document.getElementById("st-vertical-select");
    const nameField = document.querySelector(".st-business-name-field");
    const emailField = document.querySelector(".st-client-email");
    if (nameField) nameField.value = state.business?.name || "";
    if (emailField) emailField.value = state.user?.email || "";
    if (verticalSelect) {
      try {
        const data = await StockApi.verticals();
        verticalSelect.innerHTML = (data.verticals || [])
          .map(
            (v) =>
              '<option value="' +
              v.id +
              '"' +
              (state.business?.vertical === v.id ? " selected" : "") +
              ">" +
              v.emoji +
              " " +
              escapeHtml(v.label) +
              "</option>"
          )
          .join("");
      } catch (err) {
        toast(apiErrorMessage(err), true);
      }
    }
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const vertical = verticalSelect?.value;
        if (vertical && vertical !== state.business?.vertical) {
          const res = await StockApi.setVertical(vertical);
          state.business = res.business;
          state.profile = res.business.profile;
        }
        toast("Configuración guardada.");
        applyBusinessData();
      } catch (err) {
        toast(apiErrorMessage(err), true);
      } finally {
        btn.disabled = false;
      }
    });
  }

  function initLogin() {
    const form = document.getElementById("st-login-form");
    const googleBtn = document.getElementById("st-google-login");
    const errEl = document.getElementById("st-login-error");
    const params = new URLSearchParams(location.search);
    const next = resolveNextPage(params.get("next"));

    const hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
    const oauthToken = hashParams.get("token");
    const oauthError = hashParams.get("error");
    if (oauthToken) {
      StockAuth.set(decodeURIComponent(oauthToken));
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

    if (StockAuth.get()) {
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
        await StockApi.login({ email, password });
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
    bindLogout();
    bindMobileNav();
    try {
      const ok = await loadBusinessContext();
      if (!ok) return;
      if (PAGE === "dashboard") await loadDashboard();
      if (PAGE === "productos") bindProductsPage();
      if (PAGE === "scanner") bindScannerPage();
      if (PAGE === "ventas") bindSalesPage();
      if (PAGE === "chat") bindChat();
      if (PAGE === "configuracion") await bindSettingsPage();
    } catch (err) {
      toast(apiErrorMessage(err), true);
    }
  });
})();
