/* 83 Show-password eye on every password field. */
(() => { const P = window.__prism;
  P.def('showpass', { run() {
    P.observe(() => document.querySelectorAll('input[type=password]:not([data-prism-eye])').forEach(el => {
      el.dataset.prismEye = '1';
      const eye = document.createElement('span'); eye.textContent = '👁'; eye.title = 'Show / hide (PRISM)';
      eye.style.cssText = 'position:absolute;cursor:pointer;font-size:14px;opacity:.55;z-index:2147483000;user-select:none;line-height:1';
      const place = () => { const b = el.getBoundingClientRect(); if (!b.width) { eye.style.display = 'none'; return; } eye.style.display = ''; eye.style.left = (b.right + scrollX - 24) + 'px'; eye.style.top = (b.top + scrollY + b.height / 2 - 8) + 'px'; };
      eye.onmousedown = (e) => { e.preventDefault(); el.type = el.type === 'password' ? 'text' : 'password'; eye.style.opacity = el.type === 'text' ? '1' : '.55'; };
      document.body.append(eye); place(); addEventListener('resize', place); addEventListener('scroll', place, { passive: true }); setInterval(place, 1500);
    }), 800);
  } });
})();
