# Задача 3: Создание нового провайдера

## Название задачи
Создание KinopoiskUnofficialProvider для API kinopoiskapiunofficial.tech

## Описание задачи
Создать новый провайдер для работы с API `https://kinopoiskapiunofficial.tech/`, который будет реализовывать интерфейс `IKinopoiskProvider` и обеспечивать альтернативный источник данных о фильмах.

## Чек-лист выполнения задачи
- [ ] Изучить структуру API kinopoiskapiunofficial.tech
- [ ] Создать `KinopoiskUnofficialProvider` класс
- [ ] Реализовать все методы интерфейса `IKinopoiskProvider`
- [ ] Добавить маппинг данных между форматами API
- [ ] Реализовать обработку ошибок
- [ ] Добавить валидацию API ключей
- [ ] Протестировать основные методы

## API Endpoints (на основе найденной документации)
- `/api/v2.2/films/{id}` - получение фильма по ID
- `/api/v2.1/films/search-by-keyword` - поиск по ключевым словам
- `/api/v2.1/films/search-by-filters` - поиск с фильтрами
- `/api/v2.2/films/{id}/seasons` - сезоны сериала
- `/api/v2.2/films/{id}/facts` - факты о фильме
- `/api/v2.2/films/{id}/images` - изображения фильма
- `/api/v2.1/films/{id}/frames` - кадры из фильма
- `/api/v2.2/films/{id}/box_office` - кассовые сборы
- `/api/v2.2/films/{id}/distributions` - прокат фильма

## Особенности API
- Базовый URL: `https://kinopoiskapiunofficial.tech/api`
- Аутентификация через заголовок `X-API-KEY`
- Версия API: v2.1 и v2.2
- Пагинация: до 20 элементов на страницу
- Поддержка различных типов изображений

## Файлы для создания
1. `src/shared/services/providers/kinopoisk-unofficial-provider.ts` - Основной провайдер
2. `src/shared/services/providers/types-unofficial.ts` - Типы для unofficial API
3. Обновить `src/shared/services/providers/index.ts`