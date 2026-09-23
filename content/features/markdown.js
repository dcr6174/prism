/* 30 Copy page or selection as clean Markdown. P.md is shared with reader mode and reading list. */
(() => { const P = window.__prism;
  P.md = P.md || function toMd(root) {
    const skip = /^(script|style|noscript|nav|footer|aside|form|button|svg|iframe|header)$/i;
    const walk = (n, ctx) => {
      if (n.nodeType === 3) return n.textContent.replace(/\s+/g, ' ');
      if (n.nodeType !== 1 || skip.test(n.tagName)) return '';
      const st = getComputedStyle(n); if (st.display === 'none' || st.visibility === 'hidden') return '';
      const kids = () => [...n.childNodes].map(c => walk(c, ctx)).join('');
      const t = n.tagName.toLowerCase();
      switch (t) {
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return '\n\n' + '#'.repeat(+t[1]) + ' ' + kids().trim() + '\n\n';
        case 'p': case 'section': case 'div': case 'article': case 'main': { const k = kids(); return /\S/.test(k) ? '\n\n' + k.trim() + '\n\n' : ''; }
        case 'br': return '  \n';
        case 'strong': case 'b': { const k = kids().trim(); return k ? '**' + k + '** ' : ''; }
        case 'em': case 'i': { const k = kids().trim(); return k ? '*' + k + '* ' : ''; }
        case 'code': return n.closest('pre') ? kids() : '`' + n.textContent + '`';
        case 'pre': return '\n\n```\n' + n.innerText.replace(/\n$/, '') + '\n```\n\n';
        case 'a': { const k = kids().trim(); const href = n.href; return k ? (href && !href.startsWith('javascript') ? '[' + k + '](' + href + ')' : k) : ''; }
        case 'img': return n.alt || n.src ? '![' + (n.alt || '') + '](' + n.src + ')' : '';
        case 'blockquote': return '\n\n' + kids().trim().split('\n').map(l => '> ' + l).join('\n') + '\n\n';
        case 'ul': case 'ol': return '\n\n' + [...n.children].filter(c => c.tagName === 'LI').map((li, i) => (t === 'ol' ? (i + 1) + '. ' : '- ') + walk(li, ctx).trim().replace(/\n+/g, '\n  ')).join('\n') + '\n\n';
        case 'li': return kids();
        case 'hr': return '\n\n---\n\n';
        case 'table': return '\n\n' + P.tableMd(n) + '\n\n';
        default: return kids();
      }
    };
    return walk(root, {}).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  };
  P.tableRows = P.tableRows || ((t) => [...t.rows].map(r => [...r.cells].map(c => c.innerText.trim().replace(/\s+/g, ' '))));
  P.tableMd = P.tableMd || ((t) => { const rows = P.tableRows(t); if (!rows.length) return ''; const w = Math.max(...rows.map(r => r.length)); const pad = (r) => '| ' + Array.from({ length: w }, (_, i) => (r[i] || '').replace(/\|/g, '\\|')).join(' | ') + ' |'; return [pad(rows[0]), '|' + ' --- |'.repeat(w), ...rows.slice(1).map(pad)].join('\n'); });
  P.def('markdown', { actions: {
    copy() { const md = '# ' + document.title + '\n\n' + location.href + '\n\n' + P.md(P.mainEl()); return P.copy(md, 'Page copied as Markdown'); },
    selection() { const s = getSelection(); if (!s.rangeCount || !String(s).trim()) { P.ui.toast('Select something first'); return; } const d = document.createElement('div'); d.append(s.getRangeAt(0).cloneContents()); document.body.append(d); d.style.cssText = 'position:fixed;left:-9999px'; const md = P.md(d); d.remove(); return P.copy(md, 'Selection copied as Markdown'); },
  } });
})();
