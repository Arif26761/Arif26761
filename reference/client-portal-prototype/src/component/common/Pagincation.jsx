function range(from, to) {
  const items = [];
  for (let page = from; page <= to; page += 1) items.push(page);
  return items;
}

export function getPageItems(current, total, siblingCount = 1) {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 5) return range(1, total);

  const left = Math.max(2, current - siblingCount);
  const right = Math.min(total - 1, current + siblingCount);
  const items = [1];

  if (left > 2) items.push("ellipsis-left");
  items.push(...range(left, right));
  if (right < total - 1) items.push("ellipsis-right");
  items.push(total);

  return items;
}

export default function Pagincation({
  page = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
}) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages, siblingCount);

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      {items.map((item) => {
        if (typeof item === "string") {
          return (
            <span
              key={item}
              className="grid h-9 min-w-9 place-items-center px-1 text-sm text-muted-soft"
            >
              ...
            </span>
          );
        }

        const active = item === page;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange?.(item)}
            aria-current={active ? "page" : undefined}
            className={`grid h-9 min-w-9 cursor-pointer place-items-center rounded-full px-2.5 text-sm font-semibold transition ${
              active
                ? "bg-brand text-on-brand"
                : "border border-border bg-surface text-ink hover:border-brand"
            }`}
          >
            {item}
          </button>
        );
      })}
    </nav>
  );
}
