/* PRISM background core: a tiny plugin host. Features call BG.def(id, spec).
   All Chrome listeners are attached here, synchronously, and fan out to features. */
const BG = self.BG = {
  feats: {}, msg: {}, menus: [], cmds: {}, alarms: {}, tabUpd: [], tabAct: [], tabRem: [], tabNew: [], nav: [], dlName: [], settingsCb: [],
  s: null,
};
BG.ready = PrismStore.load().then(s => (BG.s = s));
BG.on = (id) => id.startsWith('core') || !!(BG.s && BG.s.on[id]);
BG.cfg = (id) => (BG.s && BG.s.cfg[id]) || {};
BG.def = (id, spec) => {
  BG.feats[id] = spec;
  for (const k in spec.msg || {}) BG.msg[k] = { id, fn: spec.msg[k] };
  for (const m of spec.menus || []) BG.menus.push(Object.assign({ feature: id }, m));
  for (const k in spec.commands || {}) BG.cmds[k] = { id, fn: spec.commands[k] };
  for (const k in spec.alarms || {}) BG.alarms[k] = { id, fn: spec.alarms[k] };
  const push = (arr, fn) => fn && arr.push({ id, fn });
  push(BG.tabUpd, spec.onTabUpdated); push(BG.tabAct, spec.onTabActivated); push(BG.tabRem, spec.onTabRemoved);
  push(BG.tabNew, spec.onTabCreated); push(BG.nav, spec.onBeforeNavigate); push(BG.dlName, spec.onDownloadName); push(BG.settingsCb, spec.onSettings);
};
const guard = (id, fn) => async (...a) => { await BG.ready; if (!BG.on(id) && id !== 'core') return; try { return await fn(...a); } catch (e) { console.warn('[PRISM]', id, e); } };

/* ---------- helpers ---------- */
BG.activeTab = async () => (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
BG.notify = (title, message, id) => chrome.notifications.create(id || 'prism-' + Date.now(), { type: 'basic', iconUrl: chrome.runtime.getURL('assets/icons/icon128.png'), title, message, priority: 0 });
BG.contentFiles = () => ['shared/registry.js', 'shared/store.js', 'content/core.js'];
BG.featureFile = (id) => 'content/features/' + id + '.js';
BG.extraFiles = { qr: ['lib/qrcode.js'] };
/* Run a content-feature action on a tab (used by popup / palette / menus; works with activeTab). */
BG.runInTab = async (tabId, id, act, arg) => {
  await chrome.scripting.executeScript({ target: { tabId }, files: [...BG.contentFiles(), ...(BG.extraFiles[id] || []), BG.featureFile(id)] });
  const [r] = await chrome.scripting.executeScript({ target: { tabId }, func: (id, act, arg) => window.__prism.act(id, act, arg), args: [id, act, arg == null ? null : arg] });
  return r && r.result;
};
BG.copyInTab = (tabId, text) => chrome.scripting.executeScript({ target: { tabId }, func: (t) => navigator.clipboard.writeText(t).catch(() => { const a = document.createElement('textarea'); a.value = t; document.body.append(a); a.select(); document.execCommand('copy'); a.remove(); }), args: [text] });
BG.toastInTab = (tabId, text) => chrome.scripting.executeScript({ target: { tabId }, files: [...BG.contentFiles()] }).then(() => chrome.scripting.executeScript({ target: { tabId }, func: (t) => window.__prism.ui.toast(t), args: [text] })).catch(() => {});

/* ---------- content-script registration on granted sites only ---------- */
BG.contentFeatureIds = () => PRISM_FEATURES.filter(f => f.where.some(w => w === 'cs' || w === 'site')).map(f => f.id);
BG.syncScripts = async () => {
  const perms = await chrome.permissions.getAll();
  const matches = (perms.origins || []).filter(o => /^(https?|\*):\/\//.test(o) || o === '<all_urls>');
  const existing = await chrome.scripting.getRegisteredContentScripts();
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: existing.map(e => e.id) });
  if (!matches.length) return 0;
  const excludeMatches = ['https://chromewebstore.google.com/*'];
  await chrome.scripting.registerContentScripts([
    { id: 'prism-main', matches, excludeMatches, js: ['content/mainworld.js'], world: 'MAIN', runAt: 'document_start', allFrames: false, persistAcrossSessions: true },
    { id: 'prism-page', matches, excludeMatches, js: [...BG.contentFiles(), ...BG.contentFeatureIds().map(BG.featureFile), 'content/boot.js'], runAt: 'document_start', allFrames: false, persistAcrossSessions: true },
  ]);
  return matches.length;
};
chrome.permissions.onAdded.addListener(() => BG.syncScripts());
chrome.permissions.onRemoved.addListener(() => BG.syncScripts());

/* ---------- context menus ---------- */
BG.buildMenus = async () => {
  await BG.ready;
  await chrome.contextMenus.removeAll();
  const parents = new Set();
  for (const m of BG.menus) {
    if (!BG.on(m.feature)) continue;
    if (m.parent && !parents.has(m.parent)) { parents.add(m.parent); chrome.contextMenus.create({ id: m.parent, title: m.parentTitle || m.parent, contexts: m.contexts || ['all'] }); }
    chrome.contextMenus.create({ id: m.id, title: m.title, contexts: m.contexts || ['page'], parentId: m.parent });
  }
};
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  await BG.ready;
  const m = BG.menus.find(x => x.id === info.menuItemId);
  if (m) guard(m.feature, m.click)(info, tab);
});

/* ---------- messages from pages, popup, content scripts ---------- */
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  const h = msg && BG.msg[msg.type];
  if (!h) return false;
  (async () => { await BG.ready; try { reply(await h.fn(msg, sender)); } catch (e) { reply({ error: String(e && e.message || e) }); } })();
  return true;
});
BG.def('core', {
  msg: {
    'settings:changed': async () => { BG.s = await PrismStore.load(); await BG.buildMenus(); for (const c of BG.settingsCb) guard(c.id, c.fn)(BG.s); return true; },
    'scripts:sync': () => BG.syncScripts(),
    'tab:run': async (m) => { const tab = m.tabId ? await chrome.tabs.get(m.tabId) : await BG.activeTab(); return BG.runInTab(tab.id, m.id, m.act, m.arg); },
    'core:features': () => Object.keys(BG.feats),
    'tab:closeSelf': (m, s) => s.tab && chrome.tabs.remove(s.tab.id),
  },
});
chrome.commands.onCommand.addListener(async (cmd, tab) => { await BG.ready; const c = BG.cmds[cmd]; if (c) guard(c.id, c.fn)(tab); });
chrome.alarms.onAlarm.addListener(async (a) => { await BG.ready; const key = a.name.split('|')[0]; const h = BG.alarms[key]; if (h) guard(h.id, h.fn)(a); });
chrome.tabs.onUpdated.addListener((id, ch, tab) => BG.tabUpd.forEach(x => guard(x.id, x.fn)(id, ch, tab)));
chrome.tabs.onActivated.addListener((info) => BG.tabAct.forEach(x => guard(x.id, x.fn)(info)));
chrome.tabs.onRemoved.addListener((id, info) => BG.tabRem.forEach(x => guard(x.id, x.fn)(id, info)));
chrome.tabs.onCreated.addListener((tab) => BG.tabNew.forEach(x => guard(x.id, x.fn)(tab)));
chrome.webNavigation.onBeforeNavigate.addListener(async (d) => {
  if (d.frameId !== 0 || !/^https?:/.test(d.url)) return;
  await BG.ready;
  for (const x of BG.nav) { if (!BG.on(x.id)) continue; try { if (await x.fn(d)) return; } catch (e) { console.warn(e); } }
});
chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  (async () => {
    await BG.ready;
    let name = item.filename;
    for (const x of BG.dlName) if (BG.on(x.id)) { try { name = (await x.fn(item, name)) || name; } catch (e) { console.warn(e); } }
    suggest({ filename: name, conflictAction: 'uniquify' });
  })();
  return true;
});
chrome.runtime.onInstalled.addListener(async (d) => {
  await BG.ready; await BG.buildMenus(); await BG.syncScripts();
  for (const f of Object.values(BG.feats)) if (f.install) try { await f.install(d); } catch (e) { console.warn(e); }
  if (d.reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('pages/options/options.html#welcome') });
});
chrome.runtime.onStartup.addListener(async () => { await BG.ready; await BG.buildMenus(); for (const f of Object.values(BG.feats)) if (f.startup) try { await f.startup(); } catch (e) { console.warn(e); } });
PrismStore.onChange((ch) => { if (ch.settings) BG.ready = PrismStore.load().then(s => (BG.s = s)); });
