(function(){
  // Header scroll state
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if(window.scrollY > 40){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Mobile nav
  var toggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  var closeBtn = document.getElementById('mobileNavClose');
  var navFocusable = mobileNav.querySelectorAll('a, button');

  function lockScroll(){ document.body.style.overflow = 'hidden'; }
  function unlockScroll(){
    if(!lightbox.classList.contains('is-open')){ document.body.style.overflow = ''; }
  }
  function openNav(){
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
    lockScroll();
    closeBtn.focus();
  }
  function closeNav(){
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
    unlockScroll();
    toggle.focus();
  }
  toggle.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeNav();
    // простой focus trap внутри открытого мобильного меню
    if(e.key === 'Tab' && mobileNav.classList.contains('is-open') && navFocusable.length){
      var first = navFocusable[0];
      var last = navFocusable[navFocusable.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  // Hero slider
  var slides = document.querySelectorAll('.hero-slide');
  var frameCounter = document.getElementById('frameCurrent');
  var current = 0;
  var heroTimer = null;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function advanceSlide(){
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
    frameCounter.textContent = String(current + 1).padStart(2,'0');
  }
  function startHero(){
    if(reducedMotion || slides.length < 2 || heroTimer) return;
    heroTimer = setInterval(advanceSlide, 5000);
  }
  function stopHero(){
    clearInterval(heroTimer);
    heroTimer = null;
  }
  startHero();
  // экономим батарею и трафик, когда вкладка свёрнута (актуально на мобильных)
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){ stopHero(); } else { startHero(); }
  });

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, {threshold:.15});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Lightbox
  var galleryImgs = Array.from(document.querySelectorAll('#gallery .frame img'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxTag = document.getElementById('lightboxTag');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var activeIndex = 0;
  var lastFocused = null;

  function showFrame(i){
    activeIndex = (i + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[activeIndex].src;
    lightboxImg.alt = galleryImgs[activeIndex].alt;
    lightboxTag.textContent = 'KARKT · ' + String(activeIndex + 1).padStart(3,'0');
  }
  function openLightbox(i){
    lastFocused = document.activeElement;
    showFrame(i);
    lightbox.classList.add('is-open');
    lockScroll();
    lightboxClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    unlockScroll();
    if(lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('.frame-hit').forEach(function(btn){
    btn.addEventListener('click', function(){ openLightbox(parseInt(btn.dataset.index,10)); });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function(){ showFrame(activeIndex - 1); });
  lightboxNext.addEventListener('click', function(){ showFrame(activeIndex + 1); });
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
  var lightboxFocusable = [lightboxPrev, lightboxNext, lightboxClose];
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') showFrame(activeIndex - 1);
    if(e.key === 'ArrowRight') showFrame(activeIndex + 1);
    if(e.key === 'Tab'){
      var first = lightboxFocusable[0];
      var last = lightboxFocusable[lightboxFocusable.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });

  // Свайп для лайтбокса (мобильные)
  var touchStartX = 0;
  var touchStartY = 0;
  lightbox.addEventListener('touchstart', function(e){
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, {passive:true});
  lightbox.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if(Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)){
      if(dx < 0) showFrame(activeIndex + 1);
      else showFrame(activeIndex - 1);
    }
  }, {passive:true});

  // Floating button -> contact
  document.getElementById('fabContact').addEventListener('click', function(){
    document.getElementById('contact').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
  });
})();
