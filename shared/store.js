/* Settings + data helpers shared by every PRISM context. Everything lives in chrome.storage.local. */
(function (g) {
  const S = {};
  const K = 'settings';
  S.defaults = () => {
    const on = {}, cfg = {};
    for (const f of g.PRISM_FEATURES) {
      on[f.id] = f.on;
      cfg[f.id] = {};
      for (const c of f.cfg) cfg[f.id][c.k] = Array.isArray(c.def) ? c.def.slice() : c.def;
    }
    return { on, cfg, theme: 'auto' };
  };
  S.merge = (saved) => {
    const d = S.defaults();
    if (!saved) return d;
    Object.assign(d.on, saved.on || {});
    for (const id in saved.cfg || {}) d.cfg[id] = Object.assign(d.cfg[id] || {}, saved.cfg[id]);
    if (saved.theme) d.theme = saved.theme;
    return d;
  };
  S.load = async () => S.merge((await chrome.storage.local.get(K))[K]);
  S.save = (s) => chrome.storage.local.set({ [K]: s });
  S.patch = async (fn) => { const s = await S.load(); fn(s); await S.save(s); return s; };
  S.get = async (key, def) => { const r = await chrome.storage.local.get(key); return r[key] === undefined ? def : r[key]; };
  S.set = (key, val) => chrome.storage.local.set({ [key]: val });
  S.update = async (key, def, fn) => { const v = await S.get(key, def); const n = fn(v); await S.set(key, n === undefined ? v : n); return n === undefined ? v : n; };
  S.onChange = (fn) => chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local') fn(ch); });

  /* small utilities */
  const U = {};
  U.host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };
  U.siteMatch = (host, site) => { site = String(site).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); return !!site && (host === site || host.endsWith('.' + site)); };
  U.anySite = (host, list) => (list || []).some(s => U.siteMatch(host, s));
  U.pairs = (list) => (list || []).map(l => { const i = String(l).indexOf('='); return i < 0 ? null : [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }).filter(Boolean);
  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  U.today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  U.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  U.fmtMin = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? m + 'm' : Math.floor(m / 60) + 'h ' + (m % 60) + 'm'; };
  U.cleanUrl = (u) => {
    try {
      const url = new URL(u);
      const bad = /^(utm_|mc_|pk_|hsa_|vero_|oly_|_hs)|^(fbclid|gclid|dclid|gbraid|wbraid|msclkid|yclid|igshid|si|ref_src|ref_url|_ga|_gl|mkt_tok|spm|scm|trk|trkCampaign|cmpid|s_kwcid|ncid|sr_share|feature|pp)$/i;
      for (const k of [...url.searchParams.keys()]) if (bad.test(k)) url.searchParams.delete(k);
      if (/amazon\./.test(url.hostname)) { const m = url.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/); if (m) return url.origin + '/dp/' + m[2]; }
      return url.toString().replace(/\?$/, '');
    } catch { return u; }
  };
  /* lakh/crore <-> million */
  U.indian = (n) => {
    if (!isFinite(n)) return '';
    const cr = n / 1e7, lk = n / 1e5, mn = n / 1e6;
    const parts = [];
    if (Math.abs(cr) >= 1) parts.push(+cr.toFixed(2) + ' crore'); else if (Math.abs(lk) >= 1) parts.push(+lk.toFixed(2) + ' lakh');
    parts.push(Math.abs(mn) >= 1 ? +mn.toFixed(2) + ' million' : Math.round(n).toLocaleString('en-US'));
    parts.push(Math.round(n).toLocaleString('en-IN'));
    return parts.join(' = ');
  };
  U.parseAmount = (s) => {
    s = String(s).toLowerCase().replace(/[,₹$\s]|rs\.?|inr/g, ' ').trim();
    const m = s.match(/(-?\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|l|million|mn|m|billion|bn|k|thousand)?/);
    if (!m) return NaN;
    const mul = { crore: 1e7, cr: 1e7, lakh: 1e5, lac: 1e5, l: 1e5, million: 1e6, mn: 1e6, m: 1e6, billion: 1e9, bn: 1e9, k: 1e3, thousand: 1e3 }[m[2]] || 1;
    return parseFloat(m[1]) * mul;
  };
  /* safe calculator: numbers, + - * / % ^ ( ) and lakh/crore words */
  U.calc = (expr) => {
    let e = String(expr).toLowerCase().replace(/^=/, '').replace(/,/g, '').trim();
    if (!e || !/\d/.test(e)) return null;
    e = e.replace(/(\d+(?:\.\d+)?)\s*(crore|cr|lakh|lac|million|mn|billion|bn|k)\b/g, (_, n, u) => '(' + n + '*' + ({ crore: 1e7, cr: 1e7, lakh: 1e5, lac: 1e5, million: 1e6, mn: 1e6, billion: 1e9, bn: 1e9, k: 1e3 })[u] + ')');
    e = e.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)').replace(/\^/g, '**').replace(/x/g, '*');
    if (!/^[\d+\-*/().\s]+$/.test(e)) return null;
    // tiny recursive-descent parser (no eval: extension pages forbid it anyway)
    let i = 0; const s = e.replace(/\s+/g, '');
    const num = () => { const m = s.slice(i).match(/^\d+(\.\d+)?/); if (!m) throw 0; i += m[0].length; return parseFloat(m[0]); };
    const atom = () => { if (s[i] === '(') { i++; const v = add(); if (s[i] !== ')') throw 0; i++; return v; } if (s[i] === '-') { i++; return -atom(); } if (s[i] === '+') { i++; return atom(); } return num(); };
    const pow = () => { let v = atom(); if (s.slice(i, i + 2) === '**') { i += 2; v = Math.pow(v, pow()); } return v; };
    const mul = () => { let v = pow(); while (s[i] === '*' || s[i] === '/') { const o = s[i++]; const r = pow(); v = o === '*' ? v * r : v / r; } return v; };
    const add = () => { let v = mul(); while (s[i] === '+' || s[i] === '-') { const o = s[i++]; const r = mul(); v = o === '+' ? v + r : v - r; } return v; };
    try { const v = add(); if (i !== s.length || !isFinite(v)) return null; return v; } catch { return null; }
  };
  g.PrismStore = S; g.PrismU = U;
})(typeof globalThis !== 'undefined' ? globalThis : self);
