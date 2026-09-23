/* 73 Hide Shorts everywhere on YouTube (shelves, tabs, sidebar entry, search results). */
(() => { const P = window.__prism;
  P.def('ytshorts', { sites: ['youtube.com'], early: true, run() {
    P.css('ytshorts', `ytd-reel-shelf-renderer, ytd-rich-shelf-renderer[is-shorts], ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]), grid-shelf-view-model:has(ytm-shorts-lockup-view-model), ytd-guide-entry-renderer:has(a[title="Shorts"]), ytd-mini-guide-entry-renderer[aria-label="Shorts"], yt-tab-shape[tab-title="Shorts"], ytd-video-renderer:has(a[href^="/shorts/"]), ytd-grid-video-renderer:has(a[href^="/shorts/"]), ytd-rich-item-renderer:has(a[href^="/shorts/"]), ytm-shorts-lockup-view-model, ytd-reel-video-renderer { display: none !important; }`);
    if (location.pathname.startsWith('/shorts/')) location.replace('/watch?v=' + location.pathname.split('/')[2]);
  } });
})();
