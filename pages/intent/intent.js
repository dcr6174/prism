/* "Why are you opening this?" (153) */
const { $, toast } = UI;
const url = new URLSearchParams(location.search).get('u') || '';
UI.theme();
$('#host').textContent = PrismU.host(url);
$('#why').focus();
const go = async () => { const reason = $('#why').value.trim(); if (reason.length < 3) return toast('Write a reason first'); await UI.send({ type: 'intent:pass', url, reason }); location.replace(url); };
$('#go').onclick = go; $('#why').onkeydown = (e) => e.key === 'Enter' && go();
$('#back').onclick = () => history.length > 1 ? history.back() : window.close();
