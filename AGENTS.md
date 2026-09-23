# AGENTS.md - how PRISM is built

Rules for anyone (human or coding agent) changing this repo.

## Layout

```
manifest.json            MV3. No host permissions at install; <all_urls> is optional and granted per site.
shared/registry.js       The list of all features: number, id, name, group, where, default on/off, settings (cfg).
shared/store.js          PrismStore (chrome.storage.local helpers) and PrismU (math, lakh/crore, URL helpers).
shared/ui.css, ui.js     The one design system for extension pages. Inter font, light/dark via data-theme.
background/sw.js         Service worker. Imports core.js then focus.js, tabs.js, tools.js.
background/core.js       BG.def(id, spec) plugin host: msg handlers, menus, alarms, commands, tab events.
content/core.js          window.__prism (P): P.def(id, spec), shadow-DOM UI (toast, panel, tip), helpers.
content/features/<id>.js One file per page feature. Loaded on allowed sites, or on demand for popup actions.
content/boot.js          Runs each enabled feature's run() when its sites match.
pages/newtab|popup|options|tools|blocked|intent   Extension pages.
pages/popup/actions.js   PRISM_ACTIONS: every palette action, tied to a feature id.
lib/                     Vendored libraries (see THIRD_PARTY_NOTICES.md). Do not edit.
```

## Adding a feature

1. Add one line to `shared/registry.js` with the next number, a unique `id`, and `where` tags:
   `nt` new tab, `bg` background, `pop` popup/palette action, `tool` Tools page, `cs` every allowed site, `site` specific sites.
2. Put the code where the tags say:
   - page code: `content/features/<id>.js` with `P.def('<id>', { sites, run, actions })`
   - background: `BG.def('<id>', { msg, menus, alarms, commands, ... })` in the matching background file
   - Tools page: `T.sec('<hash>', { group, title, sub, feature: '<id>', render })`
   - palette: `a('<id>', 'Label', handler)` in `pages/popup/actions.js`
3. Every `cs`/`site` id must have a file in `content/features/`, because registration loads a file for every such id.
4. Read settings with `P.cfg(id)` / `BG.cfg(id)`. Check `BG.on(id)` in background code; the host already skips disabled features.

## Conventions

- Plain JS, no build step, no frameworks, no CDN. Bundle what you need in `lib/` with its license.
- Local-first: data in `chrome.storage.local`. No telemetry. Network only for a feature the user turned on, and only free, keyless services.
- Page UI goes inside the shadow root from `P.ui` so site CSS cannot break it and PRISM cannot break the site.
- Never auto-submit forms, solve captchas or press buy/book buttons. Fill, then let the person act.
- Fail quietly per feature: one broken feature must not stop the others (`guard` in background, try/catch in content boot).
- Short, plain UI text. No exclamation marks.
- Keep permissions minimal. If a new permission is needed, add a row to the README table.

## Testing

There is no test runner in the repo yet. The v0.1 checks were a local puppeteer harness that loads a copy of the extension with `<all_urls>` granted, opens a test page, runs every page action, opens every Tools section, and fails on any page or service-worker error. Before calling a feature done, load it unpacked and use it on a real site.
