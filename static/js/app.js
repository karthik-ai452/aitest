/* CmdRunner — Client-side App Logic (no backend required) */
var CmdRunnerApp = (function () {

    // ─── Toast System ─────────────────────────────────────────
    function showToast(message, type) {
        type = type || 'info';
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 300);
        }, 3000);
    }

    // ─── Local Storage Data Layer ─────────────────────────────
    var STORAGE_KEYS = {
        suites: 'cmdrunner-suites',
    };

    function getData(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setData(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    // ─── Suite Management ─────────────────────────────────────
    function getSuites() {
        return getData(STORAGE_KEYS.suites) || [];
    }

    function saveSuite(suite) {
        var suites = getSuites();
        suite.id = 'TS-' + Date.now();
        suite.created = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        suite.testCount = 0;
        suite.status = 'active';
        suites.unshift(suite);
        setData(STORAGE_KEYS.suites, suites);
        return suite;
    }

    function deleteSuite(id) {
        var suites = getSuites().filter(function (s) { return s.id !== id; });
        setData(STORAGE_KEYS.suites, suites);
    }

    // ─── Runs — Backend Integration Point ─────────────────────
    // Replace with: fetch('YOUR_API_BASE/api/runs', { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })

    // ─── Suite Page Logic ─────────────────────────────────────
    function initSuitesPage() {
        renderSuites();
        bindCreateSuite();
    }

    function renderSuites() {
        var grid = document.getElementById('suites-grid');
        var emptyState = document.getElementById('suites-empty');
        if (!grid) return;

        var suites = getSuites();

        if (suites.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        var html = '';
        suites.forEach(function (suite) {
            html += '<div class="bg-surface-container border border-outline-variant rounded-xl p-5 hover:border-primary/40 transition-all group relative">'
                + '<div class="flex items-start justify-between mb-3">'
                + '<div class="p-2.5 bg-primary-container/15 rounded-lg border border-primary/20">'
                + '<span class="material-symbols-outlined text-primary">collections_bookmark</span>'
                + '</div>'
                + '<button class="delete-suite-btn opacity-0 group-hover:opacity-100 p-1 text-error hover:bg-error/10 rounded transition-all" data-id="' + suite.id + '" title="Delete suite">'
                + '<span class="material-symbols-outlined text-lg">delete</span>'
                + '</button>'
                + '</div>'
                + '<h3 class="font-title-sm text-title-sm text-on-surface mb-1">' + escapeHtml(suite.name) + '</h3>'
                + '<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">' + escapeHtml(suite.description || 'No description') + '</p>'
                + '<div class="flex items-center justify-between">'
                + '<span class="font-code-sm text-code-sm text-on-surface-variant">' + suite.testCount + ' tests</span>'
                + '<span class="font-code-sm text-code-sm text-on-surface-variant">' + suite.created + '</span>'
                + '</div>'
                + '</div>';
        });

        grid.innerHTML = html;

        // Bind delete buttons
        grid.querySelectorAll('.delete-suite-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                if (confirm('Delete this test suite?')) {
                    deleteSuite(id);
                    renderSuites();
                    showToast('Suite deleted.', 'info');
                }
            });
        });
    }

    function bindCreateSuite() {
        var btn = document.getElementById('create-suite-btn');
        var btnHeader = document.getElementById('create-suite-btn-header');
        var modal = document.getElementById('create-suite-modal');
        var cancelBtn = document.getElementById('create-suite-cancel');
        var form = document.getElementById('create-suite-form');

        function openModal() { if (modal) modal.classList.remove('hidden'); }
        function closeModal() { if (modal) modal.classList.add('hidden'); }

        if (btn) btn.addEventListener('click', openModal);
        if (btnHeader) btnHeader.addEventListener('click', openModal);
        if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
        }

        if (form) {
            form.addEventListener('submit', function (e) {
                e.preventDefault();
                var name = form.querySelector('#suite-name').value.trim();
                var desc = form.querySelector('#suite-desc').value.trim();
                if (!name) {
                    showToast('Please enter a suite name.', 'error');
                    return;
                }
                saveSuite({ name: name, description: desc });
                form.reset();
                closeModal();
                renderSuites();
                showToast('Suite "' + name + '" created!', 'success');
            });
        }
    }

    // ─── Runs Page Logic ──────────────────────────────────────
    // Connect your backend API here:
    //   fetch('YOUR_API_BASE_URL/api/runs', {
    //       headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
    //   })
    //   .then(res => res.json())
    //   .then(data => { /* render into #runs-data-container */ })
    function initRunsPage() {
        // Backend integration point — add your API call here
    }

    // ─── Agents Page Logic ────────────────────────────────────
    function initAgentsPage() {
        initFileUpload();
        initAgentRun();
    }

    function initFileUpload() {
        var uploadBtn = document.getElementById('upload-suite-btn');
        if (!uploadBtn) return;

        uploadBtn.addEventListener('click', function () {
            var input = document.createElement('input');
            input.type = 'file';
            input.accept = '.xls,.xlsx,.pdf,.txt,.csv';
            input.addEventListener('change', function () {
                if (input.files && input.files.length > 0) {
                    var file = input.files[0];
                    showToast('File "' + file.name + '" uploaded! Test cases will appear shortly.', 'success');
                    renderTestCases(file.name);
                }
            });
            input.click();
        });
    }

    function renderTestCases(fileName) {
        var container = document.getElementById('test-case-list');
        if (!container) return;

        var cases = [
            { name: 'Login with valid credentials', status: 'pending' },
            { name: 'Login with invalid password', status: 'pending' },
            { name: 'Password reset flow', status: 'pending' },
            { name: 'Session timeout handling', status: 'pending' },
            { name: 'Remember me functionality', status: 'pending' },
        ];

        var html = '<div class="px-4 py-3 border-b border-outline-variant bg-surface-container/50 flex items-center justify-between">'
            + '<div class="flex items-center gap-2">'
            + '<span class="material-symbols-outlined text-secondary text-lg">description</span>'
            + '<span class="font-code-sm text-code-sm text-on-surface">' + escapeHtml(fileName) + '</span>'
            + '</div>'
            + '<span class="font-label-caps text-label-caps text-secondary">' + cases.length + ' cases</span>'
            + '</div>'
            + '<div class="flex-1 overflow-y-auto">';

        cases.forEach(function (tc, i) {
            html += '<div class="px-4 py-3 border-b border-outline-variant/50 flex items-center gap-3 test-case-row" data-index="' + i + '">'
                + '<div class="w-5 h-5 rounded-full border-2 border-outline-variant flex items-center justify-center status-dot">'
                + '</div>'
                + '<span class="font-body-sm text-body-sm text-on-surface">' + escapeHtml(tc.name) + '</span>'
                + '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
    }

    function initAgentRun() {
        var runBtn = document.getElementById('run-agent-btn');
        var stopBtn = document.getElementById('stop-agent-btn');
        if (!runBtn) return;

        var isRunning = false;
        var runInterval = null;

        runBtn.addEventListener('click', function () {
            if (isRunning) return;
            isRunning = true;
            showToast('Test execution started...', 'info');

            var rows = document.querySelectorAll('.test-case-row');
            var currentIndex = 0;

            runInterval = setInterval(function () {
                if (currentIndex >= rows.length) {
                    clearInterval(runInterval);
                    isRunning = false;
                    var passed = Math.floor(Math.random() * 3) + (rows.length - 3);
                    showToast('Execution complete! ' + passed + '/' + rows.length + ' passed.', 'success');
                    return;
                }

                var row = rows[currentIndex];
                var dot = row.querySelector('.status-dot');
                // Running state
                dot.innerHTML = '<div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>';
                dot.style.borderColor = '#c3c0ff';

                setTimeout(function () {
                    var passed = Math.random() > 0.25;
                    if (passed) {
                        dot.innerHTML = '<span class="material-symbols-outlined text-secondary" style="font-size:14px">check</span>';
                        dot.style.borderColor = '#4edea3';
                        dot.style.backgroundColor = 'rgba(78,222,163,0.1)';
                    } else {
                        dot.innerHTML = '<span class="material-symbols-outlined text-error" style="font-size:14px">close</span>';
                        dot.style.borderColor = '#ffb4ab';
                        dot.style.backgroundColor = 'rgba(255,180,171,0.1)';
                    }
                }, 800);

                currentIndex++;
            }, 1200);
        });

        if (stopBtn) {
            stopBtn.addEventListener('click', function () {
                if (!isRunning) return;
                clearInterval(runInterval);
                isRunning = false;
                showToast('Execution stopped.', 'info');
            });
        }
    }

    // ─── Dashboard Logic ──────────────────────────────────────
    // Dashboard stats will come from your backend API.
    // Replace with: fetch('YOUR_API_BASE/api/dashboard/stats', { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } })
    function initDashboard() {
        // Backend integration point — add your API call here
        // The #dashboard-welcome and #dashboard-stats containers are in index.html
    }

    // ─── Utility ──────────────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // ─── Init ─────────────────────────────────────────────────
    function init() {
        var page = document.body.getAttribute('data-page');
        if (page === 'dashboard') initDashboard();
        else if (page === 'suites') initSuitesPage();
        else if (page === 'runs') initRunsPage();
        else if (page === 'agents') initAgentsPage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        showToast: showToast,
        getSuites: getSuites,
        getRuns: getRuns,
    };
})();