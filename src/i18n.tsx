import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'es' | 'en';
export type Text = { es: string; en: string };

type Ctx = { lang: Lang; t: (x: Text) => string };

const LangContext = createContext<Ctx>({ lang: 'en', t: (x) => x.en });

// Spanish-speaking countries (ISO codes), used only when the browser language is neither Spanish nor English.
const ES_COUNTRIES = new Set(['VE', 'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'PR', 'ES', 'GQ']);

export function detectLang(): Lang {
  try {
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
    const first = prefs.find((l) => l.startsWith('es') || l.startsWith('en'));
    if (prefs[0].startsWith('es')) return 'es';
    if (prefs[0].startsWith('en')) return 'en';
    const cc = (document.cookie.match(/(?:^|; )sk_cc=([A-Z]{2})/) || [])[1];
    if (cc) return ES_COUNTRIES.has(cc) ? 'es' : 'en';
    return first && first.startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

// The site is built in English and switches to Spanish automatically for Spanish-speaking visitors.
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const l = detectLang();
    setLang(l);
    try {
      document.documentElement.lang = l;
    } catch {}
  }, []);
  const t = (x: Text) => x[lang];
  return <LangContext.Provider value={{ lang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Shared UI strings
export const ui = {
  tagline: { es: 'Software listo para tu negocio', en: 'Ready-made software for your business' },
  heroSub: {
    es: 'Compra sistemas probados o pide una versión hecha a tu medida: punto de venta, inventario, alertas de vencimiento, sitios web, apps y herramientas con IA.',
    en: 'Buy proven systems or order a version built for you: point of sale, inventory, expiry alerts, websites, apps and AI tools.',
  },
  search: { es: 'Buscar sistemas, apps, sitios web…', en: 'Search systems, apps, websites…' },
  all: { es: 'Todos', en: 'All' },
  featured: { es: 'Software para tu negocio', en: 'Software for your business' },
  featuredSub: {
    es: 'Úsalo en tu negocio con instalación y soporte. El sistema sigue siendo nuestro y lo mantenemos por ti.',
    en: 'Use it in your business, with setup and support. We own and maintain the software for you.',
  },
  noResults: { es: 'No encontramos resultados. Escríbenos y lo construimos.', en: 'No results. Message us and we will build it.' },
  view: { es: 'Ver detalles', en: 'View details' },
  priceOnRequest: { es: 'Precio a consultar', en: 'Price on request' },
  from: { es: 'Desde', en: 'From' },
  perYear: { es: '/año', en: '/year' },
  perMonth: { es: '/mes', en: '/mo' },
  talk: { es: 'Hablar por WhatsApp', en: 'Chat on WhatsApp' },
  customTitle: { es: '¿Necesitas algo a medida?', en: 'Need something custom?' },
  customSub: {
    es: 'Cuéntanos cómo funciona tu negocio y te construimos el sistema exacto que necesitas.',
    en: 'Tell us how your business works and we will build the exact system you need.',
  },
  customCta: { es: 'Pedir un sistema a medida', en: 'Order a custom system' },
  howTitle: { es: 'Cómo funciona', en: 'How it works' },
  proofTitle: { es: 'Ya funcionando en negocios reales', en: 'Already running in real businesses' },
  proofSub: {
    es: 'Nuestro sistema de alertas de vencimiento está activo en un centro comercial, con apps para escritorio, iOS y Android.',
    en: 'Our expiry alert system is live in a shopping mall, with apps for desktop, iOS and Android.',
  },
  features: { es: 'Qué incluye', en: "What's included" },
  plan: {
    es: 'Instalación, soporte y actualizaciones incluidos. Paga anual y llévate 2 meses gratis.',
    en: 'Setup, support and updates included. Pay yearly and get 2 months free.',
  },
  buy: { es: 'Comprar por WhatsApp', en: 'Buy via WhatsApp' },
  demo: { es: 'Pedir una demostración', en: 'Request a demo' },
  customVersion: { es: 'Quiero una versión personalizada', en: 'I want a custom version' },
  back: { es: 'Volver al catálogo', en: 'Back to catalog' },
  footer: { es: 'Software para negocios, listo o a medida.', en: 'Business software, ready-made or custom.' },
  notFound: { es: 'Esta página no existe.', en: 'This page does not exist.' },
  home: { es: 'Ir al inicio', en: 'Go home' },
};

export const steps: { icon: string; title: Text; body: Text }[] = [
  {
    icon: 'search',
    title: { es: 'Elige', en: 'Choose' },
    body: { es: 'Explora el catálogo o cuéntanos lo que necesitas.', en: 'Browse the catalog or tell us what you need.' },
  },
  {
    icon: 'chatbubbles',
    title: { es: 'Habla con nosotros', en: 'Talk to us' },
    body: { es: 'Te mostramos una demostración y ajustamos el sistema a tu negocio.', en: 'We show you a demo and fit the system to your business.' },
  },
  {
    icon: 'rocket',
    title: { es: 'Empieza a usarlo', en: 'Start using it' },
    body: { es: 'Lo instalamos, capacitamos a tu equipo y te damos soporte todo el año.', en: 'We install it, train your team and support you all year.' },
  },
];
