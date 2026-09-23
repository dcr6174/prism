/* 53 Locator picker: click an element -> Playwright locator (getByRole / getByText / getByTestId), CSS and XPath. */
(() => { const P = window.__prism;
  const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
  const role = (el) => {
    const r = el.getAttribute('role'); if (r) return r;
    const t = el.tagName.toLowerCase(), type = (el.getAttribute('type') || '').toLowerCase();
    if (t === 'button' || (t === 'input' && ['button', 'submit', 'reset'].includes(type))) return 'button';
    if (t === 'a' && el.hasAttribute('href')) return 'link';
    if (t === 'input' && type === 'checkbox') return 'checkbox'; if (t === 'input' && type === 'radio') return 'radio';
    if (t === 'textarea' || (t === 'input' && ['', 'text', 'email', 'search', 'tel', 'url', 'password', 'number'].includes(type))) return 'textbox';
    if (t === 'select') return 'combobox'; if (/^h[1-6]$/.test(t)) return 'heading'; if (t === 'img') return 'img'; return null;
  };
  const name = (el) => { const l = el.getAttribute('aria-label'); if (l) return l.trim(); const lb = el.getAttribute('aria-labelledby'); if (lb) { const x = document.getElementById(lb); if (x) return x.innerText.trim(); } if (el.id) { const f = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (f) return f.innerText.trim(); } const wrap = el.closest('label'); if (wrap) return wrap.innerText.trim(); if (el.tagName === 'IMG') return el.alt; if (el.placeholder && role(el) === 'textbox') return ''; return (el.innerText || el.value || '').trim().replace(/\s+/g, ' '); };
  const unique = (sel) => { try { return document.querySelectorAll(sel).length === 1; } catch { return false; } };
  const css = (el) => {
    for (const a of ['data-testid', 'data-test', 'data-qa', 'data-cy']) if (el.getAttribute(a)) { const s = '[' + a + '=' + JSON.stringify(el.getAttribute(a)) + ']'; if (unique(s)) return s; }
    if (el.id && !/\d{3,}|^[a-f0-9-]{16,}$/.test(el.id)) { const s = '#' + CSS.escape(el.id); if (unique(s)) return s; }
    const parts = []; let n = el;
    while (n && n.nodeType === 1 && n !== document.documentElement) {
      let p = n.tagName.toLowerCase();
      const cls = [...n.classList].filter(c => !/\d{3,}|^(css|sc|jsx)-|__|--|:/.test(c)).slice(0, 2);
      if (cls.length) p += '.' + cls.map(c => CSS.escape(c)).join('.');
      const sib = n.parentElement ? [...n.parentElement.children].filter(c => c.tagName === n.tagName) : [];
      if (sib.length > 1) p += ':nth-of-type(' + (sib.indexOf(n) + 1) + ')';
      parts.unshift(p); const s = parts.join(' > '); if (unique(s)) return s; n = n.parentElement;
    }
    return parts.join(' > ');
  };
  const xpath = (el) => { if (el.id) return '//*[@id=' + JSON.stringify(el.id) + ']'; const seg = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const same = n.parentElement ? [...n.parentElement.children].filter(c => c.tagName === n.tagName) : [n]; seg.unshift(n.tagName.toLowerCase() + (same.length > 1 ? '[' + (same.indexOf(n) + 1) + ']' : '')); } return '/' + seg.join('/'); };
  P.def('locator', { actions: { async pick() {
    const el = await P.ui.pick('Click the element you want a locator for. Esc cancels.'); if (!el) return;
    const out = []; const tid = el.getAttribute('data-testid');
    if (tid) out.push('page.getByTestId(' + q(tid) + ')');
    const r = role(el), n = name(el);
    if (r && n && n.length < 80) out.push('page.getByRole(' + q(r) + ', { name: ' + q(n) + ' })');
    if (el.id) { const lab = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (lab) out.push('page.getByLabel(' + q(lab.innerText.trim()) + ')'); }
    if (el.placeholder) out.push('page.getByPlaceholder(' + q(el.placeholder) + ')');
    if (!r && n && n.length < 60 && el.children.length === 0) out.push('page.getByText(' + q(n) + ')');
    if (el.alt) out.push('page.getByAltText(' + q(el.alt) + ')');
    out.push("page.locator(" + q(css(el)) + ")");
    const x = xpath(el);
    const html = '<p class="m">Best first. Click one to copy.</p>' + out.map((l, i) => '<pre data-i="' + i + '" style="cursor:pointer"></pre>').join('') + '<p class="m">CSS</p><pre data-k="css" style="cursor:pointer"></pre><p class="m">XPath</p><pre data-k="x" style="cursor:pointer"></pre><button class="pr" data-k="again">Pick another</button>';
    const p = P.ui.panel('Locator', html, { id: 'loc' });
    out.forEach((l, i) => p.querySelector('[data-i="' + i + '"]').textContent = l);
    p.querySelector('[data-k=css]').textContent = css(el); p.querySelector('[data-k=x]').textContent = x;
    p.onclick = (e) => { const t = e.target; if (t.dataset.k === 'again') { p.remove(); this.pick(); } else if (t.tagName === 'PRE') P.copy(t.textContent, 'Locator copied'); };
  } } });
})();
