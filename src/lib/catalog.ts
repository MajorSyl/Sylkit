import { useEffect, useState } from 'react';
import { pricingBySlug, type Pricing } from '../data/pricing';
import { Product, productImages, products as fallback } from '../data/products';
import { supabase } from './supabase';

// Products come from the database. The bundled list is a fallback so the
// catalog always shows, even if the database is slow or unreachable.

let cache: Product[] | null = null;

// The database stores English and Spanish only. Portuguese comes from the bundled copy of the same
// text, and is used only while the English still matches (an edited text falls back to Spanish).
type T3 = { es: string; en: string; pt?: string };
const withPt = (db: T3, local?: T3): T3 => (local?.pt && local.en === db.en ? { ...db, pt: local.pt } : db);

function pricingWithPt(db: any, local?: Pricing): Pricing {
  if (!local) return db;
  return {
    ...db,
    plans: db.plans.map((p: any) => {
      const lp = local.plans.find((x) => x.id === p.id);
      return { ...p, name: withPt(p.name, lp?.name), includes: (p.includes ?? []).map((inc: T3, i: number) => withPt(inc, lp?.includes?.[i])) };
    }),
  };
}

export const rowToProduct = (r: any): Product => {
  const local = fallback.find((p) => p.slug === r.slug);
  const badge = r.badge_es ? { es: r.badge_es, en: r.badge_en ?? r.badge_es } : undefined;
  return {
    slug: r.slug,
    category: r.category,
    icon: r.icon,
    tint: r.tint,
    badge: badge ? withPt(badge, local?.badge) : undefined,
    priceFrom: r.price_from == null ? null : Number(r.price_from),
    name: withPt({ es: r.name_es, en: r.name_en }, local?.name),
    short: withPt({ es: r.short_es, en: r.short_en }, local?.short),
    description: withPt({ es: r.description_es, en: r.description_en }, local?.description),
    features: Array.isArray(r.features) ? r.features.map((f: T3, i: number) => withPt(f, local?.features[i])) : [],
    platforms: r.platforms ?? [],
    demoUrl: r.demo_url ?? undefined,
    image: r.image_url ?? productImages[r.slug],
    cover: productImages[r.slug] ? productImages[r.slug].replace('/shots/', '/shots/covers/') : undefined,
    pricing: r.pricing && Array.isArray(r.pricing.plans) ? pricingWithPt(r.pricing, pricingBySlug[r.slug]) : pricingBySlug[r.slug],
  };
};

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('active', true).order('sort');
  if (error || !data || data.length === 0) throw error ?? new Error('empty');
  cache = data.map(rowToProduct);
  return cache;
}

export function useProducts() {
  const [list, setList] = useState<Product[]>(cache ?? fallback);
  useEffect(() => {
    let alive = true;
    fetchProducts().then((p) => alive && setList(p)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return list;
}
