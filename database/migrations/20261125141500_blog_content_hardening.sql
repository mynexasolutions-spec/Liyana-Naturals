-- Store editable blog metadata in typed columns while retaining body JSON for
-- existing rich article sections and backwards compatibility.
alter table public.site_content
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists category text,
  add column if not exists read_time text,
  add column if not exists published_at text,
  add column if not exists cover_image text,
  add column if not exists cover_image_file_id text,
  add column if not exists tags jsonb not null default '[]'::jsonb,
  add column if not exists key_takeaways jsonb not null default '[]'::jsonb,
  add column if not exists author_name text,
  add column if not exists author_role text,
  add column if not exists author_bio text,
  add column if not exists content text,
  add column if not exists is_featured boolean not null default false;

update public.site_content
set
  slug = coalesce(nullif(slug, ''), body->>'slug', substring(section_key from 6)),
  excerpt = coalesce(excerpt, body->>'excerpt', subtitle),
  category = coalesce(category, body->>'category', 'Journal'),
  read_time = coalesce(read_time, body->>'readTime', ''),
  published_at = coalesce(published_at, body->>'publishedAt', to_char(updated_at, 'Mon DD, YYYY')),
  cover_image = coalesce(cover_image, body->>'coverImage'),
  cover_image_file_id = coalesce(cover_image_file_id, body->>'coverImageFileId'),
  tags = case when jsonb_typeof(body->'tags') = 'array' then body->'tags' else tags end,
  key_takeaways = case when jsonb_typeof(body->'keyTakeaways') = 'array' then body->'keyTakeaways' else key_takeaways end,
  author_name = coalesce(author_name, body->'author'->>'name', 'Liyana Naturals'),
  author_role = coalesce(author_role, body->'author'->>'role'),
  author_bio = coalesce(author_bio, body->'author'->>'bio'),
  content = coalesce(content, body->>'content'),
  is_featured = case
    when lower(coalesce(body->>'featured', 'false')) in ('true', 't', '1', 'yes') then true
    else is_featured
  end
where section_key like 'blog:%';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'site_content_blog_arrays_check'
      and conrelid = 'public.site_content'::regclass
  ) then
    alter table public.site_content
      add constraint site_content_blog_arrays_check
      check (
        section_key not like 'blog:%'
        or (jsonb_typeof(tags) = 'array' and jsonb_typeof(key_takeaways) = 'array')
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'site_content_blog_image_url_check'
      and conrelid = 'public.site_content'::regclass
  ) then
    alter table public.site_content
      add constraint site_content_blog_image_url_check
      check (
        section_key not like 'blog:%'
        or cover_image is null
        or cover_image ~ '^(/|https?://)'
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'site_content_blog_image_pair_check'
      and conrelid = 'public.site_content'::regclass
  ) then
    alter table public.site_content
      add constraint site_content_blog_image_pair_check
      check (
        section_key not like 'blog:%'
        or cover_image_file_id is null
        or cover_image is not null
      );
  end if;
end $$;

create unique index if not exists site_content_blog_slug_idx
  on public.site_content(slug)
  where section_key like 'blog:%' and slug is not null;

create index if not exists site_content_blog_featured_idx
  on public.site_content(is_featured, is_published, updated_at desc)
  where section_key like 'blog:%';

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.site_content;
    exception when duplicate_object then
      null;
    end;
  end if;
end;
$$;
