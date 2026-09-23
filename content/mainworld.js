/* Runs in the page's own JS world (not the isolated one) so it can see console errors (51, 52).
   It only counts and forwards errors to PRISM's isolated script via a DOM event. Nothing leaves the browser. */
(() => {
  if (window.__prismMain) return; window.__prismMain = true;
  const errs = [];
  const push = (kind, msg) => {
    errs.push({ kind, msg: String(msg).slice(0, 500), t: Date.now() }); if (errs.length > 50) errs.shift();
    document.dispatchEvent(new CustomEvent('prism:error', { detail: { n: errs.length, last: errs[errs.length - 1] } }));
  };
  const orig = console.error;
  console.error = function (...a) { try { push('console', a.map(x => x && x.stack ? x.stack : typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')); } catch (e) {} return orig.apply(this, a); };
  window.addEventListener('error', (e) => push('error', (e.message || 'Error') + (e.filename ? ' @ ' + e.filename + ':' + e.lineno : '')), true);
  window.addEventListener('unhandledrejection', (e) => push('promise', e.reason && e.reason.stack || e.reason));
  document.addEventListener('prism:errors?', () => document.dispatchEvent(new CustomEvent('prism:errors', { detail: JSON.stringify(errs) })));
})();
