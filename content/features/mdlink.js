/* 38 Copy [Title](url) */
(() => { const P = window.__prism;
  P.def('mdlink', { actions: { copy() { return P.copy('[' + document.title.replace(/[[\]]/g, '') + '](' + P.U.cleanUrl(location.href) + ')', 'Markdown link copied'); } } });
})();
