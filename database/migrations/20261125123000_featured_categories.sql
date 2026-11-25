-- Keep existing active categories on the homepage while making future
-- category visibility an explicit admin-controlled setting.
alter table public.categories
  add column if not exists is_featured boolean;

update public.categories
set is_featured = true
where is_featured is null;

alter table public.categories
  alter column is_featured set default false,
  alter column is_featured set not null;

create index if not exists categories_featured_sort_idx
  on public.categories(is_featured, is_active, sort_order);
