/* 123 IRCTC passenger autofill: fill-only from saved passengers (Options). You solve the captcha and press every button yourself. */
(() => { const P = window.__prism;
  P.def('irctc', { sites: ['irctc.co.in'], run() {
    const pax = (P.cfg('irctc').passengers || []).map(l => l.split(',').map(s => s.trim())).filter(p => p[0]);
    if (!pax.length) return;
    P.observe(() => {
      const names = document.querySelectorAll('app-passenger input[placeholder*="Name" i], input[formcontrolname="passengerName"]');
      if (!names.length || document.getElementById('prism-irctc')) return;
      const c = P.ui.el('div', 'b', '<button id="prism-irctc">Fill ' + pax.length + ' passenger(s) - PRISM</button>'); c.style.right = '16px'; c.style.bottom = '16px';
      c.onclick = () => {
        const rows = document.querySelectorAll('app-passenger');
        pax.forEach((p, i) => {
          const row = rows[i]; if (!row) return;
          const set = (sel, v) => { const el = row.querySelector(sel); if (el && v) (P.setVal || ((a, b) => { a.value = b; a.dispatchEvent(new Event('input', { bubbles: true })); }))(el, v); };
          set('input[placeholder*="Name" i], input[formcontrolname="passengerName"]', p[0]);
          set('input[formcontrolname="passengerAge"], input[placeholder*="Age" i]', p[1]);
          const g = row.querySelector('select[formcontrolname="passengerGender"]'); if (g && p[2]) (P.setVal || ((a, b) => { a.value = b; }))(g, p[2].toUpperCase()[0]);
        });
        P.ui.toast('Filled. Check every field, then continue yourself.');
      };
      P.ui.root().append(c);
    }, 1200);
  } });
})();
