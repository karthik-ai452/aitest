"""CmdRunner Web — Application Factory

Creates and configures the Quart application.
"""
import os
import json

from quart import Quart, render_template, redirect, url_for, request, jsonify
from .db import list_test_suites, get_test_suite, create_test_suite, update_test_suite, delete_test_suite
from .db import list_test_runs, get_test_run, create_test_run, delete_test_run


def create_app(config=None):
    """Create and configure the Quart application."""
    # Determine paths relative to this package
    pkg_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(pkg_dir, 'templates')
    static_dir = os.path.join(pkg_dir, 'static')

    app = Quart(__name__,
                template_folder=template_dir,
                static_folder=static_dir)

    # Minimal configuration
    app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev-secret-change-in-production')

    if config:
        app.config.from_object(config)

    # ─── Template Context ────────────────────────────────────────
    @app.context_processor
    def inject_globals():
        return dict(
            current_user=None,
            current_plan=None,
            plan_limits={},
            usage={},
            plans=[],
            paddle_client_token='',
            paddle_environment='sandbox',
            pop_flash_messages=lambda: [],
            show_trial_banner=lambda: None,
            show_login_banner=lambda: None,
        )

    # ─── Error Handlers ─────────────────────────────────────────
    @app.errorhandler(404)
    async def not_found(e):
        return await render_template('pages/errors/not_found.html'), 404

    @app.errorhandler(403)
    async def forbidden(e):
        return await render_template('pages/errors/unauthorized.html'), 403

    # ─── Auth Routes ────────────────────────────────────────────
    @app.route('/login', methods=['GET'])
    async def login():
        return await render_template('login.html')

    @app.route('/register', methods=['GET'])
    async def register():
        return await render_template('register.html')

    @app.route('/logout')
    async def logout():
        return redirect(url_for('login'))

    # ─── Page Routes (render templates) ─────────────────────────
    @app.route('/')
    async def dashboard():
        suites = list_test_suites()
        runs = list_test_runs()
        stats = {
            'total_suites': len(suites),
            'total_runs': len(runs),
            'pass_rate': 0,
            'active_agents': 0,
        }
        return await render_template('pages/index.html', stats=stats)

    @app.route('/suites')
    @app.route('/test_suites')
    async def test_suites():
        suites = list_test_suites()
        return await render_template('pages/test_suites.html', suites=suites)

    @app.route('/suites/new')
    @app.route('/test_suites/new')
    async def test_suite_new():
        return await render_template('pages/test_suite_new.html')

    @app.route('/test_suites/new', methods=['POST'])
    async def test_suite_create():
        data = await request.get_json()
        if not data or not data.get('name'):
            return jsonify({'error': 'Test suite name is required'}), 400

        suite_id = create_test_suite(
            name=data['name'],
            test_cases=data.get('test_cases', []),
        )
        return jsonify({'id': suite_id, 'redirect': f'/test_suites/{suite_id}/edit'})

    @app.route('/upload_test_suite_file', methods=['POST'])
    async def upload_test_suite_file():
        files = await request.files
        file = files.get('file')
        if not file:
            return jsonify({'error': 'No file uploaded'}), 400

        # Parse file content into test_suite structure
        filename = file.filename or 'uploaded'
        content = file.read().decode('utf-8', errors='replace')

        # Simple parsing: each non-empty line is a step
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        test_cases = []
        if lines:
            test_cases.append({
                'name': filename,
                'url': '',
                'steps': [{'name': line, 'expectation': '', 'notes': ''} for line in lines],
            })

        return jsonify({'test_suite': {'name': filename, 'test_cases': test_cases}})

    @app.route('/suites/<int:suite_id>/edit')
    @app.route('/test_suites/<int:suite_id>/edit')
    async def test_suite_edit(suite_id):
        suite = get_test_suite(suite_id)
        if not suite:
            return await render_template('pages/test_suite_edit.html', test_suite={'id': suite_id, 'name': '', 'test_cases': []}, suite_id=suite_id)
        # Use 'timestamp' key expected by the template
        suite['timestamp'] = suite.get('created_at', '')
        return await render_template('pages/test_suite_edit.html', test_suite=suite, suite_id=suite_id)

    @app.route('/test_suites/<int:suite_id>/edit', methods=['POST'])
    async def test_suite_update(suite_id):
        data = await request.get_json()
        if not data or not data.get('name'):
            return jsonify({'error': 'Test suite name is required'}), 400

        update_test_suite(
            suite_id=suite_id,
            name=data['name'],
            test_cases=data.get('test_cases', []),
        )
        return jsonify({'redirect': '/test_suites'})

    @app.route('/test_suites/<int:suite_id>/delete', methods=['POST'])
    async def test_suite_delete(suite_id):
        delete_test_suite(suite_id)
        return redirect('/test_suites')

    @app.route('/test_suites/<int:suite_id>/run', methods=['POST'])
    async def test_suite_run(suite_id):
        suite = get_test_suite(suite_id)
        if not suite:
            return redirect('/test_suites')
        run_id = create_test_run(suite_id, suite['name'])
        return redirect(f'/agents?suite_id={suite_id}&run_id={run_id}')

    @app.route('/runs')
    @app.route('/test_runs')
    async def test_runs():
        runs = list_test_runs()
        return await render_template('pages/test_runs.html', runs=runs)

    @app.route('/runs/<int:run_id>')
    @app.route('/test_runs/<int:run_id>')
    async def test_run_view(run_id):
        run = get_test_run(run_id)
        return await render_template('pages/test_run_view.html', run=run, run_id=run_id, results=[], summary=None)

    @app.route('/test_runs/<int:run_id>/delete', methods=['POST'])
    async def test_run_delete(run_id):
        delete_test_run(run_id)
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

    @app.route('/subscribe')
    async def subscribe():
        return await render_template('pages/subscribe.html', plans=[])

    @app.route('/subscribe/submit')
    async def subscribe_submit():
        return await render_template('pages/subscribe_submit.html')

    @app.route('/subscribe/error')
    async def subscribe_error():
        return await render_template('pages/subscribe_error.html')

    @app.route('/trial-ended')
    async def trial_ended():
        return await render_template('pages/trial_ended.html')

    @app.route('/change-password')
    async def not_approved():
        return await render_template('pages/not_approved.html')

    @app.route('/register-success')
    async def register_success():
        return await render_template('pages/register_success.html')

    return app