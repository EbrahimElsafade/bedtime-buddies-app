## What I verified now

- The project is currently **published** and **public**.
- Lovable URLs are connected:
  - Preview: `https://id-preview--48f2e5e4-e552-4808-92bf-085dd78e1132.lovable.app`
  - Published: `https://bedtime-buddies-app.lovable.app`
  - Custom domain: `https://thedolphoon.com`
- From the server side, `https://thedolphoon.com/` returns **HTTP 200**, and the `.lovable.app` URL redirects to it.
- Frontend Supabase client points to the correct Supabase project: `https://brxbtgzaumryxflkykpp.supabase.co`.
- `.env` is not ignored by `.gitignore`, so the classic Vite/Supabase env issue does not appear to be the cause.
- I found old/incorrect domain references in some Edge Function CORS allowlists:
  - `https://dolphoon.com`
  - `https://www.dolphoon.com`
  - localhost dev URLs
  - Missing `https://thedolphoon.com`
  - Missing `https://bedtime-buddies-app.lovable.app`

## Plan

1. **Clean production URL configuration**
   - Update Edge Function CORS allowlists to include the real live domains:
     - `https://thedolphoon.com`
     - `https://www.thedolphoon.com`
     - `https://bedtime-buddies-app.lovable.app`
     - current Lovable preview domain if needed
   - Remove the obsolete `dolphoon.com` references.
   - Keep or remove localhost depending on production-only vs local-dev needs; for this recovery I will keep localhost only if it is clearly isolated to development CORS and cannot affect live routing.

2. **Confirm Supabase connection consistency**
   - Keep the frontend Supabase client connected to `brxbtgzaumryxflkykpp.supabase.co`.
   - Verify Edge Functions use `Deno.env.get("SUPABASE_URL")` and `SUPABASE_SERVICE_ROLE_KEY`, not hardcoded localhost.
   - Add safer missing-secret checks where functions currently use non-null assertions.

3. **Re-deploy backend functions if changed**
   - Deploy updated Edge Functions so CORS/domain changes are live immediately.

4. **Force a fresh frontend deployment**
   - Make a minimal safe frontend change if needed, such as bumping the existing cache-kill version in `index.html`, so Lovable has a new frontend bundle to publish.
   - Keep the PWA disabled and keep the service-worker kill switch safe.

5. **Publish recovery steps**
   - You will open the Publish dialog and click **Update/Publish** after changes are ready.
   - If you specifically want an unpublish/re-publish cycle, use Lovable’s publish/domain settings to temporarily remove/unpublish the live deployment, then publish again. I can guide you, but I cannot fully unpublish from code.
   - Confirm publish visibility remains **public**.

6. **Validate live site after publishing**
   - Test:
     - `https://thedolphoon.com/`
     - `https://www.thedolphoon.com/` if configured
     - `https://bedtime-buddies-app.lovable.app/`
   - Check browser network/console for failed document loads, CORS errors, Supabase errors, or old service-worker behavior.

## Important note

The exact browser message `thedolphoon.com refused to connect` is normally DNS/CDN/domain routing or browser/network-level, not Supabase. However, cleaning all live URL references and republishing a fresh build is a reasonable recovery step before escalating to Lovable domain support.

<presentation-actions>
<presentation-link url="https://docs.lovable.dev/tips-tricks/troubleshooting">Troubleshooting docs</presentation-link>
</presentation-actions>