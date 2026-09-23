/* 82 Smart date picker: focus a date field and type "next fri", "tomorrow", "+10d", "12/10", "25 dec", "2026-03-01", then Enter. */
(() => { const P = window.__prism;
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  P.parseDate = (s) => {
    s = s.toLowerCase().trim(); const d = new Date(); d.setHours(12, 0, 0, 0); let m;
    if (s === 'today') return d; if (s === 'tomorrow' || s === 'tmr') { d.setDate(d.getDate() + 1); return d; } if (s === 'yesterday') { d.setDate(d.getDate() - 1); return d; }
    if ((m = s.match(/^([+-]\d+)\s*(d|w|m|y)/))) { const n = +m[1]; if (m[2] === 'd') d.setDate(d.getDate() + n); if (m[2] === 'w') d.setDate(d.getDate() + 7 * n); if (m[2] === 'm') d.setMonth(d.getMonth() + n); if (m[2] === 'y') d.setFullYear(d.getFullYear() + n); return d; }
    if ((m = s.match(/^(next |this )?(sun|mon|tue|wed|thu|fri|sat)/))) { const t = DAYS.indexOf(m[2]); let diff = (t - d.getDay() + 7) % 7; if (diff === 0 || m[1] === 'next ') diff = diff === 0 ? 7 : diff + (m[1] === 'next ' && diff < 7 ? 0 : 0); d.setDate(d.getDate() + diff); return d; }
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) return new Date(+m[1], m[2] - 1, +m[3], 12);
    if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/))) { const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : d.getFullYear(); return new Date(y, m[2] - 1, +m[1], 12); } // Indian order: dd/mm
    if ((m = s.match(/^(\d{1,2})\s*([a-z]{3})[a-z]*\s*(\d{4})?$/)) && MON.includes(m[2])) return new Date(m[3] ? +m[3] : d.getFullYear(), MON.indexOf(m[2]), +m[1], 12);
    if ((m = s.match(/^([a-z]{3})[a-z]*\s*(\d{1,2})(?:,?\s*(\d{4}))?$/)) && MON.includes(m[1])) return new Date(m[3] ? +m[3] : d.getFullYear(), MON.indexOf(m[1]), +m[2], 12);
    return null;
  };
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  P.def('datepicker', { run() {
    document.addEventListener('focusin', (e) => {
      const el = e.target; if (!(el.tagName === 'INPUT' && (el.type === 'date' || /date|dob/i.test(el.name + el.id + el.placeholder)))) return;
      const b = el.getBoundingClientRect();
      const tip = P.ui.tip(b.left, b.bottom + 6, '<b>Type a date</b> <span class="m">next fri · tomorrow · +10d · 25/12 · 25 dec</span><br><input style="margin-top:6px;width:100%;border:0;border-radius:8px;padding:6px 8px">');
      const inp = tip.querySelector('input');
      inp.onkeydown = (k) => { if (k.key === 'Enter') { const d = P.parseDate(inp.value); if (!d) { inp.style.outline = '2px solid #E0915F'; return; } const v = el.type === 'date' ? iso(d) : d.toLocaleDateString('en-GB'); (P.setVal || ((a, x) => { a.value = x; a.dispatchEvent(new Event('input', { bubbles: true })); }))(el, v); el.dispatchEvent(new Event('change', { bubbles: true })); tip.remove(); P.ui.toast(d.toDateString()); } if (k.key === 'Escape') tip.remove(); };
      el.addEventListener('blur', () => setTimeout(() => { if (!tip.matches(':focus-within')) tip.remove(); }, 250), { once: true });
    }, true);
  } });
})();
