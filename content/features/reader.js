/* 31 Reader mode: full-screen clean view with font, width and dark controls. */
(() => { const P = window.__prism;
  P.def('reader', { actions: {
    async open() {
      if (document.getElementById('prism-reader')) { document.getElementById('prism-reader').remove(); document.documentElement.style.overflow = ''; return; }
      const src = P.mainEl().cloneNode(true);
      src.querySelectorAll('script,style,noscript,nav,footer,aside,form,iframe,button,svg,[role=navigation],[aria-hidden=true],.ad,[class*="advert"],[id*="cookie"]').forEach(e => e.remove());
      const pref = await PrismStore.get('readerPref', { size: 19, width: 680, dark: matchMedia('(prefers-color-scheme: dark)').matches, serif: true });
      const host = document.createElement('div'); host.id = 'prism-reader';
      host.style.cssText = 'position:fixed;inset:0;z-index:2147483640;overflow:auto;';
      const sh = host.attachShadow({ mode: 'open' });
      const mins = Math.max(1, Math.round((src.innerText || '').split(/\s+/).length / 230));
      sh.innerHTML = `<style>
        :host { all: initial; } .w { min-height: 100%; transition: background .3s, color .3s; } .w.l { background: #F7F6F2; color: #1C1D1F; } .w.d { background: #111214; color: #D9DADC; }
        .bar { position: sticky; top: 0; display: flex; gap: 6px; justify-content: center; padding: 10px; background: inherit; opacity: .35; transition: opacity .3s; font: 13px system-ui; } .bar:hover { opacity: 1; }
        .bar button { border: 0; background: rgba(127,127,127,.15); color: inherit; border-radius: 999px; padding: 6px 12px; cursor: pointer; font: inherit; }
        article { margin: 0 auto; padding: 30px 24px 120px; line-height: 1.7; } h1.t { font-size: 2em; line-height: 1.2; letter-spacing: -.02em; margin: 10px 0 6px; }
        .m { opacity: .6; font: 13px system-ui; margin-bottom: 30px; } img, video { max-width: 100%; height: auto; border-radius: 8px; } a { color: #4F5BD5; }
        pre { white-space: pre-wrap; background: rgba(127,127,127,.12); padding: 12px; border-radius: 8px; font-size: .8em; } table { border-collapse: collapse; } td, th { border: 1px solid rgba(127,127,127,.3); padding: 4px 8px; }
      </style><div class="w"><div class="bar"><button data-a="-">A-</button><button data-a="+">A+</button><button data-a="n">Narrow</button><button data-a="wd">Wide</button><button data-a="f">Serif / Sans</button><button data-a="d">Light / Dark</button><button data-a="x">Close (Esc)</button></div><article><h1 class="t"></h1><div class="m"></div><div class="body"></div></article></div>`;
      sh.querySelector('.t').textContent = document.title; sh.querySelector('.m').textContent = location.hostname + ' · ' + mins + ' min read';
      sh.querySelector('.body').append(...src.childNodes);
      const apply = () => { const w = sh.querySelector('.w'); w.className = 'w ' + (pref.dark ? 'd' : 'l'); const a = sh.querySelector('article'); a.style.fontSize = pref.size + 'px'; a.style.maxWidth = pref.width + 'px'; a.style.fontFamily = pref.serif ? 'Charter, Georgia, "Iowan Old Style", serif' : 'Inter, system-ui, sans-serif'; PrismStore.set('readerPref', pref); };
      const close = () => { host.remove(); document.documentElement.style.overflow = ''; removeEventListener('keydown', esc, true); };
      const esc = (e) => { if (e.key === 'Escape') close(); };
      sh.querySelector('.bar').onclick = (e) => { const a = e.target.dataset.a; if (!a) return; if (a === '+') pref.size++; if (a === '-') pref.size--; if (a === 'n') pref.width = Math.max(480, pref.width - 80); if (a === 'wd') pref.width = Math.min(1100, pref.width + 80); if (a === 'f') pref.serif = !pref.serif; if (a === 'd') pref.dark = !pref.dark; if (a === 'x') return close(); apply(); };
      addEventListener('keydown', esc, true);
      apply(); document.documentElement.append(host); document.documentElement.style.overflow = 'hidden';
    },
  } });
})();
