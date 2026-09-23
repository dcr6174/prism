/* Media tools: annotate, PDF (merge/split/rotate/sign/images), image compress, recorder, replay buffer, GIF. All local. */
(function () {
  const { h, toast, download } = UI; const { sec, card, empty, dropZone, kb } = T;
  const btn = (label, fn, cls) => h('button', { class: 'btn small ' + (cls || ''), onclick: fn }, label);
  const PDF = () => self.PDFLib;
  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const fileUrl = (f) => URL.createObjectURL(f);
  const stamp = () => new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');

  /* ---------------- Annotate ---------------- */
  sec('annotate', { group: 'Capture', title: 'Annotate', sub: 'Your last screenshot. Draw, arrow, box, blur, text. Or drop any image.', feature: 'annotate', async render(b) {
    const cv = h('canvas', { class: 'stage' }); const ctx = cv.getContext('2d'); let tool = 'arrow', color = '#E5484D', hist = [];
    const load = async (src) => { const i = await loadImg(src); cv.width = i.naturalWidth; cv.height = i.naturalHeight; ctx.drawImage(i, 0, 0); hist = [ctx.getImageData(0, 0, cv.width, cv.height)]; };
    const last = await PrismStore.get('shot:last', null);
    const tools = h('div', { class: 'row wrap' }, ['arrow', 'box', 'pen', 'blur', 'text'].map(t => h('button', { class: 'btn small' + (t === tool ? ' primary' : ''), 'data-t': t, onclick: (e) => { tool = t; tools.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('primary', x.dataset.t === t)); } }, t)),
      h('input', { type: 'color', value: color, style: 'width:40px;padding:0;height:30px', oninput: e => color = e.target.value }),
      btn('Undo', () => { if (hist.length > 1) { hist.pop(); ctx.putImageData(hist[hist.length - 1], 0, 0); } }),
      btn('Copy', async () => { cv.toBlob(async bl => { await navigator.clipboard.write([new ClipboardItem({ 'image/png': bl })]); toast('Image copied'); }); }),
      btn('Download PNG', () => cv.toBlob(bl => download(bl, 'prism-' + stamp() + '.png')), 'primary'));
    b.append(card(tools, h('div', { class: 'gap' }), dropZone('Drop or choose an image', 'image/*', false, (f) => load(fileUrl(f[0]))), h('div', { class: 'gap' }), cv));
    if (last) { await load(last.data); b.querySelector('.drop').style.display = 'none'; } else if (!cv.width) cv.style.display = 'none';
    b.querySelector('.drop input').addEventListener('change', () => { cv.style.display = ''; });
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; };
    let start = null, base = null; const lw = () => Math.max(3, cv.width / 300);
    cv.onpointerdown = (e) => { start = pos(e); base = ctx.getImageData(0, 0, cv.width, cv.height); cv.setPointerCapture(e.pointerId);
      if (tool === 'text') { const t = prompt('Text'); if (t) { ctx.fillStyle = color; ctx.font = '600 ' + Math.round(lw() * 7) + 'px Inter, system-ui'; ctx.fillText(t, start[0], start[1]); hist.push(ctx.getImageData(0, 0, cv.width, cv.height)); } start = null; }
      if (tool === 'pen') { ctx.beginPath(); ctx.moveTo(...start); } };
    cv.onpointermove = (e) => { if (!start) return; const p = pos(e); ctx.strokeStyle = color; ctx.lineWidth = lw(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (tool === 'pen') { ctx.lineTo(...p); ctx.stroke(); return; }
      ctx.putImageData(base, 0, 0); const [x, y] = start, w = p[0] - x, hh = p[1] - y;
      if (tool === 'box') { ctx.strokeRect(x, y, w, hh); }
      if (tool === 'blur') { ctx.save(); ctx.strokeStyle = '#888'; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.strokeRect(x, y, w, hh); ctx.restore(); }
      if (tool === 'arrow') { const a = Math.atan2(hh, w), L = lw() * 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(...p); ctx.stroke(); ctx.beginPath(); ctx.moveTo(...p); ctx.lineTo(p[0] - L * Math.cos(a - 0.45), p[1] - L * Math.sin(a - 0.45)); ctx.moveTo(...p); ctx.lineTo(p[0] - L * Math.cos(a + 0.45), p[1] - L * Math.sin(a + 0.45)); ctx.stroke(); } };
    cv.onpointerup = (e) => { if (!start) return; const p = pos(e);
      if (tool === 'blur') { ctx.putImageData(base, 0, 0); const x = Math.min(start[0], p[0]), y = Math.min(start[1], p[1]), w = Math.abs(p[0] - start[0]), hh = Math.abs(p[1] - start[1]); if (w > 2 && hh > 2) { const s = Math.max(6, Math.round(Math.min(w, hh) / 8)); const tmp = document.createElement('canvas'); tmp.width = Math.max(1, Math.round(w / s)); tmp.height = Math.max(1, Math.round(hh / s)); tmp.getContext('2d').drawImage(cv, x, y, w, hh, 0, 0, tmp.width, tmp.height); ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, x, y, w, hh); ctx.imageSmoothingEnabled = true; } }
      start = null; hist.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (hist.length > 30) hist.splice(1, 1); };
  } });

  /* ---------------- PDF ---------------- */
  sec('pdf', { group: 'Files', title: 'PDF tools', sub: 'Merge, pick pages, rotate. Runs on this computer; nothing is uploaded.', feature: 'pdftools', async render(b) {
    let files = []; const ul = h('ul', { class: 'list' });
    const draw = () => { ul.innerHTML = ''; files.forEach((f, i) => ul.append(h('li', {}, h('span', { class: 'pill' }, f.pages + ' p'), h('span', { class: 'grow ell' }, f.file.name), btn('↑', () => { if (i) { [files[i - 1], files[i]] = [files[i], files[i - 1]]; draw(); } }, 'ghost'), btn('×', () => { files.splice(i, 1); draw(); }, 'ghost')))); };
    const pagesIn = h('input', { placeholder: 'Pages to keep, e.g. 1-3, 5 (blank = all)' }); const rot = h('select', { style: 'width:auto' }, h('option', { value: 0 }, 'No rotation'), h('option', { value: 90 }, 'Rotate 90°'), h('option', { value: 180 }, 'Rotate 180°'), h('option', { value: 270 }, 'Rotate 270°'));
    const parse = (s, n) => { if (!s.trim()) return [...Array(n).keys()]; const out = []; for (const part of s.split(',')) { const [a, c] = part.split('-').map(x => parseInt(x)); if (!a) continue; for (let p = a; p <= (c || a); p++) if (p >= 1 && p <= n) out.push(p - 1); } return out; };
    b.append(card(dropZone('Drop PDFs here (in order)', 'application/pdf', true, async (fs) => { for (const f of fs) { try { const d = await PDF().PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true }); files.push({ file: f, doc: d, pages: d.getPageCount() }); } catch (e) { toast(f.name + ': cannot read (' + e.message + ')'); } } draw(); }), ul,
      h('div', { class: 'gap' }), h('div', { class: 'row' }, pagesIn, rot), h('p', { class: 'muted small' }, 'Page numbers apply to the combined file.'),
      h('div', { class: 'row' }, btn('Make PDF', async () => { if (!files.length) return toast('Add a PDF first'); const out = await PDF().PDFDocument.create(); for (const f of files) { const ps = await out.copyPages(f.doc, f.doc.getPageIndices()); ps.forEach(p => out.addPage(p)); }
        const keep = parse(pagesIn.value, out.getPageCount()); const fin = await PDF().PDFDocument.create(); const ps = await fin.copyPages(out, keep); ps.forEach(p => { if (+rot.value) p.setRotation(PDF().degrees((p.getRotation().angle + +rot.value) % 360)); fin.addPage(p); });
        const bytes = await fin.save(); download(new Blob([bytes], { type: 'application/pdf' }), 'prism-' + stamp() + '.pdf'); toast(fin.getPageCount() + ' pages, ' + kb(bytes.length)); }, 'primary'))));
  } });
  sec('sign', { group: 'Files', title: 'Fill and sign PDF', sub: 'Fill form fields, then draw or type a signature and place it. Nothing is uploaded.', feature: 'pdfsign', async render(b) {
    let doc = null, name = ''; const fields = h('div'); const place = h('div');
    const sig = h('canvas', { width: 500, height: 160, class: 'stage', style: 'background:#fff;width:100%;max-width:500px' }); const sx = sig.getContext('2d'); sx.lineWidth = 2.4; sx.lineCap = 'round'; sx.strokeStyle = '#1a2a6c';
    let drawing = false; const sp = (e) => { const r = sig.getBoundingClientRect(); return [(e.clientX - r.left) * 500 / r.width, (e.clientY - r.top) * 160 / r.height]; };
    sig.onpointerdown = (e) => { drawing = true; sig.setPointerCapture(e.pointerId); sx.beginPath(); sx.moveTo(...sp(e)); }; sig.onpointermove = (e) => { if (drawing) { sx.lineTo(...sp(e)); sx.stroke(); } }; sig.onpointerup = () => drawing = false;
    const typed = h('input', { placeholder: 'Or type your name for a typed signature' });
    typed.oninput = () => { sx.clearRect(0, 0, 500, 160); sx.fillStyle = '#1a2a6c'; sx.font = 'italic 54px "Segoe Script", "Brush Script MT", cursive'; sx.fillText(typed.value, 20, 100); };
    const pg = h('input', { type: 'number', value: 1, min: 1, style: 'width:90px' }), xIn = h('input', { type: 'number', value: 60, style: 'width:90px' }), yIn = h('input', { type: 'number', value: 60, style: 'width:90px' }), wIn = h('input', { type: 'number', value: 160, style: 'width:90px' });
    b.append(card(dropZone('Drop a PDF', 'application/pdf', false, async (fs) => { name = fs[0].name; doc = await PDF().PDFDocument.load(await fs[0].arrayBuffer(), { ignoreEncryption: true }); fields.innerHTML = ''; let fl = []; try { fl = doc.getForm().getFields(); } catch (e) {}
      fields.append(h('p', { class: 'muted' }, name + ' · ' + doc.getPageCount() + ' pages · ' + fl.length + ' form fields'));
      for (const f of fl) { const t = f.constructor.name; if (/Text/.test(t)) fields.append(h('label', { class: 'stack' }, h('span', { class: 'small muted' }, f.getName()), h('input', { value: f.getText() || '', oninput: e => f.setText(e.target.value) }))); else if (/CheckBox/.test(t)) fields.append(h('label', { class: 'row' }, h('input', { type: 'checkbox', style: 'width:auto', checked: f.isChecked(), onchange: e => e.target.checked ? f.check() : f.uncheck() }), f.getName())); else if (/Dropdown|OptionList/.test(t)) fields.append(h('label', { class: 'stack' }, h('span', { class: 'small muted' }, f.getName()), h('select', { onchange: e => f.select(e.target.value) }, f.getOptions().map(o => h('option', {}, o))))); } }), fields));
    b.append(card(h('div', { class: 'row' }, h('h3', { class: 'grow' }, 'Signature'), btn('Clear', () => { sx.clearRect(0, 0, 500, 160); typed.value = ''; })), h('div', { class: 'gap' }), sig, h('div', { class: 'gap' }), typed,
      h('div', { class: 'gap' }), h('div', { class: 'row wrap' }, h('span', {}, 'Page'), pg, h('span', {}, 'From left (pt)'), xIn, h('span', {}, 'From bottom (pt)'), yIn, h('span', {}, 'Width'), wIn), h('p', { class: 'muted small' }, 'A4 is 595 × 842 points. Bottom-right corner is about left 380, bottom 60.'),
      h('div', { class: 'row' }, btn('Save signed PDF', async () => { if (!doc) return toast('Add a PDF first'); const blank = !sx.getImageData(0, 0, 500, 160).data.some((v, i) => i % 4 === 3 && v);
        if (!blank) { const png = await doc.embedPng(sig.toDataURL('image/png')); const page = doc.getPage(Math.min(doc.getPageCount(), Math.max(1, +pg.value)) - 1); const w = +wIn.value || 160; page.drawImage(png, { x: +xIn.value, y: +yIn.value, width: w, height: w * 160 / 500 }); }
        try { doc.getForm().updateFieldAppearances(); } catch (e) {} const bytes = await doc.save(); download(new Blob([bytes], { type: 'application/pdf' }), name.replace(/\.pdf$/i, '') + '-signed.pdf'); }, 'primary'))));
  } });
  sec('img2pdf', { group: 'Files', title: 'Images to PDF', sub: 'Photos or scans into one PDF, one image per page.', feature: 'img2pdf', async render(b) {
    let imgs = []; const th = h('div', { class: 'thumbs' }); const size = h('select', { style: 'width:auto' }, h('option', { value: 'a4' }, 'A4 pages'), h('option', { value: 'fit' }, 'Page = image size'));
    const draw = () => { th.innerHTML = ''; imgs.forEach((f, i) => th.append(h('img', { src: f.url, title: 'Click to remove', onclick: () => { imgs.splice(i, 1); draw(); } }))); };
    b.append(card(dropZone('Drop images (JPG, PNG, WebP)', 'image/*', true, (fs) => { imgs.push(...fs.map(f => ({ f, url: fileUrl(f) }))); draw(); }), th, h('div', { class: 'gap' }), h('div', { class: 'row' }, size, btn('Make PDF', async () => { if (!imgs.length) return toast('Add images first');
      const d = await PDF().PDFDocument.create();
      for (const it of imgs) { const i = await loadImg(it.url); const c = document.createElement('canvas'); const sc = Math.min(1, 2400 / Math.max(i.naturalWidth, i.naturalHeight)); c.width = i.naturalWidth * sc; c.height = i.naturalHeight * sc; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height);
        const jpg = await d.embedJpg(await (await fetch(c.toDataURL('image/jpeg', 0.85))).arrayBuffer()); let W = jpg.width, H = jpg.height; if (size.value === 'a4') { W = 595; H = 842; } const page = d.addPage([W, H]); const s = Math.min(W / jpg.width, H / jpg.height); page.drawImage(jpg, { x: (W - jpg.width * s) / 2, y: (H - jpg.height * s) / 2, width: jpg.width * s, height: jpg.height * s }); }
      const bytes = await d.save(); download(new Blob([bytes], { type: 'application/pdf' }), 'images-' + stamp() + '.pdf'); toast(kb(bytes.length)); }, 'primary'))));
  } });
  sec('compress', { group: 'Files', title: 'Compress image', sub: 'Get a photo or signature under a size limit for job and government portals.', feature: 'imgcompress', async render(b) {
    const target = h('input', { type: 'number', value: 200, style: 'width:100px' }), maxw = h('input', { type: 'number', placeholder: 'Max width px (optional)', style: 'width:180px' }), fmt = h('select', { style: 'width:auto' }, h('option', { value: 'image/jpeg' }, 'JPG'), h('option', { value: 'image/webp' }, 'WebP'), h('option', { value: 'image/png' }, 'PNG (no quality control)'));
    const out = h('div', { class: 'thumbs' });
    b.append(card(h('div', { class: 'row wrap' }, h('span', {}, 'Under'), target, h('span', {}, 'KB'), maxw, fmt), h('div', { class: 'gap' }), dropZone('Drop images', 'image/*', true, async (fs) => {
      for (const f of fs) { const i = await loadImg(fileUrl(f)); let scale = maxw.value ? Math.min(1, +maxw.value / i.naturalWidth) : 1; let blob, q = 0.92; const lim = (+target.value || 200) * 1024;
        for (let step = 0; step < 24; step++) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(i.naturalWidth * scale)); c.height = Math.max(1, Math.round(i.naturalHeight * scale)); const x = c.getContext('2d'); if (fmt.value === 'image/jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(i, 0, 0, c.width, c.height);
          blob = await new Promise(r => c.toBlob(r, fmt.value, q)); if (blob.size <= lim) break; if (q > 0.5 && fmt.value !== 'image/png') q -= 0.08; else scale *= 0.85; }
        const ext = fmt.value.split('/')[1].replace('jpeg', 'jpg'); const nm = f.name.replace(/\.\w+$/, '') + '-small.' + ext;
        out.append(h('div', { class: 'stack', style: 'align-items:center' }, h('img', { src: URL.createObjectURL(blob) }), h('span', { class: 'small ' + (blob.size <= lim ? '' : 'risk-h') }, kb(f.size) + ' → ' + kb(blob.size)), btn('Save', () => download(blob, nm)))); } }), h('div', { class: 'gap' }), out));
  } });

  /* ---------------- Recording ---------------- */
  const pickStream = async (mic) => { const s = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true, selfBrowserSurface: 'exclude', surfaceSwitching: 'include' }); if (mic) { try { const m = await navigator.mediaDevices.getUserMedia({ audio: true }); const ac = new AudioContext(); const dst = ac.createMediaStreamDestination(); if (s.getAudioTracks().length) ac.createMediaStreamSource(new MediaStream(s.getAudioTracks())).connect(dst); ac.createMediaStreamSource(m).connect(dst); return { stream: new MediaStream([...s.getVideoTracks(), ...dst.stream.getAudioTracks()]), stop: () => { s.getTracks().forEach(t => t.stop()); m.getTracks().forEach(t => t.stop()); ac.close(); } }; } catch (e) { toast('Mic not allowed, recording without it'); } } return { stream: s, stop: () => s.getTracks().forEach(t => t.stop()) }; };
  /* MP4 first: Chrome records H.264/AAC MP4 natively (no conversion, no server). Older Chrome falls back to WebM. */
  const mime = () => ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4;codecs=avc1,opus', 'video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
  const ext = (m) => /mp4/.test(m) ? 'mp4' : 'webm';
  sec('recorder', { group: 'Capture', title: 'Screen recorder', sub: 'Record a tab, window or screen, with your mic. Download as MP4 (WebM only on older Chrome).', feature: 'recorder', async render(b) {
    const mic = h('input', { type: 'checkbox', checked: true, style: 'width:auto' }), cam = h('input', { type: 'checkbox', style: 'width:auto' }); const status = h('span', { class: 'muted' }); const vid = h('video', { class: 'prev', controls: true, hidden: true });
    const saved = h('div', { class: 'stack' });
    let rec, src, t0, tick, camWin;
    const start = async () => { try { src = await pickStream(mic.checked); } catch (e) { return toast('Cancelled'); }
      if (cam.checked) camWin = window.open(chrome.runtime.getURL('pages/tools/tools.html#cambubble'), 'prismcam', 'width=260,height=260');
      const chunks = []; rec = new MediaRecorder(src.stream, { mimeType: mime(), videoBitsPerSecond: 4e6 }); rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => { clearInterval(tick); src.stop(); camWin && camWin.close(); const m = rec.mimeType || mime(); const e = ext(m); const bl = new Blob(chunks, { type: e === 'mp4' ? 'video/mp4' : 'video/webm' }); const name = 'recording-' + stamp() + '.' + e; vid.src = URL.createObjectURL(bl); vid.hidden = false; status.textContent = 'Done · ' + kb(bl.size);
        saved.prepend(h('div', { class: 'row wrap' }, btn('Download ' + e.toUpperCase(), () => download(bl, name), 'primary'), h('span', { class: 'muted small' }, name + ' · ' + kb(bl.size)), e === 'webm' ? h('span', { class: 'small risk-m' }, 'This Chrome cannot record MP4, so this is WebM.') : null)); go.textContent = 'Start recording'; go.classList.add('primary'); };
      src.stream.getVideoTracks()[0].onended = () => rec.state !== 'inactive' && rec.stop();
      rec.start(1000); t0 = Date.now(); tick = setInterval(() => { const s = Math.round((Date.now() - t0) / 1000); status.textContent = '● Recording ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }, 500); go.textContent = 'Stop'; go.classList.remove('primary'); };
    const go = btn('Start recording', () => rec && rec.state === 'recording' ? rec.stop() : start(), 'primary');
    b.append(card(h('div', { class: 'row wrap' }, go, h('label', { class: 'row' }, mic, 'Microphone'), h('label', { class: 'row' }, cam, 'Webcam bubble (small window you can place over the screen)'), status), vid, saved));
  } });
  sec('cambubble', { group: 'Capture', title: 'Webcam', sub: '', hidden: true, async render(b) {
    document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;background:#000;overflow:hidden';
    const v = h('video', { autoplay: true, muted: true, playsinline: true, style: 'width:100vw;height:100vh;object-fit:cover;border-radius:50%' }); document.body.append(v);
    try { v.srcObject = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 480 } }); } catch (e) { document.body.textContent = 'Camera not allowed'; }
  } });
  sec('replay', { group: 'Capture', title: 'Replay buffer', sub: 'Keeps recording in the background of this tab. When a bug happens, press Save to get the last 30-60 seconds.', feature: 'replay', async render(b) {
    const status = h('span', { class: 'muted' }); let src, recs = [], timer, on = false;
    const SEG = 30000;
    const newRec = () => { const r = { chunks: [], t: Date.now() }; r.mr = new MediaRecorder(src.stream, { mimeType: mime(), videoBitsPerSecond: 3e6 }); r.mr.ondataavailable = e => e.data.size && r.chunks.push(e.data); r.mr.start(1000); recs.push(r); if (recs.length > 2) { const old = recs.shift(); old.mr.state !== 'inactive' && old.mr.stop(); } };
    const start = async () => { try { src = await pickStream(false); } catch (e) { return toast('Cancelled'); } on = true; newRec(); timer = setInterval(newRec, SEG); src.stream.getVideoTracks()[0].onended = stop; status.textContent = '● Buffer running. Keep this tab open.'; go.textContent = 'Stop buffer'; };
    const stop = () => { on = false; clearInterval(timer); recs.forEach(r => r.mr.state !== 'inactive' && r.mr.stop()); recs = []; src && src.stop(); status.textContent = 'Stopped'; go.textContent = 'Start buffer'; };
    const save = () => { if (!on || !recs.length) return toast('Start the buffer first'); const r = recs[0]; r.mr.requestData(); setTimeout(() => { const e = ext(r.mr.mimeType || mime()); const bl = new Blob(r.chunks, { type: e === 'mp4' ? 'video/mp4' : 'video/webm' }); download(bl, 'replay-' + stamp() + '.' + e); toast('Saved last ' + Math.round((Date.now() - r.t) / 1000) + ' s'); }, 300); };
    const go = btn('Start buffer', () => on ? stop() : start(), 'primary');
    b.append(card(h('div', { class: 'row wrap' }, go, btn('Save last 30-60 s', save), status), h('p', { class: 'muted small' }, 'Uses memory while running (about 1-2 MB per 10 s). Nothing leaves your computer.')));
  } });
  sec('gif', { group: 'Capture', title: 'Video to GIF', sub: 'Turn a short clip (your recording, or any video file) into a GIF.', feature: 'gif', async render(b) {
    const vid = h('video', { class: 'prev', controls: true, muted: true, hidden: true }); const from = h('input', { type: 'number', value: 0, step: 0.1, style: 'width:90px' }), len = h('input', { type: 'number', value: 5, step: 0.5, style: 'width:90px' }), w = h('input', { type: 'number', value: 480, style: 'width:90px' }), fps = h('input', { type: 'number', value: 10, style: 'width:80px' }); const st = h('span', { class: 'muted' }); const out = h('div', { class: 'thumbs' });
    b.append(card(dropZone('Drop a video (WebM, MP4)', 'video/*', false, (fs) => { vid.src = fileUrl(fs[0]); vid.hidden = false; }), vid, h('div', { class: 'gap' }), h('div', { class: 'row wrap' }, h('span', {}, 'Start (s)'), from, h('span', {}, 'Length (s)'), len, h('span', {}, 'Width'), w, h('span', {}, 'FPS'), fps,
      btn('Use current time', () => from.value = vid.currentTime.toFixed(1)), btn('Make GIF', async () => { if (!vid.src) return toast('Add a video first'); const G = self.gifenc; const W = +w.value || 480, H = Math.round(W * vid.videoHeight / vid.videoWidth); const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); const enc = G.GIFEncoder(); const n = Math.min(300, Math.round((+len.value || 5) * (+fps.value || 10))); const delay = Math.round(1000 / (+fps.value || 10));
        for (let i = 0; i < n; i++) { vid.currentTime = +from.value + i / (+fps.value || 10); await new Promise(r => vid.onseeked = r); x.drawImage(vid, 0, 0, W, H); const d = x.getImageData(0, 0, W, H).data; const pal = G.quantize(d, 256); enc.writeFrame(G.applyPalette(d, pal), W, H, { palette: pal, delay }); st.textContent = 'Frame ' + (i + 1) + '/' + n; }
        enc.finish(); const bl = new Blob([enc.bytes()], { type: 'image/gif' }); st.textContent = 'Done · ' + kb(bl.size); out.innerHTML = ''; out.append(h('img', { src: URL.createObjectURL(bl), style: 'width:auto;height:auto;max-width:100%' })); download(bl, 'clip-' + stamp() + '.gif'); }, 'primary'), st), out));
  } });
})();
