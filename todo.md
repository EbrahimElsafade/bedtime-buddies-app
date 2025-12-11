# TODO:

## Priority Scale

    [
        {
            Top Priority : 🡅🡅🡅
        },
        {
            High Priority : 🡅🡅
        },
        {
            Medium Priority : 🡅
        },
        {
            Low Priority : 🡇
        },
        {
            Ignore : ∅
        },
        {
            Not Sure : ?
        },
    ]

## ✅ COMPLETED: TypeScript Type Safety (Latest)

    [✓] Replaced all `Function` types with explicit function signatures
    [✓] Replaced all `any` types with proper interfaces and types
    [✓] Created type definitions: Language, Category, StorySection, FavoriteItem
    [✓] Fixed error handling with `error instanceof Error`
    [✓] Improved type safety across entire codebase

## Code Review - Critical Issues:

    [✓] Fix AuthContext session management (race conditions & deadlocks) 🡅🡅🡅
        - ✓ Removed async Supabase calls from handleAuthStateChange
        - ✓ Moved profile syncing to separate useEffect
        - ✓ Removed sessionStorage backup mechanism
        - Multiple profile fetches causing performance issues
    [ ] Security: Sanitize error messages in Login.tsx 🡅🡅🡅
        - Line 214 displays raw error messages that could leak sensitive info
    [ ] Security: Remove console.error in production (Layout.tsx) 🡅🡅
        - Line 35 logs errors in production environment
    [ ] Performance: Memoize debounce function in AuthContext 🡅🡅
        - Non-memoized debounce creates new function on every render
    [ ] Performance: Optimize useEffect hooks 🡅🡅
        - Redundant profile fetching
        - Multiple effect dependencies causing unnecessary re-renders

## Code Review - Code Quality:

    [ ] Refactor AuthContext - too many responsibilities 🡅
        - Split into smaller, focused hooks
        - Separate profile management from auth logic
    [ ] Remove commented-out debug logs 🡅
        - Clean up console.log statements throughout codebase
    [ ] Fix 'any' types in AuthContext 🡅
        - Replace with proper TypeScript types
    [ ] Design system: Fix hardcoded colors in tailwind.config.ts 🡅
        - ocean property uses hex colors instead of CSS variables

## Code Review - Security Recommendations:

    [ ] Add rate limiting for auth endpoints 🡅
    [ ] Implement CSRF protection 🡅
    [ ] Add input sanitization library (DOMPurify) 🡅
    [ ] Validate session expiry client-side 🡇
    [ ] Add security headers 🡇

## Code Review - Performance Recommendations:

    [ ] Implement React.memo for expensive components 🡅
    [ ] Add code splitting for routes 🡅
    [ ] Optimize image loading (lazy loading, responsive images) 🡅
    [ ] Implement virtual scrolling for long lists 🡇

## Code Review - Best Practices:

    [ ] Add Error Boundaries 🡅🡅
    [ ] Improve logging strategy (use proper logger in production) 🡅
    [ ] Enhance type safety (remove 'any' types) 🡅
    [ ] Add unit tests for critical functions 🡇
    [ ] Improve documentation (JSDoc comments) 🡇

## general issues:

    [ ] "subscription" 🡇
    [ ] fix that we can't copy any text in the app [overly issue] ∅

## user:

    [x] some buttons has winky styles [login, sign in, pwa popup, edit profile] 🡅🡅
    [ ] home page sections route buttons  🡅🡅
    [x] change the layout bg  🡅
    [x] auth pages bg and localization 🡅
    [ ] make courses card hight fixed 🡇
    [ ] fix payment popup 🡇
    [x] don't forget to fix the seo of the app => mainly page title is enough ∅

## admin:

    [x] test adding story 🡅🡅🡅
        edit story miss the old data
        add a new lang miss with the old data
        arabic fos7a is not working (still work in the old stories)
    [x] test adding course 🡅🡅
    [ ] link a user as instructor to a course or set the instructor data manually 🡅
    [ ] course objectives, instructors, and lessons data not localized 🡅
    [ ] course duration calc 🡅

# TODO 11-12-2025:
- review the translations of the profile [ ]
- the story video repeat when finished [ ]
- set a loader between the languages in the story to indicate the change [ ]
- in the course card when the user is not logged in just keep the login button but remove the overlay [ ]
- in the home page change the courses section color to white [ ]
- in the home page move show more content to the bottom middle of the section [ ]
- in the snake and lader game make the control float in the screen instead of being all the way down [ ]
- in the courses card there is a 'S' letter remove it [ ]
- in the courses page change the image from object-cover to fill [ ]
- create a new layer in the courses => first layer just the course info => then the second layer the lessons with the playlist [ ]
- add communicate with a spacial agent button in the course page [ ]
- unify the header of all the pages [ ]
- new tab in the profile for the courses and stories that finished [ ]
- in the free content put a join now button [ ]
- set milestones in the profile and give it tags {
  5&5:"name1",
  10&10: "name2",
  15&15: "name3",
  20&20 : "name4",
  25&25 : "name5"
  } [ ]
