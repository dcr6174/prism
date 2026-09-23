/* 140 Gmail templates: a "Templates" button in compose inserts a saved reply. */
(() => { const P = window.__prism;
  P.def('gmailtpl', { sites: ['mail.google.com'], run() {
    P.observe(async () => {
      for (const bar of document.querySelectorAll('tr.btC, .btC')) {
        if (bar.querySelector('.prism-tpl')) continue;
        const td = document.createElement('td'); td.className = 'prism-tpl';
        const b = document.createElement('div'); b.textContent = 'Templates'; b.style.cssText = 'cursor:pointer;padding:0 10px;font:500 13px "Google Sans",Roboto,sans-serif;color:#4F5BD5;line-height:36px';
        b.onclick = async () => {
          const rs = await PrismStore.get('replies', []); if (!rs.length) { P.ui.toast('Add replies in PRISM Tools > Saved replies'); return; }
          const body = bar.closest('.M9, .AD, [role=dialog], .iN') && bar.closest('.M9, .AD, [role=dialog], .iN').querySelector('div[aria-label="Message Body"], div[contenteditable=true][role=textbox]');
          const p = P.ui.panel('Insert template', rs.map((r, i) => '<pre data-i="' + i + '" style="cursor:pointer"><b></b>\n</pre>').join(''), { id: 'tpl' });
          p.querySelectorAll('pre').forEach((pre, i) => { pre.querySelector('b').textContent = rs[i].name; pre.append(rs[i].text.slice(0, 160)); pre.onclick = () => { if (body) { body.focus(); document.execCommand('insertText', false, rs[i].text); } else P.copy(rs[i].text, 'Copied - paste into the email'); p.remove(); }; });
        };
        td.append(b); (bar.querySelector('td') || bar).after(td);
      }
    }, 1000);
  } });
})();
