/* 159 New-site badge: tells you when you have never visited a domain before (useful before typing a password or paying). */
(() => { const P = window.__prism;
  P.def('newsite', { run() {
    if (top !== window) return;
    setTimeout(async () => {
      const r = await P.send({ type: 'newsite:check', url: location.href }); if (!r || !r.isNew) return;
      const hasPw = document.querySelector('input[type=password], input[autocomplete*="cc-number"]');
      P.ui.toast('🆕 First visit to ' + P.host + (hasPw ? ' - check the address before entering a password or card' : ''), hasPw ? 7000 : 3500);
    }, 1200);
  } });
})();
