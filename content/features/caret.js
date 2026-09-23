/* 77 Caret browsing (Alt+C): a text caret you move with arrow keys, Shift+arrows select. Alt+= / Alt+- / Alt+0 font size per site. */
(() => { const P = window.__prism;
  P.def('caret', { run() {
    let on = false;
    P.key((e) => {
      if (e.altKey && e.key.toLowerCase() === 'c' && !e.ctrlKey) { on = !on; P.ui.toast('Caret browsing ' + (on ? 'on - arrows move, Shift selects' : 'off')); if (on) { const s = getSelection(); if (!s.rangeCount) { const r = document.createRange(); const el = document.elementFromPoint(innerWidth / 2, innerHeight / 3); r.setStart(el || document.body, 0); r.collapse(true); s.addRange(r); } } return true; }
      if (e.altKey && ['=', '+', '-', '0'].includes(e.key)) {
        PrismStore.update('fontBump', {}, (m) => { const cur = m[P.host] || 100; m[P.host] = e.key === '0' ? 100 : Math.max(60, Math.min(200, cur + (e.key === '-' ? -10 : 10))); if (m[P.host] === 100) delete m[P.host]; const v = m[P.host] || 100; P.css('fontbump', 'html { font-size: ' + v + '% !important; } body { font-size: ' + v / 100 + 'em; }'); P.ui.toast('Font ' + v + '%'); });
        return true;
      }
      if (!on || P.typing(e) || !/^Arrow|^Home$|^End$/.test(e.key)) return;
      const s = getSelection(); const how = e.shiftKey ? 'extend' : 'move';
      const map = { ArrowLeft: ['backward', e.ctrlKey ? 'word' : 'character'], ArrowRight: ['forward', e.ctrlKey ? 'word' : 'character'], ArrowUp: ['backward', 'line'], ArrowDown: ['forward', 'line'], Home: ['backward', 'lineboundary'], End: ['forward', 'lineboundary'] };
      s.modify(how, ...map[e.key]);
      const r = s.rangeCount && s.getRangeAt(0).getBoundingClientRect(); if (r && (r.top < 0 || r.bottom > innerHeight)) scrollBy(0, r.top - innerHeight / 2);
      return true;
    });
    P.css('caret', 'html { caret-color: #4F5BD5; }');
  } });
})();
