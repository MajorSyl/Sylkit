import type { Text } from '../i18n';

// Country pages: sylkit.com/ve, /sl and /br. One page per country Sylkit operates in, linked from that
// country's Instagram/Facebook page (like Yango's local pages). Each opens in the country's language
// (src/i18n.tsx) and is saved as the order's source (src/lib/attribution.ts).
//
// To add a country: add it here, add its path to MARKET_LANG in src/i18n.tsx and to the pattern in
// rememberSource() (src/lib/attribution.ts), and create app/<code>.tsx like app/ve.tsx.
// Only list payment methods the checkout really offers in that country (src/lib/payOptions.ts).

export type MarketCode = 've' | 'sl' | 'br';

export type Market = {
  code: MarketCode;
  flag: string;
  country: Text;
  inCountry: Text; // "in Venezuela" with the right preposition (pt: na/em/no)
  locale: string; // for the page's og:locale
  h1: Text;
  sub: Text;
  pay: { icon: string; name: Text; note: Text }[];
  featured: string[]; // product slugs, most important first
};

export const markets: Record<MarketCode, Market> = {
  ve: {
    code: 've',
    flag: '🇻🇪',
    country: { es: 'Venezuela', en: 'Venezuela', pt: 'Venezuela' },
    inCountry: { es: 'en Venezuela', en: 'in Venezuela', pt: 'na Venezuela' },
    locale: 'es_VE',
    h1: { es: 'Sistemas para tu negocio en Venezuela', en: 'Business systems for Venezuela', pt: 'Sistemas para empresas na Venezuela' },
    sub: {
      es: 'Punto de venta, inventario, farmacia y tienda en línea. Lo configuramos a distancia y pagas en bolívares con Pago Móvil.',
      en: 'Point of sale, inventory, pharmacy and online store. We set it up remotely and you pay in bolívares with Pago Móvil.',
      pt: 'Ponto de venda, estoque, farmácia e loja online. Configuramos remotamente e você paga em bolívares com Pago Móvil.',
    },
    pay: [
      { icon: 'phone-portrait-outline', name: { es: 'Pago Móvil', en: 'Pago Móvil', pt: 'Pago Móvil' }, note: { es: 'En bolívares, a tasa BCV (Banco Mercantil)', en: 'In bolívares at the BCV rate (Banco Mercantil)', pt: 'Em bolívares, à taxa do BCV (Banco Mercantil)' } },
      { icon: 'business-outline', name: { es: 'Transferencia bancaria', en: 'Bank transfer', pt: 'Transferência bancária' }, note: { es: 'Banco Mercantil, en bolívares', en: 'Banco Mercantil, in bolívares', pt: 'Banco Mercantil, em bolívares' } },
      { icon: 'card-outline', name: { es: 'PayPal o tarjeta', en: 'PayPal or card', pt: 'PayPal ou cartão' }, note: { es: 'Visa y Mastercard', en: 'Visa and Mastercard', pt: 'Visa e Mastercard' } },
      { icon: 'logo-bitcoin', name: { es: 'USDT', en: 'USDT', pt: 'USDT' }, note: { es: 'TRC20 o BEP20, confirmado automáticamente', en: 'TRC20 or BEP20, confirmed automatically', pt: 'TRC20 ou BEP20, confirmado automaticamente' } },
    ],
    featured: ['farmacia-pos', 'punto-de-venta', 'control-de-inventario', 'tienda-online-whatsapp'],
  },
  sl: {
    code: 'sl',
    flag: '🇸🇱',
    country: { es: 'Sierra Leona', en: 'Sierra Leone', pt: 'Serra Leoa' },
    inCountry: { es: 'en Sierra Leona', en: 'in Sierra Leone', pt: 'em Serra Leoa' },
    locale: 'en_SL',
    h1: { es: 'Sistemas para tu negocio en Sierra Leona', en: 'Business systems for Sierra Leone', pt: 'Sistemas para empresas em Serra Leoa' },
    sub: {
      es: 'Punto de venta, farmacia, tiendas en línea y sitios web. Lo configuramos a distancia y pagas con Orange Money o Afrimoney.',
      en: 'Point of sale, pharmacy, online stores and websites. We set it up remotely and you pay with Orange Money or Afrimoney.',
      pt: 'Ponto de venda, farmácia, lojas online e sites. Configuramos remotamente e você paga com Orange Money ou Afrimoney.',
    },
    pay: [
      { icon: 'phone-portrait-outline', name: { es: 'Orange Money', en: 'Orange Money', pt: 'Orange Money' }, note: { es: 'En leones', en: 'In leones', pt: 'Em leones' } },
      { icon: 'phone-portrait-outline', name: { es: 'Afrimoney', en: 'Afrimoney', pt: 'Afrimoney' }, note: { es: 'En leones', en: 'In leones', pt: 'Em leones' } },
      { icon: 'card-outline', name: { es: 'PayPal o tarjeta', en: 'PayPal or card', pt: 'PayPal ou cartão' }, note: { es: 'Visa y Mastercard', en: 'Visa and Mastercard', pt: 'Visa e Mastercard' } },
      { icon: 'logo-bitcoin', name: { es: 'USDT', en: 'USDT', pt: 'USDT' }, note: { es: 'TRC20 o BEP20, confirmado automáticamente', en: 'TRC20 or BEP20, confirmed automatically', pt: 'TRC20 ou BEP20, confirmado automaticamente' } },
    ],
    featured: ['farmacia-pos', 'tienda-online-whatsapp', 'punto-de-venta', 'sitio-web-para-negocios'],
  },
  br: {
    code: 'br',
    flag: '🇧🇷',
    country: { es: 'Brasil', en: 'Brazil', pt: 'Brasil' },
    inCountry: { es: 'en Brasil', en: 'in Brazil', pt: 'no Brasil' },
    locale: 'pt_BR',
    h1: { es: 'Sistemas para tu empresa en Brasil', en: 'Business systems for Brazil', pt: 'Sistemas para empresas no Brasil' },
    sub: {
      es: 'Tiendas en línea, sitios web, reservas y apps. Configuración 100% a distancia; pagas con tarjeta o PayPal.',
      en: 'Online stores, websites, bookings and apps. Set up 100% remotely; pay by card or PayPal.',
      pt: 'Lojas online, sites, agendamentos e apps. Configuração 100% remota; pague com cartão ou PayPal.',
    },
    pay: [
      { icon: 'card-outline', name: { es: 'Tarjeta de crédito', en: 'Credit card', pt: 'Cartão de crédito' }, note: { es: 'Visa y Mastercard, en la página segura de PayPal', en: "Visa and Mastercard, on PayPal's secure page", pt: 'Visa e Mastercard, na página segura do PayPal' } },
      { icon: 'wallet-outline', name: { es: 'PayPal', en: 'PayPal', pt: 'PayPal' }, note: { es: 'Con tu cuenta PayPal', en: 'With your PayPal account', pt: 'Com sua conta PayPal' } },
      { icon: 'logo-bitcoin', name: { es: 'USDT', en: 'USDT', pt: 'USDT' }, note: { es: 'TRC20 o BEP20, confirmado automáticamente', en: 'TRC20 or BEP20, confirmed automatically', pt: 'TRC20 ou BEP20, confirmado automaticamente' } },
    ],
    featured: ['tienda-online-whatsapp', 'sitio-web-para-negocios', 'salon-barberia-reservas', 'app-movil-a-medida'],
  },
};
