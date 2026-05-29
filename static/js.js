/* CmdRunner — General JS Utilities

Shared utility functions used across the application.
*/
(function () {
    'use strict';

    // Debounce helper
    window.debounce = function (func, wait) {
        var timeout;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                func.apply(context, args);
            }, wait);
        };
    };

    // Throttle helper
    window.throttle = function (func, limit) {
        var inThrottle;
        return function () {
            var args = arguments;
            var context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function () { inThrottle = false; }, limit);
            }
        };
    };

    // Format date helper
    window.formatDate = function (dateStr) {
        if (!dateStr) return 'N/A';
        try {
            var d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Format currency (cents to dollars)
    window.formatCurrency = function (cents) {
        if (cents === undefined || cents === null) return '$0.00';
        return '$' + (cents / 100).toFixed(2);
    };

    // Copy to clipboard
    window.copyToClipboard = function (text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
                if (window.CmdRunnerApp) {
                    CmdRunnerApp.showToast('Copied to clipboard!', 'success');
                }
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            if (window.CmdRunnerApp) {
                CmdRunnerApp.showToast('Copied to clipboard!', 'success');
            }
        }
    };
})();