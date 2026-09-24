/* New Tab layouts: persisted per browser, keyboard operable, no remote state. */
const NewTabCustomize = (() => {
  const { h, $, toast } = UI;
  const IDS = ['todo', 'countdowns', 'recentclosed', 'tatkal', 'tasktimer', 'pomodoro', 'flashcards', 'pinned', 'jobs', 'reading', 'sessions', 'time'];
  const LABELS = { todo:'To-do', countdowns:'Countdowns', recentclosed:'Recently closed', tatkal:'Tatkal', tasktimer:'Task timer', pomodoro:'Pomodoro', flashcards:'Flashcards', pinned:'Pinned tools', jobs:'Job follow-ups', reading:'Reading queue', sessions:'Saved sessions', time:"Today's browsing" };
  const PRESETS = {
    minimal: ['todo', 'pinned'],
    daily: ['todo', 'countdowns', 'pomodoro', 'tasktimer', 'jobs', 'pinned'],
    full: IDS.slice()
  };
  const THEMES = ['auto', 'light', 'dark', 'lavender', 'peach', 'mint'];
  let S, config, privacy = false;
  const clean = value => {
    const savedOrder = Array.isArray(value?.order) ? value.order.filter(id => IDS.includes(id)) : [];
    const order = [...new Set([...savedOrder, ...IDS])];
    const hidden = Array.isArray(value?.hidden) ? value.hidden.filter(id => IDS.includes(id)) : [];
    const wide = Array.isArray(value?.wide) ? value.wide.filter(id => IDS.includes(id)) : [];
    return { order, hidden, wide, preset: value?.preset || 'full', theme: THEMES.includes(value?.theme) ? value.theme : 'auto' };
  };
  const available = id => {
    if (id === 'jobs') return S.on.jobtracker;
    if (id === 'reading') return S.on.readlist;
    if (id === 'sessions') return S.on.sessions;
    if (id === 'time') return S.on.timedash;
    if (id === 'pinned') return true;
    if (id === 'countdowns') return S.on.countdowns || S.on.appcount;
    return !!S.on[id];
  };
  const save = async () => { await PrismStore.set('newtab:layout', config); render(); };
  const applyTheme = theme => { document.documentElement.dataset.ntTheme = theme; document.documentElement.dataset.theme = theme === 'light' || theme === 'dark' ? theme : (S.theme || 'auto'); };
  const render = () => {
    const grid = $('#ntGrid');
    for (const id of config.order) {
      const el = grid.querySelector(`[data-widget="${id}"]`);
      if (!el) continue;
      grid.append(el); el.hidden = !available(id) || config.hidden.includes(id);
      el.classList.toggle('widget-wide', config.wide.includes(id));
    }
    document.body.classList.toggle('privacy-on', privacy);
    const button = $('#ntPrivacy'); button.setAttribute('aria-pressed', privacy); button.textContent = privacy ? '◉ Show details' : '◌ Privacy';
    applyTheme(config.theme);
    const panel = $('#ntEditor'); if (!panel.hidden) drawEditor();
  };
  const drawEditor = () => {
    const box = $('#ntEditor');
    const layout = h('div', { class: 'nt-preset row wrap' }, ...Object.keys(PRESETS).map(name => h('button', { class:'btn small' + (config.preset === name ? ' primary' : ''), 'aria-pressed': config.preset === name, onclick: async () => { config.order = [...PRESETS[name], ...IDS.filter(id => !PRESETS[name].includes(id))]; config.hidden = IDS.filter(id => !PRESETS[name].includes(id)); config.preset = name; await save(); } }, name[0].toUpperCase() + name.slice(1))));
    const themes = h('div', { class:'nt-preset row wrap' }, ...THEMES.map(theme => h('button', { class:'theme-choice' + (config.theme === theme ? ' chosen' : ''), 'data-theme-choice':theme, 'aria-pressed':config.theme === theme, onclick:async()=>{ config.theme=theme; await save(); } }, h('span', {class:'theme-swatch'}), theme[0].toUpperCase()+theme.slice(1))));
    const list = h('div', { class:'widget-settings' });
    const move = async (id, delta) => { const index=config.order.indexOf(id), other=index+delta; if(other<0 || other>=config.order.length)return; [config.order[index],config.order[other]]=[config.order[other],config.order[index]]; config.preset='custom'; await save(); list.querySelector(`[data-editor-id="${id}"] button[data-dir="${delta}"]`)?.focus(); };
    for (const [index, id] of config.order.entries()) {
      const enabled = available(id), visible = enabled && !config.hidden.includes(id);
      list.append(h('div', { class:'widget-setting', 'data-editor-id':id, draggable:enabled, ondragstart:e=>{e.dataTransfer.setData('text/plain',id);e.dataTransfer.effectAllowed='move';}, ondragover:e=>{e.preventDefault();}, ondrop:async e=>{e.preventDefault();const from=e.dataTransfer.getData('text/plain');if(!IDS.includes(from)||from===id)return;config.order.splice(config.order.indexOf(from),1);config.order.splice(config.order.indexOf(id),0,from);config.preset='custom';await save();} },
        h('span',{class:'drag-handle','aria-hidden':'true'},'⠿'),h('strong',{class:'grow'},LABELS[id]),
        enabled ? h('label',{class:'widget-check'},h('input',{type:'checkbox',checked:visible,onchange:async e=>{config.hidden=e.target.checked?config.hidden.filter(x=>x!==id):[...config.hidden,id];config.preset='custom';await save();}}),'Show') : h('a',{href:'../options/options.html#'+id,class:'small'},'Enable in Settings'),
        h('button',{class:'btn small',disabled:!enabled||index===0,'data-dir':-1,'aria-label':'Move '+LABELS[id]+' up',onclick:()=>move(id,-1)},'↑'),
        h('button',{class:'btn small',disabled:!enabled||index===IDS.length-1,'data-dir':1,'aria-label':'Move '+LABELS[id]+' down',onclick:()=>move(id,1)},'↓'),
        h('button',{class:'btn small',disabled:!enabled,'aria-pressed':config.wide.includes(id),'aria-label':(config.wide.includes(id)?'Use normal width for ':'Make wide ')+LABELS[id],onclick:async()=>{config.wide=config.wide.includes(id)?config.wide.filter(x=>x!==id):[...config.wide,id];await save();}},config.wide.includes(id)?'Wide ✓':'Wide')));
    }
    box.replaceChildren(h('div',{class:'row wrap'},h('div',{class:'grow'},h('h2',{},'Your new tab, your way'),h('p',{class:'muted small'},'Drag widgets or use the arrows. Changes save automatically.')),h('button',{class:'btn small',onclick:()=>{box.hidden=true;$('#ntCustomize').setAttribute('aria-expanded','false');$('#ntCustomize').focus();}},'Done')),
      h('h3',{},'Layout'),layout,h('h3',{},'Colors'),themes,h('h3',{},'Widgets'),list,
      h('button',{class:'btn small ghost',onclick:async()=>{config=clean(null);await save();toast('Layout restored');}},'Restore default layout'));
  };
  return { async init(settings) {
    S=settings; config=clean(await PrismStore.get('newtab:layout', null));
    privacy=sessionStorage.getItem('prism:privacy')==='true';
    $('#ntPrivacy').onclick=()=>{privacy=!privacy;sessionStorage.setItem('prism:privacy',String(privacy));if (privacy) { $('#q').value=''; $('#results').replaceChildren(); } render();};
    $('#ntCustomize').onclick=()=>{const box=$('#ntEditor');box.hidden=!box.hidden;$('#ntCustomize').setAttribute('aria-expanded',!box.hidden);render();};
    render();
  }, available: () => IDS.slice(), presets: PRESETS };
})();
