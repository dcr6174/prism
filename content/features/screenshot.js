/* 37 Full-page screenshot: page-side helpers (scroll steps, hide fixed bars after the first frame, optional masking). */
(() => { const P = window.__prism;
  let saved = null, hidden = [];
  P.def('screenshot', { actions: {
    async begin(o) {
      saved = { x: scrollX, y: scrollY, beh: document.documentElement.style.scrollBehavior };
      document.documentElement.style.scrollBehavior = 'auto';
      const ui = document.querySelector('prism-ui'); if (ui) ui.style.display = 'none';
      if (o && o.mask && P.feats.mask) P.feats.mask.actions.on();
      return { h: Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0), vh: innerHeight, vw: innerWidth };
    },
    scroll(y) { scrollTo(0, y); return scrollY; },
    hideFixed() { for (const el of document.querySelectorAll('body *')) { const p = getComputedStyle(el).position; if (p === 'fixed' || p === 'sticky') { hidden.push([el, el.style.visibility]); el.style.visibility = 'hidden'; } } },
    end() { hidden.forEach(([el, v]) => el.style.visibility = v); hidden = []; if (saved) { scrollTo(saved.x, saved.y); document.documentElement.style.scrollBehavior = saved.beh; } const ui = document.querySelector('prism-ui'); if (ui) ui.style.display = ''; return true; },
  } });
})();
