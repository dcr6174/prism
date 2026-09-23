/* 24 On-device summary: Chrome's built-in Summarizer (Gemini Nano). Fallback: hand the page to a web chat. */
(() => { const P = window.__prism;
  P.ai = P.ai || {
    has: (name) => typeof self[name] !== 'undefined',
    async make(name, opts) {
      const api = self[name]; if (!api) return null;
      const av = await api.availability(opts && opts.langs ? opts.langs : undefined).catch(() => 'unavailable');
      if (av === 'unavailable') return null;
      if (av !== 'available') P.ui.toast('Downloading on-device model once. This can take a few minutes...', 6000);
      return api.create(Object.assign({}, opts && opts.create, { monitor(m) { m.addEventListener('downloadprogress', (e) => P.ui.toast('Model download ' + Math.round(e.loaded * 100) + '%')); } }));
    },
    pageText: () => (P.mainEl().innerText || '').replace(/\n{3,}/g, '\n\n').slice(0, 24000),
    fallback(text, why) { P.ui.toast((why || 'On-device AI is not available in this Chrome.') + ' Sending to your chat site...', 3500); return P.send({ type: 'ai:handoff', text }); },
  };
  P.def('aisummary', { actions: {
    async summarise() {
      const text = P.ai.pageText();
      const s = await P.ai.make('Summarizer', { create: { type: 'key-points', format: 'markdown', length: 'medium', sharedContext: document.title } }).catch(() => null);
      if (!s) return P.ai.fallback('Summarise this page in 5 bullet points:\n\n' + document.title + '\n' + location.href + '\n\n' + text.slice(0, 12000));
      const p = P.ui.panel('Summary (on-device)', '<p class="m">Working on this device...</p>', { id: 'ai' });
      const out = await s.summarize(text.slice(0, 12000));
      p.querySelector('.c').innerHTML = '<pre></pre><button class="pr">Copy</button>';
      p.querySelector('pre').textContent = out; p.querySelector('button').onclick = () => P.copy(out);
      return 'ok';
    },
  } });
})();
