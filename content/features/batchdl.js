/* 132 Batch download: collects image and PDF links on the page into a list you filter and download in Tools. */
(() => { const P = window.__prism;
  P.def('batchdl', { actions: { async collect() {
    const set = new Map();
    document.querySelectorAll('img').forEach(i => { const u = i.currentSrc || i.src; if (/^https?:/.test(u) && (i.naturalWidth || 0) >= 60) set.set(u, { url: u, kind: 'image', w: i.naturalWidth, h: i.naturalHeight }); });
    document.querySelectorAll('a[href]').forEach(a => { const u = a.href; if (/\.pdf(\?|$)/i.test(u)) set.set(u, { url: u, kind: 'pdf' }); else if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u)) set.set(u, { url: u, kind: 'image' }); else if (/\.(zip|docx?|xlsx?|pptx?|csv|mp3|mp4)(\?|$)/i.test(u)) set.set(u, { url: u, kind: 'file' }); });
    await PrismStore.set('batch', { from: location.href, title: document.title, items: [...set.values()] });
    window.open(chrome.runtime.getURL('pages/tools/tools.html#batch'));
    return set.size + ' files found';
  } } });
})();
