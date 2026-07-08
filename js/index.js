
window.addEventListener('DOMContentLoaded', function() {
  // hero animations
  setTimeout(function(){ var e=document.getElementById('htag'); if(e) e.classList.add('in'); }, 200);
  ['hw0','hw1','hw2'].forEach(function(id,i){ setTimeout(function(){ var e=document.getElementById(id); if(e) e.classList.add('in'); }, 380+i*160); });
  setTimeout(function(){ var e=document.getElementById('hdesc'); if(e) e.classList.add('in'); }, 860);
  setTimeout(function(){ var e=document.getElementById('sarrow'); if(e) e.classList.add('in'); }, 1000);
  // statement fade
  var stEl=document.getElementById('stText');
  if(stEl){
    var ioSt=new IntersectionObserver(function(entries){ if(!entries[0].isIntersecting) return; stEl.style.opacity='1'; stEl.style.transform='none'; var btn=document.getElementById('stBtn'); if(btn) setTimeout(function(){ btn.classList.add('in'); },400); ioSt.disconnect(); },{threshold:0.3});
    ioSt.observe(stEl);
  }
  // contact fill
  var fill1=document.getElementById('ctFill1');
  if(fill1){ var ioF=new IntersectionObserver(function(entries){ if(!entries[0].isIntersecting) return; setTimeout(function(){ fill1.classList.add('filled'); },100); ioF.disconnect(); },{threshold:0.4}); var ct=document.getElementById('contact'); if(ct) ioF.observe(ct); }
  // cards
  var cardsEl=document.getElementById('cards');
  var cardEls=document.querySelectorAll('.card');
  function isMobile(){ return window.innerWidth<=900; }
  cardEls.forEach(function(card){
    card.addEventListener('mouseenter',function(){ if(isMobile()) return; cardEls.forEach(function(c){ c.classList.remove('active'); }); card.classList.add('active'); cardsEl.classList.add('hovered'); });
  });
  if(cardsEl) cardsEl.addEventListener('mouseleave',function(){ if(isMobile()) return; cardEls.forEach(function(c){ c.classList.remove('active'); }); cardsEl.classList.remove('hovered'); });
  cardEls.forEach(function(card){
    card.addEventListener('click',function(e){ if(!isMobile()) return; if(!card.classList.contains('open')){ e.preventDefault(); cardEls.forEach(function(c){ c.classList.remove('open'); }); card.classList.add('open'); }});
  });
});


(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }
  ready(function(){
    var targets = Array.prototype.slice.call(document.querySelectorAll(
      '.page-transition-content > .s, .page-transition-content > .sf, .page-transition-content > section, .page-transition-content > div, .a-reveal'
    ));
    if(!targets.length) return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)){
      targets.forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(function(el, idx){
      if(idx === 0 && el.getBoundingClientRect().top < window.innerHeight * 0.92){
        el.classList.add('is-visible');
      } else {
        io.observe(el);
      }
    });
  });
})();

/* index hero: mouse parallax 3D tilt + scroll-cue ellipse morph */
(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  ready(function(){
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // 3D parallax tilt on the hero background
    var hero=document.querySelector('.hero');
    if(hero && !reduce){
      var raf=null;
      hero.addEventListener('mousemove',function(e){
        if(window.innerWidth<=900) return;
        var r=hero.getBoundingClientRect();
        var px=(e.clientX-r.left)/r.width-0.5;   // -0.5 .. 0.5
        var py=(e.clientY-r.top)/r.height-0.5;
        var MV=24, TL=2;                          // move px, tilt deg (subtle)
        var bx=(-px*MV).toFixed(1), by=(-py*MV).toFixed(1);   // bg shifts opposite (parallax)
        var ry=(px*TL*2).toFixed(2), rx=(-py*TL*1.3).toFixed(2);
        if(raf) cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){
          hero.style.setProperty('--hero-bx',bx+'px');
          hero.style.setProperty('--hero-by',by+'px');
          hero.style.setProperty('--hero-ry',ry+'deg');
          hero.style.setProperty('--hero-rx',rx+'deg');
        });
      });
      hero.addEventListener('mouseleave',function(){
        hero.style.setProperty('--hero-bx','0px');
        hero.style.setProperty('--hero-by','0px');
        hero.style.setProperty('--hero-ry','0deg');
        hero.style.setProperty('--hero-rx','0deg');
      });
    }
    // scroll cue: morph to ellipse when scrolled down, back to circle at top
    var arw=document.getElementById('sarrow');
    if(arw){
      var onScroll=function(){
        if(window.scrollY>4) arw.classList.add('morph');
        else arw.classList.remove('morph');
      };
      window.addEventListener('scroll',onScroll,{passive:true});
      onScroll();
    }
  });
})();
