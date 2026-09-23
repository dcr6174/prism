/* 60 Eyedropper: Chrome's native EyeDropper API; copies HEX and shows RGB/HSL. */
(() => { const P = window.__prism;
  P.def('eyedropper', { actions: { async pick() {
    if (!window.EyeDropper) { P.ui.toast('This Chrome has no EyeDropper'); return; }
    const btn = P.ui.panel('Eyedropper', '<p class="m">Chrome needs one click to start picking.</p><button class="pr">Pick a colour</button>', { id: 'eye' });
    btn.querySelector('button.pr').onclick = async () => {
      try {
        const { sRGBHex } = await new EyeDropper().open();
        const n = parseInt(sRGBHex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
        const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2, d = mx - mn; let h = 0, s = 0;
        if (d) { s = d / (1 - Math.abs(2 * l - 1)); const R = r / 255, G = g / 255, B = b / 255; h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4; h = Math.round(h * 60 + 360) % 360; }
        const vals = [sRGBHex.toUpperCase(), 'rgb(' + r + ', ' + g + ', ' + b + ')', 'hsl(' + h + ', ' + Math.round(s * 100) + '%, ' + Math.round(l * 100) + '%)'];
        btn.querySelector('.c').innerHTML = '<div style="height:60px;border-radius:12px;background:' + sRGBHex + '"></div>' + vals.map(v => '<pre style="cursor:pointer">' + v + '</pre>').join('') + '<button class="pr">Pick again</button>';
        btn.querySelectorAll('pre').forEach(p => p.onclick = () => P.copy(p.textContent));
        btn.querySelector('button.pr').onclick = () => { btn.remove(); this.pick(); };
        P.copy(vals[0], vals[0] + ' copied');
      } catch (e) {}
    };
  } } });
})();
