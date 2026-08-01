# Course-Based Purchase Model

Move the public site from promoting monthly/yearly plans to selling individual courses, without removing any existing subscription machinery.

## 1. Database

New column on `courses`:
- `price` (numeric, not null, default `100`) — the price in EGP. Existing courses get 100 automatically.

New table `course_purchases`:
- `user_id`, `course_id`, `granted_by`, `granted_at`, `source` (`admin_grant` by default), timestamps
- unique on (`user_id`, `course_id`) — ownership is permanent, no expiry column
- Users can read their own rows; admins can read/insert/delete all. Grants to `authenticated` and `service_role`.

New helper function `has_course_access(_user_id, _course_id)` returning true when the user is an admin, has an active premium subscription, or owns the course. Used by the lesson/video access checks so ownership works everywhere the current premium check works — including the signed-video-URL edge function.

## 2. Pricing display

Course price is stored once in EGP. A new `src/utils/getCoursePrice.ts` converts it to the visitor's detected country currency using the same country/currency list already used by the subscription pricing, so a course shows `100 EGP` in Egypt and the converted amount elsewhere. Currency labels reuse the existing `subscription:currency.*` translations.

## 3. Public site changes

- Homepage: remove the monthly/yearly `SubscribeBanner`.
- Footer: remove the subscription link.
- `/subscription` route stays reachable by direct URL but is no longer linked anywhere public (used for manual/internal flows).
- Course cards (courses list, homepage featured courses, skill path pages): show the price and a "Buy This Course" action for courses the user doesn't own. Owned courses show an "Owned" badge instead.
- Course details page: a clear "Course Price / 100 EGP" block with a "Buy Course" button, styled to match the existing layout.
- The premium/locked-lesson popup (`CoursePremiumModal`) becomes a purchase prompt: course title, price, and "Buy Course".
- All user-facing "Subscribe / Upgrade / Premium plan" wording on course surfaces becomes purchase wording ("Buy Course", "Own This Course"). Story/game premium wording is left untouched.

## 4. WhatsApp purchase flow

Buying opens WhatsApp (same number as today) with a course-specific message, e.g. `Hello, I'm interested in purchasing the Graphic Design Course on Dolphoon.` plus the displayed price. The existing WhatsApp button component is extended with a course mode; the subscription mode stays for the admin/internal page.

## 5. Admin panel

- Course editor: a "Course Price (EGP)" number field, default 100, saved with the course.
- Users section: in the edit-user dialog, a searchable checkbox list of published courses to grant or revoke permanent access. Saving diffs the selection and inserts/deletes `course_purchases` rows. The existing premium toggle, tier, and subscription dates stay exactly as they are.

## 6. User profile

New "My Purchased Courses" tab/section listing owned courses (thumbnail, title, "Owned" badge, "Continue Learning" button to the course). Empty state: "You haven't purchased any courses yet." with a button to browse courses. Fully responsive, matching current profile UI.

## 7. Access logic

A single `useCourseAccess(courseId)` hook returns whether the current user can watch paid lessons: admin, active premium membership, or course ownership. It is used by the course page, lesson player, and lesson list so the three stay consistent. Free lessons remain open to visitors, and the full lesson list stays visible to everyone.

## 8. Translations

New keys in `courses.json` for en/ar/fr: price label, buy button, owned badge, purchase modal copy, WhatsApp message, purchased-courses section and empty state. Arabic is written first.

## 9. Verification

After implementation: typecheck, then browser checks for visitor / free user / owner / premium / admin on the courses list, course page, lesson player popup, profile section, and admin grant dialog — at mobile, tablet, and desktop widths. Confirm the WhatsApp link contains the course name, and that existing subscription admin controls and story/game access are unchanged.
