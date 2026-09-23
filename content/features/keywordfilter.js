/* 89 Keyword filter: hides feed posts/cards containing words you choose (works on most feed-like sites). */
(() => { const P = window.__prism;
  const CARD = 'article, [role=article], shreddit-post, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, .feed-shared-update-v2, [data-testid=tweet], [data-testid=cellInnerDiv], li.jobs-search-results__list-item, .srp-jobtuple-wrapper, .job_seen_beacon';
  P.def('keywordfilter', { run() {
    const words = (P.cfg('keywordfilter').words || []).map(w => w.toLowerCase()).filter(Boolean); if (!words.length) return;
    let n = 0;
    P.observe(() => document.querySelectorAll(CARD).forEach(c => { if (c.dataset.prismKf) return; c.dataset.prismKf = '1'; const t = (c.innerText || '').toLowerCase(); if (words.some(w => t.includes(w))) { c.style.setProperty('display', 'none', 'important'); n++; } }), 800);
  } });
})();
