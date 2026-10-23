import type { Text } from '../i18n';

// Edit this file to add products or set prices.
// priceFrom: annual price in USD, or null to show "Price on request".
// Later this list can move to Supabase without changing the screens.

export type CategoryId = 'retail' | 'management' | 'web' | 'mobile' | 'ai';

export const categories: { id: CategoryId; icon: string; name: Text }[] = [
  { id: 'retail', icon: 'storefront', name: { es: 'Comercio', en: 'Retail' } },
  { id: 'management', icon: 'stats-chart', name: { es: 'Gestión', en: 'Management' } },
  { id: 'web', icon: 'globe', name: { es: 'Sitios web', en: 'Websites' } },
  { id: 'mobile', icon: 'phone-portrait', name: { es: 'Apps móviles', en: 'Mobile apps' } },
  { id: 'ai', icon: 'sparkles', name: { es: 'Herramientas IA', en: 'AI tools' } },
];

export type Product = {
  slug: string;
  category: CategoryId;
  icon: string;
  tint: 'blue' | 'cyan';
  badge?: Text;
  priceFrom: number | null;
  name: Text;
  short: Text;
  description: Text;
  features: Text[];
  platforms: string[];
};

export const products: Product[] = [
  {
    slug: 'alertas-de-vencimiento',
    category: 'retail',
    icon: 'alarm',
    tint: 'cyan',
    badge: { es: 'En uso real', en: 'In real use' },
    priceFrom: null,
    name: { es: 'Alertas de vencimiento', en: 'Expiry Alerts' },
    short: {
      es: 'Registra productos por código de barras y recibe avisos antes de que venzan.',
      en: 'Register products by barcode and get alerts before they expire.',
    },
    description: {
      es: 'Evita pérdidas por productos vencidos. Escanea el código de barras, guarda la fecha de vencimiento y el sistema avisa a tu equipo con anticipación. Ya funciona en un centro comercial.',
      en: 'Stop losing money on expired stock. Scan the barcode, save the expiry date and the system warns your team in advance. Already running in a shopping mall.',
    },
    features: [
      { es: 'Registro por código de barras', en: 'Barcode registration' },
      { es: 'Notificaciones antes del vencimiento', en: 'Notifications before expiry' },
      { es: 'Apps para escritorio, iOS y Android', en: 'Desktop, iOS and Android apps' },
      { es: 'Reportes de productos por vencer', en: 'Reports of items about to expire' },
    ],
    platforms: ['Desktop', 'iOS', 'Android'],
  },
  {
    slug: 'punto-de-venta',
    category: 'retail',
    icon: 'cart',
    tint: 'blue',
    priceFrom: null,
    name: { es: 'Punto de venta (POS)', en: 'Point of Sale (POS)' },
    short: {
      es: 'Vende rápido, controla tu caja y conoce tus ventas del día.',
      en: 'Sell fast, control your register and know your daily sales.',
    },
    description: {
      es: 'Un punto de venta simple para tiendas, farmacias y minimercados: ventas, cierre de caja, productos y reportes en un solo lugar.',
      en: 'A simple point of sale for shops, pharmacies and minimarkets: sales, register closing, products and reports in one place.',
    },
    features: [
      { es: 'Ventas con lector de código de barras', en: 'Barcode scanner sales' },
      { es: 'Cierre de caja diario', en: 'Daily register closing' },
      { es: 'Reportes de ventas', en: 'Sales reports' },
      { es: 'Varios usuarios y permisos', en: 'Multiple users and permissions' },
    ],
    platforms: ['Desktop', 'Web'],
  },
  {
    slug: 'control-de-inventario',
    category: 'management',
    icon: 'cube',
    tint: 'blue',
    priceFrom: null,
    name: { es: 'Control de inventario', en: 'Inventory Control' },
    short: {
      es: 'Sabe exactamente qué tienes, qué falta y qué se mueve.',
      en: 'Know exactly what you have, what is missing and what sells.',
    },
    description: {
      es: 'Controla entradas, salidas y existencias en tiempo real. Recibe alertas de stock bajo y evita compras innecesarias.',
      en: 'Track stock in and out in real time. Get low-stock alerts and avoid unnecessary purchases.',
    },
    features: [
      { es: 'Existencias en tiempo real', en: 'Real-time stock levels' },
      { es: 'Alertas de stock bajo', en: 'Low-stock alerts' },
      { es: 'Historial de movimientos', en: 'Movement history' },
      { es: 'Exportar a Excel', en: 'Export to Excel' },
    ],
    platforms: ['Desktop', 'Web', 'Android'],
  },
  {
    slug: 'sitio-web-para-negocios',
    category: 'web',
    icon: 'globe',
    tint: 'cyan',
    priceFrom: null,
    name: { es: 'Sitio web para negocios', en: 'Business Website' },
    short: {
      es: 'Un sitio moderno y rápido que trae clientes a tu WhatsApp.',
      en: 'A fast, modern site that brings customers to your WhatsApp.',
    },
    description: {
      es: 'Sitio web profesional con tu dominio, diseño adaptado a móviles y botón de WhatsApp para que los clientes te contacten al instante.',
      en: 'Professional website on your own domain, mobile-friendly design and a WhatsApp button so customers reach you instantly.',
    },
    features: [
      { es: 'Diseño adaptado a móviles', en: 'Mobile-friendly design' },
      { es: 'Tu propio dominio', en: 'Your own domain' },
      { es: 'Botón de WhatsApp', en: 'WhatsApp button' },
      { es: 'Optimizado para Google', en: 'Optimized for Google' },
    ],
    platforms: ['Web'],
  },
  {
    slug: 'app-movil-a-medida',
    category: 'mobile',
    icon: 'phone-portrait',
    tint: 'blue',
    priceFrom: null,
    name: { es: 'App móvil a medida', en: 'Custom Mobile App' },
    short: {
      es: 'Tu negocio en el teléfono de tus clientes, en iOS y Android.',
      en: 'Your business on your customers’ phones, on iOS and Android.',
    },
    description: {
      es: 'Diseñamos y publicamos una app para tu negocio: catálogo, pedidos, reservas o lo que necesites, en iOS y Android.',
      en: 'We design and publish an app for your business: catalog, orders, bookings or whatever you need, on iOS and Android.',
    },
    features: [
      { es: 'iOS y Android', en: 'iOS and Android' },
      { es: 'Diseño a tu marca', en: 'Designed to your brand' },
      { es: 'Publicación en tiendas', en: 'Store publishing' },
      { es: 'Panel de administración', en: 'Admin panel' },
    ],
    platforms: ['iOS', 'Android'],
  },
  {
    slug: 'asistente-ia-para-negocios',
    category: 'ai',
    icon: 'sparkles',
    tint: 'cyan',
    badge: { es: 'Nuevo', en: 'New' },
    priceFrom: null,
    name: { es: 'Asistente con IA', en: 'AI Assistant' },
    short: {
      es: 'Responde preguntas de tus clientes y automatiza tareas repetitivas.',
      en: 'Answers customer questions and automates repetitive tasks.',
    },
    description: {
      es: 'Un asistente con inteligencia artificial entrenado con la información de tu negocio para atender clientes y ahorrar tiempo a tu equipo.',
      en: 'An AI assistant trained on your business information to serve customers and save your team time.',
    },
    features: [
      { es: 'Entrenado con tu información', en: 'Trained on your information' },
      { es: 'Atención las 24 horas', en: '24/7 customer answers' },
      { es: 'Integración con tu web', en: 'Integrates with your website' },
      { es: 'Reportes de conversaciones', en: 'Conversation reports' },
    ],
    platforms: ['Web'],
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
