-- Replace the email with the account to promote.
insert into public.profiles (id, email, full_name, role, is_active)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', 'Administrator'),
  'admin',
  true
from auth.users u
where lower(u.email) = lower('adminliyana@gmail.com')
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  is_active = true,
  updated_at = now();

select id, email, role, is_active
from public.profiles
where lower(email) = lower('adminliyana@gmail.com');
