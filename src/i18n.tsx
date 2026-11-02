import React, { createContext, useContext, useEffect, useState } from 'react';

export type Lang = 'es' | 'en' | 'pt';
export type Text = { es: string; en: string; pt?: string };

type Ctx = { lang: Lang; t: (x: Text) => string };

// The visitor's language, also kept here so plain helper functions (tx) can read it during render.
let current: Lang = 'en';

const textOf = (x: Text, l: Lang) => (l === 'pt' ? x.pt ?? x.es : l === 'es' ? x.es : x.en);

const LangContext = createContext<Ctx>({ lang: 'en', t: (x) => x.en });

// Country fallbacks (ISO codes), used only when the browser language is not one we speak.
const ES_COUNTRIES = new Set(['VE', 'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'PR', 'ES', 'GQ']);
const PT_COUNTRIES = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL']);

const fromCode = (code: string): Lang | null => (code.startsWith('pt') ? 'pt' : code.startsWith('es') ? 'es' : code.startsWith('en') ? 'en' : null);

// Order of decisions:
//  1. ?lang=pt|es|en in the address (handy for sharing a link in a given language; remembered on this device)
//  2. the visitor's browser languages, in their own order of preference
//  3. the country of their connection (Cloudflare adds it as the sk_cc cookie; no location permission needed)
//  4. English
export function detectLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang');
    const forced = q ? fromCode(q.toLowerCase()) : null;
    if (forced) {
      try {
        localStorage.setItem('sylkit_lang', forced);
      } catch {}
      return forced;
    }
    try {
      const saved = localStorage.getItem('sylkit_lang');
      const s = saved ? fromCode(saved) : null;
      if (s) return s;
    } catch {}
    const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
    for (const p of prefs) {
      const l = fromCode(p);
      if (l) return l;
    }
    const cc = (document.cookie.match(/(?:^|; )sk_cc=([A-Z]{2})/) || [])[1];
    if (cc) return PT_COUNTRIES.has(cc) ? 'pt' : ES_COUNTRIES.has(cc) ? 'es' : 'en';
    return 'en';
  } catch {
    return 'en';
  }
}

// The site is built in English and switches to Spanish or Portuguese automatically.
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  useEffect(() => {
    const l = detectLang();
    current = l;
    setLang(l);
    try {
      document.documentElement.lang = l === 'pt' ? 'pt-BR' : l;
    } catch {}
  }, []);
  current = lang;
  const t = (x: Text) => textOf(x, lang);
  return <LangContext.Provider value={{ lang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Inline text in the visitor's language: tx(english, spanish, portuguese).
export const tx = (en: string, es: string, pt?: string) => (current === 'pt' ? pt ?? es : current === 'es' ? es : en);

// Plan names that come from the database (English/Spanish only) shown in Portuguese.
const PT_PLAN: Record<string, string> = { Starter: 'Inicial', Business: 'Negócio', Pro: 'Pro', Basic: 'Básico', 'Domain only': 'Só domínio', 'Domain + email': 'Domínio + e-mail', 'Domain + email + page': 'Domínio + e-mail + página' };
export const planName = (n: { en: string; es: string } | undefined | null) => (!n ? '' : current === 'pt' ? PT_PLAN[n.en] ?? n.es : current === 'es' ? n.es : n.en);

// Shared UI strings
export const ui = {
  tagline: { es: 'Software listo para tu negocio', en: 'Ready-made software for your business', pt: "Software pronto para o seu negócio" },
  heroSub: {
    es: 'Compra sistemas probados o pide una versión hecha a tu medida: punto de venta, inventario, alertas de vencimiento, sitios web, apps y herramientas con IA.',
    en: 'Buy proven systems or order a version built for you: point of sale, inventory, expiry alerts, websites, apps and AI tools.', pt: "Compre sistemas comprovados ou peça uma versão feita para você: ponto de venda, estoque, alertas de validade, sites, apps e ferramentas de IA.",
  },
  search: { es: 'Buscar sistemas, apps, sitios web…', en: 'Search systems, apps, websites…', pt: "Pesquise sistemas, apps, sites…" },
  all: { es: 'Todos', en: 'All', pt: "Todos" },
  featured: { es: 'Software para tu negocio', en: 'Software for your business', pt: "Software para o seu negócio" },
  featuredSub: {
    es: 'Úsalo en tu negocio con instalación y soporte. El sistema sigue siendo nuestro y lo mantenemos por ti.',
    en: 'Use it in your business, with setup and support. We own and maintain the software for you.', pt: "Use no seu negócio, com instalação e suporte. Nós somos donos do software e o mantemos para você.",
  },
  noResults: { es: 'No encontramos resultados. Escríbenos y lo construimos.', en: 'No results. Message us and we will build it.', pt: "Nenhum resultado. Fale conosco e nós construímos." },
  view: { es: 'Ver detalles', en: 'View details', pt: "Ver detalhes" },
  priceOnRequest: { es: 'Precio a consultar', en: 'Price on request', pt: "Preço sob consulta" },
  from: { es: 'Desde', en: 'From', pt: "A partir de" },
  perYear: { es: '/año', en: '/year', pt: "/ano" },
  perMonth: { es: '/mes', en: '/mo', pt: "/mês" },
  talk: { es: 'Hablar por WhatsApp', en: 'Chat on WhatsApp', pt: "Conversar no WhatsApp" },
  customTitle: { es: '¿Necesitas algo a medida?', en: 'Need something custom?', pt: "Precisa de algo sob medida?" },
  customSub: {
    es: 'Cuéntanos cómo funciona tu negocio y te construimos el sistema exacto que necesitas.',
    en: 'Tell us how your business works and we will build the exact system you need.', pt: "Conte como seu negócio funciona e construímos exatamente o sistema de que você precisa.",
  },
  customCta: { es: 'Pedir un sistema a medida', en: 'Order a custom system', pt: "Pedir um sistema sob medida" },
  howTitle: { es: 'Cómo funciona', en: 'How it works', pt: "Como funciona" },
  proofTitle: { es: 'Ya funcionando en negocios reales', en: 'Already running in real businesses', pt: "Já funcionando em negócios reais" },
  proofSub: {
    es: 'Nuestro sistema de alertas de vencimiento está activo en un centro comercial, con apps para escritorio, iOS y Android.',
    en: 'Our expiry alert system is live in a shopping mall, with apps for desktop, iOS and Android.', pt: "Nosso sistema de alertas de validade funciona num shopping, com apps para computador, iOS e Android.",
  },
  features: { es: 'Qué incluye', en: "What's included", pt: "O que está incluído" },
  plan: {
    es: 'Instalación, soporte y actualizaciones incluidos. Paga anual y llévate 2 meses gratis.',
    en: 'Setup, support and updates included. Pay yearly and get 2 months free.', pt: "Instalação, suporte e atualizações incluídos. Pague anualmente e ganhe 2 meses grátis.",
  },
  buy: { es: 'Comprar por WhatsApp', en: 'Buy via WhatsApp', pt: "Comprar pelo WhatsApp" },
  demo: { es: 'Pedir una demostración', en: 'Request a demo', pt: "Pedir uma demonstração" },
  customVersion: { es: 'Quiero una versión personalizada', en: 'I want a custom version', pt: "Quero uma versão personalizada" },
  back: { es: 'Volver al catálogo', en: 'Back to catalog', pt: "Voltar ao catálogo" },
  footer: { es: 'Software para negocios, listo o a medida.', en: 'Business software, ready-made or custom.', pt: "Software para empresas, pronto ou sob medida." },
  notFound: { es: 'Esta página no existe.', en: 'This page does not exist.', pt: "Esta página não existe." },
  home: { es: 'Ir al inicio', en: 'Go home', pt: "Ir para o início" },
};

export const steps: { icon: string; title: Text; body: Text }[] = [
  {
    icon: 'search',
    title: { es: 'Elige', en: 'Choose', pt: "Escolher" },
    body: { es: 'Explora el catálogo o cuéntanos lo que necesitas.', en: 'Browse the catalog or tell us what you need.', pt: "Veja o catálogo ou conte do que você precisa." },
  },
  {
    icon: 'chatbubbles',
    title: { es: 'Habla con nosotros', en: 'Talk to us', pt: "Fale conosco" },
    body: { es: 'Te mostramos una demostración y ajustamos el sistema a tu negocio.', en: 'We show you a demo and fit the system to your business.', pt: "Mostramos uma demo e adaptamos o sistema ao seu negócio." },
  },
  {
    icon: 'rocket',
    title: { es: 'Empieza a usarlo', en: 'Start using it', pt: "Comece a usar" },
    body: { es: 'Lo instalamos, capacitamos a tu equipo y te damos soporte todo el año.', en: 'We install it, train your team and support you all year.', pt: "Instalamos, treinamos sua equipe e damos suporte o ano todo." },
  },
];
