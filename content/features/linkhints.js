/* 90 Link hints: press F (outside text boxes), type the letters shown to click. Shift+F opens in a new tab. Esc cancels. */
(() => { const P = window.__prism;
  const CH = 'asdfghjklqwertyuiopzxcvbnm';
  const labels = (n) => { const out = []; if (n <= CH.length) return CH.slice(0, n).split(''); for (let i = 0; i < n; i++) out.push(CH[Math.floor(i / CH.length) % CH.length] + CH[i % CH.length]); return out; };
  P.def('linkhints', { run() {
    let active = null;
    const stop = () => { if (active) { active.layer.remove(); active = null; } };
    P.key((e) => {
      if (active) {
        if (e.key === 'Escape') { stop(); return true; }
        if (e.key.length !== 1) return true;
        active.typed += e.key.toLowerCase();
        const hits = active.items.filter(i => i.l.startsWith(active.typed));
        active.items.forEach(i => i.el.style.opacity = i.l.startsWith(active.typed) ? '1' : '.15');
        if (hits.length === 1 && hits[0].l === active.typed) { const t = hits[0].t, nt = active.newTab; stop(); if (nt && t.href) window.open(t.href, '_blank'); else if (P.editable(t)) t.focus(); else t.click(); }
        else if (!hits.length) stop();
        return true;
      }
      if (e.key.toLowerCase() !== 'f' || e.ctrlKey || e.metaKey || e.altKey || P.typing(e)) return;
      const els = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=link], [role=tab], [onclick], summary, [tabindex]:not([tabindex="-1"])')].filter(el => { const b = el.getBoundingClientRect(); return b.width > 2 && b.height > 2 && b.bottom > 0 && b.top < innerHeight && b.right > 0 && b.left < innerWidth && getComputedStyle(el).visibility !== 'hidden'; }).slice(0, 600);
      if (!els.length) return;
      const ls = labels(els.length);
      const layer = P.ui.el('div'); layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483646';
      const items = els.map((t, i) => { const b = t.getBoundingClientRect(); const el = P.ui.el('span'); el.textContent = ls[i].toUpperCase(); el.style.cssText = 'position:fixed;left:' + Math.max(0, b.left) + 'px;top:' + Math.max(0, b.top) + 'px;background:#F2D56B;color:#15171A;font:600 11px ui-monospace,Menlo,monospace;padding:1px 4px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:opacity .1s'; layer.append(el); return { t, el, l: ls[i] }; });
      P.ui.root().append(layer);
      active = { layer, items, typed: '', newTab: e.shiftKey };
      return true;
    });
  } });
})();
