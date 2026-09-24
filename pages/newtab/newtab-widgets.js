/* Short views into existing local tools. The source of truth stays in PrismStore. */
const NewTabWidgets = (() => {
  const { h, $ } = UI;
  const tool = (id, label) => h('a', { class: 'widget-more', href: '../tools/tools.html#' + id }, label + ' ↗');
  const empty = (message, id, label) => h('div', { class: 'widget-empty' }, h('p', {}, message), tool(id, label));
  const dateLabel = value => {
    const date = new Date(value + 'T00:00:00');
    if (Number.isNaN(date.getTime())) return value;
    const diff = Math.round((date - new Date(PrismU.today() + 'T00:00:00')) / 864e5);
    return diff < 0 ? 'Overdue by ' + -diff + 'd' : diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : 'In ' + diff + 'd';
  };
  const draw = async () => {
    const [favorites, recent, jobs, reading, sessions, time] = await Promise.all([
      PrismStore.get('tools:favorites', []), PrismStore.get('tools:recent', []), PrismStore.get('jobs', []),
      PrismStore.get('readlist', []), PrismStore.get('sessions', []), PrismStore.get('time:' + PrismU.today(), {})
    ]);
    const pinned = $('#ntPinned');
    const ids = [...new Set([...favorites, ...recent])].filter(id => id !== 'home');
    pinned.replaceChildren(ids.length ? h('div', { class:'widget-links' }, ...ids.slice(0, 6).map(id => tool(id, (id === 'pdf' ? 'PDF Studio' : id.replace(/[-_]/g, ' '))))) : empty('Pin tools with the star in All tools.', 'home', 'Explore tools'));
    const jobBox = $('#ntJobs');
    const upcoming = jobs.filter(j => !['offer', 'rejected'].includes(j.status) && (j.followUp || j.deadline)).sort((a,b) => (a.followUp || a.deadline).localeCompare(b.followUp || b.deadline));
    jobBox.replaceChildren(upcoming.length ? h('div', {}, ...upcoming.slice(0, 3).map(j => h('div', { class:'widget-item' }, h('span', { class:'widget-dot' }), h('div', { class:'grow' }, h('strong', {}, j.role || 'Role', j.company ? ' · ' + j.company : ''), h('small', { class:'muted' }, (j.followUp ? 'Follow up ' : 'Deadline ') + dateLabel(j.followUp || j.deadline))))), tool('jobs', 'View pipeline')) : empty('Add a follow-up date to keep a job in view.', 'jobs', 'Job tracker'));
    const unread = reading.filter(x => !x.read).sort((a,b) => (b.t || 0) - (a.t || 0));
    $('#ntReading').replaceChildren(unread.length ? h('div', {}, ...unread.slice(0, 3).map(x => h('a', { class:'widget-item', href:'../tools/tools.html#readlist?id=' + encodeURIComponent(x.id) }, h('span',{class:'widget-dot'}), h('span',{class:'grow widget-title'}, x.title || x.url))), tool('readlist', 'Reading list')) : empty('Save pages for later from the command palette.', 'readlist', 'Reading list'));
    $('#ntSessions').replaceChildren(sessions.length ? h('div', {}, ...sessions.slice(0,3).map(x => h('div',{class:'widget-item'},h('span',{class:'widget-dot'}),h('span',{class:'grow widget-title'},x.name || 'Session'),h('small',{class:'muted'},(x.tabs || []).length + ' tabs'))),tool('sessions','Manage sessions')) : empty('Save a window to return to all its tabs.', 'sessions', 'Sessions'));
    const sites = Object.entries(time).filter(([,ms]) => ms > 0).sort((a,b) => b[1]-a[1]);
    const duration = ms => PrismU.fmtMin(ms);
    $('#ntTime').replaceChildren(sites.length ? h('div', {}, h('div',{class:'widget-total'},duration(sites.reduce((sum,[,ms])=>sum+ms,0)),' active today'), ...sites.slice(0,3).map(([host,ms])=>h('div',{class:'widget-item'},h('span',{class:'grow widget-title'},host),h('strong',{},duration(ms)))),tool('timedash','Time dashboard')) : empty('Active browsing time appears here as you use the web.', 'timedash', 'Time dashboard'));
  };
  return { init() {
    draw().catch(console.warn);
    PrismStore.onChange(ch => { if (['tools:favorites','tools:recent','jobs','readlist','sessions','time:' + PrismU.today()].some(key => key in ch)) draw().catch(console.warn); });
    setInterval(() => { if (!document.hidden) draw().catch(console.warn); }, 60000);
  } };
})();
