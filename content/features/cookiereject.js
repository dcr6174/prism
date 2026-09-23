/* 84 Cookie-banner auto-reject: clicks "Reject all" / "Only necessary" on common consent platforms and generic banners. */
(() => { const P = window.__prism;
  const KNOWN = ['#onetrust-reject-all-handler', '.ot-pc-refuse-all-handler', '#CybotCookiebotDialogBodyButtonDecline', '#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll', '.didomi-continue-without-agreeing', '#didomi-notice-disagree-button', '.qc-cmp2-summary-buttons button[mode="secondary"]', '#truste-consent-required', '.truste-button2', '[data-testid="uc-deny-all-button"]', '.cmpboxbtnno', '.fc-cta-do-not-consent', '#tarteaucitronAllDenied2', '.cky-btn-reject', '#wt-cli-reject-btn', '.cc-deny', '.iubenda-cs-reject-btn', '[data-cookiefirst-action="reject"]', '.osano-cm-denyAll', '#hs-eu-decline-button', '.js-cookie-decline', 'button[data-gdpr-reject]'];
  const WORDS = /^(reject( all)?( cookies)?|decline( all)?|deny( all)?|refuse( all)?|only (necessary|essential|required)( cookies)?|use necessary cookies only|necessary cookies only|continue without accepting|disagree|do not accept|alle ablehnen|ablehnen|tout refuser|rifiuta tutto|rechazar todo)$/i;
  P.def('cookiereject', { run() {
    let tries = 0;
    const attempt = () => {
      if (tries++ > 20) return;
      for (const s of KNOWN) { const b = document.querySelector(s); if (b && b.offsetParent !== null) { b.click(); P.ui.toast('Cookies rejected', 1500); return true; } }
      const banners = [...document.querySelectorAll('[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i], [aria-label*="cookie" i], [role=dialog], [class*="gdpr" i]')].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed');
      for (const bn of banners) { const b = [...bn.querySelectorAll('button, a[role=button], [role=button], input[type=button]')].find(x => WORDS.test((x.innerText || x.value || '').trim())); if (b) { b.click(); P.ui.toast('Cookies rejected', 1500); return true; } }
    };
    if (!attempt()) { const iv = setInterval(() => { if (attempt() || tries > 20) clearInterval(iv); }, 700); }
  } });
})();
