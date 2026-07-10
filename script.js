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
  function openNav(){ mobileNav.classList.add('is-open'); toggle.setAttribute('aria-expanded','true'); }
  function closeNav(){ mobileNav.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false'); }
  toggle.addEventListener('click', openNav);
  closeBtn.addEventListener('click', closeNav);
  mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });

  // Hero slider
  var slides = document.querySelectorAll('.hero-slide');
  var frameCounter = document.getElementById('frameCurrent');
  var current = 0;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reducedMotion && slides.length > 1){
    setInterval(function(){
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      frameCounter.textContent = String(current + 1).padStart(2,'0');
    }, 5000);
  }

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
    lightboxClose.focus();
  }
  function closeLightbox(){
    lightbox.classList.remove('is-open');
    if(lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('.frame-hit').forEach(function(btn){
    btn.addEventListener('click', function(){ openLightbox(parseInt(btn.dataset.index,10)); });
  });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', function(){ showFrame(activeIndex - 1); });
  lightboxNext.addEventListener('click', function(){ showFrame(activeIndex + 1); });
  lightbox.addEventListener('click', function(e){ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('is-open')) return;
    if(e.key === 'Escape') closeLightbox();
    if(e.key === 'ArrowLeft') showFrame(activeIndex - 1);
    if(e.key === 'ArrowRight') showFrame(activeIndex + 1);
  });

  // Floating button -> contact
  document.getElementById('fabContact').addEventListener('click', function(){
    document.getElementById('contact').scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
  });
})();