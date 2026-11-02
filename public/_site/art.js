/* Sylkit template art: original building illustrations drawn as SVG from a seed, so every
   project or property gets its own picture without stock photos. Owners replace them with
   real photos when their site goes live.
   SylArt.svg(kind, seed, palette) -> SVG markup. Kinds: modern, house, tower, interior. */
(function () {
  function rng(seed) {
    let s = seed * 9301 + 49297;
    return () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

  const DEFAULT = { sky1: '#dfe9f3', sky2: '#f7f3ea', sun: '#f6c177', ground: '#c9d3c0', walls: ['#f4f1ea', '#e7e2d8', '#d9d2c5'], accent: ['#2b2b2b', '#8a5a3c', '#5f7a61'], glass: '#9fb7c9', tree: '#6f8f6a' };

  function trees(r, P, y, n) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = 20 + r() * 360, s = 10 + r() * 16;
      out += `<rect x="${x - 1.5}" y="${y - s * 0.6}" width="3" height="${s * 0.8}" fill="${P.accent[1]}" opacity=".7"/><circle cx="${x}" cy="${y - s * 0.9}" r="${s * 0.7}" fill="${P.tree}"/><circle cx="${x + s * 0.4}" cy="${y - s * 0.7}" r="${s * 0.5}" fill="${P.tree}" opacity=".85"/>`;
    }
    return out;
  }
  function windows(x, y, w, h, cols, rows, fill, gap = 6) {
    let out = '';
    const cw = (w - gap * (cols + 1)) / cols, ch = (h - gap * (rows + 1)) / rows;
    for (let c = 0; c < cols; c++) for (let rr = 0; rr < rows; rr++) out += `<rect x="${x + gap + c * (cw + gap)}" y="${y + gap + rr * (ch + gap)}" width="${cw}" height="${ch}" fill="${fill}" rx="1"/>`;
    return out;
  }
  function backdrop(r, P, id) {
    const sx = 60 + r() * 280, sy = 40 + r() * 40;
    return `<defs><linearGradient id="sky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>
      <linearGradient id="gl${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.glass}"/><stop offset="1" stop-color="#ffffff" stop-opacity=".55"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#sky${id})"/><circle cx="${sx}" cy="${sy}" r="${18 + r() * 12}" fill="${P.sun}" opacity=".85"/>`;
  }

  const draw = {
    modern(r, P, id) {
      const g = 238;
      const w1 = 200 + r() * 60, x1 = 200 - w1 / 2 - 20 + r() * 40, h1 = 64 + r() * 20;
      const w2 = w1 * (0.7 + r() * 0.25), x2 = x1 + (r() > 0.5 ? 40 : -30), h2 = 50 + r() * 16;
      const wall = pick(r, P.walls), wall2 = pick(r, P.walls), wood = P.accent[1];
      let slats = '';
      for (let i = 0; i < 9; i++) slats += `<rect x="${x2 + w2 - 60 + i * 6.5}" y="${g - h1 - h2 + 8}" width="3" height="${h2 - 16}" fill="${wood}" opacity=".9"/>`;
      return `${backdrop(r, P, id)}<rect y="${g}" width="400" height="${300 - g}" fill="${P.ground}"/>
        <rect x="${x1 - 8}" y="${g - 4}" width="${w1 + 16}" height="6" fill="${P.accent[0]}" opacity=".25"/>
        <rect x="${x1}" y="${g - h1}" width="${w1}" height="${h1}" fill="${wall}"/>
        <rect x="${x1 + 14}" y="${g - h1 + 14}" width="${w1 * 0.55}" height="${h1 - 14}" fill="url(#gl${id})"/>
        <rect x="${x1 + w1 * 0.55 + 14}" y="${g - h1 + 14}" width="2" height="${h1 - 14}" fill="${P.accent[0]}" opacity=".5"/>
        <rect x="${x2}" y="${g - h1 - h2}" width="${w2}" height="${h2}" fill="${wall2}" stroke="${P.accent[0]}" stroke-opacity=".15"/>
        <rect x="${x2 + 12}" y="${g - h1 - h2 + 10}" width="${w2 * 0.45}" height="${h2 - 20}" fill="url(#gl${id})"/>${slats}
        <rect x="${x2 - 6}" y="${g - h1 - h2 - 5}" width="${w2 + 12}" height="6" fill="${P.accent[0]}"/>
        <rect x="${x1 - 6}" y="${g - h1 - 4}" width="${w1 + 12}" height="5" fill="${P.accent[0]}" opacity=".85"/>
        ${trees(r, P, g + 2, 2)}<rect x="${x1 + w1 - 40}" y="${g}" width="70" height="${300 - g}" fill="${P.sky1}" opacity=".35"/>`;
    },
    house(r, P, id) {
      const g = 240;
      const w = 150 + r() * 60, x = 200 - w / 2 + (r() - 0.5) * 60, h = 70 + r() * 20, roof = 40 + r() * 20;
      const wall = pick(r, P.walls), roofC = pick(r, P.accent);
      const bx = r() > 0.5 ? x - 90 : x + w - 20, bw = 110, bh = 50, broof = 30;
      return `${backdrop(r, P, id)}<rect y="${g}" width="400" height="${300 - g}" fill="${P.ground}"/>
        <rect x="${bx}" y="${g - bh}" width="${bw}" height="${bh}" fill="${pick(r, P.walls)}" opacity=".85"/>
        <polygon points="${bx - 8},${g - bh} ${bx + bw / 2},${g - bh - broof} ${bx + bw + 8},${g - bh}" fill="${roofC}" opacity=".7"/>
        ${windows(bx + 14, g - bh + 12, bw - 28, 22, 3, 1, P.glass)}
        <rect x="${x}" y="${g - h}" width="${w}" height="${h}" fill="${wall}"/>
        <polygon points="${x - 14},${g - h} ${x + w / 2},${g - h - roof} ${x + w + 14},${g - h}" fill="${roofC}"/>
        <rect x="${x + w * 0.42}" y="${g - 44}" width="${w * 0.16}" height="44" fill="${P.accent[1]}"/><circle cx="${x + w * 0.54}" cy="${g - 22}" r="2" fill="#fff"/>
        ${windows(x + 12, g - h + 14, w * 0.3, h * 0.45, 2, 2, 'url(#gl' + id + ')', 4)}${windows(x + w * 0.64, g - h + 14, w * 0.3, h * 0.45, 2, 2, 'url(#gl' + id + ')', 4)}
        <rect x="${x + w * 0.4}" y="${g}" width="${w * 0.2}" height="${300 - g}" fill="${P.walls[2]}" opacity=".8"/>
        ${trees(r, P, g + 4, 3)}`;
    },
    tower(r, P, id) {
      const g = 262;
      let out = `${backdrop(r, P, id)}<rect y="${g}" width="400" height="${300 - g}" fill="${P.ground}"/>`;
      const n = 3 + Math.floor(r() * 2);
      const order = [];
      for (let i = 0; i < n; i++) order.push(i);
      order.sort(() => r() - 0.5);
      order.forEach((i, k) => {
        const w = 70 + r() * 40, x = 20 + i * (360 / n) + (r() - 0.5) * 20, h = 110 + r() * 120;
        const glass = r() > 0.4;
        const fill = glass ? 'url(#gl' + id + ')' : pick(r, P.walls);
        out += `<rect x="${x}" y="${g - h}" width="${w}" height="${h}" fill="${fill}" stroke="${P.accent[0]}" stroke-opacity=".25"/>`;
        out += glass ? (() => { let s = ''; for (let y = g - h + 14; y < g - 6; y += 14) s += `<rect x="${x}" y="${y}" width="${w}" height="1.5" fill="${P.accent[0]}" opacity=".35"/>`; return s; })() : windows(x + 4, g - h + 8, w - 8, h - 30, 3, Math.max(4, Math.floor(h / 26)), P.glass, 5);
        out += `<rect x="${x - 3}" y="${g - h - 4}" width="${w + 6}" height="5" fill="${P.accent[0]}" opacity="${0.5 + k * 0.1}"/>`;
      });
      return out + trees(r, P, g + 2, 4);
    },
    interior(r, P, id) {
      const wall = pick(r, P.walls), floor = P.accent[1];
      const sofa = pick(r, P.accent);
      return `<defs><linearGradient id="gl${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient></defs>
        <rect width="400" height="300" fill="${wall}"/><rect y="210" width="400" height="90" fill="${floor}" opacity=".55"/>
        <rect x="${210 + r() * 40}" y="40" width="130" height="150" fill="url(#gl${id})" stroke="${P.accent[0]}" stroke-width="6"/><rect x="${272 + r() * 40}" y="40" width="4" height="150" fill="${P.accent[0]}"/>
        <circle cx="${300 + r() * 20}" cy="${78}" r="14" fill="${P.sun}" opacity=".8"/>
        <rect x="40" y="160" width="170" height="50" rx="14" fill="${sofa}"/><rect x="30" y="150" width="190" height="26" rx="12" fill="${sofa}" opacity=".85"/>
        <rect x="56" y="140" width="34" height="26" rx="6" fill="${pick(r, P.walls)}"/><rect x="150" y="140" width="34" height="26" rx="6" fill="${P.sun}" opacity=".7"/>
        <rect x="60" y="225" width="120" height="8" rx="4" fill="${P.accent[0]}" opacity=".6"/><rect x="70" y="233" width="4" height="22" fill="${P.accent[0]}" opacity=".6"/><rect x="166" y="233" width="4" height="22" fill="${P.accent[0]}" opacity=".6"/>
        <rect x="348" y="170" width="20" height="40" rx="4" fill="${P.accent[1]}"/><circle cx="358" cy="150" r="22" fill="${P.tree}"/><circle cx="345" cy="160" r="14" fill="${P.tree}" opacity=".8"/>
        <line x1="120" y1="0" x2="120" y2="60" stroke="${P.accent[0]}" stroke-width="2"/><path d="M100 60 h40 l-8 18 h-24z" fill="${P.sun}" opacity=".9"/>`;
    },
  };

  let n = 0;
  function svg(kind, seed, palette) {
    const P = Object.assign({}, DEFAULT, palette || {});
    const r = rng(seed || 1);
    const f = draw[kind] || draw.modern;
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${f(r, P, 'a' + seed + '_' + n++)}</svg>`;
  }
  window.SylArt = { svg };
})();
