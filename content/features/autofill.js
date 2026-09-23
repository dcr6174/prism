/* 68 Application autofill from your saved profile (Options > Application autofill). Never submits. */
(() => { const P = window.__prism;
  const MAP = [['email', /e-?mail/], ['phone', /phone|mobile|contact.?(no|number)|tel/], ['linkedin', /linkedin/], ['github', /github|portfolio|website/], ['experience', /experience|years|yoe|exp\b/], ['notice', /notice/], ['city', /city|location|current.?loc/], ['first', /first.?name|given/], ['last', /last.?name|surname|family/], ['name', /full.?name|^name$|your.?name|candidate.?name|\bname\b/], ['ctc', /current.?ctc|current.?salary/], ['ectc', /expected.?ctc|expected.?salary/]];
  P.def('autofill', { actions: { fill() {
    const prof = Object.fromEntries(P.U.pairs(P.cfg('autofill').profile).map(([k, v]) => [k.toLowerCase(), v]));
    if (prof.name && !prof.first) { const [f, ...l] = prof.name.split(' '); prof.first = f; prof.last = l.join(' '); }
    let n = 0;
    document.querySelectorAll('input:not([type=hidden]):not([type=file]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea').forEach(el => {
      if (el.value || el.disabled || el.readOnly || !el.offsetParent) return;
      const s = [el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.autocomplete, el.labels && el.labels[0] && el.labels[0].innerText, el.closest('div') && el.closest('div').querySelector('label') && el.closest('div').querySelector('label').innerText].join(' ').toLowerCase();
      const hit = MAP.find(([k, re]) => re.test(s) && prof[k]); if (!hit) return;
      el.focus(); (P.setVal || ((e, v) => { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }))(el, prof[hit[0]]); el.style.boxShadow = '0 0 0 2px rgba(79,91,213,.5)'; n++;
    });
    P.ui.toast(n ? 'Filled ' + n + ' fields. Check them, then submit yourself.' : 'No matching fields found'); return n + ' filled';
  } } });
})();
