/* 115 Dyslexia-friendly mode: bundled OpenDyslexic font, more spacing, a reading ruler that follows the mouse. */
(() => { const P = window.__prism;
  const on = () => {
    const f = chrome.runtime.getURL('assets/fonts/opendyslexic-latin-400-normal.woff2');
    P.css('dys', `@font-face { font-family: 'PrismDys'; src: url('${f}') format('woff2'); } body, body * :not(code):not(pre):not(i[class*="icon"]):not([class*="material"]) { font-family: 'PrismDys', sans-serif !important; letter-spacing: .03em !important; word-spacing: .12em !important; line-height: 1.8 !important; } p, li { max-width: 72ch; }`);
    let bar = document.getElementById('prism-ruler');
    if (!bar) { bar = document.createElement('div'); bar.id = 'prism-ruler'; bar.style.cssText = 'position:fixed;left:0;right:0;height:2.2em;pointer-events:none;background:rgba(242,213,107,.18);border-top:1px solid rgba(242,213,107,.6);border-bottom:1px solid rgba(242,213,107,.6);z-index:2147483000;transition:top .06s'; document.documentElement.append(bar); addEventListener('mousemove', (e) => bar.style.top = (e.clientY - 18) + 'px', { passive: true }); }
  };
  const off = () => { P.uncss('dys'); const b = document.getElementById('prism-ruler'); if (b) b.remove(); };
  P.def('dyslexia', { sites: (P) => P.U.anySite(P.host, P.cfg('dyslexia').sites), run: on, actions: { toggle() { if (document.getElementById('prism-css-dys')) { off(); return 'off'; } on(); return 'on'; } } });
})();
