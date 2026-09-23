(function () {
  const { h } = UI;
  const icons = { Tabs: '▱', Focus: '◷', Writing: 'Aa', Reading: '▤', QA: '⌘', Career: '↗', Shopping: '◇', Files: '⊞', Capture: '◉', Privacy: '◎' };
  T.sec('home', { group: 'Overview', title: 'Small tools. Big possibilities.', sub: 'A calmer place to get things done. Pick a tool and make it yours.', async render(b) {
    let favorites = await PrismStore.get('tools:favorites', []);
    const recent = await PrismStore.get('tools:recent', []);
    let filter = 'All tools', query = '';
    const keys = T.order.filter(k => k !== 'home' && !T.secs[k].hidden);
    const groups = [...new Set(keys.map(k => T.secs[k].group))];
    const grid = h('div', { class: 'tool-grid' });
    const count = h('span', { class: 'muted small', role: 'status' });
    const search = h('input', { type: 'search', class: 'tool-search', placeholder: 'What would you like to do?', 'aria-label': 'Search all tools', oninput: e => { query = e.target.value.toLowerCase().trim(); draw(); } });
    const filters = h('div', { class: 'tool-filters', 'aria-label': 'Tool categories' });
    const draw = () => {
      filters.replaceChildren(...['All tools', 'Favorites', ...groups].map(group => h('button', { class: 'btn small' + (filter === group ? ' primary' : ''), 'aria-pressed': filter === group, onclick: () => { filter = group; draw(); } }, group)));
      const shown = keys.filter(k => { const s = T.secs[k]; return (filter === 'All tools' || (filter === 'Favorites' ? favorites.includes(k) : s.group === filter)) && (!query || (s.title + ' ' + s.sub + ' ' + s.group).toLowerCase().includes(query)); });
      count.textContent = shown.length + ' tools';
      grid.replaceChildren(...shown.map(k => {
        const s = T.secs[k], off = s.feature && T.settings.on[s.feature] === false;
        return h('article', { class: 'tool-card', 'data-tone': groups.indexOf(s.group) % 5 },
          h('div', { class: 'row' }, h('span', { class: 'tool-icon', 'aria-hidden': 'true' }, icons[s.group] || '✦'), h('span', { class: 'grow' }), h('button', { class: 'favorite', 'aria-label': (favorites.includes(k) ? 'Unpin ' : 'Pin ') + s.title, 'aria-pressed': favorites.includes(k), onclick: async () => { favorites = favorites.includes(k) ? favorites.filter(x => x !== k) : [...favorites, k]; await PrismStore.set('tools:favorites', favorites); draw(); } }, favorites.includes(k) ? '★' : '☆')),
          h('a', { class: 'tool-card-link', href: '#' + k }, h('h3', {}, s.title), h('p', {}, s.sub || 'Open this tool.')),
          h('div', { class: 'row' }, h('span', { class: 'small muted grow' }, off ? 'Off in settings' : s.group), h('a', { class: 'tool-open', href: '#' + k, 'aria-label': 'Open ' + s.title }, '↗')));
      }));
      if (!shown.length) grid.append(h('div', { class: 'empty' }, filter === 'Favorites' && !query ? 'Pin a tool with the star to keep it here.' : 'No tools match. Try a shorter search or another category.'));
    };
    const quick = h('div', { class: 'quick-start' }, h('div', { class: 'hero-copy' }, h('span', { class: 'eyebrow' }, 'YOUR FILES, IN GOOD HANDS'), h('h2', {}, 'Meet your new PDF Studio.'), h('p', {}, 'Merge, split, organize and finish your documents. Right here, on your device.'), h('a', { class: 'btn primary', href: '#pdf' }, 'Open PDF Studio ↗')), h('div', { class: 'paper-art', 'aria-hidden': 'true' }, h('div', { class: 'paper paper-back' }, '↗'), h('div', { class: 'paper paper-front' }, h('span', {}, 'PDF'), h('i'), h('i'), h('i'), h('b', {}, '✓'))));
    const recentKeys = recent.filter(k => T.secs[k] && !T.secs[k].hidden).slice(0, 4);
    b.append(quick);
    if (recentKeys.length) b.append(h('div', { class: 'recent-tools row wrap' }, h('span', { class: 'muted small' }, 'Jump back in'), ...recentKeys.map(k => h('a', { class: 'btn small', href: '#' + k }, T.secs[k].title))));
    b.append(h('div', { class: 'directory-heading row wrap' }, h('h2', { class: 'grow' }, 'Explore your toolkit'), count), search, filters, grid);
    draw();
  } });
})();
