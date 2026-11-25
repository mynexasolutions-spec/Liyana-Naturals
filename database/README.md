# Supabase SQL files

Run the files in `migrations` in timestamp order in the Supabase SQL Editor.

For the current admin Content and Blogs error, run:

1. All existing migration files through `20261124170000_production_wiring.sql`.
2. `migrations/20261124170500_repair_content_timestamps.sql`.
3. `migrations/20261125120000_responsive_homepage_banners.sql` to add and backfill separate desktop/mobile hero assets.
4. `migrations/20261125123000_featured_categories.sql` to add admin-controlled homepage category visibility.
5. `verify_content_schema.sql` to confirm the repair.

After the SQL migrations are applied, run `npm.cmd run migrate:product-images` once to reconcile product image records with ImageKit. The migration is idempotent and only updates `products.images` plus missing `media_assets` metadata.

The repair migration is safe to run more than once. It adds `site_content.created_at`, backfills existing rows, and keeps `updated_at` current for content and store settings.
