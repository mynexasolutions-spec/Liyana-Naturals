-- Production hardening for the existing Supabase foundation.
-- Blog posts and extended store settings are stored as typed site_content rows so
-- the migration remains compatible with the already deployed schema.

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to anon, authenticated;

drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews
  for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "public submit reviews" on public.reviews;
create policy "public submit reviews" on public.reviews
  for insert to anon, authenticated
  with check (status = 'pending' and customer_id is null);

create unique index if not exists media_assets_imagekit_file_id_idx
  on public.media_assets(imagekit_file_id);

create or replace function public.sync_product_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_product_id uuid;
begin
  affected_product_id := coalesce(new.product_id, old.product_id);

  if affected_product_id is not null then
    update public.products
    set
      rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from public.reviews
        where product_id = affected_product_id and status = 'approved'
      ), 0),
      review_count = (
        select count(*)
        from public.reviews
        where product_id = affected_product_id and status = 'approved'
      )
    where id = affected_product_id;
  end if;

  if tg_op = 'update' and old.product_id is distinct from new.product_id
     and old.product_id is not null then
    update public.products
    set
      rating = coalesce((
        select round(avg(rating)::numeric, 1)
        from public.reviews
        where product_id = old.product_id and status = 'approved'
      ), 0),
      review_count = (
        select count(*)
        from public.reviews
        where product_id = old.product_id and status = 'approved'
      )
    where id = old.product_id;
  end if;

  if tg_op = 'delete' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_product_review_stats on public.reviews;
create trigger sync_product_review_stats
after insert or update or delete on public.reviews
for each row execute function public.sync_product_review_stats();

create or replace function public.sync_customer_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is not null then
    insert into public.customers (auth_user_id, full_name, email, phone)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
      lower(new.email),
      nullif(new.raw_user_meta_data->>'phone', '')
    )
    on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        full_name = excluded.full_name,
        phone = coalesce(excluded.phone, public.customers.phone);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_customer_created on auth.users;
create trigger on_auth_user_customer_created
after insert on auth.users
for each row execute function public.sync_customer_from_auth_user();

insert into public.customers (auth_user_id, full_name, email, phone)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1)),
  lower(u.email),
  nullif(u.raw_user_meta_data->>'phone', '')
from auth.users u
where u.email is not null
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.customers.phone);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.reviews;
    exception when duplicate_object then
      null;
    end;
    begin
      alter publication supabase_realtime add table public.media_assets;
    exception when duplicate_object then
      null;
    end;
  end if;
end;
$$;
