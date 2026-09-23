/* 114 Read aloud: selection, else the article, with Chrome's built-in voices. */
(() => { const P = window.__prism;
  P.def('readaloud', { actions: { read() { const t = String(getSelection()).trim() || P.text(P.mainEl()); P.send({ type: 'tts:speak', text: t.slice(0, 60000) }); P.ui.toast('Reading aloud. Palette: "Stop reading aloud".'); return 'Reading'; } } });
})();
