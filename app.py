"""CmdRunner — Codespace Server

Serves the frontend templates and static assets via Quart.
Auto-installs dependencies if missing.
"""
import os
import sys
import subprocess

# Auto-install deps if missing
try:
    import quart
except ImportError:
    print("Installing dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r",
                           os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt")])

import sqlite3
import asyncio

from quart import Quart, render_template, redirect, request, jsonify

# Templates and static are in the same directory as this file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Quart(__name__,
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'))

app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-secret')


def get_db():
    db_path = os.environ.get('DATABASE_PATH', os.path.join(BASE_DIR, 'cmdrunner.db'))
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS test_suites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_suite_id INTEGER NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT '',
            url TEXT DEFAULT '',
            sort_order INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS test_case_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_case_id INTEGER NOT NULL REFERENCES test_cases(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT '',
            expectation TEXT DEFAULT '',
            notes TEXT DEFAULT '',
            sort_order INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS test_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_suite_id INTEGER NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
            test_suite_name TEXT NOT NULL DEFAULT '',
            status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','running','passed','failed','timeout')),
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


@app.context_processor
def inject_globals():
    return dict(current_user=None, current_plan=None, plans=[])


@app.route('/login')
async def login():
    return await render_template('login.html')

@app.route('/register')
async def register():
    return await render_template('register.html')

@app.route('/logout')
async def logout():
    return redirect('/login')


@app.route('/')
async def dashboard():
    conn = get_db()
    suites = [dict(r) for r in conn.execute("SELECT id FROM test_suites").fetchall()]
    runs = [dict(r) for r in conn.execute("SELECT id FROM test_runs").fetchall()]
    conn.close()
    stats = {'total_suites': len(suites), 'total_runs': len(runs), 'pass_rate': 0, 'active_agents': 0}
    return await render_template('pages/index.html', stats=stats)


@app.route('/suites')
@app.route('/test_suites')
async def test_suites():
    conn = get_db()
    suites = [dict(r) for r in conn.execute("SELECT id, name, created_at FROM test_suites ORDER BY created_at DESC").fetchall()]
    conn.close()
    return await render_template('pages/test_suites.html', suites=suites)


@app.route('/suites/new')
@app.route('/test_suites/new')
async def test_suite_new():
    return await render_template('pages/test_suite_new.html')


@app.route('/test_suites/new', methods=['POST'])
async def test_suite_create():
    data = await request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Name required'}), 400
    conn = get_db()
    cur = conn.execute("INSERT INTO test_suites (name) VALUES (?)", (data['name'],))
    suite_id = cur.lastrowid
    for i, tc in enumerate(data.get('test_cases', [])):
        cur = conn.execute("INSERT INTO test_cases (test_suite_id, name, url, sort_order) VALUES (?, ?, ?, ?)",
            (suite_id, tc.get('name', ''), tc.get('url', ''), i))
        case_id = cur.lastrowid
        for j, step in enumerate(tc.get('steps', [])):
            conn.execute("INSERT INTO test_case_steps (test_case_id, name, expectation, notes, sort_order) VALUES (?, ?, ?, ?, ?)",
                (case_id, step.get('name', ''), step.get('expectation', ''), step.get('notes', ''), j))
    conn.commit(); conn.close()
    return jsonify({'id': suite_id, 'redirect': f'/test_suites/{suite_id}/edit'})


@app.route('/upload_test_suite_file', methods=['POST'])
async def upload_test_suite_file():
    files = await request.files
    file = files.get('file')
    if not file:
        return jsonify({'error': 'No file'}), 400
    filename = file.filename or 'uploaded'
    content = file.read().decode('utf-8', errors='replace')
    lines = [l.strip() for l in content.splitlines() if l.strip()]
    test_cases = [{'name': filename, 'url': '', 'steps': [{'name': line, 'expectation': '', 'notes': ''} for line in lines]}] if lines else []
    return jsonify({'test_suite': {'name': filename, 'test_cases': test_cases}})


@app.route('/suites/<int:suite_id>/edit')
@app.route('/test_suites/<int:suite_id>/edit')
async def test_suite_edit(suite_id):
    conn = get_db()
    suite = conn.execute("SELECT id, name, created_at FROM test_suites WHERE id=?", (suite_id,)).fetchone()
    if not suite:
        conn.close()
        return await render_template('pages/test_suite_edit.html', test_suite={'id': suite_id, 'name': '', 'test_cases': []}, suite_id=suite_id)
    suite = dict(suite)
    cases = [dict(r) for r in conn.execute("SELECT id, name, url, sort_order FROM test_cases WHERE test_suite_id=? ORDER BY sort_order", (suite_id,)).fetchall()]
    suite['test_cases'] = []
    for case in cases:
        steps = [dict(r) for r in conn.execute("SELECT id, name, expectation, notes, sort_order FROM test_case_steps WHERE test_case_id=? ORDER BY sort_order", (case['id'],)).fetchall()]
        case['steps'] = steps
        suite['test_cases'].append(case)
    suite['timestamp'] = suite.get('created_at', '')
    conn.close()
    return await render_template('pages/test_suite_edit.html', test_suite=suite, suite_id=suite_id)


@app.route('/test_suites/<int:suite_id>/edit', methods=['POST'])
async def test_suite_update(suite_id):
    data = await request.get_json()
    if not data or not data.get('name'):
        return jsonify({'error': 'Name required'}), 400
    conn = get_db()
    conn.execute("UPDATE test_suites SET name=? WHERE id=?", (data['name'], suite_id))
    conn.execute("DELETE FROM test_cases WHERE test_suite_id=?", (suite_id,))
    for i, tc in enumerate(data.get('test_cases', [])):
        cur = conn.execute("INSERT INTO test_cases (test_suite_id, name, url, sort_order) VALUES (?, ?, ?, ?)",
            (suite_id, tc.get('name', ''), tc.get('url', ''), i))
        case_id = cur.lastrowid
        for j, step in enumerate(tc.get('steps', [])):
            conn.execute("INSERT INTO test_case_steps (test_case_id, name, expectation, notes, sort_order) VALUES (?, ?, ?, ?, ?)",
                (case_id, step.get('name', ''), step.get('expectation', ''), step.get('notes', ''), j))
    conn.commit(); conn.close()
    return jsonify({'redirect': '/test_suites'})


@app.route('/test_suites/<int:suite_id>/delete', methods=['POST'])
async def test_suite_delete(suite_id):
    conn = get_db()
    conn.execute("DELETE FROM test_suites WHERE id=?", (suite_id,))
    conn.commit(); conn.close()
    return redirect('/test_suites')


@app.route('/test_suites/<int:suite_id>/run', methods=['POST'])
async def test_suite_run(suite_id):
    conn = get_db()
    suite = conn.execute("SELECT name FROM test_suites WHERE id=?", (suite_id,)).fetchone()
    if not suite:
        conn.close()
        return redirect('/test_suites')
    cur = conn.execute("INSERT INTO test_runs (test_suite_id, test_suite_name, status) VALUES (?, ?, 'not_started')",
        (suite_id, suite['name']))
    run_id = cur.lastrowid
    conn.commit(); conn.close()
    return redirect(f'/agents?suite_id={suite_id}&run_id={run_id}')


@app.route('/runs')
@app.route('/test_runs')
async def test_runs():
    conn = get_db()
    runs = [dict(r) for r in conn.execute("SELECT id, test_suite_name, status, created_at FROM test_runs ORDER BY created_at DESC").fetchall()]
    conn.close()
    return await render_template('pages/test_runs.html', runs=runs)


@app.route('/runs/<int:run_id>')
@app.route('/test_runs/<int:run_id>')
async def test_run_view(run_id):
    conn = get_db()
    run = conn.execute("SELECT id, test_suite_id, test_suite_name, status, created_at FROM test_runs WHERE id=?", (run_id,)).fetchone()
    run = dict(run) if run else None
    conn.close()
    return await render_template('pages/test_run_view.html', run=run, run_id=run_id, results=[], summary=None)


@app.route('/test_runs/<int:run_id>/delete', methods=['POST'])
async def test_run_delete(run_id):
    conn = get_db()
    conn.execute("DELETE FROM test_runs WHERE id=?", (run_id,))
    conn.commit(); conn.close()
    return redirect('/test_runs')


@app.route('/agents')
async def agents():
    return await render_template('pages/agents.html')


@app.route('/docs')
async def docs():
    return await render_template('docs.html')


@app.route('/docs/ngrok')
async def docs_ngrok():
    return await render_template('docs_ngrok.html')


@app.route('/docs/ngrok')
async def docs_ngrok():
    return await render_template('docs_ngrok.html')


if __name__ == '__main__':
    from hypercorn.config import Config
    from hypercorn.asyncio import serve

    init_db()
    print("✅ Database initialized")

    config = Config()
    config.bind = ["0.0.0.0:5000"]
    config.accesslog = '-'
    config.errorlog = '-'
    config.workers = 1
    print("🚀 Starting server on http://localhost:5000")
    asyncio.run(serve(app, config))
