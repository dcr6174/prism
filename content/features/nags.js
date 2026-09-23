/* 86 Nag killer: hides Google One Tap, "open in app" banners, newsletter modals and chat bubbles. Unlocks page scroll. */
(() => { const P = window.__prism;
  P.def('nags', { early: true, run() {
    P.css('nags', `#credential_picker_container, #credential_picker_iframe, iframe[src*="accounts.google.com/gsi"], [id^="gsi_"], .smartbanner, #smartbanner, [class*="open-in-app" i], [class*="app-banner" i], [class*="AppBanner"], [id*="app-banner" i], .branch-banner-is-active #branch-banner-iframe, #branch-banner-iframe, [class*="newsletter-popup" i], [class*="newsletter-modal" i], [id*="newsletter-popup" i], .intercom-lightweight-app-launcher, #intercom-container, .drift-frame-controller, #hubspot-messages-iframe-container, iframe[title*="chat" i][style*="fixed"], .fb_dialog, #fb-root .fb_dialog_advanced { display: none !important; }`);
    P.ready(() => P.observe(() => {
      for (const el of document.querySelectorAll('[role=dialog], [class*="modal" i], [class*="popup" i]')) {
        const t = (el.innerText || '').toLowerCase(); if (t.length > 1200 || !el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        if (/(subscribe|newsletter|sign up for|get \d+% off|join our (mailing )?list|download (the|our) app|open in app)/.test(t) && !/(password|log ?in|checkout|payment)/.test(t)) { el.style.setProperty('display', 'none', 'important'); document.documentElement.style.overflow = ''; document.body.style.overflow = ''; }
      }
    }, 1200));
  } });
})();
