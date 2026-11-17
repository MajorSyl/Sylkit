-- Backend (admin) powers: overview numbers, customer accounts, suspend/restore, admin list.
-- Every function checks is_admin() first, so only accounts in public.admins can use them.

create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = public, auth as $$
declare r jsonb;
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  select jsonb_build_object(
    'orders_total',      (select count(*) from orders),
    'orders_week',       (select count(*) from orders where created_at > now() - interval '7 days'),
    'needs_action',      (select count(*) from orders where status in ('new','accepted','payment_submitted')),
    'payments_to_check', (select count(*) from orders where status = 'payment_submitted'),
    'new_requests',      (select count(*) from orders where status = 'new'),
    'in_progress',       (select count(*) from orders where status = 'in_progress'),
    'collected',         (select coalesce(sum(quote_amount),0) from orders where status in ('paid','in_progress','delivered')),
    'pipeline',          (select coalesce(sum(quote_amount),0) from orders where status in ('quoted','accepted','payment_submitted')),
    'customers_total',   (select count(*) from auth.users),
    'customers_week',    (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'suspended',         (select count(*) from auth.users where banned_until > now()),
    'admins',            (select count(*) from admins)
  ) into r;
  return r;
end $$;

create or replace function public.admin_list_customers(p_search text default '')
returns table (id uuid, email text, name text, provider text, created_at timestamptz, last_sign_in_at timestamptz,
               suspended boolean, is_admin boolean, orders bigint, paid numeric)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  return query
  select u.id, u.email::text,
         coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')::text,
         coalesce(u.raw_app_meta_data->>'provider', 'email')::text,
         u.created_at, u.last_sign_in_at,
         coalesce(u.banned_until > now(), false),
         exists (select 1 from admins a where a.user_id = u.id),
         (select count(*) from orders o where lower(o.email) = lower(u.email)),
         (select coalesce(sum(o.quote_amount),0) from orders o where lower(o.email) = lower(u.email) and o.status in ('paid','in_progress','delivered'))
  from auth.users u
  where coalesce(p_search,'') = '' or u.email ilike '%'||p_search||'%'
        or coalesce(u.raw_user_meta_data->>'full_name','') ilike '%'||p_search||'%'
  order by u.created_at desc
  limit 500;
end $$;

create or replace function public.admin_set_suspended(p_user uuid, p_suspend boolean)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if p_user = auth.uid() then raise exception 'cannot_suspend_self'; end if;
  if p_suspend and exists (select 1 from admins where user_id = p_user) then raise exception 'remove_admin_first'; end if;
  update auth.users set banned_until = case when p_suspend then 'infinity'::timestamptz else null end where id = p_user;
  if p_suspend then
    delete from auth.sessions where user_id = p_user;   -- signs them out everywhere
  end if;
end $$;

create or replace function public.admin_set_admin(p_user uuid, p_admin boolean)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'not_admin'; end if;
  if p_admin then
    if exists (select 1 from auth.users where id = p_user and banned_until > now()) then raise exception 'restore_first'; end if;
    insert into admins (user_id) values (p_user) on conflict do nothing;
  else
    if p_user = auth.uid() then raise exception 'cannot_remove_self'; end if;
    delete from admins where user_id = p_user;
  end if;
end $$;

revoke all on function public.admin_overview() from public, anon;
revoke all on function public.admin_list_customers(text) from public, anon;
revoke all on function public.admin_set_suspended(uuid, boolean) from public, anon;
revoke all on function public.admin_set_admin(uuid, boolean) from public, anon;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_list_customers(text) to authenticated;
grant execute on function public.admin_set_suspended(uuid, boolean) to authenticated;
grant execute on function public.admin_set_admin(uuid, boolean) to authenticated;
