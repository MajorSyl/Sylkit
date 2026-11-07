-- Sylkit price review · 7 Nov 2026
-- Run once in Supabase → SQL Editor (project chcljhwcvzlmxrrhetfv). Safe to run again: it sets exact values.
-- Plans (Starter / Business / Pro, monthly USD):
--   Standard systems (POS, Inventory, Expiry alerts, Car workshop, Payroll, Online store, Salon, Invoicing): 19 / 45 / 79
--   Restaurant QR menu, Home services: 25 / 49 / 89
--   Clinic: 35 / 59 / 99
--   Pharmacy: stays 29 / 49 / 79 while the 10-founder offer runs (list price after that: 35 / 59 / 99)
--   School, AI assistant, websites (monthly), app (monthly): unchanged
-- Setups: personal website 149 / 249 / 449, business website 199 / 399 / 699, mobile app 1,499 / 2,999 / 5,999.
-- Hosting: 7 / 15 / 29 per month (only if hosting is a product row in the database).
-- Extras: API integration 250, app store publishing 250, online payments 150, SEO pack 120, data import 75,
--   on-site training 60, extra pages 40, extra branch 15/mo, priority support 25/mo.

begin;

with new(slug, plan_id, monthly, setup) as (
  values
    ('alertas-de-vencimiento', 'starter', 19, 59), ('alertas-de-vencimiento', 'business', 45, 119), ('alertas-de-vencimiento', 'pro', 79, 179),
    ('punto-de-venta', 'starter', 19, 59), ('punto-de-venta', 'business', 45, 119), ('punto-de-venta', 'pro', 79, 179),
    ('control-de-inventario', 'starter', 19, 59), ('control-de-inventario', 'business', 45, 119), ('control-de-inventario', 'pro', 79, 179),
    ('taller-mecanico', 'starter', 19, 59), ('taller-mecanico', 'business', 45, 119), ('taller-mecanico', 'pro', 79, 179),
    ('nomina-asistencia', 'starter', 19, 59), ('nomina-asistencia', 'business', 45, 119), ('nomina-asistencia', 'pro', 79, 179),
    ('tienda-online-whatsapp', 'starter', 19, 99), ('tienda-online-whatsapp', 'business', 45, 179), ('tienda-online-whatsapp', 'pro', 79, 279),
    ('salon-barberia-reservas', 'starter', 19, 59), ('salon-barberia-reservas', 'business', 45, 99), ('salon-barberia-reservas', 'pro', 79, 149),
    ('facturacion', 'starter', 19, 49), ('facturacion', 'business', 45, 79), ('facturacion', 'pro', 79, 129),
    ('restaurante-menu-qr', 'starter', 25, 79), ('restaurante-menu-qr', 'business', 49, 129), ('restaurante-menu-qr', 'pro', 89, 199),
    ('servicios-a-domicilio', 'starter', 25, 79), ('servicios-a-domicilio', 'business', 49, 129), ('servicios-a-domicilio', 'pro', 89, 199),
    ('clinica-citas-historias', 'starter', 35, 99), ('clinica-citas-historias', 'business', 59, 149), ('clinica-citas-historias', 'pro', 99, 279),
    ('sitio-web-personal', 'starter', 12, 149), ('sitio-web-personal', 'business', 19, 249), ('sitio-web-personal', 'pro', 29, 449),
    ('sitio-web-para-negocios', 'starter', 15, 199), ('sitio-web-para-negocios', 'business', 25, 399), ('sitio-web-para-negocios', 'pro', 39, 699),
    ('app-movil-a-medida', 'starter', 29, 1499), ('app-movil-a-medida', 'business', 49, 2999), ('app-movil-a-medida', 'pro', 89, 5999),
    ('hosting-web', 'starter', 7, 30), ('hosting-web', 'business', 15, 50), ('hosting-web', 'pro', 29, 80)
)
update public.products p
set pricing = jsonb_set(
  p.pricing, '{plans}',
  (
    select jsonb_agg(
      case when n.plan_id is null then pl
      else pl || jsonb_build_object('monthly', n.monthly, 'setup', n.setup) end
      order by ord)
    from jsonb_array_elements(p.pricing->'plans') with ordinality as t(pl, ord)
    left join new n on n.slug = p.slug and n.plan_id = pl->>'id'
  )
) || '{"price_review_2026_11_07": true}'::jsonb
where p.slug in (select distinct slug from new)
  and jsonb_typeof(p.pricing->'plans') = 'array';

-- "From" price = cheapest monthly plan.
update public.products p
set price_from = (select min((pl->>'monthly')::numeric) from jsonb_array_elements(p.pricing->'plans') pl)
where p.pricing ? 'price_review_2026_11_07';

-- Extras.
update public.addons a set price = v.price
from (values
  ('api_integration', 250), ('store_publishing', 250), ('online_payments', 150), ('seo_pack', 120),
  ('data_import', 75), ('onsite_training', 60), ('extra_pages', 40), ('extra_branch', 15), ('priority_support', 25)
) as v(id, price)
where a.id = v.id;

commit;

-- Check: the products and extras with their new prices.
select slug, price_from,
       (select jsonb_agg(jsonb_build_object('plan', pl->>'id', 'monthly', pl->'monthly', 'setup', pl->'setup')) from jsonb_array_elements(pricing->'plans') pl) as plans
from public.products where pricing ? 'price_review_2026_11_07' order by sort;
select id, price from public.addons
where id in ('api_integration','store_publishing','online_payments','seo_pack','data_import','onsite_training','extra_pages','extra_branch','priority_support')
order by id;
