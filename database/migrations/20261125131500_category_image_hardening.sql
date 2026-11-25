-- Keep category image URLs renderable and paired with their ImageKit asset IDs.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'categories_image_url_check'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_image_url_check
      check (image_url is null or image_url ~ '^(/|https?://)');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'categories_image_file_pair_check'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_image_file_pair_check
      check (image_file_id is null or image_url is not null);
  end if;
end $$;
