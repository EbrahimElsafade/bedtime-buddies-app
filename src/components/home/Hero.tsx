import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeroSkillPathCard from "./HeroSkillPathCard";
import { useSkillPaths } from "@/hooks/useSkillPaths";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Hero = () => {
  const { t, i18n } = useTranslation("hero");
  const tSkillPaths = useTranslation("skillPaths").t;
  const { data: paths = [] } = useSkillPaths();
  const isRTL = i18n.dir() === "rtl";

  const skillPathsMini = paths.slice(0, 3).map((path) => ({
    id: path.id,
    icon: path.icon,
    title: getMultilingualText(path.name, i18n.language, "en"),
    subtitle: `${path.course_ids.length} ${tSkillPaths("skillPaths:skillPaths.courses")}`,
    theme: path.theme,
  }));

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      className="relative overflow-hidden px-4 py-12 md:py-20"
      style={{
        background:
          "radial-gradient(ellipse at top, #ffffff 0%, #f5f7fb 60%, #eef2f9 100%)",
      }}
    >
      {/* Dotted pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c7d2e0 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="container relative z-10 mx-auto">
        <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:items-center md:gap-8">
          {/* Content */}
          <div className="order-1 flex max-w-2xl flex-col items-start text-start md:order-1 md:items-start md:text-start">
            <h1 className="font-bubbly text-4xl font-extrabold leading-tight text-[#0F1B3D] sm:text-5xl md:text-6xl lg:text-7xl">
              {t("titlePart1")}{" "}
              <span className="text-[#F97316]">{t("titleAccent")}</span>
              <br />
              {t("titlePart2")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-start">
              <Link to="/skill-paths" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-[#F97316] px-8 text-white shadow-lg shadow-[#F97316]/30 transition-all duration-200 hover:bg-[#ea6a0c] hover:shadow-xl hover:shadow-[#F97316]/40 sm:w-auto"
                >
                  {isRTL ? (
                    <ArrowLeft className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {t("cta")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Skill Path Cards */}
          <div className="order-2 flex flex-col gap-4 md:order-2">
            {skillPathsMini.map((path, index) => (
              <Link
                key={path.id}
                to={`/skill-path/${path.id}`}
                className={index % 2 === 1 ? "ms-6" : ""}
              >
                <HeroSkillPathCard
                  icon={path.icon}
                  title={path.title}
                  subtitle={path.subtitle}
                  delay={index * 0.5}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
