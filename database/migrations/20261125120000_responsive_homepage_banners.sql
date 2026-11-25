-- Store art-directed hero assets while keeping image_url/image_file_id as the
-- desktop compatibility fields used by older records and integrations.
alter table public.homepage_banners
  add column if not exists desktop_image_url text,
  add column if not exists desktop_image_file_id text,
  add column if not exists mobile_image_url text,
  add column if not exists mobile_image_file_id text;

update public.homepage_banners
set
  desktop_image_url = coalesce(desktop_image_url, image_url),
  desktop_image_file_id = coalesce(desktop_image_file_id, image_file_id),
  mobile_image_url = coalesce(mobile_image_url, image_url),
  mobile_image_file_id = coalesce(mobile_image_file_id, image_file_id)
where desktop_image_url is null
   or desktop_image_file_id is null
   or mobile_image_url is null
   or mobile_image_file_id is null;

alter table public.homepage_banners
  alter column desktop_image_url set not null,
  alter column mobile_image_url set not null;

create index if not exists homepage_banners_active_sort_idx
  on public.homepage_banners(is_active, sort_order);
