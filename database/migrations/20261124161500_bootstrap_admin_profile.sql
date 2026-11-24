create or replace function public.ensure_admin_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt()->>'email', ''));
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if v_email <> lower('adminliyana@gmail.com') then
    raise exception 'This account is not configured as an administrator';
  end if;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (v_user_id, v_email, 'Administrator', 'admin', true)
  on conflict (id) do update
  set email = excluded.email,
      role = 'admin',
      is_active = true,
      updated_at = now()
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke execute on function public.ensure_admin_profile() from public, anon;
grant execute on function public.ensure_admin_profile() to authenticated;
