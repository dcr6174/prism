/* 81 Autocomplete fixer: turns browser autofill back on where sites set autocomplete=off (not on passwords/OTP). */
(() => { const P = window.__prism;
  P.def('autocompletefix', { run() {
    P.observe(() => document.querySelectorAll('[autocomplete=off], [autocomplete=false], [autocomplete=nope]').forEach(el => { if (/otp|one-time|captcha|cvv|cvc/i.test((el.name || '') + (el.id || ''))) return; if (el.tagName === 'FORM') el.removeAttribute('autocomplete'); else if (el.type !== 'password') el.setAttribute('autocomplete', 'on'); }), 1000);
  } });
})();
