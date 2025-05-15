# UI Kit для GeekHeaven

## Описание

UI Kit содержит базовые компоненты для построения интерфейса GeekHeaven. Компоненты разработаны с учетом современных практик, доступности и адаптивности.

## Компоненты

### Типография

#### Заголовки

```svelte
<script>
  import { Heading } from '@shared/ui';
</script>

<Heading level="h1">Заголовок первого уровня</Heading>
<Heading level="h2">Заголовок второго уровня</Heading>
<Heading level="h3">Заголовок третьего уровня</Heading>
```

#### Текст

```svelte
<script>
  import { Text } from '@shared/ui';
</script>

<Text>Обычный текст</Text>
<Text size="sm">Маленький текст</Text>
<Text weight="bold">Жирный текст</Text>
```

### Кнопки

#### Основные варианты

```svelte
<script>
  import { Button } from '@shared/ui';
</script>

<Button variant="primary">Основная кнопка</Button>
<Button variant="secondary">Вторичная кнопка</Button>
<Button variant="outline">Контурная кнопка</Button>
<Button variant="text">Текстовая кнопка</Button>
```

#### Размеры

```svelte
<Button size="sm">Маленькая</Button>
<Button size="md">Средняя</Button>
<Button size="lg">Большая</Button>
```

#### С иконкой

```svelte
<Button icon="star">С иконкой</Button>
<Button iconOnly="search" aria-label="Поиск" />
```

### Поля ввода

#### Текстовое поле

```svelte
<script>
  import { Input } from '@shared/ui';
</script>

<Input label="Имя пользователя" placeholder="Введите имя" />
<Input type="password" label="Пароль" />
<Input error="Поле обязательно для заполнения" />
```

#### Поле поиска

```svelte
<script>
  import { SearchInput } from '@shared/ui';
</script>

<SearchInput placeholder="Поиск медиа..." />
```

### Переключатели

#### Чекбокс

```svelte
<script>
  import { Checkbox } from '@shared/ui';
</script>

<Checkbox label="Запомнить меня" />
```

#### Радио-кнопка

```svelte
<script>
  import { Radio, RadioGroup } from '@shared/ui';
</script>

<RadioGroup name="status">
  <Radio value="watching" label="Смотрю" />
  <Radio value="completed" label="Просмотрено" />
  <Radio value="planned" label="В планах" />
</RadioGroup>
```

#### Переключатель

```svelte
<script>
  import { Toggle } from '@shared/ui';
</script>

<Toggle label="Темная тема" />
```

### Карточки

#### Базовая карточка

```svelte
<script>
  import { Card } from '@shared/ui';
</script>

<Card>
  <h3>Заголовок карточки</h3>
  <p>Содержимое карточки</p>
</Card>
```

#### Карточка медиа

```svelte
<script>
  import { MediaCard } from '@shared/ui';
</script>

<MediaCard
  title="Название медиа"
  poster="/path/to/poster.jpg"
  rating={8.5}
  year={2023}
  genres={['Фантастика', 'Боевик']}
/>
```

### Бейджи и метки

```svelte
<script>
  import { Badge, Tag } from '@shared/ui';
</script>

<Badge count={5} />
<Tag>Фантастика</Tag>
<Tag color="success">Просмотрено</Tag>
```

### Модальные окна

```svelte
<script>
  import { Modal, Button } from '@shared/ui';
  let isOpen = false;
</script>

<Button on:click={() => isOpen = true}>Открыть модальное окно</Button>

<Modal
  title="Заголовок модального окна"
  isOpen={isOpen}
  onClose={() => isOpen = false}
>
  <p>Содержимое модального окна</p>
  <div slot="footer">
    <Button variant="secondary" on:click={() => isOpen = false}>Отмена</Button>
    <Button variant="primary">Подтвердить</Button>
  </div>
</Modal>
```

### Уведомления

```svelte
<script>
  import { Toast, useToast } from '@shared/ui';
  const toast = useToast();
</script>

<Button on:click={() => toast.show('Операция выполнена успешно', 'success')}>Показать уведомление</Button>
```

### Достижения

```svelte
<script>
  import { Achievement } from '@shared/ui';
</script>

<Achievement
  title="Первый шаг"
  description="Добавьте первый медиа-объект в библиотеку"
  icon="trophy"
  unlocked={true}
/>

<Achievement
  title="Секретное достижение"
  description="???"
  icon="lock"
  unlocked={false}
  secret={true}
/>
```

## Цветовая палитра

```scss
// Основные цвета
--color-primary: #6200ee;
--color-primary-variant: #3700b3;
--color-secondary: #03dac6;
--color-secondary-variant: #018786;

// Семантические цвета
--color-success: #4caf50;
--color-warning: #ff9800;
--color-error: #f44336;
--color-info: #2196f3;

// Нейтральные цвета
--color-background: #ffffff;
--color-surface: #f5f5f5;
--color-text-primary: #212121;
--color-text-secondary: #757575;
--color-text-disabled: #9e9e9e;
--color-divider: #e0e0e0;

// Темная тема
--color-background-dark: #121212;
--color-surface-dark: #1e1e1e;
--color-text-primary-dark: #ffffff;
--color-text-secondary-dark: #b0b0b0;
--color-text-disabled-dark: #6c6c6c;
--color-divider-dark: #2c2c2c;
```

## Типографика

```scss
// Шрифты
--font-family-base: 'Roboto', sans-serif;
--font-family-heading: 'Montserrat', sans-serif;

// Размеры шрифтов
--font-size-xs: 0.75rem;   // 12px
--font-size-sm: 0.875rem;  // 14px
--font-size-md: 1rem;      // 16px
--font-size-lg: 1.125rem;  // 18px
--font-size-xl: 1.25rem;   // 20px
--font-size-2xl: 1.5rem;   // 24px
--font-size-3xl: 1.875rem; // 30px
--font-size-4xl: 2.25rem;  // 36px

// Высота строки
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-loose: 1.75;

// Вес шрифта
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-bold: 700;
```

## Отступы и размеры

```scss
// Отступы
--spacing-xs: 0.25rem;  // 4px
--spacing-sm: 0.5rem;   // 8px
--spacing-md: 1rem;     // 16px
--spacing-lg: 1.5rem;   // 24px
--spacing-xl: 2rem;     // 32px
--spacing-2xl: 3rem;    // 48px

// Радиусы скругления
--radius-sm: 0.25rem;   // 4px
--radius-md: 0.5rem;    // 8px
--radius-lg: 1rem;      // 16px
--radius-full: 9999px;  // Полное скругление

// Тени
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
--shadow-md: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
```

## Анимации

```scss
// Длительность
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

// Функции плавности
--easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1);
```

## Адаптивность

```scss
// Точки перелома
--breakpoint-xs: 0;
--breakpoint-sm: 600px;
--breakpoint-md: 960px;
--breakpoint-lg: 1280px;
--breakpoint-xl: 1920px;
```

## Доступность

Все компоненты разработаны с учетом требований WCAG AA:

- Достаточный контраст текста
- Поддержка клавиатурной навигации
- Правильная семантическая структура
- ARIA-атрибуты для сложных компонентов
- Поддержка скринридеров

## Использование

UI Kit доступен через импорт из директории `@shared/ui`:

```svelte
<script>
  import { Button, Input, Card } from '@shared/ui';
</script>

<Card>
  <h2>Форма входа</h2>
  <Input label="Email" type="email" />
  <Input label="Пароль" type="password" />
  <Button variant="primary">Войти</Button>
</Card>
```