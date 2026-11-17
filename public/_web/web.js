/* Sylkit professional & organization websites: one engine, many looks (lawyer, doctor, NGO, club,
   government portal, football club, musician...). SylWeb.create({...}) with texts as { en, es }.
   Photos: Unsplash, hotlinked and credited in the footer. The contact form opens WhatsApp. */
(function () {
  const I = {
    check: '<path d="m5 12 5 5L20 7"/>', phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>', scale: '<path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', chart: '<path d="M4 20V4M4 20h16"/><path d="m8 15 3.5-4 3 2.5L20 7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>', calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>', code: '<path d="m8 6-6 6 6 6M16 6l6 6-6 6"/>', cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>', ticket: '<path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 0 0-4V4H3z"/><path d="M13 4v16"/>',
    home: '<path d="m3 11 9-7 9 7"/><path d="M5 9.5V20h14V9.5"/>', tool: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>', camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="4"/>',
    hands: '<path d="M7 11V6a2 2 0 0 1 4 0v5M11 10V4a2 2 0 0 1 4 0v6M15 10V6a2 2 0 0 1 4 0v8a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L3 14a2 2 0 0 1 3.4-2L7 13"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M2 21h20"/>', ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 5h-5L8 10z"/>', tooth: '<path d="M7 3c-3 0-4 3-3 7l2 9c.5 2 2.5 2 3 0l1-4h4l1 4c.5 2 2.5 2 3 0l2-9c1-4 0-7-3-7-2 0-3 1-5 1S9 3 7 3z"/>',
    stetho: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>', scissors: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8 8l12 10M8 16 20 6"/>',
    cross: '<path d="M12 3v18M6 9h12"/>', dumbbell: '<path d="M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  };
  const svg = (n, s) => `<svg viewBox="0 0 24 24" width="${s || 20}" height="${s || 20}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I.check}</svg>`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function create(c) {
    let lang = 'en';
    try {
      const q = new URLSearchParams(location.search).get('lang');
      const p = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
      lang = q === 'es' || q === 'en' ? q : /^(es|pt)/i.test(p) ? 'es' : 'en';
    } catch (e) {}
    const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.en : v ?? '');
    const T = (en, es) => (lang === 'es' ? es : en);
    const used = new Set();
    const pic = (k, w) => { const p = c.photos[k]; if (!p) return ''; used.add(k); return `${p[0]}${p[0].includes('?') ? '&' : '?'}auto=format&fit=crop&q=72&w=${w || 900}`; };
    const embed = new URLSearchParams(location.search).get('embed') === '1';
    const th = c.theme || {};
    const root = document.documentElement.style;
    Object.entries({ accent: '--accent', accentInk: '--accent-ink', bg: '--bg', soft: '--soft', text: '--text', muted: '--muted', font: '--font', head: '--head', headW: '--head-w', ls: '--ls', r: '--r', rBtn: '--r-btn', surface: '--surface' })
      .forEach(([k, v]) => th[k] && root.setProperty(v, th[k]));
    if (th.fonts) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${th.fonts}&display=swap`; document.head.appendChild(l); }
    if (th.dark) document.body.classList.add('g-dark');

    const head = (s) => `<div class="g-head">${s.eyebrow ? `<div class="g-eyebrow">${esc(L(s.eyebrow))}</div>` : ''}<h2>${esc(L(s.title))}</h2>${s.lead ? `<p>${esc(L(s.lead))}</p>` : ''}</div>`;
    const S = {
      hero(h) {
        const ctas = `<div class="g-ctas">${h.cta ? `<a class="g-btn" href="${h.cta.href || '#contact'}">${esc(L(h.cta.t))}</a>` : ''}${h.cta2 ? `<a class="g-btn ${h.layout === 'split' ? 'ghost' : 'light'}" href="${h.cta2.href || '#contact'}">${esc(L(h.cta2.t))}</a>` : ''}</div>`;
        if (h.layout === 'split') return `<section id="top"><div class="g-wrap g-split"><div><div class="g-eyebrow">${esc(L(h.eyebrow))}</div><h1>${esc(L(h.title))}</h1><p class="lead">${esc(L(h.lead))}</p>${ctas}
          ${h.badges ? `<div class="g-badges" style="color:var(--muted)">${h.badges.map(([i, t]) => `<span>${svg(i, 17)}${esc(L(t))}</span>`).join('')}</div>` : ''}</div><div class="ph"><img src="${pic(h.photo, 1200)}" alt=""></div></div></section>`;
        return `<section class="g-hero" id="top" style="background-image:url('${pic(h.photo, 2000)}')"><div class="g-wrap"><div class="g-eyebrow">${esc(L(h.eyebrow))}</div><h1>${esc(L(h.title))}</h1><p>${esc(L(h.lead))}</p>${ctas}
          ${h.badges ? `<div class="g-badges">${h.badges.map(([i, t]) => `<span>${svg(i, 17)}${esc(L(t))}</span>`).join('')}</div>` : ''}</div></section>`;
      },
      stats: (s) => `<div class="g-wrap"><div class="g-stats">${s.map(([n, l]) => `<div><b>${esc(n)}</b><span>${esc(L(l))}</span></div>`).join('')}</div></div>`,
      about: (s) => `<section class="g-sec" id="${s.id || 'about'}"><div class="g-wrap g-about"><div class="ph"><img src="${pic(s.photo, 1100)}" alt="" loading="lazy"></div><div>${head(s)}<p>${esc(L(s.text))}</p>
        ${s.points ? `<ul class="g-points">${s.points.map((p) => `<li><i>${svg('check', 18)}</i>${esc(L(p))}</li>`).join('')}</ul>` : ''}</div></div></section>`,
      cards: (s) => `<section class="g-sec ${s.alt ? 'alt' : ''}" id="${s.id || 'services'}"><div class="g-wrap">${head(s)}<div class="g-cards">${s.items.map((x) => `<article class="g-card">${x.photo ? `<div class="ph"><img src="${pic(x.photo, 800)}" alt="" loading="lazy"></div>` : ''}
        <div class="bd">${!x.photo && x.icon ? `<div class="g-icon">${svg(x.icon, 22)}</div>` : ''}${x.meta ? `<span class="meta">${esc(L(x.meta))}</span>` : ''}<h3>${esc(L(x.title))}</h3><p>${esc(L(x.text))}</p>${x.price ? `<span class="price">${esc(L(x.price))}</span>` : ''}</div></article>`).join('')}</div></div></section>`,
      gallery: (s) => `<section class="g-sec ${s.alt ? 'alt' : ''}" id="${s.id || 'gallery'}"><div class="g-wrap">${head(s)}<div class="g-gallery">${s.photos.map((k, i) => `<div><img src="${pic(k, i ? 700 : 1300)}" alt="" loading="lazy"></div>`).join('')}</div></div></section>`,
      team: (s) => `<section class="g-sec ${s.alt ? 'alt' : ''}" id="${s.id || 'team'}"><div class="g-wrap">${head(s)}<div class="g-team">${s.people.map((p) => `<div class="g-person"><div class="ph"><img src="${pic(p.photo, 600)}" alt="" loading="lazy"></div><b>${esc(p.name)}</b><span>${esc(L(p.role))}</span></div>`).join('')}</div></div></section>`,
      quotes: (s) => `<section class="g-sec ${s.alt ? 'alt' : ''}"><div class="g-wrap">${head(s)}<div class="g-quotes">${s.items.map(([t, w]) => `<div class="g-quote"><span class="g-stars">★★★★★</span><p>“${esc(L(t))}”</p><small>${esc(w)}</small></div>`).join('')}</div></div></section>`,
      table: (s) => `<section class="g-sec ${s.alt ? 'alt' : ''}" id="${s.id || 'fixtures'}"><div class="g-wrap">${head(s)}<table class="g-table">${s.rows.map((r) => `<tr><td><b>${esc(L(r[0]))}</b></td><td>${esc(L(r[1]))}</td><td class="vs">${esc(L(r[2]))}</td><td>${esc(L(r[3]))}</td><td>${esc(L(r[4] || ''))}</td><td style="text-align:right">${r[5] ? `<span class="tag ${r[6] || ''}">${esc(L(r[5]))}</span>` : ''}</td></tr>`).join('')}</table></div></section>`,
      band: (s) => `<section class="g-sec"><div class="g-wrap"><div class="g-band" style="background-image:url('${pic(s.photo, 1800)}')"><h2>${esc(L(s.title))}</h2><p>${esc(L(s.text))}</p><a class="g-btn" href="${s.href || '#contact'}">${esc(L(s.cta))}</a></div></div></section>`,
      contact(s) {
        return `<section class="g-sec alt" id="contact"><div class="g-wrap g-contact"><div>${head(s)}<div class="g-lines">${s.lines.map(([i, t]) => `<div><i>${svg(i, 20)}</i><span>${esc(L(t))}</span></div>`).join('')}</div></div>
          <form class="g-form" id="g-form"><div><label>${T('Your name', 'Tu nombre')}</label><input name="n" required></div><div><label>${T('Phone or email', 'Teléfono o correo')}</label><input name="p" required></div>
          ${s.topics ? `<div><label>${esc(L(s.topicLabel) || T('Topic', 'Tema'))}</label><select name="t">${s.topics.map((x) => `<option>${esc(L(x))}</option>`).join('')}</select></div>` : ''}
          <div><label>${T('Message', 'Mensaje')}</label><textarea name="m"></textarea></div><button class="g-btn" type="submit">${esc(L(s.button) || T('Send message', 'Enviar mensaje'))}</button></form></div></section>`;
      },
    };

    function render() {
      used.clear();
      const nav = c.nav || [];
      const body = c.sections.map((s) => (S[s.type] ? S[s.type](s.type === 'stats' ? s.items : s) : '')).join('');
      const credits = [...new Map([...used].map((k) => c.photos[k]).filter(Boolean).map((p) => [p[1], p])).values()];
      document.body.insertAdjacentHTML('afterbegin', `${embed ? '' : `<div class="g-ribbon"><div class="g-wrap"><span>${T('Template preview · Sylkit', 'Vista previa de plantilla · Sylkit')}: <b>${esc(c.name)}</b></span><a href="/product/${c.product}?template=${encodeURIComponent(c.slug)}" target="_top">${T('Use this template', 'Usar esta plantilla')} →</a></div></div>`}
        ${c.topbar ? `<div class="g-top">${esc(L(c.topbar))}</div>` : ''}
        <nav class="g-nav"><div class="g-wrap"><a class="g-brand" href="#top"><span class="g-mark ${th.crest ? 'g-crest' : ''}">${esc(c.mark)}</span>${esc(c.name)}</a>
          <div class="g-links">${nav.map(([id, t]) => `<a href="#${id}">${esc(L(t))}</a>`).join('')}</div>${c.navCta ? `<a class="g-btn" href="${c.navCta.href || '#contact'}">${esc(L(c.navCta.t))}</a>` : ''}<button class="g-menu" aria-label="Menu">${svg('menu', 24)}</button></div></nav>
        <main>${body}</main>
        <footer class="g-foot"><div class="g-wrap"><div><b>${esc(c.name)}</b><br>${esc(L(c.footer || ''))}</div><div>${T('Website made with', 'Sitio creado con')} <a href="https://sylkit.com" target="_top">Sylkit</a></div>
          <div class="g-credit">${T('Photos', 'Fotos')}: ${credits.map((p) => `<a href="${esc(p[2])}" target="_blank" rel="noopener">${esc(p[1])}</a>`).join(', ')} · <a href="https://unsplash.com/?utm_source=sylkit&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a></div></div></footer>
        <div class="g-toast" id="g-toast"></div>`);
      document.documentElement.lang = lang;
      document.title = `${c.name} · ${T('Website template', 'Plantilla de sitio web')} · Sylkit`;
      const f = document.getElementById('g-form');
      if (f) f.addEventListener('submit', (e) => {
        e.preventDefault(); const t = document.getElementById('g-toast');
        t.textContent = T('Demo: on your site this opens WhatsApp with the message ready.', 'Demo: en tu sitio esto abre WhatsApp con el mensaje listo.');
        t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); f.reset();
      });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
  }
  window.SylWeb = { create };
})();
