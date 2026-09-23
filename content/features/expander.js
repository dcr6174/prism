/* 47 Text expander: type a trigger like ;yr then space/enter/tab. Saved replies with a ;key also expand. */
(() => { const P = window.__prism;
  P.def('expander', { async run() {
    let map = {};
    const load = async () => { map = {}; for (const [k, v] of P.U.pairs(P.cfg('expander').snippets)) map[k] = v.replace(/\\n/g, '\n'); for (const r of await PrismStore.get('replies', [])) if (r.key) map[r.key] = r.text; };
    await load(); PrismStore.onChange((ch) => { if (ch.replies || ch.settings) PrismStore.load().then(s => { P.s = s; load(); }); });
    document.addEventListener('keydown', (e) => {
      if (![' ', 'Enter', 'Tab'].includes(e.key)) return;
      const el = e.target; if (!P.editable(el) || el.type === 'password') return;
      let before;
      if (el.isContentEditable) { const s = getSelection(); if (!s.rangeCount) return; const r = s.getRangeAt(0); if (r.startContainer.nodeType !== 3) return; before = r.startContainer.textContent.slice(0, r.startOffset); }
      else before = el.value.slice(0, el.selectionStart);
      const m = before.match(/(;[\w-]+)$/); if (!m || !map[m[1]]) return;
      e.preventDefault();
      if (el.isContentEditable) { const s = getSelection(); for (let i = 0; i < m[1].length; i++) s.modify('extend', 'backward', 'character'); document.execCommand('insertText', false, map[m[1]]); }
      else { el.setSelectionRange(el.selectionStart - m[1].length, el.selectionStart); if (!document.execCommand('insertText', false, map[m[1]])) { el.setRangeText(map[m[1]], el.selectionStart, el.selectionEnd, 'end'); el.dispatchEvent(new Event('input', { bubbles: true })); } }
    }, true);
  } });
})();
