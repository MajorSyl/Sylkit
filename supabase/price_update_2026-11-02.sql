-- Sylkit price and packaging update · 2 Nov 2026
-- Run once in Supabase → SQL Editor (project chcljhwcvzlmxrrhetfv). Safe to run again: it sets exact values,
-- and only adds text that is not there yet.
-- Changes 17 products: Pharmacy, Expiry Alerts, POS, Inventory, Car workshop, Payroll, Clinic, Restaurant,
-- Home services, Salon & barbershop, School, Invoicing, Online store, Personal website, Business website,
-- Custom mobile app, AI assistant. Not changed: domains, hosting, extras, Sylkit Shield, pricing rules.
--   Prices: exact monthly and setup per plan (yearly = monthly × 10 and buy once = monthly × 30 keep working).
--   Pharmacy: support level per plan, same-day support on Business, founding offer badge and description.
--   AI note: "Connect your own AI" on Pharmacy and Clinic (Business, Pro) and on the Pro plan of the other systems.

begin;

with new(slug, plan_id, monthly, setup, add_ai, includes) as (
  values
    ('farmacia-pos', 'starter', 29, 79, false, '[{"es": "1 sucursal · hasta 3 usuarios", "en": "1 branch · up to 3 users"}, {"es": "Todas las funciones principales", "en": "All core features"}, {"es": "Soporte: respuesta el siguiente día hábil", "en": "Support: reply by the next business day"}, {"es": "Actualizaciones incluidas", "en": "Updates included"}]'::jsonb),
    ('farmacia-pos', 'business', 49, 129, false, '[{"es": "Hasta 3 sucursales · 10 usuarios", "en": "Up to 3 branches · 10 users"}, {"es": "Reportes avanzados", "en": "Advanced reports"}, {"es": "Capacitación en línea para tu equipo", "en": "Online training for your team"}, {"es": "Soporte el mismo día en horario laboral", "en": "Same-day support during office hours"}, {"es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API", "en": "Connect your own AI (Claude, OpenAI or other) with your API key"}, {"es": "Todo lo del plan Inicial", "en": "Everything in Starter"}]'::jsonb),
    ('farmacia-pos', 'pro', 79, 199, false, '[{"es": "Sucursales y usuarios ilimitados", "en": "Unlimited branches and users"}, {"es": "Soporte con máxima prioridad en horario laboral", "en": "Highest-priority support during office hours"}, {"es": "Copias de seguridad diarias", "en": "Daily backups"}, {"es": "Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API", "en": "Connect your own AI (Claude, OpenAI or other) with your API key"}, {"es": "Todo lo del plan Negocio", "en": "Everything in Business"}]'::jsonb),
    ('alertas-de-vencimiento', 'starter', 19, 59, false, null::jsonb),
    ('alertas-de-vencimiento', 'business', 35, 119, false, null::jsonb),
    ('alertas-de-vencimiento', 'pro', 59, 179, true, null::jsonb),
    ('punto-de-venta', 'starter', 19, 59, false, null::jsonb),
    ('punto-de-venta', 'business', 35, 119, false, null::jsonb),
    ('punto-de-venta', 'pro', 59, 179, true, null::jsonb),
    ('control-de-inventario', 'starter', 19, 59, false, null::jsonb),
    ('control-de-inventario', 'business', 35, 119, false, null::jsonb),
    ('control-de-inventario', 'pro', 59, 179, true, null::jsonb),
    ('taller-mecanico', 'starter', 19, 59, false, null::jsonb),
    ('taller-mecanico', 'business', 35, 119, false, null::jsonb),
    ('taller-mecanico', 'pro', 59, 179, true, null::jsonb),
    ('nomina-asistencia', 'starter', 19, 59, false, null::jsonb),
    ('nomina-asistencia', 'business', 35, 119, false, null::jsonb),
    ('nomina-asistencia', 'pro', 59, 179, true, null::jsonb),
    ('clinica-citas-historias', 'starter', 29, 99, false, null::jsonb),
    ('clinica-citas-historias', 'business', 49, 149, true, null::jsonb),
    ('clinica-citas-historias', 'pro', 89, 279, true, null::jsonb),
    ('restaurante-menu-qr', 'starter', 25, 79, false, null::jsonb),
    ('restaurante-menu-qr', 'business', 39, 129, false, null::jsonb),
    ('restaurante-menu-qr', 'pro', 69, 199, true, null::jsonb),
    ('servicios-a-domicilio', 'starter', 25, 79, false, null::jsonb),
    ('servicios-a-domicilio', 'business', 39, 129, false, null::jsonb),
    ('servicios-a-domicilio', 'pro', 69, 199, true, null::jsonb),
    ('salon-barberia-reservas', 'starter', 19, 59, false, null::jsonb),
    ('salon-barberia-reservas', 'business', 29, 99, false, null::jsonb),
    ('salon-barberia-reservas', 'pro', 49, 149, true, null::jsonb),
    ('gestion-escolar', 'starter', 35, 119, false, null::jsonb),
    ('gestion-escolar', 'business', 69, 219, false, null::jsonb),
    ('gestion-escolar', 'pro', 119, 399, true, null::jsonb),
    ('facturacion', 'starter', 15, 49, false, null::jsonb),
    ('facturacion', 'business', 25, 79, false, null::jsonb),
    ('facturacion', 'pro', 45, 129, true, null::jsonb),
    ('tienda-online-whatsapp', 'starter', 19, 99, false, null::jsonb),
    ('tienda-online-whatsapp', 'business', 35, 179, false, null::jsonb),
    ('tienda-online-whatsapp', 'pro', 59, 279, false, null::jsonb),
    ('sitio-web-personal', 'starter', 12, 149, false, null::jsonb),
    ('sitio-web-personal', 'business', 19, 249, false, null::jsonb),
    ('sitio-web-personal', 'pro', 29, 399, false, null::jsonb),
    ('sitio-web-para-negocios', 'starter', 15, 179, false, null::jsonb),
    ('sitio-web-para-negocios', 'business', 25, 349, false, null::jsonb),
    ('sitio-web-para-negocios', 'pro', 39, 549, false, null::jsonb),
    ('app-movil-a-medida', 'starter', 29, 999, false, null::jsonb),
    ('app-movil-a-medida', 'business', 49, 1999, false, null::jsonb),
    ('app-movil-a-medida', 'pro', 89, 3799, false, null::jsonb),
    ('asistente-ia-para-negocios', 'starter', 35, 119, false, null::jsonb),
    ('asistente-ia-para-negocios', 'business', 69, 219, false, null::jsonb),
    ('asistente-ia-para-negocios', 'pro', 119, 399, true, null::jsonb)
),
ai as (select jsonb_build_object('es', 'Conecta tu propia IA (Claude, OpenAI u otra) con tu clave de API', 'en', 'Connect your own AI (Claude, OpenAI or other) with your API key') as item)
update public.products p
set pricing = jsonb_set(
  p.pricing, '{plans}',
  (
    select jsonb_agg(
      case when n.plan_id is null then pl
      else (pl || jsonb_build_object('monthly', n.monthly, 'setup', n.setup))
        || case
             when n.includes is not null then jsonb_build_object('includes', n.includes)
             when n.add_ai and not coalesce(pl->'includes' @> jsonb_build_array(jsonb_build_object('en', 'Connect your own AI (Claude, OpenAI or other) with your API key')), false) then
               jsonb_build_object('includes',
                 case when jsonb_array_length(coalesce(pl->'includes', '[]'::jsonb)) = 0 then jsonb_build_array((select item from ai))
                 else ((pl->'includes') - (jsonb_array_length(pl->'includes') - 1))
                      || jsonb_build_array((select item from ai))
                      || jsonb_build_array((pl->'includes')->(jsonb_array_length(pl->'includes') - 1))
                 end)
             else '{}'::jsonb
           end
      end
      order by ord)
    from jsonb_array_elements(p.pricing->'plans') with ordinality as t(pl, ord)
    left join new n on n.slug = p.slug and n.plan_id = pl->>'id'
  )
) || '{"price_update_2026_11_02": true}'::jsonb
where p.slug in (select distinct slug from new)
  and jsonb_typeof(p.pricing->'plans') = 'array';

-- "From" price = cheapest monthly plan.
update public.products p
set price_from = (select min((pl->>'monthly')::numeric) from jsonb_array_elements(p.pricing->'plans') pl)
where p.pricing ? 'price_update_2026_11_02';

-- Pharmacy: founding offer badge and packaging notes (added once, keeps any edits you made in Admin).
update public.products set
  badge_es = '10 farmacias fundadoras: instalación $0',
  badge_en = '10 founding pharmacies: $0 setup',
  description_es = description_es || ' Oferta fundadora: las primeras 10 farmacias no pagan instalación ($0) y reciben importación de datos y capacitación gratis, garantía de 60 días y su precio congelado por 12 meses. Recomendamos el plan Negocio. Soporte de lunes a sábado de 9:00 a 18:00 (hora de Caracas): Inicial responde el siguiente día hábil, Negocio el mismo día y Pro con máxima prioridad. Para funciones avanzadas puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API.',
  description_en = description_en || ' Founding offer: the first 10 pharmacies pay no setup fee ($0) and get free data import and training, a 60-day guarantee and their price locked for 12 months. We recommend the Business plan. Support Monday to Saturday, 9:00 to 18:00 (Caracas time): Starter gets a reply by the next business day, Business the same day and Pro the highest priority. For advanced features you can connect your own AI (Claude, OpenAI or other) with your API key.'
where slug = 'farmacia-pos' and description_en not like '%Founding offer%';

-- Clinic: bring-your-own-AI note.
update public.products set
  description_es = description_es || ' En los planes Negocio y Pro puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API para funciones avanzadas.',
  description_en = description_en || ' On the Business and Pro plans you can connect your own AI (Claude, OpenAI or other) with your API key for advanced features.'
where slug = 'clinica-citas-historias' and description_en not like '%connect your own AI%';

commit;

-- Check: 17 rows with the new prices.
select slug, price_from,
       (select jsonb_agg(jsonb_build_object('plan', pl->>'id', 'monthly', pl->'monthly', 'setup', pl->'setup')) from jsonb_array_elements(pricing->'plans') pl) as plans
from public.products where pricing ? 'price_update_2026_11_02' order by sort;
