/* Sylkit templates: no emoji. Swaps emoji icons for clean line icons and person emoji for initials,
   and removes emoji left in text, on every render (store, website and app templates). */
(function () {
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
  Object.assign(E2I, { '🏗':'building','🏢':'building','🏠':'home','🏡':'home','🏰':'building','🛋':'home','📐':'edit','📏':'edit','🔨':'wrench','⚖':'file','💼':'bag','💻':'phone','🗓':'calendar','🏦':'building','🏷':'tag','💵':'cash','💎':'star','🌿':'sparkle','🧊':'box','🤔':'chat','✅':'star','🚚':'truck','💗':'heart','🎁':'bag','★':'star','🧑':'user','👩':'user','👨':'user' });
  const EMOJI_RE = /(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{2604}\u{2607}-\u{2712}\u{2717}-\u{27BF}\u{231A}\u{231B}\u{23E9}-\u{23FA}\u{2B50}\u{2B06}\u{2B07}\u{2B05}\u{2B1B}\u{2B1C}\u{2B55}\u{2194}-\u{2199}][\u{FE0F}\u{200D}\u{2640}\u{2642}\u{1F3FB}-\u{1F3FF}]*)+/gu;
  const svg = (n) => P[n] ? `<svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>` : '';
  const base = (s) => [...String(s).replace(/[\uFE0F\u200D]/g, '').replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '')][0] || '';
  const PERSON = /[\u{1F468}\u{1F469}\u{1F9D1}\u{1F466}\u{1F467}\u{1F474}\u{1F475}]/u;
  const onlyEmoji = (t) => t.trim() && !t.replace(new RegExp(EMOJI_RE.source, 'gu'), '').trim();
  const initials = (el) => {
    const box = el.parentElement && (el.parentElement.closest('.w-person, .w-agent, .a-agent, .a-card') || el.parentElement);
    const name = (box && box.querySelector('b') ? box.querySelector('b').textContent : '').trim();
    return name.split(/\s+/).slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '•';
  };
  let busy = false;
  function clean(root) {
    busy = true;
    root.querySelectorAll('i, .w-avatar, .a-avatar, span.em, .ok').forEach((el) => {
      if (el.children.length || !onlyEmoji(el.textContent)) return;
      const ch = base(el.textContent.trim());
      if (PERSON.test(ch) || el.matches('.w-avatar, .a-avatar')) { el.textContent = initials(el); el.classList.add('initials'); return; }
      const ic = svg(E2I[ch] || 'sparkle');
      el.innerHTML = ic;
    });
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const re = new RegExp(EMOJI_RE.source, 'gu');
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (re.test(n.nodeValue)) { re.lastIndex = 0; n.nodeValue = n.nodeValue.replace(re, '').replace(/^\s+/, n.nodeValue.match(/^\s*/)[0].includes('\n') ? n.nodeValue.match(/^\s*/)[0] : ''); }
      re.lastIndex = 0;
    }
    busy = false;
  }
  const run = () => clean(document.body);
  let t = null;
  new MutationObserver(() => { if (busy) return; clearTimeout(t); t = setTimeout(run, 0); }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
