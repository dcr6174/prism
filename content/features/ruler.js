/* 59 Pixel ruler: hover shows element size + margins; drag to measure any distance. Esc exits. */
(() => { const P = window.__prism;
  P.def('ruler', { actions: { start() {
    const r = P.ui.root(); const box = P.ui.el('div', 'hl', '<span></span>'); const line = P.ui.el('div', 'hl'); line.style.borderStyle = 'dashed'; r.append(box, line); line.style.display = 'none';
    P.ui.toast('Hover to measure, drag to measure distance. Esc to exit.', 3000);
    let start = null;
    const move = (e) => {
      if (start) { const x = Math.min(start.x, e.clientX), y = Math.min(start.y, e.clientY), w = Math.abs(e.clientX - start.x), h = Math.abs(e.clientY - start.y); Object.assign(line.style, { display: 'block', left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' }); box.firstChild.textContent = w + ' × ' + h + ' px'; Object.assign(box.style, { left: x + 'px', top: y + 'px', width: '0', height: '0' }); return; }
      const t = document.elementFromPoint(e.clientX, e.clientY); if (!t || t.tagName === 'PRISM-UI') return;
      const b = t.getBoundingClientRect(), cs = getComputedStyle(t);
      Object.assign(box.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' });
      box.firstChild.textContent = Math.round(b.width) + '×' + Math.round(b.height) + '  m ' + cs.marginTop + ' ' + cs.marginRight + ' ' + cs.marginBottom + ' ' + cs.marginLeft + '  p ' + cs.padding + '  ' + cs.fontSize + ' ' + cs.fontFamily.split(',')[0];
    };
    const down = (e) => { e.preventDefault(); start = { x: e.clientX, y: e.clientY }; };
    const upF = () => { start = null; };
    const key = (e) => { if (e.key === 'Escape') { removeEventListener('mousemove', move, true); removeEventListener('mousedown', down, true); removeEventListener('mouseup', upF, true); removeEventListener('keydown', key, true); box.remove(); line.remove(); } };
    addEventListener('mousemove', move, true); addEventListener('mousedown', down, true); addEventListener('mouseup', upF, true); addEventListener('keydown', key, true);
  } } });
})();
