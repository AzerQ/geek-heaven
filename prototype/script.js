document.addEventListener('DOMContentLoaded', function() {
    // Навигация по боковому и мобильному меню
    const navItems = document.querySelectorAll('.side-nav li, .mobile-nav li');
    const screens = document.querySelectorAll('.screen');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Удаляем активный класс у всех пунктов меню
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Добавляем активный класс текущему пункту
            this.classList.add('active');
            
            // Находим соответствующие пункты в другом меню и активируем их
            const screenId = this.getAttribute('data-screen');
            document.querySelectorAll(`[data-screen="${screenId}"]`).forEach(navItem => {
                navItem.classList.add('active');
            });
            
            // Скрываем все экраны
            screens.forEach(screen => screen.classList.remove('active'));
            
            // Показываем нужный экран
            document.getElementById(screenId).classList.add('active');
        });
    });
    
    // Обработка клика по карточкам контента
    const contentCards = document.querySelectorAll('.content-card');
    const contentDetailsScreen = document.getElementById('content-details');
    const backButton = document.querySelector('.back-button');
    
    contentCards.forEach(card => {
        card.addEventListener('click', function() {
            // Сохраняем предыдущий активный экран
            const activeScreen = document.querySelector('.screen.active');
            activeScreen.classList.remove('active');
            
            // Показываем экран с деталями контента
            contentDetailsScreen.classList.add('active');
            
            // Прокручиваем страницу вверх
            window.scrollTo(0, 0);
            
            // Здесь можно добавить код для загрузки данных о контенте
            // по его ID (data-id)
            const contentId = this.getAttribute('data-id');
            console.log('Открыта карточка контента с ID:', contentId);
        });
    });
    
    // Обработка клика по кнопке "Назад"
    backButton.addEventListener('click', function() {
        // Скрываем экран с деталями
        contentDetailsScreen.classList.remove('active');
        
        // Возвращаемся на предыдущий экран (по умолчанию - дашборд)
        const previousScreen = document.getElementById('dashboard');
        previousScreen.classList.add('active');
        
        // Активируем соответствующий пункт меню
        navItems.forEach(navItem => navItem.classList.remove('active'));
        document.querySelectorAll('[data-screen="dashboard"]').forEach(navItem => {
            navItem.classList.add('active');
        });
    });
    
    // Обработка вкладок в библиотеке
    const libraryTabs = document.querySelectorAll('.library-tabs .tab');
    
    libraryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Удаляем активный класс у всех вкладок
            libraryTabs.forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            
            // Здесь можно добавить код для загрузки соответствующего контента
            console.log('Выбрана вкладка:', this.textContent);
        });
    });
    
    // Модальное окно достижения
    const achievementModal = document.getElementById('achievementModal');
    const closeModal = document.querySelector('.close-modal');
    const modalButton = document.querySelector('.modal-footer .primary-button');
    
    // Функция для показа модального окна
    function showAchievementModal() {
        achievementModal.style.display = 'flex';
    }
    
    // Функция для скрытия модального окна
    function hideAchievementModal() {
        achievementModal.style.display = 'none';
    }
    
    // Обработчики для закрытия модального окна
    closeModal.addEventListener('click', hideAchievementModal);
    modalButton.addEventListener('click', hideAchievementModal);
    
    // Закрытие модального окна при клике вне его содержимого
    achievementModal.addEventListener('click', function(event) {
        if (event.target === achievementModal) {
            hideAchievementModal();
        }
    });
    
    // Показываем модальное окно при клике на кнопку "Добавить в библиотеку"
    const addToLibraryButton = document.querySelector('.content-actions .primary-button');
    addToLibraryButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Предотвращаем всплытие события
        showAchievementModal();
    });
    
    // Обработка клика по профилю в верхнем меню
    const profileBtn = document.getElementById('profileBtn');
    profileBtn.addEventListener('click', function() {
        // Скрываем все экраны
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Показываем экран профиля
        document.getElementById('profile').classList.add('active');
        
        // Активируем соответствующий пункт меню
        navItems.forEach(navItem => navItem.classList.remove('active'));
        document.querySelectorAll('[data-screen="profile"]').forEach(navItem => {
            navItem.classList.add('active');
        });
    });
    
    // Демонстрация модального окна при загрузке страницы (для примера)
    // Закомментировано, чтобы не мешало при первом открытии
    // setTimeout(showAchievementModal, 2000);
});