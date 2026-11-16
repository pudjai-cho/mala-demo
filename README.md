# 🍲 麻辣烫小店 — Malatang Little Shop

An interactive **Malatang POS & Mandarin learning game** built with Vue 3, TypeScript, Vite, and Tailwind CSS v4. Designed for Thai- and English-speaking students and teachers to practice **Mandarin food vocabulary, classifiers (measure words), Chinese numbers (Normal & Formal), listening comprehension, and checkout math** by acting as a Malatang shop employee taking customer orders.

---

## ✨ Features

### 1. Script, Numerals, Theme & Language Controls
- **Simplified & Traditional Chinese (`简体` / `繁體`)**: Switches all UI copy, ingredient names (e.g. `土豆` / `馬鈴薯`, `西兰花` / `青花菜`, `粉丝` / `冬粉`), Pinyin variants (`tǔdòu` / `mǎlíngshǔ`), and Chinese TTS locale (`zh-CN` / `zh-TW`), while each script toggle button also supports Pinyin, Thai, and English labels.
- **Chinese Numeral Styles (`小寫 · 一二三` vs `大寫 · 壹貳參`)**:
  - **Normal**: `零 一 二(两/兩) 三 四 五 六 七 八 九 十 百`
  - **Formal / Financial**: `零 壹 贰/貳 叁/參 肆 伍 陆/陸 柒 捌 玖 拾 佰`
  - Applied consistently across prices, quantities, round/score counters, calculator keys, totals, and difficulty labels—with no Arabic digits shown in the UI.
- **Global Helper Toggles (`+ Pinyin`, `+ ไทย`, `+ English`)**:
  - Adds tone-marked Pinyin (`Noto Sans` font stack for centered macrons) and/or Thai and English translations on separate lines underneath Chinese labels via `<LangLabel>`.
- **Light & Dark Theme (`useTheme.ts`)**:
  - Toggle between light and dark themes in `TopBar.vue`, persisted to `localStorage` via `mala-demo:v1:theme` and styled with `.dark` CSS tokens across all views.
- **Independent Order Ticket Languages (`點餐語言`)**:
  - The customer order cards have their own **`中文`**, **`+ Pinyin`**, **`+ ไทย`**, and **`+ English`** toggles (independent of the top bar). Students can hide Chinese on the customer's order and view only Thai, English, or Pinyin so they must recall the Chinese vocabulary when selecting items from the menu.

### 2. Picture / Text Recall Modes (`⇄ 切換圖/字` & `✨ 全部顯示`)
Cycle how the **Customer Order** and **Order Menu** display information:
- **`✨ 全部顯示` (Show All, default)**: Pictures and text shown in both areas.
- **`顧客文字 · 食材圖片` (Order Text · Menu Picture)**: Customer shows words only; menu shows pictures only.
- **`顧客圖片 · 食材文字` (Order Picture · Menu Text)**: Customer shows pictures only; menu shows words only.
- **`兩邊只看文字` (Text in Both)**: Pictures hidden in both areas for pure reading practice.

### 3. Order Modes, Grouping & Teacher Controls
- **Customer Header Controls (`CustomerTicket.vue`)**:
  - **Order Modes (`👀 看菜單` vs `👂 聽老師說`)**: Switch right beside the customer badge between visible order cards or hidden listening mode (with **`👁️ 偷看小抄` (Peek Note)** to toggle visibility).
  - **Teacher Sets Order (`👩‍🏫 老師出題`)**: Inline action button in the customer header opening the custom modal to hand-pick specific ingredients, quantities (1–9), and the starting order mode (`listening` or `reading`).
- **Grouped Top Bar Controls (`TopBar.vue`)**:
  - **Random by Difficulty**: Grouped card combining the difficulty selector (`簡單` 2–3, `中等` 3–4, `挑戰` 4–5 items) and `🎲 隨機點餐` button with a short multilingual hint.
  - **Checkout & Math Modes**: Grouped card with a short multilingual hint wrapping the 4 checkout/arithmetic practice modes.
- **Menu Grouping & Quick Decrement (`IngredientTray.vue`)**:
  - Toggle **`🗂️ 分類顯示`** between a flat menu grid or 4 color-coded category sections (`蔬菜`, `肉類`, `海鮮`, `豆蛋麵`) in a compact 3-row desktop layout.
  - Selected menu cards display an inline `[ − | count ]` badge in the top-right corner so quantities can be subtracted directly on the menu as well as in the Customer Order panel.

### 4. Four Checkout / Number-Reading Modes
1. **`🔊 免結帳` (No Math)**: Skips the keypad after clicking Serve and grades purely on order accuracy while showing the auto-calculated Chinese total reading card.
2. **`🔢 按總價數字` (Press Total Number)**: Shows the total **only in Chinese characters** (e.g. `“一共 貳拾參元”`, hiding Pinyin until submitted) so students practice reading Chinese numbers on the keypad without doing arithmetic.
3. **`➕ 算帳 (含小計)` (Math With Subtotals, default)**: Displays line subtotals (`捌元 × 兩 = 拾陸元`) for addition practice.
4. **`✖️ 自己乘算` (Multiply & Add)**: Hides line subtotals so students multiply `price × quantity` and add totals themselves.

### 5. Speech (TTS) & Sound Effects
- **Web Speech API TTS**:
  - Read full customer orders in **Chinese (`zh-CN` / `zh-TW`)**, **Thai (`th-TH`)**, or **English (`en-US`)** using natural Chinese classifiers (e.g. `兩棵白菜`, `一隻蝦`).
  - Voice selector dropdown for installed Chinese voices (prioritizing Microsoft Natural/Online and Google voices), plus a dismissible warning banner (`TtsWarningBanner.vue`) if no Chinese TTS voice is available.
  - Optional click-to-speak (`🔊 / 🔇`) on menu items, dedicated `🔊` speaker button per card, clickable Chinese price pills (`兩元`), clickable quantity+classifier badges (`一棵`), and spoken Chinese digits when pressing calculator keys.
- **Web Audio API Chimes**: Synthesized success, partial-match, and try-again feedback tones (`sfx.ts`) with zero external audio assets.

---

## 🥬 Menu Vocabulary & Classifiers

| Category | Simplified | Traditional | Pinyin | Classifier | Thai | English | Price |
|---|---|---|---|---|---|---|---|
| **蔬菜** (`veggie`) | 白菜 | 白菜 | `báicài` | `棵` (`kē`) | ผักกาดขาว | Napa Cabbage | 2 元 |
| **蔬菜** (`veggie`) | 玉米 | 玉米 | `yùmǐ` | `根` (`gēn`) | ข้าวโพด | Corn | 3 元 |
| **蔬菜** (`veggie`) | 土豆 | 馬鈴薯 | `tǔdòu` / `mǎlíngshǔ` | `个/個` (`gè`) | มันฝรั่ง | Potato | 2 元 |
| **蔬菜** (`veggie`) | 香菇 | 香菇 | `xiānggū` | `朵` (`duǒ`) | เห็ดหอม | Shiitake | 4 元 |
| **蔬菜** (`veggie`) | 西兰花 | 青花菜 | `xīlánhuā` / `qīnghuācài` | `朵` (`duǒ`) | บรอกโคลี | Broccoli | 3 元 |
| **蔬菜** (`veggie`) | 莲藕 | 蓮藕 | `lián’ǒu` | `片` (`piàn`) | รากบัว | Lotus Root | 4 元 |
| **肉類** (`meat`) | 牛肉 | 牛肉 | `niúròu` | `份` (`fèn`) | เนื้อวัว | Beef | 8 元 |
| **肉類** (`meat`) | 猪肉 | 豬肉 | `zhūròu` | `份` (`fèn`) | เนื้อหมู | Pork | 6 元 |
| **肉類** (`meat`) | 鸡肉 | 雞肉 | `jīròu` | `份` (`fèn`) | เนื้อไก่ | Chicken | 5 元 |
| **肉類** (`meat`) | 火腿 | 火腿 | `huǒtuǐ` | `片` (`piàn`) | แฮม/ไส้กรอก | Ham | 4 元 |
| **海鮮** (`seafood`) | 虾 | 蝦 | `xiā` | `只/隻` (`zhī`) | กุ้ง | Shrimp | 9 元 |
| **海鮮** (`seafood`) | 鱼丸 | 魚丸 | `yúwán` | `颗/顆` (`kē`) | ลูกชิ้นปลา | Fish Ball | 4 元 |
| **豆蛋麵** (`tofu_noodle`) | 豆腐 | 豆腐 | `dòufu` | `块/塊` (`kuài`) | เต้าหู้ | Tofu | 3 元 |
| **豆蛋麵** (`tofu_noodle`) | 鸡蛋 | 雞蛋 | `jīdàn` | `个/個` (`gè`) | ไข่ไก่ | Egg | 2 元 |
| **豆蛋麵** (`tofu_noodle`) | 粉丝 | 冬粉 | `fěnsī` / `dōngfěn` | `把` (`bǎ`) | วุ้นเส้น | Glass Noodles | 3 元 |
| **豆蛋麵** (`tofu_noodle`) | 年糕 | 年糕 | `niángāo` | `块/塊` (`kuài`) | ต็อก/เค้กข้าว | Rice Cake | 5 元 |

---

## ⌨️ Keyboard Shortcuts

- **Checkout Keypad (`CheckoutView.vue`)**:
  - `0`–`9`: Enter digit (speaks digit in Chinese)
  - `Backspace`: Delete last digit
  - `Escape`: Clear entered digits
  - `Enter`: Submit payment (when a number is entered)
- **Teacher Custom Question Modal (`TeacherOrderModal.vue`)**:
  - `Escape`: Close modal

---

## 🛠️ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (`^3.5.13`) with `<script setup lang="ts">`
- **Language**: [TypeScript](https://www.typescriptlang.org/) (`~5.7.2`) + `vue-tsc` (`^2.2.0`)
- **Bundler**: [Vite](https://vite.dev/) (`^6.2.0`)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`^4.3.5` via `@tailwindcss/vite`)
- **Fonts**: Google Fonts (`Noto Sans`, `Noto Sans Thai`, `Noto Sans SC`)
- **Package Manager**: `pnpm` (pinned to `pnpm@12.5.1` via `packageManager`)

---

## 📁 Project Structure

```text
src/
├── App.vue                           # Main stage coordinator & layout
├── main.ts                           # App bootstrap
├── style.css                         # Tailwind v4 theme tokens & animations
├── types/
│   └── game.ts                       # Shared TypeScript interfaces & mode unions
├── data/
│   ├── ingredients.ts                # Categories, 16 ingredients, personas, DRY grouping helpers
│   └── uiText.ts                     # Simplified, Traditional, Pinyin, Thai, English UI dictionary
├── composables/
│   ├── useI18n.ts                    # Script, number style, language toggles & formatting helpers
│   ├── useMalaGame.ts                # Core game state, scoring, order generation & TTS triggers
│   ├── usePersistedRef.ts            # Validated localStorage-backed reactive refs
│   └── useTheme.ts                   # Light/dark theme state & root class toggling
├── utils/
│   ├── chineseNumbers.ts             # Normal & Formal Mandarin number/price/quantity converters
│   ├── speech.ts                     # Web Speech API wrapper & voice scoring
│   └── sfx.ts                        # Web Audio API feedback chimes
└── components/
    ├── TopBar.vue                    # Header, theme, language/script/numeral, random & checkout controls
    ├── TtsWarningBanner.vue          # Missing Chinese TTS voice alert
    ├── CustomerTicket.vue            # Customer persona, orderMode toggle, teacher modal trigger, TTS & order cards
    ├── IngredientTray.vue            # Interactive POS order menu with category grouping
    ├── MalaBowl.vue                  # Current customer order panel & serve trigger
    ├── CheckoutView.vue              # Receipt & Chinese-numeral keypad
    ├── ResultView.vue                # Order comparison, total verification & read-aloud card
    ├── TeacherOrderModal.vue         # Teacher custom round builder modal
    └── ui/
        ├── CategorySectionHeader.vue # Shared category header with dot, Hanzi, Pinyin & extras
        ├── IngredientLabels.vue      # Shared ingredient text stack with unit price
        ├── LangLabel.vue             # Shared Big Chinese + Pinyin + stacked Thai/English label
        └── QtyStepper.vue            # Chinese-numeral +/- quantity stepper
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/)

### Install & Run Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Type-check and build for production
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 🌐 Deployment

This is a static frontend app (no backend required). The production build outputs to `dist/`.

- **Cloudflare Workers Static Assets** (preconfigured via `wrangler.jsonc`):
  - **Build command:** `pnpm run build`
  - **Deploy command:** `npx wrangler deploy`
  - **Preview command:** `npx wrangler preview`
  - Serves `./dist` with `"not_found_handling": "single-page-application"`.
- **Vercel / Cloudflare Pages / Netlify**:
  - **Build command:** `pnpm run build`
  - **Output directory:** `dist`
- **GitHub Pages**:
  - Set `base: '/<your-repo-name>/'` in `vite.config.ts` before building if deploying to a repository subpath (`https://<user>.github.io/<repo>/`).

> **Browser TTS Tip (Windows):** Microsoft Edge includes built-in online Mandarin voices (`Xiaoxiao`, `HsiaoChen`) out of the box. In Google Chrome on Windows, install a Chinese Speech language pack under **Windows Settings → Time & language → Speech** if voices are silent.
