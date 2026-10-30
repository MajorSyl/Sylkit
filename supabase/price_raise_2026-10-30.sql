-- Raise the plan prices (monthly + setup) of the 15 ready-made systems by 3%.
-- 30 Oct 2026. Run once in Supabase → SQL Editor (project chcljhwcvzlmxrrhetfv).
-- Safe to run twice: products already raised are marked and skipped.
-- Not changed: business website, custom mobile app, domains, hosting, extras, Sylkit Shield.

begin;

update public.products p
set
  pricing = jsonb_set(
    p.pricing,
    '{plans}',
    (
      select jsonb_agg(
        pl || jsonb_build_object(
          'monthly', round((pl->>'monthly')::numeric * 1.03, 2),
          'setup',   round((pl->>'setup')::numeric * 1.03, 2)
        )
        order by ord
      )
      from jsonb_array_elements(p.pricing->'plans') with ordinality as t(pl, ord)
    )
  ) || '{"price_raise_2026_10_30": true}'::jsonb,
  price_from = (
    select min(round((pl->>'monthly')::numeric * 1.03, 2))
    from jsonb_array_elements(p.pricing->'plans') as pl
  )
where p.slug in (
    'alertas-de-vencimiento', 'punto-de-venta', 'control-de-inventario',
    'asistente-ia-para-negocios', 'farmacia-pos', 'clinica-citas-historias',
    'restaurante-menu-qr', 'salon-barberia-reservas', 'taller-mecanico',
    'servicios-a-domicilio', 'gestion-escolar', 'nomina-asistencia',
    'facturacion', 'tienda-online-whatsapp', 'sitio-web-personal'
  )
  and jsonb_typeof(p.pricing->'plans') = 'array'
  and coalesce((p.pricing->>'price_raise_2026_10_30')::boolean, false) = false;

commit;

-- Check the result: 15 rows, each with its new prices.
select slug, price_from,
       (select jsonb_agg(jsonb_build_object('plan', pl->>'id', 'monthly', pl->'monthly', 'setup', pl->'setup'))
          from jsonb_array_elements(pricing->'plans') pl) as plans
from public.products
where pricing ? 'price_raise_2026_10_30'
order by sort;
