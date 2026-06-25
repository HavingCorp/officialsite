/* Finished Products — bilingual, data-driven from data/brands.json + data/oem.json */
(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  ready(function(){
    var page = location.pathname.split('/').pop() || 'finished.html';
    if(page !== 'finished.html') return;

    var brands=[], formats=[], state={view:'list', brand:null, modal:null};

    var UI={
      en:{ listTitle:'Finished Products',
        listDesc:'Select a brand to review its positioning and product lineup, or open OEM / ODM to review available formulation formats.',
        heroDesc:'Brand portfolio, product lineups, and OEM / ODM formats for global distribution review.',
        back:'\u2190 Back to Finished Products', brand:'BRAND', oem:'OEM / ODM', oemKicker:'FINISHED PRODUCTS',
        oemDesc:'Private-label formulations you can select for your own product development. Manufacturer arranged on request.',
        oemCardDesc:'Selectable formulations for private-label product development.',
        manufacturer:'Manufacturer', founded:'Founded', category:'Category', products:'Products', formatsLabel:'Formats',
        onRequest:'On request', skus:'SKUs', types:'types', koreanBrand:'Korean brand',
        signature:'Signature ingredients', keyIng:'Key Ingredients', benefits:'Benefits',
        features:'Features', mechanism:'Technology & Mechanism', inquire:'Inquire about this \u2192',
        notePrep:'Product details for this brand are being prepared.', noteContact:'Contact us', noteTail:'for the current lineup and specifications.',
        loading:'Loading brands\u2026' },
      ko:{ listTitle:'\uC644\uC81C\uD488',
        listDesc:'\uBE0C\uB79C\uB4DC\uB97C \uC120\uD0DD\uD574 \uD3EC\uC9C0\uC154\uB2DD\uACFC \uC81C\uD488 \uB77C\uC778\uC5C5\uC744 \uD655\uC778\uD558\uAC70\uB098, OEM / ODM\uC5D0\uC11C \uC81C\uACF5 \uAC00\uB2A5\uD55C \uCC98\uBC29 \uD3EC\uB9F7\uC744 \uD655\uC778\uD558\uC138\uC694.',
        heroDesc:'\uAE00\uB85C\uBC8C \uC720\uD1B5 \uAC80\uD1A0\uB97C \uC704\uD55C \uBE0C\uB79C\uB4DC \uD3EC\uD2B8\uD3F4\uB9AC\uC624, \uC81C\uD488 \uB77C\uC778\uC5C5, \uADF8\uB9AC\uACE0 OEM / ODM \uCC98\uBC29.',
        back:'\u2190 \uC644\uC81C\uD488\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30', brand:'\uBE0C\uB79C\uB4DC', oem:'OEM / ODM', oemKicker:'\uC644\uC81C\uD488',
        oemDesc:'\uC790\uCCB4 \uC81C\uD488 \uAC1C\uBC1C\uC744 \uC704\uD574 \uC120\uD0DD\uD560 \uC218 \uC788\uB294 \uD504\uB77C\uC774\uBE57\uB77C\uBCA8 \uCC98\uBC29\uC785\uB2C8\uB2E4. \uC81C\uC870\uB294 \uBB38\uC758 \uC2DC \uC548\uB0B4.',
        oemCardDesc:'\uD504\uB77C\uC774\uBE57\uB77C\uBCA8 \uC81C\uD488 \uAC1C\uBC1C\uC744 \uC704\uD55C \uC120\uD0DD \uAC00\uB2A5\uD55C \uCC98\uBC29.',
        manufacturer:'\uC81C\uC870\uC0AC', founded:'\uC124\uB9BD', category:'\uCE74\uD14C\uACE0\uB9AC', products:'\uC81C\uD488', formatsLabel:'\uD3EC\uB9F7',
        onRequest:'\uBB38\uC758', skus:'\uAC1C SKU', types:'\uC885', koreanBrand:'\uD55C\uAD6D \uBE0C\uB79C\uB4DC',
        signature:'\uB300\uD45C \uC131\uBD84', keyIng:'\uD575\uC2EC \uC131\uBD84', benefits:'\uBCA0\uB124\uD56B',
        features:'\uD2B9\uC9D5', mechanism:'\uAE30\uC220 \uBC0F \uBA54\uCEE4\uB2C8\uC998', inquire:'\uC774 \uD56D\uBAA9 \uBB38\uC758\uD558\uAE30 \u2192',
        notePrep:'\uC774 \uBE0C\uB79C\uB4DC\uC758 \uC81C\uD488 \uC0C1\uC138 \uC815\uBCF4\uB294 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4.', noteContact:'\uBB38\uC758\uD558\uAE30', noteTail:'\uD604\uC7AC \uB77C\uC778\uC5C5\uACFC \uC0AC\uC591\uC744 \uC548\uB0B4\uD574 \uB4DC\uB9BD\uB2C8\uB2E4.',
        loading:'\uBE0C\uB79C\uB4DC \uBD88\uB7EC\uC624\uB294 \uC911\u2026' }
    };
    Object.assign(UI.en,{spec:'Specifications',volume:'Volume',shelfLife:'Shelf life',functional:'Functional type',origin:'Country of origin',certs:'Certifications & test reports',inci:'Full ingredients (INCI)',pb:'Private label (PB / OEM)',pbYes:'Available',pbNo:'On request',markets:'Currently sold in',concept:'Concept'});
    Object.assign(UI.ko,{spec:'사양',volume:'용량',shelfLife:'유통기한',functional:'기능성',origin:'원산지',certs:'인증 · 시험성적서',inci:'전성분 (INCI)',pb:'PB · 자체 브랜드',pbYes:'가능',pbNo:'문의',markets:'현재 판매 지역',concept:'컨셉'});
    function lang(){ var l=(document.documentElement.getAttribute('data-lang')||document.documentElement.lang||'en'); return l.slice(0,2)==='ko'?'ko':'en'; }
    function t(k){ return (UI[lang()]||UI.en)[k] || UI.en[k] || ''; }
    function L(v){ if(v==null) return ''; if(typeof v==='string') return v; return v[lang()]||v.en||v.ko||''; }

    function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
    function monogram(name){ var w=String(name||'').trim().split(/\s+/).filter(Boolean); if(!w.length) return '?'; return (w.length===1? w[0].slice(0,2): w[0][0]+w[1][0]).toUpperCase(); }
    function products(b){ return (b&&b.products)||[]; }
    function pName(p){ return L(p&&p.name)||(p&&p.sku)||'Product'; }
    function pType(p){ return L(p&&p.type)||'Product'; }
    function brandDesc(b){ return L(b&&b.description)||''; }
    function cardLogoHTML(b){
      var nm=esc(b&&b.name);
      if(b&&b.logo){
        return '<div class="fp-card-logo"><img src="'+esc(b.logo)+'" alt="'+nm+'" onerror="this.parentNode.style.display=\'none\';"></div>';
      }
      return '';
    }
    function brandCat(b){ return L(b&&b.category)|| (lang()==='ko'?'\uD55C\uAD6D \uBDF0\uD2F0':'Korean Beauty'); }

    function setHero(title,desc,kicker){
      var T=document.querySelector('.thin-page-title__title'), D=document.querySelector('.thin-page-title__desc'), K=document.querySelector('.thin-page-title__kicker');
      if(T) T.textContent=title; if(D) D.textContent=desc; if(K) K.textContent=kicker||'BUSINESS';
    }
    function logoHTML(b,cls){ cls=cls||'';
      if(b&&b.logo) return '<span class="fp-logo '+cls+'" style="--acc:'+esc(b.accent||'#C8602A')+'"><img src="'+esc(b.logo)+'" alt="'+esc(b.name)+'" onerror="this.parentNode.textContent='+"'"+esc(monogram(b&&b.name))+"'"+'"></span>';
      return '<span class="fp-logo '+cls+'" style="--acc:'+esc((b&&b.accent)||'#C8602A')+'">'+esc(monogram(b&&b.name))+'</span>';
    }

    /* hide legacy markup, build shell */
    document.querySelectorAll('#finished-explorer,.finished-explorer,.fe-shell').forEach(function(el){ el.style.display='none'; });
    var oldf=document.getElementById('fp-flow'); if(oldf) oldf.remove();
    var hero=document.querySelector('.thin-page-title');
    var app=document.createElement('main'); app.id='fp-flow';
    app.innerHTML=[
      '<section id="fp-list" class="fp-list"><div class="fp-list-head"><h2 id="fp-list-title"></h2><p id="fp-list-desc"></p></div><div id="fp-card-grid" class="fp-card-grid"></div></section>',
      '<section id="fp-detail" class="fp-detail">',
        '<button type="button" id="fp-back" class="fp-back"></button>',
        '<div class="fp-detail-intro"><div class="fp-detail-brand"><div id="fp-detail-logo" class="fp-logo fp-logo--lg"></div><div id="fp-detail-meta" class="fp-detail-metalist"></div></div>',
        '<div><h2 id="fp-detail-title"></h2><p id="fp-detail-desc"></p><div id="fp-detail-sig" class="fp-sig"></div></div></div>',
        '<div id="fp-item-note" class="fp-item-note" hidden></div><div id="fp-item-grid" class="fp-item-grid"></div>',
      '</section>',
      '<div id="fp-modal" class="fp-modal" aria-hidden="true"><div class="fp-modal-backdrop" data-close="1"></div>',
        '<div class="fp-modal-panel" role="dialog" aria-modal="true"><button type="button" class="fp-modal-close" data-close="1" aria-label="Close">\u00d7</button>',
        '<div class="fp-modal-grid"><div id="fp-m-gallery" class="fp-m-gallery"></div><div class="fp-m-main" id="fp-m-main"></div></div></div></div>'
    ].join('');
    if(hero&&hero.parentNode) hero.insertAdjacentElement('afterend',app); else document.body.appendChild(app);

    var listEl=document.getElementById('fp-list'), detail=document.getElementById('fp-detail'),
        cardGrid=document.getElementById('fp-card-grid'), itemGrid=document.getElementById('fp-item-grid'),
        itemNote=document.getElementById('fp-item-note'), modal=document.getElementById('fp-modal');

    function galleryHTML(accent,imgs,mono,typeLabel){
      imgs=(imgs||[]).filter(Boolean);
      if(imgs.length){
        var main='<div class="fp-m-photo"><img src="'+esc(imgs[0])+'" alt=""></div>';
        var th=imgs.length>1?'<div class="fp-m-thumbs">'+imgs.map(function(s,i){return '<button type="button" class="fp-m-thumb'+(i===0?' is-active':'')+'" data-src="'+esc(s)+'"><img src="'+esc(s)+'" alt=""></button>';}).join('')+'</div>':'';
        return main+th;
      }
      return '<div class="fp-m-photo fp-m-photo--ph" style="--acc:'+esc(accent||'#C8602A')+'"><span class="fp-m-ph-mono">'+esc(mono)+'</span><span class="fp-m-ph-type">'+esc(typeLabel)+'</span></div>';
    }

    /* ---------- renderers (lang-aware, called on render + lang change) ---------- */
    function renderList(){
      document.getElementById('fp-list-title').textContent=t('listTitle');
      document.getElementById('fp-list-desc').textContent=t('listDesc');
      var cards=brands.map(function(b,i){
        return '<article class="fp-card" tabindex="0" data-card="brand" data-index="'+i+'">'+
          cardLogoHTML(b)+
          '<p class="fp-card-desc">'+esc(brandDesc(b).slice(0,170))+'</p></article>';
      }).join('');
      var oem='<article class="fp-card oem" tabindex="0" data-card="oem">'+
        '<div class="fp-card-oemlabel">OEM / ODM</div>'+
        '<p class="fp-card-desc">'+esc(t('oemCardDesc'))+'</p></article>';
      cardGrid.innerHTML=cards+oem;
    }
    function renderBrand(b){
      setHero(b.name||'Brand', brandCat(b), t('brand'));
      var lg=document.getElementById('fp-detail-logo');
      if(b.logo){ lg.className='fp-card-logo'; lg.style.display=''; lg.innerHTML='<img src="'+esc(b.logo)+'" alt="'+esc(b.name)+'" onerror="this.parentNode.style.display=\'none\';">'; }
      else { lg.style.display='none'; lg.innerHTML=''; }
      document.getElementById('fp-detail-title').textContent=b.name||'Brand';
      document.getElementById('fp-detail-desc').textContent=brandDesc(b);
      var ps=products(b);
      document.getElementById('fp-detail-meta').innerHTML='';
      var sig=(b.signature_ingredients||[]).slice(0,8);
      document.getElementById('fp-detail-sig').innerHTML= sig.length? ('<div class="fp-sig-label">'+esc(t('signature'))+'</div>'+sig.map(function(s){return '<span class="fp-chip">'+esc(L(s))+'</span>';}).join('')):'';
      if(!ps.length){ itemGrid.innerHTML=''; itemNote.hidden=false;
        itemNote.innerHTML=esc(t('notePrep'))+' <a href="inquiry.html">'+esc(t('noteContact'))+'</a> '+esc(t('noteTail'));
      }else{ itemNote.hidden=true;
        itemGrid.innerHTML=ps.map(function(p,i){
          var d=L(p.description), img=(p.images&&p.images.length?p.images[0]:(p.image||''));
          return '<article class="fp-item" tabindex="0" data-kind="sku" data-index="'+i+'">'+
            '<div class="fp-item-img'+(img?'':' is-empty')+'">'+(img?'<img src="'+esc(img)+'" alt="'+esc(pName(p))+'" onerror="this.parentNode.classList.add(\'is-empty\');this.remove();">':'')+'</div>'+
            '<div class="fp-item-body"><div class="fp-item-type">'+esc(pType(p))+'</div><h3>'+esc(pName(p))+'</h3>'+
            (d?'<p>'+esc(d.split('\n')[0].slice(0,90))+'</p>':'')+'</div>'+
            '<div class="fp-item-meta">'+esc(p.volume||'')+'</div></article>';
        }).join('');
      }
    }
    function renderOem(){
      setHero('OEM / ODM', t('oemDesc'), t('oemKicker'));
      var lg=document.getElementById('fp-detail-logo'); lg.outerHTML='<span id="fp-detail-logo" class="fp-logo fp-logo--lg" style="--acc:#C8602A">OE</span>';
      document.getElementById('fp-detail-title').textContent='OEM / ODM';
      document.getElementById('fp-detail-desc').textContent=t('oemDesc');
      document.getElementById('fp-detail-meta').innerHTML='<div class="fp-meta-row"><span>'+esc(t('formatsLabel'))+'</span><b>'+formats.length+' '+t('types')+'</b></div>';
      document.getElementById('fp-detail-sig').innerHTML=''; itemNote.hidden=true;
      itemGrid.innerHTML=formats.map(function(f,i){
        return '<article class="fp-item" tabindex="0" data-kind="format" data-index="'+i+'"><div><div class="fp-item-type">'+esc(L(f.spec&&f.spec.category)||'Formulation')+'</div><h3>'+esc(L(f.name))+'</h3>'+
          (f.tagline?'<p>'+esc(L(f.tagline).slice(0,110))+'</p>':'')+'</div><div class="fp-item-meta">'+esc(L(f.spec&&f.spec.type)||'')+'</div></article>';
      }).join('');
    }
    function renderModal(){
      var m=state.modal; if(!m) return;
      var gal=document.getElementById('fp-m-gallery'), main=document.getElementById('fp-m-main');
      if(m.kind==='sku'){
        var b=m.brand, p=m.product;
        gal.innerHTML=galleryHTML(b.accent,p.images,monogram(b.name),pType(p));
        var d=L(p.description);
        var metaBits=[]; if(L(p.type)) metaBits.push(L(p.type)); if(p.volume) metaBits.push(p.volume);
        var concepts=(p.concepts||[]).filter(Boolean);
        var feats=(p.features||[]);
        var keyIngs=(p.key_ingredients||[]);
        var mech=L(p.mechanism)||'';
        var certs=(p.certifications||[]).concat(p.test_reports||[]).filter(Boolean);
        var inci=L(p.inci)||'';
        var pb=(p.private_label!=null)?p.private_label:(b.private_label!=null?b.private_label:null);
        var spec=[]; if(p.volume) spec.push([t('volume'),p.volume]); if(p.shelf_life) spec.push([t('shelfLife'),p.shelf_life]); if(L(p.functional)) spec.push([t('functional'),L(p.functional)]); if(p.origin) spec.push([t('origin'),L(p.origin)]);
        main.innerHTML='<div class="fp-m-brand">'+esc(b.name||'')+'</div><h3>'+esc(pName(p))+'</h3>'+
          '<div class="fp-m-meta">'+metaBits.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div>'+
          (d?'<p class="fp-m-desc">'+esc(d.replace(/\n+/g,' ').trim())+'</p>':'')+
          (concepts.length?'<div class="fp-m-chips">'+concepts.map(function(x){return '<span class="fp-chip">'+esc(L(x))+'</span>';}).join('')+'</div>':'')+
          (feats.length?'<div class="fp-m-sec"><h4>'+esc(t('features'))+'</h4><ul class="fp-m-list">'+feats.map(function(ft){return '<li><b>'+esc(L(ft.title))+'</b><br>'+esc(L(ft.desc))+'</li>';}).join('')+'</ul></div>':'')+
          (keyIngs.length?'<div class="fp-m-sec"><h4>'+esc(t('keyIng'))+'</h4><div class="fp-m-ingcards">'+keyIngs.map(function(ki){return '<div class="fp-m-ingcard"><div class="fp-m-ingdot" style="--acc:'+esc(b.accent||'#C8602A')+'">'+esc((L(ki.name)||'?').slice(0,2))+'</div><div><b>'+esc(L(ki.name))+'</b><span>'+esc(L(ki.desc))+'</span></div></div>';}).join('')+'</div></div>':'')+
          (mech?'<div class="fp-m-sec"><h4>'+esc(t('mechanism'))+'</h4><p class="fp-m-secp">'+esc(mech)+'</p></div>':'')+
          (spec.length?'<div class="fp-m-sec"><h4>'+esc(t('spec'))+'</h4><div class="fp-m-spec">'+spec.map(function(s){return '<div class="fp-spec-row"><span>'+esc(s[0])+'</span><b>'+esc(s[1])+'</b></div>';}).join('')+'</div></div>':'')+
          (certs.length?'<div class="fp-m-sec"><h4>'+esc(t('certs'))+'</h4><ul class="fp-m-list">'+certs.map(function(x){return '<li>'+esc(L(x))+'</li>';}).join('')+'</ul></div>':'')+
          (inci?'<details class="fp-m-sec fp-m-inci"><summary>'+esc(t('inci'))+'</summary><p class="fp-m-secp">'+esc(inci)+'</p></details>':'')+
          (pb!=null?'<div class="fp-m-sec"><h4>'+esc(t('pb'))+'</h4><span class="fp-m-badge'+(pb?' is-yes':'')+'">'+esc(pb?t('pbYes'):t('pbNo'))+'</span></div>':'')+
          '<a class="fp-m-cta" href="inquiry.html?product='+encodeURIComponent((b.name||'')+' - '+pName(p))+'">'+esc(t('inquire'))+'</a>';
      }else{
        var f=m.format;
        gal.innerHTML=galleryHTML(f.accent,f.images,'OE',L(f.spec&&f.spec.category));
        var sp=f.spec||{}, sm=[]; ['category','type','container'].forEach(function(k){ if(sp[k]) sm.push(L(sp[k])); });
        main.innerHTML='<div class="fp-m-brand">OEM / ODM</div><h3>'+esc(L(f.name))+'</h3>'+
          '<div class="fp-m-meta">'+sm.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div>'+
          (f.tagline?'<p class="fp-m-desc">'+esc(L(f.tagline))+'</p>':'')+
          ((f.features&&f.features.length)?'<div class="fp-m-sec"><h4>'+esc(t('features'))+'</h4><ul class="fp-m-list">'+f.features.map(function(ft){return '<li><b>'+esc(L(ft.title))+'</b><br>'+esc(L(ft.desc))+'</li>';}).join('')+'</ul></div>':'')+
          (f.mechanism?'<div class="fp-m-sec"><h4>'+esc(t('mechanism'))+'</h4><p class="fp-m-secp">'+esc(L(f.mechanism))+'</p></div>':'')+
          ((f.key_ingredients&&f.key_ingredients.length)?'<div class="fp-m-sec"><h4>'+esc(t('keyIng'))+'</h4><div class="fp-m-ingcards">'+f.key_ingredients.map(function(ki){return '<div class="fp-m-ingcard"><div class="fp-m-ingdot" style="--acc:'+esc(f.accent||'#C8602A')+'">'+esc((L(ki.name)||'?').slice(0,2))+'</div><div><b>'+esc(L(ki.name))+'</b><span>'+esc(L(ki.desc))+'</span></div></div>';}).join('')+'</div></div>':'')+
          '<a class="fp-m-cta" href="inquiry.html?product='+encodeURIComponent('OEM/ODM - '+L(f.name))+'">'+esc(t('inquire'))+'</a>';
      }
    }

    function render(){
      document.getElementById('fp-back').textContent=t('back');
      if(state.view==='list'){ setHero(t('listTitle'),t('heroDesc'),'BUSINESS'); renderList(); }
      else if(state.view==='brand' && state.brand){ renderBrand(state.brand); }
      else if(state.view==='oem'){ renderOem(); }
      if(modal.classList.contains('is-open')) renderModal();
    }

    /* ---------- view transitions ---------- */
    function showList(){ state.view='list'; listEl.style.display='block'; detail.classList.remove('is-active'); render(); window.scrollTo({top:0,behavior:'smooth'}); }
    function showBrand(b){ state.view='brand'; state.brand=b; listEl.style.display='none'; detail.classList.add('is-active');
      try{ if(!(history.state&&history.state.fpDetail)) history.pushState({fpDetail:1},''); }catch(e){} render(); window.scrollTo({top:0,behavior:'smooth'}); }
    function showOem(){ state.view='oem'; listEl.style.display='none'; detail.classList.add('is-active');
      try{ if(!(history.state&&history.state.fpDetail)) history.pushState({fpDetail:1},''); }catch(e){} render(); window.scrollTo({top:0,behavior:'smooth'}); }
    function openModal(){ modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); renderModal(); }
    function closeModal(){ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); state.modal=null; }

    cardGrid.addEventListener('click',function(e){ var c=e.target.closest('.fp-card'); if(!c) return; c.dataset.card==='oem'?showOem():showBrand(brands[+c.dataset.index]); });
    cardGrid.addEventListener('keydown',function(e){ if(e.key!=='Enter')return; var c=e.target.closest('.fp-card'); if(!c)return; c.dataset.card==='oem'?showOem():showBrand(brands[+c.dataset.index]); });
    itemGrid.addEventListener('click',function(e){ var it=e.target.closest('.fp-item'); if(!it) return;
      if(it.dataset.kind==='format'){ state.modal={kind:'format',format:formats[+it.dataset.index]}; }
      else { state.modal={kind:'sku',brand:state.brand,product:products(state.brand)[+it.dataset.index]}; }
      openModal();
    });
    itemGrid.addEventListener('keydown',function(e){ if(e.key==='Enter'){ var it=e.target.closest('.fp-item'); if(it) it.click(); } });
    document.getElementById('fp-back').addEventListener('click',function(){ if(history.state&&history.state.fpDetail) history.back(); else showList(); });
    window.addEventListener('popstate',function(){ if(detail.classList.contains('is-active')) showList(); });
    modal.addEventListener('click',function(e){ if(e.target.dataset&&e.target.dataset.close) return closeModal();
      var th=e.target.closest('.fp-m-thumb'); if(th){ var main=modal.querySelector('.fp-m-photo img'); if(main) main.src=th.dataset.src; modal.querySelectorAll('.fp-m-thumb').forEach(function(x){x.classList.toggle('is-active',x===th);}); } });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&modal.classList.contains('is-open')) closeModal(); });
    document.addEventListener('havinglangchange', render);

    /* ---------- load data ---------- */
    Promise.all([
      fetch('data/brands.json').then(function(r){return r.json();}).catch(function(){return {brands:[]};}),
      fetch('data/oem.json').then(function(r){return r.json();}).catch(function(){return {formats:[]};})
    ]).then(function(res){
      brands=(res[0]&&res[0].brands)||[]; formats=(res[1]&&res[1].formats)||[];
      showList();
    });
  });
})();

/* hero back button + detail-mode body class */
(function(){
  function init(){
    var inner=document.querySelector('.thin-page-title__inner'), detail=document.getElementById('fp-detail');
    if(!inner||!detail){ return setTimeout(init,150); }
    if(!document.getElementById('fp-hero-back')){
      var wrap=document.createElement('div'); wrap.id='fp-hero-back';
      wrap.innerHTML='<button type="button" class="fp-hero-back-btn">\u2190</button>';
      inner.appendChild(wrap);
      wrap.querySelector('.fp-hero-back-btn').addEventListener('click',function(){ var bk=document.getElementById('fp-back'); if(bk) bk.click(); });
    }
    var sync=function(){ document.body.classList.toggle('fp-detail-mode', detail.classList.contains('is-active')); };
    try{ new MutationObserver(sync).observe(detail,{attributes:true,attributeFilter:['class']}); }catch(e){}
    sync();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
