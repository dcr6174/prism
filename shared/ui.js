/* Shared helpers for PRISM extension pages (new tab, popup, options, tools). */
(function (g) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
    return el;
  };
  let toastEl;
  const toast = (msg) => {
    if (!toastEl) { toastEl = h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };
  const copy = async (text, msg) => { await navigator.clipboard.writeText(text); toast(msg || 'Copied'); };
  const theme = async () => { const s = await PrismStore.load(); document.documentElement.dataset.theme = s.theme || 'auto'; return s; };
  const logo = () => { const i = h('img', { src: chrome.runtime.getURL('assets/icons/logo.svg'), class: 'logo', alt: '' }); return i; };
  const send = (msg) => chrome.runtime.sendMessage(msg);
  const download = (blob, name) => { const a = h('a', { href: URL.createObjectURL(blob), download: name }); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); };
  const switchEl = (checked, onchange) => h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked, onchange: e => onchange(e.target.checked) }), h('span'));
  const ago = (t) => { const s = (Date.now() - t) / 1000; if (s < 60) return 'now'; if (s < 3600) return Math.floor(s / 60) + 'm ago'; if (s < 86400) return Math.floor(s / 3600) + 'h ago'; return Math.floor(s / 86400) + 'd ago'; };
  /* Rolling digits (used by the Tatkal, task timer and Pomodoro clocks). pattern like '00:00:00'; set('012345'). */
  const roll = (pattern, cls) => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; const slots = [];
    const el = h('div', { class: 'roll ' + (cls || ''), role: 'timer' });
    for (const c of pattern) { if (c === ':') { el.append(h('span', { class: 'roll-colon' }, ':')); continue; } const s = h('span', { class: 'roll-slot' }, h('span', { class: 'roll-d' }, '0')); s.v = '0'; slots.push(s); el.append(s); }
    const set = (digits, animate = true) => [...digits].forEach((v, i) => { const s = slots[i]; if (!s || s.v === v) return; s.v = v; const old = s.lastChild; const n = h('span', { class: 'roll-d' + (animate && !reduce ? ' in' : '') }, v); if (animate && !reduce) { old.classList.add('out'); setTimeout(() => old.remove(), 520); } else old.remove(); s.append(n); });
    return { el, set };
  };
  const hms = (ms, withHours = true) => { const t = Math.max(0, Math.floor(ms / 1000)); const hh = Math.floor(t / 3600), mm = Math.floor(t % 3600 / 60), ss = t % 60; const p = (x) => String(x).padStart(2, '0'); return withHours ? p(Math.min(99, hh)) + p(mm) + p(ss) : p(Math.min(99, hh * 60 + mm)) + p(ss); };
  const everySecond = (fn) => { let on = true; const loop = () => { if (!on) return; fn(); setTimeout(loop, 1000 - Date.now() % 1000 + 5); }; loop(); return () => { on = false; }; };
  g.UI = { $, $$, h, toast, copy, theme, logo, send, download, switchEl, ago, roll, hms, everySecond };
})(self);

