// Client for the Sylkit 2.0 live demos (/api/demo/*). Each visitor gets a private demo workspace
// with synthetic sample data; its key is kept in this browser only.
import { useEffect, useState } from 'react';

const KEY = 'sk_demo_ws';
let pending: Promise<string> | null = null;

function stored() {
  try {
    const v = localStorage.getItem(KEY);
    return v && /^[A-Za-z0-9]{24}$/.test(v) ? v : null;
  } catch {
    return null;
  }
}

async function create(): Promise<string> {
  const r = await fetch('/api/demo/ws', { method: 'POST' });
  const j = await r.json();
  if (!j.ws) throw new Error(j.error || 'demo_unavailable');
  try {
    localStorage.setItem(KEY, j.ws);
  } catch {}
  return j.ws;
}

export function getWs(fresh = false): Promise<string> {
  if (!fresh) {
    const s = stored();
    if (s) return Promise.resolve(s);
  }
  pending ||= create().finally(() => (pending = null));
  return pending;
}

/** Calls the demo API with this visitor's workspace; recreates it once if it expired. */
export async function demoApi<T = any>(path: string, body?: unknown, retried = false): Promise<T & { error?: string; _status: number }> {
  const ws = await getWs(retried);
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`/api/demo/${path}${sep}ws=${ws}`, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ error: 'network' }));
  if (r.status === 401 && !retried) return demoApi(path, body, true);
  return { ...j, _status: r.status };
}

/** Public demo endpoints (a ticket, a tracking code, a client progress link). */
export async function demoPublic<T = any>(path: string): Promise<T & { error?: string; _status: number }> {
  const r = await fetch(`/api/demo/${path}`);
  const j = await r.json().catch(() => ({ error: 'network' }));
  return { ...j, _status: r.status };
}

/** Loads demo data and reloads on demand. */
export function useDemo<T = any>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    demoApi<T>(path)
      .then((j) => {
        if (!alive) return;
        if (j.error) setError(j.error);
        else {
          setError(null);
          setData(j);
        }
      })
      .catch(() => alive && setError('network'));
    return () => {
      alive = false;
    };
  }, [path, n]);
  return { data, error, reload: () => setN((x) => x + 1) };
}

export const today = (o = 0) => new Date(Date.now() + o * 864e5).toISOString().slice(0, 10);

export const money = (n: number, cur = 'USD') => new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export function fmtDate(d: string, lang: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  const loc = lang === 'es' ? 'es' : lang === 'pt' ? 'pt-BR' : 'en';
  return new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString(loc, opts);
}
