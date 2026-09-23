/* 125 Job-portal filter: hide promoted, reposted, applied and chosen companies on LinkedIn, Naukri and Indeed. */
(() => { const P = window.__prism;
  const CARDS = { 'linkedin.com': 'li.jobs-search-results__list-item, li.scaffold-layout__list-item, .job-card-container', 'naukri.com': '.srp-jobtuple-wrapper, article.jobTuple, .cust-job-tuple', 'indeed.com': '.job_seen_beacon, li:has(.job_seen_beacon)' };
  P.def('jobfilter', { sites: ['linkedin.com', 'naukri.com', 'indeed.com'], run() {
    const c = P.cfg('jobfilter'); const comps = (c.companies || []).map(x => x.toLowerCase());
    const sel = Object.entries(CARDS).find(([h]) => P.U.siteMatch(P.host, h)); if (!sel) return;
    let hidden = 0, chip;
    P.observe(() => {
      document.querySelectorAll(sel[1]).forEach(card => {
        if (card.dataset.prismJf) return; const t = (card.innerText || '').toLowerCase(); if (!t) return; card.dataset.prismJf = '1';
        const why = (c.hidePromoted && /\bpromoted\b|\bsponsored\b/.test(t)) || (c.hideApplied && /\bapplied\b/.test(t)) || (c.hideReposted && /\breposted\b/.test(t)) || comps.some(x => x && t.includes(x));
        if (why) { card.style.setProperty('display', 'none', 'important'); hidden++; }
      });
      if (hidden) { if (!chip) { chip = P.ui.el('div', 'b'); chip.style.left = '16px'; chip.style.bottom = '16px'; chip.style.padding = '5px 12px'; P.ui.root().append(chip); } chip.textContent = 'PRISM hid ' + hidden + ' job cards'; }
    }, 900);
  } });
})();
