document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.page-header');
  const backToTop = document.querySelector('.js-back-to-top');
  const downArrow = document.querySelector('.js-cover-down-arrow');

  // Шапка
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('-visible');
      header.classList.add('-scrolled');
    } else {
      header.classList.add('-visible');
      header.classList.remove('-scrolled');
      if (window.scrollY < 10) header.classList.remove('-visible');
    }
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader);

  // Кнопка наверх
  if (backToTop) {
    function updateBackToTop() {
      if (window.scrollY > 400) {
        backToTop.style.opacity = '1';
        backToTop.style.pointerEvents = 'auto';
      } else {
        backToTop.style.opacity = '0';
        backToTop.style.pointerEvents = 'none';
      }
    }
    updateBackToTop();
    window.addEventListener('scroll', updateBackToTop);
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Стрелка вниз
  if (downArrow) {
    downArrow.addEventListener('click', function() {
      const firstSection = document.querySelector('.sections-container');
      if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Слайдер обложки
  function initCoverSlider() {
    const coverSlider = document.querySelector('.cover-slider');
    if (!coverSlider) return;
    const slides = coverSlider.querySelectorAll('.cover-slide');
    if (slides.length <= 1) return;
    let currentIndex = 0;
    const delay = parseInt(coverSlider.dataset.delay) || 5000;
    function showSlide(index) {
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    }
    function nextSlide() {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }
    showSlide(0);
    setInterval(nextSlide, delay);
  }
  initCoverSlider();

  // Основной слайдер
  function initMainSlider() {
    const sliderContainer = document.querySelector('.slider-section.slider');
    if (!sliderContainer) return;
    const slidesContainer = sliderContainer.querySelector('.slides');
    const slides = sliderContainer.querySelectorAll('.slide');
    const prevBtn = sliderContainer.querySelector('.js-prev');
    const nextBtn = sliderContainer.querySelector('.js-next');
    const currentSpan = sliderContainer.querySelector('.js-slider-current-slide');
    const totalSpan = sliderContainer.querySelector('.js-slider-total-slides');
    if (!slides.length) return;
    let index = 0;
    const total = slides.length;
    if (totalSpan) totalSpan.textContent = total;
    if (currentSpan) currentSpan.textContent = index + 1;
    function updateSlider() {
      if (slidesContainer) slidesContainer.style.transform = `translateX(-${index * 100}%)`;
      if (currentSpan) currentSpan.textContent = index + 1;
    }
    function nextSlide() { index = (index + 1) % total; updateSlider(); }
    function prevSlide() { index = (index - 1 + total) % total; updateSlider(); }
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    const delay = parseInt(sliderContainer.dataset.delay);
    if (delay && delay > 0) {
      let autoplayInterval = setInterval(nextSlide, delay);
      sliderContainer.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
      sliderContainer.addEventListener('mouseleave', () => { autoplayInterval = setInterval(nextSlide, delay); });
    }
    updateSlider();
  }
  initMainSlider();

  // Поделиться
  const shareBtn = document.querySelector('.js-share-trigger');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Портретный фотограф KARKT',
          text: 'Посмотрите мои работы!',
          url: window.location.href,
        }).catch(() => {});
      } else {
        const dummy = document.createElement('textarea');
        dummy.value = window.location.href;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('Ссылка скопирована!');
      }
    });
  }

  // Анимация секций
  const sections = document.querySelectorAll('.sections-container');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('-visible'); });
  }, { threshold: 0.1 });
  sections.forEach(section => observer.observe(section));
});


  // ---------- МОДАЛЬНОЕ ОКНО С КОНТАКТАМИ ----------
  const chatBtn = document.querySelector('.js-contact-chat');
  const modal = document.querySelector('.js-contact-modal');
  const closeBtns = document.querySelectorAll('.js-modal-close');

  function openModal() {
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  if (chatBtn) {
    chatBtn.addEventListener('click', openModal);
  }

  if (closeBtns.length) {
    closeBtns.forEach(btn => {
      btn.addEventListener('click', closeModal);
    });
  }

  // Закрытие по Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });