/* 150 Hide distractions: YouTube home + sidebar recommendations, LinkedIn feed, X trends. Pure CSS, instant. */
(() => { const P = window.__prism;
  P.def('distractions', { sites: ['youtube.com', 'linkedin.com', 'x.com', 'twitter.com'], run() {
    const c = P.cfg('distractions'); const css = [];
    if (c.yt && P.U.siteMatch(P.host, 'youtube.com')) css.push('ytd-browse[page-subtype="home"] #contents, #related, ytd-watch-next-secondary-results-renderer, .ytp-endscreen-content, ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts]{display:none!important}ytd-browse[page-subtype="home"]::before{content:"Home feed hidden by PRISM. Search for what you came for.";display:block;padding:80px;text-align:center;font:500 16px Inter,system-ui;opacity:.6}');
    if (c.li && P.U.siteMatch(P.host, 'linkedin.com')) css.push('.scaffold-finite-scroll--infinite, main.scaffold-layout__main > div.relative, .feed-shared-update-v2, .news-module{display:none!important}');
    if (c.x && (P.U.siteMatch(P.host, 'x.com') || P.U.siteMatch(P.host, 'twitter.com'))) css.push('[aria-label="Timeline: Trending now"], [aria-label="Who to follow"], [data-testid="sidebarColumn"] section, a[href="/explore"] + div{display:none!important}');
    if (css.length) P.css('distractions', css.join('\n'));
  } });
})();
