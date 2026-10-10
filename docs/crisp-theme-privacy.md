# Crisp theme and public-name visibility

Replaced yellow/cream UI chrome with cool white and slate surfaces, deeper green/teal accents and stronger text contrast. The original colored flowers and gold plate remain. The studio 3D floor, fog and background now match the neutral UI. Garden/card feature redesign remains paused.

The garden directory now lists arrangement titles only; public maker names and loaded-record counts have been removed from its rows/header. Browse, Find in scene and Open remain available. Selecting a creation still shows its consented public nickname. Publication now explicitly asks for a public nickname and says that the nickname/title/arrangement are public through the garden API.

This reduces prominent on-screen exposure; it does not make existing public data private. The client requests only id, slot, title, creator_name, design and created_at for browsing. It does not fetch account emails or Google auth profiles for display. Public SELECT grants/policies, including existing ownership UUID visibility, are unchanged. A UUID is not an authentication credential, but can be a correlation identifier. No identity-concealment or full security-audit claim is made. Real provider setup remains unconfigured in the current local preview.

The existing Postgres tests verify public read-only behavior, consent, owner-only writes/removal, hidden-row visibility and quota. All 29 tests, TypeScript and the production build pass. Browser verified the refreshed theme and the removal of maker-name rows from the directory. Authentication data and user drafts were not edited.

For backend access control, [Supabase documents grants and row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security); hiding a field in the interface is not access control.
