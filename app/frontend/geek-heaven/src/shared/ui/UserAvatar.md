# UserAvatar Component

## Описание
Компонент для отображения аватарки пользователя с автоматической заглушкой при отсутствии изображения или ошибке загрузки.

## Свойства (Props)

| Свойство | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `src` | `string \| null` | `null` | URL изображения аватарки |
| `alt` | `string` | `'Аватар пользователя'` | Альтернативный текст для изображения |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Размер аватарки |
| `className` | `string` | `''` | Дополнительные CSS классы |

## Размеры

- `sm` - 24x24px
- `md` - 40x40px (по умолчанию)
- `lg` - 56x56px
- `xl` - 80x80px

## Примеры использования

### Базовое использование
```svelte
<script>
  import { UserAvatar } from '$lib/shared/ui';
</script>

<!-- Аватарка с заглушкой -->
<UserAvatar />

<!-- Аватарка с изображением -->
<UserAvatar src="/path/to/avatar.jpg" alt="Иван Иванов" />
```

### Разные размеры
```svelte
<UserAvatar size="sm" />
<UserAvatar size="md" />
<UserAvatar size="lg" />
<UserAvatar size="xl" />
```

### С дополнительными классами
```svelte
<UserAvatar className="custom-avatar" />
```

## Особенности

- Автоматически показывает SVG заглушку при отсутствии `src` или ошибке загрузки
- Круглая форма с рамкой
- Адаптивные размеры
- Поддержка кастомных CSS классов
- Обработка ошибок загрузки изображений

## CSS переменные

Компонент использует следующие CSS переменные:
- `--color-surface-secondary` - цвет фона (fallback: #f3f4f6)
- `--color-border` - цвет рамки (fallback: #e5e7eb)

## Файлы

- Компонент: `src/shared/ui/UserAvatar.svelte`
- SVG заглушка: `src/shared/assets/user-avatar-placeholder.svg`
- Документация: `src/shared/ui/UserAvatar.md`