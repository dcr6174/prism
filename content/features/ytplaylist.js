/* 74 Playlist quick add/remove: P opens Save-to-playlist; Shift+P asks for a playlist name and toggles it. */
(() => { const P = window.__prism;
  P.def('ytplaylist', { sites: ['youtube.com'], run() {
    P.key((e) => {
      if (P.typing(e) || e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'p' || location.pathname !== '/watch' || !P.yt) return;
      if (e.shiftKey) { PrismStore.get('ytLastList', '').then(last => { const n = prompt('Playlist to add/remove', last); if (n) { PrismStore.set('ytLastList', n); P.yt.toggleList(n); } }); }
      else P.yt.openSave();
      return true;
    });
  } });
})();
