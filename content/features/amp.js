/* 44 AMP -> original article */
(() => { const P = window.__prism;
  P.def('amp', { run() {
    const isAmp = document.documentElement.hasAttribute('amp') || document.documentElement.hasAttribute('⚡') || /\/amp(\/|$)|[?&]amp(=|&|$)|\.amp$|cdn\.ampproject\.org/.test(location.href);
    if (!isAmp) return;
    const c = document.querySelector('link[rel=canonical]');
    if (c && c.href && c.href !== location.href && !/amp/.test(new URL(c.href).pathname)) { P.ui.toast('Leaving AMP for the original page'); location.replace(c.href); }
  } });
})();
