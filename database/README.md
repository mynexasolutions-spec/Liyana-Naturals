# Supabase SQL files

Run the files in `migrations` in timestamp order in the Supabase SQL Editor.

For the current admin Content and Blogs error, run:

1. All existing migration files through `20261124170000_production_wiring.sql`.
2. `migrations/20261124170500_repair_content_timestamps.sql`.
3. `verify_content_schema.sql` to confirm the repair.

The repair migration is safe to run more than once. It adds `site_content.created_at`, backfills existing rows, and keeps `updated_at` current for content and store settings.
