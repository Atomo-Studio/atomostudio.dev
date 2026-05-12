/* ============================================
   Átomo Studio - Admin Panel
   Panel de administración del sitio web
   ============================================ */

// ========== CONFIG ==========
const API_URL = window.location.origin + '/api'; // Se conecta al backend local
const DATA_URL = '../demo/data/data.json';
const DATA_PATH = '../demo/data/data.json';
const DEFAULT_PASSWORD = 'admin123';
const STORAGE_KEY = 'atomostudio_admin_auth';

let isAuthenticated = false;
let siteData = null;
let originalData = null; // Para detectar cambios
let previewWindow = null;

// ========== AUTH ==========
function checkAuth() {
  const auth = sessionStorage.getItem(STORAGE_KEY);
  if (auth === 'true') {
    isAuthenticated = true;
    showAdmin();
  }
}

function doLogin(password) {
  if (password === DEFAULT_PASSWORD) {
    isAuthenticated = true;
    sessionStorage.setItem(STORAGE_KEY, 'true');
    document.getElementById('loginError').textContent = '';
    showAdmin();
    return true;
  }
  document.getElementById('loginError').textContent = '❌ Contraseña incorrecta. Intenta de nuevo.';
  return false;
}

function doLogout() {
  isAuthenticated = false;
  sessionStorage.removeItem(STORAGE_KEY);
  document.getElementById('adminLayout').style.display = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('password').value = '';
}

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  loadSiteData();
}

// ========== DATA LOADING ==========
async function loadSiteData() {
  try {
    const res = await fetch(DATA_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    siteData = await res.json();
    originalData = JSON.parse(JSON.stringify(siteData));
    populateAllForms();
    updateDashboard();
  } catch (err) {
    console.error('Error loading data:', err);
    // Try loading default data
    siteData = getDefaultData();
    originalData = JSON.parse(JSON.stringify(siteData));
    populateAllForms();
    updateDashboard();
    showToast('Usando datos por defecto. Carga data.json manualmente.', 'warning');
  }
}

function getDefaultData() {
  return {
    site: { title: 'Átomo Studio', subtitle: 'Diseño Web', description: 'Creamos sitios web.', logo: 'img/logo.svg' },
    hero: { title: 'Tu Presencia Digital', subtitle: 'Empieza Aquí', description: 'Sitios web profesionales.', cta_text: 'Contáctanos', cta_link: '#contacto', bg_image: 'img/hero-bg.svg' },
    about: { title: 'Sobre Nosotros', description: 'Somos un equipo apasionado.', highlights: ['Experiencia', 'Calidad', 'Soporte'], image: 'img/about.svg' },
    services: [
      { id: 1, name: 'Sitio Web', description: 'Descripción del servicio.', price: '$299', image: 'img/service-corp.svg', features: ['Diseño', 'SEO'] }
    ],
    contact: { title: 'Contáctanos', subtitle: 'Háblanos', phone: '+56 9 1234 5678', email: 'hola@atomostudio.cl', address: 'Santiago', whatsapp: '', instagram: '', facebook: '', schedule: 'Lun-Vie 9-18' },
    footer: { copyright: '© 2025 Átomo Studio', brand: 'Átomo Studio' },
    colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b', bg_light: '#f8fafc', bg_dark: '#0f172a', text_dark: '#1e293b', text_light: '#f1f5f9' }
  };
}

// ========== POPULATE FORMS ==========
function populateAllForms() {
  if (!siteData) return;
  populateHeroForm();
  populateAboutForm();
  populateServicesTable();
  populateContactForm();
  populateColorsForm();
}

function populateHeroForm() {
  const h = siteData.hero;
  setVal('hero-title', h.title);
  setVal('hero-subtitle', h.subtitle);
  setVal('hero-description', h.description);
  setVal('hero-cta-text', h.cta_text);
  setVal('hero-cta-link', h.cta_link);
}

function populateAboutForm() {
  const a = siteData.about;
  setVal('about-title', a.title);
  setVal('about-description', a.description);
  setVal('about-highlights', (a.highlights || []).join('\n'));
}

function populateServicesTable() {
  const tbody = document.getElementById('servicesBody');
  const services = siteData.services || [];
  if (services.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No hay servicios. Agrega uno nuevo.</td></tr>';
    return;
  }
  tbody.innerHTML = services.map(s => `
    <tr>
      <td><img class="product-thumb" src="../demo/${s.image || 'img/service-placeholder.svg'}" alt="${escapeHtml(s.name)}" onerror="this.src='../demo/img/service-placeholder.svg'"></td>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.price || '—')}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(s.description || '')}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-warning" onclick="editService(${s.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteService(${s.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function populateContactForm() {
  const c = siteData.contact;
  setVal('contact-title', c.title);
  setVal('contact-subtitle', c.subtitle);
  setVal('contact-phone', c.phone);
  setVal('contact-email', c.email);
  setVal('contact-address', c.address);
  setVal('contact-schedule', c.schedule);
  setVal('contact-whatsapp', c.whatsapp || '');
  setVal('contact-instagram', c.instagram || '');
  setVal('contact-facebook', c.facebook || '');
}

function populateColorsForm() {
  const grid = document.getElementById('colorGrid');
  const colors = siteData.colors || {};
  const labels = {
    primary: 'Primario',
    secondary: 'Secundario',
    accent: 'Acento',
    bg_light: 'Fondo claro',
    bg_dark: 'Fondo oscuro',
    text_dark: 'Texto oscuro',
    text_light: 'Texto claro'
  };
  grid.innerHTML = Object.keys(labels).map(key => `
    <div class="color-item">
      <label>${labels[key]}</label>
      <input type="color" id="color-${key}" value="${colors[key] || '#000000'}">
    </div>
  `).join('');
}

function updateDashboard() {
  const el = document.getElementById('dashboard-summary');
  if (!siteData) {
    el.innerHTML = '<p style="color:#94a3b8;">No hay datos cargados.</p>';
    return;
  }
  const services = siteData.services || [];
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
      <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:10px;">
        <div style="font-size:1.8rem;font-weight:700;">${services.length}</div>
        <div style="font-size:0.85rem;color:#64748b;">Servicios</div>
      </div>
      <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:10px;">
        <div style="font-size:1.8rem;font-weight:700;">${siteData.about.highlights ? siteData.about.highlights.length : 0}</div>
        <div style="font-size:0.85rem;color:#64748b;">Destacados</div>
      </div>
      <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:10px;">
        <div style="font-size:1.8rem;font-weight:700;">${siteData.contact.email ? '✅' : '❌'}</div>
        <div style="font-size:0.85rem;color:#64748b;">Email configurado</div>
      </div>
      <div style="text-align:center;padding:16px;background:#f8fafc;border-radius:10px;">
        <div style="font-size:1.8rem;font-weight:700;">${Object.keys(siteData.colors || {}).length}</div>
        <div style="font-size:0.85rem;color:#64748b;">Colores</div>
      </div>
    </div>
  `;
}

// ========== FORM HELPERS ==========
function getVal(id) { return document.getElementById(id).value.trim(); }
function setVal(id, val) { document.getElementById(id).value = val || ''; }
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ========== COLLECT DATA FROM FORMS ==========
function collectFormData() {
  if (!siteData) return null;

  // Hero
  siteData.hero.title = getVal('hero-title');
  siteData.hero.subtitle = getVal('hero-subtitle');
  siteData.hero.description = getVal('hero-description');
  siteData.hero.cta_text = getVal('hero-cta-text');
  siteData.hero.cta_link = getVal('hero-cta-link');

  // About
  siteData.about.title = getVal('about-title');
  siteData.about.description = getVal('about-description');
  siteData.about.highlights = getVal('about-highlights').split('\n').map(s => s.trim()).filter(Boolean);

  // Contact
  siteData.contact.title = getVal('contact-title');
  siteData.contact.subtitle = getVal('contact-subtitle');
  siteData.contact.phone = getVal('contact-phone');
  siteData.contact.email = getVal('contact-email');
  siteData.contact.address = getVal('contact-address');
  siteData.contact.schedule = getVal('contact-schedule');
  siteData.contact.whatsapp = getVal('contact-whatsapp');
  siteData.contact.instagram = getVal('contact-instagram');
  siteData.contact.facebook = getVal('contact-facebook');

  // Colors
  if (siteData.colors) {
    Object.keys(siteData.colors).forEach(key => {
      const el = document.getElementById('color-' + key);
      if (el) siteData.colors[key] = el.value;
    });
  }

  return siteData;
}

// ========== SAVE / PUBLISH ==========
async function publishChanges() {
  const data = collectFormData();
  if (!data) return;

  const btn = document.getElementById('publishBtn');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Publicando...';
  btn.disabled = true;

  try {
    // Try to save via API first
    const res = await fetch(API_URL + '/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: data })
    });

    if (res.ok) {
      originalData = JSON.parse(JSON.stringify(data));
      showToast('✅ Cambios publicados con éxito', 'success');
      // Reload preview if open
      reloadPreview();
    } else {
      throw new Error('API error');
    }
  } catch (err) {
    // Fallback: download as file if backend not available
    console.warn('API not available, using download fallback:', err);
    showToast('⚠️ Backend no disponible. Descargando archivo...', 'warning');

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    originalData = JSON.parse(JSON.stringify(data));
    showToast('📥 Archivo descargado. Cópialo a data/data.json', 'info');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// ========== SERVICE CRUD ==========
function addService() {
  showServiceModal(null);
}

function editService(id) {
  const service = (siteData.services || []).find(s => s.id === id);
  if (service) showServiceModal(service);
}

function deleteService(id) {
  if (!confirm('¿Eliminar este servicio?')) return;
  siteData.services = (siteData.services || []).filter(s => s.id !== id);
  populateServicesTable();
  showToast('🗑️ Servicio eliminado', 'info');
}

function showServiceModal(service) {
  const isEdit = !!service;
  const container = document.getElementById('modalContainer');

  const featuresStr = service && service.features ? service.features.join('\n') : '';

  container.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-header">
          <h2>${isEdit ? '✏️ Editar' : '➕ Agregar'} Servicio</h2>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <form id="serviceModalForm">
            <div class="form-group">
              <label for="modal-serv-name">Nombre del servicio</label>
              <input type="text" id="modal-serv-name" value="${escapeHtml(service ? service.name : '')}" placeholder="Ej: Sitio Web Corporativo">
            </div>
            <div class="form-group">
              <label for="modal-serv-price">Precio</label>
              <input type="text" id="modal-serv-price" value="${escapeHtml(service ? service.price : '')}" placeholder="Ej: $299 USD">
            </div>
            <div class="form-group">
              <label for="modal-serv-desc">Descripción</label>
              <textarea id="modal-serv-desc" rows="3" placeholder="Describe el servicio...">${escapeHtml(service ? service.description : '')}</textarea>
            </div>
            <div class="form-group">
              <label for="modal-serv-features">Características (una por línea)</label>
              <textarea id="modal-serv-features" rows="4" placeholder="Diseño responsive&#10;SEO básico">${escapeHtml(featuresStr)}</textarea>
            </div>
            <div class="form-group">
              <label>Imagen del servicio</label>
              <div class="image-upload" id="modalImageUpload" onclick="document.getElementById('modal-serv-image-input').click()">
                <div id="modalImagePreview">
                  ${service && service.image ? `<div class="image-preview"><img src="../demo/${service.image}" alt="Preview"></div>` : ''}
                </div>
                <span class="upload-hint">${service && service.image ? 'Haz clic para cambiar imagen' : 'Haz clic para subir imagen'}</span>
              </div>
              <input type="file" id="modal-serv-image-input" accept="image/*" style="display:none" onchange="handleServiceImageUpload(event)">
              <input type="hidden" id="modal-serv-image" value="${escapeHtml(service ? service.image : '')}">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="closeModal()">Cancelar</button>
          <button class="btn btn-success" onclick="saveServiceFromModal(${isEdit ? service.id : 'null'})">${isEdit ? 'Guardar cambios' : 'Agregar servicio'}</button>
        </div>
      </div>
    </div>
  `;
}

let pendingServiceImage = null;

function handleServiceImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    pendingServiceImage = e.target.result;
    const preview = document.getElementById('modalImagePreview');
    preview.innerHTML = `<div class="image-preview"><img src="${e.target.result}" alt="Preview"></div>`;
    document.getElementById('modal-serv-image').value = 'img/uploaded-' + Date.now() + '.png';
  };
  reader.readAsDataURL(file);
}

function saveServiceFromModal(id) {
  const name = getVal('modal-serv-name');
  const price = getVal('modal-serv-price');
  const desc = getVal('modal-serv-desc');
  const features = getVal('modal-serv-features').split('\n').map(s => s.trim()).filter(Boolean);
  let image = getVal('modal-serv-image');

  if (!name) {
    showToast('⚠️ El nombre del servicio es obligatorio', 'error');
    return;
  }

  if (id === null) {
    // Add new
    const maxId = Math.max(0, ...(siteData.services || []).map(s => s.id));
    const newService = {
      id: maxId + 1,
      name: name,
      price: price,
      description: desc,
      image: image || 'img/service-placeholder.svg',
      features: features
    };
    if (!siteData.services) siteData.services = [];
    siteData.services.push(newService);
  } else {
    // Edit existing
    const service = (siteData.services || []).find(s => s.id === id);
    if (service) {
      service.name = name;
      service.price = price;
      service.description = desc;
      service.features = features;
      if (image) service.image = image;
    }
  }

  // Handle image upload to server
  if (pendingServiceImage) {
    uploadImage(pendingServiceImage, image).catch(console.warn);
    pendingServiceImage = null;
  }

  populateServicesTable();
  closeModal();
  showToast(id === null ? '✅ Servicio agregado' : '✅ Servicio actualizado', 'success');
}

async function uploadImage(base64Data, filename) {
  try {
    await fetch(API_URL + '/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Data, filename: filename })
    });
  } catch (e) {
    console.warn('Image upload failed (backend not running):', e);
  }
}

function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
  pendingServiceImage = null;
}

// ========== NAVIGATION ==========
function navigateTo(section) {
  // Update sidebar
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.section === section);
  });

  // Update sections
  document.querySelectorAll('.section-content').forEach(el => {
    el.style.display = 'none';
  });

  const target = document.getElementById('section-' + section);
  if (target) target.style.display = 'block';

  // Update title
  const titles = {
    dashboard: '📊 Dashboard',
    hero: '🎨 Editar Hero',
    about: '👥 Sobre Nosotros',
    services: '📦 Servicios',
    contact: '📞 Contacto',
    colors: '🎨 Colores',
    preview: '👁️ Vista Previa'
  };
  document.getElementById('sectionTitle').textContent = titles[section] || section;

  // If preview, load iframe
  if (section === 'preview') {
    loadPreview();
  }
}

function loadPreview() {
  const iframe = document.getElementById('previewIframe');
  // Use the demo site with a cache buster
  const demoUrl = window.location.origin.replace('/admin', '') + '/demo/index.html';
  iframe.src = demoUrl + '?t=' + Date.now();
}

function reloadPreview() {
  const iframe = document.getElementById('previewIframe');
  if (iframe && iframe.src) {
    iframe.src = iframe.src.split('?')[0] + '?t=' + Date.now();
  }
}

// ========== TOAST ==========
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ========== EVENT BINDING ==========
function init() {
  // Auth
  checkAuth();

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    doLogin(document.getElementById('password').value);
  });

  document.getElementById('logoutBtn').addEventListener('click', doLogout);

  // Sidebar navigation
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => navigateTo(a.dataset.section));
  });

  // Preview button in topbar
  document.getElementById('previewBtn').addEventListener('click', () => {
    navigateTo('preview');
  });

  // Publish button
  document.getElementById('publishBtn').addEventListener('click', publishChanges);

  // Add service button
  document.getElementById('addServiceBtn').addEventListener('click', addService);

  // Enter key on login
  document.getElementById('password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin(document.getElementById('password').value);
  });
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
