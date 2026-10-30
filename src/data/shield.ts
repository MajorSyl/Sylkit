import type { Text } from '../i18n';

// Sylkit Shield: security checks, fixes and monitoring for websites, apps and business systems.
// One global price list (USD). Edit prices here.

export type ShieldPlan = {
  id: string;
  step: 1 | 2 | 3;
  name: Text;
  best: Text;
  price: Text;
  period?: Text;
  delivery?: Text;
  items: Text[];
  popular?: boolean;
};

export const shieldPlans: ShieldPlan[] = [
  // Step 1: find the risks
  {
    id: 'snapshot',
    step: 1,
    name: { en: 'Security Snapshot', es: 'Diagnóstico rápido' },
    best: { en: 'Anyone curious', es: 'Para cualquiera' },
    price: { en: 'Free', es: 'Gratis' },
    delivery: { en: '24–48 hours', es: '24–48 horas' },
    items: [
      { en: 'Automated external check', es: 'Revisión externa automática' },
      { en: 'SSL, security headers, exposed files', es: 'SSL, cabeceras de seguridad, archivos expuestos' },
      { en: '5-point summary by email', es: 'Resumen de 5 puntos por correo' },
    ],
  },
  {
    id: 'starter',
    step: 1,
    name: { en: 'Starter Scan', es: 'Escaneo inicial' },
    best: { en: 'Landing pages, simple sites', es: 'Páginas y sitios sencillos' },
    price: { en: '$49', es: '$49' },
    delivery: { en: '2–3 days', es: '2–3 días' },
    items: [
      { en: 'Full automated scan', es: 'Escaneo automático completo' },
      { en: 'Expert review of the top issues', es: 'Revisión experta de los problemas principales' },
      { en: '1-page plain-language report', es: 'Informe de 1 página en lenguaje claro' },
    ],
  },
  {
    id: 'essential',
    step: 1,
    name: { en: 'Essential Audit', es: 'Auditoría esencial' },
    best: { en: 'Small apps, PHP/WordPress sites, MVPs', es: 'Apps pequeñas, sitios PHP/WordPress, MVPs' },
    price: { en: '$199', es: '$199' },
    delivery: { en: '3–5 days', es: '3–5 días' },
    popular: true,
    items: [
      { en: 'Code, database rules, login and access', es: 'Código, reglas de base de datos, acceso y login' },
      { en: 'Leaked keys and vulnerable packages', es: 'Claves filtradas y paquetes vulnerables' },
      { en: 'Full report with fix steps', es: 'Informe completo con pasos para corregir' },
      { en: 'AI-ready fix prompts', es: 'Instrucciones listas para tu herramienta de IA' },
    ],
  },
  {
    id: 'pro',
    step: 1,
    name: { en: 'Pro Audit', es: 'Auditoría Pro' },
    best: { en: 'Growing apps, web + mobile, APIs', es: 'Apps en crecimiento, web + móvil, APIs' },
    price: { en: '$499', es: '$499' },
    delivery: { en: '5–7 days', es: '5–7 días' },
    items: [
      { en: 'Everything in Essential', es: 'Todo lo de Esencial' },
      { en: 'Mobile app analysis (Android/iOS)', es: 'Análisis de app móvil (Android/iOS)' },
      { en: 'API testing', es: 'Pruebas de API' },
      { en: '30-min results call + one free re-test', es: 'Llamada de 30 min + una re-prueba gratis' },
    ],
  },
  {
    id: 'business',
    step: 1,
    name: { en: 'Business Audit', es: 'Auditoría empresarial' },
    best: { en: 'Large or multi-system businesses', es: 'Empresas con varios sistemas' },
    price: { en: 'From $999', es: 'Desde $999' },
    delivery: { en: 'Quoted', es: 'Según alcance' },
    items: [
      { en: 'Custom scope across all systems', es: 'Alcance a medida en todos tus sistemas' },
      { en: 'Executive summary', es: 'Resumen ejecutivo' },
      { en: 'Team walkthrough', es: 'Sesión con tu equipo' },
    ],
  },
  // Step 2: close the gaps
  {
    id: 'single-fix',
    step: 2,
    name: { en: 'Single Fix', es: 'Corrección única' },
    best: { en: 'One known issue', es: 'Un problema conocido' },
    price: { en: 'From $29', es: 'Desde $29' },
    items: [{ en: 'One issue fixed and verified', es: 'Un problema corregido y verificado' }],
  },
  {
    id: 'critical-bundle',
    step: 2,
    name: { en: 'Critical Fix Bundle', es: 'Paquete de correcciones críticas' },
    best: { en: 'After an audit', es: 'Después de una auditoría' },
    price: { en: '$149', es: '$149' },
    popular: true,
    items: [
      { en: 'Up to 5 critical or high issues fixed', es: 'Hasta 5 problemas críticos o altos corregidos' },
      { en: 'Re-test included', es: 'Re-prueba incluida' },
    ],
  },
  {
    id: 'hardening',
    step: 2,
    name: { en: 'Full Hardening', es: 'Blindaje completo' },
    best: { en: 'Fix everything found', es: 'Corregir todo lo encontrado' },
    price: { en: 'Quoted', es: 'A cotizar' },
    items: [
      { en: 'All audit findings fixed', es: 'Todos los hallazgos corregidos' },
      { en: 'Re-test included', es: 'Re-prueba incluida' },
    ],
  },
  // Step 3: stay protected
  {
    id: 'care-basic',
    step: 3,
    name: { en: 'Care Basic', es: 'Care Básico' },
    best: { en: 'Peace of mind', es: 'Tranquilidad' },
    price: { en: '$19', es: '$19' },
    period: { en: '/mo · $190/yr', es: '/mes · $190/año' },
    items: [
      { en: 'Monthly automated scan', es: 'Escaneo automático mensual' },
      { en: 'Uptime monitoring', es: 'Monitoreo de disponibilidad' },
      { en: 'Email alerts', es: 'Alertas por correo' },
    ],
  },
  {
    id: 'care-standard',
    step: 3,
    name: { en: 'Care Standard', es: 'Care Estándar' },
    best: { en: 'Active businesses', es: 'Negocios activos' },
    price: { en: '$49', es: '$49' },
    period: { en: '/mo · $490/yr', es: '/mes · $490/año' },
    popular: true,
    items: [
      { en: 'Everything in Basic', es: 'Todo lo de Básico' },
      { en: 'Dependency updates', es: 'Actualización de dependencias' },
      { en: 'Quarterly expert review', es: 'Revisión experta trimestral' },
    ],
  },
  {
    id: 'care-pro',
    step: 3,
    name: { en: 'Care Pro', es: 'Care Pro' },
    best: { en: 'Apps with real users and data', es: 'Apps con usuarios y datos reales' },
    price: { en: '$99', es: '$99' },
    period: { en: '/mo · $990/yr', es: '/mes · $990/año' },
    items: [
      { en: 'Everything in Standard', es: 'Todo lo de Estándar' },
      { en: 'Monthly expert review', es: 'Revisión experta mensual' },
      { en: '2 hours of fixes per month', es: '2 horas de correcciones al mes' },
      { en: 'Priority support', es: 'Soporte prioritario' },
    ],
  },
];

export const shieldSteps: { step: 1 | 2 | 3; title: Text; sub: Text }[] = [
  { step: 1, title: { en: 'Find the risks', es: 'Encuentra los riesgos' }, sub: { en: 'One-time checks and audits', es: 'Revisiones y auditorías únicas' } },
  { step: 2, title: { en: 'Close the gaps', es: 'Cierra las brechas' }, sub: { en: 'We fix what we find', es: 'Corregimos lo que encontramos' } },
  { step: 3, title: { en: 'Stay protected', es: 'Mantente protegido' }, sub: { en: 'Monthly monitoring · yearly = 2 months free', es: 'Monitoreo mensual · anual = 2 meses gratis' } },
];

export const shieldPolicies: { icon: string; t: Text; d: Text }[] = [
  { icon: 'gift', t: { en: 'Start free', es: 'Empieza gratis' }, d: { en: 'Every client can begin with the free Security Snapshot.', es: 'Todos pueden empezar con el Diagnóstico rápido gratis.' } },
  { icon: 'trending-up', t: { en: 'Upgrade credit', es: 'Crédito para subir de nivel' }, d: { en: 'Pay for an audit, then upgrade within 30 days and the full amount counts toward it.', es: 'Si subes de auditoría en 30 días, lo que pagaste cuenta completo.' } },
  { icon: 'construct', t: { en: 'Fix credit', es: 'Crédito para correcciones' }, d: { en: '50% of your audit fee is credited toward fixes booked within 30 days.', es: 'El 50% de tu auditoría se descuenta de las correcciones en 30 días.' } },
  { icon: 'wallet', t: { en: 'Split payment', es: 'Pago en dos partes' }, d: { en: 'Audits of $499 and above: half to start, half on delivery.', es: 'Auditorías desde $499: mitad al inicio, mitad al entregar.' } },
  { icon: 'pricetag', t: { en: 'Sylkit customers', es: 'Clientes Sylkit' }, d: { en: 'A free Starter Scan with every system you buy and 20% off all Shield plans.', es: 'Escaneo inicial gratis con cada sistema y 20% de descuento en Shield.' } },
  { icon: 'flash', t: { en: 'Launch offer', es: 'Oferta de lanzamiento' }, d: { en: 'First 10 clients: 50% off any audit for a testimonial.', es: 'Primeros 10 clientes: 50% de descuento a cambio de un testimonio.' } },
];
