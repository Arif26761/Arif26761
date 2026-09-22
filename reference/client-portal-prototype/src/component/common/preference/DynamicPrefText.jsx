import Typography from "../Text";
import Button from "../Button";
import { TEXT_SCALE_MAX, TEXT_SCALE_MIN, TEXT_SCALE_STEPS, usePref } from "../../../context/prefContext";
import { useLanguage } from "../../../context/languageContext";

export default function DynamicPrefText() {
  const { t } = useLanguage();
  const { textScale, setTextScale, resetTextScale } = usePref();
  const percent = Math.round(textScale * 100);
  const atMax = percent >= TEXT_SCALE_MAX * 100;

  return (
    <section className="rounded-2xl border border-border bg-page/70 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <Typography variant="label">{t("pref.textSize")}</Typography>
          <Typography variant="caption" className="mt-1 block">
            {t("pref.textSizeHint")}
          </Typography>
        </div>
        <Typography variant="h5">{percent}%</Typography>
      </div>

      <div className="mb-4 flex items-end gap-2">
        {TEXT_SCALE_STEPS.map((step, index) => {
          const active = textScale >= step - 0.01;
          return (
            <button
              key={step}
              type="button"
              aria-label={`${Math.round(step * 100)}%`}
              onClick={() => setTextScale(step)}
              className={`flex-1 cursor-pointer rounded-lg transition duration-300 ${
                active ? "bg-brand" : "bg-surface-soft"
              }`}
              style={{ height: `${28 + index * 10}px` }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted" aria-hidden>
          A
        </span>
        <input
          type="range"
          min={TEXT_SCALE_MIN * 100}
          max={TEXT_SCALE_MAX * 100}
          step={1}
          value={percent}
          onChange={(event) => setTextScale(Number(event.target.value) / 100)}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-soft accent-brand"
          aria-label={t("pref.textSize")}
        />
        <span className="text-lg font-semibold text-ink" aria-hidden>
          A
        </span>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          animate={false}
          disabled={atMax}
          onClick={resetTextScale}
        >
          {t("pref.reset")}
        </Button>
      </div>
    </section>
  );
}
