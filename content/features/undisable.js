/* 80 Un-disable: re-enables right-click, text selection, copy and greyed-out buttons. Automatic for copy/select; buttons on demand. */
(() => { const P = window.__prism;
  const freeSelect = () => { P.css('undisable', '*, *::before, *::after { user-select: text !important; -webkit-user-select: text !important; }'); for (const t of ['contextmenu', 'selectstart', 'dragstart', 'copy']) document.addEventListener(t, (e) => e.stopImmediatePropagation(), true); document.oncontextmenu = null; document.onselectstart = null; };
  P.def('undisable', { run() { freeSelect(); }, actions: { run() {
    freeSelect(); let n = 0;
    document.querySelectorAll('[disabled], [aria-disabled=true], .disabled').forEach(el => { if (el.type === 'hidden') return; el.removeAttribute('disabled'); el.removeAttribute('aria-disabled'); el.classList.remove('disabled'); el.style.pointerEvents = 'auto'; el.style.opacity = ''; n++; });
    document.querySelectorAll('[readonly]').forEach(el => { el.removeAttribute('readonly'); n++; });
    P.ui.toast('Re-enabled ' + n + ' elements, right-click and copy'); return n + ' re-enabled';
  } } });
})();
