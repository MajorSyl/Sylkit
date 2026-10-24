import { useEffect, useState } from 'react';
import type { Text } from '../i18n';
import { supabase } from './supabase';

// Startup marketplace: small online businesses listed for sale.

export type ListingCategory = 'saas' | 'mobile_app' | 'web_app' | 'ecommerce' | 'marketplace' | 'content' | 'ai' | 'agency' | 'other';
export type ListingStatus = 'pending' | 'active' | 'under_offer' | 'sold' | 'rejected';

export type Listing = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string | null;
  category: ListingCategory;
  status: ListingStatus;
  asking_price: number;
  annual_revenue: number;
  monthly_profit: number;
  monthly_users: number | null;
  age_months: number | null;
  tech_stack: string[];
  included: string[];
  reason_for_selling: string | null;
  image_url: string | null;
  demo_url: string | null;
  country: string | null;
  featured: boolean;
  sold_price: number | null;
  sold_at: string | null;
  created_at: string;
};

// Public columns only (seller contact details are never sent to visitors).
export const LISTING_COLUMNS =
  'id,slug,title,tagline,description,category,status,asking_price,annual_revenue,monthly_profit,monthly_users,age_months,tech_stack,included,reason_for_selling,image_url,demo_url,country,featured,sold_price,sold_at,created_at';

export const listingCategories: { id: ListingCategory; icon: string; name: Text; tint: string }[] = [
  { id: 'saas', icon: 'cloud', name: { es: 'SaaS', en: 'SaaS' }, tint: '#2563EB' },
  { id: 'mobile_app', icon: 'phone-portrait', name: { es: 'App móvil', en: 'Mobile app' }, tint: '#7C3AED' },
  { id: 'web_app', icon: 'browsers', name: { es: 'App web', en: 'Web app' }, tint: '#0EA5E9' },
  { id: 'ecommerce', icon: 'cart', name: { es: 'Tienda online', en: 'E-commerce' }, tint: '#EA580C' },
  { id: 'marketplace', icon: 'storefront', name: { es: 'Marketplace', en: 'Marketplace' }, tint: '#DB2777' },
  { id: 'content', icon: 'newspaper', name: { es: 'Contenido', en: 'Content' }, tint: '#16A34A' },
  { id: 'ai', icon: 'sparkles', name: { es: 'IA', en: 'AI' }, tint: '#0E7F98' },
  { id: 'agency', icon: 'briefcase', name: { es: 'Agencia', en: 'Agency' }, tint: '#475569' },
  { id: 'other', icon: 'apps', name: { es: 'Otro', en: 'Other' }, tint: '#64748B' },
];
export const categoryOf = (id: ListingCategory) => listingCategories.find((c) => c.id === id) ?? listingCategories[listingCategories.length - 1];

export const budgets: { id: string; max: number | null; min?: number; name: Text }[] = [
  { id: 'all', max: null, name: { es: 'Todos', en: 'All' } },
  { id: '5k', max: 5000, name: { es: 'Hasta $5K', en: 'Under $5K' } },
  { id: '10k', max: 10000, name: { es: 'Hasta $10K', en: 'Under $10K' } },
  { id: '30k', max: 30000, name: { es: 'Hasta $30K', en: 'Under $30K' } },
  { id: '100k', max: 100000, name: { es: 'Hasta $100K', en: 'Under $100K' } },
  { id: 'big', max: null, min: 100000, name: { es: '$100K+', en: '$100K+' } },
];

export const usd = (n: number | null | undefined) =>
  n == null ? '—' : `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

export const multiple = (l: Pick<Listing, 'asking_price' | 'annual_revenue'>) =>
  l.annual_revenue > 0 ? `${(Number(l.asking_price) / Number(l.annual_revenue)).toFixed(1)}×` : null;

export function useListings() {
  const [list, setList] = useState<Listing[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    supabase
      .from('listings')
      .select(LISTING_COLUMNS)
      .in('status', ['active', 'under_offer', 'sold'])
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(300)
      .then(({ data, error: e }) => {
        if (!alive) return;
        if (e) setError(true);
        setList(((data as any) ?? []) as Listing[]);
      });
    return () => {
      alive = false;
    };
  }, []);
  return { list, error };
}

export async function fetchListing(slug: string) {
  const { data } = await supabase.from('listings').select(LISTING_COLUMNS).eq('slug', slug).maybeSingle();
  return (data as any as Listing) ?? null;
}
