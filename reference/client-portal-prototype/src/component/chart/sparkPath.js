export function sparkLayout(points, width, height, padX = 2, padY = 4) {
  if (!points?.length) {
    return { coords: [], line: "", area: "", min: 0, max: 0 };
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((point, index) => {
    const x =
      padX +
      (index / Math.max(points.length - 1, 1)) * (width - padX * 2);
    const y =
      height - padY - ((point - min) / range) * (height - padY * 2);
    return { x, y, value: point, index };
  });

  const line = coords
    .map((point, index) => `${index ? "L" : "M"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${line} L${last.x.toFixed(2)} ${height} L${first.x.toFixed(2)} ${height} Z`;

  return { coords, line, area, min, max };
}

export function nearestIndex(clientX, rect, count) {
  if (!count) return 0;
  const ratio = (clientX - rect.left) / Math.max(rect.width, 1);
  return Math.round(Math.max(0, Math.min(count - 1, ratio * (count - 1))));
}

export function resolveTone(points, tone) {
  if (tone) return tone;
  if (!points?.length) return "flat";
  const delta = points[points.length - 1] - points[0];
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export const toneClass = {
  up: "text-success",
  down: "text-error",
  flat: "text-muted-soft",
};
