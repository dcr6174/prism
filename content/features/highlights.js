/* 34 Highlights + notes, restored on revisit. Select text -> bubble (Highlight / Note), or press H. */
(() => { const P = window.__prism;
  const key = () => location.origin + location.pathname;
  const mark = (range, id, note) => {
    try {
      const walker = document.createTreeWalker(range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentNode, NodeFilter.SHOW_TEXT);
      const nodes = []; while (walker.nextNode()) { const n = walker.currentNode; if (range.intersectsNode(n) && n.textContent.trim()) nodes.push(n); }
      if (range.startContainer.nodeType === 3 && !nodes.includes(range.startContainer)) nodes.unshift(range.startContainer);
      for (const n of nodes) {
        const r = document.createRange(); r.selectNodeContents(n);
        if (n === range.startContainer) r.setStart(n, range.startOffset);
        if (n === range.endContainer) r.setEnd(n, range.endOffset);
        if (r.collapsed) continue;
        const m = document.createElement('mark'); m.dataset.prismHl = id; if (note) m.title = note;
        m.style.cssText = 'background:#FFE58A;color:inherit;border-radius:2px;padding:0 1px;' + (note ? 'border-bottom:2px solid #4F5BD5;' : '');
        r.surroundContents(m);
      }
    } catch (e) {}
  };
  const findText = (text) => { // restore by text search (robust to layout changes)
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let buf = '', nodes = [];
    while (tw.nextNode()) { nodes.push([tw.currentNode, buf.length]); buf += tw.currentNode.textContent; }
    const i = buf.indexOf(text); if (i < 0) return null;
    const at = (pos) => { for (let k = nodes.length - 1; k >= 0; k--) if (nodes[k][1] <= pos) return [nodes[k][0], pos - nodes[k][1]]; };
    const r = document.createRange(); const [sn, so] = at(i); const [en, eo] = at(i + text.length); r.setStart(sn, so); r.setEnd(en, eo); return r;
  };
  const add = async (note) => {
    const s = getSelection(); const text = String(s).trim(); if (!text || !s.rangeCount) return;
    const id = P.U.uid(); mark(s.getRangeAt(0), id, note); s.removeAllRanges();
    await PrismStore.update('highlights', {}, (all) => { (all[key()] = all[key()] || { title: document.title, items: [] }).items.push({ id, text, note: note || '', t: Date.now() }); });
    P.ui.toast(note ? 'Note saved' : 'Highlighted');
  };
  P.def('highlights', {
    async run() {
      const all = await PrismStore.get('highlights', {}); const page = all[key()];
      if (page) setTimeout(() => page.items.forEach(h => { const r = findText(h.text); if (r) mark(r, h.id, h.note); }), 800);
      let bubble;
      document.addEventListener('mouseup', (e) => {
        setTimeout(() => {
          const s = getSelection(); const t = String(s).trim();
          if (bubble) { bubble.remove(); bubble = null; }
          if (!t || t.length < 3 || P.editable(document.activeElement) || !s.rangeCount) return;
          const b = s.getRangeAt(0).getBoundingClientRect();
          bubble = P.ui.el('div', 'b', '<button data-a="h">Highlight</button><button data-a="n">Note</button>');
          bubble.style.left = Math.max(4, b.left + b.width / 2 - 70) + 'px'; bubble.style.top = Math.max(4, b.top - 40) + 'px';
          bubble.onmousedown = (ev) => { ev.preventDefault(); const a = ev.target.dataset.a; if (a === 'h') add(); if (a === 'n') { const n = prompt('Note'); if (n != null) add(n); } bubble.remove(); bubble = null; };
          P.ui.root().append(bubble);
        }, 10);
      });
      P.key((e) => { if (e.key === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey && !P.typing(e) && String(getSelection()).trim()) { add(); return true; } });
    },
  });
})();
