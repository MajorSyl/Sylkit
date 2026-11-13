// Industries Sylkit builds for, shown on the homepage and the portfolio. Each one points to a live
// demo (an existing product demo or a Sylkit 2.0 demo route) and uses photos from the curated
// Unsplash library (src/data/photoLibrary.ts).
import type { PhotoCategory } from './photoLibrary';

export type Industry = {
  id: string;
  cat: PhotoCategory;
  photo: number; // which photo of that category to show first
  title: { en: string; es: string; pt: string };
  built: { en: string; es: string; pt: string };
  href: string; // internal route or external demo
};

export const industries: Industry[] = [
  {
    id: 'hotels',
    cat: 'hotels',
    photo: 0,
    title: { en: 'Hotels & stays', es: 'Hoteles y hospedaje', pt: 'Hotéis e hospedagem' },
    built: { en: 'Room booking with live availability, deposits and a front-desk calendar.', es: 'Reservas con disponibilidad en vivo, depósitos y calendario de recepción.', pt: 'Reservas com disponibilidade ao vivo, sinal e calendário da recepção.' },
    href: '/demo/hotel',
  },
  {
    id: 'events',
    cat: 'events',
    photo: 0,
    title: { en: 'Events & ticketing', es: 'Eventos y entradas', pt: 'Eventos e ingressos' },
    built: { en: 'Ticket sales, QR tickets and door check-in from a phone.', es: 'Venta de entradas, tickets con QR y control de acceso desde el teléfono.', pt: 'Venda de ingressos, ingressos com QR e check-in pelo celular.' },
    href: '/demo/events',
  },
  {
    id: 'construction',
    cat: 'construction',
    photo: 0,
    title: { en: 'Construction', es: 'Construcción', pt: 'Construção' },
    built: { en: 'Projects, budgets, site reports and progress your clients can follow.', es: 'Obras, presupuestos, reportes de obra y avance que tus clientes pueden seguir.', pt: 'Obras, orçamentos, relatórios de obra e progresso que seus clientes acompanham.' },
    href: '/demo/construction',
  },
  {
    id: 'logistics',
    cat: 'logistics',
    photo: 0,
    title: { en: 'Logistics', es: 'Logística', pt: 'Logística' },
    built: { en: 'Shipments, tracking codes, drivers and proof of delivery.', es: 'Envíos, códigos de rastreo, choferes y prueba de entrega.', pt: 'Envios, códigos de rastreio, motoristas e comprovante de entrega.' },
    href: '/demo/logistics',
  },
  {
    id: 'realestate',
    cat: 'realestate',
    photo: 0,
    title: { en: 'Real estate', es: 'Bienes raíces', pt: 'Imobiliário' },
    built: { en: 'Listings with search, viewings and lead follow-up.', es: 'Inmuebles con búsqueda, visitas y seguimiento de interesados.', pt: 'Imóveis com busca, visitas e acompanhamento de interessados.' },
    href: '/demo/realestate',
  },
  {
    id: 'fashion',
    cat: 'fashion',
    photo: 0,
    title: { en: 'Fashion & boutiques', es: 'Moda y boutiques', pt: 'Moda e boutiques' },
    built: { en: 'An online store with sizes, stock and WhatsApp orders.', es: 'Tienda online con tallas, stock y pedidos por WhatsApp.', pt: 'Loja online com tamanhos, estoque e pedidos pelo WhatsApp.' },
    href: '/demo/boutique',
  },
  {
    id: 'restaurants',
    cat: 'restaurants',
    photo: 0,
    title: { en: 'Restaurants', es: 'Restaurantes', pt: 'Restaurantes' },
    built: { en: 'QR menus, table orders and the kitchen screen.', es: 'Menú QR, pedidos por mesa y pantalla de cocina.', pt: 'Cardápio QR, pedidos por mesa e tela da cozinha.' },
    href: 'https://restaurante.sylkit.com',
  },
  {
    id: 'healthcare',
    cat: 'healthcare',
    photo: 0,
    title: { en: 'Clinics & pharmacies', es: 'Clínicas y farmacias', pt: 'Clínicas e farmácias' },
    built: { en: 'Appointments, patient records and pharmacy point of sale.', es: 'Citas, historias clínicas y punto de venta para farmacias.', pt: 'Consultas, prontuários e ponto de venda para farmácias.' },
    href: 'https://clinica.sylkit.com',
  },
];
