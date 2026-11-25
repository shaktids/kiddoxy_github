(function(){
  const CATEGORY_ORDER = [
    'Words & Letters',
    'Math & Numbers',
    'Logic & Puzzles',
    'Creative Play',
    'Racing',
    'Arcade & Action'
  ];

  const CATEGORY_DESCRIPTIONS = {
    'Words & Letters': 'Letter play, spelling, and word building.',
    'Math & Numbers': 'Counting, matching, and number sense games.',
    'Logic & Puzzles': 'Matching, memory, and shape puzzles.',
    'Creative Play': 'Art, music, and open-ended creativity.',
    'Racing': 'Ready, set, go! Race cars, answer fast and win the cup.',
    'Arcade & Action': 'Fast, tap-friendly action games.'
  };

  const CATEGORY_BY_ID = {
    'word-builder': 'Words & Letters',
    'missing-letter': 'Words & Letters',
    'memory': 'Logic & Puzzles',
    'odd-one-out': 'Logic & Puzzles',
    'tile-slider': 'Logic & Puzzles',
    'jigsaw': 'Logic & Puzzles',
    'shadow-match': 'Logic & Puzzles',
    'drag-match': 'Logic & Puzzles',
    'connect-dots': 'Logic & Puzzles',
    'shape-sorter': 'Logic & Puzzles',
    'stacker': 'Logic & Puzzles',
    'tile-flip': 'Logic & Puzzles',
    'spot-diff': 'Logic & Puzzles',
    'simon': 'Logic & Puzzles',
    'time-teller': 'Math & Numbers',
    'money-count': 'Math & Numbers',
    'count-match': 'Math & Numbers',
    'number-match': 'Math & Numbers',
    'coloring': 'Creative Play',
    'finger-paint': 'Creative Play',
    'musical-tiles': 'Creative Play',
    'bubble-pop': 'Arcade & Action',
    'whack-fruit': 'Arcade & Action',
    'balloon-race': 'Arcade & Action',
    'find-target': 'Arcade & Action',
    'maze': 'Logic & Puzzles',
    'alphabet-catch': 'Words & Letters',
    'alphabet-animal-match': 'Words & Letters',
    'hungry-math-shark': 'Math & Numbers',
    'color-shape-match': 'Logic & Puzzles',
    'sorting-hero': 'Logic & Puzzles'
  };

  let ALL = [], query = '', activeCat = 'All', expanded = new Set();
  const PER_CATEGORY = 8;
  const norm = s => String(s||'').toLowerCase();
  function matches(g){
    if(activeCat !== 'All' && getCategory(g) !== activeCat) return false;
    if(!query) return true;
    const hay = norm([g.title, g.shortDesc, g.kind, getCategory(g), g.id.replace(/-/g,' ')].join(' '));
    return query.split(/\s+/).every(w => hay.includes(w));
  }
  function setupFinder(){
    const input = document.getElementById('gameSearch'), chips = document.getElementById('catChips');
    if(!input || !chips) return;
    const cats = ['All'].concat(CATEGORY_ORDER.filter(c => ALL.some(g => getCategory(g) === c)));
    chips.innerHTML = '';
    cats.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (c === activeCat ? ' active' : '');
      const n = c === 'All' ? ALL.length : ALL.filter(g => getCategory(g) === c).length;
      b.textContent = `${c} (${n})`;
      b.onclick = () => { activeCat = c; chips.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === b)); render(ALL); };
      chips.appendChild(b);
    });
    let t; input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { query = norm(input.value.trim()); render(ALL); }, 120); });
  }

  async function loadGames(){
    try{
      const res = await fetch('/data/games.json',{cache:'no-store'});
      if(!res.ok) throw new Error('Failed to load games.json: '+res.status);
      const games = await res.json();
      ALL = games;
      setupFinder();
      render(games);
    }catch(err){ console.error(err); document.getElementById('gamesGrid').innerHTML = '<div style="padding:12px">Failed to load games.</div>'; }
  }
  function getCategory(game){
    return game.category || CATEGORY_BY_ID[game.id] || 'Other Fun';
  }
  function getCategoryOrder(category){
    const index = CATEGORY_ORDER.indexOf(category);
    return index === -1 ? CATEGORY_ORDER.length : index;
  }
  function render(games){
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    const grouped = new Map();
    const list = games.filter(matches);
    if(!list.length){ grid.innerHTML = '<p class="no-results">No games found — try another word! 🔍</p>'; return; }
    list.slice().sort((a,b)=> (a.priority||10)-(b.priority||10)).forEach((game)=>{
      const category = getCategory(game);
      if(!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(game);
    });
    const categories = Array.from(grouped.keys()).sort((a,b)=>{
      const orderDiff = getCategoryOrder(a) - getCategoryOrder(b);
      if(orderDiff !== 0) return orderDiff;
      return a.localeCompare(b);
    });
    categories.forEach((category)=>{
      const section = document.createElement('section');
      section.className = 'category-section';
      const header = document.createElement('div');
      header.className = 'category-header';
      const title = document.createElement('h2');
      title.className = 'category-title';
      title.textContent = category;
      const desc = document.createElement('p');
      desc.className = 'category-desc';
      desc.textContent = CATEGORY_DESCRIPTIONS[category] || '';
      header.appendChild(title);
      if(desc.textContent) header.appendChild(desc);
      const categoryGrid = document.createElement('div');
      categoryGrid.className = 'category-grid';
      const all = grouped.get(category);
      const limit = (query || activeCat !== 'All' || expanded.has(category)) ? all.length : PER_CATEGORY;
      all.slice(0, limit).forEach(g=>{
        const a = document.createElement('a');
        a.className='game-tile';
        a.href = '/' + String(g.route || ('game/'+g.id+'.html')).replace(/^\//,'');
        a.title = g.title;
        const img = document.createElement('img');
        img.className='tile-icon';
        const assets = g.assets||[];
        const icon0 = assets.find(x=>/icon/i.test(x)) || assets.find(x=>/\.(png|jpg|jpeg|webp|gif|svg)$/i.test(x)) || '/kiddoxy.png';
        const icon = icon0.startsWith('/') ? icon0 : '/' + icon0;
        img.src = encodeURI(icon);
        img.loading = 'lazy';
        img.onerror = () => { img.onerror = null; img.src = '/kiddoxy.png'; };
        img.alt = g.title + ' icon';
        const titleEl = document.createElement('div');
        titleEl.className='tile-title';
        titleEl.textContent = g.title || g.id;
        const descEl = document.createElement('div');
        descEl.className='tile-desc';
        descEl.textContent = g.shortDesc || '';
        descEl.style.fontSize='12px';
        descEl.style.color='#475569';
        descEl.style.marginTop='6px';
        if(g.isNew){ const badge=document.createElement('span'); badge.className='tile-badge'; badge.textContent='NEW'; a.appendChild(badge); }
        a.appendChild(img);
        a.appendChild(titleEl);
        a.appendChild(descEl);
        categoryGrid.appendChild(a);
      });
      section.appendChild(header);
      section.appendChild(categoryGrid);
      if(all.length > limit){ const more = document.createElement('button'); more.type='button'; more.className='show-more'; more.textContent = `Show all ${all.length} ${category} games ▾`; more.onclick = () => { expanded.add(category); render(ALL); }; section.appendChild(more); }
      grid.appendChild(section);
    });
  }
  // start
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadGames); else loadGames();
})();
