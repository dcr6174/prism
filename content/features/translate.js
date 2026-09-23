/* 112 On-device translate with Chrome's Translator + LanguageDetector APIs. Selection -> panel; no selection -> whole page in place. */
(() => { const P = window.__prism;
  P.def('translate', { actions: { async run() {
    const to = P.cfg('translate').to || 'en';
    if (!self.Translator) { P.ui.toast('This Chrome has no built-in Translator (needs desktop Chrome 138+). Try Chrome\'s own Translate in the address bar.', 5000); return; }
    const sel = String(getSelection()).trim();
    const sample = sel || P.text(P.mainEl()).slice(0, 2000);
    let from = document.documentElement.lang ? document.documentElement.lang.slice(0, 2) : '';
    if (self.LanguageDetector) { try { const d = await LanguageDetector.create(); const r = await d.detect(sample); if (r[0] && r[0].confidence > 0.5) from = r[0].detectedLanguage; } catch (e) {} }
    if (!from || from === 'und') from = prompt('Source language code (e.g. hi, te, fr)?', 'hi') || 'hi';
    if (from === to) { P.ui.toast('Already in ' + to); return; }
    const av = await Translator.availability({ sourceLanguage: from, targetLanguage: to });
    if (av === 'unavailable') { P.ui.toast('On-device translation ' + from + ' -> ' + to + ' is not available'); return; }
    if (av !== 'available') P.ui.toast('Downloading language pack once...', 5000);
    const tr = await Translator.create({ sourceLanguage: from, targetLanguage: to });
    if (sel) { const p = P.ui.panel('Translate ' + from + ' -> ' + to + ' (on-device)', '<p class="m">Working...</p>', { id: 'tr' }); const out = await tr.translate(sel); p.querySelector('.c').innerHTML = '<pre></pre><button class="pr">Copy</button>'; p.querySelector('pre').textContent = out; p.querySelector('button').onclick = () => P.copy(out); return; }
    const tw = document.createTreeWalker(P.mainEl(), NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.textContent.trim().length > 1 && !n.parentElement.closest('script,style,noscript,code,pre,prism-ui') ? 1 : 2 });
    const nodes = []; while (tw.nextNode()) nodes.push(tw.currentNode);
    P.ui.toast('Translating ' + nodes.length + ' text blocks on this device...', 3000);
    for (const n of nodes.slice(0, 1500)) { try { n.textContent = await tr.translate(n.textContent); } catch (e) {} }
    P.ui.toast('Translated to ' + to + '. Reload for the original.');
  } } });
})();
