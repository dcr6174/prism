/* 71 YouTube Watch Later quick-add: button on the watch page + W key. Uses YouTube's own Save menu (can break if YouTube changes). */
(() => { const P = window.__prism;
  P.yt = P.yt || {
    wait: async (sel, root = document, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { const e = root.querySelector(sel); if (e) return e; await new Promise(r => setTimeout(r, 150)); } return null; },
    async openSave() {
      let btn = [...document.querySelectorAll('#actions button, ytd-menu-renderer button, button')].find(b => /^(save|save to playlist)$/i.test((b.getAttribute('aria-label') || b.innerText || '').trim()));
      if (!btn) { const more = document.querySelector('#actions ytd-menu-renderer yt-button-shape#button-shape button, #actions #button-shape button, ytd-menu-renderer #button[aria-label="More actions"]'); if (more) { more.click(); const item = await P.yt.wait('ytd-menu-service-item-renderer, yt-list-item-view-model'); const all = [...document.querySelectorAll('ytd-menu-service-item-renderer, yt-list-item-view-model')]; btn = all.find(i => /save/i.test(i.innerText)); } }
      if (!btn) return null; btn.click();
      return P.yt.wait('ytd-add-to-playlist-renderer, yt-contextual-sheet-layout, tp-yt-paper-dialog');
    },
    async toggleList(name) {
      const dlg = await P.yt.openSave(); if (!dlg) { P.ui.toast('Could not open YouTube\'s Save menu'); return; }
      await new Promise(r => setTimeout(r, 400));
      const opt = [...document.querySelectorAll('ytd-playlist-add-to-option-renderer, yt-list-item-view-model, toggleable-list-item-view-model')].find(o => new RegExp('^\\s*' + name, 'i').test(o.innerText));
      if (!opt) { P.ui.toast('Playlist not found: ' + name); return; }
      (opt.querySelector('tp-yt-paper-checkbox, [role=checkbox], button') || opt).click();
      setTimeout(() => { const esc = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }); document.dispatchEvent(esc); const close = document.querySelector('ytd-add-to-playlist-renderer #close-button button, tp-yt-paper-dialog #close-button'); if (close) close.click(); }, 350);
      P.ui.toast('Toggled "' + name + '"');
    },
  };
  P.def('ytwatchlater', { sites: ['youtube.com'], run() {
    P.key((e) => { if (e.key === 'w' && !e.ctrlKey && !e.metaKey && !e.altKey && !P.typing(e) && location.pathname === '/watch') { P.yt.toggleList('Watch later'); return true; } });
    P.observe(() => {
      if (location.pathname !== '/watch' || document.getElementById('prism-wl')) return;
      const bar = document.querySelector('#top-level-buttons-computed, #actions-inner #menu'); if (!bar) return;
      const b = document.createElement('button'); b.id = 'prism-wl'; b.textContent = '+ Watch later'; b.title = 'PRISM (W)';
      b.style.cssText = 'border:0;border-radius:18px;padding:0 14px;height:36px;margin-left:8px;cursor:pointer;background:var(--yt-spec-badge-chip-background,#f2f2f2);color:var(--yt-spec-text-primary,#0f0f0f);font:500 14px Roboto,Arial,sans-serif';
      b.onclick = () => P.yt.toggleList('Watch later'); bar.append(b);
    }, 1000);
  } });
})();
