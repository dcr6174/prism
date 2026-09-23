/* 41 Copy all links on the page (unique, with text). */
(() => { const P = window.__prism;
  P.def('alllinks', { actions: { copy() {
    const seen = new Set(); const out = [];
    document.querySelectorAll('a[href]').forEach(a => { const u = a.href; if (!/^https?:/.test(u) || seen.has(u)) return; seen.add(u); out.push((a.innerText.trim().replace(/\s+/g, ' ').slice(0, 80) || '(no text)') + '\t' + u); });
    return P.copy(out.join('\n'), out.length + ' links copied');
  } } });
})();
