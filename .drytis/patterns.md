# Patterns

## Coding Standards
- Single HTML file with embedded `<style>` and `<script>` for Tailwind config
- Use Tailwind utility classes exclusively — no custom CSS beyond font smoothing and Material Symbols config
- Semantic HTML elements (`<aside>`, `<header>`, `<main>`, `<nav>`, `<table>`)

## Design Tokens (Tailwind Config)
- Colors: Material Design 3 dark theme palette
- Typography: Geist (UI), JetBrains Mono (code/IDs)
- Spacing: 4px unit, 260px sidebar, 24px gutter, 32px desktop margin
- Border radius: minimal (0.125rem default)

## Status Badges
- Passed → green (`bg-secondary`, `text-secondary`)
- Failed → red (`bg-error`, `text-error`)
- Warning → amber (`bg-tertiary`, `text-tertiary`)