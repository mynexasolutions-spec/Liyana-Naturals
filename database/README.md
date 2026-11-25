# Supabase SQL files

Run the files in `migrations` in timestamp order in the Supabase SQL Editor.

For the current admin Content and Blogs error, run:

1. All existing migration files through `20261124170000_production_wiring.sql`.
2. `migrations/20261124170500_repair_content_timestamps.sql`.
3. `migrations/20261125120000_responsive_homepage_banners.sql` to add and backfill separate desktop/mobile hero assets.
4. `migrations/20261125123000_featured_categories.sql` to add admin-controlled homepage category visibility.
5. `migrations/20261125130000_product_creation_hardening.sql` to enforce product JSON array shapes.
6. `migrations/20261125131500_category_image_hardening.sql` to enforce renderable category image URLs and ImageKit pairing.
7. `migrations/20261125133000_auth_hardening.sql` to synchronize Supabase Auth users with profiles and customers and apply customer self-read policy.
8. `migrations/20261125134500_inquiry_hardening.sql` to repair public inquiry inserts and keep admin inquiry access protected by RLS.
9. `migrations/20261125140000_homepage_banner_image_hardening.sql` to enforce renderable responsive banner URLs and ImageKit pairing.
10. `migrations/20261125141500_blog_content_hardening.sql` to add typed blog metadata, featured flags, validation, and realtime support.
11. `verify_content_schema.sql` to confirm the repair.

After the SQL migrations are applied, run `npm.cmd run migrate:product-images` once to reconcile product image records with ImageKit. The migration is idempotent and only updates `products.images` plus missing `media_assets` metadata.

The repair migration is safe to run more than once. It adds `site_content.created_at`, backfills existing rows, and keeps `updated_at` current for content and store settings.

## Auth deployment checklist

Configure these in Supabase Dashboard before production traffic:

Password reset links must allow the production `/auth/callback` URL. OAuth sign-in continues to use `/login`.

- Authentication → Providers → Email: enable Email, choose the production password minimum used by the app (8 characters), and turn **Confirm email** off for instant customer account creation without a verification email.
- Authentication → URL Configuration: set the production Site URL and allow the production `/auth/callback` URL for password resets and `/login` for OAuth sign-in.
- Authentication → SMTP: keep a verified production SMTP provider for password resets and other transactional mail. SMTP is not used for customer signup when Confirm email is off.
- Existing users created while Confirm email was on may remain unconfirmed; confirm those users in Supabase Auth or have them register again.
