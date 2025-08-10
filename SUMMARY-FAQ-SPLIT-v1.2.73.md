# 📦 Разделение SummaryFAQCard на отдельные компоненты - v1.2.73

## Что изменилось

В версии 1.2.73 компонент `SummaryFAQCard` был разделен на два отдельных компонента для лучшего размещения контента:

### Новые компоненты:

#### 1. `SummaryCard.astro`

- **Назначение**: Отображение саммари статьи в начале контента
- **Расположение**: Верх страницы, сразу после заголовка
- **Содержит**:
  - Краткое описание (`summary`)
  - Ключевые пункты (`highlights`)

#### 2. `FAQCard.astro`

- **Назначение**: Отображение часто задаваемых вопросов
- **Расположение**: Низ страницы, перед рекомендуемыми статьями
- **Содержит**:
  - Список вопросов и ответов (`faq`)

### Обновленные страницы:

#### Блог (`/src/pages/blog/[id].astro`)

```astro
<!-- Summary в начале контента -->
<SummaryCard
  summary={post.data.generativeEngineOptimization.generated.summary}
  highlights={post.data.generativeEngineOptimization.generated.highlights}
/>

<!-- Основной контент статьи -->
<Content />

<!-- FAQ после контента, перед рекомендуемыми -->
<FAQCard faq={post.data.generativeEngineOptimization.generated.faq} />
```

#### Продукты (`/src/pages/products/[id].astro`)

```astro
<!-- Summary в начале -->
<SummaryCard
  summary={product.data.generativeEngineOptimization.generated.summary}
  highlights={product.data.generativeEngineOptimization.generated.highlights}
/>

<!-- Контент продукта -->
<Content />

<!-- FAQ после контента -->
<FAQCard faq={product.data.generativeEngineOptimization.generated.faq} />
```

#### Проекты (`/src/pages/projects/[id].astro`)

```astro
<!-- Summary в начале -->
<SummaryCard
  summary={project.data.generativeEngineOptimization.generated.summary}
  highlights={project.data.generativeEngineOptimization.generated.highlights}
/>

<!-- Контент проекта -->
<Content />

<!-- FAQ после контента -->
<FAQCard faq={project.data.generativeEngineOptimization.generated.faq} />
```

### Языковая поддержка

Добавлены новые переводы:

#### Русский (`ru.json`)

```json
"summaryCard": {
  "ariaLabel": "Саммари статьи",
  "summaryLabel": "Саммари:"
},
"faqCard": {
  "ariaLabel": "Часто задаваемые вопросы",
  "faqLabel": "FAQ:"
}
```

#### Английский (`en.json`)

```json
"summaryCard": {
  "ariaLabel": "Article Summary",
  "summaryLabel": "Summary:"
},
"faqCard": {
  "ariaLabel": "Frequently Asked Questions",
  "faqLabel": "FAQ:"
}
```

### Преимущества разделения:

1. **Лучше UX**: Саммари в начале помогает быстро понять содержание
2. **Удобное FAQ**: Вопросы в конце, когда пользователь прочитал статью
3. **Гибкость**: Можно показывать только саммари или только FAQ
4. **Семантика**: Каждый компонент имеет четкое назначение
5. **Доступность**: Отдельные aria-label для каждого блока

### Обратная совместимость

Старый компонент `SummaryFAQCard` остается в пакете для совместимости, но рекомендуется использовать новые компоненты.

### Обновление проектов

После обновления до 1.2.73 все пользовательские блоги автоматически получат новую структуру компонентов! 🚀
