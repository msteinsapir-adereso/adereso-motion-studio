/* blocks.js: reviewed, reusable graphic blocks for the talking-head engine (th.js).
   Each block builds its DOM, adds its tweens to th.tl, registers its sound cues, and returns its root element.
   Times accept a number or a word reference ({w: index}, {word: 'text'}, {w, end: true, d: offset}); see th.at.
   Coordinates are 1080×1920 frame pixels. Keep text and logos inside the safe area (x 65–1015, y 269–1248).
   Catalog and parameters: templates/talking-head/BLOCKS.md. */
(function () {
  const W = 1080, H = 1920;
  const SAFE = { x0: 65, y0: 269, x1: 1015, y1: 1248 };
  const node = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const host = p => (typeof p === 'string' ? document.querySelector(p) : p) || document.querySelector('#over');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const place = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };

  const ICONS = {
    bot: '<rect x="4" y="7" width="16" height="12" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9.5" cy="13" r="1.5" fill="currentColor"/><circle cx="14.5" cy="13" r="1.5" fill="currentColor"/><path d="M12 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z M4 8l8 4 8-4 M12 12v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="8.5" r="1.6" fill="currentColor"/>',
    bag: '<path d="M5 8h14l-1.2 12H6.2z M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    chat: '<path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" fill="currentColor"/>',
    check: '<path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    x: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
    user: '<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    truck: '<path d="M3 7h11v9H3z M14 10h4l3 3v3h-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="1.8" fill="currentColor"/><circle cx="17" cy="18" r="1.8" fill="currentColor"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 10h18" stroke="currentColor" stroke-width="1.8"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    cart: '<path d="M3 4h2.5l2 11h10l2-8H7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/>',
    spark: '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z" fill="currentColor"/>',
    inbox: '<path d="M3 13l3-8h12l3 8v6H3z M3 13h5l1.5 2.5h5L16 13h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  };
  const icon = (name, size = 28) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;

  // ---------- big-type markup: "Una{28} IA{29} que{30}", "*bold ^accent _light", "{=8.46}" explicit time ----------
  // A token without timing appears with the previous timed token (or the next one, if it comes first).
  function typeLine(th, text) {
    const toks = text.trim().split(/\s+/).map(raw => {
      const m = raw.match(/^([*^_]*)(.*?)(?:\{(=?)(-?[\d.]+)\})?$/);
      const f = m[1], t = m[3] === '=' ? +m[4] : (m[4] != null ? th.WORDS[+m[4]].s : null);
      const cls = f.includes('^') ? 'hl' : f.includes('*') ? 'bd' : f.includes('_') ? 'lt' : '';
      return { txt: m[2], t, cls };
    });
    let last = toks.find(k => k.t != null)?.t ?? 0;
    toks.forEach(k => { if (k.t == null) k.t = last; else last = k.t; });
    return toks.map(k => `<span class="tw" data-t="${k.t}"><span class="${k.cls}">${esc(k.txt)}</span></span>`).join(' ');
  }

  const B = {};

  /* phrase: big type that builds word by word on the spoken words (optionally ending in a check or cross),
     and leaves upward when the next phrase pushes it out.
     {parent='#over', x=90, y, w=900, lines:[string | {text, size, weight:'light'|'bold'}], sizes=[72,104], center=false,
      mark:{type:'check'|'cross', t}, out, drift=true, fit=true}. Each line is shrunk to stay on one line (fit). */
  B.phrase = (th, o) => {
    const sizes = o.sizes || [72, 104];
    const root = place(node('div', 'b-big' + (o.center ? ' center' : '')), o.x ?? 90, o.y);
    root.style.width = (o.w ?? 900) + 'px';
    o.lines.forEach((ln, i) => {
      const spec = typeof ln === 'string' ? { text: ln } : ln;
      const l = node('div', 'l ' + ((spec.weight ?? (o.lines.length > 1 && i === 0 ? 'light' : 'bold')) === 'light' ? 'lt' : 'bd'), typeLine(th, spec.text));
      l.style.fontSize = (spec.size ?? sizes[Math.min(i, sizes.length - 1)]) + 'px';
      root.appendChild(l);
    });
    host(o.parent).appendChild(root);
    let m;
    if (o.mark) {
      m = node('span', 'b-mark ' + (o.mark.type || 'check'), icon(o.mark.type === 'cross' ? 'x' : 'check', 40));
      root.lastElementChild.appendChild(m);
    }
    const sizeMark = () => { if (!m) return; const px = Math.round(parseFloat(root.lastElementChild.style.fontSize) * .76);
      m.style.width = m.style.height = px + 'px'; const svg = m.firstElementChild; svg.setAttribute('width', Math.round(px * .55)); svg.setAttribute('height', Math.round(px * .55)); };
    sizeMark();
    // each line stays on one line: shrink it (4 px steps) instead of letting a word or the mark wrap (fit:false to allow wrapping)
    if (o.fit !== false) root.querySelectorAll('.l').forEach(l => {
      let fs = parseFloat(l.style.fontSize);
      const wrapped = () => l.offsetHeight > fs * 1.5;   // one line is ~1× the font size tall; two lines ~2×
      while (wrapped() && fs > 40) { fs -= 4; l.style.fontSize = fs + 'px'; if (l === root.lastElementChild) sizeMark(); }
    });
    th.type(root);
    if (m) { th.pop(m, th.at(o.mark.t)); th.cue('click', th.at(o.mark.t), -4); }
    const first = Math.min(...[...root.querySelectorAll('.tw')].map(s => +s.dataset.t));
    const end = o.out != null ? th.at(o.out) : th.D;
    if (o.drift !== false) th.drift(root, first + 0.5, Math.max(0.3, end - first - 0.5), 1.015);
    if (o.out != null) th.tl.to(root, { y: -70, opacity: 0, duration: 0.22, ease: 'power2.in' }, th.at(o.out));
    return root;
  };
  B.headline = (th, o) => B.phrase(th, Object.assign({ sizes: [112], lines: o.lines }, o));

  /* tag: a small dark label, e.g. on the speaker card's lower edge. {parent='#over', x, y, text, in, out} */
  B.tag = (th, o) => {
    const e = place(node('div', 'b-tag', esc(o.text)), o.x, o.y);
    host(o.parent).appendChild(e);
    th.in(e, th.at(o.in), { y: 16, d: 0.4 });
    if (o.out != null) th.out(e, th.at(o.out), { d: 0.18 });
    return e;
  };

  /* pill: a statement or verdict with weight (≥ 64 px tall). {parent='#over', y, x (default centred), text,
     tone:'accent'|'danger'|'success'|'ink', size=44, dot=true, in, out, cue=true} */
  B.pill = (th, o) => {
    const p = node('div', 'b-pill ' + (o.tone || 'accent'), (o.dot === false ? '' : '<i></i>') + esc(o.text));
    p.style.fontSize = (o.size ?? 44) + 'px';
    let root = p;
    if (o.x == null) { root = place(node('div', 'b-center'), 0, o.y); root.appendChild(p); }
    else { place(p, o.x, o.y); p.style.position = 'absolute'; }
    host(o.parent).appendChild(root);
    th.in(p, th.at(o.in), { y: 30, d: 0.4, ease: 'expo.out' });
    if (o.cue !== false) th.cue('pop', th.at(o.in), -3);
    if (o.out != null) th.out(p, th.at(o.out), { d: 0.18 });
    return p;
  };

  /* chat: a messaging card. The customer bubble grows from its tail corner; a bot reply can be preceded by typing dots.
     {parent='#over', x=90, y=760, w=900, title, sub, avatar='bot', badge:{text, t}, in, out,
      messages:[{from:'user'|'bot', text, t, typing:0.35}]}. Keep messages ~6 words (0.3 s per word on screen). */
  B.chat = (th, o) => {
    const card = place(node('div', 'b-card b-chat'), o.x ?? 90, o.y ?? 760);
    card.style.width = (o.w ?? 900) + 'px';
    const hd = node('div', 'hd', `<div class="b-avatar">${icon(o.avatar || 'bot', 32)}</div><div><b>${esc(o.title)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</div>`);
    card.appendChild(hd);
    let badge;
    if (o.badge) { badge = node('div', 'badge', icon('chat', 24) + esc(o.badge.text)); hd.appendChild(badge); }
    const bubs = (o.messages || []).map(m => { const b = node('div', 'bub ' + m.from, `<span class="txt">${esc(m.text)}</span>`); card.appendChild(b); return b; });
    host(o.parent).appendChild(card);
    th.in(card, th.at(o.in), { y: 120, s: 1, d: 0.6, ease: 'expo.out' });
    (o.messages || []).forEach((m, i) => {
      const t = th.at(m.t);
      if (m.from === 'bot' && m.typing) {
        const dots = node('div', 'dots', '<i></i><i></i><i></i>');
        card.appendChild(dots); dots.style.top = bubs[i].offsetTop + 'px';
        th.tl.fromTo(dots, { opacity: 0, scale: .5 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(2)' }, t - m.typing);
        dots.querySelectorAll('i').forEach((d, k) =>
          th.tl.fromTo(d, { y: 0 }, { y: -8, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t - m.typing + 0.05 + k * 0.09));
        th.tl.to(dots, { opacity: 0, duration: 0.08 }, t - 0.02);
      }
      th.inflate(bubs[i], t, m.from === 'user' ? '100% 100%' : '0% 100%');
      th.cue('pop', t, i === 0 ? -5 : -6);
    });
    if (badge) th.pop(badge, th.at(o.badge.t));
    if (o.out != null) th.out(card, th.at(o.out), { y: o.outY ?? 60, d: 0.2 });
    return card;
  };

  /* scene: a full-screen cutaway. With veil=true a dark blurred veil drops ~0.28 s before `in`, so a keyword pill
     (PLAN.keywords, out:'fly', until = in) lands alone; the scene then swaps in behind the pill once it covers the frame
     (in + 0.22 s) and is revealed as the pill fades. Start the scene's first graphics at in + 0.28 or later.
     {id, in, out, veil=false, swap=0.22, drift=true} → returns the scene element (the parent for its blocks). */
  B.scene = (th, o) => {
    const s = node('div', 'scene solid'); if (o.id) s.id = o.id;
    host('#over').appendChild(s);
    const t = th.at(o.in);
    // with a veil, the swap happens behind the flying pill once it covers the frame (occluder wipe): no dark or empty frame
    const sw = o.veil ? t + (o.swap ?? 0.22) : t;
    if (o.veil) {
      const v = document.querySelector('#veil');
      th.tl.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: 'power2.out', immediateRender: false }, t - 0.28);
      th.tl.to(v, { opacity: 0, duration: 0.06, ease: 'none' }, sw);
    }
    th.tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: o.veil ? 0.04 : 0.2, ease: 'none' }, sw);
    const end = o.out != null ? th.at(o.out) : th.D;
    if (o.drift !== false) th.tl.fromTo(s, { scale: 1, y: 0 }, { scale: 1.06, y: -56, duration: end - sw - 0.05, ease: 'none', immediateRender: false }, sw + 0.05);
    if (o.out != null) th.tl.to(s, { opacity: 0, duration: 0.2, ease: 'power2.in' }, end);
    return s;
  };

  /* diagram: a hub (the agent) linked to chips that land on their words; each link then breaks (red ✕) or holds (green ✓).
     {parent (a scene), hub:{text, icon='bot', y=600, in}, y=930 (chips row), chips:[{text, icon, t, state:'break'|'ok'}],
      verdict:{text, t, tone}}: the verdict sits 40 px under the chips and lands >= 0.15 s after the last mark */
  B.diagram = (th, o) => {
    const P = host(o.parent), n = o.chips.length, gap = 15;
    const cw = Math.min(290, Math.floor((870 - (n - 1) * gap) / n)), total = n * cw + (n - 1) * gap, x0 = W / 2 - total / 2;
    const hy = o.hub.y ?? 600, hb = hy + 140, cy = o.y ?? 930, my = Math.round(hb + (cy - hb) * .52);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'b-wires'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); P.appendChild(svg);
    const hub = node('div', 'b-card b-hub', `<div class="b-avatar">${icon(o.hub.icon || 'bot', 40)}</div><b>${esc(o.hub.text)}</b>`);
    P.appendChild(hub); hub.style.top = hy + 'px'; hub.style.left = (W / 2 - hub.offsetWidth / 2) + 'px';
    th.in(hub, th.at(o.hub.in), { y: 30, d: 0.45 });
    o.chips.forEach((c, i) => {
      const cx = Math.round(x0 + i * (cw + gap) + cw / 2), t = th.at(c.t);
      const mk = d => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d);
        p.setAttribute('pathLength', '1'); p.setAttribute('stroke-dasharray', '1'); p.setAttribute('stroke-dashoffset', '1'); svg.appendChild(p); return p; };
      const a = mk(cx === W / 2 ? `M540 ${hb} L 540 ${my}` : `M540 ${hb} C 540 ${hb + 70}, ${cx} ${my - 72}, ${cx} ${my}`);
      const b = mk(`M${cx} ${my} L ${cx} ${cy}`);
      const chip = place(node('div', 'b-card b-chip', `<div class="b-ico">${icon(c.icon || 'box', 30)}</div>${esc(c.text)}`), x0 + i * (cw + gap), cy);
      chip.style.width = cw + 'px'; P.appendChild(chip);
      const mark = place(node('div', 'b-node-mark ' + (c.state || 'break'), icon(c.state === 'ok' ? 'check' : 'x', 26)), cx - 27, my - 27);
      P.appendChild(mark);
      th.tl.fromTo(a, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.24, ease: 'power2.in' }, t - 0.22);
      th.tl.fromTo(b, { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.2, ease: 'power2.out' }, t + 0.02);
      th.in(chip, t - 0.02, { y: 40, d: 0.42, ease: 'expo.out' });
      th.pop(mark, t + 0.42);
      th.cue('click', t + 0.42, -5);
      if ((c.state || 'break') === 'break') th.tl.to(b, { opacity: 0.2, duration: 0.2, ease: 'power2.out' }, t + 0.42);
      else th.tl.to([a, b], { stroke: getComputedStyle(document.documentElement).getPropertyValue('--success').trim() || '#52CE5E', duration: 0.2, ease: 'power2.out' }, t + 0.42);
    });
    if (o.verdict) {
      const lastMark = Math.max(...o.chips.map(c => th.at(c.t))) + 0.42;
      B.pill(th, Object.assign({ parent: P, y: cy + 150 + 40, tone: 'danger' }, o.verdict, { in: Math.max(th.at(o.verdict.t), lastMark + 0.15) }));
    }
    return hub;
  };

  /* stat: a card that opens from its centre line while its number counts up and lands on the spoken number.
     {parent='#over', x=90, y, w (default: hugs the content), h, value, from=0, prefix='', suffix='', decimals=0, label, sub, in, land, count=0.8, out}.
     The count eases out (power3.out) and lands exactly on `land`, the spoken number. */
  B.stat = (th, o) => {
    const card = place(node('div', 'b-card b-stat',
      `<div class="num"></div>${o.label ? `<div class="lab">${esc(o.label)}</div>` : ''}${o.sub ? `<div class="sub">${esc(o.sub)}</div>` : ''}`), o.x ?? 90, o.y);
    card.style.width = o.w ? o.w + 'px' : 'fit-content'; if (o.h) card.style.height = o.h + 'px';
    host(o.parent).appendChild(card);
    const t0 = th.at(o.in), land = th.at(o.land ?? o.in), cnt = o.count ?? 0.8, num = card.querySelector('.num');
    th.tl.fromTo(card, { opacity: 0, scaleY: 0.02 }, { opacity: 1, scaleY: 1, duration: 0.5, ease: 'expo.out' }, t0);
    card.querySelectorAll('.lab,.sub').forEach(e => th.tl.fromTo(e, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, t0 + 0.15));
    const fmt = v => (o.prefix || '') + v.toLocaleString('es-CL', { minimumFractionDigits: o.decimals ?? 0, maximumFractionDigits: o.decimals ?? 0 }) + (o.suffix || '');
    num.textContent = fmt(o.value); num.style.minWidth = num.offsetWidth + 'px';   // reserve the final width: no reflow while counting
    const out3 = gsap.parseEase('power3.out');
    th.onTime(t => { const q = out3(Math.min(1, Math.max(0, (t - (land - cnt)) / cnt))); num.textContent = fmt((o.from ?? 0) + ((o.value) - (o.from ?? 0)) * q); });
    th.cue('click', land, -4);
    th.drift(card, t0 + 0.5, Math.max(0.3, (o.out != null ? th.at(o.out) : th.D) - t0 - 0.5), 1.02);
    if (o.out != null) th.out(card, th.at(o.out), { d: 0.2 });
    return card;
  };

  /* endcard: logo springs in (0 → 124% → 97% → 100% in 9 frames), then the CTA pill rises 10 frames later.
     {in, logo='assets/logo.png', logoW=560, cta, url, y=620} → a full-screen scene, centred in the safe area */
  B.endcard = (th, o) => {
    const s = B.scene(th, { id: o.id || 'endcard', in: o.in, veil: o.veil, drift: false });
    const t = th.at(o.in), y = o.y ?? 620;
    const lw = node('div', 'b-end-logo'); lw.style.top = y + 'px';
    const img = node('img'); img.src = o.logo || 'assets/logo.png'; img.style.width = (o.logoW ?? 560) + 'px'; img.alt = '';
    lw.appendChild(img); s.appendChild(lw);
    const L = t + 0.24;                                    // the scene is fully opaque by now: no text shows through
    th.tl.fromTo(img, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1.24, duration: 0.13, ease: 'power2.out' }, L)
      .to(img, { scale: 0.97, duration: 0.1, ease: 'sine.inOut' }, L + 0.13)
      .to(img, { scale: 1, duration: 0.07, ease: 'sine.out' }, L + 0.23);
    th.cue('pop', L, -2);
    if (o.cta) B.pill(th, { parent: s, y: y + 220, text: o.cta, tone: 'accent', dot: false, size: 56, in: L + 0.33, cue: false });
    if (o.url) {
      const u = node('div', 'b-center', `<div class="b-end-url">${esc(o.url)}</div>`); u.style.top = (y + 370) + 'px'; s.appendChild(u);
      th.tl.fromTo(u.firstElementChild, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, L + 0.6);
    }
    th.tl.fromTo(s, { scale: 1, y: 0 }, { scale: 1.05, y: -40, duration: Math.max(0.5, th.D - t - 0.45), ease: 'none', immediateRender: false }, t + 0.45);   // end card keeps drifting
    return s;
  };

  /* behind: a logo (src) or big text between the original wall and the cut-out person, in SOURCE coordinates.
     The head should overlap the lower ~40% like a magazine masthead. Must sit inside a cutout window.
     {src | text, x, y, w, h, size=200, in, out, scrim=true}. Text: size it so the word spans ~900 px (cap ~150 px) and put
     its baseline about 0.35 × cap below the top of the head, so the hair really overlaps the letters. */
  B.behind = (th, o) => {
    const P = host('#behind'), t = th.at(o.in), end = th.at(o.out);
    const wins = [...document.querySelectorAll('#cam-inner video[id^="cutout"]')].map(v => [+v.dataset.start, +v.dataset.start + +v.dataset.duration]);
    if (!wins.some(([a, b]) => t - 0.2 >= a && end + 0.25 <= b)) console.warn('TH.blocks.behind: not inside a cutout window', t, end, wins);
    let el;
    if (o.src) { el = node('img', 'b-behind'); el.src = o.src; el.alt = ''; el.style.width = o.w + 'px'; if (o.h) el.style.height = o.h + 'px'; }
    else { el = node('div', 'b-behind text', esc(o.text)); el.style.fontSize = (o.size ?? 200) + 'px'; }
    place(el, o.x, o.y);
    if (o.scrim !== false) {
      const sw = (o.w ?? 800) + 380, sh = (o.h ?? 180) + 300;
      const sc = place(node('div', 'b-scrim'), o.x + (o.w ?? 800) / 2 - sw / 2, o.y + (o.h ?? 180) / 2 - sh / 2);
      sc.style.width = sw + 'px'; sc.style.height = sh + 'px'; P.appendChild(sc);
      th.tl.fromTo(sc, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' }, t + 0.05);   // with the word, never alone
      th.tl.to(sc, { opacity: 0, duration: 0.22, ease: 'power2.in' }, end);
    }
    P.appendChild(el);
    th.in(el, t, { y: 90, s: 1, d: 0.55, ease: 'expo.out' });
    th.tl.to(el, { opacity: 0, duration: 0.22, ease: 'power2.in' }, end);
    return el;
  };

  window.TH = Object.assign(window.TH || {}, { blocks: B, icons: ICONS, icon, SAFE });
})();
