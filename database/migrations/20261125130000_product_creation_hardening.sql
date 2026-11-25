-- Keep product JSON fields compatible with the storefront and product API.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_ingredients_array_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_ingredients_array_check
      check (jsonb_typeof(ingredients) = 'array');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'products_benefits_array_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_benefits_array_check
      check (jsonb_typeof(benefits) = 'array');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'products_images_array_check'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_images_array_check
      check (jsonb_typeof(images) = 'array');
  end if;
end $$;
