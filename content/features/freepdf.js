/* 101 Free-PDF finder: on paper pages with a DOI, asks Unpaywall (free, open API) for a legal open-access PDF and shows a link. Links only. */
(() => { const P = window.__prism;
  P.def('freepdf', { sites: (P) => !!(P.meta('citation_doi') || P.meta('dc.identifier') && /10\.\d{4,}/.test(P.meta('dc.identifier'))) || /arxiv\.org$/.test(P.host), async run() {
    if (/arxiv\.org$/.test(P.host)) { const m = location.pathname.match(/\/abs\/([\w.\/-]+)/); if (m) chip('https://arxiv.org/pdf/' + m[1], 'arXiv PDF'); return; }
    const doi = (P.meta('citation_doi') || P.meta('dc.identifier')).replace(/^doi:/i, '').match(/10\.\d{4,}\/\S+/); if (!doi) return;
    const pdfMeta = P.meta('citation_pdf_url');
    try {
      const r = await fetch('https://api.unpaywall.org/v2/' + encodeURIComponent(doi[0]) + '?email=prism-extension@example.com'); const j = await r.json();
      const best = j.best_oa_location; if (best && (best.url_for_pdf || best.url)) return chip(best.url_for_pdf || best.url, 'Free PDF (' + (best.host_type || 'open access') + ')');
    } catch (e) {}
    if (pdfMeta) chip(pdfMeta, 'Publisher PDF link');
    function chip(href, label) { const c = P.ui.el('div', 'b', '<button></button>'); c.querySelector('button').textContent = '📄 ' + label; c.style.right = '16px'; c.style.top = '16px'; c.onclick = () => window.open(href, '_blank'); P.ui.root().append(c); }
  } });
})();
