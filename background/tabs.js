/* Tabs & sessions (10-16), tabs round 2 (95-97, 99), zoom memory (42). */
const TU = PrismU;
const normal = (t) => /^https?:|^file:/.test(t.url || '');
const saveCollapsed = async (label, tabs) => {
  if (!tabs.length) return null;
  const item = { id: TU.uid(), t: Date.now(), label, tabs: tabs.map(t => ({ url: t.url, title: t.title || t.url })) };
  await PrismStore.update('collapsed', [], (l) => { l.unshift(item); });
  return item;
};
const openTool = (hash) => chrome.tabs.create({ url: chrome.runtime.getURL('pages/tools/tools.html#' + hash) });
const curWindowTabs = async () => chrome.tabs.query({ lastFocusedWindow: true });

BG.def('collapse', {
  msg: {
    'collapse:all': async () => {
      const tabs = (await curWindowTabs()).filter(t => !t.pinned && normal(t));
      const item = await saveCollapsed('Collapsed ' + new Date().toLocaleString(), tabs);
      await openTool('collapse');
      if (tabs.length) await chrome.tabs.remove(tabs.map(t => t.id));
      return item ? item.tabs.length : 0;
    },
    'collapse:restore': async (m) => {
      const l = await PrismStore.get('collapsed', []);
      const it = l.find(x => x.id === m.id); if (!it) return 0;
      const list = m.idx == null ? it.tabs : [it.tabs[m.idx]];
      for (const t of list) await chrome.tabs.create({ url: t.url, active: false });
      if (!m.keep) {
        if (m.idx == null) l.splice(l.indexOf(it), 1); else it.tabs.splice(m.idx, 1);
        await PrismStore.set('collapsed', l.filter(x => x.tabs.length));
      }
      return list.length;
    },
  },
  menus: [{ id: 'collapse-all', title: 'Collapse all tabs into a list', contexts: ['page', 'action'], click: () => BG.msg['collapse:all'].fn({}) }],
});
const key = (u) => { try { const x = new URL(u); x.hash = ''; return x.toString(); } catch { return u; } };
BG.def('dupes', {
  msg: {
    'dupes:close': async () => {
      const tabs = await chrome.tabs.query({});
      const seen = new Map(); const close = [];
      for (const t of tabs.sort((a, b) => (b.active - a.active) || (b.pinned - a.pinned))) {
        const k = key(t.url); if (!normal(t)) continue;
        if (seen.has(k)) close.push(t.id); else seen.set(k, t.id);
      }
      if (close.length) await chrome.tabs.remove(close);
      return close.length;
    },
  },
  onTabUpdated: async (id, ch, tab) => {
    if (!ch.url || !BG.cfg('dupes').auto || !normal(tab)) return;
    const other = (await chrome.tabs.query({})).find(t => t.id !== id && key(t.url) === key(ch.url));
    if (other) { await chrome.tabs.update(other.id, { active: true }); await chrome.windows.update(other.windowId, { focused: true }); await chrome.tabs.remove(id); }
  },
  menus: [{ id: 'dupes-close', title: 'Close duplicate tabs', contexts: ['page', 'action'], click: () => BG.msg['dupes:close'].fn({}) }],
});
const closeWhere = async (mode, tab) => {
  tab = tab || await BG.activeTab();
  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  const host = TU.host(tab.url);
  const ids = tabs.filter(t => !t.pinned && t.id !== tab.id && (mode === 'others' || (mode === 'right' && t.index > tab.index) || (mode === 'site' && TU.host(t.url) === host))).map(t => t.id);
  if (mode === 'site') ids.push(tab.id);
  if (ids.length) await chrome.tabs.remove(ids);
  return ids.length;
};
BG.def('closetabs', {
  msg: { 'tabs:close': (m) => closeWhere(m.mode) },
  menus: [
    { id: 'close-others', parent: 'prism-close', parentTitle: 'Close tabs', title: 'Close other tabs', contexts: ['page'], click: (i, tab) => closeWhere('others', tab) },
    { id: 'close-right', parent: 'prism-close', title: 'Close tabs to the right', contexts: ['page'], click: (i, tab) => closeWhere('right', tab) },
    { id: 'close-site', parent: 'prism-close', title: 'Close all tabs from this site', contexts: ['page'], click: (i, tab) => closeWhere('site', tab) },
  ],
  commands: { 'close-others': () => closeWhere('others') },
});
BG.def('sessions', {
  msg: {
    'sessions:save': async (m) => {
      const tabs = (await curWindowTabs()).filter(normal);
      const s = { id: TU.uid(), name: m.name || 'Session ' + new Date().toLocaleString(), t: Date.now(), tabs: tabs.map(t => ({ url: t.url, title: t.title, pinned: t.pinned })) };
      await PrismStore.update('sessions', [], (l) => { l.unshift(s); });
      return s;
    },
    'sessions:list': () => PrismStore.get('sessions', []),
    'sessions:restore': async (m) => {
      const s = (await PrismStore.get('sessions', [])).find(x => x.id === m.id); if (!s) return 0;
      const w = await chrome.windows.create({ url: s.tabs.map(t => t.url) });
      const tabs = await chrome.tabs.query({ windowId: w.id });
      for (let i = 0; i < s.tabs.length; i++) if (s.tabs[i].pinned && tabs[i]) chrome.tabs.update(tabs[i].id, { pinned: true });
      return s.tabs.length;
    },
    'sessions:delete': async (m) => PrismStore.update('sessions', [], (l) => l.filter(x => x.id !== m.id)),
  },
});
BG.def('autosleep', {}); // runs on the shared minute tick, see bottom of file
BG.def('findtab', {
  msg: {
    'tabs:list': async () => (await chrome.tabs.query({})).map(t => ({ id: t.id, windowId: t.windowId, title: t.title, url: t.url, favIconUrl: t.favIconUrl, active: t.active })),
    'tabs:focus': async (m) => { const t = await chrome.tabs.update(m.id, { active: true }); await chrome.windows.update(t.windowId, { focused: true }); return true; },
  },
});
BG.def('grouptabs', {
  msg: {
    'tabs:sort': async () => {
      const tabs = (await curWindowTabs()).filter(t => !t.pinned);
      const sorted = tabs.slice().sort((a, b) => TU.host(a.url).localeCompare(TU.host(b.url)) || (a.title || '').localeCompare(b.title || ''));
      const base = (await curWindowTabs()).filter(t => t.pinned).length;
      for (let i = 0; i < sorted.length; i++) await chrome.tabs.move(sorted[i].id, { index: base + i });
      return sorted.length;
    },
    'tabs:group': async () => {
      const tabs = (await curWindowTabs()).filter(t => !t.pinned && normal(t));
      const by = {};
      for (const t of tabs) (by[TU.host(t.url)] = by[TU.host(t.url)] || []).push(t.id);
      const colors = ['blue', 'purple', 'cyan', 'green', 'orange', 'pink', 'yellow', 'red', 'grey'];
      let i = 0, n = 0;
      for (const h in by) if (by[h].length > 1) { const g = await chrome.tabs.group({ tabIds: by[h] }); await chrome.tabGroups.update(g, { title: h, color: colors[i++ % colors.length] }); n++; }
      return n;
    },
    'tabs:ungroup': async () => { const tabs = (await curWindowTabs()).filter(t => t.groupId > -1); if (tabs.length) await chrome.tabs.ungroup(tabs.map(t => t.id)); return tabs.length; },
  },
});
/* 95 locked pinned tabs */
const pinned = new Map();
const refreshPinned = async () => { pinned.clear(); for (const t of await chrome.tabs.query({ pinned: true })) pinned.set(t.id, { url: t.url, windowId: t.windowId }); await chrome.storage.session.set({ pinned: [...pinned] }); };
BG.def('lockpin', {
  onTabUpdated: (id, ch, tab) => { if ('pinned' in ch || (tab.pinned && ch.url)) refreshPinned(); },
  onTabCreated: (tab) => { if (tab.pinned) refreshPinned(); },
  onTabRemoved: async (id, info) => {
    if (!pinned.size) { const s = (await chrome.storage.session.get('pinned')).pinned || []; s.forEach(([k, v]) => pinned.set(k, v)); }
    const p = pinned.get(id); if (!p || info.isWindowClosing) return;
    pinned.delete(id);
    const t = await chrome.tabs.create({ url: p.url, pinned: true, windowId: p.windowId, active: false, index: 0 }).catch(() => null);
    if (t) { pinned.set(t.id, { url: p.url, windowId: p.windowId }); BG.notify('Pinned tab is locked', 'Reopened it. Unpin it first (right-click tab) to close it for real.'); }
  },
  startup: refreshPinned, install: refreshPinned,
  msg: { 'tab:self': (m, sender) => sender.tab ? { pinned: sender.tab.pinned, id: sender.tab.id } : null },
});
BG.def('tablimit', {
  onTabCreated: async (tab) => {
    const max = BG.cfg('tablimit').max || 20;
    const tabs = (await chrome.tabs.query({ windowId: tab.windowId })).filter(t => !t.pinned);
    if (tabs.length <= max) return;
    const oldest = tabs.filter(t => t.id !== tab.id && !t.active && normal(t)).sort((a, b) => (a.lastAccessed || 0) - (b.lastAccessed || 0)).slice(0, tabs.length - max);
    if (!oldest.length) return;
    await saveCollapsed('Tab limit ' + new Date().toLocaleString(), oldest);
    await chrome.tabs.remove(oldest.map(t => t.id));
  },
});
BG.def('snooze', {
  msg: {
    'snooze': async (m) => {
      const tab = m.tabId ? await chrome.tabs.get(m.tabId) : await BG.activeTab();
      let wake = m.until || Date.now() + (m.minutes || 60) * 60000;
      const id = TU.uid();
      await PrismStore.update('snoozed', [], (l) => { l.push({ id, url: tab.url, title: tab.title, wake }); });
      chrome.alarms.create('snooze|' + id, { when: wake });
      await chrome.tabs.remove(tab.id);
      return wake;
    },
    'snooze:list': () => PrismStore.get('snoozed', []),
  },
  alarms: {
    'snooze': async (a) => {
      const id = a.name.split('|')[1];
      const l = await PrismStore.get('snoozed', []);
      const it = l.find(x => x.id === id); if (!it) return;
      await chrome.tabs.create({ url: it.url, active: false });
      BG.notify('Snoozed tab is back', it.title || it.url);
      await PrismStore.set('snoozed', l.filter(x => x.id !== id));
    },
  },
});
BG.def('mute', {
  msg: {
    'mute:others': async () => { const a = await BG.activeTab(); const tabs = await chrome.tabs.query({ audible: true }); for (const t of tabs) if (t.id !== a.id) await chrome.tabs.update(t.id, { muted: true }); return tabs.length; },
    'mute:toggle': async () => { const a = await BG.activeTab(); await chrome.tabs.update(a.id, { muted: !a.mutedInfo.muted }); return !a.mutedInfo.muted; },
  },
  onTabUpdated: async (id, ch, tab) => {
    const host = TU.host(tab.url); if (!host) return;
    if (ch.mutedInfo && ch.mutedInfo.reason === 'user') await PrismStore.update('mutedSites', [], (l) => ch.mutedInfo.muted ? (l.includes(host) ? l : [...l, host]) : l.filter(h => h !== host));
    if (ch.status === 'loading' && ch.url) { const l = await PrismStore.get('mutedSites', []); if (l.includes(host) && !tab.mutedInfo.muted) chrome.tabs.update(id, { muted: true }); }
  },
});
BG.def('zoommem', {
  onTabUpdated: async (id, ch, tab) => {
    if (ch.status !== 'complete') return;
    const z = (await PrismStore.get('zoom', {}))[TU.host(tab.url)];
    if (z) { const cur = await chrome.tabs.getZoom(id); if (Math.abs(cur - z) > 0.01) chrome.tabs.setZoom(id, z); }
  },
});
chrome.tabs.onZoomChange.addListener(async (z) => {
  await BG.ready; if (!BG.on('zoommem')) return;
  const tab = await chrome.tabs.get(z.tabId).catch(() => null); if (!tab) return;
  const h = TU.host(tab.url); if (!h) return;
  await PrismStore.update('zoom', {}, (m) => { if (Math.abs(z.newZoomFactor - 1) < 0.01) delete m[h]; else m[h] = z.newZoomFactor; });
});
/* autosleep runs on the shared minute tick */
chrome.alarms.onAlarm.addListener(async (a) => {
  if (a.name !== 'focus-tick') return;
  await BG.ready; if (!BG.on('autosleep')) return;
  const cut = Date.now() - (BG.cfg('autosleep').minutes || 45) * 60000;
  for (const t of await chrome.tabs.query({ active: false, discarded: false, audible: false, pinned: false })) if (normal(t) && (t.lastAccessed || Date.now()) < cut) chrome.tabs.discard(t.id).catch(() => {});
});
