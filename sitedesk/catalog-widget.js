(function() {
  const SITEDESK_API_URL = "https://apigeo.atomostudio.dev";

  async function fetchProducts(siteSlug) {
    try {
      const res = await fetch(`${SITEDESK_API_URL}/sitedesk/public/${siteSlug}/products`);
      if (!res.ok) throw new Error("Error fetching products");
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.error("SiteDesk Catalog Error:", err);
      return [];
    }
  }

  function renderCatalog(container, products) {
    if (!products || products.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#6b7280; font-family:sans-serif;">No hay productos disponibles por el momento.</p>';
      return;
    }

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 24px;
      font-family: 'Inter', system-ui, sans-serif;
    `;

    products.forEach(p => {
      const card = document.createElement('div');
      card.style.cssText = `
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        flex-direction: column;
      `;
      card.onmouseover = () => {
        card.style.transform = 'translateY(-4px)';
        card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      };
      card.onmouseout = () => {
        card.style.transform = 'none';
        card.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
      };

      const imgHtml = p.thumb_url || p.image_url 
        ? `<img src="${p.thumb_url || p.image_url}" alt="${p.name}" style="width: 100%; height: 200px; object-fit: cover;" loading="lazy" />`
        : `<div style="width: 100%; height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 48px;">📦</div>`;

      card.innerHTML = `
        ${imgHtml}
        <div style="padding: 16px; flex: 1; display: flex; flex-direction: column;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${p.name}</h3>
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563; flex: 1;">${p.description || ''}</p>
          <div style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 12px;">$${p.price || 0}</div>
          <button style="width: 100%; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">Añadir</button>
        </div>
      `;
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
  }

  async function init() {
    const containers = document.querySelectorAll('[data-sitedesk-catalog]');
    for (const container of containers) {
      const siteSlug = container.getAttribute('data-sitedesk-catalog');
      if (siteSlug) {
        container.innerHTML = '<div style="text-align:center; padding: 40px; color:#6b7280; font-family:sans-serif;">Cargando catálogo...</div>';
        const products = await fetchProducts(siteSlug);
        renderCatalog(container, products);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
