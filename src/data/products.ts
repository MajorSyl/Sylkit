import type { Text } from '../i18n';
import { pricingBySlug, type Pricing } from './pricing';

// Edit this file to add products or set prices.
// priceFrom: starting monthly price in USD (the cheapest plan), or null to show "Price on request".
// Plans and add-ons live in ./pricing.ts (and in the database, editable from the admin).
// Later this list can move to Supabase without changing the screens.

export type CategoryId = 'retail' | 'health' | 'food' | 'services' | 'education' | 'management' | 'web' | 'domains' | 'mobile' | 'ai';

export const categories: { id: CategoryId; icon: string; name: Text }[] = [
  { id: 'retail', icon: 'storefront', name: { es: 'Comercio', en: 'Retail' } },
  { id: 'health', icon: 'medkit', name: { es: 'Salud', en: 'Health' } },
  { id: 'food', icon: 'restaurant', name: { es: 'Restaurantes', en: 'Restaurants' } },
  { id: 'services', icon: 'construct', name: { es: 'Servicios', en: 'Services' } },
  { id: 'education', icon: 'school', name: { es: 'Educación', en: 'Education' } },
  { id: 'management', icon: 'stats-chart', name: { es: 'Gestión', en: 'Management' } },
  { id: 'web', icon: 'globe', name: { es: 'Sitios web', en: 'Websites' } },
  { id: 'domains', icon: 'server', name: { es: 'Dominios y hosting', en: 'Domains & hosting' } },
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
  demoUrl?: string;
  pricing?: Pricing;
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
    demoUrl: 'https://alertas.sylkit.com',
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
    demoUrl: 'https://pos.sylkit.com',
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
    demoUrl: 'https://inventario.sylkit.com',
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
    demoUrl: 'https://asistente.sylkit.com',
  },
  {
    slug: 'farmacia-pos',
    category: 'health',
    icon: 'medkit',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Farmacia: ventas y vencimientos", en: "Pharmacy: sales & expiry" },
    short: { es: "Ventas, lotes con vencimiento, recetas y pacientes crónicos.", en: "Sales, batches with expiry, prescriptions and chronic patients." },
    description: { es: "Punto de venta hecho para farmacias: descuenta primero el lote que vence antes, registra recetas de medicamentos controlados y recuerda a los pacientes crónicos cuándo reponer.", en: "A point of sale built for pharmacies: uses the batch that expires first, logs prescriptions for controlled medicines and reminds chronic patients when to refill." },
    features: [
      { es: "Lotes con fecha de vencimiento (FEFO)", en: "Batches with expiry dates (FEFO)" },
      { es: "Libro de recetas", en: "Prescription log" },
      { es: "Recordatorios a pacientes crónicos", en: "Chronic patient reminders" },
      { es: "Devoluciones a proveedores", en: "Supplier returns" },
    ],
    platforms: ["Desktop", "Web"],
    demoUrl: 'https://farmacia.sylkit.com',
  },
  {
    slug: 'clinica-citas-historias',
    category: 'health',
    icon: 'medical',
    tint: 'blue',
    priceFrom: null,
    name: { es: "Clínica: citas e historias", en: "Clinic: appointments & records" },
    short: { es: "Citas en línea, sala de espera, historias clínicas y caja.", en: "Online booking, waiting room, medical records and cash." },
    description: { es: "Tus pacientes reservan solos desde tu web o WhatsApp. Recepción ve la agenda del día, el médico registra cada consulta en la historia clínica digital y la caja se cuadra sola.", en: "Patients book on their own from your website or WhatsApp. Reception sees the daily schedule, doctors record each visit in the digital medical record and cash balances itself." },
    features: [
      { es: "Reservas en línea 24/7", en: "Online booking 24/7" },
      { es: "Historia clínica digital", en: "Digital medical records" },
      { es: "Recordatorios por WhatsApp", en: "WhatsApp reminders" },
      { es: "Caja y pagos por médico", en: "Cash and payments per doctor" },
    ],
    platforms: ["Web", "Android", "iOS"],
    demoUrl: 'https://clinica.sylkit.com',
  },
  {
    slug: 'restaurante-menu-qr',
    category: 'food',
    icon: 'restaurant',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Restaurante: menú QR y cocina", en: "Restaurant: QR menu & kitchen" },
    short: { es: "El cliente pide desde la mesa; la cocina lo ve al instante.", en: "Guests order from the table; the kitchen sees it instantly." },
    description: { es: "Menú digital con código QR en cada mesa. Los pedidos llegan a la pantalla de cocina, el mesonero sabe qué está listo y la cuenta por mesa se cobra en segundos.", en: "Digital menu with a QR code on every table. Orders reach the kitchen display, waiters know what is ready and each table's bill is settled in seconds." },
    features: [
      { es: "Menú QR por mesa", en: "QR menu per table" },
      { es: "Pantalla de cocina", en: "Kitchen display" },
      { es: "Cuentas por mesa y propinas", en: "Bills per table and tips" },
      { es: "Platos más vendidos", en: "Best-selling dishes" },
    ],
    platforms: ["Web", "Android"],
    demoUrl: 'https://restaurante.sylkit.com',
  },
  {
    slug: 'salon-barberia-reservas',
    category: 'services',
    icon: 'cut',
    tint: 'blue',
    priceFrom: null,
    name: { es: "Salón y barbería: reservas", en: "Salon & barbershop: booking" },
    short: { es: "Reservas en línea, agenda por estilista, comisiones y puntos.", en: "Online booking, schedule per stylist, commissions and points." },
    description: { es: "Tus clientes reservan desde Instagram o WhatsApp eligiendo servicio, estilista y hora. Tú ves la agenda de cada estilista y el sistema calcula las comisiones y los puntos de fidelidad.", en: "Clients book from Instagram or WhatsApp by choosing service, stylist and time. You see each stylist's schedule and the system calculates commissions and loyalty points." },
    features: [
      { es: "Reservas sin llamadas", en: "Bookings without calls" },
      { es: "Agenda por estilista", en: "Schedule per stylist" },
      { es: "Comisiones automáticas", en: "Automatic commissions" },
      { es: "Programa de puntos", en: "Loyalty points" },
    ],
    platforms: ["Web", "Android", "iOS"],
    demoUrl: 'https://salon.sylkit.com',
  },
  {
    slug: 'taller-mecanico',
    category: 'services',
    icon: 'construct',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Taller mecánico", en: "Car workshop" },
    short: { es: "Órdenes de trabajo, presupuestos, historial por placa y repuestos.", en: "Work orders, quotes, history by plate and parts." },
    description: { es: "Cada vehículo con su orden de trabajo y su estado. El cliente aprueba el presupuesto por WhatsApp, los repuestos se descuentan solos y queda el historial de cada carro.", en: "Every vehicle with its work order and status. The customer approves the quote on WhatsApp, parts are deducted automatically and each car keeps its full history." },
    features: [
      { es: "Órdenes de trabajo por estado", en: "Work orders by status" },
      { es: "Presupuestos por WhatsApp", en: "Quotes via WhatsApp" },
      { es: "Historial por vehículo", en: "History per vehicle" },
      { es: "Control de repuestos", en: "Parts control" },
    ],
    platforms: ["Web", "Android"],
    demoUrl: 'https://taller.sylkit.com',
  },
  {
    slug: 'servicios-a-domicilio',
    category: 'services',
    icon: 'home',
    tint: 'blue',
    priceFrom: null,
    name: { es: "Servicios a domicilio", en: "Home services" },
    short: { es: "Reservas en línea, asignación de técnicos y seguimiento.", en: "Online booking, technician dispatch and tracking." },
    description: { es: "Para empresas de limpieza, plomería, electricidad o aire acondicionado: el cliente reserva y ve el precio, tú asignas al técnico y sigues cada trabajo hasta cobrarlo.", en: "For cleaning, plumbing, electrical or A/C companies: customers book and see the price, you assign a technician and track every job through payment." },
    features: [
      { es: "Reservas con precio estimado", en: "Bookings with price estimate" },
      { es: "Asignación de técnicos", en: "Technician dispatch" },
      { es: "Estados en tiempo real", en: "Real-time status" },
      { es: "Calificaciones y pagos al técnico", en: "Ratings and technician pay" },
    ],
    platforms: ["Web", "Android", "iOS"],
    demoUrl: 'https://servicios.sylkit.com',
  },
  {
    slug: 'gestion-escolar',
    category: 'education',
    icon: 'school',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Gestión escolar", en: "School management" },
    short: { es: "Estudiantes, notas, asistencia, mensualidades y portal de padres.", en: "Students, grades, attendance, fees and parent portal." },
    description: { es: "Todo el colegio en un sistema: inscripciones, carga de notas, asistencia diaria, cobro de mensualidades con recordatorios y un portal donde los padres ven todo desde su teléfono.", en: "The whole school in one system: enrollment, grades, daily attendance, fee collection with reminders and a portal where parents see everything from their phone." },
    features: [
      { es: "Carga de notas y boletas", en: "Grades and report cards" },
      { es: "Asistencia con aviso a padres", en: "Attendance with parent alerts" },
      { es: "Mensualidades y recordatorios", en: "Fees and reminders" },
      { es: "Portal de padres", en: "Parent portal" },
    ],
    platforms: ["Web", "Android", "iOS"],
    demoUrl: 'https://escuela.sylkit.com',
  },
  {
    slug: 'nomina-asistencia',
    category: 'management',
    icon: 'people',
    tint: 'blue',
    priceFrom: null,
    name: { es: "Nómina y asistencia", en: "Payroll & attendance" },
    short: { es: "Marcaje de entrada, horas extra, nómina y recibos de pago.", en: "Clock-in, overtime, payroll and payslips." },
    description: { es: "Los empleados marcan entrada y salida desde un teléfono o tablet. La nómina se calcula sola con horas extra, bonos y deducciones, y cada empleado recibe su recibo por WhatsApp.", en: "Employees clock in and out from a phone or tablet. Payroll calculates itself with overtime, bonuses and deductions, and each employee gets their payslip on WhatsApp." },
    features: [
      { es: "Marcaje de entrada y salida", en: "Clock in and out" },
      { es: "Control de retardos y ausencias", en: "Lateness and absence tracking" },
      { es: "Cálculo de nómina", en: "Payroll calculation" },
      { es: "Recibos de pago", en: "Payslips" },
    ],
    platforms: ["Web", "Android"],
    demoUrl: 'https://nomina.sylkit.com',
  },
  {
    slug: 'facturacion',
    category: 'management',
    icon: 'document-text',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Facturación y cobranza", en: "Invoicing & collections" },
    short: { es: "Facturas profesionales, cobros pendientes y recordatorios.", en: "Professional invoices, outstanding payments and reminders." },
    description: { es: "Crea facturas profesionales en segundos, envíalas por WhatsApp o en PDF y sabe exactamente quién te debe y desde cuándo. Los recordatorios de pago salen con un toque.", en: "Create professional invoices in seconds, send them by WhatsApp or PDF and know exactly who owes you and since when. Payment reminders go out with one tap." },
    features: [
      { es: "Facturas en PDF", en: "PDF invoices" },
      { es: "Clientes y saldos", en: "Clients and balances" },
      { es: "Antigüedad de saldos", en: "Aging report" },
      { es: "Recordatorios de pago", en: "Payment reminders" },
    ],
    platforms: ["Web"],
    demoUrl: 'https://facturas.sylkit.com',
  },
  {
    slug: 'tienda-online-whatsapp',
    category: 'retail',
    icon: 'bag-handle',
    tint: 'blue',
    priceFrom: null,
    name: { es: "Tienda en línea con WhatsApp", en: "Online store with WhatsApp" },
    short: { es: "Catálogo, carrito y pedidos directo a tu WhatsApp.", en: "Catalog, cart and orders straight to your WhatsApp." },
    description: { es: "Tu tienda en internet con tu propio dominio. Los clientes arman su carrito y el pedido te llega completo por WhatsApp; tú lo gestionas desde un panel de pedidos.", en: "Your own online store on your own domain. Customers build their cart and the full order reaches you on WhatsApp; you manage it from an orders panel." },
    features: [
      { es: "Catálogo con categorías", en: "Catalog with categories" },
      { es: "Pedidos por WhatsApp", en: "Orders via WhatsApp" },
      { es: "Panel de pedidos", en: "Orders panel" },
      { es: "Control de existencias", en: "Stock control" },
    ],
    platforms: ["Web"],
    demoUrl: 'https://tienda.sylkit.com',
  },
  {
    slug: 'sitio-web-personal',
    category: 'web',
    icon: 'person-circle',
    tint: 'cyan',
    priceFrom: null,
    name: { es: "Sitio web personal", en: "Personal website" },
    short: { es: "Tu marca personal en internet, con tu propio dominio.", en: "Your personal brand online, on your own domain." },
    description: { es: "Para médicos, abogados, consultores, artistas y profesionales: un sitio rápido con tu perfil, servicios, logros y botones para agendar o escribirte por WhatsApp.", en: "For doctors, lawyers, consultants, artists and professionals: a fast site with your profile, services, achievements and buttons to book or message you on WhatsApp." },
    features: [
      { es: "Tu propio dominio", en: "Your own domain" },
      { es: "Botón de citas y WhatsApp", en: "Booking and WhatsApp buttons" },
      { es: "Plantillas profesionales", en: "Professional templates" },
      { es: "Optimizado para Google", en: "Optimized for Google" },
    ],
    platforms: ["Web"],
    demoUrl: 'https://portafolio.sylkit.com',
  },
{
  "slug": "dominio-y-correo",
  "category": "domains",
  "icon": "at",
  "tint": "cyan",
  "badge": {
    "es": "Nuevo",
    "en": "New"
  },
  "priceFrom": 2.5,
  "name": {
    "es": "Dominio y correo empresarial",
    "en": "Domain and business email"
  },
  "short": {
    "es": "Tu .com a tu nombre y correos como ventas@tunegocio.com. Pagas en moneda local.",
    "en": "Your own .com in your name and emails like sales@yourbusiness.com. Pay locally."
  },
  "description": {
    "es": "Busca tu nombre, elige tu dominio y nosotros lo registramos a tu nombre, configuramos tus correos y lo renovamos cada año. Pagas con Pago Móvil, USDT u Orange Money: sin tarjeta internacional.",
    "en": "Search your name, pick your domain and we register it in your name, set up your email and renew it every year. Pay with Pago Móvil, USDT or Orange Money, no international card needed."
  },
  "features": [
    {
      "es": "Registrado a tu nombre: es tuyo",
      "en": "Registered in your name, so it is yours"
    },
    {
      "es": "Correo profesional en tu teléfono",
      "en": "Professional email on your phone"
    },
    {
      "es": "Renovación automática",
      "en": "Automatic renewal"
    },
    {
      "es": "Pago local sin tarjeta",
      "en": "Pay locally, no card needed"
    }
  ],
  "platforms": [
    "Web",
    "Email"
  ]
},
{
  "slug": "hosting-web",
  "category": "domains",
  "icon": "server",
  "tint": "blue",
  "name": {
    "es": "Hosting para tu sitio web",
    "en": "Website hosting"
  },
  "short": {
    "es": "Tu sitio rápido, seguro y siempre en línea, con soporte en tu idioma.",
    "en": "Your site fast, secure and always online, with support in your language."
  },
  "description": {
    "es": "Alojamos tu sitio o app web en una red global rápida con SSL, monitoreo y copias de seguridad. Si ya tienes un sitio, lo mudamos por ti.",
    "en": "We host your website or web app on a fast global network with SSL, monitoring and backups. Already have a site? We move it for you."
  },
  "features": [
    {
      "es": "SSL y red global incluidos",
      "en": "SSL and global network included"
    },
    {
      "es": "Copias de seguridad",
      "en": "Backups"
    },
    {
      "es": "Monitoreo 24/7",
      "en": "24/7 monitoring"
    },
    {
      "es": "Mudanza de tu sitio actual",
      "en": "We move your current site"
    }
  ],
  "platforms": [
    "Web"
  ]
}
];

// Attach plans to every product and derive the "From" price from the cheapest plan.
for (const p of products) {
  const pr = pricingBySlug[p.slug];
  if (pr) {
    p.pricing = pr;
    p.priceFrom = Math.min(...pr.plans.map((x) => x.monthly));
  }
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
