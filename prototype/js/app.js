// Основной файл приложения

Handlebars.registerHelper('json', function (obj) {
    return JSON.stringify(obj);
});

// Загрузка шаблонов и данных
const templates = {};
const data = {};

// Функция для загрузки шаблона
async function loadTemplate(name) {
    const response = await fetch(`components/${name}.hbs`);
    const templateText = await response.text();
    templates[name] = Handlebars.compile(templateText);
    return templates[name];
}

// Функция для загрузки данных
async function loadData(name) {
    const response = await fetch(`data/${name}.json`);
    data[name] = await response.json();
    return data[name];
}

// Функция для рендеринга компонента
function renderComponent(name, targetSelector, context = {}) {
    const template = templates[name];
    if (!template) {
        console.error(`Шаблон ${name} не найден`);
        return;
    }
    
    const html = template(context);
    document.querySelector(targetSelector).innerHTML = html;
}

// Регистрация частичных шаблонов
function registerPartials() {
    Handlebars.registerPartial('content-card', templates['content-card']);
}

// Инициализация приложения
async function initApp() {
    try {
        // Загрузка всех шаблонов
        await Promise.all([
            loadTemplate('header'),
            loadTemplate('side-nav'),
            loadTemplate('mobile-nav'),
            loadTemplate('content-card'),
            loadTemplate('content-section'),
            loadTemplate('search-filters'),
            loadTemplate('library'),
            loadTemplate('profile')
        ]);
        
        // Регистрация частичных шаблонов
        registerPartials();
        
        // Загрузка всех данных
        await Promise.all([
            loadData('navigation'),
            loadData('recommendations'),
            loadData('new-content'),
            loadData('search'),
            loadData('library'),
            loadData('profile')
        ]);
        
        // Рендеринг компонентов
        renderComponent('header', '#header-container', {
            siteName: 'GeekHeaven',
            searchPlaceholder: 'Поиск...',
            user: {
                avatar: 'assets/images/avatars/user1.svg',
                avatarAlt: 'Аватар'
            }
        });
        
        renderComponent('side-nav', '#side-nav-container', data.navigation);
        renderComponent('mobile-nav', '#mobile-nav-container', data.navigation);
        
        // Рендеринг секций контента на главной странице
        renderComponent('content-section', '#recommendations-container', data.recommendations);
        renderComponent('content-section', '#new-content-container', data['new-content']);
        
        // Рендеринг страницы поиска
        renderComponent('search-filters', '#search-filters-container', { filters: data.search.filters });
        renderComponent('content-section', '#search-results-container', { 
            title: 'Результаты поиска', 
            items: data.search.results 
        });
        
        // Рендеринг страницы библиотеки
        renderComponent('library', '#library-tabs-container', data.library);
        
        // Рендеринг страницы профиля
        renderComponent('profile', '#profile-container', data.profile);
        
        // Инициализация обработчиков событий
        initEventHandlers();
        
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
    }
}

// Инициализация обработчиков событий
function initEventHandlers() {
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
    document.addEventListener('click', async function(event) {
        // Проверяем, был ли клик по карточке контента или по её дочернему элементу
        const contentCard = event.target.closest('.content-card');
        if (contentCard) {
            const contentId = contentCard.getAttribute('data-id');
            console.log('Открыта карточка контента с ID:', contentId);
            
            try {
                // Загрузка шаблона деталей контента, если он еще не загружен
                if (!templates['content-details']) {
                    await loadTemplate('content-details');
                }
                
                // Загрузка данных о контенте
                if (!data['content-details']) {
                    await loadData('content-details');
                }
                
                // Рендеринг страницы деталей контента
                renderComponent('content-details', '#content-details-container', data['content-details']);
                
                // Скрываем все экраны
                document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
                
                // Показываем экран деталей контента
                document.getElementById('content-details').classList.add('active');
            } catch (error) {
                console.error('Ошибка при загрузке деталей контента:', error);
            }
        }
    });
    
    // Обработка клика по кнопке "Назад" на странице деталей контента
    document.addEventListener('click', function(event) {
        if (event.target.closest('#content-details .back-button')) {
            // Возвращаемся на предыдущий экран (обычно это главная или поиск)
            document.getElementById('content-details').classList.remove('active');
            document.getElementById('dashboard').classList.add('active');
        }
    });
}



// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);