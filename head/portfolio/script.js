(function() {
    "use strict";
    
    // ------------------------------
    //  PORTFOLIO DATA
    // ------------------------------
    const portfolioData = {
        name: "KARKT",
        role: "Портретный фотограф & Фотожурналист",
        bio: "Создаю образы, которые рассказывают истории. Моя работа — найти свет в каждом моменте и сохранить эмоцию навсегда. Индивидуальный подход, естественность и внимание к деталям.",
        
        // Images for gallery (optimized for lazy loading)
        galleryImages: [
            { src: "https://images.pexels.com/photos/1252991/pexels-photo-1252991.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Портрет в городе", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/2422293/pexels-photo-2422293.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Эмоциональный портрет", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/2102286/pexels-photo-2102286.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Черно-белая съемка", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Уличная фотография", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/2253877/pexels-photo-2253877.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Студийный портрет", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Арт-портрет", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/1096694/pexels-photo-1096694.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Настроение", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/1022927/pexels-photo-1022927.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Деталь", width: 800, height: 1000 },
            { src: "https://images.pexels.com/photos/1351235/pexels-photo-1351235.jpeg?auto=compress&cs=tinysrgb&w=800", alt: "Взгляд", width: 800, height: 1000 }
        ],
        
        socialLinks: {
            instagram: "https://instagram.com",
            telegram: "https://t.me",
            vk: "https://vk.com"
        },
        
        contactEmail: "karkt@photo.pro"
    };
    
    // ------------------------------
    //  DOM ELEMENTS
    // ------------------------------
    const appRoot = document.getElementById('app-root');
    
    // Helper: render full HTML structure
    function renderApp() {
        appRoot.innerHTML = `
            <!-- Header -->
            <header class="header" id="mainHeader">
                <div class="nav">
                    <div class="logo">${portfolioData.name}</div>
                    <button class="menu-toggle" id="menuToggle" aria-label="Меню">☰</button>
                    <div class="nav-links" id="navLinks">
                        <button class="close-menu" id="closeMenu" aria-label="Закрыть">✕</button>
                        <a href="#hero">Главная</a>
                        <a href="#gallery">Работы</a>
                        <a href="#about">Обо мне</a>
                        <a href="#contact">Контакты</a>
                    </div>
                </div>
            </header>
            
            <!-- Hero Section -->
            <section id="hero" class="hero">
                <div class="hero-content fade-up">
                    <h1>${portfolioData.name}</h1>
                    <p>${portfolioData.role}</p>
                    <button class="btn" id="exploreBtn">Смотреть портфолио</button>
                </div>
            </section>
            
            <!-- Gallery Section -->
            <section id="gallery" class="gallery section">
                <div class="container">
                    <h2 class="fade-up" style="text-align: center; margin-bottom: 3rem;">Портфолио</h2>
                    <div class="gallery-grid" id="galleryGrid"></div>
                </div>
            </section>
            
            <!-- About Section -->
            <section id="about" class="about section">
                <div class="container about-grid">
                    <div class="about-text fade-up">
                        <h2>Обо мне</h2>
                        <p>${portfolioData.bio}</p>
                        <p>Фотография для меня — это не просто кадр, это застывшая эмоция, история без слов. Я работаю в жанре портретной и репортажной съемки, уделяя внимание естественному свету и искренности момента.</p>
                        <p>Буду рад помочь воплотить ваши идеи в жизнь. Свяжитесь со мной для обсуждения проектов.</p>
                    </div>
                    <div class="about-image fade-up">
                        <img src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Фотограф за работой" loading="lazy">
                    </div>
                </div>
            </section>
            
            <!-- Contact Section -->
            <section id="contact" class="contact">
                <div class="container">
                    <h2 class="fade-up">Свяжитесь со мной</h2>
                    <div class="social-links fade-up">
                        <a href="${portfolioData.socialLinks.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="${portfolioData.socialLinks.telegram}" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                            <i class="fab fa-telegram"></i>
                        </a>
                        <a href="${portfolioData.socialLinks.vk}" target="_blank" rel="noopener noreferrer" aria-label="VK">
                            <i class="fab fa-vk"></i>
                        </a>
                        <a href="${portfolioData.socialLinks.behance}" target="_blank" rel="noopener noreferrer" aria-label="Behance">
                            <i class="fab fa-behance"></i>
                        </a>
                    </div>
                    <p class="fade-up">Email: <a href="mailto:${portfolioData.contactEmail}">${portfolioData.contactEmail}</a></p>
                </div>
            </section>
            
            <footer class="footer">
                <p>&copy; ${new Date().getFullYear()} ${portfolioData.name}. Все права защищены.</p>
            </footer>
        `;
        
        // Render gallery images after grid element exists
        renderGallery();
        
        // Attach event listeners
        attachEventListeners();
        
        // Initialize lazy loading
        if (window.lazySizes) {
            window.lazySizes.init();
        } else {
            // fallback: add class to images
            document.querySelectorAll('.gallery-item img').forEach(img => {
                img.classList.add('lazyload');
            });
        }
    }
    
    function renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;
        
        let html = '';
        portfolioData.galleryImages.forEach((img, idx) => {
            html += `
                <div class="gallery-item" data-index="${idx}">
                    <img class="lazyload" data-src="${img.src}" alt="${img.alt}" width="${img.width}" height="${img.height}">
                    <div class="gallery-overlay">
                        <span>🔍</span>
                    </div>
                </div>
            `;
        });
        galleryGrid.innerHTML = html;
        
        // Add click event for lightbox (simple preview, can be replaced with PhotoSwipe)
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const img = item.querySelector('img');
                if (img && img.dataset.src) {
                    openLightbox(img.dataset.src, img.alt);
                } else if (img && img.src) {
                    openLightbox(img.src, img.alt);
                }
            });
        });
    }
    
    // Simple lightbox fallback (no external dependencies)
    function openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.style.position = 'fixed';
        lightbox.style.top = '0';
        lightbox.style.left = '0';
        lightbox.style.width = '100%';
        lightbox.style.height = '100%';
        lightbox.style.backgroundColor = 'rgba(0,0,0,0.9)';
        lightbox.style.display = 'flex';
        lightbox.style.alignItems = 'center';
        lightbox.style.justifyContent = 'center';
        lightbox.style.zIndex = '3000';
        lightbox.style.cursor = 'pointer';
        
        const imgElement = document.createElement('img');
        imgElement.src = src;
        imgElement.alt = alt;
        imgElement.style.maxWidth = '90%';
        imgElement.style.maxHeight = '90%';
        imgElement.style.objectFit = 'contain';
        
        lightbox.appendChild(imgElement);
        lightbox.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        document.body.appendChild(lightbox);
    }
    
    function attachEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const closeMenu = document.getElementById('closeMenu');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.add('active');
            });
        }
        
        if (closeMenu && navLinks) {
            closeMenu.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        }
        
        // Close menu when a link is clicked
        if (navLinks) {
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                });
            });
        }
        
        // Header scroll effect
        const header = document.getElementById('mainHeader');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Explore button scroll to gallery
        const exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                const gallerySection = document.getElementById('gallery');
                if (gallerySection) gallerySection.scrollIntoView({ behavior: 'smooth' });
            });
        }
        
        // Fade-up animation on scroll (simple)
        const fadeElements = document.querySelectorAll('.fade-up');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }
    
    // Inject Font Awesome 6 (CDN fallback)
    function loadFontAwesome() {
        const link1 = document.createElement('link');
        link1.rel = 'stylesheet';
        link1.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
        document.head.appendChild(link1);
    }
    
    // Load external lazysizes if needed (lightweight lazy loading)
    function loadLazySizes() {
        if (!window.lazySizes) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }
    
    // Initialize app after DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        renderApp();
        loadFontAwesome();
        loadLazySizes();
    });
    
    // Handle dynamic re-renders if needed (simple)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {});
    } else {
        // already loaded
    }
})();