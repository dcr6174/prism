/* 25 On-device rewrite of the selected text (Rewriter API), fallback to web chat. */
(() => { const P = window.__prism;
  P.def('airewrite', { actions: {
    async rewrite() {
      const sel = String(getSelection()); if (!sel.trim()) { P.ui.toast('Select some text first'); return; }
      const ai = window.__prism.ai;
      const r = ai && await ai.make('Rewriter', { create: { tone: 'as-is', length: 'as-is' } }).catch(() => null);
      if (!r) return P.send({ type: 'ai:handoff', text: 'Rewrite this so it is clear and simple. Keep my meaning:\n\n' + sel });
      const p = P.ui.panel('Rewrite (on-device)', '<p class="m">Working...</p>', { id: 'ai' });
      const out = await r.rewrite(sel, { context: 'Make it clear, simple and natural.' });
      p.querySelector('.c').innerHTML = '<pre></pre><button class="pr">Copy</button>';
      p.querySelector('pre').textContent = out; p.querySelector('button').onclick = () => P.copy(out);
    },
  } });
})();
