# Auto-complete lessons at end of video

Lesson videos play from Google Drive inside a cross-origin iframe, which emits no playback or "ended" events to the app. The closest reliable end-of-video signal is the existing watch heartbeat, so completion will fire when watched time reaches the end of the lesson duration.

## Behavior

- A lesson is marked completed automatically once watched time reaches ~95% of its stored duration (today the threshold is 85%, so it fires well before the video ends).
- On completion: the database records it immediately, the progress bar and lesson checkmark update right away without a refresh, and the same value shows on Course Details and Purchased Courses.
- Completion happens once per lesson: already-completed lessons stop sending heartbeats and never re-award progress or points on replay or after a refresh.
- The "I've Finished the Video" button stays as a manual fallback, and is the only path for lessons with no stored duration.
- Lessons with no duration recorded keep manual-only completion (auto detection has nothing to measure against).

## Technical notes

- `src/pages/CourseLessons.tsx`: pass `_completion_threshold: 95` on heartbeat calls; skip the heartbeat RPC entirely when the selected lesson is already in `completedLessons` or `completedRef`; keep `refreshAllProgress()` (progress query, gamification stats, finished content, batched `courses-progress`) on newly-completed transitions only.
- `src/components/course/GoogleDrivePlayer.tsx`: accept a `watchDisabled`/`onWatchTick={undefined}` path so no ticks are produced for completed lessons; shorten the tick interval to ~10s so the completion lands close to the actual video end.
- Deduplication already exists server-side: `record_course_lesson_watch_progress` keeps `completed_at` once set and only calls `record_content_progress` on the first completion, and `user_section_progress` has a unique constraint — so refresh/replay cannot duplicate points.
- No migration required.

## Verification

- Sign in with the browser tool on a course with a short lesson, let watch time accumulate past the threshold, and confirm the lesson flips to completed and the percentage rises without a refresh.
- Reload and confirm progress persists; re-open the same lesson and confirm the percentage and point total do not increase again.
- Confirm the manual button still completes a lesson that was never auto-detected.
