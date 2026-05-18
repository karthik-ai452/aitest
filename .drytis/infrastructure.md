# Infrastructure

## Serving
- Static HTML served by Caddy
- No background services needed (static files only)
- Caddy proxy: `service_type=php_server` or reverse proxy to a static file server

## Env Vars
- None required (static site, no backend)

## Ports
- N/A — served directly by Caddy