import { useLanguage } from "../../context/languageContext";

export default function PageFilter({
  search = "",
  onSearch,
  searchPlaceholder,
  filters = [],
  values = {},
  onFilterChange,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
  showSearch = true,
  showPageSize = true,
}) {
  const { t } = useLanguage();
  const hasFilters = Boolean(filters.length);

  if (!showSearch && !hasFilters && !showPageSize) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {showSearch ? (
          <label className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <span className="sr-only">{searchPlaceholder || t("table.search")}</span>
            <input
              type="search"
              value={search}
              onChange={(event) => onSearch?.(event.target.value)}
              placeholder={searchPlaceholder || t("table.search")}
              className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm text-ink outline-none transition placeholder:text-muted-soft focus:border-brand"
            />
          </label>
        ) : null}

        {filters.map((filter) => (
          <label key={filter.key} className="flex items-center gap-2">
            {filter.label ? (
              <span className="text-xs font-medium text-muted">{filter.label}</span>
            ) : null}
            <select
              value={values[filter.key] ?? ""}
              onChange={(event) =>
                onFilterChange?.(filter.key, event.target.value)
              }
              className="h-10 min-w-[8.5rem] cursor-pointer rounded-full border border-border bg-surface px-3 text-sm text-ink outline-none transition focus:border-brand"
            >
              {(filter.options || []).map((option) => (
                <option key={String(option.value)} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {showPageSize ? (
        <label className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-muted">{t("table.rows")}</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
            className="h-10 cursor-pointer rounded-full border border-border bg-surface px-3 text-sm text-ink outline-none transition focus:border-brand"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
