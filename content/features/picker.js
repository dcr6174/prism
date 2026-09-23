/* 40 Element picker: click anything, copy its text, link or image. */
(() => { const P = window.__prism;
  P.def('picker', { actions: { async pick() {
    const el = await P.ui.pick('Click an element to copy it. Esc cancels.'); if (!el) return;
    const a = el.closest('a'); const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    const p = P.ui.panel('Copy element', '<pre></pre><button class="pr" data-k="t">Copy text</button>' + (a ? '<button data-k="l">Copy link</button>' : '') + (img ? '<button data-k="i">Copy image URL</button>' : '') + '<button data-k="h">Copy HTML</button>', { id: 'pick' });
    p.querySelector('pre').textContent = (el.innerText || el.alt || '').slice(0, 2000);
    p.onclick = (e) => { const k = e.target.dataset.k; if (k === 't') P.copy(el.innerText || el.alt || ''); if (k === 'l') P.copy(a.href); if (k === 'i') P.copy(img.currentSrc || img.src); if (k === 'h') P.copy(el.outerHTML); };
  } } });
})();
