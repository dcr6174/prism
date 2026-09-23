/* 94 Regex find-in-page (Alt+F): live count, Enter / Shift+Enter to jump, case toggle. Uses the CSS Highlight API. */
(() => { const P = window.__prism;
  const open = () => {
    const p = P.ui.panel('Find (regex)', '<input placeholder="e.g. \\d{3}-\\d{4} or (bug|error)"><p class="m">Type a pattern · Enter next · Shift+Enter previous · <label><input type="checkbox" style="width:auto"> case</label></p>', { id: 'rf', bottom: true, onClose: () => CSS.highlights && CSS.highlights.delete('prism-find') });
    P.css('rf', '::highlight(prism-find) { background: #F2D56B; color: #15171A; } ::highlight(prism-cur) { background: #F2994A; color: #15171A; }');
    const inp = p.querySelector('input'), info = p.querySelector('.m'), cs = p.querySelector('input[type=checkbox]');
    let ranges = [], cur = -1;
    const run = () => {
      ranges = []; cur = -1; CSS.highlights.delete('prism-find'); CSS.highlights.delete('prism-cur');
      let re; try { re = new RegExp(inp.value, cs.checked ? 'g' : 'gi'); } catch { info.firstChild.textContent = 'Invalid pattern '; return; }
      if (!inp.value) return;
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement && !n.parentElement.closest('script,style,noscript,prism-ui') && n.parentElement.offsetParent !== null ? 1 : 2 });
      while (tw.nextNode() && ranges.length < 5000) { const n = tw.currentNode; for (const m of n.textContent.matchAll(re)) { if (!m[0]) break; const r = new Range(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length); ranges.push(r); } }
      CSS.highlights.set('prism-find', new Highlight(...ranges)); info.firstChild.textContent = ranges.length + ' matches ';
    };
    const jump = (d) => { if (!ranges.length) return; cur = (cur + d + ranges.length) % ranges.length; CSS.highlights.set('prism-cur', new Highlight(ranges[cur])); const b = ranges[cur].getBoundingClientRect(); scrollBy({ top: b.top - innerHeight / 2, behavior: 'smooth' }); info.firstChild.textContent = (cur + 1) + ' / ' + ranges.length + ' '; };
    let t; inp.oninput = () => { clearTimeout(t); t = setTimeout(run, 150); }; cs.onchange = run;
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); jump(e.shiftKey ? -1 : 1); } e.stopPropagation(); };
    setTimeout(() => inp.focus(), 50);
  };
  P.def('regexfind', { run() { P.key((e) => { if (e.altKey && e.key.toLowerCase() === 'f' && !e.ctrlKey) { open(); return true; } }); }, actions: { open } });
})();
