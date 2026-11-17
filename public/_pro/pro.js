/* Sylkit Pro demos: a real-looking customer site (photos, search, booking or ordering) and the staff
   dashboard that receives what the customer does (board by status, numbers, side panel).
   Everything a visitor does stays in their own browser (localStorage) and resets after 24 hours.
   A demo calls SylPro.create({...}); texts are { en, es }. Photos: Unsplash, hotlinked and credited. */
(function () {
  const COMMON = {
    en: { live: 'Live demo · sample data', back: 'Sylkit', get: 'Get this system', site: 'Customer site', dash: 'Dashboard', reset: 'Reset demo',
      name: 'Full name', phone: 'Phone / WhatsApp', confirm: 'Confirm', cancel: 'Cancel', total: 'Total', done: 'Sent! Open the Dashboard to see it arrive.',
      required: 'Please fill in your name and phone.', all: 'All', moved: 'Updated.', photos: 'Photos', made: 'Demo by', empty: 'Nothing here yet.', search: 'Search' },
    es: { live: 'Demo en vivo · datos de ejemplo', back: 'Sylkit', get: 'Quiero este sistema', site: 'Sitio del cliente', dash: 'Panel', reset: 'Reiniciar demo',
      name: 'Nombre completo', phone: 'Teléfono / WhatsApp', confirm: 'Confirmar', cancel: 'Cancelar', total: 'Total', done: '¡Enviado! Abre el Panel para verlo llegar.',
      required: 'Escribe tu nombre y teléfono.', all: 'Todos', moved: 'Actualizado.', photos: 'Fotos', made: 'Demo de', empty: 'Aún no hay nada aquí.', search: 'Buscar' },
  };
  const ICON = {
    site: '<path d="M3 5h18v14H3z"/><path d="M3 9h18"/>',
    dash: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    check: '<path d="m5 12 5 5L20 7"/>', shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>', pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', truck: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>', bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', back: '<path d="M15 6l-6 6 6 6"/>',
  };
  const svg = (n, s) => `<svg viewBox="0 0 24 24" width="${s || 18}" height="${s || 18}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ICON.check}</svg>`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const day = (n) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); const z = new Date(d - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };

  function create(cfg) {
    const KEY = `sylkit_pro_${cfg.id}_v${cfg.version || 1}`;
    let lang = 'en';
    try {
      const q = new URLSearchParams(location.search).get('lang');
      const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
      lang = q === 'es' || q === 'en' ? q : prefs[0].startsWith('es') || prefs[0].startsWith('pt') ? 'es' : 'en';
    } catch (e) {}
    const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v ?? '');
    const S = COMMON[lang];
    const used = new Set();
    const pic = (key, w, h) => {
      const p = cfg.photos[key]; if (!p) return '';
      used.add(key);
      return `${p[0]}${p[0].includes('?') ? '&' : '?'}auto=format&fit=crop&q=72&w=${w || 640}${h ? `&h=${h}` : ''}`;
    };
    const money = (n) => (cfg.currency || '$') + Number(n || 0).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const date = (s) => { try { return new Date(s.length <= 10 ? s + 'T00:00:00' : s).toLocaleDateString(lang === 'es' ? 'es-VE' : 'en-US', { day: 'numeric', month: 'short' }); } catch (e) { return s; } };
    const ago = (s) => { const m = Math.max(1, Math.round((Date.now() - new Date(s)) / 6e4)); return m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : date(s); };

    const app = { L, S, pic, money, date, ago, day, uid, esc, svg, get lang() { return lang; }, get db() { return db; }, item: (id) => cfg.catalog.items.find((x) => x.id === id) };
    const fresh = () => ({ _at: Date.now(), records: cfg.seed(app), view: 'site', cat: 'all', q: '' });
    let db;
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (!db || Date.now() - db._at > 864e5) db = fresh();
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
    app.save = save;
    const forced = new URLSearchParams(location.search).get('view');
    if (forced === 'dash' || forced === 'site') db.view = forced;

    // ---------- Customer site ----------
    function site() {
      const h = cfg.hero, c = cfg.catalog;
      const q = (db.q || '').toLowerCase();
      const list = c.items.filter((x) => (db.cat === 'all' || x.cat === db.cat) && (!q || (L(x.title) + ' ' + L(x.meta)).toLowerCase().includes(q)));
      return `<section class="x-hero" style="background-image:url('${pic(h.photo, 1800)}')"><div class="x-wrap">
          <div class="x-eyebrow">${esc(L(h.eyebrow))}</div><h1>${esc(L(h.title))}</h1><p>${esc(L(h.lead))}</p>
          ${h.search ? `<form class="x-search" data-form="search">${h.search.map(field).join('')}<button class="x-btn" type="submit">${esc(L(h.cta) || S.search)}</button></form>` : ''}
        </div></section>
        <div class="x-wrap">
          <section class="x-sec" id="catalog"><h2>${esc(L(c.title))}</h2><p class="lead">${esc(L(c.lead))}</p>
            ${c.filters ? `<div class="x-chips">${[['all', S.all], ...c.filters].map(([id, l]) => `<button class="x-chip ${db.cat === id ? 'on' : ''}" data-cat="${id}">${esc(L(l))}</button>`).join('')}</div>` : ''}
            <div class="x-grid${c.portrait ? ' portrait' : ''}">${list.map(card).join('') || `<p class="lead">${S.empty}</p>`}</div></section>
          ${cfg.perks ? `<div class="x-perks">${cfg.perks.map(([i, t, d]) => `<div class="x-perk"><i>${svg(i, 20)}</i><div><b>${esc(L(t))}</b><span>${esc(L(d))}</span></div></div>`).join('')}</div>` : ''}
        </div>`;
    }
    function card(x) {
      return `<button class="x-card" data-open="${x.id}"><div class="ph"><img src="${pic(x.photo, 640, cfg.catalog.portrait ? 800 : 480)}" alt="" loading="lazy">${x.tag ? `<span class="tag">${esc(L(x.tag))}</span>` : ''}</div>
        <div class="bd"><b>${esc(L(x.title))}</b><span class="meta">${esc(L(x.meta))}</span>
        <div class="row"><span class="x-price">${money(x.price)}${x.unit ? ` <small>${esc(L(x.unit))}</small>` : ''}</span><span class="x-btn sm">${esc(L(cfg.book.button))}</span></div></div></button>`;
    }
    function field(f) {
      const v = f.value != null ? (typeof f.value === 'function' ? f.value(app) : f.value) : '';
      const input = f.type === 'select'
        ? `<select class="x-in" name="${f.name}">${f.options.map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}"${String(ov) === String(v) ? ' selected' : ''}>${esc(L(ol))}</option>`; }).join('')}</select>`
        : `<input class="x-in" name="${f.name}" type="${f.type || 'text'}" value="${esc(v)}"${f.min != null ? ` min="${f.min}"` : ''}${f.ph ? ` placeholder="${esc(L(f.ph))}"` : ''}>`;
      return `<div><label>${esc(L(f.label))}</label>${input}</div>`;
    }
    function openBooking(id) {
      const x = app.item(id); const b = cfg.book;
      const fields = [...b.fields, { name: 'name', label: S.name, value: lang === 'es' ? 'Ana Rodríguez' : 'Ana Rodriguez' }, { name: 'phone', label: S.phone, type: 'tel', value: '+58 412 555 0199' }];
      const bg = document.createElement('div'); bg.className = 'x-modal-bg';
      bg.innerHTML = `<div class="x-modal" role="dialog" aria-modal="true"><div class="ph" style="background-image:url('${pic(x.photo, 1000, 380)}')"></div>
        <form class="in"><h3>${esc(L(x.title))}</h3><p class="meta">${esc(L(x.meta))} · <b>${money(x.price)}</b>${x.unit ? ' ' + esc(L(x.unit)) : ''}</p>
        <div class="x-f2">${fields.map(field).join('')}</div><div class="x-total"><span>${S.total}</span><span id="x-tot"></span></div>
        <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="x-btn ghost" data-close>${S.cancel}</button><button class="x-btn" type="submit">${esc(L(b.confirm) || S.confirm)}</button></div></form></div>`;
      document.body.appendChild(bg);
      const form = bg.querySelector('form');
      const vals = () => Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
      const upd = () => { bg.querySelector('#x-tot').textContent = money(b.total(x, vals(), app)); };
      form.addEventListener('input', upd); upd();
      bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('[data-close]')) bg.remove(); });
      form.addEventListener('submit', (e) => {
        e.preventDefault(); const v = vals();
        if (!v.name || !v.phone) return toast(S.required);
        db.records.unshift({ id: uid(), item: x.id, name: v.name, phone: v.phone, detail: b.detail(x, v, app), total: b.total(x, v, app), status: cfg.flow[0].id, at: new Date().toISOString(), fresh: true });
        save(); bg.remove(); toast(S.done); render();
      });
    }

    // ---------- Dashboard ----------
    function dash() {
      const cols = cfg.flow;
      return `<div class="x-wrap x-dash"><h1>${esc(L(cfg.dashTitle))}</h1><p class="sub">${esc(L(cfg.dashLead))}</p>
        <div class="x-stats">${cfg.stats(app).map(([l, n, d]) => `<div class="x-stat"><div class="l">${esc(L(l))}</div><div class="n">${esc(n)}</div>${d ? `<div class="d">${esc(L(d))}</div>` : ''}</div>`).join('')}</div>
        <div class="x-board" style="--cols:${cols.length}">${cols.map((c, ci) => {
          const rs = db.records.filter((r) => r.status === c.id);
          return `<div class="x-col"><h3><span>${esc(L(c.label))}</span><span>${rs.length}</span></h3>${rs.map((r) => {
            const x = app.item(r.item) || {};
            return `<div class="x-item"><img src="${pic(x.photo, 120, 120)}" alt=""><div><b>${esc(r.name)}</b><span>${esc(L(x.title))}</span><span>${esc(r.detail)}</span></div>
              <div class="act"><span class="x-pill ${r.fresh ? 'info' : c.tone || ''}">${r.fresh ? (lang === 'es' ? 'Nuevo' : 'New') : money(r.total)}</span>${ci < cols.length - 1 ? `<button class="x-btn sm" data-move="${r.id}">${esc(L(cols[ci + 1].verb || cols[ci + 1].label))} →</button>` : `<span class="x-pill ok">${svg('check', 12)} ${money(r.total)}</span>`}</div></div>`;
          }).join('') || `<p style="color:var(--muted);font-size:13px;margin:6px 4px">${S.empty}</p>`}</div>`;
        }).join('')}</div>
        ${cfg.side ? `<div class="x-panel"><h2>${esc(L(cfg.side.title))}</h2>${cfg.side.rows(app).map((r) => `<div class="x-li">${r.img ? `<img src="${pic(r.img, 160, 120)}" alt="">` : ''}<div class="g"><b>${esc(L(r.title))}</b><span>${esc(L(r.sub))}</span></div>${r.bar != null ? `<div class="x-bar"><i style="width:${Math.round(r.bar * 100)}%"></i></div>` : ''}${r.right ? `<span class="x-pill ${r.tone || ''}">${esc(L(r.right))}</span>` : ''}</div>`).join('')}</div>` : ''}
      </div>`;
    }

    // ---------- Shell ----------
    function credits() {
      const seen = new Map(); [...used].forEach((k) => { const p = cfg.photos[k]; if (p && !seen.has(p[1])) seen.set(p[1], p); });
      return `<div class="x-wrap"><div class="x-foot"><span>${esc(L(cfg.brand.name))} · ${S.made} <a href="https://sylkit.com" target="_top">Sylkit</a></span><span>${S.photos}: ${[...seen.values()].map((p) => `<a href="${esc(p[2])}" target="_blank" rel="noopener">${esc(p[1])}</a>`).join(', ')} · <a href="https://unsplash.com/?utm_source=sylkit&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></span></div></div>`;
    }
    function render() {
      used.clear();
      document.documentElement.lang = lang;
      document.title = `${L(cfg.brand.name)} · Demo · Sylkit`;
      const body = db.view === 'dash' ? dash() : site();
      document.getElementById('x-main').innerHTML = body + credits();
      document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === db.view));
    }
    function toast(m) { const t = document.getElementById('x-toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600); }

    function boot() {
      const th = cfg.theme || {};
      const vars = { primary: '--primary', primaryD: '--primary-d', soft: '--soft', ink: '--ink', bg: '--bg', font: '--font', head: '--head' };
      Object.entries(vars).forEach(([k, v]) => th[k] && document.documentElement.style.setProperty(v, th[k]));
      if (th.fonts) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${th.fonts}&display=swap`; document.head.appendChild(l); }
      const ref = `https://sylkit.com/quote?ref=${encodeURIComponent(cfg.ref || cfg.id)}`;
      document.body.innerHTML = `<div class="x-top"><a class="back" href="https://sylkit.com" target="_top">${svg('back', 15)} ${S.back}</a><span class="live"><i></i><span>${S.live}</span></span><a class="get" href="${ref}" target="_top">${S.get}</a></div>
        <header class="x-head"><div class="x-wrap"><div class="x-brand"><span class="x-mark">${esc(cfg.brand.mark)}</span>${esc(L(cfg.brand.name))}</div>
          <div class="x-views"><button data-view="site">${svg('site', 15)}<span>${S.site}</span></button><button data-view="dash">${svg('dash', 15)}<span>${S.dash}</span></button></div></div></header>
        <main id="x-main"></main><div class="x-toast" id="x-toast" role="status"></div>`;
      document.addEventListener('click', (e) => {
        const v = e.target.closest('[data-view]'); if (v) { db.view = v.dataset.view; save(); render(); window.scrollTo(0, 0); return; }
        const o = e.target.closest('[data-open]'); if (o) return openBooking(o.dataset.open);
        const c = e.target.closest('[data-cat]'); if (c) { db.cat = c.dataset.cat; save(); return render(); }
        const m = e.target.closest('[data-move]');
        if (m) { const r = db.records.find((x) => x.id === m.dataset.move); const i = cfg.flow.findIndex((f) => f.id === r.status); r.status = cfg.flow[Math.min(i + 1, cfg.flow.length - 1)].id; r.fresh = false; save(); toast(S.moved); return render(); }
      });
      document.addEventListener('submit', (e) => {
        if (e.target.dataset.form !== 'search') return;
        e.preventDefault(); const v = Object.fromEntries(new FormData(e.target));
        if (cfg.hero.onSearch) cfg.hero.onSearch(v, app); render();
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
      });
      save(); render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    return app;
  }
  window.SylPro = { create };
})();
