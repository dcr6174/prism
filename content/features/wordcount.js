/* 103 Word / character counter for the selection or the focused text box. Live chip while typing in big fields. */
(() => { const P = window.__prism;
  const count = (t) => { const w = (t.match(/\S+/g) || []).length; return w + ' words · ' + t.length + ' chars · ' + t.replace(/\s/g, '').length + ' no spaces · ~' + Math.max(1, Math.round(w / 230)) + ' min read'; };
  P.def('wordcount', {
    run() {
      let chip;
      document.addEventListener('input', (e) => { const el = e.target; if (!(el.tagName === 'TEXTAREA' || el.isContentEditable)) return; const t = el.value != null ? el.value : el.innerText; if (t.length < 40) return;
        if (!chip) { chip = P.ui.el('div', 'b'); chip.style.padding = '5px 12px'; chip.style.right = '16px'; chip.style.bottom = '16px'; P.ui.root().append(chip); }
        chip.textContent = count(t); chip.style.display = 'flex'; clearTimeout(chip._h); chip._h = setTimeout(() => chip.style.display = 'none', 3000); }, true);
    },
    actions: { show() { const a = document.activeElement; const t = String(getSelection()) || (a && a.value) || (a && a.isContentEditable && a.innerText) || P.text(P.mainEl()); const p = P.ui.panel('Word count', '<pre></pre><p class="m">' + (String(getSelection()) ? 'Selection' : a && (a.value || a.isContentEditable) ? 'Focused box' : 'Main page text') + '</p>', { id: 'wc' }); p.querySelector('pre').textContent = count(t); } },
  });
})();
