-- Read-only verification query for Supabase SQL Editor.

select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('site_content', 'store_settings')
order by table_name, ordinal_position;

select
  id,
  section_key,
  title,
  slug,
  is_featured,
  is_published,
  created_at,
  updated_at
from public.site_content
order by created_at desc;
