/* 33 Save to reading list with an offline text + HTML snapshot (stored locally). */
(() => { const P = window.__prism;
  P.def('readlist', { actions: {
    async save() {
      const main = P.mainEl().cloneNode(true);
      main.querySelectorAll('script,style,noscript,iframe,form,nav,footer,aside').forEach(e => e.remove());
      main.querySelectorAll('img').forEach(i => { if (i.src) i.setAttribute('src', i.src); });
      const item = { id: P.U.uid(), url: location.href, title: document.title, t: Date.now(), html: main.innerHTML.slice(0, 800000), text: (main.innerText || '').slice(0, 200000), read: false };
      await PrismStore.update('readlist', [], (l) => { l = l.filter(x => x.url !== item.url); l.unshift(item); return l; });
      P.ui.toast('Saved to reading list (works offline)');
      return 'Saved';
    },
  } });
})();
