# DOCS — Invoice Generator (Nuxt 3 + Pinia + Tailwind)

## 0) Карта проекта (главные файлы)

- `components/BaseSelect.vue` — универсальный `<select>` с поддержкой `v-model` через `update:modelValue`.
- `components/InvoiceForm.vue` — форма инвойса (поля, валидация, добавление/удаление строк, подсчёты).
- `components/InvoicePreview.vue` — live-превью инвойса (обновляется с задержкой 300ms).
- `pages/index.vue` — страница: собирает форму и превью; блокирует “Save invoice” при невалидной форме.
- `plugins/pinia.ts` — плагин, регистрирующий Pinia во всём приложении (SSR + клиент).
- `stores/invoice.ts` — Pinia-стор: состояние формы, геттеры (подсчёты), экшены (добавить/удалить/обновить).
- `composables/useDebounce.ts` — универсальная функция дебаунса.
- `composables/useNumberFormat.ts` — форматирование чисел по локали.
- `utils/calc.ts` — чистые функции расчётов (строка, субтотал, НДС, скидки, итог).

---

## 1) Vue термины (коротко и чётко)

- **`v-model`** — двухсторонняя привязка значения компонента к переменной. Изменения в инпуте сразу записываются в состояние, и наоборот.
  - Модификаторы:
    - **`.number`** — приводит ввод к числу.
    - **`.lazy`** — обновляет модель не на каждый ввод, а на `change`/`blur`.
  - Примеры:
    - `v-model="f.number"`
    - `v-model.number.lazy="line.quantity"`

- **`v-for`** — цикл по массиву для рендера повторяющихся элементов. Всегда добавляй `:key`.
  - Примеры:
    - В селекте: `v-for="opt in options" :key="String(opt)"`
    - В строках товаров: `v-for="line in f.lines" :key="line.id"`
    - В превью-таблице: `v-for="l in p.lines" :key="l.id"`

- **`computed`** — вычисляемые значения. Кэшируются и пересчитываются, когда меняются зависимые данные.
  - Примеры:
    - `const subTotal = computed(() => s.subtotal)`
    - `const total = computed(() => s.total)`

- **`watch(source, cb, options?)`** — реакция на изменение значения.
  - Примеры:
    - `watch(invalidAny, v => emit('invalid-change', v), { flush: 'post' })`
    - `watch(() => s.form, (v) => update(v), { deep: true })`

- **Жизненные циклы (`onMounted`)** — код, который должен выполниться после монтирования компонента.
  - Пример: `onMounted(() => { p.value = safeClone(s.form) })`

- **Реактивность**
  - `ref(value)` — реактивная переменная-примитив.
  - `reactive(obj)` — реактивный объект.
  - `storeToRefs(store)` — делает геттеры/state стора референсами, чтобы не терять реактивность при деструктуризации.

- **События компонентов (`defineEmits`)** — договор о событиях, которые компонент может эмитить наружу.
  - Пример: `defineEmits<{ (e: 'invalid-change', v: boolean): void }>()`

- **Свойства компонента (`defineProps`)** — входные параметры компонента.
  - Пример: `defineProps<{ label?: string; modelValue: string | number; options: (string | number)[] }>()`

---

## 2) Nuxt термины

- **`pages/`** — авто-роутинг; `pages/index.vue` становится страницей `/`.
- **`plugins/`** — авто-инициализация плагинов. Файл `plugins/pinia.ts` подключает Pinia.
- **`defineNuxtPlugin(cb)`** — регистрация плагина (получаем `nuxtApp`, даём доступ к `vueApp`, и т.д.).
- **SSR** — серверный рендер. Плагин Pinia должен быть универсальным (не `.client.ts`), чтобы стор был доступен и на сервере.

---

## 3) Pinia термины

- **`defineStore(name, { state, getters, actions })`** — создание стора.
- **`state()`** — реактивные данные (форма инвойса и справочники).
- **`getters`** — вычисляемые геттеры (субтотал, итоги и пр.).
- **`actions`** — методы изменения состояния (добавить/удалить/обновить строку).

Использование в компонентах:
```ts
import { useInvoiceStore } from '~/stores/invoice'
const s = useInvoiceStore()
```

---

## 4) Полный список ВСЕХ функций/методов с назначением

### 4.1 `utils/calc.ts` — чистые функции расчётов
- **`lineAmount(l: InvoiceLine)`** — сумма по строке: `quantity × price × (1 - discount%) × (1 + VAT%)` (округление до 2 знаков).
- **`subtotal(lines: InvoiceLine[])`** — сумма всех `quantity × price` без скидок/НДС.
- **`discountTotal(lines, globalDiscount)`** — общая скидка: сумма построчных скидок + глобальная скидка от subtotal.
- **`vatTotal(lines)`** — общая сумма НДС с учётом построчных скидок.
- **`total(lines, globalDiscount)`** — финальная сумма: `subtotal - discountTotal + vatTotal`.

### 4.2 `stores/invoice.ts` — Pinia стор
- **`id()`** — генерация короткого случайного идентификатора для строки.
- **State:**
  - `form: InvoiceForm` — вся форма счёта (номера/даты/стороны/банк/примечания/строки/скидка).
  - `uoms: UoM[]` — справочник единиц измерения (`"pcs" | "kg" | "hour"`).
  - `vatOptions: number[]` — справочник VAT (%).
  - `clients: string[]` — список клиентов.
- **Getters:**
  - **`lineAmount(l)`** — прокси к `utils/calc.ts/lineAmount`.
  - **`subtotal`** — прокси к `utils/calc.ts/subtotal`.
  - **`discountTotal`** — прокси к `utils/calc.ts/discountTotal`.
  - **`vatTotal`** — прокси к `utils/calc.ts/vatTotal`.
  - **`total`** — прокси к `utils/calc.ts/total`.
  - **`serialized`** — текущая форма сериализована в JSON (удобно для быстрого `watch`).
- **Actions:**
  - **`addLine()`** — добавить новую строку товара с дефолтными значениями.
  - **`removeLine(id: string)`** — удалить строку по `id`.
  - **`updateLine(id: string, patch: Partial<InvoiceLine>)`** — обновить поля строки патчем.

### 4.3 `components/BaseSelect.vue`
- **`defineProps`** — принимает:
  - `label?: string` — подпись над селектом,
  - `modelValue: string | number` — значение для `v-model`,
  - `options: (string | number)[]` — список опций.
- **`defineEmits`** — объявляет событие:
  - **`update:modelValue`** — стандартное событие для поддержки `v-model` у пользовательских компонентов.
- **`cast(v: string)`** — приводит строку к числу, если возможно; иначе возвращает исходную строку.
- **`@change="$emit('update:modelValue', cast(...))"`** — на изменение селекта эмитим новое значение в родителя.
- **`v-for="opt in options"`** — рендер опций селекта.

### 4.4 `components/InvoiceForm.vue`
- **Импорт стора:** `useInvoiceStore()`.
- **`storeToRefs(s)`** — берём реактивные ссылки: `form: f`, `uoms`, `vatOptions`.
- **Функции/методы:**
  - **`add()`** — обёртка над `s.addLine()` (добавляет строку).
  - **`remove(id: string)`** — обёртка над `s.removeLine(id)` (удаляет строку).
  - **`amountOf(l: InvoiceLine)`** — обёртка над `s.lineAmount(l)` (сумма строки).
  - **`required(v?: string)`** — простая проверка на обязательность (не пустая строка).
  - **`clampNum(v: number, min = 0)`** — защита от `NaN`/отрицательных значений; возвращает минимум, если число некорректное.
- **Композиционные utils:**
  - **`useNumberFormat('ru-RU', 2)`** → `{ format: fmt }` — форматирование чисел.
- **`computed`:**
  - **`subTotal`** — `s.subtotal`.
  - **`vat`** — `s.vatTotal`.
  - **`discount`** — `s.discountTotal`.
  - **`totalSum`** — `s.total`.
  - **`invalid`** — объект флагов обязательных полей (`number/issue/due/from/to`).
  - **`invalidAny`** — `true`, если хоть одно обязательное поле не валидно.
- **`watch`:**
  - **`watch(invalidAny, v => emit('invalid-change', v), { flush: 'post' })`** — уведомляем родителя (страницу) о валидности формы.
- **`onMounted`:**
  - При монтировании сразу эмитим актуальную валидность: `emit('invalid-change', invalidAny.value)`.
- **`emit`:**
  - **`invalid-change: boolean`** — форма валидна/невалидна (для блокировки кнопки “Save invoice”).

- **`v-model` список:**
  - `v-model="f.number"` — номер инвойса.
  - `v-model="f.issueDate"` — дата выставления.
  - `v-model="f.dueDate"` — дата оплаты.
  - `v-model="f.from.name|company|email"` — отправитель.
  - `v-model="f.to.name|company|email"` — получатель.
  - `v-model="f.bankDetails"` — банковские реквизиты.
  - `v-model="f.notes"` — заметки.
  - По строкам товаров:
    - `v-model="line.description"` — описание.
    - `v-model.number.lazy="line.quantity"` — количество (число, ленивое обновление).
    - `v-model="line.uom"` — единица измерения (через `BaseSelect`).
    - `v-model.number.lazy="line.price"` — цена за единицу (число, ленивое).
    - `v-model="line.vat"` — НДС (через `BaseSelect`).
    - `v-model.number.lazy="line.discount"` — скидка % (число, ленивое).
  - `v-model.number.lazy="f.globalDiscount"` — общая скидка %.
- **`v-for` список:**
  - `v-for="line in f.lines" :key="line.id"` — рендер строки товара.
- **События/инпуты:**
  - `@blur` на числовых полях — нормализуем значения через `clampNum(...)`.
  - Кнопки:
    - `@click="add"` — добавляет строку.
    - `@click="remove(line.id)"` — удаляет строку.

### 4.5 `components/InvoicePreview.vue`
- **Импорт стора:** `useInvoiceStore()`.
- **`p = ref<InvoiceForm|null>(null)`** — локальная «снимок-форма» для превью.
- **Функции:**
  - **`safeClone(form)`** — безопасно снимает копию формы без реактивности (через `structuredClone`/`JSON`).
  - **`update(form)`** — дебаунс-обновление превью (см. `useDebounce` ниже).
  - **`lineAmount(l)`** — обёртка над `s.lineAmount(l)`.
- **Композиционные utils:**
  - **`useDebounce((form) => { p.value = safeClone(form) }, 300)`** — откладывает обновление превью на 300мс.
  - **`useNumberFormat('ru-RU', 2)`** → `{ format: fmt }` — форматирование чисел.
- **`computed`:**
  - **`subtotal`** — `s.subtotal`.
  - **`discount`** — `s.discountTotal`.
  - **`vat`** — `s.vatTotal`.
  - **`total`** — `s.total`.
- **`watch`:**
  - **`watch(() => s.form, (v) => update(v), { deep: true })`** — следим за всей формой; изменения применяем с дебаунсом.
- **`onMounted`:**
  - Инициализируем превью: `p.value = safeClone(s.form)`.
- **`v-for`:**
  - `v-for="l in p.lines" :key="l.id"` — рендер строк в таблице превью.
- **Прочее:**
  - `v-if="p"` — пока превью не готово, показываем «Loading preview…».

### 4.6 `pages/index.vue`
- **Импорт:** `InvoiceForm`, `InvoicePreview`.
- **`isInvalid = ref(false)`** — флаг для блокировки кнопки сохранения.
- **События/связи:**
  - `@invalid-change="isInvalid = $event"` — принимает сигнал валидности от формы.
- **Кнопки:**
  - `"Save invoice"` — `:disabled="isInvalid"`.

### 4.7 `plugins/pinia.ts`
- **По назначению:** регистрирует Pinia для всего приложения (SSR + клиент).
- **Код:**
  - `import { createPinia } from 'pinia'`
  - `export default defineNuxtPlugin((nuxtApp) => { nuxtApp.vueApp.use(createPinia()) })`

### 4.8 `composables/useDebounce.ts`
- **`useDebounce<T>(fn, delay = 300)`** — возвращает функцию, которая откладывает вызов `fn` на `delay` мс.
- **`debounced.cancel()`** — отменяет отложенный вызов.

### 4.9 `composables/useNumberFormat.ts`
- **`useNumberFormat(locale = 'ru-RU', maximumFractionDigits = 2)`**
  - Возвращает `{ format }`.
  - **`format(n: number)`** — форматирует число по локали, например `24 000,50`.

---

## 5) Полный список `v-model` / `v-for` / `computed` / `watch`

### `v-model` (все места)
- `f.number`
- `f.issueDate`
- `f.dueDate`
- `f.from.name`, `f.from.company`, `f.from.email`
- `f.to.name`, `f.to.company`, `f.to.email`
- `line.description`
- `line.quantity` **(number, lazy)**
- `line.uom` (через `BaseSelect`)
- `line.price` **(number, lazy)**
- `line.vat` (через `BaseSelect`)
- `line.discount` **(number, lazy)**
- `f.bankDetails`
- `f.globalDiscount` **(number, lazy)**
- `f.notes`

### `v-for` (все места)
- В `BaseSelect.vue`: `v-for="opt in options" :key="String(opt)"`.
- В `InvoiceForm.vue` (строки товаров): `v-for="line in f.lines" :key="line.id"`.
- В `InvoicePreview.vue` (таблица превью): `v-for="l in p.lines" :key="l.id"`.

### `computed` (все места)
- В `InvoiceForm.vue`:
  - `subTotal = computed(() => s.subtotal)`
  - `vat = computed(() => s.vatTotal)`
  - `discount = computed(() => s.discountTotal)`
  - `totalSum = computed(() => s.total)`
  - `invalid = computed(() => ({ number, issue, due, from, to }))`
  - `invalidAny = computed(() => Object.values(invalid.value).some(Boolean))`
- В `InvoicePreview.vue`:
  - `subtotal = computed(() => s.subtotal)`
  - `discount = computed(() => s.discountTotal)`
  - `vat = computed(() => s.vatTotal)`
  - `total = computed(() => s.total)`

### `watch` (все места)
- В `InvoiceForm.vue`:
  - `watch(invalidAny, v => emit('invalid-change', v), { flush: 'post' })`
- В `InvoicePreview.vue`:
  - `watch(() => s.form, (v) => update(v), { deep: true })`

---

## 6) Поток данных (как всё связано)

1. **Пользователь** вводит данные в **InvoiceForm** → `v-model` пишет их в **Pinia-стор** (`s.form`).
2. **Getters** в сторе (`subtotal`, `total` и т.п.) пересчитываются автоматически.
3. **InvoicePreview** «слушает» `s.form` через `watch` и обновляет локальную копию `p` **с дебаунсом 300ms**.
4. **Страница** (`pages/index.vue`) получает событие `invalid-change` от формы и включает/выключает кнопку **Save**.

---

## 7) Частые вопросы (коротко)

- **Почему `.lazy` на численных полях?**  
  Чтобы не пересчитывать стор на каждый ввод символа (например, при наборе `12,3`).

- **Зачем `clampNum`?**  
  Чтобы не допускать отрицательных значений и `NaN` (безопасность ввода).

- **Почему в превью используется `safeClone`?**  
  Чтобы локальная копия `p` не была реактивно связана со стором (защита от побочных эффектов).

- **Зачем `useDebounce`?**  
  Чтобы превью не дёргалось и не перегружало CPU при быстром наборе (UX + производительность).