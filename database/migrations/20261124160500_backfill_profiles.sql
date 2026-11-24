-- Backfill profile rows for existing Supabase Auth users.
-- Safe to run multiple times.
insert into public.profiles (id, email, full_name, role, is_active)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'staff',
  true
from auth.users u
where u.email is not null
on conflict (id) do update
set
  email = excluded.email,
  updated_at = now();
