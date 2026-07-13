document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const adminContent = document.getElementById('adminContent');
    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    let isAuthenticated = false;
    let currentPassword = '';
    
    // Авторизация
    async function login(password) {
        const formData = new FormData();
        formData.append('password', password);
        
        try {
            const response = await fetch('/admin/auth', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                isAuthenticated = true;
                currentPassword = password;
                loginForm.style.display = 'none';
                adminContent.style.display = 'block';
                loadAllData();
            } else {
                loginError.textContent = 'Неверный пароль';
            }
        } catch (e) {
            loginError.textContent = 'Ошибка соединения';
        }
    }

    loginBtn.addEventListener('click', () => login(passwordInput.value));
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') login(passwordInput.value);
    });

    // Выход
    logoutBtn.addEventListener('click', () => {
        isAuthenticated = false;
        loginForm.style.display = 'block';
        adminContent.style.display = 'none';
        passwordInput.value = '';
        loginError.textContent = '';
    });

    // Навигация по вкладкам
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
            const tabId = document.getElementById('tab-' + this.dataset.tab);
            if (tabId) tabId.style.display = 'block';
        });
    });

    // Загрузка данных
    async function loadAllData() {
        await loadGallery();
        await loadBlocks();
        await loadConfig();
    }

    // Загрузка галереи
    async function loadGallery() {
        try {
            const response = await fetch(`/admin/photos?password=${encodeURIComponent(currentPassword)}`);
            const photos = await response.json();

            const grid = document.getElementById('galleryGrid');
            grid.innerHTML = '';

            photos.forEach(photo => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    <img src="/${photo.filename}" alt="${photo.title || 'Фото'}">
                    <div class="gallery-item-info">
                        <strong>${photo.title || 'Без названия'}</strong>
                        <span>${photo.type}</span>
                    </div>
                    <div class="gallery-item-actions">
                        <button onclick="editPhoto(${photo.id})">✏️</button>
                        <button class="delete" onclick="deletePhoto(${photo.id})">🗑️</button>
                    </div>
                `;
                grid.appendChild(item);
            });
        } catch (e) {
            console.error('Ошибка загрузки галереи:', e);
        }
    }

    // Загрузка блоков
    async function loadBlocks() {
        try {
            const response = await fetch(`/admin/blocks?password=${encodeURIComponent(currentPassword)}`);
            const blocks = await response.json();

            const list = document.getElementById('blocksList');
            list.innerHTML = '';

            blocks.forEach(block => {
                const item = document.createElement('div');
                item.className = 'block-item';
                item.innerHTML = `
                    <div class="block-info">
                        <strong>${block.type}</strong>
                        <span>@ ${block.position}</span>
                        ${block.content ? `<p style="margin-top:4px;font-size:12px;color:#a99d87;">${block.content.substring(0, 100)}</p>` : ''}
                    </div>
                    <div class="block-item-actions">
                        <button onclick="editBlock(${block.id})">✏️</button>
                        <button class="delete" onclick="deleteBlock(${block.id})">🗑️</button>
                    </div>
                `;
                list.appendChild(item);
            });
        } catch (e) {
            console.error('Ошибка загрузки блоков:', e);
        }
    }

    // Загрузка конфига
    async function loadConfig() {
        try {
            const response = await fetch(`/admin/config?password=${encodeURIComponent(currentPassword)}`);
            const config = await response.json();

            document.getElementById('configTitle').value = config.title || '';
            document.getElementById('configDescription').value = config.description || '';
            document.getElementById('configHeroHeading').value = config.hero_heading || '';
            document.getElementById('configHeroSub').value = config.hero_sub || '';
            document.getElementById('configEmail').value = config.contact_email || '';
            document.getElementById('configPhone').value = config.contact_phone || '';
            document.getElementById('configCss').value = config.custom_css || '';
        } catch (e) {
            console.error('Ошибка загрузки конфига:', e);
        }
    }

    // Загрузка фото
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('password', currentPassword);
        formData.append('photo', document.getElementById('photoFile').files[0]);
        formData.append('photo_type', document.getElementById('photoType').value);
        formData.append('title', document.getElementById('photoTitle').value);
        formData.append('description', document.getElementById('photoDescription').value);

        try {
            const response = await fetch('/admin/photos', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                await loadGallery();
                document.getElementById('uploadForm').reset();
            }
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
    });

    // Добавление блока
    document.getElementById('blockForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('password', currentPassword);
        formData.append('block_type', document.getElementById('blockType').value);
        formData.append('position', document.getElementById('blockPosition').value);
        formData.append('content', document.getElementById('blockContent').value);

        try {
            const response = await fetch('/admin/blocks', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                await loadBlocks();
                document.getElementById('blockForm').reset();
            }
        } catch (e) {
            console.error('Ошибка:', e);
        }
    });

    // Сохранение конфига
    document.getElementById('configForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const config = {
            title: document.getElementById('configTitle').value,
            description: document.getElementById('configDescription').value,
            hero_heading: document.getElementById('configHeroHeading').value,
            hero_sub: document.getElementById('configHeroSub').value,
            contact_email: document.getElementById('configEmail').value,
            contact_phone: document.getElementById('configPhone').value,
            custom_css: document.getElementById('configCss').value
        };

        try {
            const response = await fetch(`/admin/config?password=${encodeURIComponent(currentPassword)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            const data = await response.json();
            if (data.success) {
                alert('Настройки сохранены!');
            }
        } catch (e) {
            console.error('Ошибка:', e);
        }
    });

    // Глобальные функции для кнопок
    window.deletePhoto = async function(id) {
        if (!confirm('Удалить фото?')) return;
        try {
            await fetch(`/admin/photos/${id}?password=${encodeURIComponent(currentPassword)}`, {
                method: 'DELETE'
            });
            await loadGallery();
        } catch (e) {
            console.error('Ошибка:', e);
        }
    };

    window.deleteBlock = async function(id) {
        if (!confirm('Удалить блок?')) return;
        try {
            await fetch(`/admin/blocks/${id}?password=${encodeURIComponent(currentPassword)}`, {
                method: 'DELETE'
            });
            await loadBlocks();
        } catch (e) {
            console.error('Ошибка:', e);
        }
    };

    window.editPhoto = function(id) {
        alert('Редактирование фото #' + id + ' (скоро будет реализовано)');
    };

    window.editBlock = function(id) {
        alert('Редактирование блока #' + id + ' (скоро будет реализовано)');
    };
});