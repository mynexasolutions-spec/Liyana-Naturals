-- Repair public inquiry submission permissions for deployments where the
-- original inquiries policy was not applied.
alter table public.inquiries enable row level security;

grant usage on schema public to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

drop policy if exists "public submit inquiries" on public.inquiries;
create policy "public submit inquiries" on public.inquiries
for insert to anon, authenticated
with check (
  status = 'new'
  and char_length(btrim(name)) between 2 and 120
  and char_length(btrim(email)) between 3 and 254
  and btrim(email) = lower(btrim(email))
  and btrim(email) ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  and char_length(btrim(subject)) between 1 and 160
  and btrim(subject) <> 'Select a Subject'
  and char_length(btrim(message)) between 10 and 5000
);

-- Keep the existing admin policy so authenticated admins can read and manage
-- inquiries from /admin/inquiries without exposing them to the public.
drop policy if exists "admin manage inquiries" on public.inquiries;
create policy "admin manage inquiries" on public.inquiries
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
