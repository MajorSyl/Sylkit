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
    name: { en: 'Security Snapshot', pt: "Security Snapshot", es: 'Diagnóstico rápido' },
    best: { en: 'Anyone curious', pt: "Para qualquer curioso", es: 'Para cualquiera' },
    price: { en: 'Free', pt: "Grátis", es: 'Gratis' },
    delivery: { en: '24–48 hours', pt: "24–48 horas", es: '24–48 horas' },
    items: [
      { en: 'Automated external check', pt: "Verificação externa automática", es: 'Revisión externa automática' },
      { en: 'SSL, security headers, exposed files', pt: "SSL, cabeçalhos de segurança, arquivos expostos", es: 'SSL, cabeceras de seguridad, archivos expuestos' },
      { en: '5-point summary by email', pt: "Resumo de 5 pontos por e-mail", es: 'Resumen de 5 puntos por correo' },
    ],
  },
  {
    id: 'starter',
    step: 1,
    name: { en: 'Starter Scan', pt: "Starter Scan", es: 'Escaneo inicial' },
    best: { en: 'Landing pages, simple sites', pt: "Páginas de destino, sites simples", es: 'Páginas y sitios sencillos' },
    price: { en: '$49', pt: "$49", es: '$49' },
    delivery: { en: '2–3 days', pt: "2–3 dias", es: '2–3 días' },
    items: [
      { en: 'Full automated scan', pt: "Varredura automática completa", es: 'Escaneo automático completo' },
      { en: 'Expert review of the top issues', pt: "Revisão de especialista dos principais problemas", es: 'Revisión experta de los problemas principales' },
      { en: '1-page plain-language report', pt: "Relatório de 1 página em linguagem simples", es: 'Informe de 1 página en lenguaje claro' },
    ],
  },
  {
    id: 'essential',
    step: 1,
    name: { en: 'Essential Audit', pt: "Essential Audit", es: 'Auditoría esencial' },
    best: { en: 'Small apps, PHP/WordPress sites, MVPs', pt: "Apps pequenos, sites PHP/WordPress, MVPs", es: 'Apps pequeñas, sitios PHP/WordPress, MVPs' },
    price: { en: '$249', pt: "$249", es: '$249' },
    delivery: { en: '3–5 days', pt: "3–5 dias", es: '3–5 días' },
    popular: true,
    items: [
      { en: 'Code, database rules, login and access', pt: "Código, regras do banco de dados, login e acesso", es: 'Código, reglas de base de datos, acceso y login' },
      { en: 'Leaked keys and vulnerable packages', pt: "Chaves vazadas e pacotes vulneráveis", es: 'Claves filtradas y paquetes vulnerables' },
      { en: 'Full report with fix steps', pt: "Relatório completo com passos para corrigir", es: 'Informe completo con pasos para corregir' },
      { en: 'AI-ready fix prompts', pt: "Prompts de correção prontos para IA", es: 'Instrucciones listas para tu herramienta de IA' },
    ],
  },
  {
    id: 'pro',
    step: 1,
    name: { en: 'Pro Audit', pt: "Pro Audit", es: 'Auditoría Pro' },
    best: { en: 'Growing apps, web + mobile, APIs', pt: "Apps em crescimento, web + celular, APIs", es: 'Apps en crecimiento, web + móvil, APIs' },
    price: { en: '$699', pt: "$699", es: '$699' },
    delivery: { en: '5–7 days', pt: "5–7 dias", es: '5–7 días' },
    items: [
      { en: 'Everything in Essential', pt: "Tudo do Essential", es: 'Todo lo de Esencial' },
      { en: 'Mobile app analysis (Android/iOS)', pt: "Análise de app móvel (Android/iOS)", es: 'Análisis de app móvil (Android/iOS)' },
      { en: 'API testing', pt: "Testes de API", es: 'Pruebas de API' },
      { en: '30-min results call + one free re-test', pt: "Chamada de 30 min com os resultados + um novo teste grátis", es: 'Llamada de 30 min + una re-prueba gratis' },
    ],
  },
  {
    id: 'business',
    step: 1,
    name: { en: 'Business Audit', pt: "Business Audit", es: 'Auditoría empresarial' },
    best: { en: 'Large or multi-system businesses', pt: "Empresas grandes ou com vários sistemas", es: 'Empresas con varios sistemas' },
    price: { en: 'From $1,499', pt: "A partir de $1,499", es: 'Desde $1,499' },
    delivery: { en: 'Quoted', pt: "Sob orçamento", es: 'Según alcance' },
    items: [
      { en: 'Custom scope across all systems', pt: "Escopo personalizado em todos os sistemas", es: 'Alcance a medida en todos tus sistemas' },
      { en: 'Executive summary', pt: "Resumo executivo", es: 'Resumen ejecutivo' },
      { en: 'Team walkthrough', pt: "Apresentação para a equipe", es: 'Sesión con tu equipo' },
    ],
  },
  // Step 2: close the gaps
  {
    id: 'single-fix',
    step: 2,
    name: { en: 'Single Fix', pt: "Single Fix", es: 'Corrección única' },
    best: { en: 'One known issue', pt: "Um problema conhecido", es: 'Un problema conocido' },
    price: { en: 'From $29', pt: "A partir de $29", es: 'Desde $29' },
    items: [{ en: 'One issue fixed and verified', pt: "Um problema corrigido e verificado", es: 'Un problema corregido y verificado' }],
  },
  {
    id: 'critical-bundle',
    step: 2,
    name: { en: 'Critical Fix Bundle', pt: "Critical Fix Bundle", es: 'Paquete de correcciones críticas' },
    best: { en: 'After an audit', pt: "Depois de uma auditoria", es: 'Después de una auditoría' },
    price: { en: '$149', pt: "$149", es: '$149' },
    popular: true,
    items: [
      { en: 'Up to 5 critical or high issues fixed', pt: "Até 5 problemas críticos ou altos corrigidos", es: 'Hasta 5 problemas críticos o altos corregidos' },
      { en: 'Re-test included', pt: "Novo teste incluído", es: 'Re-prueba incluida' },
    ],
  },
  {
    id: 'hardening',
    step: 2,
    name: { en: 'Full Hardening', pt: "Full Hardening", es: 'Blindaje completo' },
    best: { en: 'Fix everything found', pt: "Corrigir tudo o que for encontrado", es: 'Corregir todo lo encontrado' },
    price: { en: 'Quoted', pt: "Sob orçamento", es: 'A cotizar' },
    items: [
      { en: 'All audit findings fixed', pt: "Todas as falhas da auditoria corrigidas", es: 'Todos los hallazgos corregidos' },
      { en: 'Re-test included', pt: "Novo teste incluído", es: 'Re-prueba incluida' },
    ],
  },
  // Step 3: stay protected
  {
    id: 'care-basic',
    step: 3,
    name: { en: 'Care Basic', pt: "Care Basic", es: 'Care Básico' },
    best: { en: 'Peace of mind', pt: "Tranquilidade", es: 'Tranquilidad' },
    price: { en: '$19', pt: "$19", es: '$19' },
    period: { en: '/mo · $190/yr', pt: "/mês · $190/ano", es: '/mes · $190/año' },
    items: [
      { en: 'Monthly automated scan', pt: "Varredura automática mensal", es: 'Escaneo automático mensual' },
      { en: 'Uptime monitoring', pt: "Monitoramento de disponibilidade", es: 'Monitoreo de disponibilidad' },
      { en: 'Email alerts', pt: "Alertas por e-mail", es: 'Alertas por correo' },
    ],
  },
  {
    id: 'care-standard',
    step: 3,
    name: { en: 'Care Standard', pt: "Care Standard", es: 'Care Estándar' },
    best: { en: 'Active businesses', pt: "Empresas ativas", es: 'Negocios activos' },
    price: { en: '$49', pt: "$49", es: '$49' },
    period: { en: '/mo · $490/yr', pt: "/mês · $490/ano", es: '/mes · $490/año' },
    popular: true,
    items: [
      { en: 'Everything in Basic', pt: "Tudo do Basic", es: 'Todo lo de Básico' },
      { en: 'Dependency updates', pt: "Atualização de dependências", es: 'Actualización de dependencias' },
      { en: 'Quarterly expert review', pt: "Revisão de especialista trimestral", es: 'Revisión experta trimestral' },
    ],
  },
  {
    id: 'care-pro',
    step: 3,
    name: { en: 'Care Pro', pt: "Care Pro", es: 'Care Pro' },
    best: { en: 'Apps with real users and data', pt: "Apps com usuários e dados reais", es: 'Apps con usuarios y datos reales' },
    price: { en: '$99', pt: "$99", es: '$99' },
    period: { en: '/mo · $990/yr', pt: "/mês · $990/ano", es: '/mes · $990/año' },
    items: [
      { en: 'Everything in Standard', pt: "Tudo do Standard", es: 'Todo lo de Estándar' },
      { en: 'Monthly expert review', pt: "Revisão de especialista mensal", es: 'Revisión experta mensual' },
      { en: '2 hours of fixes per month', pt: "2 horas de correções por mês", es: '2 horas de correcciones al mes' },
      { en: 'Priority support', pt: "Suporte prioritário", es: 'Soporte prioritario' },
    ],
  },
];

export const shieldSteps: { step: 1 | 2 | 3; title: Text; sub: Text }[] = [
  { step: 1, title: { en: 'Find the risks', pt: "Encontre os riscos", es: 'Encuentra los riesgos' }, sub: { en: 'One-time checks and audits', pt: "Verificações e auditorias avulsas", es: 'Revisiones y auditorías únicas' } },
  { step: 2, title: { en: 'Close the gaps', pt: "Feche as brechas", es: 'Cierra las brechas' }, sub: { en: 'We fix what we find', pt: "Corrigimos o que encontrarmos", es: 'Corregimos lo que encontramos' } },
  { step: 3, title: { en: 'Stay protected', pt: "Continue protegido", es: 'Mantente protegido' }, sub: { en: 'Monthly monitoring · yearly = 2 months free', pt: "Monitoramento mensal · anual = 2 meses grátis", es: 'Monitoreo mensual · anual = 2 meses gratis' } },
];

export const shieldPolicies: { icon: string; t: Text; d: Text }[] = [
  { icon: 'gift', t: { en: 'Start free', pt: "Comece grátis", es: 'Empieza gratis' }, d: { en: 'Every client can begin with the free Security Snapshot.', pt: "Todo cliente pode começar com o Security Snapshot grátis.", es: 'Todos pueden empezar con el Diagnóstico rápido gratis.' } },
  { icon: 'trending-up', t: { en: 'Upgrade credit', pt: "Crédito de upgrade", es: 'Crédito para subir de nivel' }, d: { en: 'Pay for an audit, then upgrade within 30 days and the full amount counts toward it.', pt: "Pague por uma auditoria e, se fizer upgrade em até 30 dias, o valor total conta para o novo plano.", es: 'Si subes de auditoría en 30 días, lo que pagaste cuenta completo.' } },
  { icon: 'construct', t: { en: 'Fix credit', pt: "Crédito para correções", es: 'Crédito para correcciones' }, d: { en: '50% of your audit fee is credited toward fixes booked within 30 days.', pt: "50% do valor da auditoria vira crédito para correções agendadas em até 30 dias.", es: 'El 50% de tu auditoría se descuenta de las correcciones en 30 días.' } },
  { icon: 'wallet', t: { en: 'Split payment', pt: "Pagamento dividido", es: 'Pago en dos partes' }, d: { en: 'Audits of $699 and above: half to start, half on delivery.', pt: "Auditorias a partir de $699: metade para começar, metade na entrega.", es: 'Auditorías desde $699: mitad al inicio, mitad al entregar.' } },
  { icon: 'pricetag', t: { en: 'Sylkit customers', pt: "Clientes Sylkit", es: 'Clientes Sylkit' }, d: { en: 'A free Starter Scan with every system you buy and 20% off all Shield plans.', pt: "Um Starter Scan grátis com cada sistema que você comprar e 20% de desconto em todos os planos Shield.", es: 'Escaneo inicial gratis con cada sistema y 20% de descuento en Shield.' } },
  { icon: 'flash', t: { en: 'Launch offer', pt: "Oferta de lançamento", es: 'Oferta de lanzamiento' }, d: { en: 'First 10 clients: 50% off any audit for a testimonial.', pt: "Primeiros 10 clientes: 50% de desconto em qualquer auditoria em troca de um depoimento.", es: 'Primeros 10 clientes: 50% de descuento a cambio de un testimonio.' } },
];
