# Invoices v1

Генератор инвойсов на **Nuxt 3 + Pinia + TailwindCSS**.  
Форма для ввода данных и live-превью счета (без генерации PDF).

---

## 🚀 Стек
- [Nuxt 3](https://nuxt.com) + TypeScript
- [Vue 3](https://vuejs.org) (Composition API)
- [Pinia](https://pinia.vuejs.org) — стейт менеджмент
- [TailwindCSS](https://tailwindcss.com) — стилизация (mobile-first)

---

## 📌 ТЗ: Генератор инвойсов
Генератор инвойсов с формой слева и live-превью справа.

### Основной функционал

#### Форма инвойса
- Invoice details: номер, даты, отправитель/получатель
- Products/services: динамическая таблица товаров с расчетами
- Bank details: реквизиты 
- Totals: автоматический подсчет сумм с НДС и скидками
- Notes: дополнительные заметки

#### Расчеты
- `Amount = Quantity × Price × (1 + VAT%)`
- Автоматический пересчет при изменении любого поля
- Поддержка скидок на уровне товара и общей скидки

#### Управление товарами
- Добавление/удаление строк
- Редактирование всех полей inline
- Выпадающие списки для UoM, VAT, клиентов

#### Live превью
- Обновление превью при любых изменениях формы
- Debounce ~300ms чтобы не тормозило

---

## 🛠 Технические требования
- Nuxt 3 + TypeScript
- TailwindCSS или UnoCSS (на выбор)
- Pinia для стейт менеджмента
- Валидация обязательных полей

---

## 📱 Приоритет разработки
1. Сначала мобильная версия (**mobile-first** подход)
2. Потом адаптация под десктоп

На мобилках: форма сверху, превью снизу.

---

## ✅ Статус
- [x] Архитектура проекта
- [x] Форма + стор + расчёты
- [x] Live-превью с debounce
- [x] Пиксель-перфект верстка по макету

---

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
