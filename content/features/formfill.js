/* 55 Form filler with fake-data profiles (Tools > Test data edits profiles). */
(() => { const P = window.__prism;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fake = () => { const f = pick(['Aarav', 'Diya', 'Rohan', 'Ananya', 'Vikram', 'Priya', 'Arjun', 'Sneha']), l = pick(['Sharma', 'Reddy', 'Iyer', 'Patel', 'Nair', 'Gupta', 'Rao']); const n = Math.floor(Math.random() * 9000 + 1000);
    return { first: f, last: l, name: f + ' ' + l, email: (f + '.' + l + n).toLowerCase() + '@example.com', phone: '9' + String(Math.floor(Math.random() * 1e9)).padStart(9, '0'), company: pick(['Acme QA Labs', 'Test Corp', 'Demo Pvt Ltd']), address: n + ' MG Road', city: pick(['Hyderabad', 'Bengaluru', 'Pune', 'Chennai']), state: 'Telangana', zip: '5000' + (n % 90 + 10), country: 'India', password: 'Test@' + n + 'x!', url: 'https://example.com', date: '1995-06-1' + (n % 9), number: String(n % 100), text: 'Automated test entry ' + n }; };
  const guess = (el) => { const s = [el.name, el.id, el.placeholder, el.getAttribute('aria-label'), el.autocomplete, el.labels && el.labels[0] && el.labels[0].innerText].join(' ').toLowerCase(); const t = (el.type || '').toLowerCase();
    if (t === 'email' || /e-?mail/.test(s)) return 'email'; if (t === 'tel' || /phone|mobile|tel/.test(s)) return 'phone'; if (t === 'password' || /pass/.test(s)) return 'password'; if (t === 'url' || /website|url|link/.test(s)) return 'url'; if (t === 'date' || /dob|birth|date/.test(s)) return 'date'; if (t === 'number' || /age|qty|quantity|years/.test(s)) return 'number';
    if (/first|given|fname/.test(s)) return 'first'; if (/last|surname|family|lname/.test(s)) return 'last'; if (/full.?name|^name|your name|\bname\b/.test(s)) return 'name'; if (/company|org/.test(s)) return 'company'; if (/zip|postal|pin/.test(s)) return 'zip'; if (/city|town/.test(s)) return 'city'; if (/state|region/.test(s)) return 'state'; if (/country/.test(s)) return 'country'; if (/address|street/.test(s)) return 'address'; return 'text'; };
  P.setVal = P.setVal || ((el, v) => { const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); });
  P.def('formfill', { actions: { async fill() {
    const profiles = await PrismStore.get('formProfiles', []); const d = Object.assign(fake(), profiles[0] ? profiles[0].data : {});
    let n = 0;
    document.querySelectorAll('input, textarea, select').forEach(el => {
      if (el.disabled || el.readOnly || el.type === 'hidden' || el.type === 'file' || el.type === 'submit' || el.type === 'button' || !el.offsetParent) return;
      if (el.type === 'checkbox') { if (!el.checked) el.click(); n++; return; }
      if (el.type === 'radio') { if (!document.querySelector('input[type=radio][name="' + CSS.escape(el.name) + '"]:checked')) { el.click(); n++; } return; }
      if (el.tagName === 'SELECT') { const opts = [...el.options].filter(o => o.value && !o.disabled); if (opts.length) { P.setVal(el, opts[Math.min(1, opts.length - 1)].value); n++; } return; }
      if (el.value) return;
      P.setVal(el, d[guess(el)] || d.text); n++;
    });
    P.ui.toast('Filled ' + n + ' fields with test data'); return n + ' fields filled';
  } } });
})();
