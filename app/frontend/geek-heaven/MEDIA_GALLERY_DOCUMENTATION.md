# Документация компонента MediaGallery

## Описание
Компонент MediaGallery предназначен для отображения галереи изображений медиа-контента с использованием Kinopoisk API. Поддерживает различные типы изображений: постеры, скриншоты, фоны и кадры.

## Структура компонентов

### MediaGallery.svelte
Основной компонент галереи с фильтрацией по типам изображений.

**Props:**
- `movieId: number` - ID фильма для загрузки изображений
- `initialType: ImageType = 'poster'` - начальный тип изображений
- `showTypeFilter: boolean = true` - показывать ли фильтр типов
- `columns: number = 4` - количество колонок в сетке

**События:**
- Нет внешних событий

### ImageGrid.svelte
Компонент для отображения сетки изображений.

**Props:**
- `images: MovieImage[]` - массив изображений
- `columns: number = 4` - количество колонок
- `gap: string = 'var(--spacing-md)'` - отступ между изображениями
- `lazy: boolean = true` - включить lazy loading

**События:**
- `imageClick` - клик по изображению

### ImagePreview.svelte
Компонент для отображения превью изображения с lazy loading.

**Props:**
- `image: MovieImage` - данные изображения
- `index: number` - индекс изображения
- `lazy: boolean = true` - включить lazy loading

**События:**
- `click` - клик по изображению

### ImageModal.svelte
Модальное окно для просмотра изображений с навигацией.

**Props:**
- `images: MovieImage[]` - массив изображений
- `currentIndex: number = 0` - текущий индекс
- `isOpen: boolean = false` - состояние модального окна

**События:**
- `close` - закрытие модального окна

## Типы данных

### ImageType
```typescript
type ImageType = 'cover' | 'backdrops' | 'screenshot' | 'frame';
```

### MovieImage
```typescript
interface MovieImage {
  movieId: number;
  type: ImageType;
  language?: string;
  url: string;
  previewUrl: string;
  height?: number;
  width?: number;
}
```

### ImagesResponse
```typescript
interface ImagesResponse {
  docs: MovieImage[];
  total: number;
  limit: number;
  page: number;
  pages: number;
}
```

## API методы

### KinopoiskService

#### getMovieImages(movieId, type?, page?, limit?)
Получение изображений для фильма.

**Параметры:**
- `movieId: number` - ID фильма
- `type?: ImageType` - тип изображений (опционально)
- `page: number = 1` - номер страницы
- `limit: number = 20` - количество изображений на странице

#### getMoviePosters(movieId, page?, limit?)
Получение постеров фильма.

#### getMovieScreenshots(movieId, page?, limit?)
Получение скриншотов фильма.

#### getMovieBackdrops(movieId, page?, limit?)
Получение фоновых изображений фильма.

#### getMovieFrames(movieId, page?, limit?)
Получение кадров из фильма.

## Примеры использования

### Базовое использование
```svelte
<script>
  import { MediaGallery } from '../entities/MediaGallery';
</script>

<MediaGallery movieId={123456} />
```

### С настройками
```svelte
<script>
  import { MediaGallery } from '../entities/MediaGallery';
</script>

<MediaGallery 
  movieId={123456}
  initialType="screenshot"
  columns={3}
  showTypeFilter={false}
/>
```

### Интеграция в MediaCard
```svelte
<script>
  import { MediaGallery } from '../MediaGallery';
  
  let isGalleryOpen = false;
  
  function openGallery() {
    isGalleryOpen = true;
  }
  
  function closeGallery() {
    isGalleryOpen = false;
  }
</script>

<!-- Кнопка для открытия галереи -->
<Button on:click={openGallery}>Галерея</Button>

<!-- Модальное окно с галереей -->
{#if isGalleryOpen}
  <div class="modal" on:click={closeGallery}>
    <div class="modal-content" on:click={(e) => e.stopPropagation()}>
      <MediaGallery movieId={movie.id} />
    </div>
  </div>
{/if}
```

## Особенности

### Lazy Loading
- Изображения загружаются только при попадании в область видимости
- Используется Intersection Observer API
- Показывается skeleton анимация во время загрузки

### Адаптивность
- Автоматическое изменение количества колонок на разных экранах
- Оптимизированные размеры для мобильных устройств
- Сенсорная навигация в модальном окне

### Обработка ошибок
- Показ заглушки при ошибке загрузки изображения
- Кнопка повторной попытки загрузки
- Graceful degradation при отсутствии изображений

### Навигация
- Клавиатурная навигация (стрелки, Escape)
- Миниатюры для быстрого перехода
- Счетчик изображений

## Стилизация

Компоненты используют CSS переменные для настройки внешнего вида:

```scss
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  --color-surface: #ffffff;
  --color-surface-secondary: #f5f5f5;
  --color-border: #e0e0e0;
  --color-primary: #007bff;
  --color-text-primary: #333333;
  --color-text-secondary: #666666;
}
```

## Производительность

### Оптимизации
- Lazy loading изображений
- Виртуализация для больших списков (планируется)
- Кэширование API запросов
- Оптимизированные размеры превью

### Рекомендации
- Используйте разумные лимиты для количества изображений
- Предзагружайте критически важные изображения
- Мониторьте производительность на слабых устройствах

## Тестирование

### Unit тесты
```javascript
// Пример теста для ImagePreview
import { render, fireEvent } from '@testing-library/svelte';
import ImagePreview from './ImagePreview.svelte';

test('should emit click event when image is clicked', async () => {
  const mockImage = {
    movieId: 123,
    type: 'poster',
    url: 'test.jpg',
    previewUrl: 'test-preview.jpg'
  };
  
  const { component, getByRole } = render(ImagePreview, {
    props: { image: mockImage, index: 0 }
  });
  
  let clickEvent;
  component.$on('click', (event) => {
    clickEvent = event.detail;
  });
  
  const button = getByRole('button');
  await fireEvent.click(button);
  
  expect(clickEvent).toEqual({ image: mockImage, index: 0 });
});
```

## Известные ограничения

1. **API лимиты**: Kinopoisk API имеет ограничения на количество запросов
2. **Размер изображений**: Некоторые изображения могут быть очень большими
3. **Браузерная поддержка**: Intersection Observer не поддерживается в старых браузерах
4. **Мобильная производительность**: Большое количество изображений может влиять на производительность

## Планы развития

- [ ] Виртуализация для больших списков изображений
- [ ] Поддержка полноэкранного режима
- [ ] Zoom функциональность
- [ ] Поддержка жестов на мобильных устройствах
- [ ] Кэширование изображений в localStorage
- [ ] Поддержка видео превью
- [ ] Экспорт изображений
- [ ] Социальные функции (лайки, комментарии)