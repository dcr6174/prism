/* 78 Form-text recovery: autosaves what you type (not passwords/cards) per page for 7 days; restore from the palette or the chip. */
(() => { const P = window.__prism;
  const K = () => 'form:' + location.origin + location.pathname;
  const id = (el) => el.name || el.id || el.getAttribute('aria-label') || el.placeholder || (el.isContentEditable ? 'editable' : el.tagName) + ':' + [...document.querySelectorAll(el.tagName)].indexOf(el);
  const skip = (el) => el.type === 'password' || /card|cvv|cvc|otp|pin|ssn|aadhaar|pan|account/i.test((el.name || '') + (el.id || '') + (el.autocomplete || ''));
  P.def('formrecover', {
    async run() {
      let t;
      document.addEventListener('input', (e) => {
        const el = e.target; if (!P.editable(el) || skip(el) || el.tagName === 'SELECT') return;
        const v = el.isContentEditable ? el.innerText : el.value; if (!v || v.length < 8) return;
        clearTimeout(t); t = setTimeout(() => PrismStore.update(K(), {}, (m) => { m[id(el)] = { v: v.slice(0, 50000), t: Date.now() }; }), 600);
      }, true);
      document.addEventListener('submit', () => chrome.storage.local.remove(K()), true);
      const saved = await PrismStore.get(K(), null);
      if (saved && Object.values(saved).some(x => Date.now() - x.t < 7 * 864e5)) {
        const chip = P.ui.el('div', 'b', '<button data-a="r">Restore typed text</button><button data-a="x">×</button>'); chip.style.left = '16px'; chip.style.bottom = '16px';
        chip.onclick = (e) => { if (e.target.dataset.a === 'r') this.actions.restore(); chip.remove(); if (e.target.dataset.a === 'x') chrome.storage.local.remove(K()); };
        P.ui.root().append(chip); setTimeout(() => chip.remove(), 15000);
      }
    },
    actions: { async restore() {
      const saved = await PrismStore.get(K(), null); if (!saved) { P.ui.toast('Nothing saved for this page'); return; }
      let n = 0; const left = [];
      for (const [k, x] of Object.entries(saved)) {
        const el = [...document.querySelectorAll('input, textarea, [contenteditable=true]')].find(e => id(e) === k);
        if (el && !(el.value || el.innerText || '').trim()) { el.focus(); if (el.isContentEditable) document.execCommand('insertText', false, x.v); else (P.setVal || ((a, b) => { a.value = b; a.dispatchEvent(new Event('input', { bubbles: true })); }))(el, x.v); n++; } else left.push(x.v);
      }
      if (left.length) { const p = P.ui.panel('Saved text', '<p class="m">These could not be put back automatically. Copy them:</p>' + left.map(() => '<pre style="cursor:pointer"></pre>').join(''), { id: 'fr' }); p.querySelectorAll('pre').forEach((pr, i) => { pr.textContent = left[i]; pr.onclick = () => P.copy(left[i]); }); }
      P.ui.toast('Restored ' + n + ' field(s)'); return n + ' restored';
    } },
  });
})();
