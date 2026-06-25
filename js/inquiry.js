/* inquiry form -> Web3Forms submission (access key from config.js); bilingual status */
(function(){
  var form=document.getElementById('inq-form');
  if(!form)return;
  var statusEl=document.getElementById('inq-status');
  var submitBtn=document.getElementById('inq-submit');
  var consent=document.getElementById('inq-consent');
  var keyField=document.getElementById('inq-access-key');
  var KEY=(window.HAVING_CONFIG&&window.HAVING_CONFIG.web3formsAccessKey)||'';
  if(keyField)keyField.value=KEY;

  var MSG={
    en:{ consent:'Please agree to the Privacy Policy before submitting.',
      required:'Please fill in all required fields.',
      area:'Please select at least one business area.',
      notConnected:'The form is not yet connected. Please email us directly at having@having.co.kr.',
      sending:'Sending…', sendingStatus:'Sending your inquiry…',
      success:'Thank you. Your inquiry has been sent — we will get back to you within 1–2 business days.',
      fail:'Something went wrong. Please try again, or email us at having@having.co.kr.',
      network:'Network error. Please try again, or email us at having@having.co.kr.',
      productPrefix:'Product of interest: ' },
    ko:{ consent:'\uC81C\uCD9C \uC804\uC5D0 \uAC1C\uC778\uC815\uBCF4\uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB3D9\uC758\uD574 \uC8FC\uC138\uC694.',
      required:'\uD544\uC218 \uD56D\uBAA9\uC744 \uBAA8\uB450 \uC785\uB825\uD574 \uC8FC\uC138\uC694.',
      area:'\uC0AC\uC5C5 \uBD84\uC57C\uB97C \uD558\uB098 \uC774\uC0C1 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.',
      notConnected:'\uD3FC\uC774 \uC544\uC9C1 \uC5F0\uACB0\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. having@having.co.kr \uB85C \uC9C1\uC811 \uC774\uBA54\uC77C \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4.',
      sending:'\uBCF4\uB0B4\uB294 \uC911\u2026', sendingStatus:'\uBB38\uC758\uB97C \uBCF4\uB0B4\uB294 \uC911\u2026',
      success:'\uAC10\uC0AC\uD569\uB2C8\uB2E4. \uBB38\uC758\uAC00 \uC811\uC218\uB418\uC5C8\uC2B5\uB2C8\uB2E4 \u2014 1~2 \uC601\uC5C5\uC77C \uC774\uB0B4\uC5D0 \uB2F5\uBCC0\uB4DC\uB9AC\uACA0\uC2B5\uB2C8\uB2E4.',
      fail:'\uBB38\uC81C\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2DC\uAC70\uB098 having@having.co.kr \uB85C \uC774\uBA54\uC77C \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4.',
      network:'\uB124\uD2B8\uC6CC\uD06C \uC624\uB958\uC785\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC2DC\uAC70\uB098 having@having.co.kr \uB85C \uC774\uBA54\uC77C \uBD80\uD0C1\uB4DC\uB9BD\uB2C8\uB2E4.',
      productPrefix:'\uAD00\uC2EC \uC81C\uD488: ' }
  };
  function lang(){ var l=(document.documentElement.getAttribute('data-lang')||document.documentElement.lang||'en'); return l.slice(0,2)==='ko'?'ko':'en'; }
  function m(k){ return (MSG[lang()]||MSG.en)[k]||MSG.en[k]||''; }

  /* prefill product of interest from ?product= (e.g. from finished page) */
  try{
    var pq=new URLSearchParams(location.search).get('product');
    if(pq){
      var msgEl=form.querySelector('[name="Message"]');
      if(msgEl && !msgEl.value){ msgEl.value=m('productPrefix')+pq+'\n\n'; }
      var typeEl=form.querySelector('[name="Inquiry Type"]');
      if(typeEl){ for(var i=0;i<typeEl.options.length;i++){ if(/product/i.test(typeEl.options[i].value)){ typeEl.selectedIndex=i; break; } } }
    }
  }catch(e){}

  function setStatus(type,msg){ statusEl.className='form-status form-status--'+type+' show'; statusEl.textContent=msg; }
  function configured(){ return KEY && KEY.indexOf('YOUR_')<0; }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    statusEl.className='form-status';
    if(consent && !consent.checked){ setStatus('error',m('consent')); consent.focus(); return; }
    if(!form.checkValidity()){ setStatus('error',m('required')); form.reportValidity&&form.reportValidity(); return; }
    var areas=form.querySelectorAll('input[name="Business Area"]:checked');
    if(areas.length===0){ setStatus('error',m('area')); return; }
    if(!configured()){ setStatus('error',m('notConnected')); return; }

    var data=new FormData(form);
    submitBtn.disabled=true; var orig=submitBtn.textContent; submitBtn.textContent=m('sending');
    setStatus('info',m('sendingStatus'));
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Accept':'application/json'},body:data})
      .then(function(r){return r.json();}).then(function(res){
        if(res.success){ form.reset(); setStatus('success',m('success')); }
        else{ setStatus('error',m('fail')); }
      }).catch(function(){ setStatus('error',m('network')); })
      .finally(function(){ submitBtn.disabled=false; submitBtn.textContent=orig; });
  });
})();
