/* 142 Unsubscribe surfacer: puts the newsletter's unsubscribe link in a chip above the message. */
(() => { const P = window.__prism;
  P.def('gmailunsub', { sites: ['mail.google.com'], run() {
    P.observe(() => {
      const body = document.querySelector('.a3s'); const head = document.querySelector('h2.hP'); if (!body || !head || document.getElementById('prism-unsub')) return;
      const a = [...body.querySelectorAll('a[href]')].reverse().find(x => /unsubscribe|opt[\s-]?out|manage (your )?(email )?preferences|unsub/i.test(x.innerText + ' ' + x.href));
      if (!a) return;
      const b = document.createElement('a'); b.id = 'prism-unsub'; b.href = a.href; b.target = '_blank'; b.rel = 'noopener'; b.textContent = 'Unsubscribe';
      b.style.cssText = 'margin-left:10px;font-size:12px;padding:3px 10px;border-radius:999px;background:rgba(79,91,213,.12);color:#4F5BD5;text-decoration:none;vertical-align:middle';
      head.append(b);
    }, 800);
  } });
})();
