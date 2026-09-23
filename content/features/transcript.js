/* 109 YouTube transcript: opens YouTube's transcript panel, copies clean text (with or without timestamps), summarises on-device. */
(() => { const P = window.__prism;
  const get = async (withTime) => {
    if (!/youtube\.com$/.test(location.hostname) || location.pathname !== '/watch') { P.ui.toast('Open a YouTube video first'); return null; }
    let segs = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (!segs.length) {
      const exp = document.querySelector('tp-yt-paper-button#expand, #description-inline-expander #expand'); if (exp) exp.click();
      await new Promise(r => setTimeout(r, 400));
      const btn = [...document.querySelectorAll('ytd-video-description-transcript-section-renderer button, button')].find(b => /show transcript/i.test(b.innerText || b.getAttribute('aria-label') || ''));
      if (!btn) { P.ui.toast('This video has no transcript'); return null; }
      btn.click();
      for (let i = 0; i < 40 && !(segs = document.querySelectorAll('ytd-transcript-segment-renderer')).length; i++) await new Promise(r => setTimeout(r, 200));
    }
    return [...segs].map(s => { const t = (s.querySelector('.segment-timestamp') || {}).innerText || ''; const x = (s.querySelector('.segment-text, yt-formatted-string') || s).innerText.trim(); return withTime ? '[' + t.trim() + '] ' + x : x; }).join(withTime ? '\n' : ' ').replace(/\s+\n/g, '\n');
  };
  P.def('transcript', { sites: ['youtube.com'], actions: {
    async copy() { const t = await get(confirm('Include timestamps? OK = yes, Cancel = plain text')); if (t) return P.copy(t, 'Transcript copied (' + t.split(/\s+/).length + ' words)'); },
    async summarise() {
      const t = await get(false); if (!t) return;
      const ai = P.ai; const s = ai && await ai.make('Summarizer', { create: { type: 'key-points', format: 'markdown', length: 'long' } }).catch(() => null);
      if (!s) return P.send({ type: 'ai:handoff', text: 'Summarise this YouTube video transcript into key points and takeaways:\n\n' + document.title + '\n\n' + t.slice(0, 30000) });
      const p = P.ui.panel('Video summary (on-device)', '<p class="m">Working...</p>', { id: 'ai' });
      const out = await s.summarize(t.slice(0, 16000)); p.querySelector('.c').innerHTML = '<pre></pre><button class="pr">Copy</button>'; p.querySelector('pre').textContent = out; p.querySelector('button').onclick = () => P.copy(out);
    },
  } });
})();
