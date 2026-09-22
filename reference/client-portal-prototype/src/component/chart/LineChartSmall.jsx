import { useId, useMemo, useState } from "react";
import HoverchartData from "../common/HoverchartData";
import { nearestIndex, resolveTone, sparkLayout, toneClass } from "./sparkPath";

export default function LineChartSmall({
  data = [],
  tone,
  title,
  width = 96,
  height = 36,
  className = "",
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `spark-fill-${uid}`;
  const direction = resolveTone(data, tone);
  const [hover, setHover] = useState(null);
  const layout = useMemo(
    () => sparkLayout(data, width, height, 1, 2),
    [data, width, height],
  );

  if (!layout.line) return null;

  const active = hover ? layout.coords[hover.index] : null;

  return (
    <div
      className={`relative inline-flex cursor-crosshair ${className}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setHover({
          index: nearestIndex(event.clientX, rect, data.length),
          x: event.clientX,
          y: event.clientY,
        });
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className={`overflow-visible ${toneClass[direction] || toneClass.flat}`}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <path d={layout.area} fill={`url(#${fillId})`} />
        <path
          d={layout.line}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {active ? (
          <circle
            cx={active.x}
            cy={active.y}
            r="2.4"
            fill="currentColor"
            stroke="var(--color-surface)"
            strokeWidth="1"
          />
        ) : null}
      </svg>

      <HoverchartData
        open={Boolean(hover)}
        x={hover?.x}
        y={hover?.y}
        data={data}
        index={hover?.index ?? 0}
        tone={direction}
        title={title}
      />
    </div>
  );
}
