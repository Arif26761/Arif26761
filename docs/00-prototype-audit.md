# 00 — Prototype audit

Baseline read of `reference/client-portal-prototype/`, the Fintra client portal
written by the senior engineer. Everything below is measured against that tree,
which builds clean (`vite build`, 52 modules, 463 ms, 96.5 kB gzip JS).

This file is the record we rebuild *from*. It is not a list of things to copy.

---

## 1. What the prototype actually is

An **application**, not a design system. There is no package boundary, no
component workbench, no prop contracts, no versioning. The "system" is a set of
Tailwind utility strings duplicated across 17 component files, held together by
one good idea (the mood-token layer in `src/index.css`) and a lot of repetition.

That is a fine prototype and a poor foundation. The token layer is worth
inheriting almost verbatim. Almost nothing above it is.

| | |
|---|---|
| Stack | React 19.3, Vite 8.3, Tailwind 4.3, React Router 7 |
| Language | JavaScript, no types |
| Source | ~2,850 lines across 37 files |
| Components | 17 |
| Routes | 1 (`/`), three nav links all point at it |
| Tests | none |
| Workbench | none |
| Styling | template-literal class concatenation, no `clsx` / `cva` / `tailwind-merge` |

`axios` is a declared dependency and is never imported; `src/api/client.js` uses
`fetch`.

---

## 2. Architecture

```
main.jsx
  └ App.jsx                       provider stack, 5 deep
      ThemeProvider               .dark on <html>          localStorage fintra-theme
      └ LanguageProvider          lang on <html>           localStorage fintra-lang
          └ PrefProvider          --type-scale on <html>   localStorage fintra-text-scale
          │                                                localStorage fintra-number-format
              └ ToastProvider     portal-less fixed stack
                  └ BrowserRouter
                      └ Dashboard (layout)   Navbar + <Outlet/> + Footer
                          └ HomePage         Hero + feature cards + DataTableWithChart
```

Every provider writes to `document.documentElement` and reads `localStorage`
during `useState` initialisation — unguarded, so the whole tree is
client-render-only. Acceptable for a Vite SPA, fatal the day this moves to
Next.js. Worth fixing on the rebuild regardless: the guard costs three lines.

### Dependency graph of the component layer

```
Text.jsx  ──────────────────────────────────┐   (leaf, depends on nothing)
                                            │
Button.jsx ── react-router Link             │
                                            ├──> Modal.jsx
sparkPath.js (leaf, pure geometry)          │       └─> Navbar.jsx
    ├─> LineChartSmall.jsx ──┐              │            ├─ DynamicPrefText
    └─> HoverchartData.jsx <─┘              │            └─ DynamicPrefNumber
              (circular import pair)        │
                                            └──> Toaster.jsx
PageFilter.jsx  ──┐
Pagincation.jsx ──┴─> BasicDataTabale.jsx ─> DataTableWithChart.jsx
```

Note the cycle: `LineChartSmall` imports `HoverchartData`, which sits in
`component/common/` and imports back into `component/chart/sparkPath.js`. It
resolves, but the tooltip is a chart concern living in the shared-UI folder. On
the rebuild both belong in the chart module, with the tooltip taking geometry as
a prop instead of recomputing it.

### Token layer — `src/index.css`

The one genuinely good piece of engineering. Two indirections:

```
:root / .dark   defines  --mood-*          ← the only place hex values live
@theme          maps     --color-x: var(--mood-x)
Tailwind        emits    bg-x, text-x, border-x
```

Re-theming is a 16-line edit in one file and nothing else moves. Keep this
pattern exactly.

The type scale is also correct, and I expected it not to be. `@theme` overrides
`--text-xs … --text-6xl` with `calc(<rem> * var(--type-scale, 1))`, and
`PrefProvider` writes `--type-scale` on `<html>`. Because Tailwind 4 ships its
line-heights as **unitless ratios** (`--text-base--line-height: calc(1.5 / 1)`),
they scale with the font-size automatically. Verified in the compiled CSS.
Vertical rhythm survives at every scale step.

---

## 3. Defects

Ordered by consequence. Everything here was confirmed against the source or by
execution, not inferred.

### 3.1 Light mode is not accessible — measured

WCAG AA contrast, computed from the token values in `src/index.css`:

| Usage | Light | Dark |
|---|---|---|
| `caption` / `Button variant="link"` / placeholder | **1.97 – 2.34:1 FAIL** | 6.39 – 7.73:1 pass |
| `text-error` — loser LTP, Remove action | **3.72:1 FAIL** | 4.02:1 large-text only |
| `text-brand` — nav link hover, link-button hover | **1.20:1 FAIL** | 12.47:1 pass |
| body / heading ink | 10.4 – 18.1:1 pass | 12.6 – 18.1:1 pass |

The footer's Privacy and Terms links, every `caption`, the search placeholder
and the pagination ellipsis are effectively invisible in light mode. Hovering a
navbar link in light mode fades it to 1.20:1 — the text disappears under the
cursor. `Navbar.jsx:108`, `Button.jsx:23`.

The design was drawn dark-first and the light values were filled in afterwards
without ever being measured.

### 3.2 Token collisions flatten meaning

Distinct token names resolve to identical values, so information encoded in
colour is lost:

**Light** — `muted` = `brand-soft` = `success` = `info` = `#163A38`.
A gainer's LTP renders in exactly the same colour as ordinary body text. The
up/down signal in the market table survives only for losers.
Also `page` = `surface-soft` = `#EAEBF4`, so the table header is the same colour
as its even rows and the header stops reading as a header.

**Dark** — `brand` = `brand-soft` = `success` = `warning` = `#B7FF64`, and
`muted` = `muted-soft` = `#A3ABAB`. A warning toast and a success toast are the
same colour.

A token that can never differ from another token is not a token. Each of these
needs either a distinct value or deletion.

### 3.3 First-time visitors get 75% text, not 100%

`src/context/prefContext.jsx:17-20`

```js
const saved = Number(localStorage.getItem("fintra-text-scale"));
return clampScale(Number.isNaN(saved) ? TEXT_SCALE_MAX : saved);
```

`localStorage.getItem` returns `null` when the key is absent. `Number(null)` is
`0`, not `NaN`, so the `Number.isNaN` guard never fires, and `clampScale(0)`
floors to `TEXT_SCALE_MIN`. Verified by execution.

Every new visitor sees the entire UI at 75%. `doc/PROJECT.md` documents the
default as `1`. Read the raw string and check for `null` before coercing.

### 3.4 Toasts crash on any non-localhost origin

`src/component/common/Toaster.jsx:146` calls `crypto.randomUUID()`, which is
only defined in a **secure context**. Vite's dev server on a LAN address —
`http://192.168.x.x:5173` — is not one, so `crypto.randomUUID` is `undefined`
and every `showToast` throws.

This breaks the moment the app is opened from another machine on the network,
which is exactly how KitCat is used. A monotonic counter or a `Date.now()`
fallback removes the dependency entirely; IDs here are local and never
persisted.

### 3.5 `Typography` cannot be recoloured

`src/component/common/Text.jsx` bakes a colour into every variant
(`body` → `text-muted`, `h1` → `text-ink`). Passing `className="text-error"`
appends a second colour class; nothing removes the first. Which one wins is
decided by Tailwind's output order, not by the caller.

There is no `tailwind-merge` anywhere in the project, so this applies to
**every** component: last-writer-wins is not in effect, source-order-wins is.
The prototype gets away with it only because no caller has tried yet.

Scale and colour must be separate axes. This is the flaw to fix first, because
every component we build sits on top of it.

### 3.6 Responsiveness is driven by JavaScript

`src/utils/responsive.js` exposes `useBreakpoint()` — a `resize` listener,
unthrottled, calling `setState` on every event. `Navbar.jsx:102` uses the result
to *conditionally render* the desktop nav.

Consequences: a re-render on every resize frame, a first paint at the hardcoded
1280 default before the effect runs, and the desktop nav absent from the DOM on
mobile rather than hidden. Tailwind's `sm:` / `lg:` variants do this in CSS at
zero cost. Keep `containerClass`; delete the hook.

### 3.7 `DataTableWithChart` ignores its own `data` prop after mount

`src/component/common/DataTableWithChart.jsx:38`

```js
const [rows, setRows] = useState(() => data ?? demoTable.rows ?? []);
```

Classic derived-state bug. The lazy initialiser reads `data` once. When a parent
eventually fetches real market data, the table keeps rendering the JSON fixture
forever. Today it is invisible because the only caller passes nothing.

Removals are local state; the source list is a prop. Those are two different
things and need to stay that way.

### 3.8 Accessibility gaps in the primitives

- **No `focus-visible` styling anywhere.** `Button`, `Pagincation`, `Modal`'s
  close, the language and number toggles, the text-scale bars — every one is a
  keyboard dead end. Only the `<input>`/`<select>` elements have a focus style.
- **`Modal` has no focus trap and no focus restore.** Tab leaves the dialog
  while `aria-modal="true"` claims it cannot.
- **`Modal`'s overlay is a full-screen `<button>`** (`Modal.jsx:33`), so the
  first thing a screen reader reaches inside the dialog is "Close dialog,
  button". Overlays should be a `<div>` with a click handler; the accessible
  close is the real close button plus Escape.
- **`Modal` hardcodes `id="fintra-modal-title"`** — two modals, duplicate IDs,
  `aria-labelledby` resolves to the wrong one. `useId()`.
- **Toasts are `role="status"` for all four tones** (`Toaster.jsx:105`); errors
  need `role="alert"`. The live region should be the container, not each item.
- **The table has no `scope="col"` and no `<caption>`.**
- **`Animation` ignores `prefers-reduced-motion`** and renders its children at
  `opacity: 0` until IntersectionObserver fires — so if the observer never runs
  (print, `content-visibility`, a failed hydration) the page is permanently
  blank.
- **`LineChartSmall` is mouse-only** — `onMouseMove` / `onMouseLeave`, no
  pointer or touch handling. The sparkline is inert on every phone and tablet.
  `doc/LINE_CHART.md` lists this as a "later" idea.

### 3.9 Smaller items

| Where | Item |
|---|---|
| `Toaster.jsx:78-85` | `setProgress` on every animation frame → ~60 full re-renders per second per toast, each one re-rendering two `Typography` subtrees. Belongs in a CSS animation or a ref write. |
| `Toaster.jsx:148` | `prev.slice(-3)` then append caps the stack at 4, not 3, and drops overflow without running cleanup. |
| `Toaster.jsx:128` vs `Modal.jsx:59` | Dismiss glyph is a lowercase `x` in one and `×` in the other. Both should be an icon. |
| `BasicDataTabale.jsx:48-50` | `data` in the effect's dependency array resets pagination to page 1 every time a row is removed. |
| `Pagincation.jsx:11-18` | The window does not widen at the edges, so the control is 4 slots wide on page 1, 7 in the middle, 4 at the end — it visibly jitters as you page through. Verified across 10 pages. |
| `Button.jsx:93` | An icon-only button silently discards an explicit `size`. Undocumented. |
| `Button.jsx:151-165` | `aria-disabled` on the `Link`/`<a>` branches with no click prevention — a "disabled" link still navigates, and `disabled:` variants do not apply to an `<a>`. |
| `DataTableWithChart.jsx:87` | The Change % column renders `Math.abs(...)` with no sign, no `%` and no tone. Gainers and losers are identical in that column. |
| `Navbar.jsx:13-14` | Flag images hot-linked from `flagcdn.com` — a third-party request on every page load of a banking portal, with no fallback. Inline SVG or a local asset. |
| `languageContext.jsx:36` | A missing key returns the key path silently. No dev warning, and no structural parity check between `en.js` and `bn.js`. |
| `themeContext.jsx` | Reads the OS preference once; never listens for changes to it. |
| `sparkPath.js:6-7` | `Math.min(...points)` — fine at 20 points, a stack overflow on a real intraday series. |
| Fonts | 584 kB shipped as `.otf` and `.ttf`, unsubset, unpreloaded. `.woff2` alone is roughly a 60% cut before subsetting. |
| Naming | `BasicDataTabale` and `Pagincation` are misspelled in filenames *and* exported identifiers. `component/` should be `components/`. |

---

## 4. What to carry forward

Keep, essentially as-is:

1. **The two-layer token indirection** — `--mood-*` → `--color-*` → utilities.
   The best thing in the codebase.
2. **`--type-scale` on `:root` multiplying the Tailwind type scale.** A whole
   accessibility feature for about twelve lines, and it composes correctly.
3. **Pure-SVG sparklines.** `sparkPath.js` is clean, pure, testable geometry and
   the reasoning in `doc/LINE_CHART.md` for not pulling in a chart library is
   sound for this use case.
4. **`html[lang="bn"]` swapping the font stack.** Correct mechanism, and it
   keeps language and typography in one place.
5. **The doc discipline.** `doc/PROJECT.md` is more thorough than most
   production repos manage. Match it.

Rebuild from scratch:

- Every component, on typed props with variants expressed as data, not as
  concatenated template literals.
- The colour ramp, measured for contrast in both moods before a single component
  consumes it.
- Responsiveness in CSS.
- Focus, keyboard and motion behaviour designed in, not retrofitted.

---

## 5. Open decisions

Blocking the rebuild plan:

1. **Package boundary** — publishable `packages/ui` consumed by an app, or
   app-local `src/components`? Decides everything about the build setup.
2. **TypeScript** — for a design system, component props *are* the public API.
   Strongly recommended.
3. **Headless primitives** — Radix/Base UI for the ~14 hard a11y behaviours
   (focus trap, roving tabindex, live regions), or hand-rolled? Hand-rolling is
   the better education and roughly three times the work.
4. **Fidelity** — match the senior's visual output exactly while fixing the
   defects underneath, or treat his design as a starting point?
