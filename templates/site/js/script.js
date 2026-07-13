(function(){
  // Загрузка данных с API
  async function loadSiteData() {
    try {
      // Загружаем конфиг
      const configRes = await fetch('/api/config');
      const config = await configRes.json();

      // Обновляем мета-теги
      document.title = config.title || document.title;
      document.getElementById('siteDescription').content = config.description || '';
      document.getElementById('ogTitle').content = config.title || '';
      document.getElementById('ogDescription').content = config.description || '';

      // Hero
      document.getElementById('heroHeading').innerHTML = config.hero_heading || '';
      document.getElementById('heroSub').textContent = config.hero_sub || '';

      // About
      document.getElementById('aboutTitle').textContent = config.about_title || '';
      const aboutText = document.getElementById('aboutText');
      if (config.about_text) {
        aboutText.innerHTML = config.about_text.replace(/\n/g, '</p><p>');
      }

      // Quote
      document.getElementById('quoteText').textContent = config.quote_text || '';

      // Contacts
      if (config.contact_phone) {
        const phone = config.contact_phone.replace(/\s/g, '');
        document.getElementById('contactPhone').href = `tel:${phone}`;
        document.getElementById('contactPhone').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg> ${config.contact_phone}`;
        document.getElementById('footerPhone').innerHTML = `<span class="left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"/></svg>${config.contact_phone}</span>`;
      }
      if (config.contact_email) {
        document.getElementById('contactEmail').href = `mailto:${config.contact_email}`;
        document.getElementById('contactEmail').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg> ${config.contact_email}`;
        document.getElementById('footerEmail').innerHTML = `<span class="left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>${config.contact_email}</span>`;
      }

      // Social links
      if (config.social_vk) {
        document.querySelectorAll('#headerSocial a:first-child, #mobileNavSocial a:first-child, #contactSocial a:first-child, #footerVk').forEach(el => {
          el.href = config.social_vk;
        });
      }
      if (config.social_telegram) {
        document.querySelectorAll('#headerSocial a:nth-child(2), #mobileNavSocial a:nth-child(2), #contactSocial a:nth-child(2), #footerTelegram').forEach(el => {
          el.href = config.social_telegram;
        });
      }
      if (config.social_instagram) {
        document.querySelectorAll('#headerSocial a:nth-child(3), #mobileNavSocial a:nth-child(3), #contactSocial a:nth-child(3), #footerInstagram').forEach(el => {
          el.href = config.social_instagram;
        });
      }

      // Custom CSS
      if (config.custom_css) {
        document.getElementById('customCSS').textContent = config.custom_css;
      }

      // Custom HTML head
      if (config.custom_html_head) {
        document.getElementById('customHtmlHead').innerHTML = config.custom_html_head;
      }

    } catch (e) {
      console.warn('Ошибка загрузки конфига:', e);
    }
  }

  // Загрузка герой-слайдов
  async function loadHeroSlides() {
    try {
      const res = await fetch('/api/photos?photo_type=hero');
      const photos = await res.json();

      const slidesContainer = document.getElementById('heroSlides');
      const total = document.getElementById('frameTotal');

      if (photos.length === 0) {
        // Если нет фото в бд, используем дефолтные
        return;
      }

      slidesContainer.innerHTML = '';
      photos.forEach((photo, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide${index === 0 ? ' is-active' : ''}`;
        slide.style.backgroundImage = `url('/${photo.filename}')`;
        slidesContainer.appendChild(slide);
      });

      total.textContent = String(photos.length).padStart(2, '0');

      // Обновляем слайдер
      initHeroSlider(photos.length);

    } catch (e) {
      console.warn('Ошибка загрузки герой-слайдов:', e);
    }
  }

  // Инициализация слайдера
  function initHeroSlider(total) {
    const slides = document.querySelectorAll('.hero-slide');
    const frameCounter = document.getElementById('frameCurrent');
    let current = 0;
    let heroTimer = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function advanceSlide() {
      if (slides.length === 0) return;
      slides[current].classList.remove('is-active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('is-active');
      frameCounter.textContent = String(current + 1).padStart(2, '0');
    }

    function startHero() {
      if (reducedMotion || slides.length < 2) return;
      if (heroTimer) stopHero();
      heroTimer = setInterval(advanceSlide, 5000);
    }

    function stopHero() {
      clearInterval(heroTimer);
      heroTimer = null;
    }

    startHero();

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) { stopHero(); }
      else { startHero(); }
    });
  }

  // Загрузка галереи
  async function loadGallery() {
    try {
      const res = await fetch('/api/photos?photo_type=gallery');
      const photos = await res.json();

      const gallery = document.getElementById('gallery');
      const count = document.getElementById('galleryCount');

      if (photos.length === 0) {
        gallery.innerHTML = '<p style="grid-column:1/-1;color:var(--ink-dim);text-align:center;padding:40px;">Пока нет фото. Добавьте их через админ-панель.</p>';
        count.textContent = '0 кадров';
        return;
      }

      count.textContent = `${photos.length} кадров · плёнка KARKT`;

      gallery.innerHTML = '';
      photos.forEach((photo, index) => {
        const frame = document.createElement('div');
        frame.className = 'frame';
        frame.innerHTML = `
          <img src="/${photo.filename}" alt="${photo.title || 'Кадр KARKT'}" loading="lazy">
          <span class="frame-tag mono">KARKT · ${String(index + 1).padStart(3, '0')}</span>
          <button class="frame-hit" aria-label="Открыть кадр ${index + 1} в полном размере" data-index="${index}" data-src="/${photo.filename}"></button>
        `;
        gallery.appendChild(frame);
      });

      // Инициализируем лайтбокс
      initLightbox(photos);

    } catch (e) {
      console.warn('Ошибка загрузки галереи:', e);
    }
  }

  // Лайтбокс
  function initLightbox(photos) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTag = document.getElementById('lightboxTag');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    let activeIndex = 0;
    let lastFocused = null;

    function showFrame(i) {
      activeIndex = (i + photos.length) % photos.length;
      lightboxImg.src = '/' + photos[activeIndex].filename;
      lightboxImg.alt = photos[activeIndex].title || 'Кадр KARKT';
      lightboxTag.textContent = 'KARKT · ' + String(activeIndex + 1).padStart(3, '0');
    }

    function openLightbox(i) {
      lastFocused = document.activeElement;
      showFrame(i);
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.frame-hit').forEach((btn, idx) => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        openLightbox(parseInt(this.dataset.index, 10));
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function() { showFrame(activeIndex - 1); });
    lightboxNext.addEventListener('click', function() { showFrame(activeIndex + 1); });
    lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });

    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showFrame(activeIndex - 1);
      if (e.key === 'ArrowRight') showFrame(activeIndex + 1);
    });

    // Свайп для мобильных
    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, {passive: true});

    lightbox.addEventListener('touchend', function(e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showFrame(activeIndex + 1);
        else showFrame(activeIndex - 1);
      }
    }, {passive: true});
  }

  // Mobile nav (сохранен из оригинального скрипта)
  function initMobileNav() {
    const header = document.getElementById('siteHeader');
    const onScroll = function() {
      if (window.scrollY > 40) { header.classList.add('is-scrolled'); }
      else { header.classList.remove('is-scrolled'); }
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const closeBtn = document.getElementById('mobileNavClose');
    const navFocusable = mobileNav.querySelectorAll('a, button');

    function lockScroll() { document.body.style.overflow = 'hidden'; }
    function unlockScroll() {
      if (!document.getElementById('lightbox').classList.contains('is-open')) {
        document.body.style.overflow = '';
      }
    }

    function openNav() {
      mobileNav.classList.add('is-open');
      mobileNav.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      lockScroll();
      closeBtn.focus();
    }

    function closeNav() {
      mobileNav.classList.remove('is-open');
      mobileNav.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      unlockScroll();
      toggle.focus();
    }

    toggle.addEventListener('click', openNav);
    closeBtn.addEventListener('click', closeNav);
    mobileNav.querySelectorAll('a').forEach(function(a) { a.addEventListener('click', closeNav); });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) closeNav();
      if (e.key === 'Tab' && mobileNav.classList.contains('is-open') && navFocusable.length) {
        const first = navFocusable[0];
        const last = navFocusable[navFocusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Scroll reveal
  function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function(el) { io.observe(el); });
    } else {
      revealEls.forEach(function(el) { el.classList.add('is-visible'); });
    }
  }

  // Floating button
  function initFab() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('fabContact').addEventListener('click', function() {
      document.getElementById('contact').scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    });
  }

  // Инициализация
  async function init() {
    await loadSiteData();
    await loadHeroSlides();
    await loadGallery();
    initMobileNav();
    initReveal();
    initFab();
  }

  // Запускаем, когда DOM готов
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();