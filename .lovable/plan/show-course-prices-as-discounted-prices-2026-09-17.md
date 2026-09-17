# Show course prices as discounted prices

Courses will be presented with an original (crossed-out) price and a discounted final price, for both the Egypt (EGP) and outside-Egypt (USD) prices.

## What admins enter

For each course, four fields in the course editor:

- Original price (EGP) — the current EGP price becomes this value
- Discount % (EGP)
- Original price (USD) — the current USD price becomes this value
- Discount % (USD)

The final price is calculated automatically (original minus discount) and shown live under each field so admins can confirm it before saving.

## What visitors see

- Course cards, course page, price badge and the purchase pop-up show the original price crossed out next to the final price, plus a "-X%" tag.
- When the discount is 0, only one price is shown — no crossed-out price and no discount tag.
- The WhatsApp buy message always contains the final (discounted) price only.
- Egypt (and when the country can't be detected) uses the EGP pair; everyone else uses the USD pair, with the existing fallback to EGP when no USD price is set.

## Technical notes

- Migration: add `discount_percent` and `discount_percent_usd` (numeric, not null, default 0, checked 0–100) to `public.courses`. Existing `price` / `price_usd` keep their meaning as the original prices. No new table, so grants/RLS unchanged.
- `src/utils/getCoursePrice.ts`: extend the input to `{ priceEgp, priceUsd, discountEgp, discountUsd }` and return `{ originalAmount, finalAmount, discountPercent, currency, hasDiscount }`; add `formatCoursePrice` (final price, used for WhatsApp) alongside the richer accessor.
- `src/types/course.ts`: add `discountPercent` and `discountPercentUsd`; map both in all three queries in `src/hooks/useCourseData.ts`.
- `src/pages/admin/CourseEditor.tsx`: relabel the two existing price inputs as original prices, add the two discount inputs (0–100), include both new fields in create and update payloads and in the initial state.
- Display components updated to consume the new shape: `CoursePrice` (renders original + final + discount tag), `CoursePriceBadge`, `CoursePremiumModal`, `BuyCourseButton` (final price in the message), and their call sites in `Courses.tsx`, `Course.tsx`, `CourseLessons.tsx`, `FeaturedCourses.tsx`, `SkillPathDetails.tsx`.
- New locale keys for the discount tag / "original price" label in `public/locales/{en,ar,fr}/courses.json`.
- Subscription plan pricing is untouched.
- Verify with `npx tsgo --noEmit -p tsconfig.app.json`.
