# Line chart (Fintra)

Small financial sparklines in the market table, drawn with **plain JavaScript + SVG** (no chart library). Hovering a point opens a **larger tooltip chart** with that point’s value.

## Files

| File | What it does |
|---|---|
| `src/component/chart/sparkPath.js` | Geometry: prices → x/y, SVG line + area, nearest index |
| `src/component/chart/LineChartSmall.jsx` | Tiny chart in the Price column |
| `src/component/common/HoverchartData.jsx` | Big tooltip (portal to `document.body`) |
| `src/data/demoTable.json` | Sample `prices[]` per stock |

```
mouse on sparkline
        │
        ▼
LineChartSmall  ── nearestIndex(clientX) ──► hover { index, x, y }
        │
        ▼
HoverchartData  ── sparkLayout(data, 280×128) ──► marker + price + Δ
```

---

## Data shape

Each row needs a number array (oldest → newest):

```json
{
  "tradingCode": "GP",
  "ltp": 318.4,
  "changePercent": 1.24,
  "prices": [311.1, 313.13, 316.52, 318.4]
}
```

`LineChartSmall` only needs `data={row.prices}`. Optional `tone` and `title` (shown in the tooltip).

---

## How the path is built (`sparkPath.js`)

### 1. Scale prices into the box

For chart size `width × height` and padding `padX`, `padY`:

- `min` / `max` from the series (`range` is at least `1` so a flat line still draws)
- Point `i` of `n`:

```
x = padX + (i / (n - 1)) * (width - 2 * padX)
y = height - padY - ((price - min) / range) * (height - 2 * padY)
```

SVG y grows **down**, so high prices sit near the top.

### 2. Line and fill

- **Line:** `M x y L x y L x y …`
- **Area:** same line, then drop to the bottom corners and close (`Z`) so the mountain can be filled

### 3. Color tone

`resolveTone(points, tone)`:

| Tone | When | Class |
|---|---|---|
| `up` | last &gt; first (or passed in) | `text-success` |
| `down` | last &lt; first | `text-error` |
| `flat` | equal | `text-muted-soft` |

Fill and stroke use `currentColor`, so they follow the mood tokens (`#B7FF64` up in dark, `#FF2C2C` down).

### 4. Which point is under the cursor

```
ratio = (mouseX - chartLeft) / chartWidth
index = round(ratio * (count - 1))   // clamped 0 … n-1
```

Moving left/right changes `index`; the tooltip shows that point only.

---

## Small chart (`LineChartSmall.jsx`)

Default size **96 × 36**.

On `mousemove`:

1. Read the wrapper’s `getBoundingClientRect()`
2. Store `{ index, x: clientX, y: clientY }`
3. Draw a small circle on that vertex
4. Render `HoverchartData`

On `mouseleave`, hover is cleared and the tooltip unmounts.

```jsx
<LineChartSmall
  data={row.prices}
  tone="up"                 // or omit to infer from first/last
  title={row.tradingCode}
  width={96}
  height={36}
/>
```

The table cell is `overflow` clipped, so the tooltip **cannot** live inside the `<td>`. It is portaled to `document.body` and `position: fixed` next to the cursor.

---

## Hover tooltip (`HoverchartData.jsx`)

| Prop | Meaning |
|---|---|
| `open` | Show / hide |
| `x`, `y` | Cursor (viewport) |
| `data` | Same `prices[]` |
| `index` | Active point |
| `tone` | `up` / `down` / `flat` |
| `title` | e.g. trading code |

Big chart: **280 × 128**, extra padding so the marker is not clipped.

Shown for the active index:

- Price (`formatDecimal` + Indian/international preference)
- Change vs **previous** point (`+` / −)
- Point `n / total`
- Vertical guide + hollow circle on the line
- Series min–max in the footer

`pointer-events: none` so the tooltip never steals the mouse. Position flips if it would leave the viewport.

---

## Colors on the chart

| State | Token | Typical dark hex |
|---|---|---|
| Up / gainer | `success` | `#B7FF64` |
| Down / loser | `error` | `#FF2C2C` |
| Unchanged | `muted-soft` | `#A3ABAB` |
| Tooltip surface | `surface` | `#182A2A` |

Gradient fill: `currentColor` at 45% opacity at the top, ~4% at the bottom.

---

## Why not a chart library

- One series, no axes, no zoom
- Must stay tiny in a table cell
- Hover must map 1:1 to an array index
- Styling must use Fintra mood CSS variables

SVG paths from `sparkLayout` are enough.

---

## Extend later

| Idea | Where |
|---|---|
| Dates on the X axis | Pass `labels[]` into `HoverchartData`, show `labels[index]` |
| Volume overlay | Second path in the tooltip SVG |
| Touch | `onPointerMove` / `onPointerLeave` on `LineChartSmall` |
| Different size | `width` / `height` on `LineChartSmall`; tooltip size constants in `HoverchartData` |

Project colors, tables, and other UI: **[PROJECT.md](./PROJECT.md)**.
