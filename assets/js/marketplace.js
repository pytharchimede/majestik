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
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const places=['abidjan','cocody','koumassi','marcory','treichville','yopougon','port-bouet','bingerville','adjame','plateau','abobo','anyama'];
 const dayMap={dimanche:0,lundi:1,mardi:2,mercredi:3,jeudi:4,vendredi:5,samedi:6};
 const iso=d=>{const x=new Date(d);return x.toISOString().slice(0,10)};
 const nextDay=n=>{const d=new Date(),delta=(n-d.getDay()+7)%7||7;d.setDate(d.getDate()+delta);return iso(d)};
 const understand=raw=>{const q=normalize(raw),out={raw,need:raw,category:'',location:'',date:''};
  for(const p of places)if(q.includes(p)){out.location=p.replace(/\b\w/g,c=>c.toUpperCase());break;}
  if(/\b(demain)\b/.test(q)){const d=new Date();d.setDate(d.getDate()+1);out.date=iso(d)}
  else if(/\b(aujourd'hui|aujourdhui)\b/.test(q))out.date=iso(new Date());
  else for(const [name,n] of Object.entries(dayMap))if(q.includes(name)){out.date=nextDay(n);break;}
  if(/macon|plomb|electric|soud|peint|carrel|artisan|prestataire/.test(q))out.category='prestataire';
  else if(/ciment|fer|sable|gravier|quincaill|materiau/.test(q))out.category='matériau';
  else if(/pelle|bulldozer|grue|camion|benne|porte-engin|engin|chargeuse/.test(q))out.category='engin';
  let cleaned=q.replace(/\b(je cherche|je veux|besoin de|pour|a|à|le|la|les|un|une|des|du|de|mon|ma|mes|chantier|travaux|aujourd'hui|aujourdhui|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/g,' ');
  places.forEach(p=>cleaned=cleaned.replaceAll(p,' '));out.terms=cleaned.replace(/\s+/g,' ').trim();return out;};
 const open=()=>{box.hidden=false;document.body.classList.add('quick-search-open');setTimeout(()=>input.focus(),20)};
 const close=()=>{box.hidden=true;document.body.classList.remove('quick-search-open');input.value='';results.innerHTML='<p>Commencez à saisir votre besoin.</p>'};
 document.querySelector('[data-quick-search-open]')?.addEventListener('click',open);box.querySelectorAll('[data-quick-search-close]').forEach(x=>x.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close();if(e.key==='/'&&box.hidden&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();open()}});
 Promise.all([fetch('data/providers.json').then(r=>r.json()),fetch('data/materials.json').then(r=>r.json()),fetch('data/equipment.json').then(r=>r.json())]).then(([p,m,e])=>{data=[...(p.items||[]).map(x=>({...x,kind:'prestataire'})),...(m.items||[]).map(x=>({...x,kind:'matériau'})),...(e.items||[]).map(x=>({...x,kind:'engin'}))]});
 const prepare=a=>{const f=document.querySelector('[data-request-form]');if(!f)return;f.querySelector('[name="need"]').value=a.raw;if(a.category)f.querySelector('[name="category"]').value=a.category;if(a.location)f.querySelector('[name="location"]').value=a.location;if(a.date)f.querySelector('[name="date"]').value=a.date;close();f.scrollIntoView({behavior:'smooth',block:'center'})};
 input.addEventListener('input',()=>{const a=understand(input.value),q=normalize(a.terms);if(!input.value.trim()){results.innerHTML='<p>Commencez à saisir votre besoin.</p>';return}
  let rows=data.filter(x=>(!a.category||x.kind===a.category)&&(!q||normalize([x.name,x.category,x.location,x.area,x.use,...(x.services||[])].join(' ')).includes(q))).slice(0,7);
  const chips=[a.category&&'Type : '+a.category,a.location&&'Zone : '+a.location,a.date&&'Date : '+a.date].filter(Boolean).map(x=>'<span class="verified">'+esc(x)+'</span>').join(' ');
  results.innerHTML='<div style="padding:10px 13px">'+chips+'</div>'+(rows.length?rows.map(x=>'<button type="button" class="quick-result" data-quick-id="'+esc(x.id)+'" data-quick-name="'+esc(x.name)+'" data-quick-kind="'+esc(x.kind)+'"><span><strong>'+esc(x.name)+'</strong><small>'+esc(x.category||x.use||'BTP')+(x.area?' · '+esc(x.area):'')+'</small></span><span class="quick-kind">'+esc(x.kind)+'</span></button>').join(''):'<p>Aucun résultat exact dans le catalogue.</p>')+'<button type="button" class="quick-result" data-smart-request="1"><span><strong>Confier cette recherche à Majestik</strong><small>Préremplir la demande avec le besoin, la zone et la date détectés</small></span><span class="quick-kind">Demande →</span></button>';
 });
 results.addEventListener('click',e=>{const smart=e.target.closest('[data-smart-request]');if(smart){prepare(understand(input.value));return}const b=e.target.closest('[data-quick-id]');if(!b)return;const a=understand(input.value);a.raw=b.dataset.quickName+(a.location?' à '+a.location:'');a.category=b.dataset.quickKind;prepare(a)});
})();
