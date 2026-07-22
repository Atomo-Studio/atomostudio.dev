// api.js — Stock backend service layer
// Backend de Stock — token separado de SiteDesk para evitar mezcla de sesiones.

function resolveStockApiUrl() {
  const explicit =
    (typeof window !== "undefined" && window.__STOCK_CONFIG__?.apiUrl) ||
    (typeof document !== "undefined" &&
      document.querySelector('meta[name="stock-api-url"]')?.content);
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  if (host === "stock.atomostudio.dev") {
    return "https://stock-api.atomostudio.dev";
  }
  if (explicit && !/localhost|127\.0\.0\.1/.test(explicit)) return explicit;
  return explicit || "http://localhost:8001";
}

const API_URL = resolveStockApiUrl();
const USE_MOCK = false;

const TOKEN_KEY = "stock_token";
const StockAuth = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch {} },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} },
};

class ApiError extends Error {
  constructor(status, detail) {
    super(detail || ("Error " + status));
    this.status = status;
    this.detail = detail;
  }
}

async function apiFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = StockAuth.get();
    if (token) {
      headers["Authorization"] = "Bearer " + token;
      headers["X-Auth-Token"] = token;
    }
  }
  let payload;
  if (body && typeof body === "object" && body instanceof FormData) {
    payload = body;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers,
      body: payload,
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor.");
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const detail = (data && (data.detail || data.message)) || null;
    throw new ApiError(res.status, detail);
  }
  return data;
}

function apiErrorMessage(err) {
  if (!(err instanceof ApiError)) return "Ocurrió un error inesperado.";
  const detail = err.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return [item.row ? `Fila ${item.row}` : null, item.errors?.join(", ") || null]
            .filter(Boolean)
            .join(": ");
        }
        return String(item);
      })
      .join("; ");
  }
  switch (err.status) {
    case 0:   return "Sin conexión con el servidor.";
    case 401: return "Tu sesión expiró. Inicia sesión otra vez.";
    case 404: return detail || "No encontrado.";
    case 409: return detail || "Conflicto con datos existentes.";
    default:  return detail || "Ocurrió un error. Intenta de nuevo.";
  }
}

function formatCLP(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return "$" + Math.floor(n / 1_000_000) + "M";
  if (n >= 1_000) return "$" + Math.floor(n / 1_000) + "k";
  return "$" + n.toLocaleString("es-CL");
}

const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

let mockProductId = 10;
let mockSaleId = 100;

const MOCK_BUSINESS = {
  id: 1,
  slug: "don-pancho",
  name: "Don Pancho",
  rubroLabel: "Ferretería",
  currency: "CLP",
  vertical: "hardware",
  needsVerticalSetup: false,
  profile: null,
  summary: {
    productCount: 0,
    productsOk: 0,
    salesToday: "$0",
    salesTodayRaw: 0,
    unitsToday: 0,
    lowStockCount: 0,
  },
};

const MOCK_PRODUCTS = [
  { id: 1, name: "Taladro Bosch GSB", barcode: "7891234567890", category: "Herramientas", emoji: "🔧", price: 89990, stock: 4, stockMin: 5, lowStock: true, active: true },
  { id: 2, name: "Pintura blanca 4L", barcode: "7891234567891", category: "Pintura", emoji: "🎨", price: 24990, stock: 18, stockMin: 5, lowStock: false, active: true },
  { id: 3, name: "Tornillos 1/4\" x100", barcode: "7891234567892", category: "Tornillería", emoji: "🔩", price: 4500, stock: 86, stockMin: 10, lowStock: false, active: true },
  { id: 4, name: "Set destornilladores", barcode: "7891234567893", category: "Herramientas", emoji: "🪛", price: 12990, stock: 12, stockMin: 5, lowStock: false, active: true },
];

const MOCK_SALES = [];

function mockRecomputeSummary() {
  const active = MOCK_PRODUCTS.filter((p) => p.active);
  const today = new Date().toDateString();
  const todaySales = MOCK_SALES.filter((s) => new Date(s.createdAt).toDateString() === today);
  const salesRaw = todaySales.reduce((a, s) => a + s.total, 0);
  const units = todaySales.reduce((a, s) => a + s.quantity, 0);
  MOCK_BUSINESS.summary = {
    productCount: active.length,
    productsOk: active.filter((p) => p.stock >= p.stockMin).length,
    lowStockCount: active.filter((p) => p.stock < p.stockMin).length,
    salesToday: formatCLP(salesRaw),
    salesTodayRaw: salesRaw,
    unitsToday: units,
  };
}

function mockSyncLowStock(p) {
  p.lowStock = p.stock < p.stockMin;
  return p;
}

mockRecomputeSummary();

const MockApi = {
  async login({ email, password }) {
    await mockDelay();
    StockAuth.set("mock-token");
    return { token: "mock-token", user: { email, tier: 0 } };
  },
  async me() {
    await mockDelay();
    return { email: "don.pancho@example.cl", name: "Don Pancho", tier: 0 };
  },
  async business() {
    await mockDelay();
    mockRecomputeSummary();
    const biz = { ...MOCK_BUSINESS, summary: { ...MOCK_BUSINESS.summary } };
    if (window.StockVerticals) {
      biz.profile = StockVerticals.getVerticalProfile(biz.vertical);
    }
    return { needsSetup: false, business: biz };
  },
  async dashboard() {
    await mockDelay();
    mockRecomputeSummary();
    const low = MOCK_PRODUCTS.filter((p) => p.active && p.lowStock).slice(0, 6);
    return {
      summary: { ...MOCK_BUSINESS.summary },
      recentSales: MOCK_SALES.slice(0, 8).map((s) => ({ ...s })),
      lowStockProducts: low.map((p) => ({ ...p })),
    };
  },
  async verticals() {
    await mockDelay();
    return {
      verticals: window.StockVerticals ? StockVerticals.listVerticalOptions() : [],
    };
  },
  async setVertical(vertical) {
    await mockDelay();
    MOCK_BUSINESS.vertical = vertical;
    MOCK_BUSINESS.needsVerticalSetup = false;
    if (window.StockVerticals) {
      const profile = StockVerticals.getVerticalProfile(vertical);
      MOCK_BUSINESS.profile = profile;
      MOCK_BUSINESS.rubroLabel = profile.businessType;
    }
    mockRecomputeSummary();
    return { ok: true, business: { ...MOCK_BUSINESS } };
  },
  async products({ q, category, lowStock } = {}) {
    await mockDelay();
    let items = MOCK_PRODUCTS.filter((p) => p.active);
    if (q) {
      const needle = q.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(needle) || (p.barcode || "").includes(needle)
      );
    }
    if (category) items = items.filter((p) => p.category === category);
    if (lowStock) items = items.filter((p) => p.lowStock);
    return { items: items.map((p) => ({ ...p })), total: items.length };
  },
  async lookupBarcode(code) {
    await mockDelay();
    const product = MOCK_PRODUCTS.find((p) => p.active && p.barcode === code);
    if (!product) throw new ApiError(404, "Producto no encontrado");
    return { product: { ...product } };
  },
  async createProduct(data) {
    await mockDelay();
    const product = mockSyncLowStock({
      id: ++mockProductId,
      name: data.name,
      barcode: data.barcode || "",
      category: data.category || "",
      emoji: data.emoji || "📦",
      price: data.price || 0,
      stock: data.stock || 0,
      stockMin: data.stockMin ?? 5,
      active: true,
    });
    MOCK_PRODUCTS.push(product);
    mockRecomputeSummary();
    return { ok: true, product: { ...product } };
  },
  async importProducts(file) {
    await mockDelay();
    if (!file || !file.name) {
      throw new ApiError(400, "Archivo inválido");
    }
    return { ok: true, imported: 0, products: [] };
  },
  async updateProduct(id, data) {
    await mockDelay();
    const idx = MOCK_PRODUCTS.findIndex((p) => p.id === id);
    if (idx < 0) throw new ApiError(404, "Producto no encontrado");
    const p = MOCK_PRODUCTS[idx];
    if (data.name != null) p.name = data.name;
    if (data.barcode != null) p.barcode = data.barcode;
    if (data.category != null) p.category = data.category;
    if (data.emoji != null) p.emoji = data.emoji;
    if (data.price != null) p.price = data.price;
    if (data.stock != null) p.stock = data.stock;
    if (data.stockMin != null) p.stockMin = data.stockMin;
    if (data.active != null) p.active = data.active;
    mockSyncLowStock(p);
    mockRecomputeSummary();
    return { ok: true, product: { ...p } };
  },
  async deleteProduct(id) {
    await mockDelay();
    const p = MOCK_PRODUCTS.find((x) => x.id === id);
    if (!p) throw new ApiError(404, "Producto no encontrado");
    p.active = false;
    mockRecomputeSummary();
    return { ok: true };
  },
  async sales({ limit } = {}) {
    await mockDelay();
    const items = MOCK_SALES.slice(0, limit || 50).map((s) => ({ ...s }));
    return { items };
  },
  async createSale({ productId, quantity, channel }) {
    await mockDelay();
    const product = MOCK_PRODUCTS.find((p) => p.id === productId && p.active);
    if (!product) throw new ApiError(404, "Producto no encontrado");
    if (product.stock < quantity) {
      throw new ApiError(400, "Stock insuficiente (disponible: " + product.stock + ")");
    }
    product.stock -= quantity;
    mockSyncLowStock(product);
    const total = product.price * quantity;
    const sale = {
      id: ++mockSaleId,
      productId: product.id,
      productName: product.name,
      emoji: product.emoji,
      quantity,
      unitPrice: product.price,
      total,
      channel: channel || "presencial",
      createdAt: new Date().toISOString(),
    };
    MOCK_SALES.unshift(sale);
    mockRecomputeSummary();
    return {
      ok: true,
      sale: { ...sale },
      product: { ...product },
      summary: { ...MOCK_BUSINESS.summary },
    };
  },
  async chat({ message, conversationId }) {
    await mockDelay(800);
    return {
      reply: "Entendido. En modo demo te respondo con datos de ejemplo. Conectá el backend real para usar Geos 3.1 con tu inventario.",
      conversationId: conversationId || 1,
      usage: { used: 1, limit: 50 },
    };
  },
};

const RealApi = {
  login: ({ email, password }) =>
    apiFetch("/auth/login", { method: "POST", auth: false, body: { email, password } })
      .then((d) => { if (d?.token) StockAuth.set(d.token); return d; }),

  me: () => apiFetch("/auth/me"),

  businesses: () => apiFetch("/stock/businesses"),

  business: async (slug, negocioId) => {
    const params = new URLSearchParams();
    if (slug) params.set("slug", slug);
    if (negocioId) params.set("negocio_id", negocioId);
    const qs = params.toString();
    const biz = await apiFetch("/stock/business" + (qs ? "?" + qs : ""));
    if (!biz || !biz.id) return { needsSetup: true, business: null };
    return { needsSetup: false, business: biz };
  },

  dashboard: (slug, negocioId) => {
    const params = new URLSearchParams();
    if (slug) params.set("slug", slug);
    if (negocioId) params.set("negocio_id", negocioId);
    const qs = params.toString();
    return apiFetch("/stock/dashboard" + (qs ? "?" + qs : ""));
  },

  verticals: () => apiFetch("/stock/verticals"),

  setVertical: (vertical) =>
    apiFetch("/stock/business", { method: "PATCH", body: { vertical } }),

  products: ({ q, category, lowStock, slug, negocio_id } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (lowStock) params.set("low_stock", "true");
    if (slug) params.set("slug", slug);
    if (negocio_id) params.set("negocio_id", negocio_id);
    const qs = params.toString();
    return apiFetch("/stock/products" + (qs ? "?" + qs : ""));
  },

  lookupBarcode: (code) =>
    apiFetch("/stock/products/barcode/" + encodeURIComponent(code)),

  createProduct: (data) =>
    apiFetch("/stock/products", {
      method: "POST",
      body: {
        name: data.name,
        barcode: data.barcode || null,
        category: data.category || null,
        foto_url: data.fotoUrl || null,
        emoji: data.emoji || "📦",
        price: data.price ?? 0,
        stock: data.stock ?? 0,
        stockMin: data.stockMin ?? 5,
      },
    }),

  updateProduct: (id, data) => {
    const body = {};
    if (data.name != null) body.name = data.name;
    if (data.barcode != null) body.barcode = data.barcode;
    if (data.category != null) body.category = data.category;
    if (data.fotoUrl != null) body.foto_url = data.fotoUrl;
    if (data.emoji != null) body.emoji = data.emoji;
    if (data.price != null) body.price = data.price;
    if (data.stock != null) body.stock = data.stock;
    if (data.stockMin != null) body.stockMin = data.stockMin;
    if (data.active != null) body.active = data.active;
    return apiFetch("/stock/products/" + id, { method: "PATCH", body });
  },

  deleteProduct: (id) =>
    apiFetch("/stock/products/" + id, { method: "DELETE" }),
  importProducts: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch("/stock/products/import", { method: "POST", body: form });
  },

  sales: ({ limit, slug, negocio_id } = {}) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", limit);
    if (slug) params.set("slug", slug);
    if (negocio_id) params.set("negocio_id", negocio_id);
    const qs = params.toString();
    return apiFetch("/stock/sales" + (qs ? "?" + qs : ""));
  },

  createSale: ({ productId, quantity, channel }) =>
    apiFetch("/stock/sales", {
      method: "POST",
      body: { productId, quantity, channel: channel || "presencial" },
    }),

  chat: ({ message, conversationId }) => {
    const body = { message };
    if (conversationId != null) body.conversationId = conversationId;
    return apiFetch("/chat", { method: "POST", body });
  },
};

const StockApi = RealApi; /* Forzado a backend real */

function stockOAuthReturnUrl(nextPage) {
  const next = nextPage || "app.html";
  return location.origin + location.pathname + "?next=" + encodeURIComponent(next);
}

function googleOAuthUrl(nextPage) {
  if (USE_MOCK) return null;
  const returnTo = encodeURIComponent(stockOAuthReturnUrl(nextPage));
  return API_URL + "/auth/google?return_to=" + returnTo;
}

Object.assign(window, {
  StockApi,
  StockAuth,
  ApiError,
  apiErrorMessage,
  formatCLP,
  API_URL,
  USE_MOCK,
  googleOAuthUrl,
  stockOAuthReturnUrl,
});
