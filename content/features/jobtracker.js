/* 66 Job tracker: saves role, company, location, URL and date from the job page (JSON-LD JobPosting when present). */
(() => { const P = window.__prism;
  P.def('jobtracker', { actions: { async save() {
    const jp = P.jsonld().find(x => /JobPosting/.test(x['@type']));
    const txt = (s) => { const e = document.querySelector(s); return e ? e.innerText.trim() : ''; };
    let role = jp && jp.title || txt('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.styles_jd-header-title__rZwM1, h1[class*="title"], h1') || document.title;
    let company = jp && jp.hiringOrganization && (jp.hiringOrganization.name || jp.hiringOrganization) || txt('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, [class*="comp-name"], [data-company-name]') || P.meta('og:site_name') || P.host;
    let loc = jp && jp.jobLocation && [].concat(jp.jobLocation).map(l => l.address && (l.address.addressLocality || l.address.addressRegion)).filter(Boolean).join(', ') || '';
    if (jp && jp.jobLocationType === 'TELECOMMUTE') loc = (loc ? loc + ', ' : '') + 'Remote';
    const deadline = jp && jp.validThrough ? String(jp.validThrough).slice(0, 10) : '';
    role = prompt('Role', String(role).slice(0, 120)); if (role == null) return;
    company = prompt('Company', String(company).slice(0, 80)) || company;
    const item = { id: P.U.uid(), role, company, location: loc, url: location.href, saved: Date.now(), status: 'saved', deadline, notes: '' };
    await PrismStore.update('jobs', [], (l) => { if (l.some(j => j.url === item.url)) return l; l.unshift(item); return l; });
    P.ui.toast('Saved to job tracker: ' + company); return 'Saved';
  } } });
})();
