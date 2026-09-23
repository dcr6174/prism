/* PDF Studio: all document bytes remain in this page's memory. */
(function () {
  const { h, download } = UI;
  const operations = [
    ['merge', 'Merge PDFs', 'Combine files in the order you choose.', '↗'],
    ['extract', 'Extract pages', 'Keep just the pages you need.', '⊞'],
    ['split', 'Split PDF', 'Create smaller PDFs in page groups.', '⑂'],
    ['remove', 'Remove pages', 'Leave unwanted pages behind.', '−'],
    ['reorder', 'Reorder & duplicate', 'Use 3, 1-2, 3 to arrange your pages.', '⇄'],
    ['reverse', 'Reverse pages', 'Flip the entire reading order.', '↶'],
    ['rotate', 'Rotate pages', 'Turn selected pages 90°, 180° or 270°.', '↻'],
    ['watermark', 'Watermark', 'Add centered text with adjustable opacity.', 'Aa'],
    ['numbers', 'Page numbers', 'Add a clean number to the footer.', '#'],
    ['resize', 'Resize paper', 'Fit content to A4, A5 or US Letter.', '⤢'],
    ['crop', 'Crop margins', 'Hide equal margins on every side.', '⌗'],
    ['blank', 'Insert blank page', 'Make room for notes or a separator.', '+'],
    ['metadata', 'Edit metadata', 'Update title, author, subject and keywords.', '≡'],
    ['flatten', 'Flatten forms', 'Turn filled fields into fixed page content.', '▱'],
    ['attach', 'Attach files', 'Bundle supporting files inside your PDF.', '⊕'],
    ['optimize', 'Optimize structure', 'Resave with compact object streams.', '↓']
  ];
  T.sec('pdf', { group: 'Files', title: 'PDF Studio', sub: 'A little less paperwork. A lot more possibility.', feature: 'pdftools', async render(b, params) {
    await T.library('pdf');
    let mode = operations.some(o => o[0] === params.get('mode')) ? params.get('mode') : 'merge';
    let files = [], attachments = [], urls = [], busy = false, disposed = false;
    T.cleanup(() => { disposed = true; urls.forEach(URL.revokeObjectURL); files = []; attachments = []; });
    const state = h('p', { class: 'studio-status', role: 'status', 'aria-live': 'polite' }, 'Choose a tool, then add your files.');
    const list = h('ul', { class: 'list pdf-files' });
    const output = h('div', { class: 'pdf-output' });
    const settings = h('div', { class: 'studio-fields' });
    const range = h('input', { placeholder: 'All pages · or 1-3, 5', 'aria-label': 'Page selection' });
    const rangeField = h('label', { class: 'field' }, h('span', {}, 'Pages'), range, h('small', { class: 'muted' }, 'Page numbers start at 1. Descending ranges work too: 5-1.'));
    const inputs = {};
    const field = (key, label, value, type = 'text', attrs = {}) => {
      const input = h('input', { type, value, ...attrs }); inputs[key] = input;
      return h('label', { class: 'field' }, h('span', {}, label), input);
    };
    const select = (key, label, values) => {
      const input = h('select', {}, values.map(([v, label]) => h('option', { value: v }, label))); inputs[key] = input;
      return h('label', { class: 'field' }, h('span', {}, label), input);
    };
    const summary = h('span', { class: 'pill' }, 'No files yet');
    const title = h('h2'); const subtitle = h('p', { class: 'muted' });
    const run = h('button', { class: 'btn primary', type: 'button' }, 'Create PDF');
    const controls = h('fieldset', { class: 'studio-controls' });
    function drawFiles() {
      list.replaceChildren();
      files.forEach((file, i) => {
        const move = (delta) => { if (busy) return; const next = i + delta; [files[i], files[next]] = [files[next], files[i]]; drawFiles(); };
        list.append(h('li', {}, h('span', { class: 'file-mark', 'aria-hidden': 'true' }, 'PDF'), h('div', { class: 'grow' }, h('strong', { class: 'filename' }, file.name), h('div', { class: 'muted small' }, file.count + ' pages · ' + T.kb(file.bytes.byteLength))),
          h('button', { class: 'btn small', disabled: i === 0, 'aria-label': 'Move ' + file.name + ' up', onclick: () => move(-1) }, '↑'),
          h('button', { class: 'btn small', disabled: i === files.length - 1, 'aria-label': 'Move ' + file.name + ' down', onclick: () => move(1) }, '↓'),
          h('button', { class: 'btn small ghost', 'aria-label': 'Remove ' + file.name, onclick: () => { if (!busy) { files.splice(i, 1); drawFiles(); } } }, '×')));
      });
      summary.textContent = files.length ? files.length + ' file' + (files.length === 1 ? '' : 's') + ' · ' + files.reduce((n, f) => n + f.count, 0) + ' pages' : 'No files yet';
      run.disabled = !files.length || busy;
    }
    const drop = T.dropZone('Drop PDFs here, or click to browse', '.pdf,application/pdf', true, async fs => {
      if (busy) return; busy = true; controls.disabled = true; run.disabled = true;
      state.textContent = 'Reading your files…'; state.dataset.error = '';
      try {
        for (const f of fs) {
          if (disposed) return;
          if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') throw Error('Choose PDF files only.');
          if (files.length >= 40 || files.reduce((n, f) => n + f.bytes.byteLength, 0) + f.size > 150 * 1024 * 1024) throw Error('For a responsive workspace, use at most 40 files and 150 MB per batch.');
          const bytes = await f.arrayBuffer(); const doc = await PrismPDF.load(bytes);
          files.push({ name: f.name, bytes, count: doc.getPageCount() });
        }
        state.textContent = 'Ready. Your original files will stay unchanged.';
      } catch (e) { state.textContent = e.message; state.dataset.error = 'true'; }
      finally { busy = false; controls.disabled = false; drawFiles(); }
    });
    function configure() {
      for (const key of Object.keys(inputs)) delete inputs[key];
      settings.replaceChildren(); range.value = '';
      const op = operations.find(o => o[0] === mode); title.textContent = op[1]; subtitle.textContent = op[2];
      cards.querySelectorAll('button').forEach(c => { c.classList.toggle('selected', c.dataset.mode === mode); c.setAttribute('aria-pressed', c.dataset.mode === mode); });
      const withRange = ['extract', 'split', 'remove', 'reorder', 'rotate', 'watermark', 'numbers', 'resize', 'crop'].includes(mode);
      if (withRange) settings.append(rangeField);
      if (mode === 'split') settings.append(field('group', 'Pages per output file', 1, 'number', { min: 1, step: 1 }));
      if (mode === 'rotate') settings.append(select('angle', 'Clockwise rotation', [[90, '90°'], [180, '180°'], [270, '270°']]));
      if (mode === 'watermark') settings.append(field('text', 'Watermark text', 'DRAFT', 'text', { maxlength: 120 }), field('size', 'Font size (pt)', 48, 'number', { min: 6, max: 150 }), field('opacity', 'Opacity (0.05–1)', 0.2, 'number', { min: 0.05, max: 1, step: 0.05 }));
      if (mode === 'numbers') settings.append(field('start', 'Start numbering at', 1, 'number', { min: 1, step: 1 }), field('size', 'Font size (pt)', 11, 'number', { min: 6, max: 150 }));
      if (mode === 'crop') settings.append(field('margin', 'Margin on each side (pt)', 24, 'number', { min: 0 }), h('p', { class: 'notice' }, 'Cropping hides content; it does not remove it. Do not use crop to redact sensitive information.'));
      if (mode === 'resize') settings.append(select('paper', 'Paper size', [['a4', 'A4'], ['letter', 'US Letter'], ['a5', 'A5']]), select('landscape', 'Orientation', [['', 'Portrait'], ['true', 'Landscape']]), h('p', { class: 'notice' }, 'Resizing creates new pages. Interactive forms, links and annotations are not retained on resized pages.'));
      if (mode === 'blank') settings.append(field('at', 'Insert before page', 1, 'number', { min: 1, step: 1 }), h('p', { class: 'muted small' }, 'Use page count + 1 to append at the end.'));
      if (mode === 'metadata') settings.append(field('title', 'New title', ''), field('author', 'New author', ''), field('subject', 'New subject', ''), field('keywords', 'Keywords, separated by commas', ''), h('p', { class: 'notice' }, 'Blank fields clear these four properties. This does not sanitize hidden content, XMP metadata or attachments.'));
      if (mode === 'attach') {
        const label = h('p', { class: 'muted small' }, 'No attachments selected');
        settings.append(T.dropZone('Choose supporting files', '', true, async fs => { if (fs.reduce((n, f) => n + f.size, 0) > 30 * 1024 * 1024) { label.textContent = 'Keep attachments below 30 MB.'; return; } attachments = await Promise.all(fs.map(async f => ({ name: f.name, type: f.type, bytes: await f.arrayBuffer() }))); label.textContent = attachments.map(f => f.name).join(', '); }), label);
      }
      if (mode === 'optimize') settings.append(h('p', { class: 'notice' }, 'Lossless structural optimization. Images are not downsampled. Already optimized PDFs may stay the same size or become larger.'));
      if (mode === 'flatten') settings.append(h('p', { class: 'notice' }, 'Filled form values become fixed. Keep an editable original if you need to change them later.'));
      if (['merge', 'extract', 'split', 'remove', 'reorder', 'reverse'].includes(mode)) settings.append(h('p', { class: 'muted small' }, 'Page-copy operations may not retain interactive forms, bookmarks or document-level attachments.'));
      run.textContent = mode === 'split' ? 'Split PDF' : 'Create PDF';
      state.textContent = mode === 'merge' ? 'Add PDFs and arrange them in order.' : 'Add one PDF to use this tool.';
      state.dataset.error = ''; output.replaceChildren(); urls.forEach(URL.revokeObjectURL); urls = [];
    }
    const cards = h('div', { class: 'pdf-tool-grid', 'aria-label': 'PDF operations' }, operations.map(([id, name, desc, icon], index) => h('button', { type: 'button', class: 'pdf-tool', 'data-mode': id, 'data-tone': index % 5, onclick: () => { if (busy) return; mode = id; configure(); history.replaceState(null, '', '#pdf?mode=' + id); } }, h('span', { class: 'tool-icon', 'aria-hidden': 'true' }, icon), h('span', {}, h('strong', {}, name), h('small', {}, desc)))));
    run.onclick = async () => {
      if (busy) return; busy = true; controls.disabled = true; cards.querySelectorAll('button').forEach(c => c.disabled = true); run.disabled = true;
      urls.forEach(URL.revokeObjectURL); urls = []; output.replaceChildren(); state.dataset.error = ''; state.textContent = 'Working locally…';
      try {
        await new Promise(r => setTimeout(r, 30));
        const options = { mode, range: range.value, attachments, progress: (a, n) => state.textContent = 'Processing ' + a + ' of ' + n + '…' };
        for (const [k, el] of Object.entries(inputs)) options[k] = el.value;
        options.landscape = options.landscape === 'true';
        if (mode === 'remove' && !range.value.trim()) throw Error('Enter the pages to remove.');
        const results = await PrismPDF.run(files.map(f => f.bytes), options);
        if (disposed) return;
        for (const result of results) {
          const blob = new Blob([result.bytes], { type: 'application/pdf' });
          const name = files.length === 1 ? files[0].name.replace(/\.pdf$/i, '') + '-' + result.name.replace(/^prism-/, '') : result.name;
          const url = URL.createObjectURL(blob); urls.push(url);
          output.append(h('div', { class: 'result-row' }, h('span', { class: 'success-icon', 'aria-hidden': 'true' }, '✓'), h('div', { class: 'grow' }, h('strong', { class: 'filename' }, name), h('div', { class: 'muted small' }, T.kb(blob.size))), h('a', { class: 'btn', href: url, target: '_blank', rel: 'noopener' }, 'Preview'), h('button', { class: 'btn primary', onclick: () => download(blob, name) }, 'Download')));
        }
        state.textContent = results.length + ' PDF' + (results.length === 1 ? '' : 's') + ' ready. Preview or download below.';
        if (mode === 'optimize') { const before = files[0].bytes.byteLength, after = results[0].bytes.length; state.textContent += ' ' + T.kb(before) + ' → ' + T.kb(after) + (after < before ? ' · ' + Math.round((1 - after / before) * 100) + '% smaller.' : ' · No size saving for this file.'); }
        output.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
      } catch (e) { state.textContent = e.message; state.dataset.error = 'true'; }
      finally { busy = false; controls.disabled = false; cards.querySelectorAll('button').forEach(c => c.disabled = false); drawFiles(); }
    };
    controls.append(h('div', { class: 'row wrap studio-heading' }, title, summary), subtitle, drop, list, settings, h('div', { class: 'row wrap studio-actions' }, run, h('button', { class: 'btn ghost', onclick: () => { if (busy) return; files = []; drawFiles(); output.replaceChildren(); urls.forEach(URL.revokeObjectURL); urls = []; state.textContent = 'Workspace cleared.'; } }, 'Clear files')));
    b.append(h('div', { class: 'row wrap studio-topline' }, h('span', { class: 'pill' }, '16 local PDF tools'), h('a', { class: 'btn small', href: '#sign' }, 'Fill & sign ↗'), h('a', { class: 'btn small', href: '#img2pdf' }, 'Images to PDF ↗')), cards, T.card(controls, state, output), h('details', { class: 'studio-limits' }, h('summary', {}, 'Supported files & honest limits'), h('p', {}, 'Works with unencrypted PDFs. PDF editing can invalidate existing digital signatures. A drawn signature is not a certificate-based digital signature. OCR, Office conversion, PDF-to-image rendering, password protection, PDF/A validation and secure redaction are not included. These need additional dedicated engines. Nothing is uploaded.')));
    configure(); drawFiles();
  } });
})();
