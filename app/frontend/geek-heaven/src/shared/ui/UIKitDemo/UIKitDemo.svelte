<script lang="ts">
  import { Button, Typography, Input, Checkbox, Radio, Select, Badge, Avatar, Icon } from '../';
</script>

<div class="ui-kit-demo">
  <Typography variant="h2" gutterBottom>UI Kit демонстрация</Typography>
  
  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Типографика</Typography>
    <div class="typography-showcase">
      <Typography variant="h1">Заголовок H1</Typography>
      <Typography variant="h2">Заголовок H2</Typography>
      <Typography variant="h3">Заголовок H3</Typography>
      <Typography variant="h4">Заголовок H4</Typography>
      <Typography variant="h5">Заголовок H5</Typography>
      <Typography variant="h6">Заголовок H6</Typography>
      <Typography variant="body1" gutterBottom>Основной текст (body1). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
      <Typography variant="body2" gutterBottom>Вторичный текст (body2). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
      <Typography variant="caption">Подпись (caption)</Typography>
      <Typography variant="overline">Надзаголовок (overline)</Typography>
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Кнопки</Typography>
    <div class="button-row">
      <Button variant="primary">Первичная</Button>
      <Button variant="secondary">Вторичная</Button>
      <Button variant="outline">Контурная</Button>
      <Button variant="ghost">Призрачная</Button>
    </div>
    
    <div class="button-row">
      <Button variant="primary" size="sm">Маленькая</Button>
      <Button variant="primary" size="md">Средняя</Button>
      <Button variant="primary" size="lg">Большая</Button>
    </div>
    
    <div class="button-row">
      <Button variant="primary" disabled>Отключенная</Button>
      <Button variant="primary" fullWidth>Полная ширина</Button>
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Поля ввода</Typography>
    <div class="input-row">
      <Input placeholder="Стандартное поле" />
      <Input placeholder="С меткой" label="Метка поля" />
      <Input placeholder="С подсказкой" helperText="Дополнительная информация" />
      <Input placeholder="Отключенное поле" disabled />
      <Input placeholder="Поле с ошибкой" error="Сообщение об ошибке" />
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Чекбоксы и радио</Typography>
    <div class="control-row">
      <Checkbox label="Стандартный чекбокс" />
      <Checkbox label="Отмеченный чекбокс" checked />
      <Checkbox label="Отключенный чекбокс" disabled />
    </div>
    <div class="control-row">
      <Radio name="demo" label="Первый вариант" value="1" />
      <Radio name="demo" label="Второй вариант" value="2" />
      <Radio name="demo" label="Отключенный" value="3" disabled />
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Выпадающий список</Typography>
    <div class="select-row">
      <Select
        label="Выберите опцию"
        options={[
          { value: '1', label: 'Опция 1' },
          { value: '2', label: 'Опция 2' },
          { value: '3', label: 'Опция 3' }
        ]}
      />
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Бейджи</Typography>
    <div class="badge-row">
      <Badge variant="primary">Первичный</Badge>
      <Badge variant="secondary">Вторичный</Badge>
      <Badge variant="success">Успех</Badge>
      <Badge variant="warning">Предупреждение</Badge>
      <Badge variant="danger">Ошибка</Badge>
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Аватары</Typography>
    <div class="avatar-row">
      <Avatar size="sm" src="https://i.pravatar.cc/32" />
      <Avatar size="md" src="https://i.pravatar.cc/48" />
      <Avatar size="lg" src="https://i.pravatar.cc/64" />
      <Avatar>AB</Avatar>
    </div>
  </section>

  <section class="demo-section">
    <Typography variant="h3" gutterBottom>Иконки</Typography>
    <div class="icon-row">
      <Icon name="home" />
      <Icon name="settings" />
      <Icon name="notification" />
      <Icon name="user" />
    </div>
  </section>
</div>

<style lang="scss">
  .ui-kit-demo {
    padding: var(--spacing-lg);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }

  .demo-section {
    margin-bottom: var(--spacing-xl);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .typography-showcase {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .button-row,
  .input-row,
  .control-row,
  .select-row,
  .badge-row,
  .avatar-row,
  .icon-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>