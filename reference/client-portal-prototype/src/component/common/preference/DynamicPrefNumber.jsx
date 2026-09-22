import Typography from "../Text";
import Button from "../Button";
import { useLanguage } from "../../../context/languageContext";
import { DEFAULT_NUMBER_FORMAT, usePref } from "../../../context/prefContext";
import { formatDecimal } from "../../../utils/formatNumber";

const SAMPLE = 1234567.89;

export default function DynamicPrefNumber() {
  const { t } = useLanguage();
  const { numberFormat, setNumberFormat, resetNumberFormat } = usePref();
  const isInternational = numberFormat === "international";

  return (
    <section className="mt-4 rounded-2xl border border-border bg-page/70 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <Typography variant="label">{t("pref.numberFormat")}</Typography>
          <Typography variant="caption" className="mt-1 block">
            {t("pref.numberFormatHint")}
          </Typography>
        </div>
        <Typography variant="h5">{formatDecimal(SAMPLE, numberFormat)}</Typography>
      </div>

      <button
        type="button"
        onClick={() =>
          setNumberFormat(isInternational ? "indian" : "international")
        }
        aria-label={t("pref.numberFormat")}
        className="relative isolate flex h-11 w-full cursor-pointer items-center rounded-full border border-border bg-surface-soft p-0.5"
      >
        <span aria-hidden className="absolute inset-0.5 grid grid-cols-2">
          <span
            className={`rounded-full bg-brand shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isInternational ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </span>
        <span className="relative z-10 grid w-full grid-cols-2 items-center">
          <span
            className={`px-2 text-center text-xs font-semibold transition-colors duration-300 ${
              isInternational ? "text-muted" : "text-on-brand"
            }`}
          >
            {t("pref.indian")}
          </span>
          <span
            className={`px-2 text-center text-xs font-semibold transition-colors duration-300 ${
              isInternational ? "text-on-brand" : "text-muted"
            }`}
          >
            {t("pref.international")}
          </span>
        </span>
      </button>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          animate={false}
          disabled={numberFormat === DEFAULT_NUMBER_FORMAT}
          onClick={resetNumberFormat}
        >
          {t("pref.reset")}
        </Button>
      </div>
    </section>
  );
}
