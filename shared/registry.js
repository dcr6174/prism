/* PRISM feature catalog. One entry per feature, numbered exactly like the v0.1 list.
   f(n, id, name, group, where, on, desc, cfg)
   where: surfaces the feature lives on - cs (page script on granted sites), site (page script on specific sites),
          nt (new tab), bg (background), pop (action on current tab, via popup/palette), tool (PRISM Tools page)
   on: enabled by default?  cfg: settings shown on the Options page. */
(function (g) {
  const L = [];
  const f = (n, id, name, group, where, on, desc, cfg) => L.push({ n, id, name, group, where: where.split(' '), on, desc, cfg: cfg || [] });
  const t = (k, label, def, type) => ({ k, label, def, type: type || (typeof def === 'number' ? 'number' : typeof def === 'boolean' ? 'bool' : Array.isArray(def) ? 'list' : 'text') });

  // NEW TAB + LAUNCHER
  f(1, 'palette', 'Command palette', 'New tab + launcher', 'nt pop', true, 'Ctrl+K on the new tab, Alt+K anywhere. Search tabs, bookmarks, history and every PRISM action.');
  f(2, 'aliases', 'Search aliases', 'New tab + launcher', 'nt pop', true, 'Type "yt lofi" or "gpt explain X" to search a site directly.', [t('aliases', 'Aliases (alias = URL with %s)', ['g = https://www.google.com/search?q=%s', 'yt = https://www.youtube.com/results?search_query=%s', 'gpt = https://chatgpt.com/?q=%s', 'cl = https://claude.ai/new?q=%s', 'ppx = https://www.perplexity.ai/search?q=%s', 'gh = https://github.com/search?q=%s', 'amz = https://www.amazon.in/s?k=%s', 'fk = https://www.flipkart.com/search?q=%s', 'nk = https://www.naukri.com/%s-jobs', 'li = https://www.linkedin.com/jobs/search/?keywords=%s', 'w = https://en.wikipedia.org/w/index.php?search=%s', 'maps = https://www.google.com/maps/search/%s'])]);
  f(3, 'onebox', 'One box search', 'New tab + launcher', 'nt pop', true, 'One search box over bookmarks, history and open tabs.');
  f(4, 'quicklinks', 'Quick links', 'New tab + launcher', 'nt', true, 'Grid of your favourite sites with custom icons.');
  f(5, 'clock', 'Clock, greeting, focus note', 'New tab + launcher', 'nt', true, 'Big clock, date, greeting and one line for today\'s focus.', [t('name', 'Your name', '')]);
  f(6, 'todo', 'Mini to-do', 'New tab + launcher', 'nt', true, 'A short local to-do list on the new tab.');
  f(7, 'weather', 'Weather', 'New tab + launcher', 'nt', true, 'Free Open-Meteo forecast, no key.', [t('city', 'City', 'Bengaluru')]);
  f(8, 'countdowns', 'Countdowns', 'New tab + launcher', 'nt', true, 'Days left to interviews and deadlines.');
  f(9, 'recentclosed', 'Recently closed', 'New tab + launcher', 'nt pop', true, 'Reopen tabs you closed by mistake.');
  // TABS & SESSIONS
  f(10, 'collapse', 'Collapse all tabs', 'Tabs & sessions', 'bg pop tool', true, 'Close every tab into a restorable list (OneTab style).');
  f(11, 'dupes', 'Duplicate tabs', 'Tabs & sessions', 'bg pop', true, 'Find and close duplicate tabs.', [t('auto', 'Close a duplicate automatically when it opens', false)]);
  f(12, 'closetabs', 'Close others / right / same site', 'Tabs & sessions', 'bg pop', true, 'Right-click page menu and palette actions.');
  f(13, 'sessions', 'Named sessions', 'Tabs & sessions', 'bg pop tool', true, 'Save a window as a named session and restore it later.');
  f(14, 'autosleep', 'Auto-sleep idle tabs', 'Tabs & sessions', 'bg', true, 'Discards tabs you have not touched for a while to free memory.', [t('minutes', 'Sleep after (minutes)', 45)]);
  f(15, 'findtab', 'Find tab', 'Tabs & sessions', 'pop', true, 'Search open tabs across all windows (in the palette).');
  f(16, 'grouptabs', 'Sort / group by site', 'Tabs & sessions', 'bg pop', true, 'Sort tabs by site or put each site in its own tab group.');
  // FOCUS & BLOCKING
  f(17, 'blocker', 'Site blocker', 'Focus & blocking', 'bg', true, 'Real block: the page never loads.', [t('sites', 'Blocked sites', [])]);
  f(18, 'schedules', 'Block schedules', 'Focus & blocking', 'bg', true, 'Only block during set hours.', [t('rules', 'Rules (site = days hours)', ['reddit.com = mon-fri 09:00-18:00'])]);
  f(19, 'allowance', 'Daily time allowance', 'Focus & blocking', 'bg', true, 'Minutes per day per site, then blocked.', [t('rules', 'Rules (site = minutes)', ['youtube.com = 60'])]);
  f(20, 'lockdown', 'Lockdown mode', 'Focus & blocking', 'bg pop', true, 'For N minutes, only allowlisted sites open.', [t('allow', 'Allowlist', ['google.com', 'github.com', 'mail.google.com']), t('minutes', 'Default minutes', 50)]);
  f(21, 'friction', 'Friction unlock', 'Focus & blocking', 'bg', true, 'Unblock only after waiting or typing a sentence.', [t('seconds', 'Wait seconds', 30), t('sentence', 'Sentence to type', 'I am choosing to lose focus right now'), t('unlockMinutes', 'Unlock lasts (minutes)', 5)]);
  f(22, 'pomodoro', 'Pomodoro', 'Focus & blocking', 'bg pop', true, 'Timer on the toolbar icon. Blocks your list while focusing.', [t('work', 'Focus minutes', 25), t('rest', 'Break minutes', 5), t('blockDuring', 'Block blocked-sites list during focus', true)]);
  f(23, 'blockmsg', 'Blocked-page message', 'Focus & blocking', 'bg', true, 'Your own line on the blocked page.', [t('message', 'Message', 'Back to the thing that matters.')]);
  // AI, NO KEYS
  f(24, 'aisummary', 'On-device summary', 'AI, no keys', 'pop cs', true, 'Summarise the page with Chrome\'s built-in Gemini Nano. Falls back to your chat site.');
  f(25, 'airewrite', 'On-device rewrite', 'AI, no keys', 'pop cs', true, 'Rewrite selected text on-device.');
  f(26, 'aiproofread', 'On-device proofread', 'AI, no keys', 'pop cs', true, 'Proofread selected text on-device.');
  f(27, 'aisend', 'Send selection to chat', 'AI, no keys', 'bg', true, 'Right-click text -> ChatGPT / Claude / Gemini with a saved prompt.', [t('target', 'Default chat (chatgpt, claude, gemini, perplexity)', 'chatgpt')]);
  f(28, 'prompts', 'Prompt library', 'AI, no keys', 'bg tool', true, 'Prompts with {{text}} variables.');
  f(29, 'aipage', 'Send page to chat', 'AI, no keys', 'pop site', true, 'Send the cleaned page as context; optional auto-submit.', [t('autosubmit', 'Auto-submit after filling', true)]);
  // READING & CAPTURE
  f(30, 'markdown', 'Copy as Markdown', 'Reading & capture', 'pop', true, 'Page or selection as clean Markdown.');
  f(31, 'reader', 'Reader mode', 'Reading & capture', 'pop', true, 'Clutter-free reading view with font, width and dark controls.');
  f(32, 'tables', 'Copy tables', 'Reading & capture', 'pop cs', true, 'Copy any HTML table as CSV or Markdown.');
  f(33, 'readlist', 'Reading list + snapshots', 'Reading & capture', 'pop tool', true, 'Save a page with an offline text snapshot.');
  f(34, 'highlights', 'Highlights + notes', 'Reading & capture', 'cs tool', true, 'Select text, press H or use the bubble to highlight. Restored on revisit.');
  f(35, 'readtime', 'Reading-time badge', 'Reading & capture', 'cs', true, 'Minutes to read on the toolbar badge.');
  // PAGE TOOLS
  f(36, 'allowpaste', 'Allow paste', 'Page tools', 'cs', true, 'Paste into fields that block it.');
  f(37, 'screenshot', 'Full-page screenshot', 'Page tools', 'pop tool', true, 'Scroll-stitched PNG of the whole page.');
  f(38, 'mdlink', 'Copy Markdown link', 'Page tools', 'pop', true, '[Title](url) for tickets and docs.');
  f(39, 'qr', 'QR code', 'Page tools', 'pop', true, 'Move the page to your phone.');
  f(40, 'picker', 'Element picker', 'Page tools', 'pop', true, 'Click any element to copy its text, link or image.');
  f(41, 'alllinks', 'Copy all links', 'Page tools', 'pop', true, 'Every link on the page, de-duplicated.');
  f(42, 'zoommem', 'Per-site zoom + font', 'Page tools', 'bg cs', true, 'Remembers zoom and a font-size bump per site.', [t('fonts', 'Font bump (site = percent)', [])]);
  // PRIVACY
  f(43, 'cleanlink', 'Copy clean link', 'Privacy', 'bg pop', true, 'Strips utm, fbclid, gclid and friends.');
  f(44, 'amp', 'AMP -> original', 'Privacy', 'cs', true, 'Leaves AMP pages for the real article.');
  f(45, 'clearsite', 'Clear this site', 'Privacy', 'pop', true, 'One click: cache, cookies, storage for the current site.');
  // CLIPBOARD & SNIPPETS
  f(46, 'cliphist', 'Clipboard history', 'Clipboard & snippets', 'cs tool', true, 'Local history of what you copy, with search and pins.', [t('max', 'Keep last N', 200)]);
  f(47, 'expander', 'Text expander', 'Clipboard & snippets', 'cs', true, 'Type ;addr and it expands.', [t('snippets', 'Snippets (;key = text, use \\n for new line)', [';sig = Thanks and regards,\\nYour Name', ';loc = City, India', ';np = Notice period: 30 days'])]);
  f(48, 'replies', 'Saved replies', 'Clipboard & snippets', 'pop tool', true, 'A library of replies, one click to copy.');
  f(49, 'scratch', 'Scratchpad', 'Clipboard & snippets', 'pop', true, 'Quick note in the popup.');
  // QA / DEV KIT
  f(50, 'copyurl', 'Copy URL shortcut', 'QA / dev kit', 'bg', true, 'Alt+Shift+U copies the current URL.');
  f(51, 'bugreport', 'Bug-report grabber', 'QA / dev kit', 'pop cs', true, 'URL, browser, viewport, time and console errors in one block.');
  f(52, 'errbadge', 'Console-error badge', 'QA / dev kit', 'cs bg', true, 'Error count on the toolbar icon.');
  f(53, 'locator', 'Locator picker', 'QA / dev kit', 'pop', true, 'Click an element -> Playwright locator, CSS and XPath.');
  f(54, 'testdata', 'Edge-case test data', 'QA / dev kit', 'bg tool', true, 'Right-click a field -> insert long strings, emoji, injection, bad emails.');
  f(55, 'formfill', 'Form filler', 'QA / dev kit', 'pop tool', true, 'Fill forms with fake-data profiles.');
  f(56, 'jsonview', 'JSON viewer', 'QA / dev kit', 'cs tool', true, 'Pretty, collapsible JSON for raw API responses.');
  f(57, 'storageview', 'Cookies + storage editor', 'QA / dev kit', 'tool', true, 'View and edit cookies and localStorage for the current site.');
  f(58, 'viewport', 'Viewport overlay + presets', 'QA / dev kit', 'pop', true, 'Shows size; resize the window to device presets.');
  f(59, 'ruler', 'Pixel ruler', 'QA / dev kit', 'pop', true, 'Measure elements and distances.');
  f(60, 'eyedropper', 'Eyedropper', 'QA / dev kit', 'pop', true, 'Pick any colour on the screen.');
  f(61, 'brokenlinks', 'Broken-link checker', 'QA / dev kit', 'pop', true, 'Checks every link on the page.');
  f(62, 'disablejs', 'Disable JS / CSS / images', 'QA / dev kit', 'pop', true, 'Per site, one click.');
  f(63, 'perf', 'Performance snapshot', 'QA / dev kit', 'pop', true, 'Navigation timing, sizes, requests.');
  f(64, 'annotate', 'Screenshot annotate + blur', 'QA / dev kit', 'tool', true, 'Draw, arrow, box, blur.');
  f(65, 'a11y', 'Accessibility checks', 'QA / dev kit', 'pop', true, 'Missing alt, heading outline, low contrast.');
  // JOB-HUNT COPILOT
  f(66, 'jobtracker', 'Job tracker', 'Job-hunt copilot', 'pop tool', true, 'Save a job page in one click, move it through a pipeline.');
  f(67, 'keywords', 'Job keyword highlighter', 'Job-hunt copilot', 'cs', true, 'Highlights your stack on job posts.', [t('words', 'Your keywords', ['Playwright', 'Selenium', 'API testing', 'Postman', 'TypeScript', 'JavaScript', 'Python', 'LLM', 'Azure DevOps', 'Remote']), t('avoid', 'Red-flag words', ['onsite only', 'bond', 'unpaid'])]);
  f(68, 'autofill', 'Application autofill', 'Job-hunt copilot', 'pop', true, 'Fill name, email, phone, links, years from your profile.', [t('profile', 'Profile (field = value)', ['name = ', 'email = ', 'phone = ', 'city = ', 'linkedin = ', 'github = ', 'experience = ', 'notice = '])]);
  f(69, 'recruiter', 'Recruiter-reply snippets', 'Job-hunt copilot', 'tool', true, 'Ready replies for recruiters (in Saved replies).');
  f(70, 'appcount', 'Application countdowns', 'Job-hunt copilot', 'nt', true, 'Deadlines from the job tracker on the new tab.');
  // YOUTUBE
  f(71, 'ytwatchlater', 'Watch Later quick-add', 'YouTube', 'site', true, 'A button on the player; W key.');
  f(72, 'yttheater', 'Auto theater + speed per channel', 'YouTube', 'site', true, 'Theater mode on open; remembers speed per channel.');
  f(73, 'ytshorts', 'Hide Shorts', 'YouTube', 'site', true, 'Removes Shorts shelves and tabs.');
  f(74, 'ytplaylist', 'Playlist quick add/remove', 'YouTube', 'site', true, 'P key opens Save to playlist.');
  f(75, 'pip', 'Picture-in-Picture', 'YouTube', 'pop site', true, 'One click PiP for any video.');
  // COMFORT
  f(76, 'darkmode', 'Force dark mode', 'Comfort', 'cs', false, 'Dark mode on chosen sites.', [t('sites', 'Sites', [])]);
  f(77, 'caret', 'Caret browsing + font adjust', 'Comfort', 'cs', true, 'Alt+C: move a caret with arrow keys. Alt+= / Alt+- font size.');
  // LOST WORK & NAGS
  f(78, 'formrecover', 'Form-text recovery', 'Lost work & nags', 'cs', true, 'Autosaves what you type; restore after a crash.');
  f(79, 'leaveguard', 'Leave-page guard', 'Lost work & nags', 'cs', true, 'Warns before closing a tab with unsent text.');
  f(80, 'undisable', 'Un-disable', 'Lost work & nags', 'pop cs', true, 'Re-enable greyed buttons, right-click and copy.');
  f(81, 'autocompletefix', 'Autocomplete fixer', 'Lost work & nags', 'cs', true, 'Turns browser autocomplete back on.');
  f(82, 'datepicker', 'Smart date picker', 'Lost work & nags', 'cs', true, 'Type "next fri" or "12/10" into date fields.');
  f(83, 'showpass', 'Show-password eye', 'Lost work & nags', 'cs', true, 'Eye button on password fields.');
  f(84, 'cookiereject', 'Cookie-banner auto-reject', 'Lost work & nags', 'cs', true, 'Clicks Reject on consent banners.');
  f(85, 'notifdeny', 'Auto-deny notifications', 'Lost work & nags', 'bg', true, 'Blocks "Allow notifications?" prompts, with an allowlist.', [t('allow', 'Allowed sites', ['mail.google.com', 'web.whatsapp.com'])]);
  f(86, 'nags', 'Nag killer', 'Lost work & nags', 'cs', true, 'Hides Google one-tap, newsletter modals, "open in app".');
  f(87, 'sticky', 'Hide sticky headers', 'Lost work & nags', 'pop cs', true, 'Alt+S or palette toggles sticky bars off.');
  f(88, 'noautoplay', 'Stop autoplay', 'Lost work & nags', 'cs', true, 'Videos wait for you to press play.', [t('except', 'Except sites', ['youtube.com', 'netflix.com', 'hotstar.com', 'primevideo.com'])]);
  f(89, 'keywordfilter', 'Keyword filter', 'Lost work & nags', 'cs', true, 'Hide posts containing words you pick.', [t('words', 'Hide posts with', []) ]);
  // KEYBOARD
  f(90, 'linkhints', 'Link hints', 'Keyboard', 'cs', true, 'Press F (outside text boxes), then letters, to click any link.');
  f(91, 'remap', 'Shortcut remap', 'Keyboard', 'cs', true, 'Kill or remap page shortcuts like Ctrl+D.', [t('rules', 'Rules (keys = action). Actions: block, copyurl, top, bottom, back', ['ctrl+d = block'])]);
  f(92, 'jumpinput', 'Jump to first input', 'Keyboard', 'cs', true, 'Press I (outside text boxes) to focus the first input. J/K scroll.');
  f(93, 'calc', 'Palette calculator', 'Keyboard', 'nt pop', true, 'Type = 12*18% or 5 lakh in the palette.');
  f(94, 'regexfind', 'Regex find', 'Keyboard', 'cs pop', true, 'Alt+F: find with regex, count and jump.');
  // TABS ROUND 2
  f(95, 'lockpin', 'Locked pinned tabs', 'Tabs round 2', 'bg cs', true, 'Pinned tabs reopen if closed; their links open in new tabs.');
  f(96, 'tablimit', 'Tab limit', 'Tabs round 2', 'bg', false, 'At N tabs the oldest goes to the saved list.', [t('max', 'Max tabs per window', 20)]);
  f(97, 'snooze', 'Tab snooze', 'Tabs round 2', 'bg pop', true, 'Close a tab now, it comes back later.');
  f(98, 'ytunfinished', 'Unfinished videos', 'Tabs round 2', 'site pop', true, 'Videos you left halfway.');
  f(99, 'mute', 'Mute memory / mute others', 'Tabs round 2', 'bg pop', true, 'Remembers muted sites; mute all but this tab.');
  // STUDENTS & RESEARCH
  f(100, 'cite', 'Citations', 'Students & research', 'pop', true, 'APA, MLA and IEEE from page metadata.');
  f(101, 'freepdf', 'Free-PDF finder', 'Students & research', 'cs', true, 'Shows open-access PDF links on paper pages (links only).');
  f(102, 'cleanpdf', 'Clean PDF text copy', 'Students & research', 'bg tool', true, 'Fix broken line breaks and hyphens in copied text.');
  f(103, 'wordcount', 'Word counter', 'Students & research', 'cs pop', true, 'Words and characters for the selection or a text box.');
  f(104, 'flashcards', 'Flashcards', 'Students & research', 'nt tool', true, 'Turn highlights into spaced-repetition cards.');
  f(105, 'datefilter', 'Search date filter', 'Students & research', 'site', true, 'Past day / week / month / year buttons on Google.');
  // VIDEO & LECTURES
  f(106, 'speed', 'Speed on every video', 'Video & lectures', 'cs', true, 'S / D keys slower / faster, R reset. 0.1x-16x.');
  f(107, 'skipsilence', 'Skip silences / intro', 'Video & lectures', 'cs', false, 'Speeds through silent parts; skip-intro key.', [t('intro', 'Skip intro seconds (Shift+I)', 85)]);
  f(108, 'vidnotes', 'Timestamped notes', 'Video & lectures', 'cs tool', true, 'Alt+N adds a note at the current time.');
  f(109, 'transcript', 'YouTube transcript', 'Video & lectures', 'site pop', true, 'Copy clean transcript; summarise on-device.');
  f(110, 'abloop', 'A-B loop', 'Video & lectures', 'cs', true, '[ sets A, ] sets B, \\ clears.');
  f(111, 'resume', 'Resume where you stopped', 'Video & lectures', 'cs', true, 'Long videos pick up where you left off.');
  // LANGUAGE & ACCESS
  f(112, 'translate', 'On-device translate', 'Language & access', 'pop cs', true, 'Chrome\'s built-in Translator. No keys.', [t('to', 'Translate to (language code)', 'en')]);
  f(113, 'dictionary', 'Double-click dictionary', 'Language & access', 'cs bg', true, 'Alt + double-click a word for its meaning.');
  f(114, 'readaloud', 'Read aloud', 'Language & access', 'pop bg', true, 'Reads the selection or page aloud.', [t('rate', 'Speed', 1.1)]);
  f(115, 'dyslexia', 'Dyslexia-friendly mode', 'Language & access', 'cs', false, 'OpenDyslexic font, spacing, reading ruler.', [t('sites', 'Sites (empty = toggle from palette)', [])]);
  f(116, 'bigcursor', 'Big cursor + focus ring', 'Language & access', 'cs', false, 'Large cursor, strong focus outline, less motion.');
  f(117, 'bionic', 'Bionic reading', 'Language & access', 'pop', true, 'Bold the first letters of each word.');
  // SHOPPING
  f(118, 'pricelog', 'Price log + chart', 'Shopping', 'site tool', true, 'Records prices on Amazon, Flipkart, Myntra pages you visit.');
  f(119, 'pricewatch', 'Price-drop watch', 'Shopping', 'bg tool', true, 'Re-checks watched products every few hours while Chrome is open.', [t('hours', 'Check every (hours)', 6)]);
  f(120, 'unitprice', 'Unit-price calculator', 'Shopping', 'cs', true, 'Shows Rs per 100g / per piece next to prices.');
  f(121, 'fakediscount', 'Fake-discount flagger', 'Shopping', 'cs', true, 'Flags countdowns and "only N left" that reset.');
  f(122, 'coupons', 'Coupon memory', 'Shopping', 'cs', true, 'Remembers codes you used per site.');
  // INDIA DAILY LIFE
  f(123, 'irctc', 'IRCTC passenger autofill', 'India daily life', 'site tool', true, 'Fill-only. No auto-submit, no captcha tricks.', [t('passengers', 'Passengers (name, age, M/F/T)', [])]);
  f(124, 'tatkal', 'Tatkal countdown', 'India daily life', 'nt pop', true, 'Counts down to 10:00 (AC) and 11:00 (non-AC) IST.');
  f(125, 'jobfilter', 'Job-portal filter', 'India daily life', 'site', true, 'Hide promoted, reposted, applied and chosen companies.', [t('companies', 'Hide companies', []), t('hidePromoted', 'Hide promoted', true), t('hideApplied', 'Hide applied', true), t('hideReposted', 'Hide reposted', false)]);
  f(126, 'linkedinage', 'LinkedIn post age + applicants', 'India daily life', 'site', true, 'Shows how old a job is and applicant count on the card.');
  f(127, 'lakh', 'Lakh / crore converter', 'India daily life', 'cs nt pop', true, 'Select a number to see lakh/crore and million.');
  f(128, 'mask', 'PAN / Aadhaar masking', 'India daily life', 'pop', true, 'Masks PAN, Aadhaar, phone numbers on the page before screenshots.');
  // DOWNLOADS
  f(129, 'dlsort', 'Auto-sort downloads', 'Downloads', 'bg', false, 'PDFs, Images, Installers... into folders.');
  f(130, 'dlrename', 'Auto-rename downloads', 'Downloads', 'bg', false, 'date - site - name. No more document (7).pdf.');
  f(131, 'dlpanel', 'Downloads panel', 'Downloads', 'tool', true, 'Search, open, re-download.');
  f(132, 'batchdl', 'Batch download', 'Downloads', 'pop tool', true, 'All images / PDFs on a page, filtered.');
  // PDF
  f(133, 'pdftools', 'Merge / split / rotate PDF', 'PDF (local)', 'tool', true, 'All local, nothing uploaded.');
  f(134, 'pdfsign', 'Fill + sign PDF', 'PDF (local)', 'tool', true, 'Fill form fields, draw or type a signature.');
  f(135, 'img2pdf', 'Images to PDF', 'PDF (local)', 'tool', true, 'Photos to one PDF.');
  f(136, 'imgcompress', 'Image compress', 'PDF (local)', 'tool', true, 'Get an image under 200 KB (or any size) for portals.');
  // MULTI-ACCOUNT
  f(137, 'gaccounts', 'Google account switch', 'Multi-account', 'pop', true, 'Jump to Gmail/Drive/Calendar as /u/0, /u/1...');
  f(138, 'containers', 'Site profiles (experimental)', 'Multi-account', 'tool', true, 'Swap cookie sets for one site to switch logins.');
  f(139, 'whichaccount', 'Which-account badge', 'Multi-account', 'site', true, 'Coloured badge with the signed-in Google account.');
  // GMAIL
  f(140, 'gmailtpl', 'Gmail templates', 'Gmail helpers', 'site', true, 'Insert a saved reply into compose.');
  f(141, 'gmailtrack', 'Block read-tracking pixels', 'Gmail helpers', 'site', true, 'Removes known tracking pixels in opened mail.');
  f(142, 'gmailunsub', 'Unsubscribe surfacer', 'Gmail helpers', 'site', true, 'Puts the unsubscribe link on top.');
  f(143, 'gmailattach', 'Forgot attachment?', 'Gmail helpers', 'site', true, 'Warns when mail says "attached" but has none.');
  // RECORDING
  f(144, 'recorder', 'Screen recorder', 'Recording', 'tool', true, 'Tab or screen, mic, webcam bubble, saved as WebM.');
  f(145, 'replay', 'Bug replay buffer', 'Recording', 'tool', true, 'Keeps the last ~30 s; save when a bug happens.');
  f(146, 'gif', 'GIF export', 'Recording', 'tool', true, 'Turn a short clip into a GIF.');
  // FOCUS / ADHD
  f(147, 'tasktimer', 'Task timer', 'Focus / ADHD', 'pop nt', true, 'Start / stop, with a daily log.');
  f(148, 'timedash', 'Site time dashboard', 'Focus / ADHD', 'bg tool', true, 'Where your day went, per site.');
  f(149, 'scrollstop', 'Infinite-scroll stopper', 'Focus / ADHD', 'cs', true, 'Pauses feeds after N screens.', [t('screens', 'Screens before pause', 15), t('sites', 'Sites', ['reddit.com', 'x.com', 'twitter.com', 'instagram.com', 'facebook.com', 'linkedin.com'])]);
  f(150, 'distractions', 'Hide distractions', 'Focus / ADHD', 'cs', true, 'YouTube recommendations, LinkedIn feed, X trends.', [t('yt', 'Hide YouTube home + sidebar recs', true), t('li', 'Hide LinkedIn feed', true), t('x', 'Hide X trends / who to follow', true)]);
  f(151, 'breaknudge', 'Break nudge', 'Focus / ADHD', 'bg', true, 'Gentle nudge after long stretches.', [t('minutes', 'Nudge after (minutes)', 50)]);
  f(152, 'grayscale', 'Grayscale sites', 'Focus / ADHD', 'cs', true, 'Makes chosen sites boring.', [t('sites', 'Sites', ['instagram.com'])]);
  f(153, 'intent', '"Why are you opening this?"', 'Focus / ADHD', 'bg', true, 'Asks your reason before chosen sites load.', [t('sites', 'Sites', ['youtube.com', 'reddit.com'])]);
  // READING EXTRAS
  f(154, 'recipe', 'Recipe mode', 'Reading extras', 'pop cs', true, 'Ingredients and steps only.');
  f(155, 'pagemonitor', 'Page-change monitor', 'Reading extras', 'bg pop tool', true, 'Notifies when a page changes (while Chrome is open).', [t('hours', 'Check every (hours)', 3)]);
  f(156, 'hoverpreview', 'Hover link preview', 'Reading extras', 'cs bg', true, 'Hold Shift over a link for a preview card.');
  f(157, 'pubdate', 'Real publish date', 'Reading extras', 'cs pop', true, 'Shows the real published / updated date.');
  // TRUST & SAFETY
  f(158, 'suslink', 'Suspicious-link warning', 'Trust & safety', 'cs', true, 'Warns on lookalike, punycode and shortened links.');
  f(159, 'newsite', 'New-site badge', 'Trust & safety', 'cs bg', true, 'Tells you when you have never been to a site before.');
  f(160, 'extaudit', 'Extension permission audit', 'Trust & safety', 'tool', true, 'Your extensions ranked by risk.');

  g.PRISM_FEATURES = L;
  g.PRISM_BY_ID = Object.fromEntries(L.map(x => [x.id, x]));
})(typeof globalThis !== 'undefined' ? globalThis : self);
