-- Repair migration for databases where the admin foundation tables already
-- exist but their Supabase role privileges were never granted.
-- RLS policies remain the row-level security boundary.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.inquiries to authenticated;
grant select, insert, update, delete on public.homepage_banners to authenticated;
grant select, insert, update, delete on public.site_content to authenticated;
grant select, insert, update, delete on public.store_settings to authenticated;
grant select, insert, update, delete on public.media_assets to authenticated;

grant select on public.categories, public.products, public.site_content,
  public.homepage_banners, public.store_settings to anon;
grant select on public.categories, public.products, public.site_content,
  public.homepage_banners, public.store_settings to authenticated;
grant insert on public.inquiries to anon;
grant execute on function public.is_admin() to anon, authenticated;
