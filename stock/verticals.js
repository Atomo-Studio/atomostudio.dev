// verticals.js — Perfiles de rubro Stock (espejo de geo-backend/stock_verticals.py)
(function () {
  "use strict";

  const VERTICAL_PROFILES = {
    generic: {
      id: "generic",
      label: "Negocio general",
      emoji: "📦",
      description: "Inventario genérico para cualquier rubro.",
      businessType: "Mi negocio",
      catalogNav: "Catálogo",
      productSingular: "producto",
      productPlural: "productos",
      onboardingTitle: "Escanea. Vende.\nListo.",
      onboardingSubtitle: "Pasa el código y registra la venta en segundos.",
      categories: ["General", "Ofertas"],
      chatExample: '"¿Qué vendí más esta semana?"',
      demoSummary: { productCount: 48, productsOk: 40, salesToday: "$82k", unitsToday: 14, lowStockCount: 3 },
    },
    hardware: {
      id: "hardware",
      label: "Ferretería",
      emoji: "🔧",
      description: "Herramientas, pintura y tornillería.",
      businessType: "Ferretería",
      catalogNav: "Catálogo",
      productSingular: "producto",
      productPlural: "productos",
      onboardingTitle: "Escanea. Vende.\nListo.",
      onboardingSubtitle: "Pasa el código y registra la venta en segundos. Sin cobro por escaneo.",
      categories: ["Herramientas", "Pintura", "Tornillería"],
      chatExample: '"¿Qué herramienta vendí más?"',
      demoSummary: { productCount: 142, productsOk: 86, salesToday: "$148k", unitsToday: 23, lowStockCount: 5 },
    },
    retail_clothing: {
      id: "retail_clothing",
      label: "Tienda de ropa",
      emoji: "👕",
      description: "Prendas, tallas y colecciones.",
      businessType: "Tienda de ropa",
      catalogNav: "Catálogo",
      productSingular: "prenda",
      productPlural: "prendas",
      onboardingTitle: "Tu tienda,\nsiempre al día.",
      onboardingSubtitle: "Escaneá códigos de barras o SKU y registrá ventas al instante.",
      categories: ["Poleras", "Pantalones", "Accesorios"],
      chatExample: '"¿Qué talla se vendió más?"',
      demoSummary: { productCount: 96, productsOk: 72, salesToday: "$215k", unitsToday: 18, lowStockCount: 4 },
    },
    butcher: {
      id: "butcher",
      label: "Carnicería",
      emoji: "🥩",
      description: "Cortes, precios por kilo y stock fresco.",
      businessType: "Carnicería",
      catalogNav: "Mis cortes",
      productSingular: "corte",
      productPlural: "cortes",
      onboardingTitle: "Stock fresco,\nbajo control.",
      onboardingSubtitle: "Registrá ventas por kilo y controlá reposición de cortes.",
      categories: ["Vacuno", "Cerdo", "Aves"],
      chatExample: '"¿Cuánto vendí de asado esta semana?"',
      demoSummary: { productCount: 34, productsOk: 28, salesToday: "$312k", unitsToday: 41, lowStockCount: 2 },
    },
    restaurant: {
      id: "restaurant",
      label: "Restaurant / comida",
      emoji: "🍽️",
      description: "Insumos, platos y menú del día.",
      businessType: "Restaurant",
      catalogNav: "Insumos",
      productSingular: "insumo",
      productPlural: "insumos",
      onboardingTitle: "Tu cocina,\norganizada.",
      onboardingSubtitle: "Controlá insumos y ventas del menú en un solo lugar.",
      categories: ["Verduras", "Carnes", "Bebidas"],
      chatExample: '"¿Qué insumo se agota más rápido?"',
      demoSummary: { productCount: 58, productsOk: 44, salesToday: "$189k", unitsToday: 67, lowStockCount: 6 },
    },
    pharmacy: {
      id: "pharmacy",
      label: "Farmacia",
      emoji: "💊",
      description: "Medicamentos y productos de salud.",
      businessType: "Farmacia",
      catalogNav: "Catálogo",
      productSingular: "producto",
      productPlural: "productos",
      onboardingTitle: "Inventario\nconfiable.",
      onboardingSubtitle: "Escaneá códigos y controlá stock con alertas de reposición.",
      categories: ["Medicamentos", "Higiene", "Suplementos"],
      chatExample: '"¿Qué producto vence primero?"',
      demoSummary: { productCount: 210, productsOk: 198, salesToday: "$96k", unitsToday: 31, lowStockCount: 7 },
    },
    grocery: {
      id: "grocery",
      label: "Almacén / minimarket",
      emoji: "🛒",
      description: "Abarrotes y productos de consumo diario.",
      businessType: "Almacén",
      catalogNav: "Catálogo",
      productSingular: "producto",
      productPlural: "productos",
      onboardingTitle: "Tu almacén,\nal día.",
      onboardingSubtitle: "Vendé rápido con escáner y sabé qué reponer.",
      categories: ["Abarrotes", "Bebidas", "Limpieza"],
      chatExample: '"¿Qué se vendió más hoy?"',
      demoSummary: { productCount: 320, productsOk: 285, salesToday: "$124k", unitsToday: 52, lowStockCount: 8 },
    },
  };

  function normalizeVertical(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase().replace(/-/g, "_");
    if (VERTICAL_PROFILES[key]) return key;
    const aliases = {
      ferreteria: "hardware",
      ferretería: "hardware",
      ropa: "retail_clothing",
      clothing: "retail_clothing",
      ecommerce: "retail_clothing",
      carniceria: "butcher",
      carnicería: "butcher",
      comida: "restaurant",
      gastronomia: "restaurant",
      gastronomía: "restaurant",
      farmacia: "pharmacy",
      almacen: "grocery",
      almacén: "grocery",
      minimarket: "grocery",
    };
    return aliases[key] || null;
  }

  function getVerticalProfile(vertical) {
    const key = normalizeVertical(vertical) || "generic";
    return VERTICAL_PROFILES[key] || VERTICAL_PROFILES.generic;
  }

  function listVerticalOptions() {
    return Object.values(VERTICAL_PROFILES).map((p) => ({
      id: p.id,
      label: p.label,
      emoji: p.emoji,
      description: p.description,
    }));
  }

  window.StockVerticals = {
    VERTICAL_PROFILES,
    normalizeVertical,
    getVerticalProfile,
    listVerticalOptions,
  };
})();
