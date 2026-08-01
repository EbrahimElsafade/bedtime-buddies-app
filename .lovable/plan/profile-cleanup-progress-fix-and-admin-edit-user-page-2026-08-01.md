# Profile cleanup, progress fix, and admin Edit User page

## 1. Profile: remove subscription, keep Purchased Courses

Confirmed cause of the broken tab: `src/pages/Profile.tsx` has a `VALID_TABS` list that does not include `purchased-courses`, so clicking that tab writes `?tab=purchased-courses` to the URL and the page falls back to the Profile tab — the section never renders.

Changes:
- Replace `subscription` with `purchased-courses` in `VALID_TABS` so the tab is valid and deep-linkable.
- Remove the Subscription tab trigger and its content from the profile (no status, plan, renewal, or subscription actions shown to users). Monthly/yearly stays admin-only.
- Keep the existing `PurchasedCoursesTab` content: owned course cards linking to `/courses/:id`, loading skeletons, and the empty state with a "Browse courses" button.
- Leave `SubscriptionTab.tsx` / `SubscriptionProfile.tsx` files unused (no other profile references) and the `/subscription` route untouched.

## 2. Course progress starts at 17%

Confirmed cause in `src/pages/CourseLessons.tsx`: on load the first lesson is auto-selected (lines ~96-101), and a `useEffect` (lines ~150-163) auto-marks the selected lesson complete after a 3-second timer. So simply opening a 6-lesson course records 1 completed lesson = 17% without any watching.

Fix:
- Stop the timer-based auto-completion. Completion is recorded only on real playback signals: the video reaching the end (`handleVideoEnd`) or watch progress crossing the completion threshold, plus the explicit "Mark as completed" action.
- Keep auto-selecting the first lesson for playback, but selection alone records nothing, so a fresh course shows 0%.
- Progress math in `useCourseProgress` is already correct (completed rows / total lessons) and stays as-is.
- Note: users who already got a phantom lesson credited keep that row; if you want, I can add a cleanup step to remove completions that have no real watch progress.

## 3. Admin: dedicated Edit User page

- New page `src/pages/admin/UserEditor.tsx` at route `/admin/users/:userId` (lazy-loaded, inside the existing admin route guard).
- The Users table "Edit" action navigates there instead of opening the dialog; the edit dialog and its form state are removed from `src/pages/admin/Users.tsx`. Create-user dialog and role actions stay unchanged.
- Page layout: header with user email and back link, then card sections:
  - User Information (parent name, child name, preferred language)
  - Account Status (role/status badges, premium toggle)
  - Monthly/Yearly Subscription (Admin only) — start date, duration (yearly/custom), custom end date, same logic as today
  - Purchased Courses — searchable, scrollable checkbox list of all courses with selected-count summary, using the existing `useUserPurchasedCourseIds` / `useSyncUserCoursePurchases` hooks
- Sticky action bar at the bottom with Save and Cancel, always visible while scrolling; responsive single-column on mobile, two-column on desktop.
- Saving reuses the current update logic (profile fields + subscription + course purchase diff), then returns to the users list with a success toast.
- All new labels added to `admin.json` for en, ar, fr.
