# Fintra Client Portal

React + Vite client portal for Fintra. English and Bangla, light and dark mood, reusable UI, and a financial market table with sparklines.

## Stack

| Piece | Version / notes |
|---|---|
| React | 19 |
| Vite | 8 |
| Tailwind CSS | 4 (`@import "tailwindcss"`) |
| React Router | 7 |
| Axios | installed; fetch helper is in `src/api/client.js` |

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build
npm run preview
npm run lint
```

## Run providers

`src/App.jsx` wraps the app in this order:

1. `ThemeProvider` — light / dark (`localStorage`: `fintra-theme`)
2. `LanguageProvider` — `en` / `bn` (`fintra-lang`)
3. `PrefProvider` — text scale + number format
4. `ToastProvider`
5. `BrowserRouter` → `Dashboard` layout → `/` `HomePage`

## Folder map

```
src/
  api/client.js
  assets/fonts/          General Sans (EN) + Li Ador Noirrit (BN)
  component/
    chart/               LineChartSmall, sparkPath
    common/              shared UI
    home/Hero.jsx
  context/               theme, language, preferences
  data/                  en.js, bn.js, demoTable.json
  layout/Dashboard.jsx
  pages/ClientPortal/HomePage.jsx
  utils/                 formatNumber.js, responsive.js
  index.css              fonts + mood colors
  App.jsx
```

---

## Brand palette

Source hex values (edit these, then map tokens in `src/index.css`):

| Hex | Role |
|---|---|
| `#0D1818` | Dark page background, text on lime buttons |
| `#182A2A` | Dark card / surface |
| `#163A38` | Dark header / soft surface, light muted text |
| `#B7FF64` | Brand lime |
| `#FFFFFF` | Dark ink, light cards |
| `#EAEBF4` | Light page, dark secondary text |
| `#A3ABAB` | Muted gray |
| `#FF2C2C` | Error / down |

### Light mood (`:root`)

| Token | CSS variable | Value |
|---|---|---|
| Page | `--mood-page` | `#EAEBF4` |
| Surface | `--mood-surface` | `#FFFFFF` |
| Surface soft | `--mood-surface-soft` | `#EAEBF4` |
| Ink | `--mood-ink` | `#0D1818` |
| Ink secondary | `--mood-ink-secondary` | `#182A2A` |
| Muted | `--mood-muted` | `#163A38` |
| Muted soft | `--mood-muted-soft` | `#A3ABAB` |
| Border | `--mood-border` | `color-mix(#A3ABAB 35%, #FFFFFF)` |
| Brand | `--mood-brand` | `#B7FF64` |
| Brand hover | `--mood-brand-hover` | `color-mix(#B7FF64 72%, #163A38)` |
| Brand soft | `--mood-brand-soft` | `#163A38` |
| On brand | `--mood-on-brand` | `#0D1818` |
| Success | `--mood-success` | `#163A38` |
| Error | `--mood-error` | `#FF2C2C` |
| Warning | `--mood-warning` | `color-mix(#B7FF64 55%, #163A38)` |
| Info | `--mood-info` | `#163A38` |

### Dark mood (`.dark`)

| Token | CSS variable | Value |
|---|---|---|
| Page | `--mood-page` | `#0D1818` |
| Surface | `--mood-surface` | `#182A2A` |
| Surface soft | `--mood-surface-soft` | `#163A38` |
| Ink | `--mood-ink` | `#FFFFFF` |
| Ink secondary | `--mood-ink-secondary` | `#EAEBF4` |
| Muted | `--mood-muted` | `#A3ABAB` |
| Muted soft | `--mood-muted-soft` | `#A3ABAB` |
| Border | `--mood-border` | `color-mix(#163A38 70%, #FFFFFF)` |
| Brand | `--mood-brand` | `#B7FF64` |
| Brand hover | `--mood-brand-hover` | `color-mix(#B7FF64 82%, #FFFFFF)` |
| Brand soft | `--mood-brand-soft` | `#B7FF64` |
| On brand | `--mood-on-brand` | `#0D1818` |
| Success | `--mood-success` | `#B7FF64` |
| Error | `--mood-error` | `#FF2C2C` |
| Warning | `--mood-warning` | `#B7FF64` |
| Info | `--mood-info` | `#EAEBF4` |

### Tailwind class names

`@theme` maps mood vars to utilities:

`bg-page`, `bg-surface`, `bg-surface-soft`, `text-ink`, `text-ink-secondary`, `text-muted`, `text-muted-soft`, `border-border`, `bg-brand`, `hover:bg-brand-hover`, `text-brand-soft`, `text-on-brand`, `text-success`, `text-error`, `text-warning`, `text-info`.

Change colors only in the Light / Dark blocks of `src/index.css`. Do not hardcode slate/violet in components.

---

## Fonts

| Language | Family | Files |
|---|---|---|
| English | General Sans | Light 300, Regular 400, Medium 500, Semibold 600, Bold 700 (`.otf`) |
| Bangla | Li Ador Noirrit | Light 300, Regular 400, SemiBold 600, Bold 700 (`.ttf`) |

- Default stack: `"General Sans", "Li Ador Noirrit", system-ui, sans-serif`
- `html[lang="bn"]` swaps to Li Ador first
- Text size preference scales `--type-scale` (0.75–1). **1 is the designed max** (current `text-*` sizes)

---

## Contexts

### Theme — `src/context/themeContext.jsx`

- `theme`: `"light"` \| `"dark"`
- `isDark`, `toggleTheme`, `setTheme`
- Adds `.dark` on `<html>`

### Language — `src/context/languageContext.jsx`

- `language`: `"en"` \| `"bn"`
- `t("nav.home")`, `toggleLanguage`, `dict`
- Copy lives in `src/data/en.js` and `src/data/bn.js`

### Preferences — `src/context/prefContext.jsx`

| Key | Default | Storage |
|---|---|---|
| `textScale` | `1` (max) | `fintra-text-scale` |
| `numberFormat` | `"indian"` | `fintra-number-format` |

Helpers: `setTextScale`, `resetTextScale`, `setNumberFormat`, `resetNumberFormat`.

Number formatting: `formatDecimal(value, numberFormat)` in `src/utils/formatNumber.js`

- Indian: `12,34,567.89` (`en-IN`)
- International: `1,234,567.89` (`en-US`)

---

## Common components

All under `src/component/common/` unless noted.

### `Text.jsx` — Typography

```jsx
<Typography variant="h2">Title</Typography>
<Typography as="span" variant="caption">Note</Typography>
```

Variants: `display`, `h1`–`h6`, `lead`, `subtitle`, `body`, `bodySm`, `caption`, `overline`, `label`.

### `Button.jsx`

| Prop | Values |
|---|---|
| `variant` | `solid` `outline` `ghost` `link` |
| `size` | `sm` `md` `lg` `icon` |
| `rounded` | `full` `xl` `lg` `md` `none` |
| `bordered` | boolean |
| `underline` | animated underline (text stays still) |
| `icon` / `iconLeft` / `iconRight` | component or node |
| `animate` | SVG / underline only |
| `to` / `href` | render as Link or `<a>` |

Exports: `ArrowRightIcon`, `ArrowLeftIcon`.

### `Animation.jsx`

Scroll-in presets: `fade`, `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`, `scale`, `pop`.  
Props: `type`, `delay`, `duration`, `once`, `as`.

### `Modal.jsx`

```jsx
<Modal open={open} onClose={close} title="Preferences">{children}</Modal>
```

Escape, overlay click, body scroll lock, portal.

### `Toaster.jsx`

`showToast(message, { type, title, duration })`  
Types: `success`, `error`, `warning`, `info`.

### Preferences UI

- `preference/DynamicPrefText.jsx` — volume-style text size (75%–100%)
- `preference/DynamicPrefNumber.jsx` — Indian / International toggle  
Opened from navbar **Aa**.

### `Navbar.jsx` / `Footer.jsx`

Sticky header: logo, nav, language flag toggle, preferences, theme, sign in.  
Footer: copyright + Privacy / Terms as link buttons.

### `PageFilter.jsx`

Optional search, select filters, rows-per-page. Used by the data table when `filter` / `pagination` is on.

### `Pagincation.jsx`

Pages look like `1 2 3 ... last`. Window follows the current page (`getPageItems`). Hidden when `totalPages <= 1`.

### `BasicDataTabale.jsx`

Generic table.

```jsx
<BasicDataTabale
  columns={[{ key, header, align, render }]}
  data={rows}
  rowKey="id"
  filter
  pagination
  pageSize={10}
  searchKeys={["tradingCode"]}
  filters={[{ key, label, options }]}
  filterFn={(row, values) => true}
/>
```

Striped rows: even `bg-page`, odd `bg-surface`, header `bg-surface-soft`.

### `DataTableWithChart.jsx`

Market watch table on `BasicDataTabale`: Trading Code, LTP, Change %, Value, Price sparkline, Remove.  
Data: `src/data/demoTable.json`. LTP / sparkline: lime up, red down, gray flat. Amounts follow number-format preference.

### `HoverchartData.jsx`

Portal tooltip with a larger chart and the hovered point’s price. See [LINE_CHART.md](./LINE_CHART.md).

---

## Chart

| File | Role |
|---|---|
| `component/chart/sparkPath.js` | Map prices → SVG path, nearest point |
| `component/chart/LineChartSmall.jsx` | Table sparkline + hover |
| `component/common/HoverchartData.jsx` | Big tooltip chart |

Pure SVG / JS. No Chart.js or similar. Full write-up: **[LINE_CHART.md](./LINE_CHART.md)**.

---

## Layout and pages

- `layout/Dashboard.jsx` — navbar + `<Outlet />` + footer
- `pages/ClientPortal/HomePage.jsx` — hero, feature cards, market table
- `component/home/Hero.jsx` — headline + CTAs
- `utils/responsive.js` — `containerClass`, `useBreakpoint()` (`isMobile` &lt; 768)

## API helper

`src/api/client.js` — `apiGet(path)` using `VITE_API_URL`.

## localStorage keys

| Key | Meaning |
|---|---|
| `fintra-theme` | `light` / `dark` |
| `fintra-lang` | `en` / `bn` |
| `fintra-text-scale` | `0.75`–`1` |
| `fintra-number-format` | `indian` / `international` |

## How to restyle later

1. Colors → Light / Dark blocks in `src/index.css`
2. Type size max → Tailwind `text-*` in `@theme` (already the ceiling)
3. Copy → `src/data/en.js` and `src/data/bn.js`
4. Table demo → `src/data/demoTable.json`
