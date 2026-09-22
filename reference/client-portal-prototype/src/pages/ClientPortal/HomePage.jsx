import Animation from "../../component/common/Animation";
import DataTableWithChart from "../../component/common/DataTableWithChart";
import Typography from "../../component/common/Text";
import Hero from "../../component/home/Hero";
import { useLanguage } from "../../context/languageContext";
import { containerClass } from "../../utils/responsive";

export default function HomePage() {
  const { dict } = useLanguage();

  return (
    <>
      <Hero />
      <section className="py-16 lg:py-20">
        <div className={containerClass}>
          <Animation type="fadeUp">
            <Typography variant="h2" className="mb-10">
              {dict.features.title}
            </Typography>
          </Animation>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dict.features.items.map((item, index) => (
              <Animation key={item.title} type="fadeUp" delay={index * 90}>
                <article className="h-full rounded-3xl border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <Typography variant="h4">{item.title}</Typography>
                  <Typography variant="body" className="mt-2">
                    {item.body}
                  </Typography>
                </article>
              </Animation>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-16 lg:pb-20">
        <div className={containerClass}>
          <Animation type="fadeUp">
            <Typography variant="h2" className="mb-8">
              {dict.table.market}
            </Typography>
          </Animation>
          <DataTableWithChart />
        </div>
      </section>
    </>
  );
}
