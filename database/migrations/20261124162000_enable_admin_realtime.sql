-- Keep admin lists and public catalog consumers synchronized after mutations.
do $$
declare
  table_name text;
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) then
    foreach table_name in array array[
      'products',
      'categories',
      'orders',
      'customers',
      'reviews',
      'inquiries',
      'homepage_banners',
      'site_content',
      'store_settings'
    ] loop
      begin
        execute format(
          'alter publication supabase_realtime add table public.%I',
          table_name
        );
      exception when duplicate_object then
        null;
      end;
    end loop;
  end if;
end;
$$;
