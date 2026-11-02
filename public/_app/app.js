/* Sylkit mobile app templates: an interactive app prototype in a phone frame.
   Modes: "realestate" (search homes, save favorites, book visits) and "architecture"
   (projects portfolio, quote wizard, client project tracking). A template page calls
   SylApp.create({...}). Text can be a plain string or [spanish, english].
   Needs /_site/art.js (SylArt) for the building illustrations. */
(function () {
  const STR = {
    es: {
      use: 'Usar esta plantilla', proto: 'Prototipo interactivo: tócalo y navega como en la app real.', back: 'Atrás',
      home: 'Inicio', search: 'Buscar', saved: 'Guardados', visits: 'Visitas', projects: 'Proyectos', quote: 'Cotizar', obra: 'Mi obra',
      buy: 'Comprar', rent: 'Alquilar', featured: 'Destacados', near: 'Cerca de ti', seeAll: 'Ver todo', all: 'Todos', perMonth: '/mes',
      searchPh: 'Ciudad, zona o tipo…', results: (n) => `${n} ${n === 1 ? 'resultado' : 'resultados'}`, none: 'No hay resultados.',
      beds: 'Hab.', baths: 'Baños', area: 'm²', park: 'Puestos', year: 'Año', type: 'Tipo',
      emptySaved: 'Toca ♡ en una propiedad para guardarla aquí.', emptyVisits: 'Aún no tienes visitas agendadas.', explore: 'Explorar propiedades',
      book: 'Agendar visita', pickDay: 'Elige el día', pickTime: 'Elige la hora', confirm: 'Confirmar visita', booked: '¡Visita agendada!',
      bookedSub: 'El asesor te confirmará por WhatsApp.', confirmWa: 'Confirmar por WhatsApp', done: 'Listo', agent: 'Tu asesor',
      savedT: 'Guardado en favoritos', unsavedT: 'Quitado de favoritos',
      services: 'Servicios', recent: 'Proyectos recientes', likeThis: 'Quiero algo así', startQuote: 'Cotizar mi proyecto',
      step: (a, b) => `Paso ${a} de ${b}`, next: 'Siguiente', prev: 'Atrás', yourData: 'Tus datos', name: 'Nombre', phone: 'Teléfono / WhatsApp', notes: 'Cuéntanos un poco más (opcional)',
      review: 'Revisa tu solicitud', send: 'Enviar por WhatsApp', fill: 'Escribe tu nombre y teléfono.', quoteSent: '¡Solicitud enviada!', quoteSentSub: 'Te respondemos en menos de 24 horas con una propuesta.',
      newQuote: 'Nueva cotización', seeObra: 'Ver cómo sigues tu obra', progress: 'Avance', phases: 'Etapas', updates: 'Últimas novedades', payments: 'Pagos',
      paid: 'Pagado', due: 'Pendiente', sample: 'Ejemplo: así ve un cliente su obra en la app.', nextVisit: 'Próxima visita de obra',
      waVisit: (t, d, h) => `Hola, agendé una visita para "${t}" el ${d} a las ${h}. ¿Me confirman?`,
      waQuote: 'Hola, quiero cotizar un proyecto:',
      days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    },
    en: {
      use: 'Use this template', proto: 'Interactive prototype: tap around like in the real app.', back: 'Back',
      home: 'Home', search: 'Search', saved: 'Saved', visits: 'Visits', projects: 'Projects', quote: 'Quote', obra: 'My build',
      buy: 'Buy', rent: 'Rent', featured: 'Featured', near: 'Near you', seeAll: 'See all', all: 'All', perMonth: '/mo',
      searchPh: 'City, area or type…', results: (n) => `${n} ${n === 1 ? 'result' : 'results'}`, none: 'No results.',
      beds: 'Beds', baths: 'Baths', area: 'm²', park: 'Parking', year: 'Year', type: 'Type',
      emptySaved: 'Tap ♡ on a property to save it here.', emptyVisits: 'No visits booked yet.', explore: 'Explore properties',
      book: 'Book a visit', pickDay: 'Pick a day', pickTime: 'Pick a time', confirm: 'Confirm visit', booked: 'Visit booked!',
      bookedSub: 'Your agent will confirm on WhatsApp.', confirmWa: 'Confirm on WhatsApp', done: 'Done', agent: 'Your agent',
      savedT: 'Saved to favorites', unsavedT: 'Removed from favorites',
      services: 'Services', recent: 'Recent projects', likeThis: 'I want something like this', startQuote: 'Quote my project',
      step: (a, b) => `Step ${a} of ${b}`, next: 'Next', prev: 'Back', yourData: 'Your details', name: 'Name', phone: 'Phone / WhatsApp', notes: 'Tell us a bit more (optional)',
      review: 'Review your request', send: 'Send on WhatsApp', fill: 'Enter your name and phone.', quoteSent: 'Request sent!', quoteSentSub: "We'll reply within 24 hours with a proposal.",
      newQuote: 'New quote', seeObra: 'See how you track your build', progress: 'Progress', phases: 'Phases', updates: 'Latest updates', payments: 'Payments',
      paid: 'Paid', due: 'Due', sample: 'Example: how a client follows their build in the app.', nextVisit: 'Next site visit',
      waVisit: (t, d, h) => `Hi, I booked a visit for "${t}" on ${d} at ${h}. Can you confirm?`,
      waQuote: "Hi, I'd like a quote for a project:",
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function detectLang() {
    const ES = ['VE', 'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'PR', 'ES', 'GQ'];
    try {
      const f = new URLSearchParams(location.search).get('lang');
      if (f === 'es' || f === 'en') return f;
      const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
      if (prefs[0].startsWith('es')) return 'es';
      if (prefs[0].startsWith('en')) return 'en';
      const cc = (document.cookie.match(/(?:^|; )sk_cc=([A-Z]{2})/) || [])[1];
      if (cc) return ES.includes(cc) ? 'es' : 'en';
      return prefs.some((l) => l.startsWith('es')) ? 'es' : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function create(cfg) {
    const lang = detectLang();
    const S = STR[lang];
    const L = (v) => (Array.isArray(v) ? (lang === 'es' ? v[0] : v[1] ?? v[0]) : v ?? '');
    const RE = cfg.mode === 'realestate';
    const embed = new URLSearchParams(location.search).get('embed') === '1';
    const KEY = `sylkit_app_${cfg.slug}_v1`;
    const num = (n) => Number(n).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US', { maximumFractionDigits: 0 });
    const art = (k, s, cls = '') => `<div class="a-art ${cls}">${SylArt.svg(k, s, cfg.pal)}</div>`;
    const items = cfg.items.map((x, i) => ({ ...x, id: 'i' + i }));
    const byId = (id) => items.find((x) => x.id === id);
    const typeName = (id) => L((cfg.types.find((t) => t.id === id) || {}).n);
    const price = (x) => `$${num(x.price)}${x.op === 'rent' ? `<small>${S.perMonth}</small>` : ''}`;
    const wa = (t) => `https://wa.me/${cfg.whatsapp || ''}?text=${encodeURIComponent(t)}`;

    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    const st = { tab: 'home', op: 'sale', type: 'all', q: '', favs: saved.favs || [], visits: saved.visits || [], page: null, sheet: null, booking: null, quote: { step: 0, ans: {}, sent: false } };
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ favs: st.favs, visits: st.visits })); } catch (e) {} };

    const root = document.documentElement;
    root.lang = lang;
    Object.entries(cfg.vars || {}).forEach(([k, v]) => root.style.setProperty('--' + k, v));
    if (cfg.fonts) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = `https://fonts.googleapis.com/css2?${cfg.fonts}&display=swap`;
      document.head.appendChild(l);
    }
    document.title = `${cfg.name} · ${L(cfg.tagline)}`;

    const TABS = RE
      ? [['home', '🏠', S.home], ['explore', '🔍', S.search], ['saved', '❤️', S.saved], ['visits', '📅', S.visits]]
      : [['home', '🏠', S.home], ['projects', '📐', S.projects], ['quote', '📝', S.quote], ['obra', '🏗️', S.obra]];
    const useUrl = `/product/${cfg.product}?template=${encodeURIComponent(cfg.slug)}`;

    if (embed) document.body.classList.add('a-embed');
    document.body.innerHTML = `
      ${embed ? '' : `<div class="a-ribbon"><span><b>${esc(cfg.name)}</b> · ${esc(L(cfg.tagline))}</span><a href="${useUrl}" target="_top">${S.use} →</a></div>`}
      <div class="a-stage">
        <div class="a-info"><span class="a-mark">${esc(cfg.mark)}</span><h1 class="a-h">${esc(cfg.name)}</h1><p>${esc(L(cfg.blurb))}</p>
          <ul>${(cfg.features || []).map((f) => `<li>${esc(L(f))}</li>`).join('')}</ul>
          ${embed ? '' : `<a class="a-use" href="${useUrl}" target="_top">${S.use} →</a>`}<small>${S.proto}</small></div>
        <div class="a-device" id="a-device">
          <div class="a-status"><span>9:41</span><span>●●● ᯤ ▮</span></div>
          <div class="a-body" id="a-body"></div>
          <nav class="a-tabs" id="a-tabs"></nav>
          <div class="a-page" id="a-page"></div>
          <div class="a-scrim" id="a-scrim"></div><div class="a-sheet" id="a-sheet"></div>
          <div class="a-toast" id="a-toast" role="status"></div>
        </div>
      </div>`;
    const $ = (id) => document.getElementById(id);
    const toast = (m) => { const t = $('a-toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); };

    // ---------- Shared pieces ----------
    const heart = (x) => `<button class="a-heart" data-fav="${x.id}" aria-label="♥" aria-pressed="${st.favs.includes(x.id)}">${st.favs.includes(x.id) ? '❤️' : '🤍'}</button>`;
    const reMeta = (x) => `<span class="a-meta">${x.beds ? `<span>🛏️ ${x.beds}</span>` : ''}${x.baths ? `<span>🛁 ${x.baths}</span>` : ''}<span>📐 ${num(x.area)} m²</span></span>`;
    function itemRow(x) {
      if (RE) return `<div style="position:relative"><button class="a-item" data-open="${x.id}">${art(x.k, x.s)}<div><span class="a-price">${price(x)}</span><b>${esc(L(x.t))}</b><span class="a-meta">📍 ${esc(x.city)}</span>${reMeta(x)}</div></button>${heart(x)}</div>`;
      return `<button class="a-item" data-open="${x.id}">${art(x.k, x.s)}<div><b>${esc(L(x.t))}</b><span class="a-meta">${esc(typeName(x.type))} · ${esc(x.city)}</span><span class="a-meta">${x.year} · ${num(x.area)} m²</span></div></button>`;
    }
    function featCard(x) {
      if (RE) return `<div class="a-feat"><button class="a-feat" style="flex:auto" data-open="${x.id}">${x.badge ? `<span class="a-badge">${esc(L(cfg.badges[x.badge]))}</span>` : ''}${art(x.k, x.s)}<span class="a-price">${price(x)}</span><b>${esc(L(x.t))}</b><span class="a-meta">📍 ${esc(x.city)}</span></button>${heart(x)}</div>`;
      return `<button class="a-feat" data-open="${x.id}">${art(x.k, x.s)}<b>${esc(L(x.t))}</b><span class="a-meta">${esc(typeName(x.type))} · ${esc(x.city)} · ${x.year}</span></button>`;
    }
    const empty = (icon, text, btn) => `<div class="a-empty"><i>${icon}</i><p style="margin:0">${text}</p>${btn || ''}</div>`;
    const top = (hi, title, right = '') => `<div class="a-top"><div class="a-grow">${hi ? `<div class="a-hi">${hi}</div>` : ''}<h2 class="a-h a-title">${title}</h2></div>${right}</div>`;
    const typeChips = () => `<div class="a-chips">${[['all', S.all], ...cfg.types.map((t) => [t.id, L(t.n)])].map(([id, n]) => `<button class="a-chip ${st.type === id ? 'on' : ''}" data-type="${id}">${esc(n)}</button>`).join('')}</div>`;

    // ---------- Real estate screens ----------
    const RS = {
      home() {
        const list = items.filter((x) => x.op === st.op);
        return `${top(L(cfg.greeting), L(cfg.headline), `<span class="a-avatar">${cfg.userEmoji || '🙂'}</span>`)}
          <button class="a-searchbox" data-go="explore">🔍 <span>${S.searchPh}</span></button>
          <div class="a-seg"><button class="${st.op === 'sale' ? 'on' : ''}" data-op="sale">${S.buy}</button><button class="${st.op === 'rent' ? 'on' : ''}" data-op="rent">${S.rent}</button></div>
          <div class="a-sec"><h3 class="a-h">${S.featured}</h3><button data-go="explore">${S.seeAll}</button></div>
          <div class="a-row">${list.filter((x) => x.badge).concat(list.filter((x) => !x.badge)).slice(0, 4).map(featCard).join('')}</div>
          <div class="a-sec"><h3 class="a-h">${S.near}</h3><button data-go="explore">${S.seeAll}</button></div>
          <div class="a-list">${list.slice(0, 4).map(itemRow).join('')}</div>`;
      },
      explore() {
        const q = st.q.toLowerCase();
        const list = items.filter((x) => x.op === st.op && (st.type === 'all' || x.type === st.type) && (!q || (L(x.t) + ' ' + x.city + ' ' + typeName(x.type)).toLowerCase().includes(q)));
        return `${top('', S.search)}<label class="a-searchbox">🔍 <input id="a-q" type="search" placeholder="${S.searchPh}" value="${esc(st.q)}" aria-label="${S.search}"></label>
          <div class="a-seg"><button class="${st.op === 'sale' ? 'on' : ''}" data-op="sale">${S.buy}</button><button class="${st.op === 'rent' ? 'on' : ''}" data-op="rent">${S.rent}</button></div>
          ${typeChips()}<p class="a-muted" style="font-size:13px;margin:10px 0">${S.results(list.length)}</p>
          <div class="a-list" id="a-results">${list.length ? list.map(itemRow).join('') : empty('🏚️', S.none)}</div>`;
      },
      saved() {
        const list = st.favs.map(byId).filter(Boolean);
        return `${top('', S.saved)}${list.length ? `<div class="a-list">${list.map(itemRow).join('')}</div>` : empty('🤍', S.emptySaved, `<button class="a-btn" style="width:auto;padding:0 20px" data-go="explore">${S.explore}</button>`)}`;
      },
      visits() {
        return `${top('', S.visits)}${st.visits.length ? `<div class="a-list">${st.visits.map((v) => { const x = byId(v.id); return x ? `<div class="a-card" style="display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;padding:10px">${art(x.k, x.s)}<div><b style="font-size:15px">${esc(L(x.t))}</b><div class="a-meta">📅 ${esc(v.day)} · 🕒 ${esc(v.time)}</div><div class="a-meta">📍 ${esc(x.city)}</div></div></div>` : ''; }).join('')}</div>` : empty('📅', S.emptyVisits, `<button class="a-btn" style="width:auto;padding:0 20px" data-go="explore">${S.explore}</button>`)}`;
      },
    };

    // ---------- Architecture screens ----------
    const qSteps = cfg.quote || [];
    const AS = {
      home() {
        const h = cfg.hero;
        return `${top(L(cfg.greeting), esc(cfg.name), `<span class="a-mark">${esc(cfg.mark)}</span>`)}
          <div class="a-hero">${art(h.k, h.s)}<h2 class="a-h">${esc(L(h.title))}</h2><p>${esc(L(h.lead))}</p><button class="a-btn" style="background:var(--accent-ink);color:var(--accent);margin-top:8px" data-go="quote">${S.startQuote}</button></div>
          <div class="a-sec"><h3 class="a-h">${S.services}</h3></div>
          <div class="a-svc">${cfg.services.map((s, i) => `<button data-svc="${i}"><i>${s[0]}</i><b>${esc(L(s[1]))}</b><span>${esc(L(s[2]))}</span></button>`).join('')}</div>
          <div class="a-sec"><h3 class="a-h">${S.recent}</h3><button data-go="projects">${S.seeAll}</button></div>
          <div class="a-row">${items.slice(0, 4).map(featCard).join('')}</div>`;
      },
      projects() {
        const list = items.filter((x) => st.type === 'all' || x.type === st.type);
        return `${top('', S.projects)}${typeChips()}<div class="a-list" style="margin-top:12px">${list.map(itemRow).join('')}</div>`;
      },
      quote() {
        const Q = st.quote;
        const total = qSteps.length + 2;
        if (Q.sent) return `${top('', S.quote)}<div class="a-empty"><i>✅</i><h3 class="a-h" style="color:var(--text)">${S.quoteSent}</h3><p style="margin:0">${S.quoteSentSub}</p>
          <button class="a-btn" data-go="obra">${S.seeObra}</button><button class="a-btn ghost" data-act="newQuote">${S.newQuote}</button></div>`;
        const head = `${top(S.step(Q.step + 1, total), Q.step < qSteps.length ? esc(L(qSteps[Q.step].q)) : Q.step === qSteps.length ? S.yourData : S.review)}<div class="a-progress" style="margin-bottom:16px"><span style="width:${((Q.step + 1) / total) * 100}%"></span></div>`;
        let body;
        if (Q.step < qSteps.length) {
          const s = qSteps[Q.step];
          body = `<div class="a-opts">${s.opts.map((o, i) => `<button class="a-opt ${Q.ans[s.id] === i ? 'on' : ''}" data-ans="${i}"><i>${o[0]}</i>${esc(L(o[1]))}</button>`).join('')}</div>`;
        } else if (Q.step === qSteps.length) {
          body = `<div class="a-field" id="q-fn"><label for="q-name">${S.name} *</label><input id="q-name" autocomplete="name" value="${esc(Q.name || '')}"></div>
            <div class="a-field" id="q-fp"><label for="q-phone">${S.phone} *</label><input id="q-phone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(Q.phone || '')}"></div>
            <div class="a-field"><label for="q-notes">${S.notes}</label><textarea id="q-notes">${esc(Q.notes || '')}</textarea></div>`;
        } else {
          body = `<div class="a-card a-sum">${qSteps.map((s) => `<div><span>${esc(L(s.short))}</span><b>${esc(L(s.opts[Q.ans[s.id]][1]))}</b></div>`).join('')}<div><span>${S.name}</span><b>${esc(Q.name)}</b></div><div><span>${S.phone}</span><b>${esc(Q.phone)}</b></div>${Q.notes ? `<div><span>${S.notes.split('(')[0]}</span><b>${esc(Q.notes)}</b></div>` : ''}</div>`;
        }
        const canNext = Q.step >= qSteps.length || Q.ans[qSteps[Q.step].id] !== undefined;
        const nav = `<div style="display:flex;gap:10px;margin-top:18px">${Q.step ? `<button class="a-btn ghost" style="flex:1" data-act="qprev">${S.prev}</button>` : ''}${Q.step === total - 1 ? `<button class="a-btn wa" style="flex:2" data-act="qsend">${S.send}</button>` : `<button class="a-btn" style="flex:2" data-act="qnext" ${canNext ? '' : 'disabled'}>${S.next}</button>`}</div>`;
        return head + body + nav;
      },
      obra() {
        const o = cfg.obra;
        return `${top(S.sample, S.obra)}
          <div class="a-card" style="padding:0;overflow:hidden">${art(o.k, o.s)}<div style="padding:14px;display:grid;gap:8px"><b style="font-size:17px">${esc(L(o.name))}</b><span class="a-meta">📍 ${esc(o.address)}</span>
            <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800"><span>${S.progress}</span><span>${o.progress}%</span></div><div class="a-progress"><span style="width:${o.progress}%"></span></div>
            <span class="a-meta">🗓️ ${S.nextVisit}: ${esc(L(o.nextVisit))}</span></div></div>
          <div class="a-sec"><h3 class="a-h">${S.phases}</h3></div>
          <div class="a-timeline">${o.phases.map((p) => `<div class="a-phase ${p[2]}"><span class="n">${p[2] === 'done' ? '✓' : p[2] === 'now' ? '●' : ''}</span><div><b>${esc(L(p[0]))}</b><small>${esc(L(p[1]))}</small></div></div>`).join('')}</div>
          <div class="a-sec"><h3 class="a-h">${S.updates}</h3></div>
          <div class="a-list">${o.updates.map((u) => `<div class="a-card" style="display:grid;grid-template-columns:84px 1fr;gap:12px;align-items:center;padding:10px">${art(u[2], u[3])}<div><b style="font-size:14px">${esc(L(u[0]))}</b><div class="a-meta">${esc(L(u[1]))}</div></div></div>`).join('')}</div>
          <div class="a-sec"><h3 class="a-h">${S.payments}</h3></div>
          <div class="a-card" style="padding:4px 14px">${o.payments.map((p) => `<div class="a-pay"><span>${esc(L(p[0]))}<br><b>$${num(p[1])}</b></span><span class="a-pill ${p[2] === 'paid' ? 'ok' : 'due'}">${p[2] === 'paid' ? S.paid : S.due}</span></div>`).join('')}</div>`;
      },
    };
    const SCREENS = RE ? RS : AS;

    // ---------- Detail page ----------
    function openPage(id) {
      const x = byId(id);
      st.page = id;
      const g = x.gallery || [['interior', x.s + 3], [x.k === 'interior' ? 'modern' : 'interior', x.s + 7]];
      const agent = RE && cfg.agents ? cfg.agents[Number(id.slice(1)) % cfg.agents.length] : null;
      const specs = RE
        ? [[x.beds || '—', S.beds], [x.baths || '—', S.baths], [num(x.area), S.area], [x.park || '—', S.park]]
        : [[num(x.area), S.area], [x.year, S.year], [esc(typeName(x.type)), S.type], [esc(x.city), '📍']];
      $('a-page').innerHTML = `<div class="a-body"><div class="a-cover">${art(x.k, x.s)}<div class="a-nav"><button data-act="back" aria-label="${S.back}">←</button>${RE ? `<button data-fav="${x.id}" aria-label="♥">${st.favs.includes(x.id) ? '❤️' : '🤍'}</button>` : ''}</div></div>
        <div class="a-in">${RE ? `<span class="a-price" style="font-size:24px">${price(x)}</span>` : `<span class="a-hi">${esc(typeName(x.type))}</span>`}
          <h2 class="a-h" style="font-size:22px">${esc(L(x.t))}</h2><span class="a-meta">📍 ${esc(x.city)}</span>
          <div class="a-specs">${specs.map((s) => `<div><b>${s[0]}</b><small>${s[1]}</small></div>`).join('')}</div>
          <div class="a-thumbs">${g.map((a) => art(a[0], a[1])).join('')}</div>
          <p class="a-muted" style="margin:0;font-size:15px;line-height:1.5">${esc(L(x.d))}</p>
          ${x.feats ? `<div class="a-feats">${x.feats.map((f) => `<span>${esc(L(f))}</span>`).join('')}</div>` : ''}
          ${agent ? `<div class="a-card a-agent"><span class="a-avatar">${agent[2]}</span><div style="flex:1"><small class="a-muted">${S.agent}</small><b style="display:block">${esc(agent[0])}</b></div><a class="a-iconbtn" style="background:#25d366;border-color:#25d366" target="_blank" rel="noopener" href="${wa(L(x.t))}" aria-label="WhatsApp">💬</a></div>` : ''}
        </div></div>
        <div class="a-bar">${RE ? `<button class="a-btn" data-act="book">📅 ${S.book}</button>` : `<button class="a-btn" data-like="${x.id}">${S.likeThis}</button>`}</div>`;
      $('a-page').classList.add('open');
    }
    const closePage = () => { st.page = null; $('a-page').classList.remove('open'); };

    // ---------- Booking sheet (real estate) ----------
    const nextDays = () => { const out = []; const d = new Date(); for (let i = 1; out.length < 7; i++) { const x = new Date(d); x.setDate(d.getDate() + i); if (x.getDay() !== 0) out.push(x); } return out; };
    const TIMES = ['9:00', '10:30', '12:00', '2:00 pm', '3:30 pm', '5:00 pm'];
    function renderSheet() {
      const b = st.booking;
      const x = byId(b.id);
      const days = nextDays();
      const label = (d) => `${S.days[d.getDay()]} ${d.getDate()}`;
      if (b.done) {
        $('a-sheet').innerHTML = `<div class="a-grab"></div><div class="a-empty" style="padding:16px 0"><i>✅</i><h3 class="a-h" style="color:var(--text)">${S.booked}</h3><p style="margin:0">${esc(L(x.t))}<br><b>${esc(b.dayLabel)} · ${esc(b.time)}</b></p><p style="margin:0">${S.bookedSub}</p>
          <a class="a-btn wa" target="_blank" rel="noopener" href="${wa(S.waVisit(L(x.t), b.dayLabel, b.time))}">${S.confirmWa}</a><button class="a-btn ghost" data-act="sheetDone">${S.done}</button></div>`;
        return;
      }
      $('a-sheet').innerHTML = `<div class="a-grab"></div><h3 class="a-h" style="font-size:20px">${S.book}</h3><p class="a-muted" style="margin:4px 0 14px;font-size:14px">${esc(L(x.t))}</p>
        <b style="font-size:14px">${S.pickDay}</b><div class="a-days" style="margin-top:8px;margin-bottom:14px">${days.map((d, i) => `<button class="a-day ${b.day === i ? 'on' : ''}" data-day="${i}" data-label="${label(d)}">${S.days[d.getDay()]}<b>${d.getDate()}</b></button>`).join('')}</div>
        <b style="font-size:14px">${S.pickTime}</b><div class="a-chips" style="margin-top:8px;margin-bottom:18px;flex-wrap:wrap">${TIMES.map((t) => `<button class="a-chip ${b.time === t ? 'on' : ''}" data-time="${t}">${t}</button>`).join('')}</div>
        <button class="a-btn" data-act="confirmVisit" ${b.day !== undefined && b.time ? '' : 'disabled'}>${S.confirm}</button>`;
    }
    const openSheet = () => { $('a-scrim').classList.add('open'); $('a-sheet').classList.add('open'); };
    const closeSheet = () => { $('a-scrim').classList.remove('open'); $('a-sheet').classList.remove('open'); st.booking = null; };

    // ---------- Render ----------
    function render(keepScroll) {
      const body = $('a-body');
      const y = body.scrollTop;
      body.innerHTML = SCREENS[st.tab]();
      body.scrollTop = keepScroll ? y : 0;
      $('a-tabs').innerHTML = TABS.map(([id, icon, label]) => {
        const n = id === 'saved' ? st.favs.length : id === 'visits' ? st.visits.length : 0;
        return `<button class="a-tab ${st.tab === id ? 'on' : ''}" data-tab="${id}" aria-current="${st.tab === id ? 'page' : 'false'}"><i>${icon}</i>${label}${n ? `<span class="dot">${n}</span>` : ''}</button>`;
      }).join('');
      const q = $('a-q');
      if (q) q.addEventListener('input', (e) => {
        st.q = e.target.value;
        const pos = e.target.selectionStart;
        render(true);
        const n = $('a-q');
        n.focus();
        try { n.setSelectionRange(pos, pos); } catch (er) {}
      });
    }
    const go = (tab) => { closePage(); st.tab = tab; render(); };

    function readQuoteForm() {
      const Q = st.quote;
      if ($('q-name')) { Q.name = $('q-name').value.trim(); Q.phone = $('q-phone').value.trim(); Q.notes = $('q-notes').value.trim(); }
    }

    $('a-device').addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t) return;
      const d = t.dataset;
      if (d.tab) return go(d.tab);
      if (d.go) { go(d.go); if (d.go === 'explore') setTimeout(() => $('a-q') && $('a-q').focus(), 50); return; }
      if (d.open) return openPage(d.open);
      if (d.op) { st.op = d.op; return render(true); }
      if (d.type) { st.type = d.type; return render(true); }
      if (d.fav) {
        const on = st.favs.includes(d.fav);
        st.favs = on ? st.favs.filter((f) => f !== d.fav) : [...st.favs, d.fav];
        persist();
        toast(on ? S.unsavedT : S.savedT);
        if (st.page) openPage(st.page);
        return render(true);
      }
      if (d.svc !== undefined) { const s = qSteps[0]; st.quote = { step: 1, ans: { [s.id]: Math.min(+d.svc, s.opts.length - 1) }, sent: false }; return go('quote'); }
      if (d.like) { const x = byId(d.like); const s = qSteps[0]; const i = Math.max(0, s.opts.findIndex((o) => o[2] === x.type)); st.quote = { step: 1, ans: { [s.id]: i }, sent: false }; return go('quote'); }
      if (d.ans !== undefined) { st.quote.ans[qSteps[st.quote.step].id] = +d.ans; return render(true); }
      if (d.day !== undefined) { st.booking.day = +d.day; st.booking.dayLabel = d.label; return renderSheet(); }
      if (d.time) { st.booking.time = d.time; return renderSheet(); }
      switch (d.act) {
        case 'back': return closePage();
        case 'book': st.booking = { id: st.page }; renderSheet(); return openSheet();
        case 'confirmVisit': st.visits.unshift({ id: st.booking.id, day: st.booking.dayLabel, time: st.booking.time }); persist(); st.booking.done = true; renderSheet(); return render(true);
        case 'sheetDone': closeSheet(); closePage(); return go('visits');
        case 'qnext': readQuoteForm(); st.quote.step++; return render();
        case 'qprev': readQuoteForm(); st.quote.step--; return render();
        case 'newQuote': st.quote = { step: 0, ans: {}, sent: false }; return render();
        case 'qsend': {
          const Q = st.quote;
          const lines = [S.waQuote, '', ...qSteps.map((s) => `• ${L(s.short)}: ${L(s.opts[Q.ans[s.id]][1])}`), '', `${S.name}: ${Q.name}`, `${S.phone}: ${Q.phone}`];
          if (Q.notes) lines.push('', Q.notes);
          window.open(wa(lines.join('\n')), '_blank', 'noopener');
          Q.sent = true;
          return render();
        }
      }
    });
    // The details step must have name and phone before moving on (runs before the handler above).
    const checkDetails = (e) => {
      const t = e.target.closest('[data-act="qnext"]');
      if (!t || st.quote.step !== qSteps.length) return;
      readQuoteForm();
      const Q = st.quote;
      if (!Q.name || !Q.phone) {
        e.stopImmediatePropagation();
        $('q-fn').classList.toggle('err', !Q.name);
        $('q-fp').classList.toggle('err', !Q.phone);
        toast(S.fill);
        $(!Q.name ? 'q-name' : 'q-phone').focus();
      }
    };
    $('a-device').addEventListener('click', checkDetails, true);
    $('a-scrim').addEventListener('click', closeSheet);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (st.booking) closeSheet(); else if (st.page) closePage(); } });

    const startTab = new URLSearchParams(location.search).get('tab');
    if (startTab && SCREENS[startTab]) st.tab = startTab;
    render();
  }

  window.SylApp = { create };
})();
