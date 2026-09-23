/* PRISM page core. Loaded before every feature file. Features call P.def(id, spec):
   spec.run(P)        - runs on page load when the feature is on (and spec.sites match, if given)
   spec.early         - run at document_start instead of after DOM is ready
   spec.sites         - array of hostnames, or (P) => bool, limiting where run() happens
   spec.actions       - { name: fn(arg) } callable from the popup / palette via P.act(id, name, arg) */
(() => {
  if (window.__prism) return;
  const P = window.__prism = { feats: {}, s: null, ran: {}, version: '0.1.0' };
  const U = globalThis.PrismU;
  P.U = U;
  P.host = location.hostname.replace(/^www\./, '');
  P.def = (id, spec) => { if (!P.feats[id]) P.feats[id] = spec; };
  P.load = async () => (P.s = P.s || await PrismStore.load());
  P.on = (id) => !!(P.s && P.s.on[id]);
  P.cfg = (id) => (P.s && P.s.cfg[id]) || {};
  P.send = (msg) => new Promise((res) => { try { chrome.runtime.sendMessage(msg, (r) => { void chrome.runtime.lastError; res(r); }); } catch (e) { res(null); } });
  P.act = async (id, act, arg) => {
    await P.load();
    const f = P.feats[id];
    if (!f || !f.actions || !f.actions[act]) return { error: 'No action ' + id + '.' + act };
    try { return await f.actions[act](arg); } catch (e) { P.ui.toast('PRISM: ' + (e.message || e)); return { error: String(e.message || e) }; }
  };
  P.siteOk = (spec) => !spec.sites || (typeof spec.sites === 'function' ? spec.sites(P) : U.anySite(P.host, spec.sites));
  P.start = (phase) => {
    for (const id in P.feats) {
      const f = P.feats[id];
      if (P.ran[id] || !f.run || !P.on(id) || !!f.early !== (phase === 'early') || !P.siteOk(f)) continue;
      P.ran[id] = true;
      try { f.run(P); } catch (e) { console.warn('[PRISM]', id, e); }
    }
  };
  /* ---------- DOM helpers ---------- */
  P.editable = (el) => !!el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));
  P.typing = (e) => P.editable(e.target) || P.editable(document.activeElement);
  P.css = (id, text) => { let s = document.getElementById('prism-css-' + id); if (!s) { s = document.createElement('style'); s.id = 'prism-css-' + id; (document.head || document.documentElement).append(s); } s.textContent = text; return s; };
  P.uncss = (id) => { const s = document.getElementById('prism-css-' + id); if (s) s.remove(); };
  P.ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();
  const obsFns = []; let obs, obsT;
  P.observe = (fn, delay = 400) => {
    obsFns.push(fn); fn();
    if (!obs) { obs = new MutationObserver(() => { clearTimeout(obsT); obsT = setTimeout(() => obsFns.forEach(f => { try { f(); } catch (e) {} }), delay); }); obs.observe(document.documentElement, { childList: true, subtree: true }); }
  };
  const keyFns = [];
  P.key = (fn) => keyFns.push(fn);
  window.addEventListener('keydown', (e) => { for (const fn of keyFns) { try { if (fn(e) === true) { e.preventDefault(); e.stopPropagation(); return; } } catch (err) {} } }, true);
  P.copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); } catch (e) { const a = document.createElement('textarea'); a.value = text; a.style.position = 'fixed'; a.style.opacity = '0'; document.documentElement.append(a); a.select(); document.execCommand('copy'); a.remove(); }
    if (msg !== false) P.ui.toast(msg || 'Copied');
    return true;
  };
  P.text = (root) => (root || document.body).innerText || '';
  P.mainEl = () => document.querySelector('article') || document.querySelector('main') || document.querySelector('[role=main]') || document.body;
  P.meta = (name) => { const m = document.querySelector(`meta[property="${name}"],meta[name="${name}"],meta[itemprop="${name}"]`); return m ? m.content : ''; };
  P.jsonld = () => { const out = []; document.querySelectorAll('script[type="application/ld+json"]').forEach(s => { try { const j = JSON.parse(s.textContent); const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { out.push(x); if (x['@graph']) walk(x['@graph']); } }; walk(j); } catch (e) {} }); return out; };
  P.download = (text, name, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' })); a.download = name; document.documentElement.append(a); a.click(); setTimeout(() => a.remove(), 1000); };

  /* ---------- UI kit (shadow DOM, so pages cannot restyle it) ---------- */
  const STYLE = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
  .t { position: fixed; left: 50%; bottom: 28px; transform: translate(-50%, 16px); opacity: 0; background: #15171A; color: #F5F5F2; font-size: 13px; padding: 10px 18px; border-radius: 999px; transition: all .4s cubic-bezier(.2,.9,.25,1.15); pointer-events: none; z-index: 2147483647; box-shadow: 0 8px 30px rgba(0,0,0,.25); max-width: 80vw; }
  .t.on { opacity: 1; transform: translate(-50%, 0); }
  .p { position: fixed; right: 20px; top: 20px; width: min(460px, calc(100vw - 40px)); max-height: calc(100vh - 40px); overflow: auto; background: #FFFFFF; color: #15171A; border-radius: 16px; box-shadow: 0 20px 60px rgba(20,20,30,.22), 0 0 0 1px rgba(0,0,0,.05); padding: 18px 18px 16px; font-size: 13.5px; line-height: 1.5; z-index: 2147483646; animation: in .45s cubic-bezier(.2,.9,.25,1.12) both; }
  @keyframes in { from { opacity: 0; transform: translateY(-8px) scale(.98); } to { opacity: 1; transform: none; } }
  @media (prefers-color-scheme: dark) { .p { background: #17181B; color: #ECEDEE; box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.06); } .p .m { color: #A2A6AD; } .p pre, .p textarea, .p input { background: #1E2024 !important; color: #ECEDEE !important; } .p button { background: #2A2C31; color: #ECEDEE; } }
  .p h3 { margin: 0 34px 10px 0; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
  .p .x { position: absolute; top: 12px; right: 12px; width: 28px; height: 28px; border-radius: 50%; border: 0; background: transparent; cursor: pointer; font-size: 18px; color: inherit; opacity: .6; }
  .p .x:hover { opacity: 1; background: rgba(127,127,127,.15); }
  .p .m { color: #5C6066; font-size: 12px; }
  .p pre { white-space: pre-wrap; word-break: break-word; background: #F1F1EE; padding: 10px 12px; border-radius: 10px; font: 12px/1.5 ui-monospace, Menlo, Consolas, monospace; max-height: 50vh; overflow: auto; margin: 8px 0; }
  .p textarea, .p input { width: 100%; border: 0; background: #F1F1EE; border-radius: 10px; padding: 9px 11px; font-size: 13px; color: inherit; outline: none; }
  .p input[type=checkbox], .p input[type=radio] { width: auto; padding: 0; margin: 0 6px 0 0; vertical-align: -2px; background: none !important; } .p ul, .p ol { padding-left: 20px; } .p li { margin: 3px 0; }
  .p textarea { min-height: 120px; resize: vertical; }
  .p button { border: 0; border-radius: 999px; padding: 7px 14px; background: #ECECE7; cursor: pointer; font-size: 12.5px; margin: 6px 6px 0 0; color: #15171A; transition: transform .25s cubic-bezier(.2,.9,.25,1.15); }
  .p button:active { transform: scale(.95); }
  .p button.pr { background: #4F5BD5; color: #fff; }
  .p a { color: #4F5BD5; }
  .p table { border-collapse: collapse; width: 100%; font-size: 12px; } .p td, .p th { padding: 5px 6px; border-bottom: 1px solid rgba(127,127,127,.2); text-align: left; vertical-align: top; }
  .b { position: fixed; z-index: 2147483646; background: #15171A; color: #F5F5F2; border-radius: 999px; padding: 5px 7px; display: flex; gap: 2px; box-shadow: 0 8px 24px rgba(0,0,0,.25); animation: in .3s cubic-bezier(.2,.9,.25,1.12) both; font-size: 12px; }
  .b button { background: transparent; color: inherit; border: 0; padding: 4px 9px; border-radius: 999px; cursor: pointer; font-size: 12px; } .b button:hover { background: rgba(255,255,255,.14); }
  .tip { position: fixed; z-index: 2147483646; max-width: 340px; background: #15171A; color: #F5F5F2; padding: 10px 12px; border-radius: 12px; font-size: 12.5px; line-height: 1.45; box-shadow: 0 10px 30px rgba(0,0,0,.25); animation: in .25s ease both; }
  .tip b { font-weight: 600; } .tip .m { color: #A2A6AD; }
  .hl { position: fixed; pointer-events: none; z-index: 2147483645; border: 2px solid #4F5BD5; background: rgba(79,91,213,.12); border-radius: 4px; transition: all .08s ease; }
  .hl span { position: absolute; left: -2px; top: -22px; background: #4F5BD5; color: #fff; font: 11px ui-monospace, monospace; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
  `;
  let root;
  const shadow = () => {
    if (root && root.host.isConnected) return root;
    const host = document.createElement('prism-ui');
    host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0;';
    document.documentElement.append(host);
    root = host.attachShadow({ mode: 'open' });
    const st = document.createElement('style'); st.textContent = STYLE; root.append(st);
    return root;
  };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  P.ui = {
    el, root: shadow,
    toast(msg, ms = 2000) { const r = shadow(); let t = r.querySelector('.t'); if (!t) { t = el('div', 't'); r.append(t); } t.textContent = msg; requestAnimationFrame(() => t.classList.add('on')); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), ms); },
    panel(title, html, opts = {}) {
      const r = shadow(); if (opts.id) { const old = r.querySelector('[data-id="' + opts.id + '"]'); if (old) old.remove(); }
      const p = el('div', 'p'); if (opts.id) p.dataset.id = opts.id;
      p.innerHTML = '<button class="x" title="Close">×</button><h3></h3><div class="c"></div>';
      p.querySelector('h3').textContent = title; p.querySelector('.c').innerHTML = html;
      if (opts.left) { p.style.right = 'auto'; p.style.left = '20px'; }
      if (opts.bottom) { p.style.top = 'auto'; p.style.bottom = '20px'; }
      p.querySelector('.x').onclick = () => { p.remove(); opts.onClose && opts.onClose(); };
      const esc = (e) => { if (e.key === 'Escape') { p.remove(); window.removeEventListener('keydown', esc, true); opts.onClose && opts.onClose(); } };
      window.addEventListener('keydown', esc, true);
      r.append(p); return p;
    },
    tip(x, y, html, ms) { const r = shadow(); r.querySelectorAll('.tip').forEach(t => t.remove()); const t = el('div', 'tip', html); t.style.left = Math.min(x, innerWidth - 360) + 'px'; t.style.top = Math.min(y, innerHeight - 120) + 'px'; r.append(t); if (ms) setTimeout(() => t.remove(), ms); return t; },
    clearTips() { const r = shadow(); r.querySelectorAll('.tip').forEach(t => t.remove()); },
    /* element picker: resolves with the clicked element, or null on Escape */
    pick(label) {
      return new Promise((resolve) => {
        const r = shadow(); const box = el('div', 'hl', '<span></span>'); r.append(box);
        P.ui.toast(label || 'Click an element. Esc to cancel.', 2500);
        let cur = null;
        const move = (e) => { const t = document.elementFromPoint(e.clientX, e.clientY); if (!t || t.tagName === 'PRISM-UI') return; cur = t; const b = t.getBoundingClientRect(); Object.assign(box.style, { left: b.left + 'px', top: b.top + 'px', width: b.width + 'px', height: b.height + 'px' }); box.firstChild.textContent = t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + ' ' + Math.round(b.width) + '×' + Math.round(b.height); };
        const done = (v) => { removeEventListener('mousemove', move, true); removeEventListener('click', click, true); removeEventListener('keydown', key, true); box.remove(); resolve(v); };
        const click = (e) => { e.preventDefault(); e.stopPropagation(); done(cur); };
        const key = (e) => { if (e.key === 'Escape') { e.preventDefault(); done(null); } };
        addEventListener('mousemove', move, true); addEventListener('click', click, true); addEventListener('keydown', key, true);
      });
    },
  };
  P.esc = U.esc;
})();
