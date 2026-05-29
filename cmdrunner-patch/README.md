# CmdRunner Frontend Patch

This folder contains the updated frontend files from the AI Tester project
to replace the cmdrunner frontend. The login, register, and base_guest templates
are **NOT** included here — keep your existing cmdrunner versions.

## Files to copy

### Templates (replace in cmdrunner_web/templates/)
- `base.html` — main layout with sidebar, topnav, modals (light theme only)
- `docs.html` — documentation page
- `docs_ngrok.html` — ngrok docs page

### Templates (replace in cmdrunner_web/templates/pages/)
- `index.html` — dashboard
- `agents.html` — agents page (two-panel layout)
- `test_suites.html` — test suites list with table
- `test_runs.html` — test runs list with table
- `test_run_view.html` — single test run detail view
- `test_suite_new.html` — create new test suite form
- `test_suite_edit.html` — edit test suite form
- `change_password.html` — change password page
- `not_approved.html` — pending approval page
- `register_success.html` — registration success page
- `errors/not_found.html` — 404 page
- `errors/unauthorized.html` — 403 page

### Static (replace in cmdrunner_web/static/)
- `css/style.css` — all styles (light theme, sidebar, guest pages, etc.)
- `js/tailwind-config.js` — Tailwind config (light-only color palette)
- `js/sidebar.js` — sidebar toggle, profile dropdown, change password modal, logout
- `public.js` — shared JS (alerts, prompts, datetime formatting, test suite editor)
- `index.js` — dashboard counter animation

### DO NOT replace (keep your cmdrunner versions)
- `templates/login.html` ← keep cmdrunner's
- `templates/register.html` ← keep cmdrunner's
- `templates/base_guest.html` ← keep cmdrunner's
- `static/js/lightbox2/` ← keep cmdrunner's
- `static/favicon/` ← keep cmdrunner's
- `static/cmdrunner_logo.png` ← keep cmdrunner's
- `static/cmdrunner_logo_v3.png` ← keep cmdrunner's

## Quick Apply (run in your Codespace terminal)

```bash
# From the root of your cmdrunner Codespace
# Assuming you cloned aitest into /workspaces/aitest or downloaded the patch

# Copy templates
cp aitest/cmdrunner-patch/templates/base.html cmdrunner_web/templates/base.html
cp aitest/cmdrunner-patch/templates/docs.html cmdrunner_web/templates/docs.html
cp aitest/cmdrunner-patch/templates/docs_ngrok.html cmdrunner_web/templates/docs_ngrok.html

# Copy page templates
cp aitest/cmdrunner-patch/templates/pages/*.html cmdrunner_web/templates/pages/
cp aitest/cmdrunner-patch/templates/pages/errors/*.html cmdrunner_web/templates/pages/errors/

# Copy static assets
cp aitest/cmdrunner-patch/static/css/style.css cmdrunner_web/static/css/style.css
cp aitest/cmdrunner-patch/static/js/tailwind-config.js cmdrunner_web/static/js/tailwind-config.js
cp aitest/cmdrunner-patch/static/js/sidebar.js cmdrunner_web/static/js/sidebar.js
cp aitest/cmdrunner-patch/static/public.js cmdrunner_web/static/public.js
cp aitest/cmdrunner-patch/static/index.js cmdrunner_web/static/index.js

# Restart the server
# (Ctrl+C then run again, or however you started it)
```