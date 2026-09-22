import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../context/languageContext";
import PageFilter from "./PageFilter";
import Pagincation from "./Pagincation";

function defaultSearch(row, search, searchKeys) {
  if (!search) return true;
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const keys = searchKeys?.length ? searchKeys : Object.keys(row);
  return keys.some((key) => String(row[key] ?? "").toLowerCase().includes(query));
}

export default function BasicDataTabale({
  columns = [],
  data = [],
  rowKey = "id",
  filter = false,
  pagination = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchKeys,
  filters = [],
  filterFn,
  emptyText,
  className = "",
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = defaultSearch(row, search, searchKeys);
      const matchesExtra = filterFn
        ? filterFn(row, { search, ...filterValues })
        : true;
      return matchesSearch && matchesExtra;
    });
  }, [data, search, searchKeys, filterFn, filterValues]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, filterValues, data]);

  const pageRows = pagination
    ? filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
    : filtered;

  const onFilterChange = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {filter || pagination ? (
        <PageFilter
          search={search}
          onSearch={setSearch}
          filters={filter ? filters : []}
          values={filterValues}
          onFilterChange={onFilterChange}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={setPageSize}
          showSearch={filter}
          showPageSize={pagination}
        />
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-176 border-collapse text-left">
            <thead>
              <tr className="bg-surface-soft">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink sm:px-5 ${column.align === "right" ? "text-right" : ""
                      } ${column.align === "center" ? "text-center" : ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.length ? (
                pageRows.map((row, index) => (
                  <tr
                    key={row[rowKey] ?? index}
                    className={index % 2 === 0 ? "bg-page" : "bg-surface"}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3.5 text-sm sm:px-5 ${column.align === "right" ? "text-right" : ""
                          } ${column.align === "center" ? "text-center" : ""}`}
                      >
                        {column.render
                          ? column.render(row)
                          : (row[column.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="bg-page px-4 py-10 text-center text-sm text-muted"
                  >
                    {emptyText || t("table.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination ? (
        <Pagincation
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
