# Make all courses free

## What changes for visitors
- Every lesson in every course plays for everyone, signed in or not. No locked lessons, no "subscribe/buy" pop-ups.
- Course cards (home, courses page, skill paths) show a "Free" tag instead of a price, discount or "Owned" label.
- Course page and lessons page: buy buttons, prices and the purchase pop-up are removed.
- Profile: the "Purchased Courses" tab is hidden.
- Home stats strip: the "100 EGP – Starting From" item is replaced with "Free" (all languages).

## What changes for admins
- Price and discount fields are hidden in the course editor. Saved prices stay in the system, so they can be brought back later.
- The "grant course access" tool is hidden from the admin user page (no longer needed).

## Technical details
- Migration: make `has_course_access` and `get_lesson_video_source` return access/sources for all lessons of published courses for anyone (anon + authenticated); update `course_lessons` read policy so paid lessons are no longer filtered; update `get-signed-video-url` edge function to stop checking purchase/membership (still validates lesson exists and course is published).
- Frontend: `useCourseAccess` returns `hasAccess: true`; treat every course as free in `FeaturedCourses.tsx`, `Courses.tsx`, `SkillPathDetails.tsx`, `Course.tsx`, `CourseLessons.tsx`; stop rendering `BuyCourseButton`, `CoursePriceBadge`, `CoursePrice`, `CoursePremiumModal`; hide tab in `Profile.tsx`; hide price inputs in `CourseEditor.tsx` and access-grant section in `UserEditor.tsx`. Components and DB columns are kept, not deleted.
- Locale updates in en/ar/fr for the stats label.
- Verify with type check and a browser run playing a previously paid lesson while signed out.
