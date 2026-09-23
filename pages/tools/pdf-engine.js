/* Pure PDF operations. No DOM, network, or persistent document storage. */
(function (g) {
  'use strict';
  function pages(text, count, allowDuplicates = true) {
    if (!Number.isInteger(count) || count < 1) throw Error('This PDF has no pages.');
    if (!text.trim()) return Array.from({ length: count }, (_, i) => i);
    const out = [];
    for (const raw of text.split(',')) {
      const part = raw.trim();
      if (!/^\d+(?:\s*-\s*\d+)?$/.test(part)) throw Error('Use page numbers or ranges, for example 1-3, 5.');
      const [a, b = a] = part.split('-').map(Number);
      if (a < 1 || b < 1 || a > count || b > count) throw Error('Page numbers must be between 1 and ' + count + '.');
      const step = a <= b ? 1 : -1;
      for (let p = a; ; p += step) { out.push(p - 1); if (p === b) break; }
      if (out.length > 10000) throw Error('Select at most 10,000 pages.');
    }
    return allowDuplicates ? out : [...new Set(out)];
  }
  function number(value, min, max, label) {
    const n = Number(value);
    if (value === '' || !Number.isFinite(n) || n < min || n > max) throw Error(label + ' must be between ' + min + ' and ' + max + '.');
    return n;
  }
  async function load(bytes) {
    try { return await PDFLib.PDFDocument.load(bytes); }
    catch (e) { if (/encrypt/i.test(e.message)) throw Error('Password-protected PDFs are not supported. Open and export an unlocked copy in your PDF app first.'); throw Error('Cannot read this PDF. It may be damaged or not a PDF file.'); }
  }
  async function combine(docs, progress = () => {}) {
    const out = await PDFLib.PDFDocument.create();
    for (let i = 0; i < docs.length; i++) {
      const copied = await out.copyPages(docs[i], docs[i].getPageIndices());
      copied.forEach(p => out.addPage(p)); progress(i + 1, docs.length);
      await new Promise(r => setTimeout(r, 0));
    }
    return out;
  }
  async function run(sources, options = {}) {
    if (!sources.length) throw Error('Add a PDF first.');
    const { mode = 'merge', range = '' } = options;
    const multi = mode === 'merge';
    if (!multi && sources.length !== 1) throw Error('This tool works with one PDF at a time.');
    // Reload a fresh copy for every export; never accumulate edits on originals.
    const docs = await Promise.all(sources.map(s => load(s)));
    let doc = multi ? await combine(docs, options.progress) : docs[0];
    const selected = pages(range, doc.getPageCount(), false);
    const set = new Set(selected);
    if (['extract', 'reorder', 'remove', 'reverse'].includes(mode)) {
      const indices = mode === 'remove' ? doc.getPageIndices().filter(i => !set.has(i)) : mode === 'reverse' ? doc.getPageIndices().reverse() : pages(range, doc.getPageCount());
      if (!indices.length) throw Error('Keep at least one page.');
      const out = await PDFLib.PDFDocument.create();
      (await out.copyPages(doc, indices)).forEach(p => out.addPage(p)); doc = out;
    } else if (mode === 'split') {
      const group = number(options.group, 1, doc.getPageCount(), 'Pages per file');
      if (!Number.isInteger(group)) throw Error('Pages per file must be a whole number.');
      const outputs = [];
      for (let i = 0; i < selected.length; i += group) {
        const out = await PDFLib.PDFDocument.create();
        (await out.copyPages(doc, selected.slice(i, i + group))).forEach(p => out.addPage(p));
        outputs.push({ name: 'part-' + String(outputs.length + 1).padStart(3, '0') + '.pdf', bytes: await out.save() });
        if (options.progress) options.progress(Math.min(i + group, selected.length), selected.length);
        await new Promise(r => setTimeout(r, 0));
      }
      return outputs;
    } else if (mode === 'rotate') {
      const angle = Number(options.angle);
      if (![90, 180, 270].includes(angle)) throw Error('Choose 90, 180 or 270 degrees.');
      selected.forEach(i => { const p = doc.getPage(i); p.setRotation(PDFLib.degrees((p.getRotation().angle + angle) % 360)); });
    } else if (mode === 'watermark' || mode === 'numbers') {
      const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
      const size = number(options.size, 6, 150, 'Font size');
      const opacity = mode === 'watermark' ? number(options.opacity, 0.05, 1, 'Opacity') : 1;
      const text = String(options.text || '').trim();
      if (mode === 'watermark' && !text) throw Error('Enter watermark text.');
      const start = mode === 'numbers' ? number(options.start, 1, 100000, 'Starting number') : 1;
      if (!Number.isInteger(start)) throw Error('Starting number must be a whole number.');
      for (const [j, i] of selected.entries()) {
        const p = doc.getPage(i), box = p.getCropBox();
        if (p.getRotation().angle % 360 !== 0) throw Error('Watermarks and page numbers require unrotated pages. Normalize rotation in a PDF editor first.');
        const label = mode === 'numbers' ? String(start + j) : text;
        let width;
        try { width = font.widthOfTextAtSize(label, size); } catch { throw Error('Use Latin characters for PDF text; this bundled font does not support every language.'); }
        if (width > box.width - 24 || size > box.height - 32) throw Error('Text is too large for the selected page. Use a smaller font size.');
        p.drawText(label, { x: box.x + (box.width - width) / 2, y: box.y + (mode === 'numbers' ? 16 : (box.height - size) / 2), size, font, opacity, color: PDFLib.rgb(0.32, 0.25, 0.6) });
      }
    } else if (mode === 'crop') {
      const margin = number(options.margin, 0, 1000, 'Crop margin');
      selected.forEach(i => { const p = doc.getPage(i), box = p.getCropBox(); if (margin * 2 >= Math.min(box.width, box.height)) throw Error('Crop margin would remove the entire page.'); p.setCropBox(box.x + margin, box.y + margin, box.width - margin * 2, box.height - margin * 2); });
    } else if (mode === 'resize') {
      const sizes = { a4: [595.28, 841.89], letter: [612, 792], a5: [419.53, 595.28] };
      const target = sizes[options.paper]; if (!target) throw Error('Choose a paper size.');
      const out = await PDFLib.PDFDocument.create();
      for (const i of doc.getPageIndices()) {
        const source = doc.getPage(i);
        if (!set.has(i)) { out.addPage((await out.copyPages(doc, [i]))[0]); continue; }
        if (source.getRotation().angle % 360 !== 0) throw Error('Resize requires unrotated pages. Normalize rotation in a PDF editor first.');
        const embedded = await out.embedPage(source), [w, h] = options.landscape ? [...target].reverse() : target;
        const scale = Math.min(w / embedded.width, h / embedded.height);
        const page = out.addPage([w, h]); page.drawPage(embedded, { x: (w - embedded.width * scale) / 2, y: (h - embedded.height * scale) / 2, xScale: scale, yScale: scale });
      }
      doc = out;
    } else if (mode === 'metadata') {
      doc.setTitle(options.title || ''); doc.setAuthor(options.author || ''); doc.setSubject(options.subject || ''); doc.setKeywords(String(options.keywords || '').split(',').map(s => s.trim()).filter(Boolean));
    } else if (mode === 'flatten') {
      const form = doc.getForm(); if (!form.getFields().length) throw Error('This PDF has no fillable form fields.'); form.flatten();
    } else if (mode === 'blank') {
      const at = number(options.at, 1, doc.getPageCount() + 1, 'Insert position');
      if (!Number.isInteger(at)) throw Error('Insert position must be a whole number.');
      const p = doc.getPage(Math.min(at - 1, doc.getPageCount() - 1)); doc.insertPage(at - 1, [p.getWidth(), p.getHeight()]);
    } else if (mode === 'attach') {
      if (!options.attachments?.length) throw Error('Choose files to attach.');
      for (const a of options.attachments) await doc.attach(a.bytes, a.name, { mimeType: a.type || 'application/octet-stream' });
    } else if (!['merge', 'optimize'].includes(mode)) throw Error('Unknown PDF operation.');
    return [{ name: 'prism-' + mode + '.pdf', bytes: await doc.save({ useObjectStreams: true }) }];
  }
  g.PrismPDF = { pages, number, load, combine, run };
  if (typeof module !== 'undefined') module.exports = g.PrismPDF;
})(typeof self !== 'undefined' ? self : globalThis);
