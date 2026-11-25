-- Keep responsive homepage banner image paths renderable and paired with
-- the ImageKit asset IDs used by the admin uploader.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'homepage_banners_image_url_check'
      and conrelid = 'public.homepage_banners'::regclass
  ) then
    alter table public.homepage_banners
      add constraint homepage_banners_image_url_check
      check (
        (image_url is null or image_url ~ '^(/|https?://)')
        and desktop_image_url ~ '^(/|https?://)'
        and mobile_image_url ~ '^(/|https?://)'
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'homepage_banners_image_file_pair_check'
      and conrelid = 'public.homepage_banners'::regclass
  ) then
    alter table public.homepage_banners
      add constraint homepage_banners_image_file_pair_check
      check (
        (image_file_id is null or image_url is not null)
        and (desktop_image_file_id is null or desktop_image_url is not null)
        and (mobile_image_file_id is null or mobile_image_url is not null)
      );
  end if;
end $$;
