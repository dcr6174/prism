/* 39 QR code for the current page (qrcode-generator, MIT, bundled in lib/). */
(() => { const P = window.__prism;
  P.def('qr', { actions: { show() {
    const q = qrcode(0, 'M'); q.addData(location.href); q.make();
    const p = P.ui.panel('Scan with your phone', '<div style="display:grid;place-items:center;background:#fff;border-radius:12px;padding:14px">' + q.createSvgTag({ cellSize: 6, margin: 2, scalable: false }) + '</div><p class="m" style="word-break:break-all"></p>', { id: 'qr' });
    p.querySelector('.m').textContent = location.href;
  } } });
})();
