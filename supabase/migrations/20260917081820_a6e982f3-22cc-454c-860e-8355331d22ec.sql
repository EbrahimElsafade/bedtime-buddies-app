ALTER TABLE public.courses
  ADD COLUMN discount_percent numeric NOT NULL DEFAULT 0,
  ADD COLUMN discount_percent_usd numeric NOT NULL DEFAULT 0;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_discount_percent_range CHECK (discount_percent >= 0 AND discount_percent <= 100),
  ADD CONSTRAINT courses_discount_percent_usd_range CHECK (discount_percent_usd >= 0 AND discount_percent_usd <= 100);