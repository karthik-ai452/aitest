# Cmdrunner Frontend Patch (v2 — Backend-Adapted)

Updated frontend templates adapted for the **real cmdrunner backend**.
Login, register, and base_guest templates are **NOT** included — keep your existing cmdrunner versions.

## Key Route Differences (aitest vs cmdrunner)

| Feature | aitest (old) | cmdrunner (real) |
|---------|-------------|-----------------|
| Run suite | `POST /test_suites/<id>/run` | `GET /run_test_suite/<id>` (SSE stream) |
| User in templates | `current_user` (dict) | `g.user` (object with `.name`, `.email`, `.is_admin`) |
| Delete suite | `POST /test_suites/<id>/delete` | `POST /test_suites/<id>/delete` ✅ |
| Edit suite | `POST /test_suites/<id>/edit` (JSON) | `POST /test_suites/<id>/edit` (JSON) ✅ |
| New suite | `POST /test_suites/new` (JSON) | `POST /test_suites/new` (JSON) ✅ |
| Upload | `POST /upload_test_suite_file` | `POST /upload_test_suite_file` ✅ |
| Agent viewer | noVNC iframe | SSE `viewer_started` event with port+password |
| Status values | `not_started/running/passed/failed/timeout` | `not_started/in_progress/passed/failure/timeout/stopped` |

## What's Changed in This Patch (v2)

### base.html
- Uses `g.user.name`, `g.user.email`, `g.user.is_admin` (cmdrunner's session model)
- Removed dark theme script — light-only
- Removed theme toggle button from sidebar
- Added admin "Manage Users" link visible to `g.user.is_admin`
- Change password modal checks `g.user.password` for current password field

### test_suites.html
- **Run link** → `GET /run_test_suite/{{ suite.id }}` (was `POST /test_suites/<id>/run`)
- Delete/Edit routes unchanged

### agents.html
- Full SSE event stream handler for `/run_test_suite/<id>`
- Handles all event types: `in_queue`, `run_started`, `viewer_started`, `progress`, `finished`, `failure`, `error`, `connection_error`, `generating_summary`, `learning`, `heartbeat`
- noVNC iframe injected on `viewer_started` event
- Progress updates test case panel in real-time
- Stop button closes the EventSource

### test_runs.html
- Status handling expanded for cmdrunner values: `in_progress`, `failure`, `stopped`

### test_run_view.html
- Adapted for cmdrunner's data model (run with id, status, test_suite_name, created_at)
- Results table with test_case/step/timestamp/status columns
- Summary section (shown if `summary` variable is passed)

### index.html (Dashboard)
- Uses `g.user.name` for greeting
- `stats` dict same keys: `total_suites`, `total_runs`, `pass_rate`, `active_agents`
- ⚠️ Your cmdrunner dashboard route must pass a `stats` dict — if it doesn't, you'll need to add that

### test_suite_new.html & test_suite_edit.html
- Unchanged from v1 — already compatible with cmdrunner's JSON API
- Uses `add_test_case()`, `add_step()`, `update_numbers()`, `make_test_suite_json()` from public.js

### sidebar.js
- Removed theme toggle code (light-only)
- Profile dropdown, change password modal, logout all unchanged

## Files to Copy

### Templates (overwrite in cmdrunner_web/templates/)
- `base.html`
- `docs.html`
- `docs_ngrok.html`

### Page Templates (overwrite in cmdrunner_web/templates/pages/)
- `index.html`
- `agents.html`
- `test_suites.html`
- `test_runs.html`
- `test_run_view.html`
- `test_suite_new.html`
- `test_suite_edit.html`
- `change_password.html`
- `not_approved.html`
- `register_success.html`
- `errors/not_found.html`
- `errors/unauthorized.html`

### Static (overwrite in cmdrunner_web/static/)
- `css/style.css`
- `js/tailwind-config.js`
- `js/sidebar.js`
- `public.js`
- `index.js`

### DO NOT overwrite (keep cmdrunner originals)
- `templates/login.html`
- `templates/register.html`
- `templates/base_guest.html`
- `static/js/lightbox2/`
- `static/favicon/`
- `static/cmdrunner_logo.png`
- `static/cmdrunner_logo_v3.png`

## Quick Apply (in your cmdrunner Codespace)

```bash
cd /workspaces/cmdrunner

# Clone the patch
git clone --branch cmdrunner-frontend-patch --depth 1 https://github.com/karthik-ai452/aitest.git /tmp/aitest-patch

P="/tmp/aitest-patch/cmdrunner-patch"

# Templates
cp $P/templates/base.html cmdrunner_web/templates/base.html
cp $P/templates/docs.html cmdrunner_web/templates/docs.html
cp $P/templates/docs_ngrok.html cmdrunner_web/templates/docs_ngrok.html

# Pages
for f in index agents test_suites test_runs test_run_view test_suite_new test_suite_edit change_password not_approved register_success; do
  cp $P/templates/pages/$f.html cmdrunner_web/templates/pages/$f.html
done
mkdir -p cmdrunner_web/templates/pages/errors
cp $P/templates/pages/errors/not_found.html cmdrunner_web/templates/pages/errors/not_found.html
cp $P/templates/pages/errors/unauthorized.html cmdrunner_web/templates/pages/errors/unauthorized.html

# Static
cp $P/static/css/style.css cmdrunner_web/static/css/style.css
cp $P/static/js/tailwind-config.js cmdrunner_web/static/js/tailwind-config.js
cp $P/static/js/sidebar.js cmdrunner_web/static/js/sidebar.js
cp $P/static/public.js cmdrunner_web/static/public.js
cp $P/static/index.js cmdrunner_web/static/index.js

# Restart
# Ctrl+C then: python -m cmdrunner_web

# Cleanup
rm -rf /tmp/aitest-patch
```

## Backend Route Checklist

Your cmdrunner backend already has all these routes — no backend changes needed:

- [x] `GET /test_suites` → renders `pages/test_suites.html` with `test_suites`
- [x] `GET /test_suites/new` → renders `pages/test_suite_new.html`
- [x] `POST /test_suites/new` → JSON payload, returns `{id, redirect}`
- [x] `GET /test_suites/<id>/edit` → renders `pages/test_suite_edit.html` with `test_suite`
- [x] `POST /test_suites/<id>/edit` → JSON payload, returns `{redirect}`
- [x] `POST /test_suites/<id>/delete` → redirects to `/test_suites`
- [x] `POST /upload_test_suite_file` → returns JSON with `test_suite`
- [x] `GET /run_test_suite/<id>` → SSE event stream
- [x] `POST /agent_action` → sends action to WS agent

### Routes you may need to verify/add:

- [ ] `GET /test_runs` → must render `pages/test_runs.html` with `runs` list
- [ ] `GET /test_runs/<id>` → must render `pages/test_run_view.html` with `run`, `results`, `summary`
- [ ] `POST /test_runs/<id>/delete` → must delete run and redirect
- [ ] `GET /` (dashboard) → must pass `stats` dict with `total_suites`, `total_runs`, `pass_rate`, `active_agents`
- [ ] `GET /agents` → renders `pages/agents.html`
- [ ] `GET /logout` → clears session, redirects to `/login`
- [ ] `POST /change_password` → updates password, redirects