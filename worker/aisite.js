// Sylkit AI Builder: turns the site data the AI writes into a finished one-page business website.
//
// The AI never writes HTML or links. It fills a fixed set of fields (name, texts, services, hours,
// contact details) and picks a style and a color. Everything here escapes text, and the only links
// a site can have are ones we build ourselves: WhatsApp, phone, email, Google Maps and the
// Instagram / Facebook / TikTok profile of a handle. So a generated site can't host login forms
// or point people to fake pages.
//
//   sanitizeSite(raw)            -> clean site data (or throws 'empty_site')
//   renderSite(site, opts)       -> full HTML page
//     opts.preview: shows the "Preview" ribbon and noindex
//     opts.url:     public address (for the page's canonical/OG tags)
//     opts.media:   { logo, photos[] } image URLs uploaded by the customer (never chosen by the AI)

export const STYLES = ['clean', 'warm', 'bold', 'elegant', 'fresh'];
const ICON_RE = /^\p{Extended_Pictographic}(‍?\p{Extended_Pictographic}|️|\p{Emoji_Modifier})*$/u;

// ---------- sanitizing what the AI returns ----------

const str = (v, max) =>
  String(v ?? '')
    .replace(/[\u0000-\u001f\u007f<>]/g, ' ')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
const para = (v, max) =>
  String(v ?? '')
    .replace(/[<>]/g, ' ')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
const icon = (v, fallback = '✨') => {
  const s = String(v ?? '').trim();
  return s && s.length <= 12 && ICON_RE.test(s) ? s : fallback;
};
const list = (v, max) => (Array.isArray(v) ? v.slice(0, max) : []);
const hex = (v, fallback) => (/^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim().toLowerCase() : fallback);
const handle = (v) => {
  const s = String(v ?? '')
    .trim()
    .replace(/^https?:\/\/(www\.)?(instagram|facebook|tiktok)\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
  return /^[A-Za-z0-9._]{2,40}$/.test(s) ? s : '';
};
// Numbers people write the local way (0412…, 076…, (11) 9…) become international, so WhatsApp links work.
const phone = (v, lang) => {
  let s = String(v ?? '').replace(/[^\d+]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    if (/^0[24]\d{9}$/.test(s)) s = '+58' + s.slice(1); // Venezuela: 0412 555 1234, 0212 …
    else if (/^0(2[0-9]|3[0-9]|7[0-9]|8[0-9]|99)\d{6}$/.test(s)) s = '+232' + s.slice(1); // Sierra Leone: 076 123 456
    else if (lang === 'pt' && /^[1-9]{2}9?\d{8}$/.test(s)) s = '+55' + s; // Brazil: (11) 90000-0000
  }
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 ? (s.startsWith('+') ? '+' : '') + digits : '';
};
const email = (v) => {
  const s = String(v ?? '').trim();
  return /^[^@\s<>"']{1,64}@[A-Za-z0-9.-]{1,100}\.[A-Za-z]{2,20}$/.test(s) ? s : '';
};

export function sanitizeSite(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const lang = ['es', 'en', 'pt'].includes(r.lang) ? r.lang : 'es';
  const c = r.contact && typeof r.contact === 'object' ? r.contact : {};
  const site = {
    lang,
    name: str(r.name, 60),
    icon: icon(r.icon),
    style: STYLES.includes(r.style) ? r.style : 'clean',
    accent: hex(r.accent, '#2558e8'),
    tagline: str(r.tagline, 90),
    hero: {
      title: str(r.hero?.title, 90),
      subtitle: para(r.hero?.subtitle, 240),
      button: str(r.hero?.button, 32),
    },
    features: list(r.features, 4)
      .map((f) => ({ icon: icon(f?.icon), title: str(f?.title, 50), text: str(f?.text, 140) }))
      .filter((f) => f.title),
    services: {
      title: str(r.services?.title, 50),
      intro: str(r.services?.intro, 180),
      items: list(r.services?.items, 12)
        .map((s) => ({ icon: icon(s?.icon), name: str(s?.name, 60), text: str(s?.text, 180), price: str(s?.price, 24) }))
        .filter((s) => s.name),
    },
    about: { title: str(r.about?.title, 50), text: para(r.about?.text, 900) },
    hours: list(r.hours, 7)
      .map((h) => ({ days: str(h?.days, 40), time: str(h?.time, 40) }))
      .filter((h) => h.days && h.time),
    faq: list(r.faq, 6)
      .map((q) => ({ q: str(q?.q, 140), a: para(q?.a, 400) }))
      .filter((q) => q.q && q.a),
    cta: { title: str(r.cta?.title, 80), text: str(r.cta?.text, 200), button: str(r.cta?.button, 32) },
    contact: {
      whatsapp: phone(c.whatsapp, lang),
      phone: phone(c.phone, lang),
      email: email(c.email),
      address: str(c.address, 140),
      city: str(c.city, 60),
      instagram: handle(c.instagram),
      facebook: handle(c.facebook),
      tiktok: handle(c.tiktok),
    },
  };
  if (!site.name || !site.hero.title) throw new Error('empty_site');
  return site;
}

// ---------- rendering ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const nl = (s) => esc(s).replace(/\n/g, '<br>');

const FONTS = {
  clean: { link: 'family=Inter:wght@400;500;600;700;800', head: "'Inter'", body: "'Inter'", hw: 800, ls: '-0.035em' },
  warm: { link: 'family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700', head: "'Fraunces'", body: "'Inter'", hw: 700, ls: '-0.02em' },
  bold: { link: 'family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700', head: "'Space Grotesk'", body: "'Inter'", hw: 700, ls: '-0.045em' },
  elegant: { link: 'family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600', head: "'Playfair Display'", body: "'Inter'", hw: 700, ls: '-0.01em' },
  fresh: { link: 'family=Plus+Jakarta+Sans:wght@400;500;600;700;800', head: "'Plus Jakarta Sans'", body: "'Plus Jakarta Sans'", hw: 800, ls: '-0.03em' },
};
const BASE = {
  clean: { bg: '#ffffff', surface: '#f6f7f9', text: '#0f172a', muted: '#5b6474', line: 'rgba(15,23,42,.09)', r: '14px', heroDark: false },
  warm: { bg: '#fbf7f1', surface: '#f3ebdf', text: '#2a1d14', muted: '#7a6555', line: 'rgba(42,29,20,.10)', r: '18px', heroDark: false },
  bold: { bg: '#ffffff', surface: '#f2f2f0', text: '#0e0e0e', muted: '#5d5d5a', line: 'rgba(0,0,0,.10)', r: '6px', heroDark: true },
  elegant: { bg: '#faf9f7', surface: '#f1eee9', text: '#1b1a18', muted: '#6e6a63', line: 'rgba(27,26,24,.10)', r: '4px', heroDark: false },
  fresh: { bg: '#ffffff', surface: '#f2f7f6', text: '#0d1f1c', muted: '#53645f', line: 'rgba(13,31,28,.09)', r: '22px', heroDark: false },
};

function rgb(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(h, w, t) {
  const a = rgb(h);
  const b = rgb(w);
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function lum(h) {
  const [r, g, b] = rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const UI = {
  es: { services: 'Servicios', gallery: 'Galería', about: 'Nosotros', hours: 'Horario', contact: 'Contacto', faq: 'Preguntas frecuentes', write: 'Escríbenos por WhatsApp', call: 'Llamar', mail: 'Correo', map: 'Ver en el mapa', see: 'Ver servicios', made: 'Hecho con Sylkit · Crea tu web con IA', preview: 'Vista previa · Así se verá tu web. Aún no está publicada.', hi: 'Hola, les escribo desde su página web.', ask: (n) => `Hola, me interesa: ${n}.`, follow: 'Síguenos', where: 'Dónde estamos' },
  en: { services: 'Services', gallery: 'Gallery', about: 'About', hours: 'Hours', contact: 'Contact', faq: 'Questions', write: 'Message us on WhatsApp', call: 'Call', mail: 'Email', map: 'Open in Maps', see: 'See services', made: 'Made with Sylkit · Build your website with AI', preview: 'Preview · This is how your website will look. It is not published yet.', hi: 'Hi, I am writing from your website.', ask: (n) => `Hi, I am interested in: ${n}.`, follow: 'Follow us', where: 'Find us' },
  pt: { services: 'Serviços', gallery: 'Galeria', about: 'Sobre nós', hours: 'Horário', contact: 'Contato', faq: 'Perguntas frequentes', write: 'Fale conosco no WhatsApp', call: 'Ligar', mail: 'E-mail', map: 'Ver no mapa', see: 'Ver serviços', made: 'Feito com Sylkit · Crie seu site com IA', preview: 'Prévia · Assim seu site vai ficar. Ainda não está publicado.', hi: 'Olá, estou escrevendo pelo seu site.', ask: (n) => `Olá, tenho interesse em: ${n}.`, follow: 'Siga-nos', where: 'Onde estamos' },
};

const SVG = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.91-4.45 9.91-9.91A9.9 9.9 0 0 0 12.04 2Zm5.8 14.09c-.25.69-1.44 1.32-1.98 1.37-.51.05-1 .24-3.36-.7-2.84-1.12-4.65-4.03-4.79-4.22-.14-.19-1.14-1.52-1.14-2.9 0-1.38.72-2.06.98-2.34.25-.28.55-.35.74-.35l.53.01c.17.01.4-.06.62.48.25.6.84 2.07.91 2.22.07.15.12.32.02.51-.1.2-.15.32-.29.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.64-.07.18-.2.74-.86.94-1.16.2-.3.39-.25.66-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.07.12.07.72-.18 1.4Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 7 8-5H4l8 5Zm0 2L4 8v10h16V8l-8 5Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Zm5.25-3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.6V14h2.7v8h3.2Z"/></svg>',
  tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.6a7.7 7.7 0 0 0 4.4 1.4V6.7a4.4 4.4 0 0 1-4.4-4.7Z"/></svg>',
};

export function renderSite(site, opts = {}) {
  const s = site;
  const u = UI[s.lang] || UI.es;
  const f = FONTS[s.style] || FONTS.clean;
  const b = BASE[s.style] || BASE.clean;
  const accent = s.accent;
  const ink = lum(accent) > 0.45 ? '#111111' : '#ffffff';
  const soft = mix(accent, '#ffffff', 0.88);
  const deep = mix(accent, '#000000', 0.25);
  const c = s.contact;
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, '')}` : '';
  const waText = (t) => (wa ? `${wa}?text=${encodeURIComponent(t)}` : '');
  const mapQ = [c.address, c.city].filter(Boolean).join(', ');
  const mapUrl = mapQ ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name}, ${mapQ}`)}` : '';
  const primary = wa ? waText(u.hi) : c.phone ? `tel:${c.phone}` : c.email ? `mailto:${c.email}` : '#contacto';
  const heroBtn = s.hero.button || (wa ? u.write : u.contact);
  const title = `${s.name}${s.tagline ? ` · ${s.tagline}` : ''}`;
  const desc = (s.hero.subtitle || s.tagline || s.about.text || '').slice(0, 160);
  const hasServices = s.services.items.length > 0;
  const hasContact = !!(wa || c.phone || c.email || mapQ);
  const social = [
    c.instagram && [`https://instagram.com/${c.instagram}`, SVG.ig, 'Instagram'],
    c.facebook && [`https://facebook.com/${c.facebook}`, SVG.fb, 'Facebook'],
    c.tiktok && [`https://www.tiktok.com/@${c.tiktok}`, SVG.tt, 'TikTok'],
  ].filter(Boolean);
  const chips = s.services.items.slice(0, 3);
  const media = opts.media || {};
  const logo = typeof media.logo === 'string' ? media.logo : '';
  const photos = (Array.isArray(media.photos) ? media.photos : []).filter((x) => typeof x === 'string').slice(0, 8);
  const heroPhoto = photos[0] || '';
  const gallery = photos.length > 1 ? photos : [];

  const nav = [
    hasServices && ['#servicios', s.services.title || u.services],
    gallery.length && ['#galeria', u.gallery],
    s.about.text && ['#nosotros', s.about.title || u.about],
    s.hours.length && ['#horario', u.hours],
    hasContact && ['#contacto', u.contact],
  ].filter(Boolean);

  const css = `
:root{--bg:${b.bg};--surface:${b.surface};--text:${b.text};--muted:${b.muted};--line:${b.line};--accent:${accent};--ink:${ink};--soft:${soft};--deep:${deep};--r:${b.r};--head:${f.head},system-ui,sans-serif;--body:${f.body},system-ui,sans-serif}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{font-family:var(--body);background:var(--bg);color:var(--text);line-height:1.6;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}svg{width:1.15em;height:1.15em;flex:none}
.w{max-width:1120px;margin:0 auto;padding:0 22px}
h1,h2,h3{font-family:var(--head);font-weight:${f.hw};letter-spacing:${f.ls};line-height:1.08}
.btn{display:inline-flex;align-items:center;gap:10px;background:var(--accent);color:var(--ink);font-weight:700;padding:15px 24px;border-radius:calc(var(--r) * .8 + 6px);font-size:16px;transition:transform .15s,box-shadow .15s;box-shadow:0 10px 24px -12px var(--accent)}
.btn:hover{transform:translateY(-1px)}.btn.ghost{background:transparent;color:inherit;box-shadow:none;border:1.5px solid var(--line)}
.ribbon{position:sticky;top:0;z-index:60;background:#111;color:#fff;text-align:center;font:600 13px/1.4 system-ui,sans-serif;padding:9px 14px}
header{position:sticky;top:${opts.preview ? '37px' : '0'};z-index:50;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:saturate(1.6) blur(12px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;gap:18px;height:68px}
.brand{display:flex;align-items:center;gap:10px;font-family:var(--head);font-weight:${f.hw};font-size:19px;letter-spacing:${f.ls};margin-right:auto;min-width:0}
.brand span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mark{width:38px;height:38px;border-radius:calc(var(--r) * .6 + 4px);background:var(--soft);display:grid;place-items:center;font-size:20px;flex:none}
.links{display:flex;gap:22px;font-size:15px;color:var(--muted);font-weight:500}.links a:hover{color:var(--text)}
.nav .btn{padding:10px 16px;font-size:14px;box-shadow:none}
.hero{position:relative;overflow:hidden;padding:76px 0 84px}
.hero .grid{display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:center}
.kick{display:inline-flex;align-items:center;gap:8px;background:var(--soft);color:var(--deep);font-weight:700;font-size:13.5px;padding:7px 14px;border-radius:99px;margin-bottom:20px}
.hero h1{font-size:clamp(38px,6vw,66px)}
.hero p{font-size:clamp(17px,2vw,20px);color:var(--muted);margin:20px 0 32px;max-width:560px}
.actions{display:flex;gap:12px;flex-wrap:wrap}
.art{position:relative;aspect-ratio:1;max-width:440px;width:100%;justify-self:center}
.blob{position:absolute;inset:6%;border-radius:${s.style === 'bold' || s.style === 'elegant' ? 'var(--r)' : '42% 58% 55% 45% / 48% 42% 58% 52%'};background:radial-gradient(120% 120% at 20% 10%,var(--soft),var(--accent));box-shadow:0 40px 80px -40px var(--accent)}
.big{position:absolute;inset:0;display:grid;place-items:center;font-size:clamp(110px,16vw,170px);filter:drop-shadow(0 18px 24px rgba(0,0,0,.18))}
.chip{position:absolute;background:var(--bg);color:var(--text);border:1px solid var(--line);border-radius:99px;padding:9px 15px 9px 11px;font-weight:600;font-size:14px;display:flex;gap:8px;align-items:center;box-shadow:0 14px 30px -14px rgba(0,0,0,.25);white-space:nowrap;max-width:240px;overflow:hidden;text-overflow:ellipsis}
.chip.c0{top:8%;left:-6%}.chip.c1{top:48%;right:-8%}.chip.c2{bottom:6%;left:4%}
.dark .hero{background:var(--text);color:var(--bg)}.dark .hero p{color:color-mix(in srgb,var(--bg) 72%,transparent)}.dark .hero .btn.ghost{border-color:color-mix(in srgb,var(--bg) 25%,transparent)}
.dark .kick{background:color-mix(in srgb,var(--accent) 22%,transparent);color:var(--bg)}
.center .hero .grid{grid-template-columns:1fr;text-align:center;justify-items:center}.center .hero p{margin-left:auto;margin-right:auto}.center .actions{justify-content:center}.center .art{display:none}
section{padding:84px 0}
.head{max-width:640px;margin-bottom:40px}.head h2{font-size:clamp(30px,4vw,44px)}.head p{color:var(--muted);font-size:18px;margin-top:12px}
.feats{position:relative;z-index:2;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:-30px}
.feat{background:var(--bg);border:1px solid var(--line);border-radius:var(--r);padding:22px;display:flex;gap:14px;align-items:flex-start}
.feat .ic{font-size:24px;width:46px;height:46px;border-radius:calc(var(--r) * .6 + 4px);background:var(--soft);display:grid;place-items:center;flex:none}
.feat h3{font-size:17px;margin-bottom:4px;font-family:var(--body);font-weight:700;letter-spacing:-.01em}.feat p{color:var(--muted);font-size:15px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.card{background:var(--surface);border-radius:var(--r);padding:26px;display:flex;flex-direction:column;gap:10px;border:1px solid transparent;transition:border-color .15s,transform .15s}
.card:hover{border-color:var(--line);transform:translateY(-2px)}
.card .ic{font-size:30px}.card h3{font-size:20px}.card p{color:var(--muted);font-size:15.5px;flex:1}
.card .row{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px}
.price{font-weight:800;font-size:18px;color:var(--deep)}
.ask{font-weight:700;font-size:14px;color:var(--deep);display:inline-flex;gap:6px;align-items:center}
.about{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.about .txt{font-size:18px;color:var(--muted)}.about .txt p+p{margin-top:14px}
.panel{background:var(--surface);border-radius:var(--r);padding:30px}
.hours{display:grid;gap:2px}.hours div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line);font-size:16px}.hours div:last-child{border:0}.hours b{font-weight:600}
.alt{background:var(--surface)}.alt .card{background:var(--bg)}.alt .panel{background:var(--bg)}
.faq{max-width:780px}.faq details{border-bottom:1px solid var(--line);padding:20px 0}.faq summary{cursor:pointer;font-weight:700;font-size:18px;list-style:none;display:flex;justify-content:space-between;gap:20px}
.faq summary::after{content:'+';font-size:24px;line-height:1;color:var(--deep)}.faq details[open] summary::after{content:'–'}.faq p{color:var(--muted);margin-top:10px;font-size:16px}
.ctaband{background:var(--accent);color:var(--ink);border-radius:calc(var(--r) * 1.4);padding:56px 40px;text-align:center;display:grid;gap:14px;justify-items:center}
.ctaband h2{font-size:clamp(28px,4vw,42px)}.ctaband p{opacity:.85;font-size:18px;max-width:560px}.ctaband .btn{background:var(--ink);color:var(--accent);margin-top:10px;box-shadow:none}
.contact{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.ct{display:flex;gap:14px;align-items:center;background:var(--surface);border-radius:var(--r);padding:20px;font-weight:600;min-width:0}
.ct .ic{width:44px;height:44px;border-radius:50%;background:var(--accent);color:var(--ink);display:grid;place-items:center;flex:none}
.ct small{display:block;color:var(--muted);font-weight:500;font-size:13px}.ct span{min-width:0;overflow-wrap:anywhere}
footer{border-top:1px solid var(--line);padding:36px 0 110px;color:var(--muted);font-size:14px}
footer .w{display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between}
.soc{display:flex;gap:10px}.soc a{width:40px;height:40px;border-radius:50%;border:1px solid var(--line);display:grid;place-items:center;color:var(--text)}
.made{display:inline-flex;align-items:center;gap:6px;font-weight:600;color:var(--muted)}.made:hover{color:var(--text)}
.mark.img{background:#fff;border:1px solid var(--line);overflow:hidden}.mark img{width:100%;height:100%;object-fit:contain}
.photo{position:absolute;inset:4%;border-radius:${s.style === 'bold' || s.style === 'elegant' ? 'var(--r)' : '28px'};overflow:hidden;box-shadow:0 40px 80px -36px rgba(0,0,0,.45)}.photo img{width:100%;height:100%;object-fit:cover;display:block}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}.gal a{display:block;border-radius:var(--r);overflow:hidden;aspect-ratio:4/3;background:var(--surface)}.gal img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.gal a:hover img{transform:scale(1.04)}
.center .hero .heroimg{display:block;width:100%;max-width:880px;aspect-ratio:16/8;border-radius:var(--r);overflow:hidden;margin-top:40px}.center .hero .heroimg img{width:100%;height:100%;object-fit:cover;display:block}
.float{position:fixed;right:18px;bottom:18px;z-index:70;width:60px;height:60px;border-radius:50%;background:#25d366;color:#fff;display:grid;place-items:center;box-shadow:0 14px 30px -8px rgba(0,0,0,.35)}.float svg{width:30px;height:30px}
@media (max-width:860px){.links{display:none}.hero{padding:48px 0 64px}.hero .grid,.about{grid-template-columns:1fr;gap:34px}.art{max-width:300px}.chip.c0{left:-2%}.chip.c1{right:-2%}section{padding:64px 0}.feats{margin-top:0}.ctaband{padding:42px 22px}}
@media (max-width:420px){.nav .btn span{display:none}.nav .btn{padding:10px 12px}}`;

  const layoutClass = [b.heroDark ? 'dark' : '', s.style === 'elegant' ? 'center' : ''].filter(Boolean).join(' ');

  const html = `<!doctype html>
<html lang="${s.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
${opts.preview ? '<meta name="robots" content="noindex, nofollow">' : ''}${opts.url ? `<link rel="canonical" href="${esc(opts.url)}"><meta property="og:url" content="${esc(opts.url)}">` : ''}
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta name="theme-color" content="${b.heroDark ? b.text : b.bg}">
${logo ? `<link rel="icon" href="${esc(logo)}">` : `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${s.icon}</text></svg>`)}">`}${heroPhoto ? `<meta property="og:image" content="${esc(heroPhoto)}">` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${f.link}&display=swap">
<style>${css}</style></head>
<body class="${layoutClass}">
${opts.preview ? `<div class="ribbon">${esc(u.preview)}</div>` : ''}
<header><div class="w nav">
<a class="brand" href="#">${logo ? `<span class="mark img"><img src="${esc(logo)}" alt=""></span>` : `<span class="mark">${s.icon}</span>`}<span>${esc(s.name)}</span></a>
<nav class="links">${nav.map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join('')}</nav>
${wa ? `<a class="btn" href="${esc(waText(u.hi))}" target="_blank" rel="noopener">${SVG.wa}<span>WhatsApp</span></a>` : ''}
</div></header>
<main>
<div class="hero"><div class="w grid">
<div>
${s.tagline ? `<div class="kick">${s.icon} ${esc(s.tagline)}</div>` : ''}
<h1>${esc(s.hero.title)}</h1>
${s.hero.subtitle ? `<p>${nl(s.hero.subtitle)}</p>` : ''}
<div class="actions"><a class="btn" href="${esc(primary)}" ${wa ? 'target="_blank" rel="noopener"' : ''}>${wa ? SVG.wa : ''}${esc(heroBtn)}</a>${hasServices ? `<a class="btn ghost" href="#servicios">${esc(u.see)}</a>` : ''}</div>
</div>
${s.style === 'elegant' && heroPhoto ? `<div class="heroimg"><img src="${esc(heroPhoto)}" alt="${esc(s.name)}"></div>` : ''}<div class="art">${heroPhoto ? `<div class="photo"><img src="${esc(heroPhoto)}" alt="${esc(s.name)}"></div>` : `<div class="blob"></div><div class="big">${s.icon}</div>`}${chips.map((x, i) => `<div class="chip c${i}">${x.icon} ${esc(x.name)}</div>`).join('')}</div>
</div></div>
${s.features.length ? `<div class="w"><div class="feats">${s.features.map((x) => `<div class="feat"><div class="ic">${x.icon}</div><div><h3>${esc(x.title)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : ''}</div></div>`).join('')}</div></div>` : ''}
${
  hasServices
    ? `<section id="servicios"><div class="w">
<div class="head"><h2>${esc(s.services.title || u.services)}</h2>${s.services.intro ? `<p>${esc(s.services.intro)}</p>` : ''}</div>
<div class="cards">${s.services.items
        .map(
          (x) => `<div class="card"><div class="ic">${x.icon}</div><h3>${esc(x.name)}</h3>${x.text ? `<p>${esc(x.text)}</p>` : '<p></p>'}<div class="row">${x.price ? `<span class="price">${esc(x.price)}</span>` : '<span></span>'}${wa ? `<a class="ask" href="${esc(waText(u.ask(x.name)))}" target="_blank" rel="noopener">${SVG.wa} WhatsApp</a>` : ''}</div></div>`,
        )
        .join('')}</div>
</div></section>`
    : ''
}
${
  gallery.length
    ? `<section id="galeria"><div class="w"><div class="head"><h2>${esc(u.gallery)}</h2></div><div class="gal">${gallery.map((g) => `<a href="${esc(g)}" target="_blank" rel="noopener"><img src="${esc(g)}" alt="${esc(s.name)}" loading="lazy"></a>`).join('')}</div></div></section>`
    : ''
}
${
  s.about.text || s.hours.length
    ? `<section id="nosotros" class="alt"><div class="w about">
<div>${s.about.text ? `<div class="head" style="margin-bottom:18px"><h2>${esc(s.about.title || u.about)}</h2></div><div class="txt">${s.about.text
        .split(/\n\n+/)
        .map((p) => `<p>${nl(p)}</p>`)
        .join('')}</div>` : ''}</div>
<div>${s.hours.length ? `<div class="panel" id="horario"><h3 style="font-size:22px;margin-bottom:12px">${esc(u.hours)}</h3><div class="hours">${s.hours.map((h) => `<div><b>${esc(h.days)}</b><span>${esc(h.time)}</span></div>`).join('')}</div></div>` : ''}</div>
</div></section>`
    : ''
}
${
  s.faq.length
    ? `<section><div class="w"><div class="head"><h2>${esc(u.faq)}</h2></div><div class="faq">${s.faq.map((q) => `<details><summary>${esc(q.q)}</summary><p>${nl(q.a)}</p></details>`).join('')}</div></div></section>`
    : ''
}
${
  hasContact
    ? `<section id="contacto" ${s.faq.length ? '' : 'class="alt"'}><div class="w">
<div class="head"><h2>${esc(u.contact)}</h2>${mapQ ? `<p>${esc(mapQ)}</p>` : ''}</div>
<div class="contact">
${wa ? `<a class="ct" href="${esc(waText(u.hi))}" target="_blank" rel="noopener"><span class="ic">${SVG.wa}</span><span><small>WhatsApp</small>${esc(c.whatsapp)}</span></a>` : ''}
${c.phone ? `<a class="ct" href="tel:${esc(c.phone)}"><span class="ic">${SVG.phone}</span><span><small>${esc(u.call)}</small>${esc(c.phone)}</span></a>` : ''}
${c.email ? `<a class="ct" href="mailto:${esc(c.email)}"><span class="ic">${SVG.mail}</span><span><small>${esc(u.mail)}</small>${esc(c.email)}</span></a>` : ''}
${mapUrl ? `<a class="ct" href="${esc(mapUrl)}" target="_blank" rel="noopener"><span class="ic">${SVG.pin}</span><span><small>${esc(u.where)}</small>${esc(u.map)}</span></a>` : ''}
</div>
${s.cta.title ? `<div class="ctaband" style="margin-top:44px"><h2>${esc(s.cta.title)}</h2>${s.cta.text ? `<p>${esc(s.cta.text)}</p>` : ''}<a class="btn" href="${esc(primary)}" ${wa ? 'target="_blank" rel="noopener"' : ''}>${wa ? SVG.wa : ''}${esc(s.cta.button || heroBtn)}</a></div>` : ''}
</div></section>`
    : ''
}
</main>
<footer><div class="w">
<div><b style="color:var(--text)">${s.icon} ${esc(s.name)}</b>${c.city ? ` · ${esc(c.city)}` : ''} · © ${new Date().getFullYear()}</div>
${social.length ? `<div class="soc" aria-label="${esc(u.follow)}">${social.map(([h, i, n]) => `<a href="${esc(h)}" target="_blank" rel="noopener" aria-label="${n}">${i}</a>`).join('')}</div>` : ''}
<a class="made" href="https://sylkit.com/build?ref=site" target="_blank" rel="noopener">${esc(u.made)}</a>
</div></footer>
${wa ? `<a class="float" href="${esc(waText(u.hi))}" target="_blank" rel="noopener" aria-label="WhatsApp">${SVG.wa}</a>` : ''}
</body></html>`;
  return html;
}

// Page shown on name.sylkit.com before the site is paid for, or after it was switched off.
export function renderWaiting(lang = 'es', name = '') {
  const t = {
    es: ['Este sitio web se está preparando', 'Vuelve pronto. ¿Quieres tu propia web? Créala con IA en minutos.', 'Crear mi web con IA'],
    en: ['This website is being prepared', 'Check back soon. Want your own website? Build it with AI in minutes.', 'Build my website with AI'],
    pt: ['Este site está sendo preparado', 'Volte em breve. Quer seu próprio site? Crie com IA em minutos.', 'Criar meu site com IA'],
  }[lang] || [];
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(name || 'Sylkit')}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f6f7f9;color:#0f172a;text-align:center;padding:24px}h1{font-size:28px;margin:0 0 10px}p{color:#5b6474;max-width:420px;margin:0 auto 24px}a{display:inline-block;background:#2558e8;color:#fff;padding:14px 22px;border-radius:12px;font-weight:700;text-decoration:none}</style></head>
<body><div><h1>${esc(t[0])}</h1><p>${esc(t[1])}</p><a href="https://sylkit.com/build">${esc(t[2])}</a></div></body></html>`;
}
