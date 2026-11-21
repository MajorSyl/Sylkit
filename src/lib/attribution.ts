// Where a client came from, kept on their device so the order shows it even if they browse around first.
//
// Example: someone taps the link in @sylkit.venezuela's bio (sylkit.com/ve?ref=ig), looks at a few products,
// then orders. Without this the order's source would just be "direct"; with it, it reads "via market:ve ?ref=ig".
//
// The last place that told us something wins (a new ?ref= or country page replaces the old one), and it
// is forgotten after 30 days.

const KEY = 'sylkit_src';
const DAYS = 30;

// Query keys that say where a visit came from. Other query strings (filters, ?lang=) are not a source.
const SOURCE_KEYS = ['ref', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'igshid'];

function fromQuery(search: string): string {
  try {
    const q = new URLSearchParams(search);
    const parts: string[] = [];
    for (const k of SOURCE_KEYS) {
      const v = q.get(k);
      if (v) parts.push(k === 'fbclid' || k === 'igshid' ? `${k}` : `${k}=${v.slice(0, 40)}`);
    }
    return parts.join('&');
  } catch {
    return '';
  }
}

/** Called once per visit from the root layout. Country pages (/ve, /sl, /br) count as a source on their own. */
export function rememberSource() {
  if (typeof window === 'undefined') return;
  const market = (window.location.pathname.toLowerCase().match(/^\/(ve|sl|br)\/?$/) || [])[1];
  const q = fromQuery(window.location.search);
  const src = [market ? `market:${market}` : '', q ? `?${q}` : ''].filter(Boolean).join(' ');
  if (!src) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ src: src.slice(0, 150), at: Date.now() }));
  } catch {}
}

function remembered(): string {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return '';
    const { src, at } = JSON.parse(raw);
    if (typeof src !== 'string' || typeof at !== 'number' || Date.now() - at > DAYS * 864e5) return '';
    return src;
  } catch {
    return '';
  }
}

/** The source saved on a new order: this page's query string plus where the visit started. */
export function orderSource(): string {
  if (typeof window === 'undefined') return 'app';
  const here = window.location.search.slice(0, 200);
  const from = remembered();
  return [here, from ? `via ${from}` : ''].filter(Boolean).join(' ').slice(0, 200) || 'direct';
}
