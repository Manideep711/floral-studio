# Community garden setup

The `/garden/` route shows arranged 3D Bathukammas on a neutral plane, with pan, zoom, optional rotation, indexed neighborhood loading and close-range nickname labels. It has no public View action or 2D garden fallback. Authenticated owners can find their own entries and open them through My flowers. Without project configuration, it shows labelled studio samples in preview-only hex clusters. Samples are never uploaded; the app does not simulate sign-in or publication.

## Connect accounts and shared storage

1. Create or choose a Supabase project you own. Apply `supabase/garden.sql` once in its SQL editor. It creates the table, validation, owner quota, column grants, and row-level security policies. Keep RLS enabled.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project settings. These are browser-safe values. **Never put a service role or secret key in a NEXT_PUBLIC variable.**
3. In Supabase Authentication, enable email/password sign-in. The app offers Sign in, Create account, Forgot password and a recovery form. New passwords require at least 8 characters and confirmation; Supabase remains authoritative for password rules.
4. In Supabase URL Configuration, add the exact local redirect `http://127.0.0.1:3002/garden/` and your deployed HTTPS `/garden/` URL. If developing on another port, add that exact origin and path as well. Set the production Site URL to your deployed site.
5. Keep the signup confirmation and password recovery templates' normal confirmation URLs so Supabase completes the PKCE redirect. Open confirmation and reset links in the same browser that requested them. This client-only app deliberately uses browser PKCE sessions, with Supabase enforcing database permissions; there are no server routes relying on a client session.
6. Configure an email sender/SMTP suitable for production and test delivery. Rebuild and restart the app after changing NEXT_PUBLIC values because Next.js embeds them at build time.

Use the official [email/password guide](https://supabase.com/docs/guides/auth/passwords), [PKCE guide](https://supabase.com/docs/guides/auth/sessions/pkce-flow), and [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Publication flow

Creation and device-local draft saving require no account. “Add mine to the garden” in the bloom viewer stores a separate, validated pending snapshot locally for up to seven days and opens the garden. Sign-in alone does not create a public database row. After sign-in, the user reviews the arrangement, public title, and public display name and checks an initially unchecked consent box. Only “Publish to garden” inserts a row. Public snapshot serialization strips unknown fields and the private dedication. Email and account profile data are not displayed or included in the creation payload.

Each publication is an immutable snapshot. Returning to the editor and changing flowers does not change public entries. “My flowers” lists the signed-in user's entries; removal has a separate confirmation. Deleting a garden entry leaves the studio draft untouched. Each owner can have up to 12 entries. Entries occupy deterministic hexagonal spiral slots with slight visual jitter; deleted slots are not reused. The newest public creation anchors the initial view. Movement queries indexed nearby cells (at most 61 entries per request), debounced by 450 ms. The cache is capped at 160 entries; refreshed neighborhoods replace stale rows, including removals. New contributions appear on refresh. Recenter returns to the current anchor. There is no realtime presence or auto-publication.

The table contains only public creations, no private cloud drafts. Browser roles cannot update a snapshot or set the `hidden` moderation flag. An administrator can hide a creation in Supabase; guests cannot read hidden rows, while its owner can still see/remove it. Account deletion cascades to the owner's public creations. Public account UUIDs exist in the table for ownership; account emails and auth profiles remain in Supabase Auth. Do not add private user information to this table.

## Validation and remaining setup

`npm.cmd test` includes an in-memory **real Postgres engine** test through PGlite, using a minimal local fixture for Supabase's auth roles and UID/JWT functions. It applies the shipped SQL and verifies guest read-only access, authenticated owner checks, explicit consent, malformed-design rejection, immutable snapshots, moderator hiding, owner-only deletion and the 12-entry quota. The fixture is confined to tests and is not an authentication implementation.

Hosted Supabase public API connectivity is verified. Live account creation, confirmation email delivery, password recovery and multi-device publication/removal still require end-to-end checks. Verify those before launching. Check cancellation and expired links, guest reads, publication after consent, persistence in a second browser, one owner being unable to delete another owner's entry, removal, and hidden-row visibility. Enable appropriate auth anti-abuse controls and establish an administrative moderation process before inviting broad public traffic. The Mumbai Supabase schema is installed; hosting deployment remains pending.

Accent update: new projects use the current garden.sql. If you already installed the previous schema, apply accent-upgrade.sql to validate the optional accent settings. See festival-courtyard.md for the scene controls and editor feature.


Existing databases also need supabase/spatial-upgrade.sql. Fresh garden.sql already includes this idempotent migration. It adds generated hex coordinates, sector indexes and a bounded security-invoker garden_nearby RPC; existing creations and ownership are preserved. See deployment.md for hosting and scaling.
