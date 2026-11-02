import { addonCatalog } from '../data/pricing';
import { products } from '../data/products';
import { tx } from '../i18n';

// Names stored in orders and estimates (English/Spanish) shown in the visitor's language.
// Portuguese comes from the bundled extras list when the English name still matches.
export const addonName = (l: { id?: string; name_en: string; name_es: string; qty?: number }) => {
  const local = l.id ? addonCatalog[l.id] : undefined;
  const pt = local && local.name.en === l.name_en ? (local.name as { pt?: string }).pt : undefined;
  return tx(l.name_en, l.name_es, pt ?? l.name_es);
};

export const textIn = (x: { en: string; es: string; pt?: string } | null | undefined) => (x ? tx(x.en, x.es, x.pt ?? x.es) : '');

// Product names saved on an order (English/Spanish). force = 'pt' returns only the Portuguese name.
export const productName = (en: string, es: string, force?: 'pt') => {
  const local = products.find((p) => p.name.en === en);
  const pt = (local?.name as { pt?: string } | undefined)?.pt ?? es;
  return force === 'pt' ? pt : tx(en, es, pt);
};

// Design-template texts are generated as [spanish, english] pairs (scripts/build_store_templates.py).
const PT_TPL: Record<string, string> = {
  'Calm and natural, for decor, furniture and homeware.': 'Calmo e natural, para decoração, móveis e utilidades.',
  'Cheerful and friendly, for pet shops, food and accessories.': 'Alegre e simpático, para pet shops, rações e acessórios.',
  'Clean and editorial, for architecture, interior design and construction firms.': 'Limpo e editorial, para escritórios de arquitetura, design de interiores e construtoras.',
  'Clean and practical, for minimarkets, groceries and produce.': 'Limpo e prático, para minimercados, mercearias e hortifrútis.',
  'Clear and trustworthy, for agencies and agents: search, listings and WhatsApp visits.': 'Claro e confiável, para imobiliárias e corretores: busca, anúncios e visitas pelo WhatsApp.',
  'Dark and modern, for phones, accessories and electronics.': 'Escuro e moderno, para celulares, acessórios e eletrônicos.',
  'Elegant and editorial, for clothing stores and boutiques.': 'Elegante e editorial, para lojas de roupas e boutiques.',
  'For studios and builders: portfolio, quote builder and build tracking for your clients.': 'Para escritórios e construtoras: portfólio, orçamentos e acompanhamento da obra para seus clientes.',
  'Refined and classic, for jewelry, watches and gifts.': 'Refinado e clássico, para joias, relógios e presentes.',
  'Soft and bright, for makeup, skincare and fragrance.': 'Suave e luminoso, para maquiagem, skincare e perfumes.',
  'Warm and appetizing, for bakeries, sweets and food.': 'Acolhedor e apetitoso, para padarias, doces e comida.',
  "Your agency on your clients' phones: they search, save favorites and book visits.": 'Sua imobiliária no celular dos seus clientes: eles buscam, salvam favoritos e agendam visitas.',
  Architecture: 'Arquitetura',
  Beauty: 'Beleza',
  Electronics: 'Eletrônicos',
  Fashion: 'Moda',
  Food: 'Alimentos',
  Grocery: 'Mercado',
  Home: 'Casa',
  Jewelry: 'Joias',
  Pets: 'Pets',
  'Real estate': 'Imóveis',
  'Architecture & build app': 'App de arquitetura e obras',
  'Architecture studio': 'Escritório de arquitetura',
  'Bakery & food': 'Padaria e comida',
  'Beauty & cosmetics': 'Beleza e cosméticos',
  'Fashion & clothing': 'Moda e roupas',
  'Grocery & minimarket': 'Mercearia e minimercado',
  'Home & decor': 'Casa e decoração',
  'Jewelry & watches': 'Joias e relógios',
  'Pet supplies': 'Produtos para pets',
  'Real estate agency': 'Imobiliária',
  'Real estate app': 'App imobiliário',
  'Tech & phones': 'Tecnologia e celulares',
};
export const tplText = (v: [string, string]) => tx(v[1], v[0], PT_TPL[v[1]] ?? v[0]);
