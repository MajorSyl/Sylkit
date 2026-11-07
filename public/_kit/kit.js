/* Sylkit demo engine: shared shell for every live demo on <name>.sylkit.com.
   A demo calls SylDemo.create({...}) with its strings, sample data, tabs and actions. */
(function () {
  const COMMON = {
    es: {
      demoBar: 'Demo en vivo con datos de ejemplo · Pruébalo libremente, se reinicia solo.',
      getIt: 'Quiero este sistema →',
      ctaTitle: '¿Lo quieres para tu negocio?',
      ctaSub: 'Lo instalamos con tu marca y tus datos. Incluye capacitación y soporte durante todo el año.',
      ctaBtn: 'Solicitar cotización',
      reset: 'Reiniciar demo', resetDone: 'Demo reiniciada con datos de ejemplo.',
      cancel: 'Cancelar', save: 'Guardar', close: 'Cerrar', required: 'Completa los campos obligatorios.',
      search: 'Buscar…', total: 'Total', none: 'Sin resultados.', saved: 'Guardado.', deleted: 'Eliminado.',
      edit: 'Editar', del: 'Eliminar', add: 'Agregar', today: 'Hoy', all: 'Todos',
    },
    en: {
      demoBar: 'Live demo with sample data · Try it freely, it resets itself.',
      getIt: 'I want this system →',
      ctaTitle: 'Want it for your business?',
      ctaSub: 'We set it up with your brand and your data. Training and support included all year.',
      ctaBtn: 'Request a quote',
      reset: 'Reset demo', resetDone: 'Demo reset with sample data.',
      cancel: 'Cancel', save: 'Save', close: 'Close', required: 'Please fill in the required fields.',
      search: 'Search…', total: 'Total', none: 'No results.', saved: 'Saved.', deleted: 'Deleted.',
      edit: 'Edit', del: 'Delete', add: 'Add', today: 'Today', all: 'All',
    },
  };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = (d) => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
  const addDays = (n) => { const d = today(); d.setDate(d.getDate() + n); return iso(d); };
  const daysTo = (s) => Math.round((new Date(s + 'T00:00:00') - today()) / 864e5);
  const uid = () => Math.random().toString(36).slice(2, 9);


  // ---- Professional look: clean line icons instead of emoji (tabs, header logo), initials for items.
  const P = {
    pill: '<path d="M10.5 20.5a5 5 0 0 1-7-7l7-7a5 5 0 0 1 7 7z"/><path d="m8.5 8.5 7 7"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/><path d="M3 4h2l2.4 11h10.2L20 8H6.2"/>',
    box: '<path d="m3 7.5 9-4.5 9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9.5v5M17 9.5v5"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    building: '<path d="M4 21V5l8-2v18M12 8h8v13M8 8v.01M8 12v.01M8 16v.01M16 12v.01M16 16v.01M2 21h20"/>',
    wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="m8 15 3.5-4 3 2.5L20 7"/>',
    scissors: '<circle cx="6" cy="6.5" r="2.5"/><circle cx="6" cy="17.5" r="2.5"/><path d="M8 8l12 10M8 16 20 6"/>',
    home: '<path d="m3 11 9-7 9 7"/><path d="M5 9.5V20h14V9.5M10 20v-5h4v5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    stethoscope: '<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    school: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
    file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    utensils: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1.5-3 4-3 7h3v11"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3z"/><circle cx="7.5" cy="16" r="1"/><circle cx="16.5" cy="16" r="1"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6 8.5 7 8.5-7"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3z"/>',
    printer: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3"/><rect x="7" y="14" width="10" height="7"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5M3 13l3-8h12l3 8v6H3z"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.6-1 1.1-2a1.8 1.8 0 0 1 1.6-2.6H17a4 4 0 0 0 4-4A9 9 0 0 0 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    repeat: '<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.01"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  };
  const E2I = {
    '💊':'pill','⏳':'clock','⏱':'clock','🕐':'clock','📋':'clipboard','❤':'heart','🛒':'cart','📦':'box','🔩':'box','🧾':'receipt','📑':'file','📄':'file',
    '📝':'edit','✏':'edit','💵':'cash','💰':'cash','💸':'cash','💳':'card','📍':'pin','💬':'chat','📲':'phone','📱':'phone','📞':'phone','📅':'calendar',
    '🏢':'building','🔧':'wrench','🧰':'wrench','📈':'chart','📊':'chart','✂':'scissors','💈':'scissors','💇':'scissors','🏠':'home','⚙':'settings','🌐':'globe',
    '🩺':'stethoscope','🎒':'school','🔥':'utensils','🍕':'utensils','🍝':'utensils','👥':'users','👷':'users','🛵':'truck','🚗':'car','🏷':'tag','⭐':'star',
    '🔒':'lock','✉':'mail','🗂':'folder','🖨':'printer','🔑':'key','📥':'inbox','💡':'bulb','🎨':'palette','🖌':'palette','👁':'eye','✨':'sparkle','🧠':'sparkle',
    '🔁':'repeat','⚠':'alert','⚡':'bolt','👤':'user','🛍':'bag','👗':'bag','👜':'bag','🙌':'users','👋':'chat',
  };
  const EMOJI_RE = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{2604}\u{2607}-\u{2712}\u{2717}-\u{27BF}\u{231A}\u{231B}\u{23E9}-\u{23FA}\u{2B50}\u{2B06}\u{2B07}\u{2B05}\u{2B1B}\u{2B1C}\u{2B55}\u{2194}-\u{2199}][\u{FE0F}\u{200D}\u{2640}\u{2642}\u{1F3FB}-\u{1F3FF}]*)+/gu;
  const baseEmoji = (s) => [...String(s || '').replace(/[️‍]/g, '')][0] || '';
  const isEmoji = (s) => !!s && new RegExp(EMOJI_RE.source, 'u').test(String(s));
  const svgIcon = (name, size) => P[name] ? `<svg class="k-svg" viewBox="0 0 24 24" width="${size || 18}" height="${size || 18}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name]}</svg>` : '';
  const iconFor = (emoji, size) => svgIcon(E2I[baseEmoji(emoji)], size);
  // Remove emoji left in labels and text ("💊 3 · Charge" -> "3 · Charge"), outside tags only.
  const stripEmoji = (html) => String(html).replace(/>([^<]*)</g, (m, txt) => '>' + txt.replace(EMOJI_RE, '').replace(/^\s+(?=\S)/, (w) => (w.includes('\n') ? w : '')) + '<');
  const initialsOf = (s) => {
    const words = String(s || '').replace(EMOJI_RE, '').split(/[\s\-·/,()]+/).map((w) => w.replace(/[^\p{L}]/gu, '')).filter((w) => w.length > 0 && /^\p{L}/u.test(w));
    if (!words.length) return '•';
    const two = words.length > 1 && words[1].length > 2 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
    return two.toUpperCase();
  };
  const tint = (s) => ['#1D6BFF', '#0E9384', '#7A5AF8', '#E04F8A', '#F79009', '#12B76A', '#0086C9', '#DD2590'][[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % 8];

  function create(cfg) {
    const KEY = `sylkit_demo_${cfg.id}_v1`;
    // English by default; Spanish when the visitor's browser is in Spanish.
    // If the browser language is neither, the visitor's country decides (cookie set by the server).
    const ES_CC = ['VE', 'CO', 'MX', 'AR', 'CL', 'PE', 'EC', 'BO', 'PY', 'UY', 'CR', 'PA', 'DO', 'GT', 'HN', 'SV', 'NI', 'CU', 'PR', 'ES', 'GQ'];
    let lang = 'en';
    try {
      const prefs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']).map((l) => l.toLowerCase());
      const cc = (document.cookie.match(/(?:^|; )sk_cc=([A-Z]{2})/) || [])[1];
      lang = prefs[0].startsWith('es') ? 'es' : prefs[0].startsWith('en') ? 'en' : cc ? (ES_CC.includes(cc) ? 'es' : 'en') : prefs.some((l) => l.startsWith('es')) ? 'es' : 'en';
    } catch (e) {}
    let tab = cfg.tabs[0].id;
    let db = null;

    function load() {
      try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s._v === cfg.version && Date.now() - s._at < 864e5) return s; } catch (e) {}
      return fresh();
    }
    function fresh() { const s = cfg.seed(app); s._at = Date.now(); s._v = cfg.version; return s; }
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };

    const app = {
      get db() { return db; }, set db(v) { db = v; },
      get lang() { return lang; },
      get tab() { return tab; },
      esc, today, iso, addDays, daysTo, uid, save,
      t(key, ...args) {
        const v = (cfg.t[lang] && cfg.t[lang][key]) ?? COMMON[lang][key] ?? key;
        return typeof v === 'function' && args.length ? v(...args) : v;
      },
      money(n, cur) {
        const c = cur || cfg.currency || 'USD';
        return (c === 'USD' ? '$' : c + ' ') + Number(n || 0).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      },
      date(s, opts) {
        if (!s) return '';
        try { return new Date(s.length <= 10 ? s + 'T00:00:00' : s).toLocaleDateString(lang === 'es' ? 'es-VE' : 'en-US', opts || { day: 'numeric', month: 'short' }); } catch (e) { return s; }
      },
      time(s) { try { return new Date(s).toLocaleTimeString(lang === 'es' ? 'es-VE' : 'en-US', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } },
      go(t) { tab = t; render(); window.scrollTo(0, 0); },
      rerender: () => render(true),
      toast(msg) { const el = document.getElementById('k-toast'); el.textContent = String(msg).replace(EMOJI_RE, '').trim(); el.classList.add('show'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('show'), 2600); },
      modal,
      closeModal,
      ui: {
        stats: (items) => `<div class="k-stats">${items.map((i) => `<div class="k-stat"${i.act ? ` data-act="${i.act}" data-v="${esc(i.v ?? '')}" style="cursor:pointer"` : ''}><div class="l">${esc(i.label)}</div><div class="n" style="color:${i.color || 'var(--text)'}">${esc(i.value)}</div></div>`).join('')}</div>`,
        card: (title, inner, head) => `<div class="k-card">${title || head ? `<div class="k-card-h"><h2>${esc(title || '')}</h2>${head || ''}</div>` : ''}${inner}</div>`,
        row: (o) => `<div class="k-row"${o.act ? ` data-act="${o.act}" data-id="${esc(o.id ?? '')}" style="cursor:pointer"` : ''}>${o.avatar ? `<div class="k-avatar" style="background:${o.color || 'var(--primary)'};font-size:${String(o.avatar).length > 2 ? '11px' : '15px'}">${esc(o.avatar)}</div>` : o.icon ? (isEmoji(o.icon) ? `<div class="k-thumb k-mono" style="--mono:${tint(o.title || o.titleHtml || '')}">${esc(initialsOf(o.title || String(o.titleHtml || '').replace(/<[^>]+>/g, '')))}</div>` : `<div class="k-thumb"${o.iconBg ? ` style="background:${o.iconBg}"` : ''}>${o.icon}</div>`) : ''}<div class="k-grow"><div class="k-title">${o.titleHtml ?? esc(o.title)}</div>${o.meta ? `<div class="k-meta">${o.metaHtml ? o.meta : esc(o.meta)}</div>` : ''}</div>${o.right ? `<div class="k-right">${o.right}</div>` : ''}</div>`,
        pill: (text, color) => `<span class="k-pill ${color || 'blue'}">${esc(text)}</span>`,
        btn: (label, act, data, variant) => `<button class="k-btn ${variant || 's'}" data-act="${act}"${Object.entries(data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('')}>${label}</button>`,
        empty: (text) => `<div class="k-empty">${esc(text || app.t('none'))}</div>`,
        chips: (items, current, act) => `<div class="k-chips">${items.map(([v, l]) => `<button class="k-chip${v === current ? ' on' : ''}" data-act="${act}" data-v="${esc(v)}">${esc(l)}</button>`).join('')}</div>`,
        search: (name, value, ph) => `<input class="k-input" data-in="${name}" value="${esc(value || '')}" placeholder="${esc(ph || app.t('search'))}" style="flex:1;min-width:170px">`,
        avatarColor: (s) => ['#1D6BFF', '#19A7C6', '#7A5AF8', '#E04F8A', '#F79009', '#12B76A', '#0E9384'][[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % 7],
        initials: (s) => String(s).split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
      },
    };

    db = load();

    function modal({ title, fields, submit, onSubmit, html, wide }) {
      closeModal();
      const bg = document.createElement('div');
      bg.className = 'k-modal-bg';
      bg.innerHTML = `<div class="k-modal"${wide ? ' style="max-width:720px"' : ''} role="dialog" aria-modal="true"><h3>${esc(String(title).replace(EMOJI_RE, '').trim())}</h3>${stripEmoji(html || '')}<form>${(fields || []).map(field).join('')}
        <div class="k-actions"><button type="button" class="k-btn g" data-close>${app.t(fields && fields.length ? 'cancel' : 'close')}</button>${submit ? `<button type="submit" class="k-btn p">${esc(submit)}</button>` : ''}</div></form></div>`;
      document.body.appendChild(bg);
      bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('[data-close]')) closeModal(); });
      const form = bg.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const vals = {};
        for (const f of fields || []) {
          const el = form.elements[f.name];
          vals[f.name] = f.type === 'number' ? (el.value === '' ? null : Number(el.value)) : el.value.trim();
          if (f.required && (vals[f.name] === '' || vals[f.name] == null)) { app.toast(app.t('required')); el.focus(); return; }
        }
        if (onSubmit && onSubmit(vals) !== false) closeModal();
      });
      const first = form.querySelector('input,select,textarea');
      if (first && window.innerWidth > 700) first.focus();
      return bg;
    }
    function field(f) {
      const v = esc(f.value ?? '');
      let input;
      if (f.type === 'select') input = `<select name="${f.name}">${f.options.map(([ov, ol]) => `<option value="${esc(ov)}"${String(ov) === String(f.value ?? '') ? ' selected' : ''}>${esc(ol)}</option>`).join('')}</select>`;
      else if (f.type === 'textarea') input = `<textarea name="${f.name}" placeholder="${esc(f.ph || '')}">${v}</textarea>`;
      else input = `<input name="${f.name}" type="${f.type || 'text'}" value="${v}" placeholder="${esc(f.ph || '')}"${f.step ? ` step="${f.step}"` : ''}${f.min != null ? ` min="${f.min}"` : ''}${f.type === 'number' ? ' inputmode="decimal"' : ''}>`;
      return `<div class="k-field"${f.half ? ' style="display:inline-flex;width:calc(50% - 6px);margin-right:6px"' : ''}><label>${esc(f.label)}${f.required ? ' *' : ''}</label>${input}</div>`;
    }
    function closeModal() { document.querySelectorAll('.k-modal-bg').forEach((m) => m.remove()); }

    function applyTheme() {
      const th = cfg.theme || {};
      const map = { onPrimary: '--on-primary', primary: '--primary', primaryD: '--primary-d', soft: '--soft', accent: '--accent', bg: '--bg', card: '--card', text: '--text', muted: '--muted', border: '--border', line: '--line', input: '--input', hbg: '--hbg', hfg: '--hfg', r: '--r', rLg: '--r-lg', font: '--font', head: '--head' };
      Object.entries(map).forEach(([k, v]) => { if (th[k]) document.documentElement.style.setProperty(v, th[k]); });
      if (th.fonts) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = `https://fonts.googleapis.com/css2?${th.fonts}&display=swap`; document.head.appendChild(l); }
      document.body.classList.toggle('k-dark', !!th.dark);
      document.body.classList.toggle('k-hdark', !!th.headerDark);
      document.body.classList.toggle('k-side', th.layout === 'side');
      const meta = document.createElement('meta'); meta.name = 'theme-color'; meta.content = th.hbg && !th.hbg.startsWith('var') ? th.hbg : th.primary || '#1D6BFF'; document.head.appendChild(meta);
    }

    function shell() {
      const quote = `https://sylkit.com/quote?product=${cfg.product}`;
      const side = cfg.theme && cfg.theme.layout === 'side';
      applyTheme();
      document.body.innerHTML = `
        <div class="k-demobar"><span id="k-demobar"></span><a href="${quote}" id="k-getit"></a></div>
        <header class="k-header"><div class="k-hwrap">
          <div class="k-logo">${isEmoji(cfg.logo) ? (iconFor(cfg.logo, 20) || esc(initialsOf((cfg.brand || cfg.name).en))) : cfg.logo}</div>
          <div class="k-brand"><span id="k-name"></span><small id="k-subname"></small></div>
          <div class="k-spacer"></div>
          <button class="k-icon-btn" id="k-reset" title="Reset">↺</button>
        </div>${side ? '' : '<nav class="k-nav" id="k-nav"></nav>'}</header>
        <div class="k-shell">${side ? '<aside class="k-aside"><nav class="k-nav" id="k-nav"></nav></aside>' : ''}
        <main class="k-main"><div id="k-view"></div>
          <div class="k-cta"><div style="flex:1;min-width:220px"><h3 id="k-cta-t"></h3><p id="k-cta-s"></p></div><a href="${quote}" id="k-cta-b"></a></div>
        </main></div><div class="k-toast" id="k-toast" role="status"></div>`;
    }

    function render(keepFocus) {
      let focus = null;
      if (keepFocus && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.in) {
        focus = { name: document.activeElement.dataset.in, pos: document.activeElement.selectionStart };
      }
      document.documentElement.lang = lang;
      document.title = `Demo · ${cfg.name[lang]} · Sylkit`;
      document.getElementById('k-demobar').textContent = app.t('demoBar');
      document.getElementById('k-getit').textContent = app.t('getIt');
      document.getElementById('k-name').textContent = cfg.brand ? cfg.brand[lang] : cfg.name[lang];
      document.getElementById('k-subname').textContent = cfg.sub[lang];
      document.getElementById('k-cta-t').textContent = app.t('ctaTitle');
      document.getElementById('k-cta-s').textContent = app.t('ctaSub');
      document.getElementById('k-cta-b').textContent = app.t('ctaBtn');
      document.getElementById('k-nav').innerHTML = cfg.tabs.map((tb) => {
        const n = tb.badge ? tb.badge(app) : 0;
        return `<button data-tab="${tb.id}" class="${tb.id === tab ? 'on' : ''}">${tb.icon ? (isEmoji(tb.icon) ? (iconFor(tb.icon) ? `<span class="ic">${iconFor(tb.icon)}</span>` : '') : `<span class="ic">${tb.icon}</span>`) : ''}${esc(app.t(tb.label))}${n ? ` <span class="k-badge">${n}</span>` : ''}</button>`;
      }).join('');
      const current = cfg.tabs.find((x) => x.id === tab);
      document.getElementById('k-view').innerHTML = stripEmoji(current.render(app));
      if (current.after) current.after(app);
      document.body.classList.toggle('k-has-fab', !!document.querySelector('.k-fab'));
      if (focus) {
        const el = document.querySelector(`[data-in="${focus.name}"]`);
        if (el) { el.focus(); try { el.setSelectionRange(focus.pos, focus.pos); } catch (e) {} }
      }
    }

    function boot() {
      shell();
      document.addEventListener('click', (e) => {
        const tb = e.target.closest('[data-tab]');
        if (tb) return app.go(tb.dataset.tab);
        if (e.target.closest('#k-reset')) { db = fresh(); save(); app.toast(app.t('resetDone')); return app.go(cfg.tabs[0].id); }
        const a = e.target.closest('[data-act]');
        if (a && cfg.actions[a.dataset.act]) { e.preventDefault(); cfg.actions[a.dataset.act](app, a.dataset, a); }
      });
      const onIn = (e) => {
        const el = e.target.closest('[data-in]');
        if (el && cfg.actions[el.dataset.in]) cfg.actions[el.dataset.in](app, el.value, el);
      };
      document.addEventListener('input', onIn);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
      save();
      render();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
    return app;
  }

  window.SylDemo = { create };
})();
