(() => {
 const root=document.querySelector('[data-marketplace]'); if(!root)return;
 const input=root.querySelector('[data-market-search]'), type=root.querySelector('[data-market-type]'), results=root.querySelector('[data-market-results]'), hint=root.querySelector('[data-market-hint]');
 let data=[];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const load=async()=>{try{const [p,m,e]=await Promise.all([fetch('data/providers.json').then(r=>r.json()),fetch('data/materials.json').then(r=>r.json()),fetch('data/equipment.json').then(r=>r.json())]);data=[...(p.items||[]).map(x=>({...x,kind:'prestataire'})),...(m.items||[]).map(x=>({...x,kind:'matériau'})),...(e.items||[]).map(x=>({...x,kind:'engin'}))];render();}catch{results.innerHTML='<div class="market-empty">Impossible de charger le catalogue.</div>';}}; 
 const render=()=>{const q=input.value.trim().toLowerCase(),t=type.value;let rows=data.filter(x=>(t==='all'||x.kind===t)&&(!q||[x.name,x.category,x.location,x.area,...(x.services||[])].join(' ').toLowerCase().includes(q))).slice(0,8);hint.textContent=rows.length+' résultat'+(rows.length>1?'s':'')+(q?' pour « '+input.value+' »':'');results.innerHTML=rows.length?rows.map(x=>'<article class="market-result"><div class="market-result-top"><span class="kind">'+esc(x.kind)+'</span>'+(x.verified?'<span class="verified">✓ Vérifié Majestik</span>':'')+'</div><h3>'+esc(x.name)+'</h3><p>'+esc(x.category||x.use||'BTP')+(x.area?' · '+esc(x.area):'')+'</p><div class="market-result-foot"><span>'+(x.rating?'★ '+esc(x.rating)+' · '+esc(x.jobs)+' missions':x.providerCount?esc(x.providerCount)+' fournisseurs partenaires':esc(x.statusLabel||'Sur demande'))+'</span><button type="button" data-request="'+esc(x.id)+'" data-name="'+esc(x.name)+'">Demander →</button></div></article>').join(''):'<div class="market-empty">Aucun résultat. Décrivez votre besoin à Majestik.</div>';};
 input.addEventListener('input',render);type.addEventListener('change',render);
 results.addEventListener('click',e=>{const b=e.target.closest('[data-request]');if(!b)return;const f=document.querySelector('[data-request-form]');f.querySelector('[name="need"]').value=b.dataset.name;f.scrollIntoView({behavior:'smooth',block:'center'});});
 document.querySelectorAll('[data-market-shortcut]').forEach(b=>b.addEventListener('click',()=>{type.value=b.dataset.marketShortcut;input.value='';render();root.scrollIntoView({behavior:'smooth'});}));
 load();
})();
(() => {
 const form=document.querySelector('[data-request-form]'); if(!form)return;
 const out=form.querySelector('[data-request-output]');
 form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form),obj=Object.fromEntries(fd.entries());obj.reference='ME-REQ-'+Date.now().toString().slice(-8);obj.status='draft';obj.createdAt=new Date().toISOString();out.hidden=false;out.innerHTML='<strong>Demande préparée : '+obj.reference+'</strong><span>Majestik pourra transmettre ce même objet JSON à la future API. Pour cette version sans backend, aucune donnée n’est envoyée.</span><pre>'+JSON.stringify(obj,null,2)+'</pre>';});
})();
(() => {
 const box=document.querySelector('[data-quick-search]'); if(!box)return;
 const input=box.querySelector('[data-quick-search-input]'), results=box.querySelector('[data-quick-search-results]'); let data=[];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const open=()=>{box.hidden=false;document.body.classList.add('quick-search-open');setTimeout(()=>input.focus(),20);};
 const close=()=>{box.hidden=true;document.body.classList.remove('quick-search-open');input.value='';results.innerHTML='<p>Commencez à saisir votre besoin.</p>';};
 document.querySelector('[data-quick-search-open]')?.addEventListener('click',open);box.querySelectorAll('[data-quick-search-close]').forEach(x=>x.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close();if(e.key==='/'&&box.hidden&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();open();}});
 Promise.all([fetch('data/providers.json').then(r=>r.json()),fetch('data/materials.json').then(r=>r.json()),fetch('data/equipment.json').then(r=>r.json())]).then(([p,m,e])=>{data=[...(p.items||[]).map(x=>({...x,kind:'prestataire'})),...(m.items||[]).map(x=>({...x,kind:'matériau'})),...(e.items||[]).map(x=>({...x,kind:'engin'}))];});
 input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase();if(!q){results.innerHTML='<p>Commencez à saisir votre besoin.</p>';return;}const rows=data.filter(x=>[x.name,x.category,x.location,x.area,x.use,...(x.services||[])].join(' ').toLowerCase().includes(q)).slice(0,10);results.innerHTML=rows.length?rows.map(x=>'<button type="button" class="quick-result" data-quick-id="'+esc(x.id)+'" data-quick-name="'+esc(x.name)+'" data-quick-kind="'+esc(x.kind)+'"><span><strong>'+esc(x.name)+'</strong><small>'+esc(x.category||x.use||'BTP')+(x.area?' · '+esc(x.area):'')+'</small></span><span class="quick-kind">'+esc(x.kind)+'</span></button>').join(''):'<p>Aucun résultat. Vous pouvez décrire directement votre besoin à Majestik.</p>';});
 results.addEventListener('click',e=>{const b=e.target.closest('[data-quick-id]');if(!b)return;const market=document.querySelector('[data-marketplace]'),mi=market?.querySelector('[data-market-search]'),mt=market?.querySelector('[data-market-type]');if(mi)mi.value=b.dataset.quickName;if(mt)mt.value=b.dataset.quickKind;close();mi?.dispatchEvent(new Event('input',{bubbles:true}));market?.scrollIntoView({behavior:'smooth',block:'start'});});
})();
