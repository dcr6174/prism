/* Background halves of: AI handoff (27-29), privacy (43, 45), QA (50, 52, 54, 58, 62), reading (35, 102),
   language (113, 114), shopping (119), downloads (129, 130), reading extras (155, 156), trust (159), screenshot (37). */
const XU = PrismU;
const DEFAULT_PROMPTS = [
  { id: 'rewrite', name: 'Rewrite clearly', text: 'Rewrite this so it is clear and simple. Keep my meaning:\n\n{{text}}' },
  { id: 'summarise', name: 'Summarise', text: 'Summarise this in 5 short bullet points:\n\n{{text}}' },
  { id: 'eli5', name: 'Explain simply (ELI5)', text: 'Explain this like I am new to the topic:\n\n{{text}}' },
  { id: 'reply', name: 'Email reply', text: 'Write a short, polite reply to this email. Sound human, not formal:\n\n{{text}}' },
  { id: 'linkedin', name: 'LinkedIn post', text: 'Turn this into a short LinkedIn post. No hashtags spam, no emojis overload:\n\n{{text}}' },
  { id: 'bug', name: 'Bug report', text: 'Turn these notes into a bug report with Title, Steps to reproduce, Expected, Actual, Environment:\n\n{{text}}' },
  { id: 'tests', name: 'Test cases', text: 'Write positive, negative and edge test cases for this requirement as a table:\n\n{{text}}' },
];
self.Prompts = { get: async () => PrismStore.get('prompts', DEFAULT_PROMPTS), fill: (p, text, extra) => p.text.replace(/\{\{\s*text\s*\}\}/g, text).replace(/\{\{\s*url\s*\}\}/g, (extra && extra.url) || '').replace(/\{\{\s*title\s*\}\}/g, (extra && extra.title) || '') };
const CHATS = {
  chatgpt: { url: 'https://chatgpt.com/', q: (t) => 'https://chatgpt.com/?q=' + encodeURIComponent(t) },
  claude: { url: 'https://claude.ai/new', q: (t) => 'https://claude.ai/new?q=' + encodeURIComponent(t) },
  perplexity: { url: 'https://www.perplexity.ai/', q: (t) => 'https://www.perplexity.ai/search?q=' + encodeURIComponent(t) },
  gemini: { url: 'https://gemini.google.com/app', q: null },
};
/* Hand text to a web chat. Short prompts go in the URL; long ones are parked and filled by the aipage content script
   (needs site access to that chat site), otherwise copied to the clipboard. */
self.handoff = async (text, target, tab) => {
  target = CHATS[target] ? target : (BG.cfg('aisend').target || 'chatgpt');
  const c = CHATS[target];
  if (c.q && text.length < 6000) { await chrome.tabs.create({ url: c.q(text) }); return 'url'; }
  await chrome.storage.local.set({ handoff: { text, t: Date.now(), target, autosubmit: !!BG.cfg('aipage').autosubmit } });
  const granted = await chrome.permissions.contains({ origins: [new URL(c.url).origin + '/*'] });
  if (!granted && tab) { await BG.copyInTab(tab.id, text).catch(() => {}); await BG.toastInTab(tab.id, 'Prompt copied - paste it with Ctrl+V'); }
  await chrome.tabs.create({ url: c.url });
  return granted ? 'fill' : 'clipboard';
};
const promptMenus = async () => {
  const ps = await Prompts.get();
  return ps.map(p => ({ id: 'ai-' + p.id, parent: 'prism-ai', parentTitle: 'PRISM: send to AI', title: p.name, contexts: ['selection'], click: async (info, tab) => handoff(Prompts.fill(p, info.selectionText, tab), null, tab) }));
};
const loadPromptMenus = async () => { const ms = await promptMenus(); BG.menus = BG.menus.filter(m => !String(m.id).startsWith('ai-')).concat(ms.map(m => Object.assign({ feature: 'aisend' }, m))); };
loadPromptMenus(); // top level, so menu clicks still route after the worker restarts
BG.def('aisend', {
  install: async () => { await loadPromptMenus(); await BG.buildMenus(); },
  startup: async () => { await loadPromptMenus(); await BG.buildMenus(); },
  msg: { 'ai:handoff': async (m, sender) => handoff(m.text, m.target, sender.tab || await BG.activeTab()) },
});
BG.def('prompts', {
  msg: {
    'prompts:get': () => Prompts.get(),
    'prompts:save': async (m) => { await PrismStore.set('prompts', m.prompts); await BG.feats.aisend.startup(); return true; },
  },
});
BG.def('aipage', { msg: { 'handoff:take': async () => { const h = (await chrome.storage.local.get('handoff')).handoff; await chrome.storage.local.remove('handoff'); return h && Date.now() - h.t < 180000 ? h : null; } } });

BG.def('cleanlink', {
  menus: [
    { id: 'clean-link', title: 'Copy clean link', contexts: ['link'], click: async (i, tab) => { await BG.copyInTab(tab.id, XU.cleanUrl(i.linkUrl)); BG.toastInTab(tab.id, 'Clean link copied'); } },
    { id: 'clean-page', title: 'Copy clean page link', contexts: ['page'], click: async (i, tab) => { await BG.copyInTab(tab.id, XU.cleanUrl(tab.url)); BG.toastInTab(tab.id, 'Clean link copied'); } },
  ],
  msg: { 'clean:url': (m) => XU.cleanUrl(m.url) },
});
BG.def('copyurl', { commands: { 'copy-url': async (tab) => { tab = tab || await BG.activeTab(); await BG.copyInTab(tab.id, tab.url); BG.toastInTab(tab.id, 'URL copied'); } } });
BG.def('clearsite', {
  msg: {
    'clearsite': async (m) => {
      const origin = new URL(m.url).origin;
      await chrome.browsingData.remove({ origins: [origin] }, { cache: true, cacheStorage: true, cookies: true, fileSystems: true, indexedDB: true, localStorage: true, serviceWorkers: true });
      return origin;
    },
  },
});
const setBadge = (tabId, text, color) => { chrome.action.setBadgeText({ tabId, text }).catch(() => {}); if (color) chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {}); };
BG.def('errbadge', { msg: { 'badge:errors': (m, s) => { if (s.tab) setBadge(s.tab.id, m.n ? String(Math.min(m.n, 999)) : '', '#B4531F'); return true; } } });
BG.def('readtime', { msg: { 'badge:readtime': async (m, s) => { if (!s.tab) return; const p = (await Focus.get()).pomo; if (p.phase !== 'idle') return; const cur = await chrome.action.getBadgeText({ tabId: s.tab.id }); if (!cur || /m$/.test(cur)) setBadge(s.tab.id, m.min ? m.min + 'm' : '', '#5C6066'); return true; } } });
const TESTDATA = {
  'Long string (256)': 'a'.repeat(256), 'Long string (5000)': 'Lorem ipsum dolor sit amet '.repeat(186).slice(0, 5000),
  'Emoji': 'Test 😀🚀👩🏽‍💻🇮🇳 ✅', 'RTL (Arabic / Hebrew)': 'مرحبا بالعالم שלום עולם', 'Zero-width chars': 'te\u200Bst\u200D\uFEFFvalue',
  'Unicode (accents, CJK)': 'Ångström Ñandú 東京 한국어 हिन्दी', 'Whitespace only': '     ', 'Leading/trailing spaces': '  value  ',
  'SQL injection': "' OR '1'='1'; DROP TABLE users;--", 'XSS': '<script>alert(1)</script><img src=x onerror=alert(1)>',
  'Bad email': 'user@@example..com', 'Email with plus': 'test.user+qa@example.com', 'Huge number': '999999999999999999999',
  'Negative / decimal': '-0.000001', 'Leap day': '2028-02-29', 'Invalid date': '2026-02-30', 'Path traversal': '../../etc/passwd',
  'Null-ish': 'null', 'Special chars': '!@#$%^&*()_+-=[]{}|;:\'",.<>/?`~',
};
self.TESTDATA = TESTDATA;
BG.def('testdata', {
  menus: Object.keys(TESTDATA).map((k, i) => ({ id: 'td-' + i, parent: 'prism-td', parentTitle: 'PRISM: insert test data', title: k, contexts: ['editable'],
    click: (info, tab) => chrome.scripting.executeScript({ target: { tabId: tab.id, frameIds: [info.frameId || 0] }, func: (v) => { const el = document.activeElement; if (!el) return; el.focus(); if (!document.execCommand('insertText', false, v)) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }, args: [TESTDATA[k]] }) })),
  msg: { 'testdata:get': () => TESTDATA },
});
BG.def('notifdeny', {
  onSettings: async () => applyNotif(), install: () => applyNotif(), startup: () => applyNotif(),
});
const applyNotif = async () => {
  await chrome.contentSettings.notifications.clear({});
  if (!BG.on('notifdeny')) return;
  for (const s of BG.cfg('notifdeny').allow || []) { const h = s.replace(/^https?:\/\//, '').replace(/\/.*$/, ''); for (const scheme of ['https', 'http']) await chrome.contentSettings.notifications.set({ primaryPattern: scheme + '://' + h + '/*', setting: 'allow' }).catch(() => {}); }
  await chrome.contentSettings.notifications.set({ primaryPattern: '<all_urls>', setting: 'block' });
};
self.cleanText = (t) => String(t).replace(/\r/g, '').replace(/(\w)-\n(\w)/g, '$1$2').replace(/([^\n])\n(?!\n)/g, '$1 ').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
BG.def('cleanpdf', {
  menus: [{ id: 'clean-text', title: 'Copy as clean text (fix line breaks)', contexts: ['selection'], click: async (i, tab) => { await BG.copyInTab(tab.id, cleanText(i.selectionText)); BG.toastInTab(tab.id, 'Clean text copied'); } }],
  msg: { 'text:clean': (m) => cleanText(m.text) },
});
BG.def('dictionary', {
  msg: {
    'dict:lookup': async (m) => {
      const r = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(m.word.toLowerCase()));
      if (!r.ok) return { error: 'No meaning found' };
      const j = await r.json(); const e = j[0];
      return { word: e.word, phonetic: e.phonetic || (e.phonetics.find(p => p.text) || {}).text || '', meanings: e.meanings.slice(0, 3).map(x => ({ pos: x.partOfSpeech, defs: x.definitions.slice(0, 2).map(d => d.definition) })) };
    },
  },
});
BG.def('readaloud', {
  msg: {
    'tts:speak': (m) => { chrome.tts.stop(); const parts = String(m.text).match(/[^.!?\n]{1,220}[.!?\n]*/g) || []; parts.forEach((p, i) => chrome.tts.speak(p, { enqueue: i > 0, rate: BG.cfg('readaloud').rate || 1.1 })); return parts.length; },
    'tts:stop': () => { chrome.tts.stop(); return true; },
  },
  menus: [{ id: 'read-aloud', title: 'Read aloud', contexts: ['selection'], click: (i) => BG.msg['tts:speak'].fn({ text: i.selectionText }) }],
});
/* price parsing shared with the price-log page script */
self.parsePrice = (html) => {
  const ld = [...html.matchAll(/"price"\s*:\s*"?([\d,.]+)"?/g)].map(m => parseFloat(m[1].replace(/,/g, ''))).filter(x => x > 0);
  if (ld.length) return ld[0];
  const meta = html.match(/(?:product:price:amount|og:price:amount)"\s+content="([\d,.]+)"/); if (meta) return parseFloat(meta[1].replace(/,/g, ''));
  const rs = html.match(/₹\s?([\d,]+(?:\.\d+)?)/); return rs ? parseFloat(rs[1].replace(/,/g, '')) : null;
};
BG.def('pricewatch', {
  msg: {
    'pricewatch:add': async (m) => { await PrismStore.update('pricewatch', [], (l) => { if (!l.some(x => x.url === m.url)) l.push({ url: m.url, title: m.title, price: m.price, last: Date.now(), history: m.price ? [[Date.now(), m.price]] : [] }); }); ensureAlarm('pricewatch', BG.cfg('pricewatch').hours || 6); return true; },
    'pricewatch:check': () => checkPrices(),
  },
  alarms: { 'pricewatch': () => checkPrices() },
  install: () => ensureAlarm('pricewatch', BG.cfg('pricewatch').hours || 6),
});
const ensureAlarm = async (name, hours) => { const a = await chrome.alarms.get(name); if (!a || Math.abs(a.periodInMinutes - hours * 60) > 1) chrome.alarms.create(name, { periodInMinutes: hours * 60 }); };
const checkPrices = async () => {
  const l = await PrismStore.get('pricewatch', []); let n = 0;
  for (const w of l) {
    try {
      const html = await (await fetch(w.url, { credentials: 'omit' })).text();
      const p = parsePrice(html); w.last = Date.now(); w.error = p ? '' : 'Could not read price';
      if (p) { if (w.price && p < w.price) { BG.notify('Price drop: ₹' + p.toLocaleString('en-IN'), (w.title || w.url).slice(0, 90) + ' (was ₹' + w.price.toLocaleString('en-IN') + ')'); n++; } w.price = p; w.history.push([Date.now(), p]); }
    } catch (e) { w.error = 'Needs site access in Options (or the site blocked the check)'; }
  }
  await PrismStore.set('pricewatch', l); return n;
};
const EXT = { PDFs: /\.pdf$/i, Images: /\.(png|jpe?g|gif|webp|svg|heic|avif|bmp)$/i, Videos: /\.(mp4|mkv|mov|webm|avi)$/i, Audio: /\.(mp3|wav|m4a|flac|ogg)$/i, Documents: /\.(docx?|xlsx?|pptx?|csv|txt|odt|rtf|md)$/i, Archives: /\.(zip|rar|7z|tar|gz)$/i, Installers: /\.(exe|msi|dmg|pkg|deb|apk|appimage)$/i };
BG.def('dlrename', {
  onDownloadName: (item, name) => {
    const base = name.split('/').pop(); const dir = name.includes('/') ? name.slice(0, name.lastIndexOf('/') + 1) : '';
    if (/^\d{4}-\d{2}-\d{2} /.test(base)) return name;
    const site = XU.host(item.referrer || item.url).replace(/\.(com|in|org|net|co|io)$/, '').slice(0, 30) || 'web';
    const clean = base.replace(/\s*\(\d+\)(?=\.[^.]+$)/, '').replace(/[\\/:*?"<>|]+/g, '-');
    return dir + XU.today() + ' ' + site + ' - ' + clean;
  },
});
BG.def('dlsort', {
  onDownloadName: (item, name) => {
    if (name.includes('/')) return name;
    const folder = Object.keys(EXT).find(k => EXT[k].test(name)) || 'Other';
    return 'PRISM/' + folder + '/' + name;
  },
});
/* keep dlsort after dlrename so the folder wraps the renamed file */
BG.dlName.sort((a, b) => (a.id === 'dlsort') - (b.id === 'dlsort'));
const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const hash = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
BG.def('pagemonitor', {
  msg: {
    'monitor:add': async (m) => {
      let text = ''; try { text = textOf(await (await fetch(m.url)).text()); } catch (e) {}
      const it = { id: XU.uid(), url: m.url, title: m.title || m.url, hash: await hash(text), last: Date.now(), changed: 0, error: text ? '' : 'Needs site access in Options' };
      await PrismStore.update('monitors', [], (l) => { if (!l.some(x => x.url === m.url)) l.push(it); });
      ensureAlarm('pagemonitor', BG.cfg('pagemonitor').hours || 3); return it;
    },
    'monitor:check': () => checkMonitors(),
  },
  alarms: { 'pagemonitor': () => checkMonitors() },
});
const checkMonitors = async () => {
  const l = await PrismStore.get('monitors', []); let n = 0;
  for (const it of l) {
    try {
      const h = await hash(textOf(await (await fetch(it.url)).text()));
      if (h !== it.hash) { it.hash = h; it.changed = Date.now(); n++; BG.notify('Page changed', it.title); }
      it.last = Date.now(); it.error = '';
    } catch (e) { it.error = 'Needs site access in Options'; }
  }
  await PrismStore.set('monitors', l); return n;
};
BG.def('hoverpreview', {
  msg: {
    'preview:fetch': async (m) => {
      try {
        const r = await fetch(m.url, { credentials: 'omit' }); const html = (await r.text()).slice(0, 300000);
        const meta = (p) => { const x = html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + p + '["\'][^>]+content=["\']([^"\']*)', 'i')) || html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' + p, 'i')); return x ? x[1] : ''; };
        const title = meta('og:title') || (html.match(/<title[^>]*>([^<]*)/i) || [])[1] || m.url;
        return { title: title.trim(), desc: meta('og:description') || meta('description'), image: meta('og:image'), site: meta('og:site_name') || XU.host(r.url) };
      } catch (e) { return { error: 'Preview needs site access for that site (Options > Site access)' }; }
    },
  },
});
BG.def('newsite', {
  msg: {
    'newsite:check': async (m) => {
      const host = XU.host(m.url);
      const seen = await PrismStore.get('firstSeen', {});
      if (!seen[host]) {
        const items = await chrome.history.search({ text: host, startTime: 0, maxResults: 50 });
        const visits = items.filter(i => XU.host(i.url) === host).reduce((a, i) => a + (i.visitCount || 0), 0);
        seen[host] = { t: Date.now(), prior: visits };
        await PrismStore.set('firstSeen', seen);
      }
      const s = seen[host];
      return { isNew: s.prior <= 1 && Date.now() - s.t < 86400000 * 2, since: s.t };
    },
  },
});
BG.def('disablejs', {
  msg: {
    'site:toggle': async (m) => {
      const pattern = new URL(m.url).origin + '/*';
      const api = chrome.contentSettings[m.kind];
      const cur = (await api.get({ primaryUrl: m.url })).setting;
      const next = cur === 'block' ? 'allow' : 'block';
      await api.set({ primaryPattern: pattern, setting: next });
      const tab = await BG.activeTab(); chrome.tabs.reload(tab.id);
      return next;
    },
    'site:state': async (m) => ({ javascript: (await chrome.contentSettings.javascript.get({ primaryUrl: m.url })).setting, images: (await chrome.contentSettings.images.get({ primaryUrl: m.url })).setting }),
  },
});
BG.def('viewport', {
  msg: {
    'viewport:resize': async (m) => {
      const tab = await BG.activeTab(); const w = await chrome.windows.get(tab.windowId);
      const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => [outerWidth - innerWidth, outerHeight - innerHeight] });
      const [dw, dh] = r.result;
      await chrome.windows.update(w.id, { state: 'normal', width: m.w + dw, height: m.h + dh });
      return true;
    },
  },
});
/* 37 full-page screenshot: scroll, capture, stitch with OffscreenCanvas right here in the worker. */
BG.def('screenshot', {
  msg: {
    'shot:full': async (m) => {
      const tab = m.tabId ? await chrome.tabs.get(m.tabId) : await BG.activeTab();
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [...BG.contentFiles(), BG.featureFile('screenshot')] });
      const call = async (act, arg) => (await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: (a, b) => window.__prism.act('screenshot', a, b), args: [act, arg == null ? null : arg] }))[0].result;
      const dim = await call('begin', { mask: !!m.mask });
      const shots = [];
      const maxH = Math.min(dim.h, 16000);
      for (let y = 0; y < maxH; y += dim.vh) {
        const at = await call('scroll', y);
        await new Promise(r => setTimeout(r, 550)); // captureVisibleTab is rate-limited to 2/s
        shots.push({ y: at, url: await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }) });
        if (y === 0) await call('hideFixed');
      }
      await call('end');
      const first = await createImageBitmap(await (await fetch(shots[0].url)).blob());
      const scale = first.width / dim.vw;
      const canvas = new OffscreenCanvas(first.width, Math.round(maxH * scale));
      const ctx = canvas.getContext('2d');
      for (const s of shots) { const bmp = s === shots[0] ? first : await createImageBitmap(await (await fetch(s.url)).blob()); ctx.drawImage(bmp, 0, Math.round(s.y * scale)); }
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const buf = new Uint8Array(await blob.arrayBuffer()); let bin = ''; for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
      await PrismStore.set('shot:last', { data: 'data:image/png;base64,' + btoa(bin), url: tab.url, title: tab.title, t: Date.now() });
      await chrome.tabs.create({ url: chrome.runtime.getURL('pages/tools/tools.html#annotate') });
      return true;
    },
    'shot:visible': async () => { const tab = await BG.activeTab(); const data = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }); await PrismStore.set('shot:last', { data, url: tab.url, title: tab.title, t: Date.now() }); await chrome.tabs.create({ url: chrome.runtime.getURL('pages/tools/tools.html#annotate') }); return true; },
  },
});
