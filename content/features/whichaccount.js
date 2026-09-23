/* 139 Which-account badge on Google sites: small coloured pill with the signed-in account's email. */
(() => { const P = window.__prism;
  const COLORS = ['#4F5BD5', '#2F7D5B', '#B4531F', '#8E44AD', '#1F7A8C'];
  P.def('whichaccount', { sites: (P) => /(^|\.)google\.com$/.test(location.hostname) && !/^(www\.)?google\.com$/.test(location.hostname) || /youtube\.com$/.test(location.hostname), run() {
    setTimeout(() => {
      const a = document.querySelector('a[aria-label*="Google Account"], [aria-label^="Google Account:"], a[href*="SignOutOptions"]'); if (!a) return;
      const m = (a.getAttribute('aria-label') || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/); if (!m) return;
      const email = m[0]; const idx = [...email].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORS.length;
      const c = P.ui.el('div', 'b'); c.textContent = email; c.style.cssText += ';left:50%;transform:translateX(-50%);top:6px;padding:3px 12px;background:' + COLORS[idx] + ';font-size:11px;opacity:.9;pointer-events:none';
      P.ui.root().append(c);
    }, 2500);
  } });
})();
