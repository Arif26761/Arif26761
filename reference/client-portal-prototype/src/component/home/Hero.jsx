import heroArt from "../../assets/hero.png";
import { useLanguage } from "../../context/languageContext";
import { useToast } from "../common/Toaster";
import Animation from "../common/Animation";
import Button, { ArrowRightIcon } from "../common/Button";
import Typography from "../common/Text";
import { containerClass } from "../../utils/responsive";

export default function Hero() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  return (
    <section className="relative overflow-hidden bg-page">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-brand)_18%,transparent),transparent_42%)]" />
      <div
        className={`${containerClass} grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24`}
      >
        <div>
          <Animation type="fadeUp">
            <Typography variant="overline">{t("hero.eyebrow")}</Typography>
          </Animation>
          <Animation type="fadeUp" delay={80}>
            <Typography variant="display" className="mt-4 max-w-xl">
              {t("hero.title")}
            </Typography>
          </Animation>
          <Animation type="fadeUp" delay={160}>
            <Typography variant="lead" className="mt-5 max-w-xl">
              {t("hero.subtitle")}
            </Typography>
          </Animation>
          <Animation type="fadeUp" delay={240} className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              iconRight={ArrowRightIcon}
              onClick={() =>
                showToast(t("toast.welcome"), {
                  type: "success",
                  title: t("brand"),
                })
              }
            >
              {t("hero.cta")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              underline
              onClick={() =>
                showToast(t("nav.support"), { type: "info", title: t("brand") })
              }
            >
              {t("hero.secondary")}
            </Button>
          </Animation>
        </div>

        <Animation type="scale" delay={120} className="relative mx-auto max-w-md lg:max-w-none">
          <div className="rounded-4xl border border-border bg-surface/70 p-8 shadow-2xl shadow-brand/10 backdrop-blur-xl">
            <img src={heroArt} alt="" className="mx-auto w-full max-w-sm" />
          </div>
        </Animation>
      </div>
    </section>
  );
}
