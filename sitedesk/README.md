# SiteDesk — Panel cliente (MVP cableado)

**Estado:** MVP funcional (jun 2026). UI estática + `api.js` + `app.js` conectados a `geo-backend` (`/sitedesk/*`). Auth compartida con Geo App (`geo_token`).

## Arranque local

```bash
./start-geo.sh   # desde ~/atomo-studio — backend :8000 + Live UI :5500
```

| Recurso | URL |
|---------|-----|
| Login SiteDesk | http://localhost:5500/sitedesk/login.html |
| Panel (requiere sesión) | http://localhost:5500/sitedesk/index.html |
| API backend | http://localhost:8000 |
| UI vía backend (alternativa) | http://localhost:8000/geo-ui/sitedesk/login.html |

### Config API en el frontend

En `sitedesk/api.js` (auto-detecta prod/dev como Geo App):

```js
const USE_MOCK = false;   // true = datos demo sin backend
// API_URL → localhost:8000 en dev, api.geo.atomostudio.dev en prod
```

Override opcional antes de cargar scripts:

```html
<script>window.__SITEDESK_CONFIG__ = { apiUrl: "http://localhost:8000" };</script>
```

## Perfiles de rubro (vertical)

SiteDesk adapta etiquetas del panel según el tipo de negocio **de la landing asignada**. El cliente **no elige** el rubro en el primer acceso; se infiere automáticamente.

| ID | Rubro | Etiqueta catálogo |
|----|-------|-------------------|
| `generic` | Negocio general | Mis Productos |
| `butcher` | Carnicería | Mis Cortes |
| `beauty_salon` | Peluquería / salón | Servicios y precios |
| `retail_clothing` | Tienda de ropa | Mi Catálogo |
| `restaurant` | Restaurant / comida | Mi Menú |
| `services` | Servicios profesionales | Mis Servicios |

Migración: `db/init/08-sitedesk-vertical.sql` (columna `vertical` en `sitedesk.sitios`).

### Fuente de verdad del rubro

Orden de resolución (backend `sitedesk_vertical_infer.py`):

1. **`sitedesk.sitios.vertical`** en PostgreSQL (persistido tras inferencia o override admin)
2. **`sites/{sites_path}/geo-site.json`** — metadata escrita al provisionar la landing
3. **`sites/{sites_path}/landing-brief.json`** — copia del brief al entregar landing
4. **`sites/{sites_path}/sitedesk-content.json`** → campo `vertical` (tras publicar)
5. **Última landing del usuario** en `deliverable-registry.json` + `hermes/output/landings/`
6. **Heurística del slug** (`carnes-super-willy` → carnicería, `kaba` → peluquería)
7. Fallback: `generic`

### Mapeo landing → vertical SiteDesk

| Señal en brief / landing | Vertical SiteDesk |
|--------------------------|-------------------|
| `rubro: ecommerce`, `template_id: shop_grid`, playbook `ecommerce_high_contrast` | `retail_clothing` |
| `rubro: retail` + ropa/moda en pedido | `retail_clothing` |
| `rubro: retail` (local genérico) | `generic` |
| `rubro: peluqueria`, `template_id: kaba_premium` | `beauty_salon` |
| `rubro: food` + carnicería en texto | `butcher` |
| `rubro: food` / restaurante, `template_id: menu_elegante` | `restaurant` |
| `rubro: gimnasio`, `template_id: fitness_pro` | `services` |
| `rubro: services`, ferretería, portafolio | `services` |

### Cómo provisiona Átomo una landing para un cliente

1. **Geo genera la landing** (brief con `rubro`, `template_id`) → job en `geo_jobs.complete_job`.
2. **Al completar el job**, si el usuario ya tiene fila en `sitedesk.sitios`, el backend:
   - Calcula `vertical` desde el brief
   - Actualiza `sitedesk.sitios.vertical`
   - Escribe `sites/{sites_path}/geo-site.json` y `landing-brief.json`
3. **Al crear el sitio** (SQL admin), asignar `sites_path` apuntando a la carpeta en `sites/` y opcionalmente pre-escribir `geo-site.json`:

```sql
INSERT INTO sitedesk.sitios (usuario_id, slug, nombre, url, cliente_nombre, sites_path, vertical)
VALUES (
  6,
  'guillaume-demo',
  pgp_sym_encrypt('Guillaume Lagier', current_setting('app.encryption_key', true)),
  'atomostudio.dev/sites/guillaume',
  pgp_sym_encrypt('Guillaume', current_setting('app.encryption_key', true)),
  'guillaume',
  NULL  -- se infiere en el primer GET /sitedesk/site
);
```

Ejemplo `sites/guillaume/geo-site.json` (portafolio → `services`):

```json
{
  "vertical": "services",
  "rubro": "services",
  "rubro_label": "Portafolio / servicios profesionales",
  "negocio_name": "Guillaume Lagier"
}
```

4. **Primer login SiteDesk** — `GET /sitedesk/site` infiere y persiste el vertical; el panel muestra **«Tu sitio: Servicios profesionales»** (solo lectura). Override manual: `PATCH /sitedesk/site` o `?adminVertical=1` en la UI.

`GET /sitedesk/site` devuelve `vertical`, `verticalLabel`, `verticalSource`, `profile` (etiquetas en español). `needsVerticalSetup` queda en `false` (sin picker obligatorio).

Al publicar, `sitedesk-content.json` incluye `"vertical"` además de `sections`.

## Flujo MVP

1. **Login (Google)** — `login.html` → `GET /auth/google?return_to=…` → Google → callback backend → `#token=` en `login.html` → JWT en `localStorage` (`geo_token`, sesión compartida con Geo App)
2. **Login (email, opcional)** — `POST /auth/login` → mismo token
3. **Sitio** — `GET /sitedesk/site` (nombre, URL, borradores pendientes)
3. **Contenido** — `GET/PATCH /sitedesk/content` (secciones hero, about, contact, hours, social)
4. **Publicar** — `POST /sitedesk/publish` → DB + **`sites/{slug}/sitedesk-content.json`**
5. **Historial** — `GET /sitedesk/history`
6. **Chat** — `POST /chat` (Geos 3.1, mismo que Geo App)

## Publicación → filesystem

Al publicar, el backend escribe:

```
sites/{sites_path}/sitedesk-content.json
```

Formato:

```json
{
  "updatedAt": "2026-06-22T12:00:00+00:00",
  "sections": {
    "hero": { "eyebrow": "...", "title": "...", "subtitle": "...", "cta": "..." },
    "contact": { "phone": "...", "email": "..." }
  }
}
```

` sites_path` en DB puede ser `mi-sitio` o `sites/mi-sitio` (se normaliza). Variable de entorno opcional: `SITES_DIR` (default: `~/atomo-studio/sites`).

## Contrato API (`SiteDeskApi`)

| Método | Endpoint | Auth |
|--------|----------|------|
| `login({email,password})` | `POST /auth/login` | no |
| Google OAuth | `GET /auth/google?return_to=<login.html?next=…>` | no (redirect) |
| `me()` | `GET /me` | sí |
| `site()` | `GET /sitedesk/site` | sí |
| `verticals()` | `GET /sitedesk/verticals` | no |
| `setVertical(vertical)` | `PATCH /sitedesk/site` | sí |
| `content()` | `GET /sitedesk/content` | sí |
| `saveContent({section, fields})` | `PATCH /sitedesk/content` | sí |
| `publish()` | `POST /sitedesk/publish` | sí |
| `history()` | `GET /sitedesk/history` | sí |
| `chat({message, conversationId})` | `POST /chat` | sí |

## Base de datos

Migración automática al arrancar backend: `db/init/05-sitedesk-schema.sql`, `08-sitedesk-vertical.sql`

### Asignar un sitio de prueba (SQL)

Tras registrar un usuario en Geo App Live (ej. Guillaume, `usuario_id` según `geoapp.usuarios`):

```sql
INSERT INTO sitedesk.sitios (usuario_id, slug, nombre, url, cliente_nombre, sites_path, vertical)
VALUES (
  6,
  'guillaume-demo',
  pgp_sym_encrypt('Guillaume Lagier', current_setting('app.encryption_key', true)),
  'atomostudio.dev/sites/guillaume',
  pgp_sym_encrypt('Guillaume', current_setting('app.encryption_key', true)),
  'guillaume',
  NULL
);
```

El rubro se infiere de `sites/guillaume/geo-site.json` → **`services`** (portafolio), no carnicería. Para demo carnicería use `sites_path = 'carnes-super-willy'` (sin `vertical` manual).

(Usa la misma clave que `HERMES_ENCRYPTION_KEY` en `.env`.)

## Login con Google

Requisitos en `~/atomo-studio/.env` (ver `geo-backend/OAUTH_SETUP.md`):

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
GEO_CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500
```

El callback OAuth del backend siempre va a `:8000`; tras autorizar, redirige a SiteDesk con el JWT en el fragmento (`#token=…`). El parámetro `return_to` debe ser un origen permitido en `GEO_CORS_ORIGINS`.

### Probar login

1. Arrancar: `./start-geo.sh`
2. Abrir: http://localhost:5500/sitedesk/login.html
3. Clic en **Continuar con Google**
4. Tras autorizar → vuelve a `login.html#token=…` → redirige a `index.html`
5. Verificar sesión compartida: http://localhost:5500/Geo%20App%20Live.html (misma cuenta sin volver a loguear)

Si ves **503** al pulsar Google: faltan `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` en `.env` (reinicia el backend tras editar).

## Smoke test manual

```bash
# Compilar backend
python3 -m py_compile geo-backend/sitedesk_routes.py geo-backend/sitedesk_sync.py

# Health (backend corriendo)
curl -s http://localhost:8000/health

# Rutas SiteDesk (requieren JWT)
TOKEN="..."   # tras login
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/sitedesk/site
curl -s -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"section":"hero","fields":{"title":"Test MVP"}}' http://localhost:8000/sitedesk/content
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8000/sitedesk/publish
# Verificar archivo:
cat sites/guillaume/sitedesk-content.json
```

## Pantallas

| HTML | Estado MVP |
|------|------------|
| `login.html` | ✅ Google OAuth + email opcional |
| `index.html` | ✅ Sitio, borradores, historial reciente, publicar, acciones rápidas |
| `contenido.html` | ✅ CRUD borrador por sección + publicar |
| `chat.html` | ✅ Chat Geo (sin mock de carnicería) |
| `historial.html` | ✅ Log de publicaciones (filtros → próximamente) |
| `productos.html` | ✅ Etiquetas por rubro + aviso honesto (catálogo próximamente) |
| `galeria.html` | ✅ Etiquetas por rubro + subida próximamente (enlaces a chat/contenido) |
| `animaciones.html` | ✅ Selector local + guardar en navegador (sync sitio próximamente) |
| `admin*.html` | Sin backend (datos demo) |
| `landing.html` | Marketing (muestra ejemplos por rubro) |

### Comportamiento de botones (MVP)

| Área | Comportamiento |
|------|----------------|
| Inicio — acciones rápidas | Navegan a `chat`, `productos`, `galeria`, `contenido` |
| Inicio — visitas | Toast «Próximamente» |
| Contenido | Guardar borrador + publicar vía API |
| Productos — filtrar/agregar | Toast con mensaje por rubro |
| Galería — subir | Toast «Próximamente» + enlaces a chat/contenido |
| Animaciones — guardar | `localStorage` en el navegador + aviso de sync futura |
| Historial — filtros | Toast «Próximamente» |
| Sidebar / publicar | Cableado en todas las páginas MVP |

## Pendiente (post-MVP)

1. Inyectar `sitedesk-content.json` en HTML/i18n de sitios cliente (runtime en `sites/`)
2. Chat SiteDesk → borradores automáticos (herramientas dedicadas)
3. Admin Mario — CRUD clientes y activación
4. Galería / productos / animaciones — rutas y upload
5. Deshacer en historial, filtros IA/manual
6. App móvil — fuera de este repo
