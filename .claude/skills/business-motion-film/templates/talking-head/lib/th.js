/* th.js: talking-head engine for HyperFrames (business-motion-film skill, talking-head mode).
   Camera (pushes, snaps, lifts), speaker-to-card, small captions and keyword pills are pure functions of time t,
   evaluated from one clock tween (and on the runtime's hf-seek event). Blocks (blocks.js) and per-video scenes add
   tweens to the same timeline and register sound cues, so effects follow the graphics when you retime.
   Usage, inside document.fonts.ready:
     const th = TH.create(PLAN, WORDS);  ...TH.blocks.*(th, {...})...;  th.finish();
     window.__timelines['root'] = th.tl;   // written literally in index.html (lint looks for it) */
(function () {
  const W = 1080, H = 1920;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = n => gsap.parseEase(n || 'power2.inOut');
  const $ = s => document.querySelector(s);

  // CSS-style cubic-bezier as a GSAP ease. 'pip' is the measured speaker-to-card curve from the vertical reference:
  // fast early, 75% of the travel done at 45% of the time, then a long soft landing.
  function bezier(x1, y1, x2, y2) {
    const f = (a, b, t) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
    const df = (a, b, t) => 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;
    return x => { if (x <= 0 || x >= 1) return x; let t = x; for (let i = 0; i < 8; i++) { const d = df(x1, x2, t); if (Math.abs(d) < 1e-6) break; t -= (f(x1, x2, t) - x) / d; } return f(y1, y2, t); };
  }
  gsap.registerEase('pip', bezier(.55, 0, .15, 1));

  // ---------- captions: group words into short lines ----------
  function groupWords(words, o) {
    const out = []; let cur = [];
    words.forEach((w, i) => {
      cur.push(i);
      const next = words[i + 1];
      const text = cur.map(k => words[k].t).join(' ');
      const breakHere = !next || /[.,;:!?]$/.test(w.t) || next.s - w.e > o.pause || cur.length >= o.maxWords
        || (text + ' ' + next.t).length > o.maxChars;
      // never end a line on a short function word ("a", "de", "y", "los"...) if the next word can join
      const weak = /^(a|al|de|del|el|la|los|las|y|o|en|un|una|que|con|por|para|ni|su|les|no)$/i.test(w.t);
      if (breakHere && !(weak && next && cur.length < o.maxWords + 1 && next.s - w.e < o.pause)) { out.push(cur); cur = []; }
    });
    if (cur.length) out.push(cur);
    return out.map(idx => ({ idx, s: words[idx[0]].s, e: words[idx[idx.length - 1]].e }));
  }

  function create(PLAN, WORDS) {
    const tl = gsap.timeline({ paused: true });
    const D = PLAN.duration;
    const [fx, fy] = PLAN.focus;
    const cam = $('#cam'), inner = $('#cam-inner'), shadow = $('#card-shadow'), frame = $('#card-frame');
    const cues = [];                       // [name, t, dB]: sound effects that follow the graphics
    const cue = (name, t, db = 0) => { if (name) cues.push([name, +(+t).toFixed(3), db]); };
    const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

    // any time argument: a number, {w: index} (word start), {w, end: true}, {word: 'text', after?: s}, plus d: offset
    function at(x) {
      if (x == null) return x;
      if (typeof x === 'number') return x;
      let w;
      if (x.w != null) w = WORDS[x.w];
      else if (x.word != null) { const k = norm(x.word); w = WORDS.find(v => norm(v.t) === k && v.s >= (x.after ?? 0)); }
      if (!w) throw new Error('th.at: no word for ' + JSON.stringify(x));
      return (x.end ? w.e : w.s) + (x.d ?? 0);
    }

    // ---------- camera: segments {t, d, s, x, y, ease, cue}; x/y are extra offsets in px ----------
    const segs = (PLAN.camera || []).map(g => Object.assign({}, g, { t: at(g.t) })).sort((a, b) => a.t - b.t);
    segs.forEach(g => cue(g.cue, g.t - 0.02, g.cueDb ?? 0));
    function camState(t) {
      let st = { s: 1, x: 0, y: 0 };
      for (const g of segs) {
        if (t < g.t) break;
        const to = { s: g.s ?? st.s, x: g.x ?? 0, y: g.y ?? 0 };
        const p = g.d > 0 ? ease(g.ease || 'sine.inOut')(clamp((t - g.t) / g.d)) : 1;
        st = { s: lerp(st.s, to.s, p), x: lerp(st.x, to.x, p), y: lerp(st.y, to.y, p) };
      }
      return st;
    }
    function camMatrix(st) {  // scale about the face, plus offset, clamped so the plate always covers the frame
      let tx = fx * (1 - st.s) + st.x, ty = fy * (1 - st.s) + st.y;
      tx = clamp(tx, W * (1 - st.s), 0); ty = clamp(ty, H * (1 - st.s), 0);
      return { k: st.s, tx, ty };
    }

    // ---------- speaker-to-card: {t, d, out, outD, rect:[x,y,w,h], crop:[x,y,w,h], crop2, push2, r, ease} ----------
    const cards = (PLAN.cards || []).map(c => Object.assign({}, c, { t: at(c.t), out: at(c.out) }));
    cards.forEach(c => { if (c.cue !== false) { cue('whoosh', c.t - 0.02); if (c.out != null) cue('whoosh', c.out - 0.02); } });
    function cardProgress(t) {
      for (const c of cards) {
        if (t < c.t) continue;
        const e = ease(c.ease || 'power3.inOut');
        if (t < c.t + c.d) return { c, p: e((t - c.t) / c.d) };
        if (c.out == null || t < c.out) return { c, p: 1 };
        if (t < c.out + (c.outD ?? c.d)) return { c, p: 1 - e((t - c.out) / (c.outD ?? c.d)) };
      }
      return null;
    }
    function renderCamera(t) {
      const m = camMatrix(camState(t));
      const cp = cardProgress(t);
      if (!cp || cp.p <= 0) {
        cam.style.transform = `translate(${m.tx}px,${m.ty}px) scale(${m.k})`;
        inner.style.clipPath = 'none';
        shadow.style.opacity = frame.style.opacity = 0;
        return;
      }
      const { c, p } = cp;
      // optional slow push inside the card: the crop tightens from `crop` to `crop2` while the card is held
      let crop = c.crop;
      if (c.crop2) {
        const q = ease('sine.inOut')(clamp((t - c.t - c.d) / ((c.push2 ?? c.out ?? D) - c.t - c.d)));
        crop = c.crop.map((v, i) => lerp(v, c.crop2[i], q));
      }
      const [rx, ry, rw] = c.rect, [cx, cy, cw, ch] = crop;
      const kc = rw / cw;                                  // scale that maps the crop onto the card rect
      const k = lerp(m.k, kc, p), tx = lerp(m.tx, rx - cx * kc, p), ty = lerp(m.ty, ry - cy * kc, p);
      // visible window in source coordinates: from the full frame to the crop
      const vx = lerp(0, cx, p), vy = lerp(0, cy, p), vw = lerp(W, cw, p), vh = lerp(H, ch, p);
      const rad = lerp(0, c.r ?? 28, p) / k;
      cam.style.transform = `translate(${tx}px,${ty}px) scale(${k})`;
      inner.style.clipPath = `inset(${vy}px ${W - vx - vw}px ${H - vy - vh}px ${vx}px round ${rad}px)`;
      const sx = tx + vx * k, sy = ty + vy * k, sw = vw * k, sh = vh * k;
      for (const el of [shadow, frame]) {
        el.style.transform = `translate(${sx}px,${sy}px)`; el.style.width = sw + 'px'; el.style.height = sh + 'px';
        el.style.borderRadius = (c.r ?? 28) * p + 'px';
      }
      shadow.style.opacity = p; frame.style.opacity = clamp((p - .6) / .4);
    }

    // ---------- small captions ----------
    const co = Object.assign({ y: 1185, maxWords: 4, maxChars: 22, pause: 0.35, lead: 0.05, keywords: [] }, PLAN.captions || {});
    const kwSet = new Set(co.keywords.map(norm));
    const groups = groupWords(WORDS, co);
    const capRoot = $('#caps');
    groups.forEach((g, gi) => {
      const el = document.createElement('div'); el.className = 'cap';
      g.idx.forEach(i => {
        const s = document.createElement('span'); s.className = 'w'; s.textContent = WORDS[i].t;
        if (kwSet.has(norm(WORDS[i].t))) s.dataset.kw = '1';
        el.appendChild(s);
      });
      capRoot.appendChild(el);
      g.el = el; g.words = [...el.children];
      const next = groups[gi + 1];
      g.show = g.s - co.lead;
      g.hide = next && next.s - g.e < 0.6 ? next.s - co.lead : g.e + 0.3;
    });
    groups.forEach(g => {  // centre each line on the frame, at the caption baseline height
      const w = g.el.offsetWidth, h = g.el.offsetHeight;
      g.x = (W - w) / 2; g.y = co.y - h / 2;
    });
    const hides = (co.hide || []).map(([a, b]) => [at(a), at(b)]);  // windows with no small captions
    function renderCaptions(t) {
      const off = hides.some(([a, b]) => t >= a && t < b);
      groups.forEach((g, gi) => {
        let o = 0, dy = 0;
        if (!off && t >= g.show && t < g.hide + 0.12) {
          const prev = groups[gi - 1];
          const afterGap = !prev || g.show - prev.hide > 0.05;
          // rise in after a gap, hard swap inside a sentence; the first line is already set at frame 0
          const pin = afterGap && g.show > 0.02 ? ease('power3.out')(clamp((t - g.show) / 0.16)) : 1;
          const next = groups[gi + 1];
          const swapOut = next && Math.abs(next.show - g.hide) < 0.05;
          const pout = t < g.hide ? 0 : (swapOut ? 1 : ease('power2.in')(clamp((t - g.hide) / 0.12)));
          o = pin * (1 - pout); dy = (1 - pin) * 16 - pout * 8;
        }
        g.el.style.opacity = o;
        g.el.style.transform = `translate(${g.x}px,${g.y + dy}px)`;
        if (o > 0) g.words.forEach((s, k) => {
          const w = WORDS[g.idx[k]], spoken = t >= w.s - 0.03;
          s.style.opacity = spoken ? 1 : 0.4;
          s.style.color = spoken && s.dataset.kw ? 'var(--accent)' : 'var(--text)';
        });
      });
    }

    // ---------- keyword pills: {word, text, at:[cx, cy], style, t, until, hold, in, out:'fly', fly, cue} ----------
    const kwRoot = $('#kws');
    const kws = (PLAN.keywords || []).map(k => {
      const el = document.createElement('div'); el.className = 'kw ' + (k.style || 'pill'); el.textContent = k.text;
      kwRoot.appendChild(el);
      const w = WORDS[k.word];
      const t0 = at(k.t) ?? (w.s - 0.03);                // land with the word, one frame early
      const t1 = at(k.until) ?? (w.e + (k.hold ?? 0.7));
      if (k.cue !== false) { cue('pop', t0, -2); if (k.out === 'fly') cue('whoosh', t1 - 0.02, 1); }
      return Object.assign({}, k, { el, t0, t1, w: el.offsetWidth, h: el.offsetHeight });
    });
    function renderKeywords(t) {
      for (const k of kws) {
        const [cx, cy] = k.at;
        let o = 0, s = 1, dy = 0, blur = 0;
        const inD = k.inD ?? 0.26, outD = k.outD ?? (k.out === 'fly' ? 0.35 : 0.18);
        if (t >= k.t0 && t < k.t1 + outD) {
          const pi = clamp((t - k.t0) / inD);
          if ((k.in || 'slam') === 'slam') { const e = ease('expo.out')(pi); o = clamp(pi * 3); s = lerp(1.28, 1, e); blur = (1 - e) * 14; }
          else { const e = ease('power3.out')(pi); o = e; dy = (1 - e) * 40; }            // 'rise'
          if (t >= k.t1) {
            const po = (t - k.t1) / outD;
            // fly-through: the word scales past the camera while the next scene is already in place underneath
            // stays fully opaque while it grows (a fading pill turns muddy), fills the frame for ~2 frames, then a 0.1 s fade
            if (k.out === 'fly') {
              const grow = outD - 0.1, e = ease('power3.in')(clamp((t - k.t1) / grow));
              s *= lerp(1, k.fly ?? 14, e); blur += e * 5; o *= 1 - clamp((t - k.t1 - grow) / 0.1);
            }
            else { const e = ease('power2.in')(po); o *= 1 - e; s *= lerp(1, .9, e); dy -= 14 * e; }
          }
          s *= 1 + 0.03 * clamp((t - k.t0) / Math.max(0.01, k.t1 - k.t0));  // slow drift while held: never a dead hold
        }
        k.el.style.opacity = o;
        k.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
        k.el.style.transform = `translate(${cx - k.w / 2}px,${cy - k.h / 2 + dy}px) scale(${s})`;
        k.el.style.transformOrigin = '50% 50%';
      }
    }

    // ---------- one clock drives the engine and every time-function a block registers ----------
    const timeFns = [];
    function render(t) { renderCamera(t); renderCaptions(t); renderKeywords(t); for (const f of timeFns) f(t); }
    const clock = { t: 0 };
    tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);
    // preview seeks the timeline with callbacks suppressed, so also listen for the runtime's seek event
    window.addEventListener('hf-seek', e => render(e.detail.time));

    // ---------- helpers for blocks and per-video scenes (all fromTo / to on the same timeline) ----------
    const api = {
      tl, W, H, D, WORDS, render, at, cue, groups,
      // run fn(t) on every frame (for pure functions of time, e.g. a counter); works in preview and render
      onTime(fn) { timeFns.push(fn); fn(0); return api; },
      // entrance from invisible: ease-out is safe because opacity hides the start
      in(el, t, o = {}) {
        tl.fromTo(el, { opacity: 0, y: o.y ?? 36, x: o.x ?? 0, scale: o.s ?? 0.96, filter: `blur(${o.blur ?? 0}px)` },
          { opacity: 1, y: 0, x: 0, scale: 1, filter: 'blur(0px)', duration: o.d ?? 0.42, ease: o.ease || 'power3.out', immediateRender: o.first !== false }, at(t));
        return api;
      },
      // exit: accelerate away (readable landing, fast exit)
      out(el, t, o = {}) {
        tl.to(el, { opacity: 0, y: o.y ?? -18, x: o.x ?? 0, scale: o.s ?? 0.98, duration: o.d ?? 0.2, ease: o.ease || 'power2.in' }, at(t));
        return api;
      },
      // an element already visible starts moving: in-out easing, never a one-frame pop
      move(el, t, vars, d = 0.5, e = 'power3.inOut') { tl.to(el, Object.assign({ duration: d, ease: e }, vars), at(t)); return api; },
      pop(el, t, o = {}) {
        tl.fromTo(el, { opacity: 0, scale: o.from ?? 0.6 }, { opacity: 1, scale: 1, duration: o.d ?? 0.32, ease: o.ease || 'back.out(2.2)', immediateRender: o.first !== false }, at(t));
        return api;
      },
      // a slow push keeps a held graphic alive (the reference kept most frames moving 1–2 px)
      drift(el, t, d, s = 1.04, y = 0) { tl.fromTo(el, { scale: 1, y: 0 }, { scale: s, y, duration: d, ease: 'none', immediateRender: false }, at(t)); return api; },
      // big type that builds word by word on the spoken words: each .tw span (data-w = word index, or data-t = time)
      // rises out of its own mask
      type(el, o = {}) {
        el.querySelectorAll('.tw').forEach(s => {
          const t = (s.dataset.t != null ? +s.dataset.t : (o.at ?? WORDS[+s.dataset.w].s)) - (o.lead ?? 0.04);
          tl.fromTo(s.firstElementChild, { yPercent: 105 }, { yPercent: 0, duration: o.d ?? 0.42, ease: o.ease || 'expo.out' }, t);
        });
        return api;
      },
      // a chat bubble grows out of a small pill from its tail corner, then its text settles
      inflate(el, t, origin = '0% 100%', o = {}) {
        el.style.transformOrigin = origin;
        tl.fromTo(el, { opacity: 0, scale: 0.25 }, { opacity: 1, scale: 1, duration: o.d ?? 0.5, ease: 'expo.out' }, at(t));
        const txt = el.querySelector('.txt');
        if (txt) tl.fromTo(txt, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' }, at(t) + 0.1);
        return api;
      },
      word(i) { return WORDS[i]; },
      // call last: renders frame 0 and publishes the sound cues (read by scripts/th-cues.py)
      finish() {
        (PLAN.sfx || []).forEach(([n, t, db]) => cue(n, at(t), db ?? 0));
        cues.sort((a, b) => a[1] - b[1]);
        let tag = document.getElementById('th-cues');
        if (!tag) { tag = document.createElement('script'); tag.type = 'application/json'; tag.id = 'th-cues'; document.body.appendChild(tag); }
        tag.textContent = JSON.stringify(cues);
        render(0);
        return api;
      },
      cues,
    };
    return api;
  }

  window.TH = Object.assign(window.TH || {}, { create, groupWords });
})();
