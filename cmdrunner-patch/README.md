# CmdRunner Frontend Patch

This branch contains the corrected frontend files for the CmdRunner project.
Copy these into your Codespace to replace the default frontend.

## What's Changed (v4 — Layout Fix)

- **Fixed sidebar collapse** — Now uses `body.sidebar-collapsed` class instead of broken CSS sibling selectors. Sidebar minimize button works properly.
- **Fixed page-wrapper double-card** — Removed the white card wrapper that was creating a "card inside card" effect on all pages.
- **Fixed table styles** — Removed global border/margin that conflicted with Tailwind card styling.
- **Fixed link colors** — Removed `color: inherit` from global `a` tag so inline `style="color: ..."` works on Run/Edit/Delete links.
- **Fixed test_runs.html** — Uses `test_runs` variable (matching backend).
- **Fixed test_run_view.html** — Back link points to `/test_runs`.
- **No dark theme** — Light/white only across all pages.

## Files to Copy

### Templates
```bash
# Copy page templates (skip login/register/base_guest — those stay original)
for f in index.html test_suites.html test_suite_new.html test_suite_edit.html test_runs.html test_run_view.html agents.html; do
  cp templates/pages/$f ../cmdrunner_web/templates/pages/$f
done

# Copy base.html (sidebar + topnav + layout)
cp templates/base.html ../cmdrunner_web/templates/base.html
```

### Static Files
```bash
# Copy CSS, JS
cp static/css/style.css ../cmdrunner_web/static/css/style.css
cp static/js/sidebar.js ../cmdrunner_web/static/js/sidebar.js
cp static/js/tailwind-config.js ../cmdrunner_web/static/js/tailwind-config.js
cp static/public.js ../cmdrunner_web/static/public.js
cp static/index.js ../cmdrunner_web/static/index.js
```

### Don't Copy (keep original)
- `templates/login.html`
- `templates/register.html`
- `templates/base_guest.html`
- `static/js/lightbox2/` (already exists)
- `static/favicon/` (already exists)
- `static/cmdrunner_logo*.png` (already exists)

## Routes You Need to Add

Add these to `cmdrunner_web/__init__.py` **before** the `@app.errorhandler(404)` line:

```python
@app.route('/agents')
async def agents():
    return await render_template('pages/agents.html')

@app.route('/docs')
async def docs():
    return await render_template('docs.html')

@app.route('/docs/ngrok')
async def docs_ngrok():
    return await render_template('docs_ngrok.html')
```

## DB Fix

The test_runs table has `suite_name` column but the repository queries `test_suite_name`:
```bash
sqlite3 /workspaces/cmdrunner/database/database.db "ALTER TABLE test_runs RENAME COLUMN suite_name TO test_suite_name;"
```

## After Copying

```bash
cd /workspaces/cmdrunner
# Restart the app
pkill -f "python.*__main__" || true
python -m cmdrunner_web
```