-- Repair site_content for existing Supabase databases.
-- Run after 20261124153000_admin_foundation.sql.

alter table public.site_content
  add column if not exists created_at timestamptz;

update public.site_content
set created_at = coalesce(created_at, updated_at, now())
where created_at is null;

alter table public.site_content
  alter column created_at set default now(),
  alter column created_at set not null;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_store_settings_updated_at on public.store_settings;
create trigger set_store_settings_updated_at
before update on public.store_settings
for each row execute function public.set_updated_at();

create index if not exists site_content_created_idx
  on public.site_content(created_at desc);
