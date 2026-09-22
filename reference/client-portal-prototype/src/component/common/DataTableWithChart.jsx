import { useMemo, useState } from "react";
import demoTable from "../../data/demoTable.json";
import { useLanguage } from "../../context/languageContext";
import { usePref } from "../../context/prefContext";
import { formatDecimal } from "../../utils/formatNumber";
import LineChartSmall from "../chart/LineChartSmall";
import BasicDataTabale from "./BasicDataTabale";

function trendTone(changePercent) {
  if (changePercent > 0) return "up";
  if (changePercent < 0) return "down";
  return "flat";
}

function TrashIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path d="M4 7h16M9 7V5h6v2M8 7l.8 12h6.4L16 7" />
    </svg>
  );
}

export default function DataTableWithChart({
  data,
  filter = true,
  pagination = true,
  pageSize = 10,
}) {
  const { t } = useLanguage();
  const { numberFormat } = usePref();
  const [rows, setRows] = useState(() => data ?? demoTable.rows ?? []);

  const filters = useMemo(
    () => [
      {
        key: "trend",
        label: t("table.trend"),
        options: [
          { value: "", label: t("table.all") },
          { value: "up", label: t("table.gainers") },
          { value: "down", label: t("table.losers") },
          { value: "flat", label: t("table.unchanged") },
        ],
      },
    ],
    [t],
  );

  const columns = useMemo(
    () => [
      {
        key: "tradingCode",
        header: t("table.tradingCode"),
        render: (row) => (
          <span className="font-semibold tracking-wide text-ink">{row.tradingCode}</span>
        ),
      },
      {
        key: "ltp",
        header: t("table.ltp"),
        render: (row) => (
          <span
            className={`font-semibold ${
              row.changePercent > 0
                ? "text-success"
                : row.changePercent < 0
                  ? "text-error"
                  : "text-muted-soft"
            }`}
          >
            {formatDecimal(row.ltp, numberFormat)}
          </span>
        ),
      },
      {
        key: "changePercent",
        header: t("table.change"),
        render: (row) => (
          <span className="text-ink-secondary">
            {formatDecimal(Math.abs(row.changePercent), numberFormat)}
          </span>
        ),
      },
      {
        key: "value",
        header: t("table.value"),
        render: (row) => (
          <span className="text-ink-secondary">
            {formatDecimal(row.value, numberFormat, { fractionDigits: 0 })}
          </span>
        ),
      },
      {
        key: "prices",
        header: t("table.price"),
        render: (row) => (
          <LineChartSmall
            data={row.prices}
            tone={trendTone(row.changePercent)}
            title={row.tradingCode}
          />
        ),
      },
      {
        key: "actions",
        header: t("table.actions"),
        render: (row) => (
          <button
            type="button"
            onClick={() =>
              setRows((prev) => prev.filter((item) => item.id !== row.id))
            }
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-error transition hover:opacity-80"
          >
            {t("table.remove")}
            <TrashIcon />
          </button>
        ),
      },
    ],
    [numberFormat, t],
  );

  return (
    <BasicDataTabale
      columns={columns}
      data={rows}
      filter={filter}
      pagination={pagination}
      pageSize={pageSize}
      searchKeys={["tradingCode"]}
      filters={filters}
      filterFn={(row, values) => {
        if (!values.trend) return true;
        return trendTone(row.changePercent) === values.trend;
      }}
    />
  );
}
