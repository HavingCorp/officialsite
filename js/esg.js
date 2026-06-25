
function navigate(page) {
  var map = {ingredients:'ingredients.html',finished:'finished.html',fragrance:'fragrance.html',about:'about.html',team:'team.html',inquiry:'inquiry.html',esg:'esg.html'};
  if (map[page]) window.location.href = map[page];
}
function goHome() { window.location.href = 'index.html'; }


window.addEventListener('DOMContentLoaded', function() {
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('mobileDrawer');
  window.closeDrawer = function() {
    if (!hamburger) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    drawer.style.opacity = '0'; drawer.style.pointerEvents = 'none';
    setTimeout(function(){ drawer.style.display='none'; }, 300);
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && window.closeDrawer) window.closeDrawer(); });
  function checkMobile() {
    if (!hamburger) return;
    hamburger.style.display = window.innerWidth <= 900 ? 'flex' : 'none';
    if (window.innerWidth > 900) { drawer.style.display='none'; document.body.style.overflow=''; }
  }
  checkMobile(); window.addEventListener('resize', checkMobile);
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (drawer.style.display === 'flex') { window.closeDrawer(); }
      else { hamburger.classList.add('open'); hamburger.setAttribute('aria-expanded','true'); drawer.style.display = 'flex'; setTimeout(function(){ drawer.style.opacity='1'; drawer.style.pointerEvents='all'; }, 10); document.body.style.overflow = 'hidden'; }
    });
  }
  var closeTimer = null;
  document.querySelectorAll('.nav-item[data-menu]').forEach(function(item) {
    var menu = document.getElementById('menu-' + item.dataset.menu);
    if (!menu) return;
    function openMenu() { clearTimeout(closeTimer); document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); menu.classList.add('open'); document.getElementById('nav').classList.add('menu-open'); }
    function closeMenu() { closeTimer = setTimeout(function(){ document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); document.getElementById('nav').classList.remove('menu-open'); }, 150); }
    item.addEventListener('mouseenter', openMenu); item.addEventListener('mouseleave', closeMenu);
    menu.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); }); menu.addEventListener('mouseleave', closeMenu);
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('nav')){ document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); var nav=document.getElementById('nav'); if(nav) nav.classList.remove('menu-open'); }});
  var io = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }}); }, {threshold:0.08});
  document.querySelectorAll('.rr').forEach(function(el){ io.observe(el); });
});


(function(){
  var section=document.getElementById('esg-flight');
  if(!section) return;

  var cards=[
    {el:document.getElementById('flight-card-e'), start:.16},
    {el:document.getElementById('flight-card-s'), start:.38},
    {el:document.getElementById('flight-card-g'), start:.62}
  ];

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

  function update(){
    var rect=section.getBoundingClientRect();
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var total=Math.max(1, rect.height-vh);
    var p=clamp((-rect.top)/total,0,1);

    cards.forEach(function(c){
      if(!c.el) return;
      var shown=ease(clamp((p-c.start)/.12,0,1));
      c.el.style.setProperty('--card-o', shown);
      c.el.style.setProperty('--card-y', (22-(shown*22))+'px');
    });
  }

  var ticking=false;
  function tick(){ if(!ticking){ ticking=true; requestAnimationFrame(function(){ticking=false; update();}); } }
  window.addEventListener('scroll', tick, {passive:true});
  window.addEventListener('resize', tick);
  update();
})();
