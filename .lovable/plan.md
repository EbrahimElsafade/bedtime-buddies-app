# "How did you hear about us?" — one-time gentle prompt

A small, skippable card shown once after a user's first login. No modal, no interruption of what they came to do.

## Behaviour

- Appears on the home page (and the profile page) only for signed-in users who have not answered and have not dismissed it.
- Layout: a compact card with the question, a single free-text box, a "Send" button and a small "Not now" (dismiss) link.
- Answering or dismissing hides it permanently for that account — it never comes back.
- Fully optional: nothing is blocked if the user ignores it.
- Available in Arabic, English and French.

## Where the answer goes

- Stored on the user's own record so each person answers once.
- Admins get a simple read-only list of answers (name + answer + date) so the marketing question can actually be used.

## Technical notes

- Migration: add `referral_source text` and `referral_prompt_dismissed_at timestamptz` to `public.profiles`. Both nullable, no default. The existing `prevent_profile_privilege_escalation` trigger only guards subscription/gamification fields, so users can update these two columns themselves under the current self-update policy.
- New component `src/components/profile/ReferralSourcePrompt.tsx`, rendered in `src/pages/Index.tsx` and the profile page. Visible when authenticated and both new fields are null; updates the profile row on submit or dismiss and hides immediately (optimistic).
- Localisation: new keys in `public/locales/{ar,en,fr}/common.json` (question, placeholder, send, not now, thanks).
- Admin view: add a "Referral source" column to the existing admin Users table, sourced from the same profile field — no new page.

## Out of scope

- No required field, no signup-form change, no analytics integration.
