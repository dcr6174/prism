/* 158 Suspicious-link warning: on hover, flags punycode, lookalike brand domains, raw IPs, shorteners and text/URL mismatch. */
(() => { const P = window.__prism;
  const BRANDS = ['google', 'paypal', 'amazon', 'apple', 'microsoft', 'facebook', 'instagram', 'whatsapp', 'netflix', 'linkedin', 'sbi', 'hdfcbank', 'icicibank', 'axisbank', 'paytm', 'phonepe', 'irctc', 'flipkart', 'incometax', 'uidai', 'github'];
  const SHORT = /^(bit\.ly|tinyurl\.com|t\.co|goo\.gl|is\.gd|cutt\.ly|rb\.gy|ow\.ly|buff\.ly|shorturl\.at|tiny\.cc|rebrand\.ly)$/;
  const reg = (h) => h.split('.').slice(-2).join('.');
  const check = (a) => {
    let u; try { u = new URL(a.href); } catch (e) { return null; } if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname; const why = [];
    if (h.split('.').some(p => p.startsWith('xn--'))) why.push('punycode domain (may imitate another site)');
    if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) why.push('raw IP address');
    if (SHORT.test(h)) why.push('shortened link - real destination hidden');
    const base = reg(h).split('.')[0];
    for (const b of BRANDS) { if (base !== b && (base.includes(b) || lev(base, b) === 1) && !reg(h).endsWith(b + '.com')) { why.push('looks like "' + b + '" but is ' + reg(h)); break; } }
    const txt = (a.innerText || '').trim(); const m = txt.match(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}/i);
    if (m && reg(m[0].replace(/^https?:\/\//, '').split('/')[0].toLowerCase()) !== reg(h)) why.push('link text says ' + m[0] + ' but goes to ' + h);
    return why.length ? why : null;
  };
  const lev = (a, b) => { if (Math.abs(a.length - b.length) > 1) return 9; const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  P.def('suslink', { run() {
    let last;
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest && e.target.closest('a[href]'); if (!a || a === last) return; last = a;
      const why = check(a); if (!why) return;
      const r = a.getBoundingClientRect(); P.ui.tip(r.left, r.bottom + 6, '<b style="color:#E0915F">⚠ Careful with this link</b><br>' + why.map(P.esc).join('<br>'), 5000);
    });
  }, check });
})();
