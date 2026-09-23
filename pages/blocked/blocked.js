/* Blocked page (17-21, 23). Unlocking needs a wait AND the typed sentence. */
const { $, h, toast } = UI;
const p = new URLSearchParams(location.search); const url = p.get('u') || ''; const r = p.get('r');
(async () => {
  const S = await UI.theme();
  const m = await UI.send({ type: 'focus:message' }); if (m) $('#msg').textContent = m;
  const host = PrismU.host(url);
  $('#why').textContent = { blocked: host + ' is on your block list.', schedule: host + ' is blocked during these hours.', allowance: 'You used today\'s time on ' + host + '.', lockdown: 'Lockdown is on. Only your allowlist opens.', pomodoro: 'Focus block running. ' + host + ' waits.' }[r] || host + ' is blocked.';
  document.title = 'Blocked - ' + host;
  if (r === 'lockdown' || !S.on.friction) return;
  const c = S.cfg.friction; let left = c.seconds || 30;
  const box = $('#unlock'); const ring = h('div', { class: 'ring' }, String(left)); const hint = h('p', { class: 'muted small' }, 'Wait, then type the sentence to unlock for ' + (c.unlockMinutes || 5) + ' minutes.');
  box.append(ring, hint);
  const t = setInterval(() => {
    left--; ring.textContent = String(left);
    if (left > 0) return;
    clearInterval(t); ring.remove();
    const sentence = c.sentence || 'I am choosing to lose focus right now';
    const inp = h('input', { placeholder: sentence, autocomplete: 'off' });
    inp.addEventListener('paste', (e) => e.preventDefault());
    const btn = h('button', { class: 'btn primary', onclick: async () => {
      if (inp.value.trim() !== sentence) return toast('Type it exactly');
      const res = await UI.send({ type: 'focus:unlock', url }); if (res && res.error) return toast(res.error);
      location.replace(url);
    } }, 'Unlock');
    hint.textContent = 'Type: "' + sentence + '"';
    box.append(inp, btn); inp.focus();
  }, 1000);
})();
