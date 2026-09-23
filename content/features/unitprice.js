/* 120 Unit-price calculator: next to prices that sit near a pack size (500 g, 1 kg, 2 L, 6 pcs), shows ₹ per 100 g / 100 ml / piece. */
(() => { const P = window.__prism;
  const SIZE = /(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|grams?|l|ltr|litres?|liters?|ml|pcs?|pieces?|pack of \d+|units?)\b/i;
  const unit = (n, u) => { u = u.toLowerCase(); if (/^kg/.test(u)) return [n * 1000, 'g']; if (/^(g|gm|gms|gram)/.test(u)) return [n, 'g']; if (/^(l|ltr|litre|liter)/.test(u)) return [n * 1000, 'ml']; if (/^ml/.test(u)) return [n, 'ml']; return [n, 'pc']; };
  P.def('unitprice', { sites: ['amazon.in', 'flipkart.com', 'bigbasket.com', 'blinkit.com', 'zeptonow.com', 'swiggy.com', 'jiomart.com', 'dmart.in'], run() {
    P.observe(() => {
      document.querySelectorAll('span, div').forEach(el => {
        if (el.dataset.prismUp || el.children.length > 2) return;
        const t = el.textContent; if (t.length > 20 || !/₹\s?[\d,]+/.test(t)) return;
        el.dataset.prismUp = '1';
        const card = el.closest('li, [data-testid], [class*="product" i], [class*="Product"], [class*="card" i]') || el.parentElement.parentElement; if (!card) return;
        const sm = (card.innerText || '').match(SIZE); if (!sm) return;
        const price = parseFloat(t.replace(/[^\d.]/g, '')); if (!price) return;
        const [qty, u] = unit(parseFloat(sm[1]), sm[2]); if (!qty) return;
        const per = u === 'pc' ? price / qty : price / qty * 100;
        const tag = document.createElement('span'); tag.textContent = ' (₹' + per.toFixed(per < 10 ? 2 : 1) + '/' + (u === 'pc' ? 'pc' : '100' + u) + ')'; tag.style.cssText = 'font-size:11px;color:#4F5BD5;font-weight:500;white-space:nowrap';
        el.after(tag);
      });
    }, 1500);
  } });
})();
