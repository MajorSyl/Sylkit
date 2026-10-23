import { useEffect, useState } from 'react';
import { Product, products as fallback } from '../data/products';
import { supabase } from './supabase';

// Products come from the database. The bundled list is a fallback so the
// catalog always shows, even if the database is slow or unreachable.

let cache: Product[] | null = null;

export const rowToProduct = (r: any): Product => ({
  slug: r.slug,
  category: r.category,
  icon: r.icon,
  tint: r.tint,
  badge: r.badge_es ? { es: r.badge_es, en: r.badge_en ?? r.badge_es } : undefined,
  priceFrom: r.price_from == null ? null : Number(r.price_from),
  name: { es: r.name_es, en: r.name_en },
  short: { es: r.short_es, en: r.short_en },
  description: { es: r.description_es, en: r.description_en },
  features: Array.isArray(r.features) ? r.features : [],
  platforms: r.platforms ?? [],
});

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
