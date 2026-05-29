/* CmdRunner — Dashboard Page Logic */
(function () {
    'use strict';

    function initDashboard() {
        // Animate stat counters on load
        document.querySelectorAll('.font-display-lg').forEach(function (el) {
            var target = parseInt(el.textContent, 10);
            if (isNaN(target)) return;
            var start = 0;
            var duration = 800;
            var startTime = null;

            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(start + (target - start) * eased);
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        });
    }

    if (document.body.getAttribute('data-page') === 'dashboard') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initDashboard);
        } else {
            initDashboard();
        }
    }
})();