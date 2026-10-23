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

  function create(cfg) {
    const KEY = `sylkit_demo_${cfg.id}_v1`;
    let lang = 'es';
    try { lang = localStorage.getItem('sylkit_lang') || ((navigator.languages || [navigator.language || 'es']).find(Boolean) || 'es').slice(0, 2); } catch (e) {}
    if (lang !== 'en') lang = 'es';
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
      toast(msg) { const el = document.getElementById('k-toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(el._h); el._h = setTimeout(() => el.classList.remove('show'), 2600); },
      modal,
      closeModal,
      ui: {
        stats: (items) => `<div class="k-stats">${items.map((i) => `<div class="k-stat"${i.act ? ` data-act="${i.act}" data-v="${esc(i.v ?? '')}" style="cursor:pointer"` : ''}><div class="l">${esc(i.label)}</div><div class="n" style="color:${i.color || 'var(--text)'}">${esc(i.value)}</div></div>`).join('')}</div>`,
        card: (title, inner, head) => `<div class="k-card">${title || head ? `<div class="k-card-h"><h2>${esc(title || '')}</h2>${head || ''}</div>` : ''}${inner}</div>`,
        row: (o) => `<div class="k-row"${o.act ? ` data-act="${o.act}" data-id="${esc(o.id ?? '')}" style="cursor:pointer"` : ''}>${o.avatar ? `<div class="k-avatar" style="background:${o.color || 'var(--primary)'};font-size:${String(o.avatar).length > 2 ? '11px' : '15px'}">${esc(o.avatar)}</div>` : o.icon ? `<div class="k-thumb"${o.iconBg ? ` style="background:${o.iconBg}"` : ''}>${o.icon}</div>` : ''}<div class="k-grow"><div class="k-title">${o.titleHtml ?? esc(o.title)}</div>${o.meta ? `<div class="k-meta">${o.metaHtml ? o.meta : esc(o.meta)}</div>` : ''}</div>${o.right ? `<div class="k-right">${o.right}</div>` : ''}</div>`,
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
      bg.innerHTML = `<div class="k-modal"${wide ? ' style="max-width:720px"' : ''} role="dialog" aria-modal="true"><h3>${esc(title)}</h3>${html || ''}<form>${(fields || []).map(field).join('')}
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
          <div class="k-logo">${cfg.logo}</div>
          <div class="k-brand"><span id="k-name"></span><small id="k-subname"></small></div>
          <div class="k-spacer"></div>
          <button class="k-icon-btn" id="k-reset" title="Reset">↺</button>
          <div class="k-lang"><button data-lang="es">ES</button><button data-lang="en">EN</button></div>
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
      document.querySelectorAll('.k-lang button').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
      document.getElementById('k-nav').innerHTML = cfg.tabs.map((tb) => {
        const n = tb.badge ? tb.badge(app) : 0;
        return `<button data-tab="${tb.id}" class="${tb.id === tab ? 'on' : ''}">${tb.icon ? `<span class="ic">${tb.icon}</span>` : ''}${esc(app.t(tb.label))}${n ? ` <span class="k-badge">${n}</span>` : ''}</button>`;
      }).join('');
      const current = cfg.tabs.find((x) => x.id === tab);
      document.getElementById('k-view').innerHTML = current.render(app);
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
        const lb = e.target.closest('[data-lang]');
        if (lb) { lang = lb.dataset.lang; try { localStorage.setItem('sylkit_lang', lang); } catch (er) {} return render(); }
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
