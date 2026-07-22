// api.js — SiteDesk backend service layer
// Backend independiente: backend-sitedesk (puerto 8002)

const SITEDESK_API_URL = (typeof window !== "undefined" && window.location.hostname !== "localhost")
  ? "https://sitedesk-api.atomostudio.dev"
  : "http://localhost:8002";

const SITEDESK_TOKEN_KEY = "sitedesk_token";

const SiteDeskAuth = {
  get token() {
    try { return localStorage.getItem(SITEDESK_TOKEN_KEY); } catch { return null; }
  },
  set token(t) {
    try { localStorage.setItem(SITEDESK_TOKEN_KEY, t); } catch {}
  },
  get user() {
    try { return JSON.parse(localStorage.getItem("sitedesk_user") || "null"); } catch { return null; }
  },
  set user(u) {
    try { localStorage.setItem("sitedesk_user", JSON.stringify(u)); } catch {}
  },
  clear() {
    try { localStorage.removeItem(SITEDESK_TOKEN_KEY); localStorage.removeItem("sitedesk_user"); } catch {}
  },

  async login(email, password) {
    const res = await fetch(SITEDESK_API_URL + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Error de conexión" }));
      throw new Error(err.detail || "Credenciales inválidas");
    }
    const data = await res.json();
    this.token = data.token;
    return this.me();
  },

  async register(email, password, name, acceptTerms = true) {
    const res = await fetch(SITEDESK_API_URL + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, acceptTerms }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Error de conexión" }));
      throw new Error(err.detail || "Error al registrar");
    }
    const data = await res.json();
    this.token = data.token;
    return data.user;
  },

  async me() {
    const token = this.token;
    const res = await fetch(SITEDESK_API_URL + "/auth/me", {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) {
      this.clear();
      throw new Error("Sesión expirada");
    }
    const user = await res.json();
    this.user = user;
    return user;
  },

  logout() {
    this.clear();
  },
};

async function sitedeskFetch(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = SiteDeskAuth.token;
    if (!token) throw new Error("No autenticado");
    headers["Authorization"] = "Bearer " + token;
  }
  if (body) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(SITEDESK_API_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail;
    try { const j = await res.json(); detail = j.detail; } catch { detail = res.statusText; }
    throw new Error(detail || ("Error " + res.status));
  }
  return res.json();
}

// Métodos de conveniencia
const SiteDeskSite = {
  get: () => sitedeskFetch("/site"),
};

const SiteDeskContent = {
  list: () => sitedeskFetch("/content"),
  save: (data) => sitedeskFetch("/content", { method: "PATCH", body: data }),
};

const SiteDeskHistory = {
  list: () => sitedeskFetch("/history"),
};

const SiteDeskPublish = {
  publish: () => sitedeskFetch("/publish", { method: "POST", body: {} }),
};

const SiteDeskChat = {
  send: (message) => sitedeskFetch("/chat", { method: "POST", body: { message } }),
};

// ─── API unificada (usada por index.html y otras vistas) ──────────────────
const SiteDeskApi = {
  me:      () => SiteDeskAuth.me(),
  sites:   () => sitedeskFetch("/sites"),
  site:    (slug) => sitedeskFetch("/site" + (slug ? "?slug=" + encodeURIComponent(slug) : "")),
  history: () => sitedeskFetch("/history"),
  content: () => sitedeskFetch("/content"),
  publish: () => sitedeskFetch("/publish", { method: "POST", body: {} }),
  chat:    (message) => sitedeskFetch("/chat", { method: "POST", body: { message } }),
};

// ─── Sitio activo (persiste en localStorage) ──────────────────────────────
const SiteDeskActiveSite = {
  _KEY: "sitedesk_active_site",
  get() {
    try { return JSON.parse(localStorage.getItem(this._KEY) || "null"); } catch { return null; }
  },
  set(site) {
    try { localStorage.setItem(this._KEY, JSON.stringify(site)); } catch {}
  },
  clear() {
    try { localStorage.removeItem(this._KEY); } catch {}
  },
};

