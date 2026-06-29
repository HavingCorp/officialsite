// noid

function navigate(page) {
  var map = {ingredients:'ingredients.html',finished:'finished.html',fragrance:'fragrance.html',about:'about.html',team:'team.html',inquiry:'inquiry.html'};
  if (map[page]) window.location.href = map[page];
}
function goHome() { window.location.href = 'index.html'; }

// noid

window.addEventListener('DOMContentLoaded', function() {
  var hamburger = document.getElementById('hamburger');
  var drawer    = document.getElementById('mobileDrawer');
  window.closeDrawer = function() {
    if (!hamburger) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded','false');
    drawer.style.opacity = '0';
    drawer.style.pointerEvents = 'none';
    setTimeout(function(){ drawer.style.display='none'; }, 300);
    document.body.style.overflow = '';
  };
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && window.closeDrawer) window.closeDrawer(); });
  function checkMobile() {
    if (!hamburger) return;
    hamburger.style.display = window.innerWidth <= 900 ? 'flex' : 'none';
    if (window.innerWidth > 900) { drawer.style.display='none'; document.body.style.overflow=''; }
  }
  checkMobile();
  window.addEventListener('resize', checkMobile);
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      if (drawer.style.display === 'flex') { window.closeDrawer(); }
      else {
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded','true');
        drawer.style.display = 'flex';
        setTimeout(function(){ drawer.style.opacity='1'; drawer.style.pointerEvents='all'; }, 10);
        document.body.style.overflow = 'hidden';
      }
    });
  }
  // GNB mega-menu hover
  var closeTimer = null;
  document.querySelectorAll('.nav-item[data-menu]').forEach(function(item) {
    var menu = document.getElementById('menu-' + item.dataset.menu);
    if (!menu) return;
    function openMenu() { clearTimeout(closeTimer); document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); menu.classList.add('open'); document.getElementById('nav').classList.add('menu-open'); }
    function closeMenu() { closeTimer = setTimeout(function(){ document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); document.getElementById('nav').classList.remove('menu-open'); }, 150); }
    item.addEventListener('mouseenter', openMenu);
    item.addEventListener('mouseleave', closeMenu);
    menu.addEventListener('mouseenter', function(){ clearTimeout(closeTimer); });
    menu.addEventListener('mouseleave', closeMenu);
  });
  document.addEventListener('click', function(e){ if(!e.target.closest('nav')){ document.querySelectorAll('.mega-menu').forEach(function(m){ m.classList.remove('open'); }); var nav=document.getElementById('nav'); if(nav) nav.classList.remove('menu-open'); }});
  // scroll reveal
  var io = new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }}); }, {threshold:0.08});
  document.querySelectorAll('.rr').forEach(function(el){ io.observe(el); });
});

// having-hero-whiteout-js-v15

(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var heroes = Array.prototype.slice.call(document.querySelectorAll('.hero-stage .page-hero:not(.fp-page-hero)'));
  var ticking = false;
  function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }
  function setHeroProgress(){
    ticking = false;
    if(reduce) return;
    heroes.forEach(function(hero){
      var rect = hero.getBoundingClientRect();
      var h = Math.max(rect.height, window.innerHeight * 0.72);
      var p = clamp((-rect.top) / (h * 0.88), 0, 1);
      var textP = clamp(p * 1.08, 0, 1);
      var whiteP = clamp((p - 0.22) / 0.58, 0, 1);
      var easeWhite = whiteP * whiteP * (3 - 2 * whiteP);
      hero.style.setProperty('--hero-bg-y', (p * 24).toFixed(2) + 'px');
      hero.style.setProperty('--hero-bg-scale', (1 + p * 0.012).toFixed(4));
      hero.style.setProperty('--hero-bg-o', (1 - p * 0.08).toFixed(3));
      hero.style.setProperty('--hero-text-y', (-textP * 32).toFixed(2) + 'px');
      hero.style.setProperty('--hero-text-o', (1 - textP * 0.96).toFixed(3));
      hero.style.setProperty('--hero-dim-o', (0.56 - p * 0.18).toFixed(3));
      hero.style.setProperty('--hero-white-o', easeWhite.toFixed(3));
    });
  }
  function requestTick(){ if(!ticking){ ticking = true; requestAnimationFrame(setHeroProgress); } }
  window.addEventListener('scroll', requestTick, {passive:true});
  window.addEventListener('resize', requestTick);
  setHeroProgress();

  var sectionSelector = '.page-transition-content > .s, .page-transition-content > .sf, .page-transition-content > section, .page-transition-content > div, .dyn-reveal';
  var itemSelector = [
    '.split2 > *', '.app-grid > *', '.diff-list > *', '.team-grid > *', '.metrics > *',
    '.net-grid > *', '.tl-item', '.award-item', '.esg-grid > *', '.esg-detail-grid > *',
    '.inq-wrap > *', '.form-row > *', '.fg', '.cd-item', 'table tbody tr', '.ingredient-row',
    '.rr'
  ].join(',');

  var sections = Array.prototype.slice.call(document.querySelectorAll(sectionSelector));
  var items = Array.prototype.slice.call(document.querySelectorAll(itemSelector)).filter(function(el){
    return el.closest('.page-transition-content') && !sections.includes(el);
  });
  items.forEach(function(el, idx){
    el.classList.add('dyn-item');
    el.style.setProperty('--dyn-delay', Math.min((idx % 8) * 55, 330) + 'ms');
  });

  if(!('IntersectionObserver' in window) || reduce){
    sections.concat(items).forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }
  var sectionObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); sectionObserver.unobserve(entry.target); }
    });
  }, {threshold:0.05, rootMargin:'0px 0px -5% 0px'});
  sections.forEach(function(el){ sectionObserver.observe(el); });

  var itemObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){ entry.target.classList.add('is-visible'); itemObserver.unobserve(entry.target); }
    });
  }, {threshold:0.08, rootMargin:'0px 0px -4% 0px'});
  items.forEach(function(el){ itemObserver.observe(el); });
})();

// having-v131-clean-menu-state-js

(function(){
  function ready(fn){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function(){
    var nav = document.getElementById('nav');
    if(!nav) return;

    var closeTimer = null;

    function setScrollState(){
      document.body.classList.toggle('nav-scrolled', window.scrollY > 32);
    }

    function openMenu(menu){
      if(!menu) return;
      if(closeTimer){
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      document.querySelectorAll('.mega-menu').forEach(function(m){
        var active = m === menu;
        m.classList.toggle('open', active);
        m.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      nav.classList.add('menu-open');
    }

    function closeMenus(){
      if(closeTimer){
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      document.querySelectorAll('.mega-menu').forEach(function(m){
        m.classList.remove('open');
        m.setAttribute('aria-hidden','true');
      });
      nav.classList.remove('menu-open');
    }

    function scheduleClose(){
      if(closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(closeMenus, 180);
    }

    document.querySelectorAll('#nav [data-menu]').forEach(function(item){
      var menu = document.getElementById('menu-' + item.getAttribute('data-menu'));
      if(!menu) return;

      item.addEventListener('mouseenter', function(){ openMenu(menu); });
      item.addEventListener('focusin', function(){ openMenu(menu); });
      item.addEventListener('mouseleave', scheduleClose);

      var link = item.querySelector('a');
      if(link){
        link.addEventListener('click', function(e){
          e.preventDefault();
          openMenu(menu);
        });
      }

      menu.addEventListener('mouseenter', function(){
        if(closeTimer){
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        openMenu(menu);
      });
      menu.addEventListener('mouseleave', scheduleClose);
    });

    document.addEventListener('click', function(e){
      if(e.target.closest('#nav') || e.target.closest('.mega-menu')) return;
      closeMenus();
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeMenus();
    });

    setScrollState();
    window.addEventListener('scroll', setScrollState, { passive:true });
    window.addEventListener('resize', setScrollState);
  });
})();

// rb-lang-js

(function(){
 if(window.setLang)return;
 function gc(n){var m=document.cookie.match('(^|;)\\s*'+n+'\\s*=\\s*([^;]+)');return m?m.pop():'';}
 window.setLang=function(l){
   if(l!=='ko'&&l!=='en')l='en';
   try{document.cookie='havingLang='+l+';path=/;max-age=31536000';}catch(e){}
   document.documentElement.setAttribute('lang',l);
   document.documentElement.setAttribute('data-lang',l);
   var bs=document.querySelectorAll('.lang-btn'),i;
   for(i=0;i<bs.length;i++){bs[i].classList.toggle('is-active',bs[i].getAttribute('data-lang')===l);}
   document.dispatchEvent(new CustomEvent('havinglangchange',{detail:{lang:l}}));
 };
 function init(){var l=gc('havingLang')||document.documentElement.getAttribute('lang')||'en';window.setLang(l);}
 if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();

// ===== cookie-consent + Google Analytics gate =====
(function(){
  var GA_ID=(window.HAVING_CONFIG&&window.HAVING_CONFIG.gaMeasurementId)||''; // from config.js
  function gc(n){var m=document.cookie.match('(^|;)\\s*'+n+'\\s*=\\s*([^;]+)');return m?m.pop():'';}
  function setC(n,v){try{document.cookie=n+'='+v+';path=/;max-age=15552000;samesite=lax';}catch(e){}}
  function loadGA(){
    if(window.__gaLoaded||!GA_ID||GA_ID.indexOf('XXXX')>=0)return; // skip if placeholder
    window.__gaLoaded=true;
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments);};
    gtag('js',new Date());gtag('config',GA_ID,{anonymize_ip:true});
  }
  function removeBanner(){var b=document.getElementById('cookie-banner');if(b){b.classList.remove('show');setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b);},320);}}
  function accept(){setC('havingCookieConsent','granted');removeBanner();loadGA();}
  function decline(){setC('havingCookieConsent','denied');removeBanner();}
  window.havingCookieAccept=accept;window.havingCookieDecline=decline;
  function init(){
    var consent=gc('havingCookieConsent');
    if(consent==='granted'){loadGA();return;}
    if(consent==='denied'){return;}
    // no choice yet -> show banner
    var el=document.createElement('div');
    el.className='cookie-banner';el.id='cookie-banner';el.setAttribute('role','dialog');el.setAttribute('aria-label','Cookie consent');
    el.innerHTML='<div class="cookie-banner__text"><span data-i18n="cookie.text">We use essential cookies to run this site and, with your consent, analytics cookies to improve it.</span> <a href="privacy.html" data-i18n="footer.privacy">Privacy Policy</a></div>'+
      '<div class="cookie-banner__actions"><button type="button" class="cookie-btn cookie-btn--decline" data-i18n="cookie.decline" onclick="havingCookieDecline()">Decline</button><button type="button" class="cookie-btn cookie-btn--accept" data-i18n="cookie.accept" onclick="havingCookieAccept()">Accept</button></div>';
    document.body.appendChild(el);
    if(window.havingI18n)window.havingI18n();
    requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('show');});});
  }
  if(document.readyState!=='loading')init();else document.addEventListener('DOMContentLoaded',init);
})();

// ===== apply config values to [data-having] elements (lang-aware) =====
(function(){
  function applyConfig(){
    if(!window.HAVING_CONFIG)return;
    var c=window.HAVING_CONFIG;
    var l10n=(window.havingConfigL10n?window.havingConfigL10n():(c.i18n&&c.i18n.en)||{});
    var els=document.querySelectorAll('[data-having]');
    for(var i=0;i<els.length;i++){
      var k=els[i].getAttribute('data-having');
      if(k==='company'&&l10n.companyName)els[i].textContent=l10n.companyName;
      else if(k==='address'&&l10n.companyAddress)els[i].textContent=l10n.companyAddress;
      else if(k==='regno'&&c.businessRegNo)els[i].textContent=c.businessRegNo;
      else if(k==='email'&&c.contactEmail)els[i].textContent=c.contactEmail;
    }
  }
  window.havingApplyConfig=applyConfig;
  if(document.readyState!=='loading')applyConfig();else document.addEventListener('DOMContentLoaded',applyConfig);
  document.addEventListener('havinglangchange',applyConfig);
})();

// ===== i18n engine: load lang/<lang>.json and fill [data-i18n] =====
(function(){
  var cache={};var DEFAULT='en';
  function curLang(){return document.documentElement.getAttribute('lang')||DEFAULT;}
  function apply(dict){
    if(!dict)return;
    var els=document.querySelectorAll('[data-i18n]'),i;
    for(i=0;i<els.length;i++){var k=els[i].getAttribute('data-i18n');if(dict[k]!=null)els[i].textContent=dict[k];}
    var ph=document.querySelectorAll('[data-i18n-ph]');
    for(i=0;i<ph.length;i++){var k2=ph[i].getAttribute('data-i18n-ph');if(dict[k2]!=null)ph[i].setAttribute('placeholder',dict[k2]);}
    var hh=document.querySelectorAll('[data-i18n-html]');
    for(i=0;i<hh.length;i++){var k3=hh[i].getAttribute('data-i18n-html');if(dict[k3]!=null)hh[i].innerHTML=dict[k3];}
  }
  function reveal(){document.documentElement.classList.remove('i18n-pending');}
  function load(lang){
    if(cache[lang]){apply(cache[lang]);reveal();return;}
    fetch('lang/'+lang+'.json').then(function(r){return r.ok?r.json():null;}).then(function(d){if(d){cache[lang]=d;apply(d);}reveal();}).catch(function(){reveal();});
  }
  window.havingI18n=function(){load(curLang());};
  if(document.readyState!=='loading')window.havingI18n();else document.addEventListener('DOMContentLoaded',window.havingI18n);
  document.addEventListener('havinglangchange',window.havingI18n);
})();

/* ---- per-page hero background image (drop-in; clean fallback if file absent) ---- */
(function(){
  var MAP={
    'about.html':'assets/hero-about.jpg',
    'team.html':'assets/hero-leadership.jpg',
    'fragrance.html':'assets/hero-fragrance.jpg',
    'finished.html':'assets/hero-finished.jpg',
    'esg.html':'assets/hero-sustainability.jpg',
    'ingredients.html':'assets/hero-ingredients.jpg',
    'inquiry.html':'assets/hero-contact.jpg'
  };
  function run(){
    var page=location.pathname.split('/').pop()||'index.html';
    var src=MAP[page]; if(!src) return;
    var el=document.querySelector('.thin-page-title__inner'); if(!el) return;
    var LIGHT={'fragrance.html':1,'about.html':1,'team.html':1,'finished.html':1,'esg.html':1,'ingredients.html':1,'inquiry.html':1}; /* black text + white gradient */
    var light=LIGHT[page];
    var img=new Image();
    img.onload=function(){
      if(light){
        el.style.cssText+=';background-color:#f3ece4 !important;background-image:linear-gradient(to bottom right, rgba(255,255,255,.95) 0%, rgba(255,255,255,.60) 100%), url("'+src+'") !important;background-repeat:no-repeat, no-repeat !important;background-position:center, center !important;background-size:100% 100%, cover !important;background-origin:border-box, border-box !important;background-clip:border-box !important;';
      } else {
        el.style.cssText+=';background-image:linear-gradient(135deg,rgba(22,16,13,.62),rgba(22,16,13,.40)),url("'+src+'") !important;background-size:cover !important;background-position:center !important;background-color:#1a1410 !important;';
        document.body.classList.add('has-hero-img');
      }
    };
    img.src=src;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

// noid
/* Back-to-top button (global, all pages) */
(function(){
  function init(){
    if(document.querySelector('.to-top')) return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='to-top';
    btn.setAttribute('aria-label','Scroll to top');
    btn.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 5l-7 7m7-7l7 7m-7-7v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);
    var shown=false, threshold=400;
    function onScroll(){
      var y=window.pageYOffset||document.documentElement.scrollTop||0;
      var show=y>threshold;
      if(show!==shown){ shown=show; btn.classList.toggle('is-visible',show); }
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});
    onScroll();
    btn.addEventListener('click',function(){
      var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var start=window.pageYOffset||document.documentElement.scrollTop||0;
      if(reduce||start<=0){ window.scrollTo(0,0); return; }
      var dur=320, t0=null;
      function ease(p){ return 1-Math.pow(1-p,3); }
      function step(ts){ if(t0==null)t0=ts; var p=Math.min((ts-t0)/dur,1); window.scrollTo(0,Math.round(start*(1-ease(p)))); if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
