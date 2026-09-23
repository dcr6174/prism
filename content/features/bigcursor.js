/* 116 Big cursor + strong focus ring + reduced motion. */
(() => { const P = window.__prism;
  P.def('bigcursor', { early: true, run() {
    const cur = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M4 2 L4 32 L12 24 L18 38 L23 36 L17 22 L29 22 Z" fill="black" stroke="white" stroke-width="2"/></svg>');
    P.css('bigcursor', `html, body, * { cursor: url("${cur}") 4 2, auto !important; } a, button, [role=button], a *, button * { cursor: url("${cur}") 4 2, pointer !important; } *:focus-visible, *:focus { outline: 3px solid #4F5BD5 !important; outline-offset: 2px !important; } *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }`);
  } });
})();
