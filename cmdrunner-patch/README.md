# CmdRunner Frontend Patch v5

## What's Fixed (v5)

### 1. Test Suite Creation — Self-contained JS
`test_suite_new.html` and `test_suite_edit.html` now have ALL JavaScript inline in a self-contained IIFE. No dependency on `public.js` for test case/step management. This means:
- ✅ Add test case works
- ✅ Add step works
- ✅ Delete test case / step works
- ✅ Toggle Expectation & Notes works
- ✅ Form submission via JSON works
- ✅ File upload works
- Falls back to `alert()`/`confirm()` if `show_alert()`/`show_prompt()` aren't available

### 2. Test Runs — No DB Change Needed
`test_runs.html` now uses `{{ run.suite_name or run.test_suite_name or '' }}` so it works with both column names.

**BUT**: The `test_run_repository.py` file queries `test_suite_name` which doesn't exist. Fix with:
```bash
cd /workspaces/cmdrunner
sed -i 's/test_suite_name/suite_name/g' cmdrunner_web/test_run_repository.py
```

### 3. Sidebar Collapse Fixed
Uses `body.sidebar-collapsed` class toggled by JS.

### 4. Layout Fixed
- No more double-card (page-wrapper stripped)
- No more table border conflicts
- Link colors work (no more `color: inherit` override)

---

## Quick Copy Commands

```bash
cd /workspaces/cmdrunner

# Get the patch
git clone --branch cmdrunner-frontend-patch --depth 1 git@github.com:karthik-ai452/aitest.git /tmp/patch

# Copy templates (DO NOT replace login.html, register.html, base_guest.html)
cp /tmp/patch/cmdrunner-patch/templates/base.html cmdrunner_web/templates/base.html
for f in index.html test_suites.html test_suite_new.html test_suite_edit.html test_runs.html test_run_view.html agents.html; do
  cp /tmp/patch/cmdrunner-patch/templates/pages/$f cmdrunner_web/templates/pages/$f
done

# Copy static files
cp /tmp/patch/cmdrunner-patch/static/css/style.css cmdrunner_web/static/css/style.css
cp /tmp/patch/cmdrunner-patch/static/js/sidebar.js cmdrunner_web/static/js/sidebar.js
cp /tmp/patch/cmdrunner-patch/static/public.js cmdrunner_web/static/public.js
cp /tmp/patch/cmdrunner-patch/static/index.js cmdrunner_web/static/index.js

# Clean up
rm -rf /tmp/patch
```

## Routes to Add (if not already done)

Add before `@app.errorhandler(404)` in `cmdrunner_web/__init__.py`:

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

## Repository Fix (for test_runs 500 error)

```bash
sed -i 's/test_suite_name/suite_name/g' cmdrunner_web/test_run_repository.py
```

## Restart

```bash
pkill -f "python.*__main__" || true
python -m cmdrunner_web
```

Then **hard refresh** the browser (Ctrl+Shift+R) to clear cached CSS/JS.