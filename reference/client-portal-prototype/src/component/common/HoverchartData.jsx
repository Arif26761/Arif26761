import { useId, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../context/languageContext";
import { usePref } from "../../context/prefContext";
import { formatDecimal } from "../../utils/formatNumber";
import { sparkLayout, toneClass } from "../chart/sparkPath";
import Typography from "./Text";

const CHART_W = 280;
const CHART_H = 128;
const TOOLTIP_W = 312;

function tooltipPosition(x, y) {
    const offset = 18;
    const height = 230;
    let left = x + offset;
    let top = y - height - 8;

    if (left + TOOLTIP_W > window.innerWidth - 12) {
        left = x - TOOLTIP_W - offset;
    }
    if (left < 12) left = 12;
    if (top < 12) top = y + offset;
    if (top + height > window.innerHeight - 12) {
        top = Math.max(12, window.innerHeight - height - 12);
    }

    return { left, top };
}

export default function HoverchartData({
    open,
    x = 0,
    y = 0,
    data = [],
    index = 0,
    tone = "flat",
    title,
}) {
    const uid = useId().replace(/:/g, "");
    const fillId = `hover-fill-${uid}`;
    const { t } = useLanguage();
    const { numberFormat } = usePref();
    const layout = useMemo(
        () => sparkLayout(data, CHART_W, CHART_H, 10, 14),
        [data],
    );

    if (!open || !data.length) return null;

    const safeIndex = Math.max(0, Math.min(index, data.length - 1));
    const active = layout.coords[safeIndex];
    const value = data[safeIndex];
    const previous = safeIndex > 0 ? data[safeIndex - 1] : value;
    const delta = value - previous;
    const deltaTone =
        delta > 0 ? "text-success" : delta < 0 ? "text-error" : "text-muted-soft";
    const position = tooltipPosition(x, y);

    return createPortal(
        <div
            className="pointer-events-none fixed z-50"
            style={{ left: position.left, top: position.top, width: TOOLTIP_W }}
        >
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-2xl shadow-ink/30">
                <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                        <Typography variant="h5">{title || t("table.price")}</Typography>
                        <Typography variant="caption">
                            {t("table.hoverPoint")} {safeIndex + 1}/{data.length}
                        </Typography>
                    </div>
                    <div className="text-right">
                        <Typography variant="h5" className={toneClass[tone]}>
                            {formatDecimal(value, numberFormat)}
                        </Typography>
                        <span className={`text-xs font-semibold ${deltaTone}`}>
                            {delta > 0 ? "+" : ""}
                            {formatDecimal(delta, numberFormat)}
                        </span>
                    </div>
                </div>

                <svg
                    viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                    width="100%"
                    height={CHART_H}
                    className={`overflow-visible ${toneClass[tone] || toneClass.flat}`}
                >
                    <defs>
                        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.04" />
                        </linearGradient>
                    </defs>
                    <path d={layout.area} fill={`url(#${fillId})`} />
                    <path
                        d={layout.line}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                    {active ? (
                        <>
                            <line
                                x1={active.x}
                                x2={active.x}
                                y1="8"
                                y2={CHART_H - 4}
                                stroke="currentColor"
                                strokeOpacity="0.35"
                                strokeWidth="1"
                            />
                            <circle
                                cx={active.x}
                                cy={active.y}
                                r="4.5"
                                fill="var(--color-surface)"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </>
                    ) : null}
                </svg>

                <div className="mt-2 flex justify-between text-[11px] text-muted-soft">
                    <span>
                        {t("table.ltp")}: {formatDecimal(layout.min, numberFormat)} –{" "}
                        {formatDecimal(layout.max, numberFormat)}
                    </span>
                    <span>{t("table.hoverMove")}</span>
                </div>
            </div>
        </div>,
        document.body,
    );
}
