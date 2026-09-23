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
    if (!toastEl) { toastEl = h('div', { class: 'toast' }); document.body.append(toastEl); }
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
  g.UI = { $, $$, h, toast, copy, theme, logo, send, download, switchEl, ago };
})(self);
