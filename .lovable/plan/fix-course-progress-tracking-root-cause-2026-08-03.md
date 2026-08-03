# Fix Course Progress Tracking (Root Cause)

## What the investigation found (verified against the live database and code)

1. **Nothing ever reports that a lesson was watched.** The player component receives an `onVideoEnd` callback but never calls it — the Google Drive video runs inside a cross-origin iframe, so the app cannot see play/pause/end events. The only working path today is the manual "Mark as completed" button on the lesson page. That is why watching a lesson never moves the bar.

2. **Old progress rows point at lessons that no longer exist.** Of 427 stored course-lesson progress rows, **398 reference deleted lessons**. Progress is computed by counting rows, so learners see percentages that don't match the lesson list (rows: 23 vs 17 actual lessons in one case), courses marked "finished" with zero valid completed lessons, and no checkmarks next to the lessons they actually finished. The database completion check has the same flaw: it compares a raw row count to the lesson count, so it can mark a course complete incorrectly.

3. **Progress isn't shown where the request expects it.** The percentage renders only inside the lessons page. The Course Details page loads it but doesn't display it, and the Purchased Courses tab shows no progress at all.

4. Permissions, grants, and the recording functions themselves are correct — the last successful recording in the database is from Aug 1, so writes do work when triggered.

## The fix

### 1. Real watch tracking (replaces the dead `onVideoEnd`)
- Add a watch heartbeat to the Drive player: while the lesson video is actually mounted and the tab/dialog is visible, accumulate watched seconds and report them every ~15 seconds.
- Reported seconds are compared to the lesson duration; at 85% the lesson is marked complete automatically (this threshold already exists in the database function).
- Keep the "Mark as completed" button as a manual fallback and for lessons with no stored duration.
- Partial watch percentage stays visible per lesson in the sidebar.

### 2. Clean and harden the stored progress
- Delete progress rows that reference lessons which no longer exist.
- Recompute "finished course" records and the learner point totals from valid completions only, so points and milestones stay honest after cleanup.
- Make the completion check count only lessons that still belong to the course.
- Add a trigger so deleting a lesson also removes its progress rows — this prevents the corruption from coming back.

### 3. Correct calculation on the client
- Progress = completed lessons that exist in this course / total lessons in this course, clamped to 0–100. A course with no completions reads exactly 0%.
- After any completion, refresh the progress query, the finished-content list, and the points badge so the UI never shows a cached value.

### 4. Show the same number everywhere
- Course Details page: progress bar + "x/y lessons" for signed-in users with access.
- Purchased Courses tab: per-course progress bar on each card, loaded in one batched query.
- Both read the same hook as the lessons page, so the values cannot diverge.

## Verification (run before calling it done)
- Query the database to confirm zero orphan progress rows remain and that finished-course records match valid completions.
- Sign in against the running app with the browser tool and, on a course with progress: confirm the lessons page, Course Details, and Purchased Courses all show the same percentage; complete a lesson and confirm the percentage rises immediately; reload the page and confirm it persists; re-read progress with a fresh session to confirm it is stored server-side, not local.

## Technical notes
- Files: `src/hooks/useCourseProgress.ts` (valid-lesson filtering, batched multi-course variant), `src/components/course/GoogleDrivePlayer.tsx` (visibility-aware watch ticks), `src/pages/CourseLessons.tsx` (wire ticks to `record_course_lesson_watch_progress`, cache invalidation), `src/pages/Course.tsx`, `src/pages/Profile/PurchasedCoursesTab.tsx`.
- Migration: cleanup of `user_section_progress` / `course_lesson_watch_progress` orphans, recompute `user_finished_content` and `profiles.total_points` / milestones, update `check_course_completion` to join `course_lessons`, add an `AFTER DELETE` trigger on `course_lessons`.
- Heartbeat caveat: because Drive gives no playback events, "watched time" means time the video was open with the tab focused. A learner could idle to completion; the alternative is manual-only completion. Say the word if you prefer manual-only.
