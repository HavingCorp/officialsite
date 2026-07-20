(function(){
/* ---- i18n (UI chrome only; ingredient data stays from json) ---- */
var UI={
  en:{ search:'Search by name, INCI, function...', allRegions:'All regions', allFunctions:'All functions',
    fPatent:'Patented', fEu:'EU export', thName:'Ingredient', thInci:'INCI Name', thFunc:'Function', thPatent:'Patent',
    empty:'No ingredients found.', of:'of', rowPatent:'Patent',
    yes:'Yes', no:'No', na:'N/A', notSpecified:'Not specified',
    patented:'Patented', noPatent:'No patent', patentNa:'Patent N/A',
    secComposition:'Composition', secProfile:'Profile', secData:'Data & Export',
    kInciFull:'Full INCI / Composition', kInciKo:'Korean INCI (full)', kAppearance:'Appearance / Form',
    kDosage:'Recommended Dosage', kCert:'Certification', kFunction:'Key Function (raw)',
    sClinical:'Clinical Data', sPatent:'Patent', sChina:'China Export', sEu:'EU Export',
    failed:'Failed to load data.' },
  ko:{ search:'\uC774\uB984, INCI, \uAE30\uB2A5\uC73C\uB85C \uAC80\uC0C9...', allRegions:'\uC804\uCCB4 \uC9C0\uC5ED', allFunctions:'\uC804\uCCB4 \uAE30\uB2A5',
    fPatent:'\uD2B9\uD5C8', fEu:'EU \uC218\uCD9C', thName:'\uC131\uBD84\uBA85', thInci:'INCI\uBA85', thFunc:'\uAE30\uB2A5', thPatent:'\uD2B9\uD5C8',
    empty:'\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.', of:'/', rowPatent:'\uD2B9\uD5C8',
    yes:'\uC608', no:'\uC544\uB2C8\uC624', na:'N/A', notSpecified:'\uBBF8\uAE30\uC7AC',
    patented:'\uD2B9\uD5C8', noPatent:'\uD2B9\uD5C8 \uC5C6\uC74C', patentNa:'\uD2B9\uD5C8 N/A',
    secComposition:'\uC870\uC131', secProfile:'\uD504\uB85C\uD544', secData:'\uB370\uC774\uD130 \uBC0F \uC218\uCD9C',
    kInciFull:'\uC804\uC131\uBD84 / INCI', kInciKo:'\uAD6D\uBB38 \uC804\uC131\uBD84', kAppearance:'\uC131\uC0C1 / \uD615\uD0DC',
    kDosage:'\uAD8C\uC7A5 \uD568\uB7C9', kCert:'\uC778\uC99D', kFunction:'\uD575\uC2EC \uAE30\uB2A5(\uC6D0\uBB38)',
    sClinical:'\uC784\uC0C1 \uB370\uC774\uD130', sPatent:'\uD2B9\uD5C8', sChina:'\uC911\uAD6D \uC218\uCD9C', sEu:'EU \uC218\uCD9C',
    failed:'\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.' }
};
function lang(){ var l=(document.documentElement.getAttribute('data-lang')||document.documentElement.lang||'en'); return l.slice(0,2)==='ko'?'ko':'en'; }
function t(k){ return (UI[lang()]||UI.en)[k] || UI.en[k] || ''; }
function applyUI(){
  document.querySelectorAll('[data-iui]').forEach(function(el){ var k=el.getAttribute('data-iui'); if(UI.en[k]!=null) el.textContent=t(k); });
  document.querySelectorAll('[data-iui-ph]').forEach(function(el){ var k=el.getAttribute('data-iui-ph'); if(UI.en[k]!=null) el.setAttribute('placeholder',t(k)); });
}

function start(DATA){
window.INGREDIENTS_DB=DATA;
var $=function(s){return document.querySelector(s);};
var CHK='<svg class="ingm__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>';
var DASH='<svg class="ingm__ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
function esc(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function oneInci(s){return esc((s||'').split(',')[0].trim());}
var REGION_EN={'중국':'China','튀르키예':'Türkiye','터키':'Türkiye'};
function regionLabel(r){return REGION_EN[r]||r||'';}
var TDH='padding:18px 20px;vertical-align:top;';
function rowHTML(d,i){
  var tags=d.fc.slice(0,2).map(function(t){return '<span class="ing-tag">'+esc(t)+'</span>';}).join('');
  if(d.fc.length>2) tags+='<span style="font-size:10px;color:#bbb;margin-left:2px;">+'+(d.fc.length-2)+'</span>';
  var isPat=(d.patent||'').toUpperCase()==='O';
  return '<tr class="ingredient-row" data-ing-index="'+i+'" tabindex="0" style="border-bottom:0.5px solid #f0f0f0;cursor:pointer;">'
    +'<td style="'+TDH+'max-width:230px;"><div style="font-size:15px;font-weight:500;color:#111;line-height:1.3;max-width:230px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="'+esc(d.name)+'">'+esc(d.name)+'</div></td>'
    +'<td style="'+TDH+'font-size:14px;font-weight:300;color:#555;">'+oneInci(d.inci_key)+'</td>'
    +'<td style="'+TDH+'">'+tags+'</td>'
    +'<td style="'+TDH+'text-align:right;white-space:nowrap;">'+(isPat?'<span class="ing-patok">'+CHK+t('rowPatent')+'</span>':'')+'</td></tr>';
}
var ING_PER=20, ingPage=1;
function ingFilter(){
  var q=($('#ing-q').value||'').trim().toLowerCase(),rg=$('#ing-region').value,fn=$('#ing-func').value,pt=$('#ing-patent').checked,eu=$('#ing-eu').checked;
  return DATA.filter(function(d){
    if(rg&&d.region!==rg)return false;
    if(fn&&d.fc.indexOf(fn)<0)return false;
    if(pt&&(d.patent||'').toUpperCase()!=='O')return false;
    if(eu&&(d.eu||'').toUpperCase()!=='O')return false;
    if(q){var b=[d.name,d.inci_key,d.ing_key,d.function,d.inci_full].join(' ').toLowerCase();if(b.indexOf(q)<0)return false;}
    return true;});
}
function pBtn(label,page,o){o=o||{};
  if(o.dots) return '<span style="min-width:24px;text-align:center;color:#bbb;font-size:13px;">…</span>';
  var st='min-width:34px;height:34px;padding:0 10px;border-radius:9px;font-size:13px;font-family:Inter,sans-serif;cursor:pointer;border:0.5px solid #e0e0e0;background:#fff;color:#555;transition:all .12s;';
  if(o.current) st='min-width:34px;height:34px;padding:0 11px;border-radius:9px;font-size:13px;font-weight:600;border:0.5px solid #F18B42;background:#F18B42;color:#fff;cursor:default;';
  if(o.disabled) st+='opacity:.35;cursor:default;';
  return '<button type="button" style="'+st+'" '+((o.disabled||o.current)?'disabled':'onclick="ingGo('+page+')"')+'>'+label+'</button>';
}
function renderPager(total){
  var el=$('#ing-pager'); if(!el)return;
  var pages=Math.max(1,Math.ceil(total/ING_PER));
  if(ingPage>pages)ingPage=pages;
  if(pages<=1){el.innerHTML='';return;}
  var win=[],i;
  for(i=1;i<=pages;i++){ if(i===1||i===pages||(i>=ingPage-1&&i<=ingPage+1))win.push(i); else if(win[win.length-1]!=='.')win.push('.'); }
  var h=pBtn('‹',ingPage-1,{disabled:ingPage===1});
  win.forEach(function(p){ h+= (p==='.')?pBtn('',0,{dots:true}):pBtn(p,p,{current:p===ingPage}); });
  h+=pBtn('›',ingPage+1,{disabled:ingPage===pages});
  el.innerHTML=h;
}
function ingRender(keepPage){
  if(!keepPage) ingPage=1;
  var rows=ingFilter();
  $('#ing-count').textContent=rows.length+' '+t('of')+' '+DATA.length;
  var pages=Math.max(1,Math.ceil(rows.length/ING_PER));
  if(ingPage>pages)ingPage=pages;
  var slice=rows.slice((ingPage-1)*ING_PER, ingPage*ING_PER);
  $('#ing-tbody').innerHTML=slice.map(function(d){return rowHTML(d,DATA.indexOf(d));}).join('');
  $('#ing-empty').style.display=rows.length?'none':'block';
  renderPager(rows.length);
}
window.ingRender=ingRender;
window.ingGo=function(p){ingPage=p;ingRender(true);var t=document.getElementById('ing-table');if(t){var y=t.getBoundingClientRect().top+window.pageYOffset-90;window.scrollTo({top:y,behavior:'smooth'});}};
window.ingSync=function(){$('#ing-chk-pat').classList.toggle('on',$('#ing-patent').checked);$('#ing-chk-eu').classList.toggle('on',$('#ing-eu').checked);};
function kv(k,v){return '<div class="ingm__kv"><div class="ingm__k">'+k+'</div><div class="ingm__v">'+(v?esc(v):'<span class="ingm__miss">'+t('notSpecified')+'</span>')+'</div></div>';}
function stat(k,v){var s=(v||'').toUpperCase();var ok=s==='O';var ico=ok?CHK:DASH;var txt=ok?t('yes'):(s==='X'?t('no'):t('na'));return '<div class="ingm__stat"><div class="ingm__sk">'+k+'</div><div class="ingm__sv '+(ok?'ok':'no')+'">'+ico+txt+'</div></div>';}
function statPat(p){var s=(p||'').toUpperCase();var ok=s==='O';var ico=ok?CHK:DASH;var txt=ok?t('yes'):(s==='X'?t('no'):t('na'));return '<div class="ingm__stat"><div class="ingm__sk">'+t('sPatent')+'</div><div class="ingm__sv '+(ok?'ok':'no')+'">'+ico+txt+'</div></div>';}
function patChip(p){var s=(p||'').toUpperCase();if(s==='O')return '<span class="ingm__chip pat">'+t('patented')+'</span>';if(s==='X')return '<span class="ingm__chip patx">'+t('noPatent')+'</span>';return '<span class="ingm__chip patx">'+t('patentNa')+'</span>';}
var lastIdx=null;
window.ingOpenModal=function(i){
  var d=DATA[i];if(!d)return; lastIdx=i;
  var ft=d.fc.map(function(t){return '<span class="ingm__tag">'+esc(t)+'</span>';}).join('');
  $('#ing-modal-inner').innerHTML='<button class="ingm__x" onclick="ingCloseModal()">&times;</button>'
   +'<div class="ingm__head"><div class="ingm__chips">'+(d.region?'<span class="ingm__chip region">'+esc(regionLabel(d.region))+'</span>':'')+patChip(d.patent)+'</div>'
   +'<h2>'+esc(d.name)+'</h2><p class="ingm__inci">'+esc(d.inci_key)+'</p><div class="ingm__tags">'+ft+'</div></div>'
   +'<div class="ingm__body">'
   +(d.marketing?'<div class="ingm__callout">'+esc(d.marketing)+'</div>':'')
   +'<div class="ingm__sec"><div class="ingm__h">'+t('secComposition')+'</div>'+kv(t('kInciFull'),d.inci_full)+kv(t('kInciKo'),d.ing_full)+'</div>'
   +'<div class="ingm__sec"><div class="ingm__h">'+t('secProfile')+'</div>'+kv(t('kAppearance'),d.appearance)+kv(t('kDosage'),d.dosage)+kv(t('kCert'),d.cert)+kv(t('kFunction'),d.function)+'</div>'
   +'<div class="ingm__sec"><div class="ingm__h">'+t('secData')+'</div><div class="ingm__grid">'+stat(t('sClinical'),d.clinical)+statPat(d.patent)+stat(t('sChina'),d.china)+stat(t('sEu'),d.eu)+'</div></div>'
   +'</div>';
  $('#ing-modal').classList.add('on');document.body.style.overflow='hidden';
};
window.ingCloseModal=function(){$('#ing-modal').classList.remove('on');document.body.style.overflow='';lastIdx=null;};
window.__ingReopen=function(){ if(lastIdx!=null && $('#ing-modal').classList.contains('on')) window.ingOpenModal(lastIdx); };
document.addEventListener('click',function(e){var r=e.target.closest&&e.target.closest('#ing-tbody tr.ingredient-row');if(r){e.preventDefault();window.ingOpenModal(parseInt(r.getAttribute('data-ing-index'),10));}},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape')window.ingCloseModal();if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('#ing-tbody tr.ingredient-row')){e.preventDefault();window.ingOpenModal(parseInt(e.target.getAttribute('data-ing-index'),10));}},true);
// populate filters
var regs=[];DATA.forEach(function(d){if(d.region&&regs.indexOf(d.region)<0)regs.push(d.region);});regs.sort();
regs.forEach(function(r){var o=document.createElement('option');o.value=r;o.textContent=regionLabel(r);$('#ing-region').appendChild(o);});
var fns=[];DATA.forEach(function(d){d.fc.forEach(function(f){if(fns.indexOf(f)<0)fns.push(f);});});fns.sort();
fns.forEach(function(f){var o=document.createElement('option');o.value=f;o.textContent=f;$('#ing-func').appendChild(o);});
applyUI();
ingRender();
}
function fail(e){console.error("ingredients data load failed",e);var em=document.getElementById("ing-empty");if(em){em.textContent=t("failed");em.style.display="block";}}
fetch("data/ingredients-ko.json").then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(start).catch(fail);

/* re-apply UI language on switch */
document.addEventListener('havinglangchange', function(){
  applyUI();
  if(typeof window.ingRender==='function') window.ingRender(true);
  if(typeof window.__ingReopen==='function') window.__ingReopen();
});
})();
