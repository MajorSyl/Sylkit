-- Sylkit startup marketplace: listings of small online businesses for sale, plus buyer inquiries/offers.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null check (length(title) between 3 and 90),
  tagline text not null check (length(tagline) between 10 and 200),
  description text check (length(description) <= 6000),
  category text not null check (category in ('saas','mobile_app','web_app','ecommerce','marketplace','content','ai','agency','other')),
  status text not null default 'pending' check (status in ('pending','active','under_offer','sold','rejected')),
  asking_price numeric(12,2) not null check (asking_price >= 0),
  annual_revenue numeric(12,2) not null default 0 check (annual_revenue >= 0),
  monthly_profit numeric(12,2) not null default 0,
  monthly_users integer check (monthly_users >= 0),
  age_months integer check (age_months >= 0),
  tech_stack text[] not null default '{}',
  included text[] not null default '{}',
  reason_for_selling text check (length(reason_for_selling) <= 1000),
  image_url text,
  demo_url text,
  website_url text,
  country text,
  featured boolean not null default false,
  sold_price numeric(12,2),
  sold_at timestamptz,
  seller_name text not null,
  seller_email text not null,
  seller_whatsapp text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists listings_status_idx on public.listings (status, featured desc, created_at desc);

alter table public.listings enable row level security;

-- Visitors see published listings, and only the public columns (seller contact stays private).
revoke all on public.listings from anon, authenticated;
grant select (id, slug, title, tagline, description, category, status, asking_price, annual_revenue, monthly_profit,
              monthly_users, age_months, tech_stack, included, reason_for_selling, image_url, demo_url, country,
              featured, sold_price, sold_at, created_at)
  on public.listings to anon, authenticated;
-- Signed-in users get the same public columns; only admins can change rows (policy below),
-- and admins read the private columns through admin_listings().
grant insert, update, delete on public.listings to authenticated;
drop policy if exists "public reads published listings" on public.listings;
create policy "public reads published listings" on public.listings for select to anon, authenticated
  using (status in ('active','under_offer','sold') or public.is_admin());
drop policy if exists "admins manage listings" on public.listings;
create policy "admins manage listings" on public.listings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create table if not exists public.listing_inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  kind text not null check (kind in ('info','offer')),
  name text not null,
  email text not null,
  whatsapp text,
  offer_amount numeric(12,2),
  message text,
  lang text not null default 'en',
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);
alter table public.listing_inquiries enable row level security;
revoke all on public.listing_inquiries from anon, authenticated;
grant select, update, delete on public.listing_inquiries to authenticated;
drop policy if exists "admins manage inquiries" on public.listing_inquiries;
create policy "admins manage inquiries" on public.listing_inquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Sellers submit a listing; it waits for admin review (status pending).
create or replace function public.submit_listing(
  p_title text, p_tagline text, p_description text, p_category text, p_asking_price numeric,
  p_annual_revenue numeric, p_monthly_profit numeric, p_monthly_users integer, p_age_months integer,
  p_tech_stack text[], p_included text[], p_reason text, p_website_url text, p_demo_url text, p_image_url text,
  p_country text, p_seller_name text, p_seller_email text, p_seller_whatsapp text)
returns json language plpgsql security definer set search_path = public as $$
declare base text; s text; n int := 0; recent int;
begin
  if coalesce(length(trim(p_seller_name)),0) < 2 then raise exception 'invalid_name'; end if;
  if p_seller_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if coalesce(length(trim(p_title)),0) < 3 or length(p_title) > 90 then raise exception 'invalid_title'; end if;
  if coalesce(length(trim(p_tagline)),0) < 10 or length(p_tagline) > 200 then raise exception 'invalid_tagline'; end if;
  if p_asking_price is null or p_asking_price < 100 or p_asking_price > 10000000 then raise exception 'invalid_price'; end if;
  select count(*) into recent from listings where lower(seller_email) = lower(p_seller_email) and created_at > now() - interval '1 day';
  if recent >= 5 then raise exception 'rate_limited'; end if;
  base := trim(both '-' from regexp_replace(lower(p_title), '[^a-z0-9]+', '-', 'g'));
  if base = '' then base := 'startup'; end if;
  s := left(base, 60);
  while exists (select 1 from listings where slug = s) loop n := n + 1; s := left(base, 56) || '-' || n; end loop;
  insert into listings (slug, title, tagline, description, category, asking_price, annual_revenue, monthly_profit, monthly_users,
    age_months, tech_stack, included, reason_for_selling, website_url, demo_url, image_url, country, seller_name, seller_email, seller_whatsapp)
  values (s, trim(p_title), trim(p_tagline), nullif(trim(p_description),''),
    case when p_category in ('saas','mobile_app','web_app','ecommerce','marketplace','content','ai','agency') then p_category else 'other' end,
    p_asking_price, greatest(coalesce(p_annual_revenue,0),0), coalesce(p_monthly_profit,0), p_monthly_users, p_age_months,
    coalesce(p_tech_stack,'{}'), coalesce(p_included,'{}'), nullif(trim(p_reason),''), nullif(trim(p_website_url),''),
    nullif(trim(p_demo_url),''), nullif(trim(p_image_url),''), nullif(trim(p_country),''),
    trim(p_seller_name), lower(trim(p_seller_email)), nullif(trim(p_seller_whatsapp),''));
  return json_build_object('slug', s);
end $$;
grant execute on function public.submit_listing(text,text,text,text,numeric,numeric,numeric,integer,integer,text[],text[],text,text,text,text,text,text,text,text) to anon, authenticated;

-- Buyers ask for details or make an offer on a published listing.
create or replace function public.create_listing_inquiry(p_slug text, p_kind text, p_name text, p_email text,
  p_whatsapp text, p_offer numeric, p_message text, p_lang text default 'en')
returns json language plpgsql security definer set search_path = public as $$
declare l listings; recent int;
begin
  select * into l from listings where slug = p_slug and status in ('active','under_offer');
  if l.id is null then raise exception 'invalid_listing'; end if;
  if coalesce(length(trim(p_name)),0) < 2 then raise exception 'invalid_name'; end if;
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'invalid_email'; end if;
  if p_kind = 'offer' and (p_offer is null or p_offer <= 0) then raise exception 'invalid_offer'; end if;
  select count(*) into recent from listing_inquiries where lower(email) = lower(p_email) and created_at > now() - interval '1 hour';
  if recent >= 10 then raise exception 'rate_limited'; end if;
  insert into listing_inquiries (listing_id, kind, name, email, whatsapp, offer_amount, message, lang)
  values (l.id, case when p_kind = 'offer' then 'offer' else 'info' end, trim(p_name), lower(trim(p_email)),
          nullif(trim(p_whatsapp),''), case when p_kind = 'offer' then p_offer end, left(nullif(trim(p_message),''), 3000),
          case when p_lang = 'es' then 'es' else 'en' end);
  return json_build_object('ok', true);
end $$;
grant execute on function public.create_listing_inquiry(text,text,text,text,text,numeric,text,text) to anon, authenticated;

-- Full listing rows (including seller contact) for admins only.
create or replace function public.admin_listings()
returns setof public.listings language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  return query select * from listings order by (status = 'pending') desc, created_at desc;
end $$;
grant execute on function public.admin_listings() to authenticated;
