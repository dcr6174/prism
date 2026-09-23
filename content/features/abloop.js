/* 110 A-B loop: [ sets A, ] sets B, \ clears. */
(() => { const P = window.__prism;
  P.def('abloop', { run() {
    let a = null, b = null, v = null;
    const tick = () => { if (v && a != null && b != null && v.currentTime >= b) v.currentTime = a; };
    P.key((e) => {
      if (P.typing(e) || e.ctrlKey || e.metaKey || e.altKey || !['[', ']', '\\'].includes(e.key)) return;
      v = P.vid && P.vid(); if (!v) return;
      if (e.key === '[') { a = v.currentTime; P.ui.toast('Loop A = ' + a.toFixed(1) + 's'); }
      if (e.key === ']') { b = v.currentTime; if (a == null || b <= a) { P.ui.toast('Set A first ( [ )'); b = null; } else { P.ui.toast('Looping ' + a.toFixed(1) + 's - ' + b.toFixed(1) + 's'); v.currentTime = a; } }
      if (e.key === '\\') { a = b = null; P.ui.toast('Loop cleared'); }
      v.removeEventListener('timeupdate', tick); v.addEventListener('timeupdate', tick); return true;
    });
  } });
})();
