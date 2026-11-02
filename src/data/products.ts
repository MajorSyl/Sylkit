import type { Text } from '../i18n';
import { pricingBySlug, type Pricing } from './pricing';

// Edit this file to add products or set prices.
// priceFrom: starting monthly price in USD (the cheapest plan), or null to show "Price on request".
// Plans and add-ons live in ./pricing.ts (and in the database, editable from the admin).
// Later this list can move to Supabase without changing the screens.

export type CategoryId = 'retail' | 'health' | 'food' | 'services' | 'education' | 'management' | 'web' | 'domains' | 'mobile' | 'ai';

export const categories: { id: CategoryId; icon: string; name: Text }[] = [
  { id: 'retail', icon: 'storefront', name: { es: 'Comercio', en: 'Retail', pt: "Comércio" } },
  { id: 'health', icon: 'medkit', name: { es: 'Salud', en: 'Health', pt: "Saúde" } },
  { id: 'food', icon: 'restaurant', name: { es: 'Restaurantes', en: 'Restaurants', pt: "Restaurantes" } },
  { id: 'services', icon: 'construct', name: { es: 'Servicios', en: 'Services', pt: "Serviços" } },
  { id: 'education', icon: 'school', name: { es: 'Educación', en: 'Education', pt: "Educação" } },
  { id: 'management', icon: 'stats-chart', name: { es: 'Gestión', en: 'Management', pt: "Gestão" } },
  { id: 'web', icon: 'globe', name: { es: 'Sitios web', en: 'Websites', pt: "Sites" } },
  { id: 'domains', icon: 'server', name: { es: 'Dominios y hosting', en: 'Domains & hosting', pt: "Domínios e hospedagem" } },
  { id: 'mobile', icon: 'phone-portrait', name: { es: 'Apps móviles', en: 'Mobile apps', pt: "Apps para celular" } },
  { id: 'ai', icon: 'sparkles', name: { es: 'Herramientas IA', en: 'AI tools', pt: "Ferramentas de IA" } },
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
  image?: string; // screenshot or cover in /public/shots
};

export const products: Product[] = [
  {
    slug: 'alertas-de-vencimiento',
    category: 'retail',
    icon: 'alarm',
    tint: 'cyan',
    badge: { es: 'En uso real', en: 'In real use', pt: "Em uso real" },
    priceFrom: null,
    name: { es: 'Alertas de vencimiento', en: 'Expiry Alerts', pt: "Alertas de validade" },
    short: {
      es: 'Registra productos por código de barras y recibe avisos antes de que venzan.',
      en: 'Register products by barcode and get alerts before they expire.', pt: "Cadastre produtos pelo código de barras e receba alertas antes do vencimento.",
    },
    description: {
      es: 'Evita pérdidas por productos vencidos. Escanea el código de barras, guarda la fecha de vencimiento y el sistema avisa a tu equipo con anticipación. Ya funciona en un centro comercial.',
      en: 'Stop losing money on expired stock. Scan the barcode, save the expiry date and the system warns your team in advance. Already running in a shopping mall.', pt: "Pare de perder dinheiro com estoque vencido. Escaneie o código de barras, salve a data de validade e o sistema avisa sua equipe com antecedência. Já funciona em um shopping.",
    },
    features: [
      { es: 'Registro por código de barras', en: 'Barcode registration', pt: "Cadastro por código de barras" },
      { es: 'Notificaciones antes del vencimiento', en: 'Notifications before expiry', pt: "Notificações antes do vencimento" },
      { es: 'Apps para escritorio, iOS y Android', en: 'Desktop, iOS and Android apps', pt: "Apps para computador, iOS e Android" },
      { es: 'Reportes de productos por vencer', en: 'Reports of items about to expire', pt: "Relatórios de itens prestes a vencer" },
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
    name: { es: 'Punto de venta (POS)', en: 'Point of Sale (POS)', pt: "Ponto de venda (PDV)" },
    short: {
      es: 'Vende rápido, controla tu caja y conoce tus ventas del día.',
      en: 'Sell fast, control your register and know your daily sales.', pt: "Venda rápido, controle seu caixa e saiba suas vendas do dia.",
    },
    description: {
      es: 'Un punto de venta simple para tiendas, farmacias y minimercados: ventas, cierre de caja, productos y reportes en un solo lugar.',
      en: 'A simple point of sale for shops, pharmacies and minimarkets: sales, register closing, products and reports in one place.', pt: "Um ponto de venda simples para lojas, farmácias e minimercados: vendas, fechamento de caixa, produtos e relatórios num só lugar.",
    },
    features: [
      { es: 'Ventas con lector de código de barras', en: 'Barcode scanner sales', pt: "Vendas com leitor de código de barras" },
      { es: 'Cierre de caja diario', en: 'Daily register closing', pt: "Fechamento de caixa diário" },
      { es: 'Reportes de ventas', en: 'Sales reports', pt: "Relatórios de vendas" },
      { es: 'Varios usuarios y permisos', en: 'Multiple users and permissions', pt: "Vários usuários e permissões" },
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
    name: { es: 'Control de inventario', en: 'Inventory Control', pt: "Controle de estoque" },
    short: {
      es: 'Sabe exactamente qué tienes, qué falta y qué se mueve.',
      en: 'Know exactly what you have, what is missing and what sells.', pt: "Saiba exatamente o que você tem, o que falta e o que vende.",
    },
    description: {
      es: 'Controla entradas, salidas y existencias en tiempo real. Recibe alertas de stock bajo y evita compras innecesarias.',
      en: 'Track stock in and out in real time. Get low-stock alerts and avoid unnecessary purchases.', pt: "Acompanhe entradas e saídas do estoque em tempo real. Receba alertas de estoque baixo e evite compras desnecessárias.",
    },
    features: [
      { es: 'Existencias en tiempo real', en: 'Real-time stock levels', pt: "Estoque em tempo real" },
      { es: 'Alertas de stock bajo', en: 'Low-stock alerts', pt: "Alertas de estoque baixo" },
      { es: 'Historial de movimientos', en: 'Movement history', pt: "Histórico de movimentações" },
      { es: 'Exportar a Excel', en: 'Export to Excel', pt: "Exportar para Excel" },
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
    name: { es: 'Sitio web para negocios', en: 'Business Website', pt: "Site para negócios" },
    short: {
      es: 'Un sitio moderno y rápido que trae clientes a tu WhatsApp.',
      en: 'A fast, modern site that brings customers to your WhatsApp.', pt: "Um site rápido e moderno que leva clientes ao seu WhatsApp.",
    },
    description: {
      es: 'Sitio web profesional con tu dominio, diseño adaptado a móviles y botón de WhatsApp para que los clientes te contacten al instante.',
      en: 'Professional website on your own domain, mobile-friendly design and a WhatsApp button so customers reach you instantly.', pt: "Site profissional com domínio próprio, design para celular e um botão de WhatsApp para que os clientes falem com você na hora.",
    },
    features: [
      { es: 'Plantillas: arquitectura e inmobiliaria', en: 'Templates: architecture and real estate', pt: "Modelos: arquitetura e imobiliárias" },
      { es: 'Diseño adaptado a móviles', en: 'Mobile-friendly design', pt: "Design para celular" },
      { es: 'Tu propio dominio', en: 'Your own domain', pt: "Seu próprio domínio" },
      { es: 'Botón de WhatsApp', en: 'WhatsApp button', pt: "Botão de WhatsApp" },
      { es: 'Optimizado para Google', en: 'Optimized for Google', pt: "Otimizado para o Google" },
    ],
    platforms: ['Web'],
  },
  {
    slug: 'app-movil-a-medida',
    category: 'mobile',
    icon: 'phone-portrait',
    tint: 'blue',
    priceFrom: null,
    name: { es: 'App móvil a medida', en: 'Custom Mobile App', pt: "App móvel sob medida" },
    short: {
      es: 'Tu negocio en el teléfono de tus clientes, en iOS y Android.',
      en: 'Your business on your customers’ phones, on iOS and Android.', pt: "Seu negócio no celular dos seus clientes, em iOS e Android.",
    },
    description: {
      es: 'Diseñamos y publicamos una app para tu negocio: catálogo, pedidos, reservas o lo que necesites, en iOS y Android.',
      en: 'We design and publish an app for your business: catalog, orders, bookings or whatever you need, on iOS and Android.', pt: "Criamos e publicamos um app para o seu negócio: catálogo, pedidos, agendamentos ou o que você precisar, em iOS e Android.",
    },
    features: [
      { es: 'iOS y Android', en: 'iOS and Android', pt: "iOS e Android" },
      { es: 'Plantillas: inmobiliaria y obra', en: 'Templates: real estate and construction', pt: "Modelos: imobiliárias e construção" },
      { es: 'Diseño a tu marca', en: 'Designed to your brand', pt: "Com a identidade da sua marca" },
      { es: 'Publicación en tiendas', en: 'Store publishing', pt: "Publicação nas lojas" },
      { es: 'Panel de administración', en: 'Admin panel', pt: "Painel de administração" },
    ],
    platforms: ['iOS', 'Android'],
  },
  {
    slug: 'asistente-ia-para-negocios',
    category: 'ai',
    icon: 'sparkles',
    tint: 'cyan',
    badge: { es: 'Nuevo', en: 'New', pt: "Novo" },
    priceFrom: null,
    name: { es: 'Asistente con IA', en: 'AI Assistant', pt: "Assistente com IA" },
    short: {
      es: 'Responde preguntas de tus clientes y automatiza tareas repetitivas.',
      en: 'Answers customer questions and automates repetitive tasks.', pt: "Responde às perguntas dos clientes e automatiza tarefas repetitivas.",
    },
    description: {
      es: 'Un asistente con inteligencia artificial entrenado con la información de tu negocio para atender clientes y ahorrar tiempo a tu equipo.',
      en: 'An AI assistant trained on your business information to serve customers and save your team time.', pt: "Um assistente de IA treinado com as informações do seu negócio para atender clientes e poupar o tempo da sua equipe.",
    },
    features: [
      { es: 'Entrenado con tu información', en: 'Trained on your information', pt: "Treinado com suas informações" },
      { es: 'Atención las 24 horas', en: '24/7 customer answers', pt: "Respostas aos clientes 24/7" },
      { es: 'Integración con tu web', en: 'Integrates with your website', pt: "Integra com seu site" },
      { es: 'Reportes de conversaciones', en: 'Conversation reports', pt: "Relatórios de conversas" },
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
    name: { es: "Farmacia: ventas y vencimientos", en: "Pharmacy: sales & expiry", pt: "Farmácia: vendas e validades" },
    short: { es: "Ventas, lotes con vencimiento, recetas y pacientes crónicos.", en: "Sales, batches with expiry, prescriptions and chronic patients.", pt: "Vendas, lotes com validade, receitas e pacientes crônicos." },
    badge: { es: "10 farmacias fundadoras: instalación $0", en: "10 founding pharmacies: $0 setup", pt: "10 farmácias fundadoras: instalação $0" },
    description: { es: "Punto de venta hecho para farmacias: descuenta primero el lote que vence antes, registra recetas de medicamentos controlados y recuerda a los pacientes crónicos cuándo reponer. Oferta fundadora: las primeras 10 farmacias no pagan instalación ($0) y reciben importación de datos y capacitación gratis, garantía de 60 días y su precio congelado por 12 meses. Recomendamos el plan Negocio. Soporte de lunes a sábado de 9:00 a 18:00 (hora de Caracas): Inicial responde el siguiente día hábil, Negocio el mismo día y Pro con máxima prioridad. Para funciones avanzadas puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API.", en: "A point of sale built for pharmacies: uses the batch that expires first, logs prescriptions for controlled medicines and reminds chronic patients when to refill. Founding offer: the first 10 pharmacies pay no setup fee ($0) and get free data import and training, a 60-day guarantee and their price locked for 12 months. We recommend the Business plan. Support Monday to Saturday, 9:00 to 18:00 (Caracas time): Starter gets a reply by the next business day, Business the same day and Pro the highest priority. For advanced features you can connect your own AI (Claude, OpenAI or other) with your API key.", pt: "Um ponto de venda feito para farmácias: usa o lote que vence primeiro, registra receitas de medicamentos controlados e lembra os pacientes crônicos de repor. Oferta fundadora: as primeiras 10 farmácias não pagam instalação ($0) e recebem importação de dados e treinamento grátis, garantia de 60 dias e preço congelado por 12 meses. Recomendamos o plano Negócio. Suporte de segunda a sábado, das 9h às 18h (horário de Caracas): Inicial responde no próximo dia útil, Negócio no mesmo dia e Pro com prioridade máxima. Para funções avançadas você pode conectar sua própria IA (Claude, OpenAI ou outra) com sua chave de API." },
    features: [
      { es: "Lotes con fecha de vencimiento (FEFO)", en: "Batches with expiry dates (FEFO)", pt: "Lotes com data de validade (FEFO)" },
      { es: "Libro de recetas", en: "Prescription log", pt: "Registro de receitas" },
      { es: "Recordatorios a pacientes crónicos", en: "Chronic patient reminders", pt: "Lembretes para pacientes crônicos" },
      { es: "Devoluciones a proveedores", en: "Supplier returns", pt: "Devoluções a fornecedores" },
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
    name: { es: "Clínica: citas e historias", en: "Clinic: appointments & records", pt: "Clínica: consultas e prontuários" },
    short: { es: "Citas en línea, sala de espera, historias clínicas y caja.", en: "Online booking, waiting room, medical records and cash.", pt: "Agendamento online, sala de espera, prontuários e caixa." },
    description: { es: "Tus pacientes reservan solos desde tu web o WhatsApp. Recepción ve la agenda del día, el médico registra cada consulta en la historia clínica digital y la caja se cuadra sola. En los planes Negocio y Pro puedes conectar tu propia IA (Claude, OpenAI u otra) con tu clave de API para funciones avanzadas.", en: "Patients book on their own from your website or WhatsApp. Reception sees the daily schedule, doctors record each visit in the digital medical record and cash balances itself. On the Business and Pro plans you can connect your own AI (Claude, OpenAI or other) with your API key for advanced features.", pt: "Os pacientes agendam sozinhos pelo seu site ou WhatsApp. A recepção vê a agenda do dia, os médicos registram cada consulta no prontuário digital e o caixa fecha sozinho. Nos planos Negócio e Pro você pode conectar sua própria IA (Claude, OpenAI ou outra) com sua chave de API para funções avançadas." },
    features: [
      { es: "Reservas en línea 24/7", en: "Online booking 24/7", pt: "Agendamento online 24/7" },
      { es: "Historia clínica digital", en: "Digital medical records", pt: "Prontuário digital" },
      { es: "Recordatorios por WhatsApp", en: "WhatsApp reminders", pt: "Lembretes por WhatsApp" },
      { es: "Caja y pagos por médico", en: "Cash and payments per doctor", pt: "Caixa e pagamentos por médico" },
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
    name: { es: "Restaurante: menú QR y cocina", en: "Restaurant: QR menu & kitchen", pt: "Restaurante: cardápio QR e cozinha" },
    short: { es: "El cliente pide desde la mesa; la cocina lo ve al instante.", en: "Guests order from the table; the kitchen sees it instantly.", pt: "Os clientes pedem da mesa; a cozinha vê na hora." },
    description: { es: "Menú digital con código QR en cada mesa. Los pedidos llegan a la pantalla de cocina, el mesonero sabe qué está listo y la cuenta por mesa se cobra en segundos.", en: "Digital menu with a QR code on every table. Orders reach the kitchen display, waiters know what is ready and each table's bill is settled in seconds.", pt: "Cardápio digital com QR em cada mesa. Os pedidos chegam à tela da cozinha, os garçons sabem o que está pronto e a conta de cada mesa fecha em segundos." },
    features: [
      { es: "Menú QR por mesa", en: "QR menu per table", pt: "Cardápio QR por mesa" },
      { es: "Pantalla de cocina", en: "Kitchen display", pt: "Tela da cozinha" },
      { es: "Cuentas por mesa y propinas", en: "Bills per table and tips", pt: "Contas por mesa e gorjetas" },
      { es: "Platos más vendidos", en: "Best-selling dishes", pt: "Pratos mais vendidos" },
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
    name: { es: "Salón y barbería: reservas", en: "Salon & barbershop: booking", pt: "Salão e barbearia: agendamentos" },
    short: { es: "Reservas en línea, agenda por estilista, comisiones y puntos.", en: "Online booking, schedule per stylist, commissions and points.", pt: "Agendamento online, agenda por profissional, comissões e pontos." },
    description: { es: "Tus clientes reservan desde Instagram o WhatsApp eligiendo servicio, estilista y hora. Tú ves la agenda de cada estilista y el sistema calcula las comisiones y los puntos de fidelidad.", en: "Clients book from Instagram or WhatsApp by choosing service, stylist and time. You see each stylist's schedule and the system calculates commissions and loyalty points.", pt: "Os clientes agendam pelo Instagram ou WhatsApp escolhendo serviço, profissional e horário. Você vê a agenda de cada profissional e o sistema calcula comissões e pontos de fidelidade." },
    features: [
      { es: "Reservas sin llamadas", en: "Bookings without calls", pt: "Agendamentos sem ligações" },
      { es: "Agenda por estilista", en: "Schedule per stylist", pt: "Agenda por profissional" },
      { es: "Comisiones automáticas", en: "Automatic commissions", pt: "Comissões automáticas" },
      { es: "Programa de puntos", en: "Loyalty points", pt: "Pontos de fidelidade" },
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
    name: { es: "Taller mecánico", en: "Car workshop", pt: "Oficina mecânica" },
    short: { es: "Órdenes de trabajo, presupuestos, historial por placa y repuestos.", en: "Work orders, quotes, history by plate and parts.", pt: "Ordens de serviço, orçamentos, histórico por placa e peças." },
    description: { es: "Cada vehículo con su orden de trabajo y su estado. El cliente aprueba el presupuesto por WhatsApp, los repuestos se descuentan solos y queda el historial de cada carro.", en: "Every vehicle with its work order and status. The customer approves the quote on WhatsApp, parts are deducted automatically and each car keeps its full history.", pt: "Cada veículo com sua ordem de serviço e status. O cliente aprova o orçamento pelo WhatsApp, as peças são baixadas automaticamente e cada carro guarda todo o seu histórico." },
    features: [
      { es: "Órdenes de trabajo por estado", en: "Work orders by status", pt: "Ordens de serviço por status" },
      { es: "Presupuestos por WhatsApp", en: "Quotes via WhatsApp", pt: "Orçamentos pelo WhatsApp" },
      { es: "Historial por vehículo", en: "History per vehicle", pt: "Histórico por veículo" },
      { es: "Control de repuestos", en: "Parts control", pt: "Controle de peças" },
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
    name: { es: "Servicios a domicilio", en: "Home services", pt: "Serviços a domicílio" },
    short: { es: "Reservas en línea, asignación de técnicos y seguimiento.", en: "Online booking, technician dispatch and tracking.", pt: "Agendamento online, envio de técnicos e acompanhamento." },
    description: { es: "Para empresas de limpieza, plomería, electricidad o aire acondicionado: el cliente reserva y ve el precio, tú asignas al técnico y sigues cada trabajo hasta cobrarlo.", en: "For cleaning, plumbing, electrical or A/C companies: customers book and see the price, you assign a technician and track every job through payment.", pt: "Para empresas de limpeza, encanamento, elétrica ou ar-condicionado: os clientes agendam e veem o preço, você designa um técnico e acompanha cada serviço até o pagamento." },
    features: [
      { es: "Reservas con precio estimado", en: "Bookings with price estimate", pt: "Agendamentos com estimativa de preço" },
      { es: "Asignación de técnicos", en: "Technician dispatch", pt: "Envio de técnicos" },
      { es: "Estados en tiempo real", en: "Real-time status", pt: "Status em tempo real" },
      { es: "Calificaciones y pagos al técnico", en: "Ratings and technician pay", pt: "Avaliações e pagamento de técnicos" },
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
    name: { es: "Gestión escolar", en: "School management", pt: "Gestão escolar" },
    short: { es: "Estudiantes, notas, asistencia, mensualidades y portal de padres.", en: "Students, grades, attendance, fees and parent portal.", pt: "Alunos, notas, frequência, mensalidades e portal dos pais." },
    description: { es: "Todo el colegio en un sistema: inscripciones, carga de notas, asistencia diaria, cobro de mensualidades con recordatorios y un portal donde los padres ven todo desde su teléfono.", en: "The whole school in one system: enrollment, grades, daily attendance, fee collection with reminders and a portal where parents see everything from their phone.", pt: "A escola inteira num só sistema: matrículas, notas, frequência diária, cobrança de mensalidades com lembretes e um portal onde os pais veem tudo pelo celular." },
    features: [
      { es: "Carga de notas y boletas", en: "Grades and report cards", pt: "Notas e boletins" },
      { es: "Asistencia con aviso a padres", en: "Attendance with parent alerts", pt: "Frequência com alertas aos pais" },
      { es: "Mensualidades y recordatorios", en: "Fees and reminders", pt: "Mensalidades e lembretes" },
      { es: "Portal de padres", en: "Parent portal", pt: "Portal dos pais" },
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
    name: { es: "Nómina y asistencia", en: "Payroll & attendance", pt: "Folha de pagamento e ponto" },
    short: { es: "Marcaje de entrada, horas extra, nómina y recibos de pago.", en: "Clock-in, overtime, payroll and payslips.", pt: "Ponto, horas extras, folha e holerites." },
    description: { es: "Los empleados marcan entrada y salida desde un teléfono o tablet. La nómina se calcula sola con horas extra, bonos y deducciones, y cada empleado recibe su recibo por WhatsApp.", en: "Employees clock in and out from a phone or tablet. Payroll calculates itself with overtime, bonuses and deductions, and each employee gets their payslip on WhatsApp.", pt: "Os funcionários batem o ponto pelo celular ou tablet. A folha se calcula sozinha com horas extras, bônus e descontos, e cada funcionário recebe seu holerite pelo WhatsApp." },
    features: [
      { es: "Marcaje de entrada y salida", en: "Clock in and out", pt: "Registro de entrada e saída" },
      { es: "Control de retardos y ausencias", en: "Lateness and absence tracking", pt: "Controle de atrasos e faltas" },
      { es: "Cálculo de nómina", en: "Payroll calculation", pt: "Cálculo da folha" },
      { es: "Recibos de pago", en: "Payslips", pt: "Holerites" },
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
    name: { es: "Facturación y cobranza", en: "Invoicing & collections", pt: "Faturamento e cobrança" },
    short: { es: "Facturas profesionales, cobros pendientes y recordatorios.", en: "Professional invoices, outstanding payments and reminders.", pt: "Faturas profissionais, pagamentos pendentes e lembretes." },
    description: { es: "Crea facturas profesionales en segundos, envíalas por WhatsApp o en PDF y sabe exactamente quién te debe y desde cuándo. Los recordatorios de pago salen con un toque.", en: "Create professional invoices in seconds, send them by WhatsApp or PDF and know exactly who owes you and since when. Payment reminders go out with one tap.", pt: "Crie faturas profissionais em segundos, envie por WhatsApp ou PDF e saiba exatamente quem deve e desde quando. Os lembretes de pagamento saem com um toque." },
    features: [
      { es: "Facturas en PDF", en: "PDF invoices", pt: "Faturas em PDF" },
      { es: "Clientes y saldos", en: "Clients and balances", pt: "Clientes e saldos" },
      { es: "Antigüedad de saldos", en: "Aging report", pt: "Relatório de vencimentos" },
      { es: "Recordatorios de pago", en: "Payment reminders", pt: "Lembretes de pagamento" },
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
    name: { es: "Tienda en línea con WhatsApp", en: "Online store with WhatsApp", pt: "Loja online com WhatsApp" },
    short: { es: "Catálogo, carrito y pedidos directo a tu WhatsApp.", en: "Catalog, cart and orders straight to your WhatsApp.", pt: "Catálogo, carrinho e pedidos direto no seu WhatsApp." },
    description: { es: "Tu tienda en internet con tu propio dominio. Los clientes arman su carrito y el pedido te llega completo por WhatsApp; tú lo gestionas desde un panel de pedidos.", en: "Your own online store on your own domain. Customers build their cart and the full order reaches you on WhatsApp; you manage it from an orders panel.", pt: "Sua própria loja online com domínio próprio. Os clientes montam o carrinho e o pedido completo chega no seu WhatsApp; você gerencia tudo num painel de pedidos." },
    features: [
      { es: "8 diseños para elegir", en: "8 designs to choose from", pt: "8 designs para escolher" },
      { es: "Catálogo con categorías", en: "Catalog with categories", pt: "Catálogo com categorias" },
      { es: "Pedidos por WhatsApp", en: "Orders via WhatsApp", pt: "Pedidos por WhatsApp" },
      { es: "Panel de pedidos", en: "Orders panel", pt: "Painel de pedidos" },
      { es: "Control de existencias", en: "Stock control", pt: "Controle de estoque" },
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
    name: { es: "Sitio web personal", en: "Personal website", pt: "Site pessoal" },
    short: { es: "Tu marca personal en internet, con tu propio dominio.", en: "Your personal brand online, on your own domain.", pt: "Sua marca pessoal online, com domínio próprio." },
    description: { es: "Para médicos, abogados, consultores, artistas y profesionales: un sitio rápido con tu perfil, servicios, logros y botones para agendar o escribirte por WhatsApp.", en: "For doctors, lawyers, consultants, artists and professionals: a fast site with your profile, services, achievements and buttons to book or message you on WhatsApp.", pt: "Para médicos, advogados, consultores, artistas e profissionais: um site rápido com seu perfil, serviços, conquistas e botões para agendar ou falar com você pelo WhatsApp." },
    features: [
      { es: "Tu propio dominio", en: "Your own domain", pt: "Seu próprio domínio" },
      { es: "Botón de citas y WhatsApp", en: "Booking and WhatsApp buttons", pt: "Botões de agendamento e WhatsApp" },
      { es: "Plantillas profesionales", en: "Professional templates", pt: "Modelos profissionais" },
      { es: "Optimizado para Google", en: "Optimized for Google", pt: "Otimizado para o Google" },
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
    "en": "New", "pt": "Novo"
  },
  "priceFrom": 1.5,
  "name": {
    "es": "Dominio y correo empresarial",
    "en": "Domain and business email", "pt": "Domínio e e-mail profissional"
  },
  "short": {
    "es": "Tu .com a tu nombre y correos como ventas@tunegocio.com. Pagas en moneda local.",
    "en": "Your own .com in your name and emails like sales@yourbusiness.com. Pay locally.", "pt": "Seu próprio .com em seu nome e e-mails como vendas@seunegocio.com. Pague em moeda local."
  },
  "description": {
    "es": "Busca tu nombre, elige tu dominio y nosotros lo registramos a tu nombre, configuramos tus correos y lo renovamos cada año. Pagas con Pago Móvil, USDT u Orange Money: sin tarjeta internacional.",
    "en": "Search your name, pick your domain and we register it in your name, set up your email and renew it every year. Pay with Pago Móvil, USDT or Orange Money, no international card needed.", "pt": "Pesquise seu nome, escolha seu domínio e nós o registramos em seu nome, configuramos seu e-mail e renovamos todo ano. Pague com cartão, USDT ou métodos locais."
  },
  "features": [
    {
      "es": "Registrado a tu nombre: es tuyo",
      "en": "Registered in your name, so it is yours", "pt": "Registrado em seu nome, então é seu"
    },
    {
      "es": "Correo profesional en tu teléfono",
      "en": "Professional email on your phone", "pt": "E-mail profissional no seu celular"
    },
    {
      "es": "Renovación automática",
      "en": "Automatic renewal", "pt": "Renovação automática"
    },
    {
      "es": "Pago local sin tarjeta",
      "en": "Pay locally, no card needed", "pt": "Pague em moeda local"
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
    "en": "Website hosting", "pt": "Hospedagem de sites"
  },
  "short": {
    "es": "Tu sitio rápido, seguro y siempre en línea, con soporte en tu idioma.",
    "en": "Your site fast, secure and always online, with support in your language.", "pt": "Seu site rápido, seguro e sempre no ar, com suporte no seu idioma."
  },
  "description": {
    "es": "Alojamos tu sitio o app web en una red global rápida con SSL, monitoreo y copias de seguridad. Si ya tienes un sitio, lo mudamos por ti.",
    "en": "We host your website or web app on a fast global network with SSL, monitoring and backups. Already have a site? We move it for you.", "pt": "Hospedamos seu site ou app web numa rede global rápida com SSL, monitoramento e backups. Já tem um site? Nós fazemos a mudança."
  },
  "features": [
    {
      "es": "SSL y red global incluidos",
      "en": "SSL and global network included", "pt": "SSL e rede global incluídos"
    },
    {
      "es": "Copias de seguridad",
      "en": "Backups", "pt": "Backups"
    },
    {
      "es": "Monitoreo 24/7",
      "en": "24/7 monitoring", "pt": "Monitoramento 24/7"
    },
    {
      "es": "Mudanza de tu sitio actual",
      "en": "We move your current site", "pt": "Migramos seu site atual"
    }
  ],
  "platforms": [
    "Web"
  ]
}
];

// Real screenshots of the live demos, plus designed covers for products without a demo.
export const productImages: Record<string, string> = {
  'alertas-de-vencimiento': '/shots/alertas.webp',
  'punto-de-venta': '/shots/pos.webp',
  'control-de-inventario': '/shots/inventario.webp',
  'sitio-web-para-negocios': '/shots/sitio-web.webp',
  'app-movil-a-medida': '/shots/app-movil.webp',
  'asistente-ia-para-negocios': '/shots/asistente.webp',
  'farmacia-pos': '/shots/farmacia.webp',
  'clinica-citas-historias': '/shots/clinica.webp',
  'restaurante-menu-qr': '/shots/restaurante.webp',
  'salon-barberia-reservas': '/shots/salon.webp',
  'taller-mecanico': '/shots/taller.webp',
  'servicios-a-domicilio': '/shots/servicios.webp',
  'gestion-escolar': '/shots/escuela.webp',
  'nomina-asistencia': '/shots/nomina.webp',
  facturacion: '/shots/facturas.webp',
  'tienda-online-whatsapp': '/shots/tienda.webp',
  'sitio-web-personal': '/shots/portafolio.webp',
  'dominio-y-correo': '/shots/dominio.webp',
  'hosting-web': '/shots/hosting.webp',
};

// Attach plans to every product and derive the "From" price from the cheapest plan.
for (const p of products) {
  p.image = productImages[p.slug];
  const pr = pricingBySlug[p.slug];
  if (pr) {
    p.pricing = pr;
    p.priceFrom = Math.min(...pr.plans.map((x) => x.monthly));
  }
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
