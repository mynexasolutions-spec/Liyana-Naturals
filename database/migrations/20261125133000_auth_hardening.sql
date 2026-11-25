-- Keep Supabase Auth, profiles, and customer records synchronized.
-- This trigger is intentionally idempotent so it is safe to reapply after a
-- deployment where an earlier trigger was missing or incomplete.
create or replace function public.sync_auth_user_records()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_full_name text;
  v_phone text;
  v_customer_id uuid;
begin
  v_email := lower(trim(coalesce(new.email, '')));
  if v_email = '' then
    return new;
  end if;

  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');
  v_full_name := coalesce(v_full_name, split_part(v_email, '@', 1));
  v_phone := nullif(trim(coalesce(new.raw_user_meta_data->>'phone', '')), '');

  insert into public.profiles (id, email, full_name, role, is_active)
  values (new.id, v_email, v_full_name, 'staff', true)
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();

  select id
  into v_customer_id
  from public.customers
  where auth_user_id = new.id
  limit 1;

  if v_customer_id is null then
    select id
    into v_customer_id
    from public.customers
    where lower(email) = v_email
      and auth_user_id is null
    limit 1;
  end if;

  if v_customer_id is null then
    insert into public.customers (auth_user_id, full_name, email, phone)
    values (new.id, v_full_name, v_email, v_phone)
    on conflict (email) do update
    set auth_user_id = excluded.auth_user_id,
        full_name = excluded.full_name,
        phone = coalesce(excluded.phone, public.customers.phone);
  else
    update public.customers
    set auth_user_id = new.id,
        full_name = v_full_name,
        email = v_email,
        phone = coalesce(v_phone, phone)
    where id = v_customer_id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_customer_created on auth.users;
drop trigger if exists on_auth_user_records_sync on auth.users;
create trigger on_auth_user_records_sync
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_auth_user_records();

-- Backfill accounts created before the synchronization trigger was installed.
insert into public.profiles (id, email, full_name, role, is_active)
select
  u.id,
  lower(trim(u.email)),
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(lower(trim(u.email)), '@', 1)),
  'staff',
  true
from auth.users u
where u.email is not null
on conflict (id) do update
set email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

insert into public.customers (auth_user_id, full_name, email, phone)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data->>'full_name'), ''), split_part(lower(trim(u.email)), '@', 1)),
  lower(trim(u.email)),
  nullif(trim(u.raw_user_meta_data->>'phone'), '')
from auth.users u
where u.email is not null
on conflict (email) do update
set auth_user_id = excluded.auth_user_id,
    full_name = excluded.full_name,
    phone = coalesce(excluded.phone, public.customers.phone);

-- Customers may read their own record for account/order screens; all writes
-- remain admin-only so Auth remains the source of truth for identity.
grant select on public.customers to authenticated;
drop policy if exists "customers read own" on public.customers;
create policy "customers read own" on public.customers
for select to authenticated
using (auth_user_id = auth.uid());
