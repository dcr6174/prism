/* 117 Bionic reading: bolds the first part of each word in the main text. Toggle from the palette. */
(() => { const P = window.__prism;
  P.def('bionic', { actions: { toggle() {
    const done = document.querySelectorAll('b[data-prism-bio]');
    if (done.length) { done.forEach(b => b.replaceWith(b.textContent)); P.mainEl().normalize(); return 'off'; }
    const tw = document.createTreeWalker(P.mainEl(), NodeFilter.SHOW_TEXT, { acceptNode: (n) => /\w{2,}/.test(n.textContent) && !n.parentElement.closest('script,style,code,pre,a,button,input,textarea,prism-ui,b[data-prism-bio]') ? 1 : 2 });
    const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
    for (const n of nodes.slice(0, 8000)) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(w => { if (!/\w{2,}/.test(w)) { frag.append(w); return; } const k = Math.ceil(w.length * 0.45); const b = document.createElement('b'); b.dataset.prismBio = '1'; b.textContent = w.slice(0, k); frag.append(b, w.slice(k)); });
      n.replaceWith(frag);
    }
    return 'on';
  } } });
})();
