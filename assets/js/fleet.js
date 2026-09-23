(() => {
  const root = document.querySelector('[data-fleet]');
  if (!root) return;
  const grid = root.querySelector('[data-fleet-grid]');
  const filters = root.querySelector('[data-fleet-filters]');
  const search = root.querySelector('[data-fleet-search]');
  const count = root.querySelector('[data-fleet-count]');
  const modal = document.querySelector('[data-fleet-modal]');
  let items = [], category = 'all';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const load = async () => {
    try {
      const [equipment, cats] = await Promise.all([
        fetch('data/equipment.json').then(r => { if(!r.ok) throw new Error(); return r.json(); }),
        fetch('data/categories.json').then(r => { if(!r.ok) throw new Error(); return r.json(); })
      ]);
      items = equipment.items || [];
      filters.innerHTML = (cats.items || []).map((c,i) => '<button type="button" class="fleet-filter '+(i===0?'active':'')+'" data-category="'+esc(c.id)+'">'+esc(c.label)+'</button>').join('');
      filters.addEventListener('click', e => {
        const btn=e.target.closest('[data-category]'); if(!btn) return;
        category=btn.dataset.category;
        filters.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
        render();
      });
      render();
    } catch {
      grid.innerHTML='<div class="fleet-error">Le parc engins est momentanément indisponible.</div>';
    }
  };
  const render = () => {
    const q=(search.value||'').trim().toLowerCase();
    const visible=items.filter(x => (category==='all'||x.category===category) && (!q||[x.name,x.category,x.use,x.id].join(' ').toLowerCase().includes(q)));
    count.textContent=visible.length+' équipement'+(visible.length>1?'s':'');
    grid.innerHTML=visible.length?visible.map(x=>'<article class="fleet-card"><div class="fleet-media"><img src="'+esc(x.image)+'" alt="'+esc(x.name)+'" loading="lazy"><span class="fleet-status '+esc(x.status)+'">'+esc(x.statusLabel)+'</span></div><div class="fleet-body"><div class="fleet-meta"><span>'+esc(x.category)+'</span><small>'+esc(x.id)+'</small></div><h3>'+esc(x.name)+'</h3><p>'+esc(x.use)+'</p><div class="fleet-foot"><strong>'+esc(x.capacity)+'</strong><button type="button" class="fleet-details" data-id="'+esc(x.id)+'">Voir l’engin →</button></div></div></article>').join(''):'<div class="fleet-empty">Aucun engin ne correspond à votre recherche.</div>';
  };
  search.addEventListener('input',render);
  grid.addEventListener('click', e => {
    const btn=e.target.closest('[data-id]'); if(!btn) return;
    const x=items.find(i=>i.id===btn.dataset.id); if(!x) return;
    modal.querySelector('[data-modal-content]').innerHTML='<div class="modal-media"><img src="'+esc(x.image)+'" alt="'+esc(x.name)+'"></div><span class="eyebrow">'+esc(x.category)+' · '+esc(x.id)+'</span><h3>'+esc(x.name)+'</h3><p>'+esc(x.use)+'</p><div class="modal-spec"><span>Capacité</span><strong>'+esc(x.capacity)+'</strong></div><div class="modal-spec"><span>Disponibilité</span><strong>'+esc(x.statusLabel)+'</strong></div><a class="btn btn-primary modal-cta" href="#contact">Demander une disponibilité</a>';
    modal.hidden=false; document.body.classList.add('modal-open');
  });
  modal.addEventListener('click', e => { if(e.target===modal||e.target.closest('[data-modal-close]')||e.target.closest('.modal-cta')) {modal.hidden=true;document.body.classList.remove('modal-open');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){modal.hidden=true;document.body.classList.remove('modal-open');}});
  load();
})();