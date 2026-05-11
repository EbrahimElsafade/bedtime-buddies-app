import { Link } from "react-router-dom";
import { ArrowLeft, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import HeroSkillPathCard from "./HeroSkillPathCard";
import { useSkillPaths } from "@/hooks/useSkillPaths";
import { getMultilingualText } from "@/utils/multilingualUtils";

const Hero = () => {
  const { t } = useTranslation("hero");
  const { i18n } = useTranslation();
  const tSkillPaths = useTranslation("skillPaths").t;
  const { data: paths = [] } = useSkillPaths();
  const skillPathsMini = paths.slice(0, 3).map((path) => ({
    id: path.id,
    icon: path.icon,
    title: getMultilingualText(path.name, i18n.language, "en"),
    subtitle: `${path.course_ids.length} ${tSkillPaths("skillPaths:skillPaths.courses")}`,
  }));

  return (
    <section
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
          {/* Skill Path Cards */}
          <div className="order-2 flex flex-col gap-4 md:order-1">
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

          {/* Content */}
          <div className="order-1 flex max-w-2xl flex-col md:order-2 md:items-end md:text-end">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-4 py-2 md:self-end">
              <Zap className="h-4 w-4 fill-[#F97316] text-[#F97316]" />
              <span className="text-xs font-semibold text-[#F97316] md:text-sm">
                {t("badge")}
              </span>
            </div>

            <h1 className="font-bubbly text-4xl font-extrabold leading-tight text-[#0F1B3D] sm:text-5xl md:text-6xl lg:text-7xl">
              {t("titlePart1")}{" "}
              <span className="text-[#F97316]">{t("titleAccent")}</span>
              <br />
              {t("titlePart2")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-end">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full rounded-xl bg-[#F97316] px-8 text-white shadow-lg shadow-[#F97316]/30 hover:bg-[#ea6a0c] sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                  {t("cta")}
                </Button>
              </Link>

              <Link to="/courses" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-xl border-2 border-[#0F1B3D] bg-white px-8 text-[#0F1B3D] hover:bg-[#0F1B3D] hover:text-white sm:w-auto"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {t("watchDemo")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
