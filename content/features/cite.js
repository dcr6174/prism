/* 100 Citations (APA 7, MLA 9, IEEE) from page metadata. */
(() => { const P = window.__prism;
  P.def('cite', { actions: { show() {
    const ld = P.jsonld().find(x => /Article|ScholarlyArticle|NewsArticle|BlogPosting|WebPage/.test(x['@type'])) || {};
    const authorsRaw = [...document.querySelectorAll('meta[name="citation_author"]')].map(m => m.content);
    const ldA = [].concat(ld.author || []).map(a => a && (a.name || a)).filter(x => typeof x === 'string');
    const authors = authorsRaw.length ? authorsRaw : ldA.length ? ldA : [P.meta('author') || P.meta('article:author')].filter(Boolean);
    const title = P.meta('citation_title') || ld.headline || P.meta('og:title') || document.title;
    const site = P.meta('citation_journal_title') || P.meta('og:site_name') || location.hostname.replace(/^www\./, '');
    const dateS = P.meta('citation_publication_date') || P.meta('citation_date') || ld.datePublished || P.meta('article:published_time') || '';
    const d = dateS ? new Date(dateS.replace(/\//g, '-')) : null; const ok = d && !isNaN(d);
    const doi = P.meta('citation_doi'); const url = doi ? 'https://doi.org/' + doi.replace(/^doi:/i, '') : location.href;
    const today = new Date(); const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const split = (a) => { const p = a.includes(',') ? a.split(',').map(s => s.trim()).reverse() : a.trim().split(/\s+/); const last = p.pop() || ''; return { last, first: p }; };
    const apaA = authors.map(a => { const s = split(a); return s.last + (s.first.length ? ', ' + s.first.map(f => f[0] + '.').join(' ') : ''); });
    const apaAuth = apaA.length > 1 ? apaA.slice(0, -1).join(', ') + ', & ' + apaA.slice(-1) : apaA[0] || site;
    const apa = apaAuth + ' (' + (ok ? d.getFullYear() + ', ' + M[d.getMonth()] + ' ' + d.getDate() : 'n.d.') + '). ' + title + '. ' + site + '. ' + url;
    const mlaA = authors.length ? (() => { const s = split(authors[0]); return s.last + ', ' + s.first.join(' ') + (authors.length > 2 ? ', et al.' : authors.length === 2 ? ', and ' + authors[1] : '') + '. '; })() : '';
    const mla = mlaA + '"' + title + '." ' + site + (ok ? ', ' + d.getDate() + ' ' + M[d.getMonth()].slice(0, 3) + '. ' + d.getFullYear() : '') + ', ' + url.replace(/^https?:\/\//, '') + '. Accessed ' + today.getDate() + ' ' + M[today.getMonth()].slice(0, 3) + '. ' + today.getFullYear() + '.';
    const ieeeA = authors.map(a => { const s = split(a); return s.first.map(f => f[0] + '.').join(' ') + ' ' + s.last; }).join(', ');
    const ieee = (ieeeA ? ieeeA + ', ' : '') + '"' + title + '," ' + site + (ok ? ', ' + M[d.getMonth()].slice(0, 3) + '. ' + d.getFullYear() : '') + '. [Online]. Available: ' + url + ' (accessed ' + M[today.getMonth()].slice(0, 3) + '. ' + today.getDate() + ', ' + today.getFullYear() + ').';
    const p = P.ui.panel('Cite this page', '<p class="m">APA 7</p><pre data-c></pre><p class="m">MLA 9</p><pre data-c></pre><p class="m">IEEE</p><pre data-c></pre><p class="m">Click to copy. Check author names; pages often hide them.</p>', { id: 'cite' });
    const pres = p.querySelectorAll('pre'); [apa, mla, ieee].forEach((t, i) => { pres[i].textContent = t; pres[i].style.cursor = 'pointer'; pres[i].onclick = () => P.copy(t, 'Citation copied'); });
  } } });
})();
