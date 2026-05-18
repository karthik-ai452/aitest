/* CmdRunner — Shared Sidebar + TopNav + Modals HTML Injection */
(function () {
    // Determine the active page from the current filename
    var path = window.location.pathname;
    var page = path.split('/').pop().replace('.html', '') || 'index';
    if (page === 'index') page = 'dashboard';

    var navItems = [
        { id: 'dashboard', href: 'index.html', icon: 'dashboard', label: 'Dashboard' },
        { id: 'suites', href: 'suites.html', icon: 'collections_bookmark', label: 'Test Suites' },
        { id: 'runs', href: 'runs.html', icon: 'history_toggle_off', label: 'Test Runs' },
        { id: 'agents', href: 'agents.html', icon: 'smart_toy', label: 'Agents' },
    ];

    var bottomNavItems = [
        { id: 'docs', href: 'docs.html', icon: 'menu_book', label: 'Documentation' },
    ];

    function buildNav() {
        return navItems.map(function (item) {
            var isActive = page === item.id;
            var cls = isActive
                ? 'flex items-center gap-3 px-4 py-3 text-primary border-l-2 border-primary bg-surface-container-high transition-colors duration-200'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200';
            return '<a class="' + cls + '" href="' + item.href + '">'
                + '<span class="material-symbols-outlined" data-icon="' + item.icon + '">' + item.icon + '</span>'
                + '<span class="nav-label font-body-md text-body-md">' + item.label + '</span>'
                + '</a>';
        }).join('');
    }

    function buildBottomNav() {
        return bottomNavItems.map(function (item) {
            var isActive = page === item.id;
            var cls = isActive
                ? 'flex items-center gap-3 px-4 py-3 text-primary border-l-2 border-primary bg-surface-container-high transition-colors duration-200'
                : 'flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200';
            return '<a class="' + cls + '" href="' + item.href + '">'
                + '<span class="material-symbols-outlined" data-icon="' + item.icon + '">' + item.icon + '</span>'
                + '<span class="nav-label font-body-md text-body-md">' + item.label + '</span>'
                + '</a>';
        }).join('');
    }

    var sidebarHTML = ''
        + '<aside id="sidebar" class="fixed left-0 top-0 h-screen w-sidebar-width bg-surface-container-low border-r border-outline-variant flex flex-col py-margin-desktop z-50">'
        + '<div class="flex items-center justify-between px-6 mb-8 sidebar-header">'
        + '<div>'
        + '<h1 class="sidebar-title font-headline-md text-headline-md font-bold text-on-surface">CmdRunner</h1>'
        + '<p class="sidebar-subtitle font-label-caps text-label-caps text-on-surface-variant opacity-70">QA ENGINEERING</p>'
        + '</div>'
        + '<button id="sidebar-toggle" class="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container-highest" title="Toggle sidebar">'
        + '<span class="material-symbols-outlined" data-icon="menu_open">menu_open</span>'
        + '</button>'
        + '</div>'
        + '<nav class="flex-1 space-y-1">'
        + buildNav()
        + '</nav>'
        + '<div class="mt-auto border-t border-outline-variant pt-4">'
        + '<button id="theme-toggle" class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200 w-full text-left">'
        + '<span class="material-symbols-outlined" data-icon="light_mode">light_mode</span>'
        + '<span class="nav-label font-body-md text-body-md">Light Mode</span>'
        + '</button>'
        + '<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-colors duration-200" href="#">'
        + '<span class="material-symbols-outlined" data-icon="settings">settings</span>'
        + '<span class="nav-label font-body-md text-body-md">Settings</span>'
        + '</a>'
        + buildBottomNav()
        + '</div>'
        + '</aside>';

    var topnavHTML = ''
        + '<header id="topnav" class="fixed top-0 right-0 h-16 bg-surface border-b border-outline-variant flex justify-end items-center px-8 ml-sidebar-width w-[calc(100%-260px)] z-40">'
        + '<div class="relative">'
        + '<button id="profile-btn" class="w-8 h-8 rounded-full bg-surface-variant border border-outline-variant overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30">'
        + '<img class="w-full h-full object-cover" alt="User Profile Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-27EJ8pu3Wygjt3F8IIqqWR_BLQ8jmIqJTmYuyLvrHNNOm46Gsg-xT_oL9HeHq0M261pi8q9TgAO0ogvTQwmbR2drUtRm9sXHM3X_o1wlh1Gs5B7-HivS-qK9wZJqryJ1fOur3hS_DxILyFH8CyfNbWcRTvzJh2teRF3vSx49Mv9xYNcC0iXYtSV3-8A66FbKwELYJeelCJzFf4Za_JAnqtaX7Ygjl9mHqCeFwQYzoh6VtejTPCoCFK5PtRGUOewG2UANJqfcwg"/>'
        + '</button>'
        + '<div id="profile-dropdown" class="hidden absolute right-0 top-12 w-56 bg-surface-container border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">'
        + '<div class="px-4 py-3 border-b border-outline-variant">'
        + '<p class="font-body-md text-body-md text-on-surface font-medium">Karthik Reddy</p>'
        + '<p class="font-body-sm text-body-sm text-on-surface-variant">karthik@example.com</p>'
        + '</div>'
        + '<div class="py-1">'
        + '<button id="change-pwd-btn" class="flex items-center gap-3 w-full px-4 py-2.5 text-on-surface-variant hover:bg-surface-container-high transition-colors text-left">'
        + '<span class="material-symbols-outlined text-lg" data-icon="lock">lock</span>'
        + '<span class="font-body-sm text-body-sm">Change Password</span>'
        + '</button>'
        + '<button id="logout-btn" class="flex items-center gap-3 w-full px-4 py-2.5 text-error hover:bg-surface-container-high transition-colors text-left">'
        + '<span class="material-symbols-outlined text-lg" data-icon="logout">logout</span>'
        + '<span class="font-body-sm text-body-sm">Log Out</span>'
        + '</button>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '</header>';

    var modalHTML = ''
        + '<div id="change-pwd-modal" class="hidden fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">'
        + '<div class="bg-surface-container border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-2xl">'
        + '<h3 class="font-headline-md text-headline-md text-on-surface mb-1">Change Password</h3>'
        + '<p class="font-body-sm text-body-sm text-on-surface-variant mb-6">Enter your current password and choose a new one.</p>'
        + '<form id="change-pwd-form" class="space-y-4">'
        + '<div>'
        + '<label class="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">CURRENT PASSWORD</label>'
        + '<input type="password" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Enter current password"/>'
        + '</div>'
        + '<div>'
        + '<label class="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">NEW PASSWORD</label>'
        + '<input type="password" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Enter new password"/>'
        + '</div>'
        + '<div>'
        + '<label class="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">CONFIRM NEW PASSWORD</label>'
        + '<input type="password" required class="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary" placeholder="Confirm new password"/>'
        + '</div>'
        + '<div class="flex gap-3 pt-2">'
        + '<button type="submit" class="flex-1 bg-primary-container text-on-primary-container font-label-caps text-label-caps py-2.5 rounded-lg hover:opacity-90 transition-opacity">Update Password</button>'
        + '<button type="button" id="change-pwd-cancel" class="flex-1 border border-outline-variant text-on-surface-variant font-label-caps text-label-caps py-2.5 rounded-lg hover:bg-surface-container-high transition-colors">Cancel</button>'
        + '</div>'
        + '</form>'
        + '</div>'
        + '</div>';

    // Inject into page
    function injectComponents() {
        // Inject sidebar before main content marker
        var sidebarMarker = document.getElementById('sidebar-inject');
        if (sidebarMarker) {
            sidebarMarker.outerHTML = sidebarHTML;
        }

        // Inject topnav
        var topnavMarker = document.getElementById('topnav-inject');
        if (topnavMarker) {
            topnavMarker.outerHTML = topnavHTML;
        }

        // Inject modal at end of body
        var modalMarker = document.getElementById('modal-inject');
        if (modalMarker) {
            modalMarker.outerHTML = modalHTML;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectComponents);
    } else {
        injectComponents();
    }
})();