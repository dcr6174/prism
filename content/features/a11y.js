/* 65 Quick accessibility checks: missing alt, heading outline, unlabeled fields/buttons, low contrast text. */
(() => { const P = window.__prism;
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(x => { x = x / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const bg = (el) => { for (let n = el; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > 0.5)) return c; } return 'rgb(255,255,255)'; };
  P.def('a11y', { actions: { check() {
    document.querySelectorAll('[data-prism-a11y]').forEach(e => { e.style.outline = ''; delete e.dataset.prismA11y; });
    const flag = (el) => { el.style.outline = '3px solid #E0915F'; el.dataset.prismA11y = '1'; };
    const noAlt = [...document.images].filter(i => !i.hasAttribute('alt') && i.offsetParent); noAlt.forEach(flag);
    const fields = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]), select, textarea')].filter(el => el.offsetParent && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !(el.id && document.querySelector('label[for="' + CSS.escape(el.id) + '"]')) && !el.closest('label') && !el.title); fields.forEach(flag);
    const btns = [...document.querySelectorAll('button, a[href], [role=button]')].filter(el => el.offsetParent && !(el.innerText || '').trim() && !el.getAttribute('aria-label') && !el.title && !el.querySelector('img[alt]:not([alt=""])')); btns.forEach(flag);
    let low = 0; const lowEls = [];
    for (const el of document.querySelectorAll('p, span, a, li, td, label, button, h1, h2, h3, h4')) {
      if (!el.offsetParent || !el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const cs = getComputedStyle(el); const L1 = lum(cs.color), L2 = lum(bg(el)); if (L1 == null || L2 == null) continue;
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
      if (ratio < (large ? 3 : 4.5)) { low++; if (lowEls.length < 200) { lowEls.push(el); flag(el); } }
      if (low > 400) break;
    }
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h => h.offsetParent);
    let skips = 0; hs.forEach((h, i) => { if (i && +h.tagName[1] > +hs[i - 1].tagName[1] + 1) skips++; });
    const outline = hs.slice(0, 40).map(h => '&nbsp;'.repeat((+h.tagName[1] - 1) * 3) + h.tagName.toLowerCase() + ' ' + P.esc(h.innerText.trim().slice(0, 60))).join('<br>');
    const row = (label, n, ok) => '<tr><td>' + label + '</td><td><b style="color:' + (n ? '#E0915F' : '#2F7D5B') + '">' + (n || ok || '0') + '</b></td></tr>';
    P.ui.panel('Accessibility check', '<table>' + row('Images without alt', noAlt.length) + row('Fields without a label', fields.length) + row('Buttons/links without a name', btns.length) + row('Low-contrast text', low) + row('H1 count', hs.filter(h => h.tagName === 'H1').length === 1 ? 0 : hs.filter(h => h.tagName === 'H1').length + ' (want 1)', '1 ✓') + row('Skipped heading levels', skips) + '</table><p class="m">Problems are outlined in orange on the page. Quick checks only, not a full WCAG audit.</p><p class="m">Heading outline</p><pre>' + (outline || 'No headings') + '</pre>', { id: 'a11y' });
  } } });
})();
