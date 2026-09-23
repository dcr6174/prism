/* 118 Price log: records the price each time you open an Amazon.in / Flipkart / Myntra product page; chip shows lowest seen + Watch button. */
(() => { const P = window.__prism;
  const read = () => {
    for (const x of P.jsonld()) { const o = x.offers && [].concat(x.offers)[0]; if (o && (o.price || o.lowPrice)) return parseFloat(String(o.price || o.lowPrice).replace(/,/g, '')); }
    const sel = ['.a-price .a-offscreen', '#corePrice_feature_div .a-offscreen', '#priceblock_ourprice', '#priceblock_dealprice', 'div.Nx9bqj', 'div._30jeq3', '.pdp-price strong', '.pdp-price'];
    for (const s of sel) { const e = document.querySelector(s); if (e) { const m = e.textContent.replace(/,/g, '').match(/[\d.]+/); if (m) return parseFloat(m[0]); } }
    return null;
  };
  const isProduct = () => /amazon\.in$/.test(P.host) ? /\/(dp|gp\/product)\//.test(location.pathname) : /flipkart\.com$/.test(P.host) ? /\/p\//.test(location.pathname) : /myntra\.com$/.test(P.host) ? /\/buy$/.test(location.pathname) : false;
  const key = () => { const m = location.pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/); return m ? 'amazon:' + m[1] : P.host + location.pathname; };
  P.def('pricelog', { sites: ['amazon.in', 'flipkart.com', 'myntra.com'], run() {
    setTimeout(async () => {
      if (!isProduct()) return; const price = read(); if (!price) return;
      const title = (document.querySelector('#productTitle, span.VU-ZEz, span.B_NuCI, h1.pdp-title') || { innerText: document.title }).innerText.trim().slice(0, 140);
      const all = await PrismStore.update('prices', {}, (m) => { const it = m[key()] = m[key()] || { title, url: location.href.split('?')[0], site: P.host, hist: [] }; const last = it.hist[it.hist.length - 1]; if (!last || last[1] !== price || Date.now() - last[0] > 864e5) it.hist.push([Date.now(), price]); it.title = title; });
      const it = all[key()]; const low = Math.min(...it.hist.map(h => h[1])), high = Math.max(...it.hist.map(h => h[1]));
      const chip = P.ui.el('div', 'b', '<span style="padding:4px 8px"></span><button>Watch price</button>'); chip.style.right = '16px'; chip.style.bottom = '16px';
      chip.querySelector('span').textContent = '₹' + price.toLocaleString('en-IN') + (it.hist.length > 1 ? ' · low ₹' + low.toLocaleString('en-IN') + ' · high ₹' + high.toLocaleString('en-IN') + ' · ' + it.hist.length + ' visits' : ' · first visit logged');
      chip.querySelector('button').onclick = async () => { if (P.on('pricewatch')) { await P.send({ type: 'pricewatch:add', url: it.url, title, price }); P.ui.toast('Watching. You get a notification if it drops.'); } else P.ui.toast('Turn on Price-drop watch in Settings'); };
      P.ui.root().append(chip);
    }, 2500);
  } });
})();
