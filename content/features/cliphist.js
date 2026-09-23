/* 46 Clipboard history: records what you copy on allowed sites (local only). Browse it in Tools > Clipboard. */
(() => { const P = window.__prism;
  P.def('cliphist', { run() {
    const rec = async () => {
      let text = String(getSelection());
      const a = document.activeElement; if (!text && a && /^(input|textarea)$/i.test(a.tagName) && a.type !== 'password') text = a.value.slice(a.selectionStart, a.selectionEnd);
      text = text.trim(); if (!text || text.length > 20000 || (a && a.type === 'password')) return;
      const max = P.cfg('cliphist').max || 200;
      await PrismStore.update('clipboard', [], (l) => { l = l.filter(x => x.text !== text || x.pin); l.unshift({ text, t: Date.now(), url: location.href, pin: false }); const pins = l.filter(x => x.pin); const rest = l.filter(x => !x.pin).slice(0, max); return pins.concat(rest).sort((x, y) => y.t - x.t); });
    };
    document.addEventListener('copy', rec, true); document.addEventListener('cut', rec, true);
  } });
})();
