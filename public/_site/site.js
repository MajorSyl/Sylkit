/* Sylkit website templates: one engine for architecture studios (projects portfolio) and
   real estate agencies (property listings). A template page calls SylSite.create({...}).
   Text can be a plain string or [spanish, english]; language follows the visitor's browser.
   Needs /_site/art.js (SylArt) for the building illustrations. */
(function () {
  const STR = {
    es: {
      ribbon: 'Vista previa de plantilla · Sylkit', use: 'Usar esta plantilla', all: 'Todos', close: 'Cerrar',
      buy: 'Comprar', rent: 'Alquilar', type: 'Tipo', anyType: 'Cualquier tipo', city: 'Ciudad', anyCity: 'Todas las ciudades', search: 'Buscar',
      results: (n) => `${n} ${n === 1 ? 'resultado' : 'resultados'}`, none: 'No hay resultados con esos filtros.', perMonth: '/mes',
      beds: 'hab.', baths: 'baños', park: 'puesto', year: 'Año', location: 'Ubicación', area: 'Área', services: 'Servicios', price: 'Precio', op: 'Operación',
      bedsL: 'Habitaciones', bathsL: 'Baños', parkL: 'Estacionamiento', sale: 'Venta', rental: 'Alquiler', code: 'Código',
      likeThis: 'Quiero un proyecto así', visit: 'Agendar visita por WhatsApp', ask: 'Hacer una pregunta', agent: 'Tu asesor',
      saved: 'Guardado en favoritos', unsaved: 'Quitado de favoritos', name: 'Nombre y apellido', phone: 'Teléfono / WhatsApp', msg: 'Mensaje',
      send: 'Enviar por WhatsApp', fill: 'Escribe tu nombre y teléfono.', sent: 'Abrimos WhatsApp con tu mensaje listo.', contact: 'Contacto', made: 'Sitio creado con',
      waVisit: (t, c) => `Hola, quiero agendar una visita para "${t}" (código ${c}). ¿Qué días tienen disponibles?`,
      waAsk: (t, c) => `Hola, tengo una pregunta sobre "${t}" (código ${c}).`,
      waLike: (t) => `Hola, vi el proyecto "${t}" y quiero algo similar.`,
      waForm: 'Hola, les escribo desde su sitio web.',
    },
    en: {
      ribbon: 'Template preview · Sylkit', use: 'Use this template', all: 'All', close: 'Close',
      buy: 'Buy', rent: 'Rent', type: 'Type', anyType: 'Any type', city: 'City', anyCity: 'All cities', search: 'Search',
      results: (n) => `${n} ${n === 1 ? 'result' : 'results'}`, none: 'No results with those filters.', perMonth: '/mo',
      beds: 'bd', baths: 'ba', park: 'parking', year: 'Year', location: 'Location', area: 'Area', services: 'Services', price: 'Price', op: 'Listing',
      bedsL: 'Bedrooms', bathsL: 'Bathrooms', parkL: 'Parking', sale: 'For sale', rental: 'For rent', code: 'Code',
      likeThis: 'I want a project like this', visit: 'Book a visit on WhatsApp', ask: 'Ask a question', agent: 'Your agent',
      saved: 'Saved to favorites', unsaved: 'Removed from favorites', name: 'Full name', phone: 'Phone / WhatsApp', msg: 'Message',
      send: 'Send on WhatsApp', fill: 'Enter your name and phone.', sent: 'WhatsApp opened with your message ready.', contact: 'Contact', made: 'Site made with',
      waVisit: (t, c) => `Hi, I'd like to book a visit for "${t}" (code ${c}). Which days are available?`,
      waAsk: (t, c) => `Hi, I have a question about "${t}" (code ${c}).`,
      waLike: (t) => `Hi, I saw the project "${t}" and I want something similar.`,
      waForm: 'Hi, I am writing from your website.',
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
    const params = new URLSearchParams(location.search);
    const embed = params.get('embed') === '1';
    const KEY = `sylkit_site_${cfg.slug}_fav`;
    const num = (n) => Number(n).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US', { maximumFractionDigits: 0 });
    const art = (k, s, cls = '') => `<div class="w-art ${cls}">${SylArt.svg(k, s, cfg.pal)}</div>`;
    const items = cfg.items.map((x, i) => ({ ...x, id: 'i' + i, code: (cfg.codePrefix || 'P') + '-' + (101 + i) }));
    const byId = (id) => items.find((x) => x.id === id);
    const typeName = (id) => L((cfg.types.find((t) => t.id === id) || {}).n);
    const priceOf = (x) => `$${num(x.price)}${x.op === 'rent' ? `<small style="font-size:14px;font-weight:600;color:var(--muted)">${S.perMonth}</small>` : ''}`;

    let favs = [];
    try { favs = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) {}
    const st = { type: 'all', op: RE ? 'sale' : null, city: 'all', open: null };

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
    const wa = (text) => `https://wa.me/${cfg.whatsapp || ''}?text=${encodeURIComponent(text)}`;

    // ---------- Sections ----------
    const h = cfg.hero;
    const cities = [...new Set(items.map((x) => x.city))];
    function hero() {
      if (h.layout === 'search') {
        return `<section class="w-hero search"><div class="w-wrap"><div class="w-band">${art(h.art.k, h.art.s)}
          ${h.kick ? `<span class="w-kick">${esc(L(h.kick))}</span>` : ''}<h1 class="w-h">${L(h.title)}</h1>${h.lead ? `<p class="lead">${esc(L(h.lead))}</p>` : ''}
          <form class="w-search" id="w-search"><div class="w-seg" role="tablist"><button type="button" data-op="sale" class="${st.op === 'sale' ? 'on' : ''}">${S.buy}</button><button type="button" data-op="rent" class="${st.op === 'rent' ? 'on' : ''}">${S.rent}</button></div>
            <div class="w-fields"><select id="w-type" aria-label="${S.type}"><option value="all">${S.anyType}</option>${cfg.types.map((t) => `<option value="${t.id}">${esc(L(t.n))}</option>`).join('')}</select>
            <select id="w-city" aria-label="${S.city}"><option value="all">${S.anyCity}</option>${cities.map((c) => `<option>${esc(c)}</option>`).join('')}</select>
            <input id="w-q" type="search" placeholder="${esc(L(cfg.searchHint) || S.search)}" aria-label="${S.search}"><button class="w-btn" type="submit">${S.search}</button></div></form>
        </div></div></section>`;
      }
      return `<section class="w-hero statement"><div class="w-wrap">${h.kick ? `<span class="w-kick">${esc(L(h.kick))}</span>` : ''}<h1 class="w-h">${L(h.title)}</h1>
        <div class="w-row"><div>${h.lead ? `<p class="lead">${esc(L(h.lead))}</p>` : ''}<div class="w-ctas"><a class="w-btn" href="#work">${esc(L(h.cta))}</a><a class="w-btn ghost" href="#contact">${esc(L(h.cta2))}</a></div></div>${art(h.art.k, h.art.s)}</div></div></section>`;
    }
    const sec = (id, title, lead, body, extra = '') => `<section class="w-sec" id="${id}"><div class="w-wrap"><div class="w-sec-head"><div><h2 class="w-h">${esc(L(title))}</h2>${lead ? `<p>${esc(L(lead))}</p>` : ''}</div>${extra}</div>${body}</div></section>`;

    const app = document.createElement('div');
    app.innerHTML = `
      ${embed ? '' : `<div class="w-ribbon"><div class="w-wrap"><span><span class="lbl">${S.ribbon}: </span><b>${esc(cfg.name)}</b></span><a href="/product/${cfg.product}?template=${encodeURIComponent(cfg.slug)}" target="_top">${S.use} →</a></div></div>`}
      <header class="w-head"><div class="w-wrap"><a class="w-brand" href="#top"><span class="w-mark">${esc(cfg.mark)}</span><b>${esc(cfg.name)}</b></a>
        <nav class="w-nav">${cfg.nav.map(([id, n]) => `<a href="#${id}">${esc(L(n))}</a>`).join('')}</nav><a class="w-btn sm" href="#contact">${esc(L(cfg.cta))}</a></div></header>
      <main id="top">${hero()}
        ${sec(RE ? 'listings' : 'work', cfg.itemsTitle, cfg.itemsLead, `<div class="w-chips" id="w-chips"></div><div class="w-grid ${RE ? 'three' : ''}" id="w-grid"></div>`, `<span class="w-muted" id="w-count"></span>`)}
        ${cfg.stats ? `<section class="w-sec"><div class="w-wrap"><div class="w-stats">${cfg.stats.map((s) => `<div class="w-stat"><b>${esc(s[0])}</b><span>${esc(L(s[1]))}</span></div>`).join('')}</div></div></section>` : ''}
        ${cfg.services ? sec('services', cfg.servicesTitle, cfg.servicesLead, `<div class="w-services">${cfg.services.map((s) => `<div class="w-service"><i>${s[0]}</i><b>${esc(L(s[1]))}</b><span>${esc(L(s[2]))}</span></div>`).join('')}</div>`) : ''}
        ${cfg.process ? sec('process', cfg.processTitle, null, `<div class="w-steps">${cfg.process.map((p) => `<div class="w-step"><b>${esc(L(p[0]))}</b><span>${esc(L(p[1]))}</span></div>`).join('')}</div>`) : ''}
        ${cfg.team ? sec(RE ? 'agents' : 'studio', cfg.teamTitle, cfg.teamLead, `<div class="w-team">${cfg.team.map((p) => `<div class="w-person"><div class="w-avatar">${p[2]}</div><b>${esc(p[0])}</b><span>${esc(L(p[1]))}</span></div>`).join('')}</div>`) : ''}
        ${cfg.quotes ? sec('quotes', cfg.quotesTitle, null, `<div class="w-quotes">${cfg.quotes.map((q) => `<div class="w-quote"><p>“${esc(L(q[0]))}”</p><small>${esc(q[1])}</small></div>`).join('')}</div>`) : ''}
        <section class="w-sec" id="contact"><div class="w-wrap"><div class="w-contact"><div><span class="w-kick">${S.contact}</span><h2 class="w-h" style="font-size:clamp(30px,4.6vw,48px)">${esc(L(cfg.contact.title))}</h2><p>${esc(L(cfg.contact.lead))}</p>${(cfg.contact.lines || []).map((l) => `<p style="margin:4px 0">${esc(L(l))}</p>`).join('')}</div>
          <form class="w-form" id="w-form" novalidate>
            <div class="w-two"><div class="w-field" id="f-name"><label for="c-name">${S.name} *</label><input id="c-name" autocomplete="name"></div><div class="w-field" id="f-phone"><label for="c-phone">${S.phone} *</label><input id="c-phone" type="tel" inputmode="tel" autocomplete="tel"></div></div>
            ${cfg.contact.fields.map((f, i) => `<div class="w-field"><label for="c-f${i}">${esc(L(f.l))}</label><select id="c-f${i}">${f.v.map((v) => `<option>${esc(L(v))}</option>`).join('')}</select></div>`).join('')}
            <div class="w-field"><label for="c-msg">${S.msg}</label><textarea id="c-msg"></textarea></div>
            <button class="w-btn wa block" type="submit">${S.send}</button></form></div></div></section>
      </main>
      <footer class="w-foot"><div class="w-wrap"><div><a class="w-brand" href="#top"><span class="w-mark">${esc(cfg.mark)}</span><b>${esc(cfg.name)}</b></a><p class="w-muted" style="margin-top:10px;max-width:380px">${esc(L(cfg.about))}</p></div>
        <div><h4>${S.contact}</h4>${(cfg.contact.lines || []).map((l) => `<p>${esc(L(l))}</p>`).join('')}</div>
        <div><h4>${esc(L(cfg.navTitle) || 'Menu')}</h4>${cfg.nav.map(([id, n]) => `<p><a href="#${id}" style="text-decoration:none">${esc(L(n))}</a></p>`).join('')}</div>
        <p class="w-made">${S.made} <a href="https://sylkit.com" target="_top">Sylkit</a></p></div></footer>
      <div class="w-scrim" id="w-scrim"></div><div class="w-sheet" id="w-sheet" role="dialog" aria-modal="true"></div><div class="w-toast" id="w-toast" role="status"></div>`;
    document.body.appendChild(app);
    const $ = (id) => document.getElementById(id);
    const toast = (m) => { const t = $('w-toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400); };

    // ---------- Listing grid ----------
    function card(x) {
      if (RE) {
        const fav = favs.includes(x.id);
        return `<div class="w-card"><button class="w-card" data-open="${x.id}" aria-label="${esc(L(x.t))}">${x.badge ? `<span class="w-badge ${x.badge === 'hot' ? 'hot' : ''}">${esc(L(cfg.badges[x.badge]))}</span>` : ''}${art(x.k, x.s)}
          <span class="price">${priceOf(x)}</span><span class="t" style="font-size:18px">${esc(L(x.t))}</span><span class="m">📍 ${esc(x.city)}</span>
          <span class="w-specs">${x.beds ? `<span>🛏️ ${x.beds} ${S.beds}</span>` : ''}${x.baths ? `<span>🛁 ${x.baths} ${S.baths}</span>` : ''}<span>📐 ${num(x.area)} m²</span>${x.park ? `<span>🚗 ${x.park}</span>` : ''}</span></button>
          <button class="w-fav" data-fav="${x.id}" aria-label="♥" aria-pressed="${fav}">${fav ? '❤️' : '🤍'}</button></div>`;
      }
      return `<button class="w-card" data-open="${x.id}" aria-label="${esc(L(x.t))}">${art(x.k, x.s)}<span class="t">${esc(L(x.t))}</span><span class="m">${esc(typeName(x.type))} · ${esc(x.city)} · ${x.year}</span></button>`;
    }
    function renderGrid() {
      const q = (($('w-q') || {}).value || '').trim().toLowerCase();
      const list = items.filter((x) => (st.type === 'all' || x.type === st.type) && (!RE || x.op === st.op) && (st.city === 'all' || x.city === st.city) && (!q || (L(x.t) + ' ' + x.city).toLowerCase().includes(q)));
      const chips = [['all', S.all], ...cfg.types.map((t) => [t.id, L(t.n)])];
      $('w-chips').innerHTML = (RE ? `<button class="w-chip ${st.op === 'sale' ? 'on' : ''}" data-op="sale">${S.sale}</button><button class="w-chip ${st.op === 'rent' ? 'on' : ''}" data-op="rent">${S.rental}</button><span style="width:1px;background:var(--line);margin:0 4px;flex-shrink:0"></span>` : '') +
        chips.map(([id, n]) => `<button class="w-chip ${st.type === id ? 'on' : ''}" data-type="${id}">${esc(n)}</button>`).join('');
      $('w-count').textContent = S.results(list.length);
      $('w-grid').innerHTML = list.length ? list.map(card).join('') : `<p class="w-empty">${S.none}</p>`;
      document.querySelectorAll('.w-seg button').forEach((b) => b.classList.toggle('on', b.dataset.op === st.op));
    }

    // ---------- Detail ----------
    function openDetail(id) {
      const x = byId(id);
      st.open = id;
      const extras = x.gallery || [['interior', x.s + 3], [x.k === 'interior' ? 'modern' : 'interior', x.s + 7]];
      const meta = RE
        ? [[S.price, priceOf(x)], [S.op, x.op === 'rent' ? S.rental : S.sale], [S.area, `${num(x.area)} m²`], x.beds ? [S.bedsL, x.beds] : null, x.baths ? [S.bathsL, x.baths] : null, [S.parkL, x.park || '—'], [S.location, esc(x.city)], [S.code, x.code]].filter(Boolean)
        : [[S.year, x.year], [S.location, esc(x.city)], [S.area, `${num(x.area)} m²`], [S.type, esc(typeName(x.type))], [S.services, esc((x.svc || []).map(L).join(', '))]];
      const agent = RE && cfg.team ? cfg.team[Number(id.slice(1)) % cfg.team.length] : null;
      $('w-sheet').innerHTML = `<button class="w-x" data-act="close" aria-label="${S.close}">×</button><div class="w-detail">
        <div class="w-gallery">${art(x.k, x.s)}${extras.map((g) => art(g[0], g[1])).join('')}</div>
        <div style="display:grid;gap:14px;align-content:start">
          <span class="w-kick" style="margin:0">${esc(typeName(x.type))}</span><h3 class="w-h">${esc(L(x.t))}</h3>
          <div class="w-meta">${meta.map((m) => `<div><small>${m[0]}</small><b>${m[1]}</b></div>`).join('')}</div>
          <p class="w-muted" style="margin:0">${esc(L(x.d))}</p>
          ${x.feats ? `<div class="w-feats">${x.feats.map((f) => `<span>${esc(L(f))}</span>`).join('')}</div>` : ''}
          ${agent ? `<div class="w-agent"><div class="w-avatar">${agent[2]}</div><div><small class="w-muted">${S.agent}</small><b>${esc(agent[0])}</b></div></div>` : ''}
          ${RE ? `<a class="w-btn wa block" target="_blank" rel="noopener" href="${wa(S.waVisit(L(x.t), x.code))}">${S.visit}</a><a class="w-btn ghost block" target="_blank" rel="noopener" href="${wa(S.waAsk(L(x.t), x.code))}">${S.ask}</a>`
            : `<button class="w-btn block" data-like="${x.id}">${S.likeThis}</button>`}
        </div></div>`;
      $('w-scrim').classList.add('open');
      $('w-sheet').classList.add('open');
      $('w-sheet').scrollTop = 0;
      document.body.classList.add('w-lock');
      setTimeout(() => $('w-sheet').querySelector('.w-x').focus(), 50);
    }
    function closeDetail() {
      st.open = null;
      $('w-scrim').classList.remove('open');
      $('w-sheet').classList.remove('open');
      document.body.classList.remove('w-lock');
    }

    // ---------- Events ----------
    app.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t) return;
      const d = t.dataset;
      if (d.open) return openDetail(d.open);
      if (d.type) { st.type = d.type; if ($('w-type')) $('w-type').value = d.type; return renderGrid(); }
      if (d.op) { st.op = d.op; return renderGrid(); }
      if (d.fav) {
        const on = favs.includes(d.fav);
        favs = on ? favs.filter((f) => f !== d.fav) : [...favs, d.fav];
        try { localStorage.setItem(KEY, JSON.stringify(favs)); } catch (er) {}
        toast(on ? S.unsaved : S.saved);
        return renderGrid();
      }
      if (d.like) {
        const x = byId(d.like);
        closeDetail();
        $('c-msg').value = S.waLike(L(x.t));
        $('contact').scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => $('c-name').focus({ preventScroll: true }), 600);
        return;
      }
      if (d.act === 'close') return closeDetail();
      if (t.getAttribute('href') && t.getAttribute('href').startsWith('#') && st.open) closeDetail();
    });
    $('w-scrim').addEventListener('click', closeDetail);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && st.open) closeDetail(); });
    if ($('w-search')) {
      $('w-search').addEventListener('submit', (e) => {
        e.preventDefault();
        st.type = $('w-type').value;
        st.city = $('w-city').value;
        renderGrid();
        $('listings').scrollIntoView({ behavior: 'smooth' });
      });
      $('w-q').addEventListener('input', renderGrid);
    }
    $('w-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('c-name').value.trim(), phone = $('c-phone').value.trim();
      $('f-name').classList.toggle('err', !name);
      $('f-phone').classList.toggle('err', !phone);
      if (!name || !phone) { toast(S.fill); $(!name ? 'c-name' : 'c-phone').focus(); return; }
      const lines = [S.waForm, '', `${S.name}: ${name}`, `${S.phone}: ${phone}`];
      cfg.contact.fields.forEach((f, i) => lines.push(`${L(f.l)}: ${$('c-f' + i).value}`));
      const m = $('c-msg').value.trim();
      if (m) lines.push('', m);
      window.open(wa(lines.join('\n')), '_blank', 'noopener');
      toast(S.sent);
    });
    renderGrid();
  }

  window.SylSite = { create };
})();
