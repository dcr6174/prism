/* Loaded last. Reads settings once, runs early features now and the rest when the DOM is ready. */
(async () => {
  const P = window.__prism; if (!P || P.booted) return; P.booted = true;
  await P.load();
  P.start('early');
  P.ready(() => P.start('late'));
})();
