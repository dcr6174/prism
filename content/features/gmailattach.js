/* 143 "Forgot attachment?": when the email says attached/attachment/PFA but nothing is attached, asks before sending. */
(() => { const P = window.__prism;
  P.def('gmailattach', { sites: ['mail.google.com'], run() {
    document.addEventListener('click', (e) => {
      const send = e.target.closest && e.target.closest('div[role=button][data-tooltip^="Send"], div[role=button][aria-label^="Send"]'); if (!send) return;
      const dlg = send.closest('.M9, .AD, [role=dialog], .iN') || document; const body = dlg.querySelector('div[aria-label="Message Body"], div[contenteditable=true][role=textbox]'); if (!body) return;
      const mine = (body.innerText || '').split(/\nOn .+wrote:|\n-{2,} ?Forwarded/)[0];
      if (!/\b(attached|attachment|attaching|pfa|please find (the )?attached|enclosed|my (cv|resume))\b/i.test(mine)) return;
      if (dlg.querySelector('.dL, .aQH [download_url], input[name=attach], .aZo, .GM')) return;
      if (!confirm('PRISM: your email mentions an attachment, but nothing is attached. Send anyway?')) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
  } });
})();
