// Popular business systems with photo-led live demos (public/demos/<id>/, engine public/_pro/pro.js,
// built by scripts/build_pro_demos.py). Each one has a customer site and the staff dashboard behind it.
// Covers: /shots/covers/demo-<id>.webp (real screenshots, made on CI by scripts/ci/make_shots.py).
type T = { en: string; es: string; pt: string };
export type PopularSystem = { id: string; title: T; built: T; href: string; cover: string };

export const popularSystems: PopularSystem[] = [
  {
    id: 'gym',
    title: { en: 'Gym & fitness', es: 'Gimnasio y fitness', pt: 'Academia e fitness' },
    built: { en: 'Memberships, class bookings, check-ins and renewals.', es: 'Membresías, reservas de clases, entradas y renovaciones.', pt: 'Planos, reservas de aulas, check-ins e renovações.' },
    href: '/demos/gym/', cover: '/shots/covers/demo-gym.webp',
  },
  {
    id: 'car-rental',
    title: { en: 'Car rental', es: 'Alquiler de carros', pt: 'Aluguel de carros' },
    built: { en: 'Fleet, live availability, bookings, pick-ups and returns.', es: 'Flota, disponibilidad en vivo, reservas, entregas y devoluciones.', pt: 'Frota, disponibilidade ao vivo, reservas, retiradas e devoluções.' },
    href: '/demos/car-rental/', cover: '/shots/covers/demo-car-rental.webp',
  },
  {
    id: 'delivery',
    title: { en: 'Food ordering & delivery', es: 'Pedidos y delivery de comida', pt: 'Pedidos e delivery de comida' },
    built: { en: 'Online menu, orders, kitchen screen and riders.', es: 'Menú en línea, pedidos, pantalla de cocina y motorizados.', pt: 'Cardápio online, pedidos, tela da cozinha e entregadores.' },
    href: '/demos/delivery/', cover: '/shots/covers/demo-delivery.webp',
  },
  {
    id: 'crm',
    title: { en: 'CRM & sales', es: 'CRM y ventas', pt: 'CRM e vendas' },
    built: { en: 'Website leads, sales pipeline, follow-ups and won deals.', es: 'Prospectos del sitio web, embudo de ventas, seguimientos y cierres.', pt: 'Leads do site, funil de vendas, follow-ups e negócios fechados.' },
    href: '/demos/crm/', cover: '/shots/covers/demo-crm.webp',
  },
  {
    id: 'rentals',
    title: { en: 'Property rentals', es: 'Alquiler de inmuebles', pt: 'Aluguel de imóveis' },
    built: { en: 'Listings, applications, leases, rent and maintenance.', es: 'Inmuebles, solicitudes, contratos, cobros y mantenimiento.', pt: 'Imóveis, propostas, contratos, aluguéis e manutenção.' },
    href: '/demos/rentals/', cover: '/shots/covers/demo-rentals.webp',
  },
  {
    id: 'tours',
    title: { en: 'Travel & tours', es: 'Viajes y tours', pt: 'Viagens e passeios' },
    built: { en: 'Tour pages, seats per departure, bookings and deposits.', es: 'Páginas de tours, cupos por salida, reservas y abonos.', pt: 'Páginas de passeios, vagas por saída, reservas e sinal.' },
    href: '/demos/tours/', cover: '/shots/covers/demo-tours.webp',
  },
];
