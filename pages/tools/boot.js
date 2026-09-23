(async () => {
  T.settings = await UI.theme();
  for (const k of Object.keys(T.secs)) if (T.secs[k].hidden) T.order.splice(T.order.indexOf(k), 1);
  const grpOrder = ['Overview', 'Tabs', 'Focus', 'Writing', 'Reading', 'QA', 'Career', 'Shopping', 'Files', 'Capture', 'Privacy'];
  T.order.sort((a, b) => grpOrder.indexOf(T.secs[a].group) - grpOrder.indexOf(T.secs[b].group));
  T.nav(); document.getElementById('navfind').oninput = T.nav;
  document.getElementById('theme-toggle').onclick = async () => {
    const dark = document.documentElement.dataset.theme === 'dark' || (document.documentElement.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const theme = dark ? 'light' : 'dark'; document.documentElement.dataset.theme = theme;
    await PrismStore.patch(s => { s.theme = theme; });
  };
  window.addEventListener('hashchange', T.render); T.render();
})();

