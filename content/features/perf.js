/* 63 Performance snapshot from the Navigation Timing + Resource Timing APIs. */
(() => { const P = window.__prism;
  P.def('perf', { actions: { show() {
    const n = performance.getEntriesByType('navigation')[0] || {}; const res = performance.getEntriesByType('resource');
    const kb = (b) => (b / 1024).toFixed(0) + ' KB'; const ms = (x) => Math.round(x) + ' ms';
    const paint = Object.fromEntries(performance.getEntriesByType('paint').map(p => [p.name, p.startTime]));
    const lcp = performance.getEntriesByType('largest-contentful-paint').pop();
    const by = {}; res.forEach(r => { by[r.initiatorType] = by[r.initiatorType] || [0, 0]; by[r.initiatorType][0]++; by[r.initiatorType][1] += r.transferSize || 0; });
    const rows = [['DNS', ms(n.domainLookupEnd - n.domainLookupStart)], ['Connect', ms(n.connectEnd - n.connectStart)], ['TTFB', ms(n.responseStart - n.requestStart)], ['DOM ready', ms(n.domContentLoadedEventEnd)], ['Load', ms(n.loadEventEnd)], ['First paint', paint['first-paint'] ? ms(paint['first-paint']) : '-'], ['First contentful paint', paint['first-contentful-paint'] ? ms(paint['first-contentful-paint']) : '-'], ['LCP (if buffered)', lcp ? ms(lcp.startTime) : '-'], ['HTML size', kb(n.transferSize || 0)], ['Requests', res.length], ['Total transferred', kb(res.reduce((a, r) => a + (r.transferSize || 0), 0) + (n.transferSize || 0))], ['DOM nodes', document.getElementsByTagName('*').length]];
    const slow = res.slice().sort((a, b) => b.duration - a.duration).slice(0, 5);
    const text = rows.map(r => r.join(': ')).join('\n');
    const p = P.ui.panel('Performance', '<table>' + rows.map(r => '<tr><td>' + r[0] + '</td><td><b>' + r[1] + '</b></td></tr>').join('') + '</table><p class="m">By type: ' + Object.entries(by).map(([k, v]) => k + ' ' + v[0] + ' (' + kb(v[1]) + ')').join(', ') + '</p><p class="m">Slowest</p><table>' + slow.map(r => '<tr><td>' + ms(r.duration) + '</td><td style="word-break:break-all">' + P.esc(r.name.slice(0, 120)) + '</td></tr>').join('') + '</table><button class="pr">Copy</button>', { id: 'perf' });
    p.querySelector('button.pr').onclick = () => P.copy(location.href + '\n' + text);
  } } });
})();
