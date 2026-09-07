# Turn the "How did you hear about us?" card into a one-time pop-up

## What changes

- Instead of a fixed section on the home page and profile page, the question appears as a centered pop-up over the screen shortly after a signed-in user lands on the site.
- The pop-up has the free-text box, a "Send" button and a "Not now" button, exactly as today.
- Sending an answer or choosing "Not now" closes it permanently — it never appears again for that user, on any device.
- Closing it with the X or the escape key counts the same as "Not now", so nothing keeps nagging.
- Only shown to signed-in users who have neither answered nor dismissed it before.
- Works in Arabic, English and French with the wording already in place, and follows right-to-left layout in Arabic.

## Technical notes

- Rewrite `src/components/profile/ReferralSourcePrompt.tsx` to render a shadcn `Dialog` instead of a `Card` section.
- Keep the same profile lookup (`referral_source`, `referral_prompt_dismissed_at`) to decide visibility; open the dialog after a short delay (about 1.5s) so it does not fight with page load.
- Any close path (send, "Not now", overlay/X/escape) writes to the profile: answer writes `referral_source`, all other paths write `referral_prompt_dismissed_at`.
- Mount it once globally in `src/components/Layout.tsx` and remove the two current placements in `src/pages/Index.tsx` and `src/pages/Profile.tsx`.
- Add localized fallbacks via `t(key, { defaultValue })` so a slow translation load never shows a raw key.
