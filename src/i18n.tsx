import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'es' | 'en';
export type Text = { es: string; en: string };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (x: Text) => string };

const LangContext = createContext<Ctx>({
  lang: 'es',
  setLang: () => {},
  t: (x) => x.es,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');
  // Language follows the visitor's saved choice, else their browser/region.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('sylkit_lang');
      if (saved === 'es' || saved === 'en') return setLangState(saved);
      const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es']).map((l) => l.toLowerCase());
      setLangState(prefs[0].startsWith('es') ? 'es' : prefs.some((l) => l.startsWith('es')) && !prefs[0].startsWith('en') ? 'es' : 'en');
    } catch {}
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('sylkit_lang', l);
      document.documentElement.lang = l;
    } catch {}
  };
  const t = (x: Text) => x[lang];
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
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
  featured: { es: 'Productos', en: 'Products' },
  noResults: { es: 'No encontramos resultados. Escríbenos y lo construimos.', en: 'No results. Message us and we will build it.' },
  view: { es: 'Ver detalles', en: 'View details' },
  priceOnRequest: { es: 'Precio a consultar', en: 'Price on request' },
  from: { es: 'Desde', en: 'From' },
  perYear: { es: '/año', en: '/year' },
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
    es: 'Suscripción anual: instalación, soporte y actualizaciones incluidas.',
    en: 'Annual subscription: setup, support and updates included.',
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
