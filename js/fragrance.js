/* Fragrance — editorial scroll reveal (blur + rise), staggered cards */
(function(){
  function init(){
    if(!('IntersectionObserver' in window)) return;
    var sel='.rb-craft-visual,.rb-band-visual,.rb-card,.rb-quote,.rb-head,.rb-feature__body,.rb-defs,.rb-split__head,.rb-prose';
    var els=[].slice.call(document.querySelectorAll(sel));
    els.forEach(function(el){ el.classList.add('reveal'); });
    [].slice.call(document.querySelectorAll('.rb-grid')).forEach(function(g){
      [].slice.call(g.querySelectorAll('.rb-card')).forEach(function(c,i){ c.style.setProperty('--d',(i*0.09)+'s'); });
    });
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
