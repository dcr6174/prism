/* 32 Copy tables as CSV or Markdown. On allowed sites a small "Copy" chip appears when you hover a table. */
(() => { const P = window.__prism;
  const csv = (t) => P.tableRows(t).map(r => r.map(c => /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c).join(',')).join('\n');
  const rows = (t) => [...t.rows].map(r => [...r.cells].map(c => c.innerText.trim().replace(/\s+/g, ' ')));
  P.tableRows = P.tableRows || rows;
  const md = (t) => P.tableMd ? P.tableMd(t) : rows(t).map(r => '| ' + r.join(' | ') + ' |').join('\n');
  const menu = (t) => { const p = P.ui.panel('Copy table', '<p class="m">' + t.rows.length + ' rows</p><button class="pr" data-k="csv">Copy CSV</button><button data-k="md">Copy Markdown</button><button data-k="dl">Download CSV</button>', { id: 'tbl' });
    p.onclick = (e) => { const k = e.target.dataset.k; if (k === 'csv') P.copy(csv(t), 'CSV copied'); if (k === 'md') P.copy(md(t), 'Markdown table copied'); if (k === 'dl') P.download(csv(t), (document.title || 'table').slice(0, 40) + '.csv', 'text/csv'); }; };
  P.def('tables', {
    run() {
      let chip;
      document.addEventListener('mouseover', (e) => {
        const t = e.target.closest && e.target.closest('table'); if (!t || t.rows.length < 2) return;
        if (!chip) { chip = P.ui.el('div', 'b', '<button>Copy table</button>'); P.ui.root().append(chip); }
        const b = t.getBoundingClientRect(); chip.style.left = Math.max(4, b.right - 100) + 'px'; chip.style.top = Math.max(4, b.top + 4) + 'px'; chip.style.display = 'flex';
        chip.onclick = () => menu(t); clearTimeout(chip._h); chip._h = setTimeout(() => chip.style.display = 'none', 2500);
      }, { passive: true });
    },
    actions: {
      async pick() { const ts = document.querySelectorAll('table'); if (!ts.length) { P.ui.toast('No tables on this page'); return; } if (ts.length === 1) return menu(ts[0]); const el = await P.ui.pick('Click a table'); const t = el && el.closest('table'); if (t) menu(t); },
    },
  });
})();
