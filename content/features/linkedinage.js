/* 126 LinkedIn job age + applicants: pulls "x days ago" and applicant count up next to the job title. */
(() => { const P = window.__prism;
  P.def('linkedinage', { sites: ['linkedin.com'], run() {
    P.observe(() => {
      if (!/\/jobs/.test(location.pathname)) return;
      const top = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title'); if (!top) return;
      const box = document.querySelector('.job-details-jobs-unified-top-card__primary-description-container, .job-details-jobs-unified-top-card__tertiary-description-container, .jobs-unified-top-card__primary-description');
      const t = box ? box.innerText : '';
      const age = (t.match(/(reposted\s+)?\d+\s+(minute|hour|day|week|month)s?\s+ago/i) || [])[0];
      const apps = (t.match(/(over\s+)?\d[\d,]*\s+(applicants|people clicked apply)/i) || [])[0];
      const txt = [age, apps].filter(Boolean).join(' · '); if (!txt) return;
      let tag = document.getElementById('prism-liage'); if (!tag) { tag = document.createElement('div'); tag.id = 'prism-liage'; tag.style.cssText = 'display:inline-block;margin:6px 0;padding:3px 10px;border-radius:999px;font-size:13px;background:rgba(79,91,213,.12);color:#4F5BD5'; top.after(tag); }
      if (tag.textContent !== txt) { tag.textContent = txt; tag.style.background = /month|week|reposted/i.test(txt) ? 'rgba(224,145,95,.18)' : 'rgba(79,91,213,.12)'; tag.style.color = /month|week|reposted/i.test(txt) ? '#B4531F' : '#4F5BD5'; }
    }, 1000);
  } });
})();
