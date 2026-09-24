/* 29 Send the cleaned page to a web chat. On chat sites (when allowed) it also fills a parked long prompt. */
(() => { const P = window.__prism;
  const CHAT = ['chatgpt.com', 'claude.ai', 'gemini.google.com', 'perplexity.ai'];
  P.def('aipage', {
    sites: CHAT,
    async run() {
      const h = await P.send({ type: 'handoff:take' }); if (!h) return;
      const find = () => document.querySelector('#prompt-textarea, div.ProseMirror[contenteditable=true], rich-textarea .ql-editor, textarea[placeholder], div[contenteditable=true]');
      for (let i = 0; i < 40; i++) {
        const ed = find();
        if (ed) {
          ed.focus();
          if (ed.tagName === 'TEXTAREA') { const set = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set; set.call(ed, h.text); ed.dispatchEvent(new Event('input', { bubbles: true })); }
          else document.execCommand('insertText', false, h.text);
          return;
        }
        await new Promise(r => setTimeout(r, 400));
      }
      await P.copy(h.text, 'Could not find the chat box. Prompt copied - paste it.');
    },
    actions: {
      send(target) {
        const text = (P.mainEl().innerText || '').replace(/\n{3,}/g, '\n\n').slice(0, 20000);
        return P.send({ type: 'ai:handoff', target, text: 'Here is a web page. Read it, then give me the key points and anything I should act on.\n\nTitle: ' + document.title + '\nURL: ' + location.href + '\n\n' + text });
      },
    },
  });
})();

