# Two course prices: EGP (Egypt) and USD (rest of world)

Today a course has one price stored in EGP, and for visitors outside Egypt the app converts it with the subscription price ratio and just swaps the currency label. Instead, admins will set two explicit prices.

## What changes

1. **Database**: add a `price_usd` column to courses (default 0). The existing `price` stays the Egypt price in EGP.
2. **Admin course editor**: next to "Course Price (EGP)" add a second field "Course Price (USD)". Both are saved on create and update.
3. **Price display everywhere**: visitors detected in Egypt (or when country detection fails) see `<price> EGP`; everyone else sees `<price_usd> USD`. No more ratio conversion or per-country currencies.
4. Affected surfaces (all read through the same helper, so behavior stays consistent): course cards, course detail page, price badge, purchase/premium modal, and the WhatsApp buy message.

## Technical notes

- Migration: `ALTER TABLE public.courses ADD COLUMN price_usd numeric NOT NULL DEFAULT 0;` (no new table, so grants/RLS unchanged).
- `src/utils/getCoursePrice.ts`: replace `getCoursePrice`/`formatCoursePrice` with a signature taking both amounts, e.g. `formatCoursePrice({ priceEgp, priceUsd }, countryCode)` returning `"100 EGP"` or `"10 USD"`. Drop the `getPlanPrice` ratio dependency for courses.
- `src/hooks/useCourseData.ts` (all three queries): map `price_usd` into the `Course` type; `src/types/course.ts` gains `priceUsd: number`.
- Components updated to pass both values: `CoursePrice`, `CoursePriceBadge`, `CoursePremiumModal`, `BuyCourseButton`, plus their call sites in `Courses.tsx`, `Course.tsx`, `CourseLessons.tsx`, `FeaturedCourses.tsx`, `SkillPathDetails.tsx`.
- Fallback: if `price_usd` is 0/unset for an existing course, show the EGP price labeled USD is wrong — instead fall back to displaying the EGP price with the EGP label until an admin fills it in.
- Subscription plan pricing (`getPlanPrice`) is untouched.
