/* 67 Job keyword highlighter: on job pages, marks your stack in blue and red flags in orange, with a score chip. */
(() => { const P = window.__prism;
  const JOBSITES = ['linkedin.com', 'naukri.com', 'indeed.com', 'instahyre.com', 'wellfound.com', 'foundit.in', 'glassdoor.co.in', 'glassdoor.com', 'hirist.tech', 'cutshort.io', 'greenhouse.io', 'lever.co', 'workday.com', 'myworkdayjobs.com', 'smartrecruiters.com', 'ashbyhq.com'];
  P.def('keywords', {
    sites: (P) => P.U.anySite(P.host, JOBSITES) || /career|jobs?\b/.test(location.href) || P.jsonld().some(x => /JobPosting/.test(x['@type'])),
    run() {
      const words = (P.cfg('keywords').words || []).filter(Boolean), avoid = (P.cfg('keywords').avoid || []).filter(Boolean);
      if (!words.length && !avoid.length) return;
      const re = (l) => new RegExp('\\b(' + l.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
      const good = words.length ? re(words) : null, bad = avoid.length ? re(avoid) : null;
      let chip;
      const paint = () => {
        const root = document.querySelector('.jobs-description, .jobs-search__job-details, [class*="job-desc"], [class*="JobDescription"], #jobDescriptionText, article, main') || document.body;
        const found = new Set(), flags = new Set();
        const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement && !n.parentElement.closest('mark[data-prism-kw], script, style, textarea, input, prism-ui') ? 1 : 2 });
        const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
        for (const n of nodes) {
          const t = n.textContent; if (!(good && good.test(t)) && !(bad && bad.test(t))) continue;
          const frag = document.createDocumentFragment(); let last = 0;
          const all = [...(good ? [...t.matchAll(good)].map(m => [m, 0]) : []), ...(bad ? [...t.matchAll(bad)].map(m => [m, 1]) : [])].sort((a, b) => a[0].index - b[0].index);
          for (const [m, isBad] of all) { if (m.index < last) continue; frag.append(t.slice(last, m.index)); const mk = document.createElement('mark'); mk.dataset.prismKw = '1'; mk.textContent = m[0]; mk.style.cssText = 'border-radius:3px;padding:0 2px;color:inherit;background:' + (isBad ? 'rgba(224,145,95,.35)' : 'rgba(79,91,213,.2)'); frag.append(mk); (isBad ? flags : found).add(m[0].toLowerCase()); last = m.index + m[0].length; }
          frag.append(t.slice(last)); n.replaceWith(frag);
        }
        document.querySelectorAll('mark[data-prism-kw]').forEach(m => (bad && new RegExp(bad.source, 'i').test(m.textContent) ? flags : found).add(m.textContent.toLowerCase()));
        if (!found.size && !flags.size) return;
        if (!chip) { chip = P.ui.el('div', 'b'); chip.style.right = '16px'; chip.style.bottom = '16px'; chip.style.padding = '7px 14px'; P.ui.root().append(chip); }
        chip.textContent = 'Match ' + found.size + '/' + words.length + (flags.size ? ' · ⚑ ' + [...flags].join(', ') : '');
        chip.title = [...found].join(', ');
      };
      P.observe(paint, 1200);
    },
  });
})();
