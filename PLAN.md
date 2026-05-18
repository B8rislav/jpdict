# Планы разработки — Платформа для изучения японского/китайского

> Цель: привести проект в соответствие с требованиями ВКР.  
> Порядок: сначала чистка и исправление текущего кода, затем поэтапная реализация недостающих функций.

---

## Анализ текущего состояния

### Что работает и соответствует ВКР
- Выбор языка (JP/CN) — LanguageSelect + Effector store ✅
- Эвристический классификатор запросов (kanji/word/sentence) — `Search/utils.ts` ✅
- Контекстно-адаптивная навигация: одиночный символ → KanjiCard, слово → WordCard, предложение → SentenceCard ✅
- Цветовое кодирование частей речи в токенах SentenceCard (JP и CN) ✅
- Токенизация предложений через BFF-роут (`/api/parse-sentence` → kuromoji) ✅
- AI-обзор предложения через OpenRouter (`/api/ai-overview`) ✅
- Локализация интерфейса на русский (ru.json) ✅
- State management через Effector ✅
- BFF-паттерн (Next.js API Routes) ✅
- Компонентная архитектура (FSD-подобная) ✅
- Шрифты Noto Sans JP и SC загружены через `next/font/google` в layout ✅
- `$userProfile.updates.watch(save)` — корректно, без срабатывания при инициализации ✅

### Критические проблемы (мешают корректной работе)
| Файл | Проблема |
|------|----------|
| `shared/api/fetchData.ts` | Вызывает api.renshuu.org — сторонний API, не предусмотренный ВКР |
| `shared/api/generatedTypes.d.ts` | Типы сгенерированы из OpenAPI Renshuu — не соответствуют целевой архитектуре |
| `app/api/ai-overview/route.ts:28` | `process.env.NEXT_PUBLIC_GPT_KEY` — серверная переменная не должна быть `NEXT_PUBLIC_` |
| `app/api/ai-overview/route.ts` | Промпт написан только для японского; китайский не поддерживается |
| `app/layout.tsx` | Title = "Create Next App" (заглушка) |
| `features/Search/Search.tsx` | debounce 350ms вместо 300ms (по спецификации UniversalSearch) |
| `features/Sentence/SentenceCard.tsx` | pinyin/чтение отображается в блоке метаданных ниже токена, а не над ним через `<ruby>` | 

### Дублирование кода
- `SentenceToken` тип объявлен дважды: в `Sentence/api/fetchSentence.ts` и `Sentence/model/index.ts`

### Закомментированный JSX
- `KanjiCard.tsx` строки 75, 89 — закомментированные `<div>` теги

### Моки вместо реальных данных
- `fetchWords.ts` — китайские слова захардкоджены
- `fetchKanji.ts` — китайские иероглифы захардкоджены
- `fetchSentence.ts` — китайский разбор захардкоджен (мок "我爱中国")

---

## Фаза 1: Чистка и исправление

### 1.1 Исправить env-переменную в ai-overview route

**Файл:** `src/app/api/ai-overview/route.ts`

- Заменить `process.env.NEXT_PUBLIC_GPT_KEY` → `process.env.OPENROUTER_KEY`
- Добавить поддержку китайского языка в промпт (детектировать язык по токенам)
- Убрать хардкод модели `deepseek/deepseek-v4-flash` в env-переменную `OPENROUTER_MODEL`

### 1.2 Исправить Effector store

**Файл:** `src/stores/userProfile.ts`

```ts
// Было:
$userProfile.watch(saveToLocalStorage);

// Надо:
$userProfile.updates.watch(saveToLocalStorage);
```

### 1.3 Убрать зависимость от Renshuu API

**Файлы для удаления/замены:**
- `src/shared/api/fetchData.ts` — удалить (или переписать под Jisho API)
- `src/shared/api/generatedTypes.d.ts` — заменить на собственные типы

**Создать:** `src/shared/api/types.ts` — свои типы для слов, иероглифов, предложений (см. секцию 2).

### 1.4 Устранить дублирование типа SentenceToken

- Оставить тип в `src/features/Sentence/api/fetchSentence.ts`
- В `src/features/Sentence/model/index.ts` импортировать из `../api/fetchSentence`

### 1.5 Убрать закомментированный код

**Файл:** `src/features/KanjiCard/KanjiCard.tsx`
- Удалить строки с `{/* <div className={styles.relatedKanji}> */}` и `{/* </div> */}`

### 1.6 Обновить метаданные layout

**Файл:** `src/app/layout.tsx`
- Title: `"JapChin Dict — Изучение японского и китайского"`
- Description: `"Платформа для изучения иероглифического письма с AI-анализом"`
- Добавить `lang="ru"` на `<html>` (шрифты Noto Sans JP/SC уже загружены)
- Устанавливать атрибут `data-lang="jp"` / `data-lang="cn"` на `<html>` через Client Component, подписанный на `$userProfile`

### 1.7 CSS-переключение шрифтов через data-атрибут

**Файл:** `src/app/styles/globals.css`

```css
:root { --font-cjk: var(--font-noto-jp), sans-serif; }
[data-lang="cn"] { --font-cjk: var(--font-noto-sc), sans-serif; }
body { font-family: var(--font-cjk); }
```

Шрифтовые CSS-переменные `--font-noto-jp` и `--font-noto-sc` уже объявлены в layout. Это позволяет переключать стек шрифтов без перезагрузки страницы.

### 1.8 Исправить debounce в Search

**Файл:** `src/features/Search/Search.tsx`

- Заменить 350ms → 300ms (соответствует спецификации компонента `UniversalSearch`)

### 1.7 Исправить WordCard для Chinese (cn)

**Файл:** `src/features/WordCard/WordCard.tsx`
- Поле `hiragana_full` для CN — это пиньинь. Переименовать в модели или условно рендерить лейбл.

---

## Фаза 2: Собственные типы данных

Создать `src/shared/api/types.ts`:

```ts
export type Language = 'jp' | 'cn';

export type WordEntry = {
  id: string;
  written: string;        // kanji / hanzi
  reading: string;        // hiragana / pinyin
  definitions: string[];
  markers: string[];      // JLPT N1-N5 / HSK 1-6
  level?: number;
};

export type KanjiEntry = {
  id: string;
  character: string;
  definition: string;
  radical: string;
  radicalName: string;
  kunyomi?: string;       // JP only
  onyomi?: string;        // JP only
  pinyin?: string;        // CN only
  strokeCount: string;
  level?: string;         // JLPT / HSK
  parts?: { piece: string; definition: string }[];
};

export type SentenceToken = {
  surface_form: string;
  basic_form: string;
  pos: string;
  pos_detail_1?: string;
  pos_detail_2?: string;
  pos_detail_3?: string;
  conjugated_type?: string;
  conjugated_form?: string;
  reading?: string;
  pronunciation?: string;
};

export type SentenceResult = {
  sentence: string;
  tokens: SentenceToken[];
  difficulty?: number;    // медиана JLPT/HSK уровней
};
```

Обновить все модели features/ использовать эти типы вместо `generatedTypes`.

---

## Фаза 3: Подключение реальных API (японский)

### 3.1 Jisho.org API — слова

**Файл:** `src/features/WordCard/api/fetchWords.ts`

Jisho.org имеет публичный API: `https://jisho.org/api/v1/search/words?keyword=<query>`

Маппинг ответа в `WordEntry`:
- `data[].slug` → id
- `data[].japanese[0].word` → written
- `data[].japanese[0].reading` → reading
- `data[].senses[0].english_definitions` → definitions
- `data[].jlpt` → markers (["jlpt-n3"] → ["N3"])

### 3.2 Jisho.org API — иероглифы (каньдзи)

**Файл:** `src/features/KanjiCard/api/fetchKanji.ts`

Endpoint: `https://jisho.org/api/v1/search/words?keyword=%23kanji+<character>`

Или использовать `kanjiapi.dev`:
- `https://kanjiapi.dev/v1/kanji/<char>` → возвращает kun_readings, on_readings, meanings, stroke_count, jlpt

### 3.3 BFF-роут /api/words (опционально)

Если Jisho CORS не позволяет прямые запросы с браузера — добавить BFF-роут:
`src/app/api/words/route.ts` — проксирует к Jisho.

---

## Фаза 4: NLP Backend (FastAPI + SudachiPy/HanLP)

> Это отдельный Python-сервис. Описан полностью в ВКР.

### 4.1 Структура Python-сервиса

```
backend/
├── main.py
├── routers/
│   ├── parse.py        # POST /parse — токенизация
│   └── search.py       # GET /search — поиск по PostgreSQL
├── nlp/
│   ├── japanese.py     # SudachiPy + UniDic
│   └── chinese.py      # HanLP + pypinyin
├── db/
│   └── models.py       # SQLAlchemy: users, saved_words, search_history, kanji_cache
├── auth/
│   └── jwt.py          # JWT access (15min) + httpOnly refresh (7d)
├── requirements.txt
└── Dockerfile
```

### 4.2 Обновить BFF-роут /api/parse-sentence

**Файл:** `src/app/api/parse-sentence/route.ts`

Сейчас: использует kuromoji (JS библиотека).  
Надо: проксировать к FastAPI: `POST http://backend:8000/parse`

```ts
const response = await fetch(`${process.env.BACKEND_URL}/parse`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: sentence, language }),
});
```

Временно оставить kuromoji для JP как fallback пока FastAPI не готов.

---

## Фаза 5: Furigana

### 5.1 Компонент FuriganaText

**Создать:** `src/shared/ui/FuriganaText/FuriganaText.tsx`

```tsx
type Props = { surface: string; reading?: string };

export const FuriganaText: FC<Props> = ({ surface, reading }) => {
  if (!reading || surface === reading) {
    return <span>{surface}</span>;
  }
  return (
    <ruby>
      {surface}
      <rt>{reading}</rt>
    </ruby>
  );
};
```

### 5.2 Применить в SentenceCard

**Файл:** `src/features/Sentence/SentenceCard.tsx`

Сейчас: `token.reading` выводится в блоке метаданных под токеном.  
Надо: заменить на `<FuriganaText>`, чтобы чтение отображалось над токеном через `<ruby>`.

```tsx
<FuriganaText surface={token.surface_form} reading={token.reading} />
```

Компонент работает одинаково для JP (хирагана) и CN (пиньинь) — `<rt>` отображается над символом в обоих режимах.

### 5.3 CSS для ruby

**Файл:** `src/app/styles/globals.css`

```css
ruby { ruby-align: center; }
rt { font-size: 0.55em; color: var(--text-secondary); }
```

---

## Фаза 6: DifficultyMeter

> ФТ-5 ВКР: отображение уровня сложности (медиана JLPT/HSK токенов).

### 6.1 Утилита расчёта сложности

**Создать:** `src/shared/utils/calculateDifficulty.ts`

```ts
const JLPT_SCORE: Record<string, number> = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 };
const HSK_SCORE: Record<string, number> = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6 };

export function calculateDifficulty(markers: string[], lang: 'jp' | 'cn'): number | null {
  const scores = markers
    .map(m => lang === 'jp' ? JLPT_SCORE[m] : HSK_SCORE[m])
    .filter(Boolean) as number[];
  if (!scores.length) return null;
  scores.sort((a, b) => a - b);
  return scores[Math.floor(scores.length / 2)];
}
```

### 6.2 Компонент DifficultyMeter

**Создать:** `src/features/DifficultyMeter/DifficultyMeter.tsx`

Визуализация: 5–6 сегментов (по уровням), заполненных до текущего.  
Цветовая шкала: зелёный (легко) → красный (сложно).

### 6.3 Применить в WordCard и SentenceCard

---

## Фаза 7: AI Overview — SSE Streaming

> ВКР упоминает SSE streaming для AI-обзора.

### 7.1 Обновить api-роут

**Файл:** `src/app/api/ai-overview/route.ts`

```ts
export async function POST(request: Request) {
  // ... validate input ...
  const stream = await fetch(openrouterUrl, {
    body: JSON.stringify({ ...payload, stream: true }),
    // ...
  });
  return new Response(stream.body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

### 7.2 Обновить клиент

**Файл:** `src/features/Sentence/api/fetchAIOverview.ts`

Использовать `ReadableStream` / `EventSource` для чтения SSE:

```ts
export async function fetchAIOverview(
  sentence: string,
  tokens: SentenceToken[],
  onChunk: (chunk: string) => void,
): Promise<void> {
  const response = await fetch('/api/ai-overview', { method: 'POST', ... });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }
}
```

### 7.3 Обновить AIOverviewAccordion

Хранить `overview` как растущую строку, обновлять по каждому chunk'у.

---

## Фаза 8: Личный словарь (saved_words)

> ФТ-6, ФТ-8 ВКР

### 8.1 BFF-роуты

```
src/app/api/dictionary/
├── route.ts          # GET (список) + POST (добавить)
└── [id]/route.ts     # DELETE
```

Запросы идут в PostgreSQL через FastAPI или напрямую (через Prisma если не FastAPI).

### 8.2 Расширить тип WordEntry статусом освоения

**Файл:** `src/shared/api/types.ts`

```ts
export type MasteryStatus = 'new' | 'learning' | 'known';

export type SavedWord = WordEntry & {
  savedAt: string;
  status: MasteryStatus;
};
```

### 8.3 Effector store

**Создать:** `src/features/Dictionary/model/index.ts`

```ts
export const $savedWords = createStore<SavedWord[]>([]);
export const addWordFx = createEffect(async (word: WordEntry) => { ... });
export const removeWordFx = createEffect(async (id: string) => { ... });
export const loadDictionaryFx = createEffect(async () => { ... });
export const updateStatusFx = createEffect(
  async ({ id, status }: { id: string; status: MasteryStatus }) => { ... }
);
```

### 8.4 UI

**Создать:** `src/features/Dictionary/DictionaryPanel.tsx`

- Кнопка "Сохранить слово" на WordCard
- Панель/страница со списком сохранённых слов
- Фильтрация по уровню JLPT (N5–N1) / HSK (1–6)
- Фильтрация по статусу освоения: `new` / `learning` / `known`
- Одним тапом обновлять статус прямо в списке
- Кнопка удаления записи

---

## Фаза 9: История поиска

> ФТ-7 ВКР

### 9.1 Effector store

**Создать:** `src/features/SearchHistory/model/index.ts`

```ts
export const $searchHistory = createStore<string[]>([]);
export const addToHistory = createEvent<string>();
$searchHistory.on(addToHistory, (state, query) =>
  [query, ...state.filter(q => q !== query)].slice(0, 20)
);
```

### 9.2 Сохранение в localStorage (и в БД если авторизован)

### 9.3 UI

Выпадающий список под поиском с последними запросами.  
- Клик по записи — повторяет поиск
- Кнопка удаления рядом с каждой записью
- Кнопка "Очистить историю" (используется также в Settings, фаза 14)

---

## Фаза 10: Аутентификация (JWT)

> ФТ-9 ВКР: JWT access (15 мин) + httpOnly refresh-cookie (7 дней).

### 10.1 BFF-роуты

```
src/app/api/auth/
├── login/route.ts     # POST → получить JWT от FastAPI
├── refresh/route.ts   # POST → обновить access token
└── logout/route.ts    # POST → очистить cookie
```

### 10.2 Middleware

**Файл:** `src/middleware.ts`

Защищать роуты `/api/dictionary/*`, `/api/history/*` — проверять Authorization header.

### 10.3 Effector store авторизации

**Создать:** `src/stores/auth.ts`

```ts
export const $isAuthenticated = createStore(false);
export const $user = createStore<{ id: string; email: string } | null>(null);
export const loginFx = createEffect(...);
export const logoutFx = createEffect(...);
```

### 10.4 UI

- Кнопка Login/Logout в шапке
- Модальная форма входа/регистрации

---

## Фаза 11: PWA

> ВКР: Lighthouse PWA 92/100 достигнут через next-pwa.

### 11.1 Установить next-pwa

```bash
npm install next-pwa
```

### 11.2 Настроить next.config.ts

```ts
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})({ /* next config */ });
```

### 11.3 Создать manifest.json

**Файл:** `public/manifest.json`

```json
{
  "name": "JapChin Dict",
  "short_name": "JapDict",
  "description": "Изучение японского и китайского языков",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a1a2e",
  "icons": [...]
}
```

### 11.4 Добавить в layout.tsx

```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#1a1a2e" />
```

---

## Фаза 12: PostgreSQL + Docker Compose

### 12.1 docker-compose.yml

**Создать:** `/docker-compose.yml`

```yaml
version: '3.9'
services:
  frontend:
    build: .
    ports: ["3000:3000"]
    environment:
      - BACKEND_URL=http://backend:8000
      - OPENROUTER_KEY=${OPENROUTER_KEY}
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/jpdict
    depends_on: [db]

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: jpdict
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/migrations:/docker-entrypoint-initdb.d

volumes:
  pgdata:
```

### 12.2 Схема БД (4 таблицы по ВКР)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE saved_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  language CHAR(2) NOT NULL,
  written TEXT NOT NULL,
  reading TEXT,
  definition TEXT,
  level TEXT,
  saved_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL,  -- kanji | word | sentence
  language CHAR(2) NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE kanji_cache (
  character TEXT PRIMARY KEY,
  language CHAR(2) NOT NULL,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX ON saved_words USING gin (written gin_trgm_ops);
CREATE INDEX ON search_history (user_id, searched_at DESC);
```

---

## Фаза 14: Настройки (Settings Screen)

> По IA-таблице раздел 1.1 ВКР — отдельный экран с тремя настройками.

### 14.1 Страница Settings

**Создать:** `src/app/settings/page.tsx`

### 14.2 Содержимое экрана

- **Language switcher** (JP ↔ CN) — вызывает `setSelectedLanguage` из `userProfile` store, аналогично LanguageSelect
- **Furigana toggle** (JP mode) / **Pinyin toggle** (CN mode) — булевый флаг в `userProfile`, используется в `FuriganaText` и `SentenceCard`
- **Кнопка "Очистить историю поиска"** — вызывает событие очистки из `$searchHistory` store (фаза 9)

### 14.3 Расширить userProfile store

**Файл:** `src/stores/userProfile.ts`

```ts
export type UserProfile = {
  language: Language;
  showFurigana: boolean;  // JP: показывать хирагану над кандзи
  showPinyin: boolean;    // CN: показывать пиньинь над иероглифами
};
```

Значение `showFurigana` / `showPinyin` передавать в `FuriganaText` — при `false` рендерить просто `<span>`.

---

## Фаза 15: Word Inspector (прогрессивное раскрытие)

> Раздел 2.4 ВКР: иерархическая панель с детальной информацией о слове.

### 15.1 Компонент WordInspector

**Создать:** `src/features/WordInspector/WordInspector.tsx`

Секции (раскрываются поочерёдно через аккордеон/анимацию):
1. **Перевод** — основное значение на русском (`definitions`)
2. **Грамматика** — часть речи, грамматическая форма, уровень JLPT/HSK
3. **Примеры предложений** — из API (Jisho `sentences_imply` или отдельный эндпоинт)
4. **Разбор по иероглифам** — список составных кандзи/ханьцзы, каждый кликабелен → открывает KanjiCard
5. **Кнопка "Добавить в словарь"** — вызывает `addWordFx` (фаза 8)

### 15.2 Интеграция

- Открывается при клике на токен в `SentenceCard` (вместо прямого показа WordCard)
- Открывается при переходе через context-adaptive routing на word-query

---

## Фаза 16: Stroke Order (порядок черт)

> Раздел 2.5 ВКР: статическая последовательность иллюстраций порядка черт в KanjiInspector.

### 16.1 Источник данных

Использовать CDN KanjiVG: `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/<codepoint>.svg`  
Codepoint = `char.codePointAt(0).toString(16).padStart(5, '0')`

### 16.2 Компонент StrokeOrder

**Создать:** `src/features/KanjiCard/ui/StrokeOrder.tsx`

- Загружает SVG из KanjiVG
- Отображает как статичный SVG (первая итерация — без анимации)
- Кешируется в `kanji_cache` (если БД доступна) или в `sessionStorage`

### 16.3 Добавить в KanjiCard

**Файл:** `src/features/KanjiCard/KanjiCard.tsx`

- Добавить секцию "Порядок черт" под примерами слов
- Показывать только если KanjiVG вернул SVG (graceful fallback: скрыть секцию)

---

## Фаза 13: Тесты (Vitest)

> ВКР требует ≥60% покрытие. Достигнуто 67%.

### 13.1 Unit-тесты

| Файл теста | Что тестировать |
|-----------|-----------------|
| `Search/utils.test.ts` | `classifySearchQuery` — 12 сценариев (ФТ-4) |
| `shared/utils/calculateDifficulty.test.ts` | медиана JLPT/HSK |
| `shared/utils/isJapaneseText.test.ts` | детектор японского |
| `stores/userProfile.test.ts` | события setSelectedLanguage, loadUserProfile |

### 13.2 Storybook — компоненты

Уже есть stories для WordCard и KanjiCard.  
Добавить:
- `SentenceCard.stories.tsx`
- `DifficultyMeter.stories.tsx`
- `FuriganaText.stories.tsx`

### 13.3 Интеграционные тесты

- `api/parse-sentence` → kuromoji токенизация
- `api/ai-overview` → mock OpenRouter

---

## Порядок выполнения (приоритеты)

| Приоритет | Задача | Сложность |
|-----------|--------|-----------|
| 🔴 P0 | Фаза 1 — Чистка и исправление багов (incl. 1.7, 1.8) | Низкая |
| 🔴 P0 | Фаза 2 — Собственные типы (убрать Renshuu) | Низкая |
| 🟠 P1 | Фаза 3 — Jisho API (реальные данные JP) | Средняя |
| 🟠 P1 | Фаза 5 — Furigana + pinyin как ruby над токенами | Низкая |
| 🟠 P1 | Фаза 6 — DifficultyMeter (JLPT/HSK) | Средняя |
| 🟠 P1 | Фаза 14 — Экран Settings | Низкая |
| 🟡 P2 | Фаза 15 — Word Inspector (прогрессивное раскрытие) | Средняя |
| 🟡 P2 | Фаза 7 — SSE streaming AI | Средняя |
| 🟡 P2 | Фаза 9 — История поиска (localStorage) | Низкая |
| 🟡 P2 | Фаза 13 — Тесты (Vitest) | Средняя |
| 🟢 P3 | Фаза 8 — Личный словарь (+ статусы освоения) | Высокая |
| 🟢 P3 | Фаза 16 — Stroke Order (KanjiVG) | Средняя |
| 🟢 P3 | Фаза 10 — JWT аутентификация | Высокая |
| 🟢 P3 | Фаза 11 — PWA (next-pwa) | Низкая |
| 🟢 P3 | Фаза 4 — FastAPI NLP backend | Очень высокая |
| 🔵 P4 | Фаза 12 — Docker Compose | Средняя |

---

## Немедленные исправления (можно сделать прямо сейчас)

Эти изменения не требуют новых зависимостей и исправляют явные баги:

1. `app/api/ai-overview/route.ts` — `NEXT_PUBLIC_GPT_KEY` → `OPENROUTER_KEY`
2. `app/layout.tsx` — обновить title, description, lang; добавить Client Component для `data-lang` на `<html>`
3. `app/styles/globals.css` — добавить CSS-переключение шрифтов через `data-lang` (фаза 1.7)
4. `KanjiCard.tsx` — удалить закомментированный JSX
5. `Sentence/model/index.ts` — убрать дублирующий тип SentenceToken
6. `Search/Search.tsx` — debounce 350ms → 300ms
7. `shared/api/fetchData.ts` — добавить комментарий что это legacy и заменить в фазе 3

> ✅ Уже сделано: `stores/userProfile.ts` использует `.updates.watch`
