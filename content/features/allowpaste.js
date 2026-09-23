/* 36 Allow paste (and copy) in fields that block it. We stop the page's handlers from seeing the event first. */
(() => { const P = window.__prism;
  P.def('allowpaste', { early: true, run() {
    for (const t of ['paste', 'copy', 'cut']) window.addEventListener(t, (e) => { if (P.editable(e.target) || t !== 'paste') e.stopImmediatePropagation(); }, true);
  } });
})();
