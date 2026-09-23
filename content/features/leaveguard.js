/* 79 Leave-page guard: Chrome asks before closing a tab that has unsent text you typed. */
(() => { const P = window.__prism;
  P.def('leaveguard', { run() {
    let dirty = false;
    document.addEventListener('input', (e) => { const el = e.target; if (P.editable(el) && el.type !== 'password' && el.type !== 'search' && ((el.value || el.innerText || '').trim().length > 20)) dirty = true; }, true);
    document.addEventListener('submit', () => dirty = false, true);
    document.addEventListener('click', (e) => { if (e.target.closest('button[type=submit], [aria-label*="Send" i], [data-testid*="send" i]')) dirty = false; }, true);
    window.addEventListener('beforeunload', (e) => { if (!dirty) return; const still = [...document.querySelectorAll('textarea, input[type=text], [contenteditable=true]')].some(el => (el.value || el.innerText || '').trim().length > 20); if (still) { e.preventDefault(); e.returnValue = ''; } });
  } });
})();
