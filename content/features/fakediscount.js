/* 121 Fake-discount / fake-urgency flagger: remembers "only N left" and countdown values per page; flags them when they reset on reload. */
(() => { const P = window.__prism;
  P.def('fakediscount', { run() {
    setTimeout(async () => {
      const text = P.text(); const now = Date.now();
      const left = (text.match(/only\s+(\d+)\s+(left|remaining)/i) || [])[1];
      const timer = (text.match(/(?:ends|offer ends|deal ends)\s+in\s+(\d{1,2}):(\d{2}):(\d{2})/i) || []);
      if (!left && !timer.length) return;
      const k = location.origin + location.pathname;
      const prev = (await PrismStore.get('urgency', {}))[k];
      const cur = { t: now, left: left ? +left : null, ends: timer.length ? now + ((+timer[1]) * 3600 + (+timer[2]) * 60 + (+timer[3])) * 1000 : null };
      const flags = [];
      if (prev) {
        if (prev.left != null && cur.left != null && cur.left === prev.left && now - prev.t > 6 * 3600e3) flags.push('"Only ' + cur.left + ' left" has not changed since ' + new Date(prev.t).toLocaleString());
        if (prev.ends && cur.ends && prev.ends < now) flags.push('The countdown already ran out on your last visit and restarted');
        else if (prev.ends && cur.ends && Math.abs(cur.ends - prev.ends) > 10 * 60000) flags.push('The countdown end time moved (' + new Date(prev.ends).toLocaleTimeString() + ' -> ' + new Date(cur.ends).toLocaleTimeString() + ')');
      }
      await PrismStore.update('urgency', {}, (m) => { m[k] = prev && prev.t && now - prev.t < 6 * 3600e3 ? prev : cur; });
      if (flags.length) { const c = P.ui.el('div', 'tip', '<b>⚑ Possible fake urgency</b><br>' + flags.map(P.esc).join('<br>')); c.style.right = '16px'; c.style.top = '16px'; P.ui.root().append(c); setTimeout(() => c.remove(), 12000); }
    }, 3000);
  } });
})();
