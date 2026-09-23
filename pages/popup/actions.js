/* Every PRISM action the palette and popup can run. page:true = needs a normal web page as the active tab. */
(function (g) {
  const send = (m) => chrome.runtime.sendMessage(m);
  const tab = (id, act, arg) => async (c) => send({ type: 'tab:run', tabId: c.tab.id, id, act, arg });
  const msg = (type, extra) => async (c) => send(Object.assign({ type, url: c.tab && c.tab.url, tabId: c.tab && c.tab.id }, extra || {}));
  const tool = (hash) => async () => chrome.tabs.create({ url: chrome.runtime.getURL('pages/tools/tools.html#' + hash) });
  const A = [];
  const a = (feature, label, run, o) => A.push(Object.assign({ feature, label, run }, o || {}));
  // tabs
  a('collapse', 'Collapse all tabs into a list', msg('collapse:all'));
  a('collapse', 'Open collapsed tab lists', tool('collapse'));
  a('dupes', 'Close duplicate tabs', msg('dupes:close'), { done: (n) => n + ' closed' });
  a('closetabs', 'Close other tabs', msg('tabs:close', { mode: 'others' }));
  a('closetabs', 'Close tabs to the right', msg('tabs:close', { mode: 'right' }));
  a('closetabs', 'Close all tabs from this site', msg('tabs:close', { mode: 'site' }));
  a('sessions', 'Save window as session', async (c) => send({ type: 'sessions:save', name: c.input || prompt('Session name?') || '' }), { done: () => 'Session saved' });
  a('sessions', 'Open saved sessions', tool('sessions'));
  a('grouptabs', 'Sort tabs by site', msg('tabs:sort'));
  a('grouptabs', 'Group tabs by site', msg('tabs:group'));
  a('grouptabs', 'Ungroup all tabs', msg('tabs:ungroup'));
  a('snooze', 'Snooze tab 1 hour', msg('snooze', { minutes: 60 }), { page: true });
  a('snooze', 'Snooze tab 3 hours', msg('snooze', { minutes: 180 }), { page: true });
  a('snooze', 'Snooze tab until tomorrow 9 AM', async (c) => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return send({ type: 'snooze', tabId: c.tab.id, until: d.getTime() }); }, { page: true });
  a('snooze', 'Snooze tab 1 week', msg('snooze', { minutes: 60 * 24 * 7 }), { page: true });
  a('mute', 'Mute all tabs except this one', msg('mute:others'));
  a('mute', 'Mute / unmute this tab', msg('mute:toggle'));
  a('ytunfinished', 'Unfinished YouTube videos', tool('unfinished'));
  // focus
  a('blocker', 'Block this site', msg('focus:block'), { page: true, done: () => 'Blocked' });
  a('lockdown', 'Start lockdown (allowlist only)', async (c) => send({ type: 'lockdown:start', minutes: parseInt(c.input) || undefined }), { done: () => 'Lockdown on' });
  a('pomodoro', 'Start Pomodoro', msg('pomo:start'), { done: () => 'Focus started' });
  a('pomodoro', 'Stop Pomodoro', msg('pomo:stop'), { done: () => 'Stopped' });
  a('timedash', 'Site time dashboard', tool('timedash'));
  // AI
  a('aisummary', 'Summarise page (on-device AI)', tab('aisummary', 'summarise'), { page: true, close: true });
  a('airewrite', 'Rewrite selection (on-device AI)', tab('airewrite', 'rewrite'), { page: true, close: true });
  a('aiproofread', 'Proofread selection (on-device AI)', tab('aiproofread', 'proofread'), { page: true, close: true });
  a('aipage', 'Send page to ChatGPT', tab('aipage', 'send', 'chatgpt'), { page: true, close: true });
  a('aipage', 'Send page to Claude', tab('aipage', 'send', 'claude'), { page: true, close: true });
  a('aipage', 'Send page to Gemini', tab('aipage', 'send', 'gemini'), { page: true, close: true });
  a('prompts', 'Edit prompt library', tool('prompts'));
  // reading
  a('markdown', 'Copy page as Markdown', tab('markdown', 'copy'), { page: true });
  a('markdown', 'Copy selection as Markdown', tab('markdown', 'selection'), { page: true });
  a('reader', 'Reader mode', tab('reader', 'open'), { page: true, close: true });
  a('tables', 'Copy tables (pick one)', tab('tables', 'pick'), { page: true, close: true });
  a('readlist', 'Save to reading list (offline copy)', tab('readlist', 'save'), { page: true });
  a('readlist', 'Open reading list', tool('readlist'));
  a('highlights', 'Highlights and notes', tool('highlights'));
  // page tools
  a('screenshot', 'Full-page screenshot', msg('shot:full'), { page: true, close: true });
  a('screenshot', 'Screenshot visible area', msg('shot:visible'), { page: true, close: true });
  a('mdlink', 'Copy Markdown link', tab('mdlink', 'copy'), { page: true });
  a('qr', 'QR code for this page', tab('qr', 'show'), { page: true, close: true });
  a('picker', 'Pick element to copy', tab('picker', 'pick'), { page: true, close: true });
  a('alllinks', 'Copy all links on page', tab('alllinks', 'copy'), { page: true });
  a('cleanlink', 'Copy clean link', async (c) => { const u = await send({ type: 'clean:url', url: c.tab.url }); await navigator.clipboard.writeText(u); return 'Clean link copied'; }, { page: true });
  a('clearsite', 'Clear this site (cache, cookies, storage)', msg('clearsite'), { page: true, done: (o) => 'Cleared ' + o });
  // clipboard
  a('cliphist', 'Clipboard history', tool('clipboard'));
  a('replies', 'Saved replies', tool('replies'));
  // QA
  a('bugreport', 'Copy bug report block', tab('bugreport', 'copy'), { page: true });
  a('locator', 'Pick element -> Playwright locator', tab('locator', 'pick'), { page: true, close: true });
  a('formfill', 'Fill form with fake data', tab('formfill', 'fill'), { page: true });
  a('testdata', 'Edge-case test data', tool('testdata'));
  a('jsonview', 'JSON viewer', tool('json'));
  a('storageview', 'Cookies + storage editor', tool('storage'), { page: true, pass: true });
  a('viewport', 'Show viewport size overlay', tab('viewport', 'overlay'), { page: true, close: true });
  for (const [n, w, h] of [['iPhone 15', 393, 852], ['Pixel 8', 412, 915], ['iPad', 820, 1180], ['Laptop', 1366, 768], ['Desktop', 1920, 1080]]) a('viewport', 'Resize to ' + n + ' (' + w + '×' + h + ')', msg('viewport:resize', { w, h }), { page: true });
  a('ruler', 'Pixel ruler', tab('ruler', 'start'), { page: true, close: true });
  a('eyedropper', 'Eyedropper (pick colour)', tab('eyedropper', 'pick'), { page: true, close: true });
  a('brokenlinks', 'Check broken links', tab('brokenlinks', 'check'), { page: true, close: true });
  a('disablejs', 'Toggle JavaScript on this site', msg('site:toggle', { kind: 'javascript' }), { page: true, done: (s) => 'JavaScript ' + s + 'ed' });
  a('disablejs', 'Toggle images on this site', msg('site:toggle', { kind: 'images' }), { page: true, done: (s) => 'Images ' + s + 'ed' });
  a('disablejs', 'Toggle CSS on this tab', tab('disablejs', 'css'), { page: true });
  a('perf', 'Performance snapshot', tab('perf', 'show'), { page: true, close: true });
  a('annotate', 'Annotate last screenshot', tool('annotate'));
  a('a11y', 'Accessibility check', tab('a11y', 'check'), { page: true, close: true });
  // job
  a('jobtracker', 'Save this job to tracker', tab('jobtracker', 'save'), { page: true });
  a('jobtracker', 'Open job tracker', tool('jobs'));
  a('autofill', 'Autofill application form', tab('autofill', 'fill'), { page: true });
  a('pip', 'Picture-in-Picture', tab('pip', 'toggle'), { page: true, close: true });
  // lost work
  a('undisable', 'Un-disable this page (buttons, copy, right-click)', tab('undisable', 'run'), { page: true });
  a('formrecover', 'Restore typed text on this page', tab('formrecover', 'restore'), { page: true, close: true });
  a('sticky', 'Hide sticky headers', tab('sticky', 'toggle'), { page: true });
  // keyboard / reading
  a('regexfind', 'Regex find in page', tab('regexfind', 'open'), { page: true, close: true });
  a('cite', 'Cite this page (APA / MLA / IEEE)', tab('cite', 'show'), { page: true, close: true });
  a('wordcount', 'Word count', tab('wordcount', 'show'), { page: true, close: true });
  a('transcript', 'Copy YouTube transcript', tab('transcript', 'copy'), { page: true });
  a('transcript', 'Summarise YouTube transcript (on-device)', tab('transcript', 'summarise'), { page: true, close: true });
  a('translate', 'Translate selection / page (on-device)', tab('translate', 'run'), { page: true, close: true });
  a('readaloud', 'Read page aloud', tab('readaloud', 'read'), { page: true });
  a('readaloud', 'Stop reading aloud', msg('tts:stop'));
  a('bionic', 'Bionic reading on this page', tab('bionic', 'toggle'), { page: true });
  a('dyslexia', 'Dyslexia-friendly mode on this page', tab('dyslexia', 'toggle'), { page: true });
  a('darkmode', 'Force dark mode on this page', tab('darkmode', 'toggle'), { page: true });
  a('mask', 'Mask PAN / Aadhaar / phone on page', tab('mask', 'toggle'), { page: true });
  a('mask', 'Masked full-page screenshot', msg('shot:full', { mask: true }), { page: true, close: true });
  a('pricelog', 'Price log', tool('prices'));
  a('batchdl', 'Batch download images / PDFs', tab('batchdl', 'collect'), { page: true });
  a('dlpanel', 'Downloads panel', tool('downloads'));
  a('pdftools', 'PDF merge / split / rotate', tool('pdf'));
  a('pdfsign', 'Fill + sign PDF', tool('sign'));
  a('img2pdf', 'Images to PDF', tool('img2pdf'));
  a('imgcompress', 'Compress image under 200 KB', tool('compress'));
  a('containers', 'Site profiles (swap logins)', tool('containers'));
  a('recorder', 'Screen recorder', tool('recorder'));
  a('replay', 'Bug replay buffer', tool('replay'));
  a('gif', 'Make a GIF', tool('gif'));
  a('recipe', 'Recipe mode', tab('recipe', 'show'), { page: true, close: true });
  a('pagemonitor', 'Watch this page for changes', msg('monitor:add'), { page: true, done: () => 'Watching' });
  a('pagemonitor', 'Page monitors', tool('monitors'));
  a('pubdate', 'Find real publish date', tab('pubdate', 'show'), { page: true });
  a('extaudit', 'Extension permission audit', tool('extensions'));
  a('flashcards', 'Review flashcards', tool('flashcards'));
  a('cleanpdf', 'Clean PDF text (paste)', tool('cleantext'));
  a('vidnotes', 'Video notes', tool('vidnotes'));
  a('core', 'PRISM settings', async () => chrome.runtime.openOptionsPage());
  a('core', 'PRISM tools', tool(''));
  g.PRISM_ACTIONS = A;
})(self);
