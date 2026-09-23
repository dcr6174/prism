(async () => {
  T.settings = await UI.theme();
  for (const k of Object.keys(T.secs)) if (T.secs[k].hidden) T.order.splice(T.order.indexOf(k), 1);
  const grpOrder = ['Tabs', 'Focus', 'Writing', 'Reading', 'QA', 'Career', 'Shopping', 'Files', 'Capture', 'Privacy'];
  T.order.sort((a, b) => grpOrder.indexOf(T.secs[a].group) - grpOrder.indexOf(T.secs[b].group));
  T.nav(); document.getElementById('navfind').oninput = T.nav;
  window.addEventListener('hashchange', T.render); T.render();
})();
