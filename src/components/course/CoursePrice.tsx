import { useTranslation } from "react-i18next";
import { useCountry } from "@/contexts/CountryContext";
import { getCoursePrice } from "@/utils/getCoursePrice";
import { cn } from "@/lib/utils";

interface CoursePriceProps {
  priceEgp?: number;
  priceUsd?: number;
  discountEgp?: number;
  discountUsd?: number;
  className?: string;
  withLabel?: boolean;
}

export const CoursePrice = ({
  priceEgp,
  priceUsd,
  discountEgp,
  discountUsd,
  className,
  withLabel,
}: CoursePriceProps) => {
  const { t } = useTranslation("courses");
  const { countryCode } = useCountry();
  const { originalAmount, finalAmount, discountPercent, currency, hasDiscount } = getCoursePrice(
    { priceEgp, priceUsd, discountEgp, discountUsd },
    countryCode,
  );

  const finalPrice = `${finalAmount} ${currency}`;
  const originalPrice = `${originalAmount} ${currency}`;

  const discountTag = hasDiscount ? (
    <span className="rounded-full bg-accent/20 px-1.5 py-0.5 text-[10.5px] font-semibold leading-none">
      {t("purchase.discountTag", { percent: discountPercent, defaultValue: "-{{percent}}%" })}
    </span>
  ) : null;

  if (withLabel) {
    return (
      <div className={cn("grid gap-1", className)}>
        <span className="text-xs uppercase tracking-wide text-primary-foreground/70">{t("purchase.priceLabel")}</span>
        <span className="flex flex-wrap items-center justify-center gap-2">
          <span className="font-bubbly text-2xl text-primary-foreground">{finalPrice}</span>
          {hasDiscount && <span className="text-sm text-primary-foreground/60 line-through">{originalPrice}</span>}
          {discountTag}
        </span>
      </div>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <span className="font-bubbly text-lg leading-none">{finalPrice}</span>
      {hasDiscount && <span className="text-xs leading-none line-through opacity-70">{originalPrice}</span>}
      {discountTag}
    </span>
  );
};
