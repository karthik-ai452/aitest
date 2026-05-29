/* CmdRunner — Sidebar */
(function () {
    'use strict';

    // ─── Sidebar Toggle ────────────────────────────────────────
    var sidebar = document.getElementById('sidebar');
    var toggleBtn = document.getElementById('sidebar-toggle');
    var topnav = document.getElementById('topnav');
    var mainContent = document.getElementById('main-content');

    function collapseSidebar() {
        if (sidebar) sidebar.classList.add('sidebar-collapsed');
        if (topnav) { topnav.classList.add('ml-0'); topnav.classList.remove('ml-sidebar-width'); topnav.style.width = '100%'; }
        if (mainContent) { mainContent.classList.add('ml-0'); mainContent.classList.remove('ml-sidebar-width'); }
        try { localStorage.setItem('cmdrunner-sidebar', 'collapsed'); } catch (e) {}
    }

    function expandSidebar() {
        if (sidebar) sidebar.classList.remove('sidebar-collapsed');
        if (topnav) { topnav.classList.remove('ml-0'); topnav.classList.add('ml-sidebar-width'); topnav.style.width = ''; }
        if (mainContent) { mainContent.classList.remove('ml-0'); mainContent.classList.add('ml-sidebar-width'); }
        try { localStorage.setItem('cmdrunner-sidebar', 'expanded'); } catch (e) {}
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            var isCollapsed = sidebar && sidebar.classList.contains('sidebar-collapsed');
            if (isCollapsed) { expandSidebar(); } else { collapseSidebar(); }
        });
    }

    // Restore saved state
    try {
        var saved = localStorage.getItem('cmdrunner-sidebar');
        if (saved === 'collapsed') { collapseSidebar(); }
    } catch (e) {}

    // ─── Profile Dropdown ───────────────────────────────────────
    var profileBtn = document.getElementById('profile-btn');
    var profileDropdown = document.getElementById('profile-dropdown');
    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', function () {
            profileDropdown.classList.add('hidden');
        });
    }

    // ─── Change Password Modal ─────────────────────────────────
    var changePwdBtn = document.getElementById('change-pwd-btn');
    var changePwdModal = document.getElementById('change-pwd-modal');
    var changePwdCancel = document.getElementById('change-pwd-cancel');
    if (changePwdBtn && changePwdModal) {
        changePwdBtn.addEventListener('click', function () {
            changePwdModal.classList.remove('hidden');
            if (profileDropdown) profileDropdown.classList.add('hidden');
        });
    }
    if (changePwdCancel && changePwdModal) {
        changePwdCancel.addEventListener('click', function () {
            changePwdModal.classList.add('hidden');
        });
    }

    // ─── Logout ─────────────────────────────────────────────────
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            window.location.href = '/logout';
        });
    }
})();