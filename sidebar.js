/* CmdRunner — Collapsible Sidebar */
(function () {
    const SIDEBAR_WIDTH = 260;
    const SIDEBAR_COLLAPSED = 64;
    const STORAGE_KEY = 'cmdrunner-sidebar-collapsed';

    function init() {
        const sidebar = document.getElementById('sidebar');
        const header = document.getElementById('topnav');
        const main = document.getElementById('main-content');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const overlay = document.getElementById('sidebar-overlay');

        if (!sidebar || !toggleBtn) return;

        // Read saved state
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'true') {
            sidebar.classList.add('sidebar-collapsed');
        }

        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-collapsed');
            const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
            localStorage.setItem(STORAGE_KEY, isCollapsed);
            // Update toggle icon
            const icon = toggleBtn.querySelector('.material-symbols-outlined');
            if (icon) {
                icon.textContent = isCollapsed ? 'menu' : 'menu_open';
            }
        });

        // Set initial icon state
        const icon = toggleBtn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = sidebar.classList.contains('sidebar-collapsed') ? 'menu' : 'menu_open';
        }

        // Overlay click to close on mobile (if ever used)
        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('sidebar-collapsed');
                localStorage.setItem(STORAGE_KEY, false);
                const icon = toggleBtn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'menu_open';
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();