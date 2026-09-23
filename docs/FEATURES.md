# All 160 features

Every feature has an on/off switch in Settings. "Where" tells you how you reach it.

## New tab + launcher

| # | Feature | What it does | Where |
|---|---|---|---|
| 1 | Command palette | Ctrl+K on the new tab, Alt+K anywhere. Search tabs, bookmarks, history and every PRISM action. | New tab, Popup / Alt+K |
| 2 | Search aliases | Type the full site name first, like "youtube lofi" or "chatgpt explain X", to search that site directly. | New tab, Popup / Alt+K |
| 3 | One box search | One search box over bookmarks, history and open tabs. | New tab, Popup / Alt+K |
| 4 | Quick links | Grid of your favourite sites with custom icons. | New tab |
| 5 | Clock, greeting, focus note | Big clock, date, greeting and one line for today's focus. | New tab |
| 6 | Mini to-do | A short local to-do list on the new tab. | New tab |
| 7 | Weather | Free Open-Meteo forecast, no key. Asks for your city, or uses your location only if you click Use my location. | New tab |
| 8 | Countdowns | Days left to interviews and deadlines. | New tab |
| 9 | Recently closed | Reopen tabs you closed by mistake. | New tab, Popup / Alt+K |

## Tabs & sessions

| # | Feature | What it does | Where |
|---|---|---|---|
| 10 | Collapse all tabs | Close every tab into a restorable list (OneTab style). | Background, Popup / Alt+K, Tools page |
| 11 | Duplicate tabs | Find and close duplicate tabs. | Background, Popup / Alt+K |
| 12 | Close others / right / same site | Right-click page menu and palette actions. | Background, Popup / Alt+K |
| 13 | Named sessions | Save a window as a named session and restore it later. | Background, Popup / Alt+K, Tools page |
| 14 | Auto-sleep idle tabs | Discards tabs you have not touched for a while to free memory. | Background |
| 15 | Find tab | Search open tabs across all windows (in the palette). | Popup / Alt+K |
| 16 | Sort / group by site | Sort tabs by site or put each site in its own tab group. | Background, Popup / Alt+K |

## Focus & blocking

| # | Feature | What it does | Where |
|---|---|---|---|
| 17 | Site blocker | Real block: the page never loads. | Background |
| 18 | Block schedules | Only block during set hours. | Background |
| 19 | Daily time allowance | Minutes per day per site, then blocked. | Background |
| 20 | Lockdown mode | For N minutes, only allowlisted sites open. | Background, Popup / Alt+K |
| 21 | Friction unlock | Unblock only after waiting or typing a sentence. | Background |
| 22 | Pomodoro | Live MM:SS countdown with a progress ring on the new tab and popup, minutes on the toolbar icon. Blocks your list while focusing. | Background, Popup / Alt+K, New tab |
| 23 | Blocked-page message | Your own line on the blocked page. | Background |

## AI, no keys

| # | Feature | What it does | Where |
|---|---|---|---|
| 24 | On-device summary | Summarise the page with Chrome's built-in Gemini Nano. Falls back to your chat site. | Popup / Alt+K, On pages |
| 25 | On-device rewrite | Rewrite selected text on-device. | Popup / Alt+K, On pages |
| 26 | On-device proofread | Proofread selected text on-device. | Popup / Alt+K, On pages |
| 27 | Send selection to chat | Right-click text -> ChatGPT / Claude / Gemini with a saved prompt. | Background |
| 28 | Prompt library | Prompts with {{text}} variables. | Background, Tools page |
| 29 | Send page to chat | Send the cleaned page as context; optional auto-submit. | Popup / Alt+K, On listed sites |

## Reading & capture

| # | Feature | What it does | Where |
|---|---|---|---|
| 30 | Copy as Markdown | Page or selection as clean Markdown. | Popup / Alt+K |
| 31 | Reader mode | Clutter-free reading view with font, width and dark controls. | Popup / Alt+K |
| 32 | Copy tables | Copy any HTML table as CSV or Markdown. | Popup / Alt+K, On pages |
| 33 | Reading list + snapshots | Save a page with an offline text snapshot. | Popup / Alt+K, Tools page |
| 34 | Highlights + notes | Select text, press H or use the bubble to highlight. Restored on revisit. | On pages, Tools page |
| 35 | Reading-time badge | Minutes to read on the toolbar badge. | On pages |

## Page tools

| # | Feature | What it does | Where |
|---|---|---|---|
| 36 | Allow paste | Paste into fields that block it. | On pages |
| 37 | Full-page screenshot | Scroll-stitched PNG of the whole page. | Popup / Alt+K, Tools page |
| 38 | Copy Markdown link | [Title](url) for tickets and docs. | Popup / Alt+K |
| 39 | QR code | Move the page to your phone. | Popup / Alt+K |
| 40 | Element picker | Click any element to copy its text, link or image. | Popup / Alt+K |
| 41 | Copy all links | Every link on the page, de-duplicated. | Popup / Alt+K |
| 42 | Per-site zoom + font | Remembers zoom and a font-size bump per site. | Background, On pages |

## Privacy

| # | Feature | What it does | Where |
|---|---|---|---|
| 43 | Copy clean link | Strips utm, fbclid, gclid and friends. | Background, Popup / Alt+K |
| 44 | AMP -> original | Leaves AMP pages for the real article. | On pages |
| 45 | Clear this site | One click: cache, cookies, storage for the current site. | Popup / Alt+K |

## Clipboard & snippets

| # | Feature | What it does | Where |
|---|---|---|---|
| 46 | Clipboard history | Local history of what you copy, with search and pins. | On pages, Tools page |
| 47 | Text expander | Type ;addr and it expands. | On pages |
| 48 | Saved replies | A library of replies, one click to copy. | Popup / Alt+K, Tools page |
| 49 | Scratchpad | Quick note in the popup. | Popup / Alt+K |

## QA / dev kit

| # | Feature | What it does | Where |
|---|---|---|---|
| 50 | Copy URL shortcut | Alt+Shift+U copies the current URL. | Background |
| 51 | Bug-report grabber | URL, browser, viewport, time and console errors in one block. | Popup / Alt+K, On pages |
| 52 | Console-error badge | Error count on the toolbar icon. | On pages, Background |
| 53 | Locator picker | Click an element -> Playwright locator, CSS and XPath. | Popup / Alt+K |
| 54 | Edge-case test data | Right-click a field -> insert long strings, emoji, injection, bad emails. | Background, Tools page |
| 55 | Form filler | Fill forms with fake-data profiles. | Popup / Alt+K, Tools page |
| 56 | JSON viewer | Pretty, collapsible JSON for raw API responses. | On pages, Tools page |
| 57 | Cookies + storage editor | View and edit cookies and localStorage for the current site. | Tools page |
| 58 | Viewport overlay + presets | Shows size; resize the window to device presets. | Popup / Alt+K |
| 59 | Pixel ruler | Measure elements and distances. | Popup / Alt+K |
| 60 | Eyedropper | Pick any colour on the screen. | Popup / Alt+K |
| 61 | Broken-link checker | Checks every link on the page. | Popup / Alt+K |
| 62 | Disable JS / CSS / images | Per site, one click. | Popup / Alt+K |
| 63 | Performance snapshot | Navigation timing, sizes, requests. | Popup / Alt+K |
| 64 | Screenshot annotate + blur | Draw, arrow, box, blur. | Tools page |
| 65 | Accessibility checks | Missing alt, heading outline, low contrast. | Popup / Alt+K |

## Job-hunt copilot

| # | Feature | What it does | Where |
|---|---|---|---|
| 66 | Job tracker | Save a job page in one click, move it through a pipeline. | Popup / Alt+K, Tools page |
| 67 | Job keyword highlighter | Highlights your stack on job posts. | On pages |
| 68 | Application autofill | Fill name, email, phone, links, years from your profile. | Popup / Alt+K |
| 69 | Recruiter-reply snippets | Ready replies for recruiters (in Saved replies). | Tools page |
| 70 | Application countdowns | Deadlines from the job tracker on the new tab. | New tab |

## YouTube

| # | Feature | What it does | Where |
|---|---|---|---|
| 71 | Watch Later quick-add | A button on the player; W key. | On listed sites |
| 72 | Auto theater + speed per channel | Theater mode on open; remembers speed per channel. | On listed sites |
| 73 | Hide Shorts | Removes Shorts shelves and tabs. | On listed sites |
| 74 | Playlist quick add/remove | P key opens Save to playlist. | On listed sites |
| 75 | Picture-in-Picture | One click PiP for any video. | Popup / Alt+K, On listed sites |

## Comfort

| # | Feature | What it does | Where |
|---|---|---|---|
| 76 | Force dark mode | Dark mode on chosen sites. | On pages |
| 77 | Caret browsing + font adjust | Alt+C: move a caret with arrow keys. Alt+= / Alt+- font size. | On pages |

## Lost work & nags

| # | Feature | What it does | Where |
|---|---|---|---|
| 78 | Form-text recovery | Autosaves what you type; restore after a crash. | On pages |
| 79 | Leave-page guard | Warns before closing a tab with unsent text. | On pages |
| 80 | Un-disable | Re-enable greyed buttons, right-click and copy. | Popup / Alt+K, On pages |
| 81 | Autocomplete fixer | Turns browser autocomplete back on. | On pages |
| 82 | Smart date picker | Type "next fri" or "12/10" into date fields. | On pages |
| 83 | Show-password eye | Eye button on password fields. | On pages |
| 84 | Cookie-banner auto-reject | Clicks Reject on consent banners. | On pages |
| 85 | Auto-deny notifications | Blocks "Allow notifications?" prompts, with an allowlist. | Background |
| 86 | Nag killer | Hides Google one-tap, newsletter modals, "open in app". | On pages |
| 87 | Hide sticky headers | Alt+S or palette toggles sticky bars off. | Popup / Alt+K, On pages |
| 88 | Stop autoplay | Videos wait for you to press play. | On pages |
| 89 | Keyword filter | Hide posts containing words you pick. | On pages |

## Keyboard

| # | Feature | What it does | Where |
|---|---|---|---|
| 90 | Link hints | Press F (outside text boxes), then letters, to click any link. | On pages |
| 91 | Shortcut remap | Kill or remap page shortcuts like Ctrl+D. | On pages |
| 92 | Jump to first input | Press I (outside text boxes) to focus the first input. J/K scroll. | On pages |
| 93 | Palette calculator | Type = 12*18% or 5 lakh in the palette. | New tab, Popup / Alt+K |
| 94 | Regex find | Alt+F: find with regex, count and jump. | On pages, Popup / Alt+K |

## Tabs round 2

| # | Feature | What it does | Where |
|---|---|---|---|
| 95 | Locked pinned tabs | Pinned tabs reopen if closed; their links open in new tabs. | Background, On pages |
| 96 | Tab limit | At N tabs the oldest goes to the saved list. | Background |
| 97 | Tab snooze | Close a tab now, it comes back later. | Background, Popup / Alt+K |
| 98 | Unfinished videos | Videos you left halfway. | On listed sites, Popup / Alt+K |
| 99 | Mute memory / mute others | Remembers muted sites; mute all but this tab. | Background, Popup / Alt+K |

## Students & research

| # | Feature | What it does | Where |
|---|---|---|---|
| 100 | Citations | APA, MLA and IEEE from page metadata. | Popup / Alt+K |
| 101 | Free-PDF finder | Shows open-access PDF links on paper pages (links only). | On pages |
| 102 | Clean PDF text copy | Fix broken line breaks and hyphens in copied text. | Background, Tools page |
| 103 | Word counter | Words and characters for the selection or a text box. | On pages, Popup / Alt+K |
| 104 | Flashcards | Turn highlights into spaced-repetition cards. | New tab, Tools page |
| 105 | Search date filter | Past day / week / month / year buttons on Google. | On listed sites |

## Video & lectures

| # | Feature | What it does | Where |
|---|---|---|---|
| 106 | Speed on every video | S / D keys slower / faster, R reset. 0.1x-16x. | On pages |
| 107 | Skip silences / intro | Speeds through silent parts; skip-intro key. | On pages |
| 108 | Timestamped notes | Alt+N adds a note at the current time. | On pages, Tools page |
| 109 | YouTube transcript | Copy clean transcript; summarise on-device. | On listed sites, Popup / Alt+K |
| 110 | A-B loop | [ sets A, ] sets B, \ clears. | On pages |
| 111 | Resume where you stopped | Long videos pick up where you left off. | On pages |

## Language & access

| # | Feature | What it does | Where |
|---|---|---|---|
| 112 | On-device translate | Chrome's built-in Translator. No keys. | Popup / Alt+K, On pages |
| 113 | Double-click dictionary | Alt + double-click a word for its meaning. | On pages, Background |
| 114 | Read aloud | Reads the selection or page aloud. | Popup / Alt+K, Background |
| 115 | Dyslexia-friendly mode | OpenDyslexic font, spacing, reading ruler. | On pages |
| 116 | Big cursor + focus ring | Large cursor, strong focus outline, less motion. | On pages |
| 117 | Bionic reading | Bold the first letters of each word. | Popup / Alt+K |

## Shopping

| # | Feature | What it does | Where |
|---|---|---|---|
| 118 | Price log + chart | Records prices on Amazon, Flipkart, Myntra pages you visit. | On listed sites, Tools page |
| 119 | Price-drop watch | Re-checks watched products every few hours while Chrome is open. | Background, Tools page |
| 120 | Unit-price calculator | Shows Rs per 100g / per piece next to prices. | On pages |
| 121 | Fake-discount flagger | Flags countdowns and "only N left" that reset. | On pages |
| 122 | Coupon memory | Remembers codes you used per site. | On pages |

## India daily life

| # | Feature | What it does | Where |
|---|---|---|---|
| 123 | IRCTC passenger autofill | Fill-only. No auto-submit, no captcha tricks. | On listed sites, Tools page |
| 124 | Tatkal countdown | Big live countdown to 10:00 (AC) and 11:00 (non-AC) IST, with an Open-now alert and Book button. | New tab, Popup / Alt+K |
| 125 | Job-portal filter | Hide promoted, reposted, applied and chosen companies. | On listed sites |
| 126 | LinkedIn post age + applicants | Shows how old a job is and applicant count on the card. | On listed sites |
| 127 | Lakh / crore converter | Select a number to see lakh/crore and million. | On pages, New tab, Popup / Alt+K |
| 128 | PAN / Aadhaar masking | Masks PAN, Aadhaar, phone numbers on the page before screenshots. | Popup / Alt+K |

## Downloads

| # | Feature | What it does | Where |
|---|---|---|---|
| 129 | Auto-sort downloads | PDFs, Images, Installers... into folders. | Background |
| 130 | Auto-rename downloads | date - site - name. No more document (7).pdf. | Background |
| 131 | Downloads panel | Search, open, re-download. | Tools page |
| 132 | Batch download | All images / PDFs on a page, filtered. | Popup / Alt+K, Tools page |

## PDF (local)

| # | Feature | What it does | Where |
|---|---|---|---|
| 133 | Merge / split / rotate PDF | All local, nothing uploaded. | Tools page |
| 134 | Fill + sign PDF | Fill form fields, draw or type a signature. | Tools page |
| 135 | Images to PDF | Photos to one PDF. | Tools page |
| 136 | Image compress | Get an image under 200 KB (or any size) for portals. | Tools page |

## Multi-account

| # | Feature | What it does | Where |
|---|---|---|---|
| 137 | Google account switch | Jump to Gmail/Drive/Calendar as /u/0, /u/1... | Popup / Alt+K |
| 138 | Site profiles (experimental) | Swap cookie sets for one site to switch logins. | Tools page |
| 139 | Which-account badge | Coloured badge with the signed-in Google account. | On listed sites |

## Gmail helpers

| # | Feature | What it does | Where |
|---|---|---|---|
| 140 | Gmail templates | Insert a saved reply into compose. | On listed sites |
| 141 | Block read-tracking pixels | Removes known tracking pixels in opened mail. | On listed sites |
| 142 | Unsubscribe surfacer | Puts the unsubscribe link on top. | On listed sites |
| 143 | Forgot attachment? | Warns when mail says "attached" but has none. | On listed sites |

## Recording

| # | Feature | What it does | Where |
|---|---|---|---|
| 144 | Screen recorder | Tab or screen, mic, webcam bubble. Download as MP4 (WebM only if your Chrome cannot record MP4). | Tools page |
| 145 | Bug replay buffer | Keeps the last ~30 s; save when a bug happens. | Tools page |
| 146 | GIF export | Turn a short clip into a GIF. | Tools page |

## Focus / ADHD

| # | Feature | What it does | Where |
|---|---|---|---|
| 147 | Task timer | Start / stop with a live H:MM:SS clock (seconds ticking), plus a daily log. | Popup / Alt+K, New tab |
| 148 | Site time dashboard | Where your day went, per site. | Background, Tools page |
| 149 | Infinite-scroll stopper | Pauses feeds after N screens. | On pages |
| 150 | Hide distractions | YouTube recommendations, LinkedIn feed, X trends. | On pages |
| 151 | Break nudge | Gentle nudge after long stretches. | Background |
| 152 | Grayscale sites | Makes chosen sites boring. | On pages |
| 153 | "Why are you opening this?" | Asks your reason before chosen sites load. | Background |

## Reading extras

| # | Feature | What it does | Where |
|---|---|---|---|
| 154 | Recipe mode | Ingredients and steps only. | Popup / Alt+K, On pages |
| 155 | Page-change monitor | Notifies when a page changes (while Chrome is open). | Background, Popup / Alt+K, Tools page |
| 156 | Hover link preview | Hold Shift over a link for a preview card. | On pages, Background |
| 157 | Real publish date | Shows the real published / updated date. | On pages, Popup / Alt+K |

## Trust & safety

| # | Feature | What it does | Where |
|---|---|---|---|
| 158 | Suspicious-link warning | Warns on lookalike, punycode and shortened links. | On pages |
| 159 | New-site badge | Tells you when you have never been to a site before. | On pages, Background |
| 160 | Extension permission audit | Your extensions ranked by risk. | Tools page |




## PDF Studio upgrade

The Tools page includes 16 local PDF operations: merge, extract, split, remove, reorder or duplicate, reverse, rotate, watermark, page numbers, resize, crop, insert blank pages, edit metadata, flatten form fields, attach files and structural optimization. The improved fill/sign and Images to PDF screens support preview, better controls, explicit file limits and safer error handling. See README for operational limits.
