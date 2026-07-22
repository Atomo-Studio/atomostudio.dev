# Stock — App de inventario web

**Estado:** Web app funcional (jun 2026). Layout desktop con sidebar (estilo SiteDesk), catálogo, escáner, ventas y chat Geos 3.1.

## Arranque local

```bash
./start-geo.sh   # desde ~/atomo-studio — backend :8000 + Live UI :5500
```

Aplicar esquema DB (si es instalación nueva o tras pull):

```bash
psql "$DATABASE_URL" -f db/init/09-stock-schema.sql
```

| Recurso | URL |
|---------|-----|
| Login | http://localhost:5500/stock/login.html |
| Dashboard | http://localhost:5500/stock/app.html |
| Catálogo | http://localhost:5500/stock/productos.html |
| Escáner | http://localhost:5500/stock/scanner.html |
| Ventas | http://localhost:5500/stock/ventas.html |
| Chat Geos | http://localhost:5500/stock/chat.html |
| Configuración | http://localhost:5500/stock/configuracion.html |
| Mockups diseño | http://localhost:5500/stock/index.html |
| API | http://localhost:8000 |

Modo demo sin backend: en la página, antes de `api.js`:

```html
<script>window.__STOCK_CONFIG__ = { useMock: true };</script>
```

## Cómo probar cada sección

1. **Login** — Google o email en `login.html` → redirige a `app.html`
2. **Rubro** — Si `vertical` es NULL, elegir tipo de negocio
3. **Dashboard** — Stats reales desde `/stock/dashboard`
4. **Catálogo** — CRUD productos (`+ Agregar`, editar, vender)
5. **Escáner** — Cámara del celular (html5-qrcode) o código manual / lector USB → buscar → venta presencial/online
6. **Ventas** — Registro manual + historial
7. **Geos** — Chat vía `POST /chat` (modelo Geos 3.1 del backend)
8. **Configuración** — Cambiar vertical, cerrar sesión

## API Stock (`StockApi`)

| Método | Endpoint |
|--------|----------|
| `business()` | `GET /stock/business` |
| `dashboard()` | `GET /stock/dashboard` |
| `products({q, category, lowStock})` | `GET /stock/products` |
| `lookupBarcode(code)` | `GET /stock/products/barcode/{code}` |
| `createProduct(data)` | `POST /stock/products` |
| `updateProduct(id, data)` | `PATCH /stock/products/{id}` |
| `deleteProduct(id)` | `DELETE /stock/products/{id}` |
| `sales({limit})` | `GET /stock/sales` |
| `createSale({productId, quantity, channel})` | `POST /stock/sales` |
| `chat({message, conversationId})` | `POST /chat` |
| `setVertical(vertical)` | `PATCH /stock/business` |

## Asignar negocio de prueba (SQL)

```sql
INSERT INTO stock.negocios (usuario_id, slug, nombre, rubro_label, vertical, moneda)
VALUES (
  1,
  'don-pancho',
  pgp_sym_encrypt('Don Pancho', current_setting('app.encryption_key', true)),
  pgp_sym_encrypt('Ferretería', current_setting('app.encryption_key', true)),
  'hardware',
  'CLP'
);
```

## Smoke test

```bash
python3 -m py_compile geo-backend/stock_routes.py geo-backend/stock_verticals.py
curl -s http://localhost:8000/stock/verticals
TOKEN=... # tras login
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/stock/business
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/stock/products
```

## Producción

| Recurso | URL |
|---------|-----|
| App | https://stock.atomostudio.dev/stock/app.html |
| API | https://api.geo.atomostudio.dev |

Ver `scripts/setup_geo_tunnel.sh` y `GEO_STOCK_URL` en `.env`.
