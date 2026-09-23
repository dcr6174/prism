/* PRISM service worker entry. Classic worker: everything loads synchronously so listeners attach on first run. */
importScripts('../shared/registry.js', '../shared/store.js', 'core.js', 'focus.js', 'tabs.js', 'tools.js');
