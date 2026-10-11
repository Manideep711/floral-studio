# Card editor and administration

Local admin page: `/admin/`. Sign in with the designated admin account. Permissions come from the `admin_members` table, never from a browser email check or user-editable metadata.

The additive schema in `supabase/migrations/20261011132911_admin_card_library.sql` has been applied to project `mpxubkidcbeuvovreasi`. One member was added for the email chosen in this chat. On a new project, apply the schema once and insert the intended existing user's ID into `admin_members` from a trusted database session. Do not run the schema again on the configured project.

Admin tools: upload/rename/reorder/disable card backgrounds; hide/restore garden entries; view 30-day aggregate page-view, card-download and card-share counts. Localhost, do-not-track requests and the admin page are excluded from tracking. These are aggregate activity counters, not unique visitors or financial/account analytics. No private drafts or card text are recorded. Counts start from installation and can be affected by retries or blocked requests.

The card editor has no default text. Backgrounds retain the decorative logos embedded in the supplied images. Text layers, font, colour, alignment, position and rotation are editable; the rendered arrangement can be moved, scaled, rotated or hidden. Optional URLs and QR codes are added only when chosen. Native share carries the image and a site URL; recipient apps may decide which fields to retain. A PNG cannot contain clickable hyperlinks.

Source changes remain uncommitted and unpushed for local review. The database schema and admin membership have been configured, but no existing garden entries were modified.
