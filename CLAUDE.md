# GoHealthy — Integración GHL (GoHighLevel) para gestión de leads

Este proyecto está conectado a GoHighLevel (LeadConnector) para que Claude pueda
gestionar leads/contactos de GoHealthy: buscar, crear y actualizar contactos,
revisar conversaciones, y trabajar oportunidades del pipeline.

## Cómo se conecta

1. **MCP (preferido).** `.mcp.json` define el servidor remoto `gohighlevel`
   (`https://services.leadconnectorhq.com/mcp/`), autenticado con
   `Authorization: Bearer ${GHL_PIT_TOKEN}` y header `locationId: ${GHL_LOCATION_ID}`.
   Las variables se leen del entorno (`.env`, nunca hardcodeadas) — copiar
   `.env.example` a `.env` y completar con las credenciales reales. El MCP se
   carga al iniciar una sesión de Claude Code, no en caliente.
2. **API REST v2 (fallback).** Si una acción no está cubierta por el MCP, o el
   MCP no está disponible en el entorno actual, usar la API directa:
   - Base: `https://services.leadconnectorhq.com`
   - Headers obligatorios: `Authorization: Bearer <GHL_PIT_TOKEN>`,
     `Version: 2021-07-28`, `Content-Type: application/json`
   - Ejemplo: `GET /contacts/?locationId=<GHL_LOCATION_ID>&limit=20`
   - Docs: https://marketplace.gohighlevel.com/docs/

Regla general: intentar primero vía MCP; si la herramienta no existe o falla,
resolver el mismo objetivo con un llamado directo a la API REST antes de
reportar que algo "no se puede hacer".

## Qué puede hacer el agente

- Contactos: buscar, crear, actualizar, taggear, agregar notas/tareas.
- Conversaciones: buscar hilos, leer y enviar mensajes soportados.
- Oportunidades: buscar y actualizar etapas del pipeline.
- Calendarios: consultar citas y disponibilidad.

Acciones sensibles (borrar contactos, reembolsos, envíos masivos) requieren
confirmación explícita del usuario antes de ejecutarse — no son "oneshot".

## Buenas prácticas (investigadas en la doc oficial de HighLevel)

- **Nunca commitear el token.** El PIT (`pit-...`) vive solo en `.env`
  (gitignored). `.mcp.json` solo referencia `${GHL_PIT_TOKEN}` /
  `${GHL_LOCATION_ID}`, nunca el valor literal.
- **Least privilege.** El Private Integration Token debe tener únicamente los
  scopes que la integración realmente usa (contactos, conversaciones,
  oportunidades) — no scopes de administración innecesarios.
- **Rotación.** Rotar el PIT cada ~90 días; si el token se expuso en texto
  plano (chat, screenshot, log), rotarlo de inmediato.
- **Rate limits.** GHL aplica ~100 requests/10s y ~200,000 requests/día por
  location. Evitar loops de polling agresivo; preferir búsquedas paginadas.
- **Locations.** `locationId` identifica la sub-cuenta; confirmar que es la
  correcta antes de escribir datos (más aún si hay múltiples clientes/sites
  en este repo).
- **Probar en staging primero** cuando se trate de cambios masivos o
  workflows nuevos, antes de aplicarlos sobre la location de producción.
- **No exponer el token** en prompts compartidos, capturas de pantalla,
  issues públicos ni código del lado del cliente.

## Referencias

- Guía oficial MCP: https://help.gohighlevel.com/support/articles/155000005741-how-to-use-the-highlevel-mcp-server
- Docs API/MCP developer: https://marketplace.gohighlevel.com/docs/
