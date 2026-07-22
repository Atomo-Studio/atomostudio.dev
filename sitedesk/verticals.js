// verticals.js — Perfiles de rubro SiteDesk (espejo de geo-backend/sitedesk_verticals.py)
(function () {
  "use strict";

  const VERTICAL_PROFILES = {
    generic: {
      id: "generic",
      label: "Negocio general",
      emoji: "📦",
      description: "Catálogo y textos genéricos para cualquier rubro.",
      productsNav: "Mis Productos",
      productsTitle: "Mis Productos",
      productsSubtitle: "Los productos o servicios que aparecen en su sitio.",
      productsAdd: "Agregar producto",
      productsAddEmpty: "Agregar otro producto",
      productsTip: "Arrastre las cartas para reordenar. Los ítems ocultos no aparecen para sus clientes.",
      quickProducts: "Agregar un producto",
      quickProductsSub: "Sumar al catálogo",
      chatExample: '"Cámbiame el precio de un producto"',
      chatSuggestionAdd: "Agregar un producto nuevo",
      galleryTitle: "Galería de fotos",
      gallerySubtitle: "Las fotos que aparecen en su sitio.",
      galleryQuickSub: "A la galería",
      animSectionProducts: "Listado de productos",
      previewEmoji: "📦",
    },
    butcher: {
      id: "butcher",
      label: "Carnicería",
      emoji: "🥩",
      description: "Cortes, categorías de carne y precios por kilo.",
      productsNav: "Mis Cortes",
      productsTitle: "Mis Cortes",
      productsSubtitle: "Los cortes que aparecen en su sitio. Doble clic en el precio para cambiarlo.",
      productsAdd: "Agregar corte",
      productsAddEmpty: "Agregar otro corte",
      productsTip: "Arrastre las cartas para reordenar. Los cortes ocultos no aparecen para sus clientes.",
      quickProducts: "Agregar un corte",
      quickProductsSub: "Sumar al menú de cortes",
      chatExample: '"Cámbiame el precio del asado"',
      chatSuggestionAdd: "Agregar un corte nuevo",
      galleryTitle: "Galería de fotos",
      gallerySubtitle: "Fotos del local, vitrina y productos.",
      galleryQuickSub: "A la galería",
      animSectionProducts: "Listado de cortes",
      previewEmoji: "🥩",
    },
    beauty_salon: {
      id: "beauty_salon",
      label: "Peluquería / salón",
      emoji: "✂️",
      description: "Servicios, peinados, color y reservas.",
      productsNav: "Mis Servicios",
      productsTitle: "Servicios y precios",
      productsSubtitle: "Los servicios que ofrece en su salón. Doble clic en el precio para cambiarlo.",
      productsAdd: "Agregar servicio",
      productsAddEmpty: "Agregar otro servicio",
      productsTip: "Ordene sus servicios por popularidad. Los ocultos no se muestran al público.",
      quickProducts: "Agregar un servicio",
      quickProductsSub: "Sumar a la carta de servicios",
      chatExample: '"Cambia el precio del corte de mujer"',
      chatSuggestionAdd: "Agregar un servicio nuevo",
      galleryTitle: "Galería de trabajos",
      gallerySubtitle: "Fotos de peinados, color y trabajos que aparecen en su sitio.",
      galleryQuickSub: "A la galería de trabajos",
      animSectionProducts: "Listado de servicios",
      previewEmoji: "✂️",
    },
    retail_clothing: {
      id: "retail_clothing",
      label: "Tienda de ropa",
      emoji: "👕",
      description: "Prendas, tallas y colecciones.",
      productsNav: "Mi Catálogo",
      productsTitle: "Mi Catálogo",
      productsSubtitle: "Las prendas que aparecen en su tienda. Doble clic en el precio para cambiarlo.",
      productsAdd: "Agregar prenda",
      productsAddEmpty: "Agregar otra prenda",
      productsTip: "Ordene las prendas como quiera que las vean sus clientes. Las ocultas quedan guardadas.",
      quickProducts: "Agregar una prenda",
      quickProductsSub: "Sumar al catálogo",
      chatExample: '"Agrega una polera talla M a $19.990"',
      chatSuggestionAdd: "Agregar una prenda nueva",
      galleryTitle: "Galería de fotos",
      gallerySubtitle: "Fotos de prendas, lookbook y tienda.",
      galleryQuickSub: "A la galería",
      animSectionProducts: "Listado del catálogo",
      previewEmoji: "👕",
    },
    restaurant: {
      id: "restaurant",
      label: "Restaurant / comida",
      emoji: "🍽️",
      description: "Platos, menú del día y categorías.",
      productsNav: "Mi Menú",
      productsTitle: "Mi Menú",
      productsSubtitle: "Los platos que aparecen en su sitio. Doble clic en el precio para cambiarlo.",
      productsAdd: "Agregar plato",
      productsAddEmpty: "Agregar otro plato",
      productsTip: "Organice entradas, fondos y postres. Los platos ocultos no se muestran al público.",
      quickProducts: "Agregar un plato",
      quickProductsSub: "Sumar al menú",
      chatExample: '"Actualiza el precio del menú del día"',
      chatSuggestionAdd: "Agregar un plato nuevo",
      galleryTitle: "Galería de fotos",
      gallerySubtitle: "Fotos de platos, local y equipo.",
      galleryQuickSub: "A la galería",
      animSectionProducts: "Listado del menú",
      previewEmoji: "🍽️",
    },
    services: {
      id: "services",
      label: "Servicios profesionales",
      emoji: "🔧",
      description: "Servicios, planes y tarifas.",
      productsNav: "Mis Servicios",
      productsTitle: "Mis Servicios",
      productsSubtitle: "Los servicios que ofrece en su sitio. Doble clic en el precio para cambiarlo.",
      productsAdd: "Agregar servicio",
      productsAddEmpty: "Agregar otro servicio",
      productsTip: "Ordene sus servicios por importancia. Los ocultos no se publican.",
      quickProducts: "Agregar un servicio",
      quickProductsSub: "Sumar a la lista",
      chatExample: '"Cambia la descripción del servicio de instalación"',
      chatSuggestionAdd: "Agregar un servicio nuevo",
      galleryTitle: "Galería de fotos",
      gallerySubtitle: "Fotos de trabajos realizados y equipo.",
      galleryQuickSub: "A la galería",
      animSectionProducts: "Listado de servicios",
      previewEmoji: "🔧",
    },
  };

  function normalizeVertical(value) {
    if (!value) return null;
    const key = String(value).trim().toLowerCase().replace(/-/g, "_");
    if (VERTICAL_PROFILES[key]) return key;
    const aliases = {
      carniceria: "butcher",
      carnicería: "butcher",
      ropa: "retail_clothing",
      clothing: "retail_clothing",
      ecommerce: "retail_clothing",
      comida: "restaurant",
      gastronomia: "restaurant",
      gastronomía: "restaurant",
      servicio: "services",
      peluqueria: "beauty_salon",
      peluquería: "beauty_salon",
      salon: "beauty_salon",
      salón: "beauty_salon",
      beauty: "beauty_salon",
      barberia: "beauty_salon",
      barbería: "beauty_salon",
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

  window.SiteDeskVerticals = {
    VERTICAL_PROFILES,
    normalizeVertical,
    getVerticalProfile,
    listVerticalOptions,
  };
})();
