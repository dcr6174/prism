/* 141 Block read-tracking pixels in opened Gmail messages (known trackers + 1x1 images). Gmail proxies images, so this removes them before they load where possible. */
(() => { const P = window.__prism;
  const TRACK = /(mailtrack\.io|mailsuite|getnotify|bananatag|yesware|mixmax|streak\.com\/.*track|superhuman\.com\/.*px|hubspot.*\/e2t|track\.hubspot|sendgrid\.net\/wf\/open|list-manage\.com\/track\/open|mandrillapp\.com\/track\/open|mailchimp.*\/open|t\.sidekickopen|clicks\.mlsend|open\.convertkit|email\.mg\.|\/o\.gif|\/open\.gif|pixel\.gif|\/track\/open|\/beacon|mcsv\.net|sparkpostmail\.com\/q\/)/i;
  P.def('gmailtrack', { sites: ['mail.google.com'], run() {
    let n = 0;
    P.observe(() => {
      document.querySelectorAll('.a3s img:not([data-prism-trk])').forEach(img => {
        img.dataset.prismTrk = '1';
        const src = decodeURIComponent(img.getAttribute('src') || ''); const orig = src.split('#')[1] || src;
        const tiny = (img.getAttribute('width') === '1' || img.getAttribute('height') === '1' || (img.style.width === '1px'));
        if (TRACK.test(orig) || tiny) { img.removeAttribute('src'); img.remove(); n++; }
      });
      if (n) { const open = document.querySelector('h2.hP'); if (open && !document.getElementById('prism-trk')) { const t = document.createElement('span'); t.id = 'prism-trk'; t.textContent = ' 🛡 ' + n + ' tracker(s) blocked'; t.style.cssText = 'font-size:12px;color:#2F7D5B;font-weight:400'; open.append(t); } }
    }, 300);
  } });
})();
