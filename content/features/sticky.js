/* 87 Hide sticky headers/footers while reading (Alt+S or palette toggles). */
(() => { const P = window.__prism;
  let hidden = [];
  const toggle = () => {
    if (hidden.length) { hidden.forEach(([el, v]) => el.style.setProperty('display', v)); hidden = []; P.ui.toast('Sticky bars back'); return 'shown'; }
    for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); if ((cs.position === 'fixed' || cs.position === 'sticky') && el.tagName !== 'PRISM-UI' && el.offsetHeight < innerHeight * 0.5) { hidden.push([el, el.style.display]); el.style.setProperty('display', 'none', 'important'); } }
    P.ui.toast('Hid ' + hidden.length + ' sticky bars'); return 'hidden';
  };
  P.def('sticky', { run() { P.key((e) => { if (e.altKey && e.key.toLowerCase() === 's' && !e.ctrlKey) { toggle(); return true; } }); }, actions: { toggle } });
})();
