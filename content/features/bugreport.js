/* 51 Bug-report grabber: one clipboard-ready block with URL, browser, OS, viewport, time and console errors. */
(() => { const P = window.__prism;
  const errors = () => new Promise((res) => { const on = (e) => { document.removeEventListener('prism:errors', on); try { res(JSON.parse(e.detail)); } catch { res([]); } }; document.addEventListener('prism:errors', on); document.dispatchEvent(new CustomEvent('prism:errors?')); setTimeout(() => res(null), 300); });
  P.def('bugreport', { actions: { async copy() {
    const ua = navigator.userAgentData; let br = navigator.userAgent;
    if (ua && ua.getHighEntropyValues) { const v = await ua.getHighEntropyValues(['fullVersionList', 'platformVersion']); const c = (v.fullVersionList || []).find(b => /Chrome|Edge|Brave/.test(b.brand)); br = (c ? c.brand + ' ' + c.version : br) + ' on ' + ua.platform + ' ' + (v.platformVersion || ''); }
    const errs = await errors();
    const lines = ['**Environment**', '- URL: ' + location.href, '- Browser: ' + br, '- Viewport: ' + innerWidth + '×' + innerHeight + ' @' + devicePixelRatio + 'x (screen ' + screen.width + '×' + screen.height + ')', '- Time: ' + new Date().toString(), '- Language: ' + navigator.language, '',
      '**Steps to reproduce**', '1. ', '', '**Expected**', '', '**Actual**', '', '**Console errors**',
      errs === null ? '(PRISM needs site access on this site to capture console errors)' : errs.length ? errs.slice(-10).map(e => '- [' + e.kind + '] ' + e.msg.split('\n')[0]).join('\n') : '- none captured'];
    return P.copy(lines.join('\n'), 'Bug report copied');
  } } });
})();
