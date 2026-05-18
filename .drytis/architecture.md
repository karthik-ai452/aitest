# Architecture

## File Structure
```
/workspace/
├── index.html          # Single-page dashboard
└── .drytis/            # Project blueprints
    ├── spec.md
    ├── scope.md
    ├── architecture.md
    ├── patterns.md
    └── infrastructure.md
```

## Layout
- **Sidebar** (260px fixed left) — navigation links with icons
- **Header** (fixed top, right of sidebar) — search, actions, profile
- **Main content** (right of sidebar, below header) — data table

## Routing
- Single page, no client-side routing
- Served via Caddy as static PHP (or reverse proxy to a static server)