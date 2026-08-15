# Repair the complete course learning cycle

## Confirmed current state and root causes

- **Completion records already have a valid core model:** lessons are `course_lessons`; durable lesson completion is `user_section_progress`; partial watch state is `course_lesson_watch_progress`; durable course completion is `user_finished_content`. Existing uniqueness constraints already prevent duplicate lesson and course completion rows.
- **The UI and certificate do not use course completion consistently.** Progress screens derive completion by counting lesson rows, while the profile certificate uses persisted `user_finished_content`. The lesson-page certificate is unlocked from client-calculated `isComplete`, uses today as the completion date, and builds a different certificate ID from the course ID. This creates two certificate eligibility/data paths.
- **The manual completion path can become stuck after a successful write.** `CourseLessons` marks an in-memory ref complete before the request and only changes visible state after refetching. If the database succeeds but refresh fails or returns stale data, the old button/bar remains visible while further attempts are silently blocked by that ref.
- **Completion errors are hidden.** Both manual and automatic paths log failures to the console but provide no user feedback or retry state.
- **There is no native Google Drive `ended` event.** All 153 current lesson videos are Drive embeds, and the player cannot observe playback events inside the cross-origin iframe. The existing `onVideoEnd` prop is never invoked. The approved 95%-of-duration heartbeat is therefore the automatic fallback; 18 current lessons have no positive duration and cannot auto-complete until their duration is supplied.
- **Certificate printing is not implemented.** The certificate supports PNG/PDF download only. Rendering failures are console-only, and the two certificate entry points use inconsistent persisted data.
- **The earlier 17% symptom is not a hardcoded default.** The current formula is completed lessons / actual lesson rows; 17% is the rounded result of 1/6. Live data currently has zero orphaned and zero duplicate course progress rows, and persisted finished-course rows match actual 100% completion.

## Implementation

### 1. Make one transactional completion service authoritative

- Replace the lesson completion RPC internals with one idempotent transaction used by both manual completion and automatic watch completion.
- Validate the authenticated user and lesson/course relationship, upsert watch state, insert the durable lesson completion once, recalculate against the course’s current lessons, and create the durable finished-course record once when the final lesson completes.
- Return an authoritative result in the same response: lesson completion state, completed/total counts, percentage, course completion state, persisted course completion date/ID, and whether anything changed.
- Preserve existing progress and points. Keep the existing tables rather than introducing another progress store, and retain uniqueness protections. Add only missing relational hardening/indexes if the migration review confirms they are safe for current data.
- Reconcile any future mismatch between completed lessons and `user_finished_content` inside the same service, so final-lesson completion cannot leave certificate eligibility behind.

### 2. Unify manual and automatic frontend completion

- Extract one course-completion mutation/service and route both the manual button and automatic Drive heartbeat through it.
- Await the database result before presenting durable completion. On success, write the authoritative returned summary into the exact React Query cache, then invalidate/refetch the single-course, purchased-course, finished-content, and gamification queries.
- Remove the blocking `completedRef` behavior that can leave stale UI after a successful write; use explicit per-lesson pending state and server-returned idempotency instead.
- Disable the manual button only while its request is pending, show localized success/failure feedback, and leave it retryable after failure.
- Prevent overlapping heartbeat writes per lesson and stop heartbeats only after the server confirms completion.

### 3. Use one progress reader everywhere

- Keep `user_section_progress` joined/intersected with current `course_lessons` as the lesson-count source of truth and keep the exact formula `completed / total × 100`, with zero lessons or zero completions yielding 0%.
- Extend the shared progress model to include the persisted finished-course record and completion metadata.
- Make Course Lessons, Course Details, Purchased Courses, finished content, and certificate eligibility consume that shared model/query-key convention so final completion immediately reaches 100% everywhere and persists across refresh/login/device changes.
- Ensure the final lesson sequence is strictly: save completion → receive authoritative recalculation → update caches/UI → unlock certificate.

### 4. Repair certificate eligibility and printing

- Gate certificates on persisted course completion, not a frontend-only percentage.
- Use the same persisted completion row for certificate ID and completion date from both the lesson page and profile.
- Keep the existing multilingual certificate and PNG/PDF downloads, add an actual print action with print-specific layout, and surface localized generation/print errors with retry support.
- Validate required user and course fields before rendering; do not revoke course completion if certificate rendering fails.

### 5. Handle Drive limitations without changing video infrastructure

- Retain the approved near-end automatic completion for Google Drive at 95% of stored duration, because Drive exposes no native ended event.
- Keep manual completion as the fallback for Drive failures and the 18 lessons that currently have no usable duration.
- Preserve the player’s current mobile popup, iOS behavior, swipe navigation, access controls, purchases, and unrelated course/admin functionality.

## Verification

- Add focused tests for percentage calculation, zero-progress courses, idempotent duplicate completion, final-lesson completion, cache updates, and certificate eligibility metadata.
- Run database assertions for duplicate/orphan rows, mismatches between 100% progress and finished-course rows, and RPC permissions/RLS.
- With an authenticated test user, verify in the browser: manual completion updates immediately and survives refresh; repeating it does not increase progress; Drive near-end completion updates immediately; the final lesson reaches 100% and unlocks the certificate; Course Details and Purchased Courses show the same value; logout/login preserves it; certificate data is correct and PDF/PNG/print actions work.
- Explicitly test a failed completion request and failed certificate render to confirm visible feedback and retry behavior without false completion.

## Technical scope

- Database: existing progress/completion functions and constraints only; no duplicate progress table.
- Frontend: `CourseLessons`, shared course progress/mutation hooks, Course Details, Purchased Courses/finished content, certificate section/template, and EN/AR/FR feedback strings.
- Existing user progress will be preserved; any migration will be additive/idempotent and will reconcile rather than reset valid records.
