# Deploying Digital Bathukamma

## Current source preparation

The active Supabase project is `bathukamma` (`mpxubkidcbeuvovreasi`) in Mumbai. Its garden schema and ownership policies are installed. Local `.env.local` points to it with live mode required. Public table reads and the nearby RPC returned HTTP 200; the garden is empty. Security advisors reported no findings. Email authentication is enabled; the app uses email/password instead of Google or magic-link sign-in. Production SMTP, redirect URLs and end-to-end sign-in/publication still require verification. The earlier Tokyo project is no longer used by this build.

Use `work/digital-bathukamma` as the repository root; it contains package.json and vercel.json. A local Git repository on main is initialized. No remote, commit, push or cloud deployment has been created. Node 24 is declared in .nvmrc and package.json. Sharp is now a direct build dependency for generating template previews. The blank .env.example is trackable; .env.local and .vercel are ignored.

Run `npm ci`, then `npm run verify`: tests, the complete production build including generated assets, and TypeScript checks. GitHub CI is prepared in .github/workflows/check.yml but has not run on GitHub. Set `REQUIRE_LIVE_GARDEN=1` in the hosting platform to reject missing live Supabase configuration. The prebuild check also rejects partial settings and privileged keys without printing key values. Passing it checks configuration shape, not live connectivity.

The website is a static Next.js export. `npm run build` creates `out/`; studio rendering, card export and the garden run in the browser. Supabase provides optional authentication and public data. No Node server or Vercel function is needed in production.

## Choose a host

Cloudflare Pages is a good fit for this static build. In a Git-connected Pages project, use the **Next.js (Static HTML Export)** preset, build command `npm run build`, output directory `out`, and Node 24. Alternatively upload the contents of the provided static-site ZIP through Pages Direct Upload. The ZIP currently has no Supabase configuration and therefore opens in labelled sample mode.

For Vercel, import the source repository, choose **Other** as the framework preset, build command `npm run build`, and output directory `out`. The included vercel.json sets the static build explicitly. Vercel Hobby is intended for personal, non-commercial use; check eligibility for your event.

Official guides: [Cloudflare static Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/), [Vercel Hobby](https://vercel.com/docs/plans/hobby).

## Connect the live garden

1. In your Supabase project, apply `supabase/garden.sql` for a fresh database. Existing installations need `accent-upgrade.sql` if not already applied, then `spatial-upgrade.sql`. Do not replace or delete existing rows.
2. Set build environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` on your host. Use the browser-safe publishable key, never a secret/service-role key. Rebuild after changing them; static exports embed public values at build time.
3. Enable email/password authentication in Supabase. Configure custom SMTP for signup confirmations and password recovery in production. Supabase's default SMTP is intended for development and restricted recipients. Follow community-garden.md and the [SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).
4. Set Supabase Site URL to your deployed HTTPS origin and allow the exact `https://YOUR-DOMAIN/garden/` redirect (include the trailing slash). Add `http://127.0.0.1:3002/garden/` only for local testing.
5. Verify real account creation, email confirmation, password sign-in and recovery, consent publication, guest browsing, persistence on another device, owner-only removal and moderator hiding. Provider credentials were not available during implementation, so these live checks are still required.

Card download needs no account. Native image sharing depends on browser support and HTTPS; PNG download remains available when file sharing is unsupported. Signing in never publishes a design automatically.

## Mobile and growth

- Placements grow in circular hexagonal rings, with gentle deterministic irregularity and plate separation. Database-assigned slots remain stable.
- Each nearby query returns at most 61 records, using indexed hex sectors and row-level security. Camera movement is debounced; the browser cache holds at most 160 records. Updated regions purge removed/hidden entries from that region.
- Mobile/light mode renders at most 12 nearby Bathukammas, with a 700-head detail budget across at most two arrangements. Desktop renders at most 24 arrangements, with a 1,600-head detail budget across at most four. One close large entry can exceed that budget. Remaining flowers use shared lightweight petal meshes.
- The garden has no people, public View action or 2D fallback. Close-range nicknames appear on the right. Owners have Find my Bathukamma, green plate outlines, and editor access through My flowers.
- Flower buffers and camera controls persist across updates. Demand rendering avoids an idle loop. Detail reconciliation waits for a 160 ms input pause; active entries remain anchored while in view, with offscreen slots recycled. Pan is the default and rotation is optional.
- Cards are generated on-device; their PNGs are not uploaded to cloud storage. Each account can publish at most 12 snapshots.

This bounds work per view, not total operating cost. Auth email, database size, query traffic and bandwidth still count against provider limits. Supabase Free uses a shared database and limited storage/egress; check [current pricing](https://supabase.com/pricing) before inviting a large audience. Monitor database/API usage and auth abuse, moderate public entries, and load-test realistic concurrent traffic. The 3,000-row database fixture and 100,000-slot layout test verify functionality, not unlimited capacity or phone GPU performance.

## Local verification

Use Node 24 and run `npm ci`, `npm run verify`, then `npm start -- --port 3002`. The start script previews exported files on loopback. All 45 automated tests, TypeScript and the complete static production build pass locally, including 96 regenerated template previews. Browser checks cover garden navigation, stable slots, buffer reuse, labels, studio interaction and draft preservation. Physical Android/iOS GPU and OS share-sheet delivery still need device testing. Live hosted authentication and routing await the connected projects.

The user created the Supabase project manually, and the garden schema was installed through the connector. No hosting deployment has been created.
