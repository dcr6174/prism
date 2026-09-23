const { test } = require('node:test');
const assert = require('node:assert/strict');
global.PDFLib = require('../lib/pdf-lib.min.js');
const { pages, run } = require('../pages/tools/pdf-engine.js');
async function fixture() {
  const d = await PDFLib.PDFDocument.create();
  for (let i = 0; i < 4; i++) { const p = d.addPage([400 + i * 10, 600]); p.drawText('Page ' + (i + 1), { x: 40, y: 500 }); }
  d.setTitle('Original'); const f = d.getForm().createTextField('Name'); f.setText('Chandra'); f.addToPage(d.getPage(0), { x: 40, y: 350, width: 180, height: 30 });
  return d.save();
}
const open = async results => PDFLib.PDFDocument.load(results[0].bytes);
test('strict ranges reject malformed or out-of-bounds input and preserve order', () => {
  assert.deepEqual(pages('4-2,1,1', 4), [3,2,1,0,0]);
  assert.deepEqual(pages('', 2), [0,1]);
  for (const range of ['0','5','1-x','2abc', '1,', '1.5', '-2', '1--3']) assert.throws(() => pages(range, 4));
});
test('merge and page organization export real PDFs without mutating source', async () => {
  const source = await fixture();
  const merged = await open(await run([source, source], { mode: 'merge' })); assert.equal(merged.getPageCount(), 8);
  const reordered = await open(await run([source], { mode: 'reorder', range: '4,1,1' })); assert.deepEqual(reordered.getPages().map(p=>p.getWidth()), [430,400,400]);
  const reversed = await open(await run([source], { mode: 'reverse' })); assert.equal(reversed.getPage(0).getWidth(), 430);
  const extracted = await open(await run([source], { mode: 'extract', range: '2-3' })); assert.equal(extracted.getPageCount(), 2);
  const removed = await open(await run([source], { mode: 'remove', range: '2-3' })); assert.deepEqual(removed.getPages().map(p=>p.getWidth()), [400,430]);
  await assert.rejects(run([source], {mode:'remove',range:'1-4'}), /at least one/);
  assert.equal((await PDFLib.PDFDocument.load(source)).getPageCount(), 4);
});
test('split groups retain every requested page once', async () => {
  const result = await run([await fixture()], { mode: 'split', range: '4-1', group: 3 });
  assert.equal(result.length, 2); const a=await PDFLib.PDFDocument.load(result[0].bytes),b=await PDFLib.PDFDocument.load(result[1].bytes);
  assert.deepEqual(a.getPages().map(p=>p.getWidth()),[430,420,410]); assert.equal(b.getPage(0).getWidth(),400);
});
test('rotation is selective and repeatable, crop validates margins', async () => {
  const source = await fixture();
  for(let i=0;i<2;i++) { const d = await open(await run([source], { mode:'rotate',range:'2',angle:90 })); assert.equal(d.getPage(1).getRotation().angle,90); assert.equal(d.getPage(0).getRotation().angle,0); }
  const cropped = await open(await run([source],{mode:'crop',range:'1',margin:20})); assert.deepEqual(cropped.getPage(0).getCropBox(),{x:20,y:20,width:360,height:560});
  await assert.rejects(run([source],{mode:'crop',margin:300}),/entire page/);
});
test('metadata, blank insertion, flattening and attachments survive reload', async () => {
  const source=await fixture();
  const meta=await open(await run([source],{mode:'metadata',title:'New',author:'Chandra',keywords:'QA, tools'})); assert.equal(meta.getTitle(),'New'); assert.equal(meta.getAuthor(),'Chandra');
  const blank=await open(await run([source],{mode:'blank',at:5}));assert.equal(blank.getPageCount(),5);
  const flat=await open(await run([source],{mode:'flatten'}));assert.equal(flat.getForm().getFields().length,0);
  const attached=await open(await run([source],{mode:'attach',attachments:[{name:'notes.txt',bytes:new Uint8Array([65,66]),type:'text/plain'}]}));assert.ok(attached.catalog.get(PDFLib.PDFName.of('Names')));
});
test('watermark, numbers and resize produce valid outputs and protect unsupported inputs', async () => {
  const source=await fixture();
  for(const options of [{mode:'watermark',text:'DRAFT',size:40,opacity:.2},{mode:'numbers',start:1,size:11},{mode:'optimize'}]) assert.equal((await open(await run([source],options))).getPageCount(),4);
  const resized=await open(await run([source],{mode:'resize',range:'1',paper:'letter'}));assert.equal(resized.getPage(0).getWidth(),612);assert.equal(resized.getPage(1).getWidth(),410);
  await assert.rejects(run([source],{mode:'watermark',text:'DRAFT',size:0,opacity:.2}),/Font size/);
  await assert.rejects(run([source,source],{mode:'rotate',angle:90}),/one PDF/);
  await assert.rejects(run([new Uint8Array([1,2,3])],{mode:'merge'}),/Cannot read/);
});
