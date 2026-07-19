# AGENTS.md

## Cursor Cloud specific instructions

This repo (`atomostudio.dev`) is a **pure static website** — a multi-page marketing site
for Átomo Studio. There is no package manager, build step, backend, or automated test suite.
Content is plain HTML/CSS/JS plus JSON assets (`i18n/*.json`, `js/voices-config.json`).

### Running the site (dev)

- The site MUST be served over HTTP, not opened via `file://`. The i18n runtime
  (`js/i18n.js`) uses `fetch('i18n/<lang>.json')`, which fails under `file://` due to CORS.
- Serve from the repo root, e.g. `python3 -m http.server 8000`, then open
  `http://localhost:8000/index.html`. Python 3 is preinstalled; no dependencies are needed.
- Core functionality to sanity-check: the bottom-right language switcher (i18n) should
  change page text across the 5 supported locales (`es_CL`, `es_ES`, `en_US`, `fr_FR`, `pt_BR`)
  without a page reload.

### Notes / gotchas

- Many top-level entries (e.g. `aces-ltda`, `geo`, `portfolio`) are **symlinks into
  `/home/mario/atomo-studio/...` that are broken in this environment**; those client
  subsites are not part of this repo checkout. The main site pages at the repo root work fine.
- There is a pre-existing, benign console error on some pages (duplicate JS identifier
  declaration in inline `<script>` blocks). It does not block i18n or page rendering — do
  not treat it as an environment/setup failure.
- No lint or test tooling is configured in this repo.
- GoHighLevel MCP integration (`.mcp.json`, `CLAUDE.md`) is unrelated to running the site;
  it needs `GHL_PIT_TOKEN` / `GHL_LOCATION_ID` in `.env` only if working on lead management.
