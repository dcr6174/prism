/* 154 Recipe mode: reads the page's schema.org Recipe data and shows just ingredients and steps. */
(() => { const P = window.__prism;
  const find = () => { for (const j of P.jsonld()) { const all = [].concat(j, j['@graph'] || []); const r = all.find(x => x && [].concat(x['@type'] || []).includes('Recipe')); if (r) return r; } return null; };
  const steps = (ins) => [].concat(ins || []).flatMap(s => typeof s === 'string' ? [s] : s.itemListElement ? steps(s.itemListElement) : [s.text || s.name || '']).filter(Boolean);
  const show = () => {
    const r = find(); if (!r) { P.ui.toast('No recipe data found on this page'); return 'No recipe found'; }
    const ing = [].concat(r.recipeIngredient || []); const st = steps(r.recipeInstructions);
    const meta = [r.totalTime && 'Total ' + String(r.totalTime).replace(/^PT/, '').toLowerCase(), r.recipeYield && 'Serves ' + [].concat(r.recipeYield)[0]].filter(Boolean).join(' · ');
    P.ui.panel(r.name || 'Recipe', (meta ? '<p class="m">' + P.esc(meta) + '</p>' : '') + '<h4>Ingredients</h4><ul>' + ing.map(i => '<li><label><input type="checkbox"> ' + P.esc(i) + '</label></li>').join('') + '</ul><h4>Steps</h4><ol>' + st.map(s => '<li>' + P.esc(s.replace(/<[^>]+>/g, '')) + '</li>').join('') + '</ol>', { id: 'recipe' });
    return ing.length + ' ingredients, ' + st.length + ' steps';
  };
  P.def('recipe', { actions: { show } });
})();
