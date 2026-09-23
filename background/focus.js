/* Focus engine: blocker (17), schedules (18), allowance (19), lockdown (20), friction unlock (21), pomodoro (22),
   blocked-page message (23), intent prompt (153), site time dashboard (148), break nudge (151). */
const Focus = self.Focus = {};
const FU = PrismU;
Focus.get = () => PrismStore.get('focus', { unlock: {}, lockdownUntil: 0, pomo: { phase: 'idle', ends: 0, cycles: 0 }, intentPass: {} });
Focus.set = (st) => PrismStore.set('focus', st);
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
Focus.inWindow = (spec, now = new Date()) => {
  spec = String(spec).toLowerCase().trim();
  let days = [0, 1, 2, 3, 4, 5, 6], m;
  const dm = spec.match(/^(daily|weekdays|weekends|[a-z]{3}(?:\s*[-,]\s*[a-z]{3})*)\s+/);
  if (dm) {
    spec = spec.slice(dm[0].length);
    const d = dm[1];
    if (d === 'weekdays') days = [1, 2, 3, 4, 5]; else if (d === 'weekends') days = [0, 6];
    else if (d !== 'daily') {
      days = [];
      for (const part of d.split(',')) {
        const [a, b] = part.split('-').map(x => DAYS.indexOf(x.trim()));
        if (a < 0) continue;
        if (b >= 0) { for (let i = a; ; i = (i + 1) % 7) { days.push(i); if (i === b) break; } } else days.push(a);
      }
    }
  }
  if (!days.includes(now.getDay())) return false;
  if (!(m = spec.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/))) return true;
  const cur = now.getHours() * 60 + now.getMinutes(), a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4];
  return a <= b ? cur >= a && cur < b : cur >= a || cur < b;
};
Focus.timeToday = async () => PrismStore.get('time:' + FU.today(), {});
Focus.usedMs = (times, site) => Object.entries(times).filter(([h]) => FU.siteMatch(h, site)).reduce((a, [, v]) => a + v, 0);
Focus.reason = async (url, st) => {
  st = st || await Focus.get();
  const host = FU.host(url), now = Date.now();
  if (!host) return null;
  if (BG.on('lockdown') && st.lockdownUntil > now && !FU.anySite(host, BG.cfg('lockdown').allow)) return 'lockdown';
  if ((st.unlock[host] || 0) > now) return null;
  const blocked = BG.cfg('blocker').sites || [];
  if (BG.on('blocker') && FU.anySite(host, blocked)) return 'blocked';
  const sched = FU.pairs(BG.cfg('schedules').rules);
  if (BG.on('pomodoro') && st.pomo.phase === 'work' && BG.cfg('pomodoro').blockDuring && (FU.anySite(host, blocked) || sched.some(([s]) => FU.siteMatch(host, s)))) return 'pomodoro';
  if (BG.on('schedules') && sched.some(([s, spec]) => FU.siteMatch(host, s) && Focus.inWindow(spec))) return 'schedule';
  if (BG.on('allowance')) {
    const times = await Focus.timeToday();
    for (const [s, min] of FU.pairs(BG.cfg('allowance').rules)) if (FU.siteMatch(host, s) && Focus.usedMs(times, s) >= parseFloat(min) * 60000) return 'allowance';
  }
  return null;
};
/* Hard-block with declarativeNetRequest so nothing loads, plus a redirect to our blocked page. */
Focus.sync = async () => {
  await BG.ready;
  const st = await Focus.get(), now = Date.now();
  const rules = []; let id = 1;
  const domains = new Set();
  const add = (s) => { s = String(s).trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); if (s && !((st.unlock[s] || 0) > now)) domains.add(s); };
  const blocked = BG.cfg('blocker').sites || [];
  const sched = FU.pairs(BG.cfg('schedules').rules);
  if (BG.on('blocker')) blocked.forEach(add);
  if (BG.on('pomodoro') && st.pomo.phase === 'work' && BG.cfg('pomodoro').blockDuring) { blocked.forEach(add); sched.forEach(([s]) => add(s)); }
  if (BG.on('schedules')) sched.forEach(([s, spec]) => Focus.inWindow(spec) && add(s));
  if (BG.on('allowance')) { const times = await Focus.timeToday(); FU.pairs(BG.cfg('allowance').rules).forEach(([s, m]) => Focus.usedMs(times, s) >= parseFloat(m) * 60000 && add(s)); }
  if (domains.size) rules.push({ id: id++, priority: 1, action: { type: 'block' }, condition: { requestDomains: [...domains], resourceTypes: ['main_frame'] } });
  if (BG.on('lockdown') && st.lockdownUntil > now) {
    const allow = (BG.cfg('lockdown').allow || []).map(s => s.replace(/^www\./, ''));
    rules.push({ id: id++, priority: 2, action: { type: 'block' }, condition: { excludedRequestDomains: allow.length ? allow : undefined, resourceTypes: ['main_frame'] } });
  }
  const old = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: old.map(r => r.id), addRules: rules });
  return rules.length;
};
Focus.badge = async () => {
  const st = await Focus.get();
  const p = st.pomo;
  if (BG.on('pomodoro') && p.phase !== 'idle' && p.ends > Date.now()) {
    const min = Math.ceil((p.ends - Date.now()) / 60000);
    await chrome.action.setBadgeBackgroundColor({ color: p.phase === 'work' ? '#4F5BD5' : '#2F7D5B' });
    await chrome.action.setBadgeText({ text: min + 'm' });
    await chrome.action.setTitle({ title: 'PRISM - ' + (p.phase === 'work' ? 'Focus' : 'Break') + ' ' + min + ' min left' });
  } else { await chrome.action.setBadgeText({ text: '' }); await chrome.action.setTitle({ title: 'PRISM' }); }
};

/* ---- time tracking: shared by allowance (19), dashboard (148), break nudge (151) ---- */
const TT = { };
TT.cur = async () => (await chrome.storage.session.get('tt')).tt || null;
TT.flush = async (next) => {
  const cur = await TT.cur(), now = Date.now();
  if (cur && cur.host && now > cur.since) {
    const ms = Math.min(now - cur.since, 5 * 60000); // cap gaps (sleep, SW death)
    await PrismStore.update('time:' + FU.today(), {}, (t) => { t[cur.host] = (t[cur.host] || 0) + ms; });
  }
  await chrome.storage.session.set({ tt: next === undefined ? (cur ? { host: cur.host, since: now } : null) : next });
};
TT.track = async () => {
  await BG.ready;
  if (!BG.on('timedash') && !BG.on('allowance') && !BG.on('breaknudge')) return;
  const win = await chrome.windows.getLastFocused().catch(() => null);
  const tab = win && win.focused ? (await chrome.tabs.query({ active: true, windowId: win.id }))[0] : null;
  const host = tab && /^https?:/.test(tab.url || '') ? FU.host(tab.url) : null;
  await TT.flush(host ? { host, since: Date.now() } : null);
};
chrome.tabs.onActivated.addListener(() => TT.track());
chrome.tabs.onUpdated.addListener((id, ch, tab) => { if (ch.url && tab.active) TT.track(); });
chrome.windows.onFocusChanged.addListener(() => TT.track());
chrome.idle.setDetectionInterval(120);
chrome.idle.onStateChanged.addListener(async (s) => {
  if (s === 'active') { await chrome.storage.session.set({ activeSince: Date.now() }); TT.track(); }
  else await TT.flush(null);
});
(async () => { const a = await chrome.alarms.get('focus-tick'); if (!a) chrome.alarms.create('focus-tick', { periodInMinutes: 1 }); })();
self.TT = TT;

BG.def('blocker', {
  onBeforeNavigate: async (d) => {
    const r = await Focus.reason(d.url);
    if (!r) return false;
    await chrome.tabs.update(d.tabId, { url: chrome.runtime.getURL('pages/blocked/blocked.html') + '?u=' + encodeURIComponent(d.url) + '&r=' + r });
    return true;
  },
  onSettings: () => Focus.sync(),
  install: () => Focus.sync(),
  startup: () => Focus.sync(),
  msg: {
    'focus:state': async () => ({ st: await Focus.get(), times: await Focus.timeToday() }),
    'focus:reason': async (m) => Focus.reason(m.url),
    'focus:block': async (m) => { await PrismStore.patch(s => { const l = s.cfg.blocker.sites; const h = FU.host(m.url) || m.url; if (!l.includes(h)) l.push(h); }); BG.s = await PrismStore.load(); await Focus.sync(); return true; },
    'focus:unlock': async (m) => {
      const r = await Focus.reason(m.url);
      if (r === 'lockdown') return { error: 'Lockdown is on. It ends by itself.' };
      if (!BG.on('friction')) return { error: 'Unlocking is turned off.' };
      const st = await Focus.get();
      st.unlock[FU.host(m.url)] = Date.now() + (BG.cfg('friction').unlockMinutes || 5) * 60000;
      await Focus.set(st); await Focus.sync();
      return { ok: true };
    },
  },
});
BG.def('schedules', {});
BG.def('allowance', {});
BG.def('friction', {});
BG.def('blockmsg', { msg: { 'focus:message': () => BG.on('blockmsg') ? BG.cfg('blockmsg').message : '' } });
BG.def('lockdown', {
  msg: {
    'lockdown:start': async (m) => { const st = await Focus.get(); st.lockdownUntil = Date.now() + (m.minutes || BG.cfg('lockdown').minutes || 50) * 60000; await Focus.set(st); await Focus.sync(); return st.lockdownUntil; },
    'lockdown:state': async () => (await Focus.get()).lockdownUntil,
  },
});
BG.def('pomodoro', {
  msg: {
    'pomo:start': async () => { const st = await Focus.get(); st.pomo = { phase: 'work', ends: Date.now() + (BG.cfg('pomodoro').work || 25) * 60000, cycles: st.pomo.cycles || 0 }; await Focus.set(st); chrome.alarms.create('pomo-end', { when: st.pomo.ends }); await Focus.sync(); await Focus.badge(); return st.pomo; },
    'pomo:stop': async () => { const st = await Focus.get(); st.pomo = { phase: 'idle', ends: 0, cycles: st.pomo.cycles || 0 }; await Focus.set(st); chrome.alarms.clear('pomo-end'); await Focus.sync(); await Focus.badge(); return st.pomo; },
    'pomo:state': async () => (await Focus.get()).pomo,
  },
  commands: { 'pomodoro-toggle': async () => { const st = await Focus.get(); await BG.msg[st.pomo.phase === 'idle' ? 'pomo:start' : 'pomo:stop'].fn({}); } },
});
BG.def('intent', {
  onBeforeNavigate: async (d) => {
    const host = FU.host(d.url);
    if (!FU.anySite(host, BG.cfg('intent').sites)) return false;
    const st = await Focus.get();
    if ((st.intentPass[host] || 0) > Date.now()) return false;
    await chrome.tabs.update(d.tabId, { url: chrome.runtime.getURL('pages/intent/intent.html') + '?u=' + encodeURIComponent(d.url) });
    return true;
  },
  msg: {
    'intent:pass': async (m) => {
      const st = await Focus.get(); const host = FU.host(m.url);
      st.intentPass[host] = Date.now() + (m.minutes || 15) * 60000; await Focus.set(st);
      await PrismStore.update('intentLog', [], (l) => { l.unshift({ host, reason: m.reason, t: Date.now() }); l.length = Math.min(l.length, 300); });
      return true;
    },
  },
});
BG.def('timedash', { msg: { 'time:get': async (m) => PrismStore.get('time:' + (m.date || FU.today()), {}) } });
BG.def('breaknudge', {});
/* Every minute: flush time, refresh blocks (schedules / allowance / lockdown / pomodoro phases), nudge breaks. */
BG.def('core-focus-tick', {
  alarms: {
    'pomo-end': async () => BG.alarms['focus-tick'].fn(),
    'focus-tick': async () => {
      await TT.flush();
      const st = await Focus.get(); const now = Date.now();
      let changed = false;
      for (const h in st.unlock) if (st.unlock[h] < now) { delete st.unlock[h]; changed = true; }
      if (st.pomo.phase !== 'idle' && st.pomo.ends <= now + 1500) {
        const c = BG.cfg('pomodoro');
        if (st.pomo.phase === 'work') { st.pomo = { phase: 'rest', ends: now + (c.rest || 5) * 60000, cycles: (st.pomo.cycles || 0) + 1 }; chrome.alarms.create('pomo-end', { when: st.pomo.ends }); BG.notify('Focus done', 'Take ' + (c.rest || 5) + ' minutes. You earned it.'); }
        else { st.pomo = { phase: 'idle', ends: 0, cycles: st.pomo.cycles }; BG.notify('Break over', 'Start the next focus block when ready.'); }
        changed = true;
      }
      if (st.lockdownUntil && st.lockdownUntil < now) { st.lockdownUntil = 0; changed = true; BG.notify('Lockdown ended', 'All sites are open again.'); }
      if (changed) await Focus.set(st);
      await Focus.sync(); await Focus.badge();
      if (BG.on('breaknudge')) {
        const { activeSince, nudged } = await chrome.storage.session.get(['activeSince', 'nudged']);
        const mins = BG.cfg('breaknudge').minutes || 50;
        if (!activeSince) await chrome.storage.session.set({ activeSince: now });
        else if (now - activeSince > mins * 60000 && (!nudged || now - nudged > mins * 60000)) {
          await chrome.storage.session.set({ nudged: now });
          BG.notify('Break?', 'You have been going for ' + mins + ' minutes. Stand up, water, 2 minutes.');
        }
      }
    },
  },
});
