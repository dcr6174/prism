/* 26 On-device proofread (Proofreader API; falls back to the Prompt API, then web chat). */
(() => { const P = window.__prism;
  P.def('aiproofread', { actions: {
    async proofread() {
      const sel = String(getSelection()); if (!sel.trim()) { P.ui.toast('Select some text first'); return; }
      const ai = window.__prism.ai;
      let out = null;
      const pr = ai && await ai.make('Proofreader', { create: { expectedInputLanguages: ['en'] } }).catch(() => null);
      if (pr) { const r = await pr.proofread(sel); out = r.correctedInput || r.corrected || String(r); }
      else { const lm = ai && await ai.make('LanguageModel', {}).catch(() => null); if (lm) out = await lm.prompt('Fix spelling and grammar. Return only the corrected text:\n\n' + sel); }
      if (out == null) return P.send({ type: 'ai:handoff', text: 'Proofread this. Fix grammar and spelling, return only the corrected text:\n\n' + sel });
      const p = P.ui.panel('Proofread (on-device)', '<pre></pre><button class="pr">Copy</button>', { id: 'ai' });
      p.querySelector('pre').textContent = out; p.querySelector('button').onclick = () => P.copy(out);
    },
  } });
})();
