/* 56 JSON viewer: raw JSON responses become a collapsible, searchable tree with Raw / Copy. */
(() => { const P = window.__prism;
  P.jsonTree = P.jsonTree || function (data) {
    const esc = P.esc;
    const node = (v, k) => {
      const key = k != null ? '<span style="color:#8C95F2">' + esc(JSON.stringify(k)) + '</span>: ' : '';
      if (v && typeof v === 'object') {
        const arr = Array.isArray(v); const ents = Object.entries(v);
        return '<details open><summary>' + key + (arr ? '[' + ents.length + ']' : '{' + ents.length + '}') + '</summary><div style="padding-left:18px;border-left:1px solid rgba(127,127,127,.25)">' + ents.map(([kk, vv]) => node(vv, arr ? null : kk)).join('') + '</div></details>';
      }
      const col = typeof v === 'string' ? '#6FC49B' : typeof v === 'number' ? '#F2B880' : '#E0915F';
      const s = typeof v === 'string' && /^https?:\/\//.test(v) ? '<a href="' + esc(v) + '" style="color:' + col + '">' + esc(JSON.stringify(v)) + '</a>' : '<span style="color:' + col + '">' + esc(JSON.stringify(v)) + '</span>';
      return '<div>' + key + s + '</div>';
    };
    return node(data);
  };
  P.def('jsonview', { run() {
    const ct = document.contentType || ''; const pre = document.body && document.body.children.length === 1 && document.body.firstElementChild.tagName === 'PRE' ? document.body.firstElementChild : null;
    if (!/json/.test(ct) && !(pre && /^\s*[\[{]/.test(pre.textContent))) return;
    const raw = (pre || document.body).textContent; let data; try { data = JSON.parse(raw); } catch { return; }
    document.body.innerHTML = ''; document.body.style.cssText = 'margin:0;background:#111214;color:#D9DADC;font:13px/1.6 ui-monospace,Menlo,Consolas,monospace';
    const bar = document.createElement('div'); bar.style.cssText = 'position:sticky;top:0;background:#17181B;padding:8px 14px;display:flex;gap:8px;font-family:system-ui;border-bottom:1px solid #2A2C31';
    const btn = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'border:0;background:#2A2C31;color:#ECEDEE;border-radius:999px;padding:5px 12px;cursor:pointer'; b.onclick = f; bar.append(b); };
    const body = document.createElement('div'); body.style.padding = '14px 18px';
    let tree = true; const draw = () => { if (tree) body.innerHTML = P.jsonTree(data); else { body.innerHTML = ''; const p = document.createElement('pre'); p.textContent = JSON.stringify(data, null, 2); body.append(p); } };
    btn('Tree / Raw', () => { tree = !tree; draw(); }); btn('Copy', () => P.copy(JSON.stringify(data, null, 2))); btn('Collapse all', () => body.querySelectorAll('details').forEach((d, i) => i && (d.open = false))); btn('Expand all', () => body.querySelectorAll('details').forEach(d => d.open = true));
    document.body.append(bar, body); draw();
  } });
})();
