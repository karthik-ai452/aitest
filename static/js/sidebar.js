/* CmdRunner — Collapsible Sidebar + Theme Toggle + Profile Dropdown */
(function () {
    const SIDEBAR_KEY = 'cmdrunner-sidebar-collapsed';
    const THEME_KEY = 'cmdrunner-theme';

    function init() {
        initSidebar();
        initTheme();
        initProfileDropdown();
    }

    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (!sidebar || !toggleBtn) return;

        const saved = localStorage.getItem(SIDEBAR_KEY);
        if (saved === 'true') sidebar.classList.add('sidebar-collapsed');

        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('sidebar-collapsed');
            const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
            localStorage.setItem(SIDEBAR_KEY, isCollapsed);
            const icon = toggleBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.textContent = isCollapsed ? 'menu' : 'menu_open';
        });

        const icon = toggleBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = sidebar.classList.contains('sidebar-collapsed') ? 'menu' : 'menu_open';
    }

    function initTheme() {
        const html = document.documentElement;
        const themeBtn = document.getElementById('theme-toggle');
        if (!themeBtn) return;

        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        if (savedTheme === 'light') html.classList.remove('dark');
        else html.classList.add('dark');
        updateThemeIcon(themeBtn, savedTheme);

        themeBtn.addEventListener('click', function () {
            const isDark = html.classList.contains('dark');
            if (isDark) {
                html.classList.remove('dark');
                localStorage.setItem(THEME_KEY, 'light');
                updateThemeIcon(themeBtn, 'light');
            } else {
                html.classList.add('dark');
                localStorage.setItem(THEME_KEY, 'dark');
                updateThemeIcon(themeBtn, 'dark');
            }
        });
    }

    function updateThemeIcon(btn, theme) {
        const icon = btn.querySelector('.material-symbols-outlined');
        const label = btn.querySelector('.nav-label');
        if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        if (label) label.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    function initProfileDropdown() {
        const profileBtn = document.getElementById('profile-btn');
        const dropdown = document.getElementById('profile-dropdown');
        const changePwdBtn = document.getElementById('change-pwd-btn');
        const changePwdModal = document.getElementById('change-pwd-modal');
        const changePwdCancel = document.getElementById('change-pwd-cancel');
        const changePwdForm = document.getElementById('change-pwd-form');

        if (!profileBtn || !dropdown) return;

        // Toggle dropdown
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Change Password modal
        if (changePwdBtn && changePwdModal) {
            changePwdBtn.addEventListener('click', function () {
                dropdown.classList.add('hidden');
                changePwdModal.classList.remove('hidden');
            });
        }
        if (changePwdCancel && changePwdModal) {
            changePwdCancel.addEventListener('click', function () {
                changePwdModal.classList.add('hidden');
            });
        }
        if (changePwdModal) {
            changePwdModal.addEventListener('click', function (e) {
                if (e.target === changePwdModal) changePwdModal.classList.add('hidden');
            });
        }
        if (changePwdForm) {
            changePwdForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const inputs = changePwdForm.querySelectorAll('input[type="password"]');
                const currentPwd = inputs[0] ? inputs[0].value : '';
                const newPwd = inputs[1] ? inputs[1].value : '';
                const confirmPwd = inputs[2] ? inputs[2].value : '';

                if (!currentPwd || !newPwd || !confirmPwd) {
                    CmdRunnerApp.showToast('Please fill in all fields.', 'error');
                    return;
                }
                if (newPwd !== confirmPwd) {
                    CmdRunnerApp.showToast('New passwords do not match.', 'error');
                    return;
                }
                if (newPwd.length < 6) {
                    CmdRunnerApp.showToast('Password must be at least 6 characters.', 'error');
                    return;
                }
                CmdRunnerApp.showToast('Password updated successfully!', 'success');
                changePwdModal.classList.add('hidden');
                changePwdForm.reset();
            });
        }

        // Log Out
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                dropdown.classList.add('hidden');
                if (confirm('Are you sure you want to log out?')) {
                    CmdRunnerApp.showToast('You have been logged out.', 'info');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();