/* Sylkit store templates: one storefront engine, many designs.
   A template page calls SylStore.create({...}) with its colors, fonts, hero layout, categories
   and products. Customers browse, fill a cart and send the full order to the shop's WhatsApp.
   Text can be a plain string or [spanish, english]; the language follows the visitor's browser. */
(function () {
  const STR = {
    es: {
      ribbon: 'Vista previa de plantilla · Sylkit', use: 'Usar esta plantilla',
      shopNow: 'Comprar ahora', viewAll: 'Ver todo', catsT: 'Compra por categoría', featured: 'Productos', all: 'Todo',
      search: 'Buscar productos…', searchBtn: 'Buscar', cartBtn: 'Carrito', add: 'Agregar al carrito', added: 'Agregado al carrito',
      soldOut: 'Agotado', new: 'Nuevo', sale: 'Oferta', hot: 'Top', qty: 'Cantidad',
      cart: 'Tu carrito', empty: 'Tu carrito está vacío.', keep: 'Seguir comprando', delivery: 'Entrega',
      name: 'Nombre y apellido', phone: 'Teléfono / WhatsApp', address: 'Dirección o zona', pay: 'Forma de pago', notes: 'Notas (opcional)',
      subtotal: 'Subtotal', shipping: 'Envío', total: 'Total', free: 'Gratis',
      send: 'Enviar pedido por WhatsApp', fill: 'Escribe tu nombre y teléfono para enviar el pedido.',
      sendNote: 'Se abre WhatsApp con tu pedido listo. Confirmamos pago y entrega por ahí.',
      sentT: '¡Pedido enviado!', sentS: 'Te escribiremos por WhatsApp para confirmar el pago y la entrega.', openWa: 'Abrir WhatsApp de nuevo', order: 'Pedido',
      perksT: 'Compra con confianza', quotesT: 'Lo que dicen nuestros clientes', contact: 'Contacto', hours: 'Horario', payWith: 'Aceptamos',
      made: 'Tienda creada con', noResults: 'No encontramos productos con esa búsqueda.', seeCart: 'Ver carrito',
      items: (n) => `${n} ${n === 1 ? 'producto' : 'productos'}`,
      waHello: (s) => `Hola ${s}, quiero hacer este pedido:`, waName: 'Nombre', waPhone: 'Teléfono', waDel: 'Entrega', waAddr: 'Dirección', waPay: 'Pago', waNotes: 'Notas',
      close: 'Cerrar', menu: 'Menú',
    },
    en: {
      ribbon: 'Template preview · Sylkit', use: 'Use this template',
      shopNow: 'Shop now', viewAll: 'View all', catsT: 'Shop by category', featured: 'Products', all: 'All',
      search: 'Search products…', searchBtn: 'Search', cartBtn: 'Cart', add: 'Add to cart', added: 'Added to cart',
      soldOut: 'Sold out', new: 'New', sale: 'Sale', hot: 'Top', qty: 'Quantity',
      cart: 'Your cart', empty: 'Your cart is empty.', keep: 'Keep shopping', delivery: 'Delivery',
      name: 'Full name', phone: 'Phone / WhatsApp', address: 'Address or area', pay: 'Payment method', notes: 'Notes (optional)',
      subtotal: 'Subtotal', shipping: 'Shipping', total: 'Total', free: 'Free',
      send: 'Send order on WhatsApp', fill: 'Enter your name and phone to send the order.',
      sendNote: 'WhatsApp opens with your order ready. We confirm payment and delivery there.',
      sentT: 'Order sent!', sentS: "We'll message you on WhatsApp to confirm payment and delivery.", openWa: 'Open WhatsApp again', order: 'Order',
      perksT: 'Shop with confidence', quotesT: 'What our customers say', contact: 'Contact', hours: 'Hours', payWith: 'We accept',
      made: 'Store made with', noResults: 'No products match that search.', seeCart: 'View cart',
      items: (n) => `${n} ${n === 1 ? 'item' : 'items'}`,
      waHello: (s) => `Hi ${s}, I'd like to place this order:`, waName: 'Name', waPhone: 'Phone', waDel: 'Delivery', waAddr: 'Address', waPay: 'Payment', waNotes: 'Notes',
      close: 'Close', menu: 'Menu',
    },
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ICON = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  };

  function detectLang() {
    const ES_CC = ['VE', 'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'PR', 'ES', 'GQ'];
    try {
      const forced = new URLSearchParams(location.search).get('lang');
      if (forced === 'es' || forced === 'en') return forced;
      const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
      const cc = (document.cookie.match(/(?:^|; )sk_cc=([A-Z]{2})/) || [])[1];
      if (prefs[0].startsWith('es')) return 'es';
      if (prefs[0].startsWith('en')) return 'en';
      if (cc) return ES_CC.includes(cc) ? 'es' : 'en';
      return prefs.some((l) => l.startsWith('es')) ? 'es' : 'en';
    } catch (e) {
      return 'en';
    }
  }

  function create(cfg) {
    const lang = detectLang();
    const S = STR[lang];
    const L = (v) => (Array.isArray(v) ? (lang === 'es' ? v[0] : v[1] ?? v[0]) : v ?? '');
    const KEY = `sylkit_store_${cfg.slug}_v1`;
    const params = new URLSearchParams(location.search);
    const embed = params.get('embed') === '1';
    const money = (n) => (cfg.currency || '$') + Number(n || 0).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Products: [nameEs, nameEn, category, price, { em, old, badge, opt, unit, stock, a, d }]
    const palette = cfg.art || ['#f4f4f5'];
    const products = cfg.products.map((p, i) => {
      const x = p[4] || {};
      const cat = cfg.cats.find((c) => c.id === p[2]);
      return {
        id: 'p' + i, name: [p[0], p[1]], cat: p[2], price: p[3],
        em: x.em || (cat && cat.em) || '🛍️', old: x.old, badge: x.badge, opt: x.opt, unit: x.unit,
        stock: x.stock ?? 10, a: x.a || palette[i % palette.length],
        d: x.d || (cfg.desc && cfg.desc[p[2]]) || cfg.descAll || '',
      };
    });
    const byId = (id) => products.find((p) => p.id === id);

    // State (the cart survives a page reload)
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    const st = { cat: 'all', q: '', cart: Array.isArray(saved.cart) ? saved.cart.filter((l) => byId(l.id)) : [], del: (cfg.delivery[0] || {}).id, pay: (cfg.payments || [])[0], sheet: null, detail: null, sel: {}, qty: 1, sent: null, search: false };
    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ cart: st.cart })); } catch (e) {} };

    // Theme
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

    const art = (p, cls = '') => `<div class="s-art ${cls}" style="--a:${p.a}"><span class="em" aria-hidden="true">${p.em}</span></div>`;
    const artRaw = (em, a, cls = '') => `<div class="s-art ${cls}" style="--a:${a}"><span class="em" aria-hidden="true">${em}</span></div>`;
    const priceHtml = (p) => `<div class="s-price">${money(p.price)}${p.unit ? `<span class="u">/${esc(L(p.unit))}</span>` : ''}${p.old ? `<s>${money(p.old)}</s>` : ''}</div>`;
    const badge = (p) => (!p.stock ? `<span class="s-badge out">${S.soldOut}</span>` : p.badge ? `<span class="s-badge ${p.badge === 'sale' ? 'sale' : ''}">${p.badge === 'sale' && p.old ? '-' + Math.round((1 - p.price / p.old) * 100) + '%' : S[p.badge] || esc(L(p.badge))}</span>` : '');
    const count = () => st.cart.reduce((s, l) => s + l.qty, 0);
    const subtotal = () => st.cart.reduce((s, l) => s + byId(l.id).price * l.qty, 0);
    const fee = () => (cfg.delivery.find((d) => d.id === st.del) || { fee: 0 }).fee;

    // ---------- Static page ----------
    const h = cfg.hero;
    const heroArt = (h.art || []).map((id) => byId(id)).filter(Boolean);
    function heroHtml() {
      const head = `${h.eyebrow ? `<span class="s-eyebrow">${esc(L(h.eyebrow))}</span>` : ''}<h1 class="s-h">${L(h.title)}</h1>${h.lead ? `<p class="s-lead">${esc(L(h.lead))}</p>` : ''}`;
      const ctas = `<div class="s-ctas"><a class="s-btn ${h.layout === 'banner' || h.layout === 'promo' ? 'light' : ''}" href="#shop" data-go="shop">${esc(L(h.cta) || S.shopNow)}</a>${h.cta2 ? `<a class="s-btn ghost" href="#shop" data-cat="${h.cta2.cat}" ${h.layout === 'banner' || h.layout === 'promo' ? 'style="color:inherit;border-color:currentColor"' : ''}>${esc(L(h.cta2.t))}</a>` : ''}</div>`;
      if (h.layout === 'split') return `<section class="s-hero split"><div class="s-wrap"><div>${head}${ctas}</div><div class="s-collage">${heroArt.slice(0, 3).map((p, i) => art(p, i === 0 ? 'xl' : 'lg')).join('')}</div></div></section>`;
      if (h.layout === 'banner') return `<section class="s-hero banner"><div class="s-wrap"><div class="s-band" style="${h.bg ? `--hero-bg:${h.bg};` : ''}${h.ink ? `--hero-ink:${h.ink}` : ''}">${head}${ctas}<div class="s-floats">${heroArt.slice(0, 3).map((p) => art(p)).join('')}</div></div></div></section>`;
      if (h.layout === 'editorial') return `<section class="s-hero editorial"><div class="s-wrap">${h.eyebrow ? `<span class="s-eyebrow">${esc(L(h.eyebrow))}</span>` : ''}<h1 class="s-h">${L(h.title)}</h1><div class="s-row"><div>${h.lead ? `<p class="s-lead">${esc(L(h.lead))}</p>` : ''}${ctas}</div><div class="s-pair">${heroArt.slice(0, 2).map((p) => art(p, 'xl')).join('')}</div></div></div></section>`;
      // promo
      const main = heroArt[0];
      return `<section class="s-hero promo"><div class="s-wrap"><div class="s-grid"><div class="s-main" style="${h.bg ? `--hero-bg:${h.bg};` : ''}${h.ink ? `--hero-ink:${h.ink}` : ''}">${main ? art(main, 'xl') : ''}${head}${ctas}</div><div class="s-side">${(h.tiles || []).map((t) => `<button class="s-tile" data-cat="${t.cat}">${artRaw(t.em, t.a)}<div><small>${esc(L(t.s))}</small><br><b>${esc(L(t.t))}</b></div></button>`).join('')}</div></div></div></section>`;
    }

    const app = document.createElement('div');
    app.id = 's-app';
    app.innerHTML = `
      ${embed ? '' : `<div class="s-ribbon"><div class="s-wrap"><span><span class="lbl">${S.ribbon}: </span><b>${esc(cfg.name)}</b></span><a href="/product/tienda-online-whatsapp?template=${encodeURIComponent(cfg.slug)}" target="_top">${S.use} →</a></div></div>`}
      ${cfg.annc ? `<div class="s-annc">${esc(L(cfg.annc))}</div>` : ''}
      <header class="s-head"><div class="s-wrap">
        <a class="s-brand" href="#top" data-go="top"><span class="s-mark">${esc(cfg.mark || cfg.name[0])}</span><b>${esc(cfg.name)}</b></a>
        <nav class="s-nav" aria-label="${S.menu}">${cfg.cats.slice(0, 5).map((c) => `<button data-cat="${c.id}">${esc(L(c.n))}</button>`).join('')}</nav>
        <div class="s-actions">
          <button class="s-icon" data-act="search" aria-label="${S.searchBtn}">${ICON.search}</button>
          <button class="s-icon" data-act="cart" aria-label="${S.cartBtn}">${ICON.bag}<span class="s-count s-hide" id="s-count">0</span></button>
        </div>
      </div><div class="s-search s-hide" id="s-search"><div class="s-wrap"><input id="s-q" type="search" placeholder="${S.search}" aria-label="${S.search}"></div></div></header>
      <main id="top">
        ${heroHtml()}
        <section class="s-sec"><div class="s-wrap"><div class="s-sec-head"><h2 class="s-h">${S.catsT}</h2></div>
          <div class="s-cats" id="s-cats"></div></div></section>
        <section class="s-sec" id="shop"><div class="s-wrap"><div class="s-sec-head"><h2 class="s-h">${esc(L(cfg.gridTitle) || S.featured)}</h2><span class="s-muted" id="s-n"></span></div>
          <div class="s-chips" id="s-chips"></div><div class="s-grid-p" id="s-grid"></div></div></section>
        ${cfg.perks ? `<section class="s-sec"><div class="s-wrap"><div class="s-sec-head"><h2 class="s-h">${S.perksT}</h2></div><div class="s-strip">${cfg.perks.map((p) => `<div class="s-perk"><i>${p[0]}</i><div><b>${esc(L(p[1]))}</b><span>${esc(L(p[2]))}</span></div></div>`).join('')}</div></div></section>` : ''}
        ${cfg.quotes ? `<section class="s-sec"><div class="s-wrap"><div class="s-sec-head"><h2 class="s-h">${S.quotesT}</h2></div><div class="s-quotes">${cfg.quotes.map((q) => `<div class="s-quote"><span class="s-stars">★★★★★</span><p>“${esc(L(q[0]))}”</p><small>${esc(q[1])}</small></div>`).join('')}</div></div></section>` : ''}
      </main>
      <footer class="s-foot"><div class="s-wrap">
        <div><a class="s-brand" href="#top" data-go="top"><span class="s-mark">${esc(cfg.mark || cfg.name[0])}</span><b>${esc(cfg.name)}</b></a><p class="s-muted" style="margin-top:10px;max-width:360px">${esc(L(cfg.about))}</p></div>
        <div><h4>${S.contact}</h4>${(cfg.contact || []).map((c) => `<p>${esc(L(c))}</p>`).join('')}</div>
        <div><h4>${S.payWith}</h4><div class="s-pays">${(cfg.payments || []).map((p) => `<span>${esc(L(p))}</span>`).join('')}</div></div>
        <p class="s-made">${S.made} <a href="https://sylkit.com" target="_top">Sylkit</a></p>
      </div></footer>
      <button class="s-fab s-hide" id="s-fab" data-act="cart"></button>
      <div class="s-scrim" id="s-scrim"></div>
      <div class="s-sheet center" id="s-pd" role="dialog" aria-modal="true"></div>
      <div class="s-sheet side" id="s-cart" role="dialog" aria-modal="true" aria-label="${S.cart}"></div>
      <div class="s-toast" id="s-toast" role="status"></div>`;
    document.body.appendChild(app);
    const $ = (id) => document.getElementById(id);

    // ---------- Dynamic parts ----------
    function renderCats() {
      $('s-cats').innerHTML = cfg.cats.map((c) => `<button class="s-cat ${st.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${artRaw(c.em, c.a || palette[0])}<span>${esc(L(c.n))}</span></button>`).join('');
      $('s-chips').innerHTML = [['all', S.all], ...cfg.cats.map((c) => [c.id, L(c.n)])].map(([id, n]) => `<button class="s-chip ${st.cat === id ? 'on' : ''}" data-cat="${id}">${esc(n)}</button>`).join('');
      document.querySelectorAll('.s-nav button').forEach((b) => b.classList.toggle('on', b.dataset.cat === st.cat));
    }
    function renderGrid() {
      const q = st.q.trim().toLowerCase();
      const list = products.filter((p) => (st.cat === 'all' || p.cat === st.cat) && (!q || (p.name[0] + ' ' + p.name[1]).toLowerCase().includes(q)));
      $('s-n').textContent = S.items(list.length);
      $('s-grid').innerHTML = list.length
        ? list.map((p) => `<div class="s-card"><button class="s-card" data-open="${p.id}" style="gap:10px" aria-label="${esc(L(p.name))}">${badge(p)}${art(p)}<span class="nm">${esc(L(p.name))}</span>${priceHtml(p)}</button>${p.stock ? `<button class="s-quick" data-quick="${p.id}" aria-label="${S.add}: ${esc(L(p.name))}">+</button>` : ''}</div>`).join('')
        : `<p class="s-empty">${S.noResults}</p>`;
    }
    function renderBadge() {
      const n = count();
      $('s-count').textContent = n;
      $('s-count').classList.toggle('s-hide', !n);
      const fab = $('s-fab');
      fab.classList.toggle('s-hide', !n || st.sheet === 'cart');
      fab.innerHTML = `<span>${ICON.bag.replace('<svg', '<svg width="20" height="20" style="vertical-align:-4px;margin-right:8px"')}${S.seeCart} · ${S.items(n)}</span><span>${money(subtotal())}</span>`;
    }

    function renderDetail() {
      const p = byId(st.detail);
      if (!p) return;
      const opt = p.opt && cfg.options && cfg.options[p.opt];
      $('s-pd').innerHTML = `<div class="s-grab"></div><button class="s-x" data-act="close" aria-label="${S.close}">×</button><div class="s-in">
        <div class="s-card" style="display:block">${badge(p)}${art(p, 'xl')}</div>
        <div class="s-pd" style="display:grid;gap:14px;align-content:start">
          <span class="s-eyebrow" style="margin:0">${esc(L((cfg.cats.find((c) => c.id === p.cat) || {}).n))}</span>
          <h3 class="s-h">${esc(L(p.name))}</h3>${priceHtml(p)}<p>${esc(L(p.d))}</p>
          ${opt ? `<div class="s-opt"><label>${esc(L(opt.l))}</label><div class="s-chips">${opt.v.map((v) => `<button class="s-chip ${st.sel[p.opt] === L(v) ? 'on' : ''}" data-sel="${esc(L(v))}">${esc(L(v))}</button>`).join('')}</div></div>` : ''}
          ${p.stock ? `<div class="s-opt"><label>${S.qty}</label><div class="s-addrow"><span class="s-stepper"><button data-act="qdec" aria-label="−">−</button><b>${st.qty}</b><button data-act="qinc" aria-label="+">+</button></span><button class="s-btn" data-act="addDetail">${S.add} · ${money(p.price * st.qty)}</button></div></div>` : `<button class="s-btn block" disabled style="opacity:.5">${S.soldOut}</button>`}
        </div></div>`;
    }

    function waText() {
      const del = cfg.delivery.find((d) => d.id === st.del) || {};
      const f = st.form || {};
      const lines = st.cart.map((l) => { const p = byId(l.id); return `• ${l.qty}× ${L(p.name)}${l.opt ? ` (${l.opt})` : ''} — ${money(p.price * l.qty)}`; });
      return [S.waHello(cfg.name), '', ...lines, '', `${S.subtotal}: ${money(subtotal())}`, `${S.shipping}: ${fee() ? money(fee()) : S.free}`, `*${S.total}: ${money(subtotal() + fee())}*`, '',
        `${S.waName}: ${f.name || ''}`, `${S.waPhone}: ${f.phone || ''}`, `${S.waDel}: ${L(del.n)}`, f.addr ? `${S.waAddr}: ${f.addr}` : '', `${S.waPay}: ${L(st.pay)}`, f.notes ? `${S.waNotes}: ${f.notes}` : '']
        .filter((x, i, a) => x !== '' || (a[i - 1] !== '' && i > 0)).join('\n').trim();
    }
    const waUrl = () => `https://wa.me/${cfg.whatsapp || ''}?text=${encodeURIComponent(waText())}`;

    function renderCart() {
      const el = $('s-cart');
      if (st.sent) {
        el.innerHTML = `<button class="s-x" data-act="close" aria-label="${S.close}">×</button><div class="s-in"><div class="s-done"><div class="ok">✓</div><h3 class="s-h" style="font-size:26px">${S.sentT}</h3><p class="s-muted" style="margin:0">${S.order} ${st.sent.num} · ${S.sentS}</p><div class="s-msg">${esc(st.sent.text)}</div><a class="s-btn wa block" href="${esc(st.sent.url)}" target="_blank" rel="noopener">${S.openWa}</a><button class="s-btn ghost block" data-act="close">${S.keep}</button></div></div>`;
        return;
      }
      if (!st.cart.length) {
        el.innerHTML = `<button class="s-x" data-act="close" aria-label="${S.close}">×</button><div class="s-in s-cart"><h3 class="s-h">${S.cart}</h3><div class="s-done"><div class="ok" style="background:var(--soft)">🛍️</div><p class="s-muted" style="margin:0">${S.empty}</p><button class="s-btn" data-act="close">${S.keep}</button></div></div>`;
        return;
      }
      const f = st.form || {};
      el.innerHTML = `<button class="s-x" data-act="close" aria-label="${S.close}">×</button><div class="s-in s-cart">
        <h3 class="s-h">${S.cart} <span class="s-muted" style="font-size:15px;font-weight:600">· ${S.items(count())}</span></h3>
        <div>${st.cart.map((l, i) => { const p = byId(l.id); return `<div class="s-line">${art(p)}<div><b>${esc(L(p.name))}</b><small>${l.opt ? esc(l.opt) + ' · ' : ''}${money(p.price)}${p.unit ? '/' + esc(L(p.unit)) : ''}</small></div><span class="s-stepper"><button data-line="${i}" data-d="-1" aria-label="−">−</button><b>${l.qty}</b><button data-line="${i}" data-d="1" aria-label="+">+</button></span></div>`; }).join('')}</div>
        <div class="s-opt"><label>${S.delivery}</label><div class="s-chips">${cfg.delivery.map((d) => `<button class="s-chip ${st.del === d.id ? 'on' : ''}" data-del="${d.id}">${esc(L(d.n))}${d.fee ? ` · ${money(d.fee)}` : ''}</button>`).join('')}</div></div>
        <div class="s-field" id="f-name"><label for="c-name">${S.name} *</label><input id="c-name" autocomplete="name" value="${esc(f.name || '')}"></div>
        <div class="s-field" id="f-phone"><label for="c-phone">${S.phone} *</label><input id="c-phone" type="tel" autocomplete="tel" inputmode="tel" value="${esc(f.phone || '')}"></div>
        ${st.del !== 'pickup' ? `<div class="s-field"><label for="c-addr">${S.address}</label><input id="c-addr" autocomplete="street-address" value="${esc(f.addr || '')}"></div>` : ''}
        <div class="s-opt"><label>${S.pay}</label><div class="s-chips">${(cfg.payments || []).map((p) => `<button class="s-chip ${L(st.pay) === L(p) ? 'on' : ''}" data-pay="${esc(L(p))}">${esc(L(p))}</button>`).join('')}</div></div>
        <div class="s-field"><label for="c-notes">${S.notes}</label><textarea id="c-notes">${esc(f.notes || '')}</textarea></div>
        <div class="s-sum"><div><span>${S.subtotal}</span><span>${money(subtotal())}</span></div><div><span>${S.shipping}</span><span>${fee() ? money(fee()) : S.free}</span></div><div class="big"><span>${S.total}</span><span>${money(subtotal() + fee())}</span></div></div>
        <button class="s-btn wa block" data-act="send">${S.send}</button><p class="s-note">${S.sendNote}</p></div>`;
    }

    function readForm() {
      const v = (id) => (($(id) || {}).value || '').trim();
      if ($('c-name')) st.form = { name: v('c-name'), phone: v('c-phone'), addr: v('c-addr'), notes: v('c-notes') };
    }

    let lastFocus = null;
    function openSheet(which) {
      lastFocus = document.activeElement;
      st.sheet = which;
      $('s-scrim').classList.add('open');
      $(which === 'cart' ? 's-cart' : 's-pd').classList.add('open');
      $(which === 'cart' ? 's-pd' : 's-cart').classList.remove('open');
      document.body.classList.add('s-lock');
      renderBadge();
      setTimeout(() => { const x = $(which === 'cart' ? 's-cart' : 's-pd').querySelector('.s-x'); x && x.focus(); }, 50);
    }
    function closeSheet() {
      if (st.sheet === 'cart') readForm();
      st.sheet = null;
      if (st.sent) st.sent = null;
      $('s-scrim').classList.remove('open');
      $('s-pd').classList.remove('open');
      $('s-cart').classList.remove('open');
      document.body.classList.remove('s-lock');
      renderBadge();
      lastFocus && lastFocus.focus && lastFocus.focus();
    }
    function toast(msg) { const t = $('s-toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }

    function addToCart(id, qty, opt) {
      const p = byId(id);
      const line = st.cart.find((l) => l.id === id && (l.opt || '') === (opt || ''));
      if (line) line.qty = Math.min(line.qty + qty, p.stock);
      else st.cart.push({ id, qty: Math.min(qty, p.stock), opt: opt || '' });
      persist();
      renderBadge();
      toast(`${S.added}: ${L(p.name)}`);
    }
    function setCat(cat, scroll) {
      st.cat = cat;
      renderCats();
      renderGrid();
      if (scroll) $('shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ---------- Events ----------
    app.addEventListener('click', (e) => {
      const t = e.target.closest('button, a');
      if (!t || !app.contains(t)) { if (e.target.id === 's-scrim') closeSheet(); return; }
      const d = t.dataset;
      if (d.go === 'shop') { e.preventDefault(); setCat(st.cat, true); return; }
      if (d.go === 'top') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (d.cat) { e.preventDefault(); setCat(d.cat, true); return; }
      if (d.open) { st.detail = d.open; st.qty = 1; const p = byId(d.open); const o = p.opt && cfg.options[p.opt]; st.sel = o ? { [p.opt]: L(o.v[o.def ?? 0]) } : {}; renderDetail(); openSheet('pd'); return; }
      if (d.quick) { const p = byId(d.quick); if (p.opt) { t.parentElement.querySelector('[data-open]').click(); return; } addToCart(d.quick, 1); return; }
      if (d.sel) { const p = byId(st.detail); st.sel = { [p.opt]: d.sel }; renderDetail(); return; }
      if (d.line !== undefined) { readForm(); const l = st.cart[+d.line]; l.qty = Math.min(l.qty + +d.d, byId(l.id).stock); if (l.qty <= 0) st.cart.splice(+d.line, 1); persist(); renderCart(); renderBadge(); return; }
      if (d.del) { readForm(); st.del = d.del; renderCart(); return; }
      if (d.pay) { readForm(); st.pay = (cfg.payments || []).find((p) => L(p) === d.pay); renderCart(); return; }
      switch (d.act) {
        case 'search': { const s = $('s-search'); s.classList.toggle('s-hide'); if (!s.classList.contains('s-hide')) $('s-q').focus(); return; }
        case 'cart': renderCart(); openSheet('cart'); return;
        case 'close': closeSheet(); return;
        case 'qinc': st.qty = Math.min(st.qty + 1, byId(st.detail).stock); renderDetail(); return;
        case 'qdec': st.qty = Math.max(1, st.qty - 1); renderDetail(); return;
        case 'addDetail': { const p = byId(st.detail); addToCart(p.id, st.qty, p.opt ? st.sel[p.opt] : ''); closeSheet(); return; }
        case 'send': {
          readForm();
          const f = st.form;
          $('f-name').classList.toggle('err', !f.name);
          $('f-phone').classList.toggle('err', !f.phone);
          if (!f.name || !f.phone) { toast(S.fill); $(!f.name ? 'c-name' : 'c-phone').focus(); return; }
          const url = waUrl();
          st.sent = { num: '#' + (1000 + Math.floor(Math.random() * 9000)), text: waText(), url };
          window.open(url, '_blank', 'noopener');
          $('s-toast').classList.remove('show');
          st.cart = [];
          persist();
          renderCart();
          renderBadge();
          return;
        }
      }
    });
    $('s-scrim').addEventListener('click', closeSheet);
    $('s-q').addEventListener('input', (e) => { st.q = e.target.value; renderGrid(); });
    $('s-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('shop').scrollIntoView({ behavior: 'smooth' }); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && st.sheet) closeSheet(); });

    renderCats();
    renderGrid();
    renderBadge();
    if (params.get('cart') === 'open' && st.cart.length) { renderCart(); openSheet('cart'); }
  }

  window.SylStore = { create };
})();
