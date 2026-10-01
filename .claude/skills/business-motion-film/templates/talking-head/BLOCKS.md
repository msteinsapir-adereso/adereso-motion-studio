# Blocks catalog (talking-head mode)

Reusable, reviewed graphic blocks. Each one builds its DOM, animates on the shared timeline with the kit's motion rules already applied, and **registers its own sound cues**. A new video is then a `PLAN` plus a few block calls placed on the transcript, not hand-written HTML.

- Code: `lib/blocks.js`, `lib/blocks.css` (brand tokens come from `lib/th.css`). Engine: `lib/th.js`.
- Visual catalog: `blocks-gallery.jpg`. Worked examples: `index.html` (the Adereso test, built only from blocks) and the project's `videos/_gallery/`.
- **Times** accept a number, `{w: 28}` (start of word 28), `{w: 28, end: true}`, `{word: 'stock'}` (first match, optional `after`), plus `d` for an offset. The word indices are printed by `scripts/th-prep.sh`.
- **Coordinates** are 1080×1920 frame pixels, except `behind`, which uses source-video pixels. Keep text inside the safe area (x 65–1015, y 269–1248) and off the head keep-out (`zones.json`).
- **Parents:** `'#over'` (above the speaker, the default), `'#under'` (shows around the speaker card), or a scene element returned by `B.scene`.

```js
document.fonts.ready.then(() => {
  const th = TH.create(PLAN, WORDS), B = TH.blocks;
  // ...blocks...
  th.finish();                                   // renders frame 0 and publishes the sound cues
  window.__timelines['root'] = th.tl;            // literal, last (lint checks for it)
});
```

## Engine features (in `PLAN`, not blocks)

| Feature | Use | Built-in motion | Sound |
|---|---|---|---|
| `camera` segments | slow push, 7-frame snap onto a word, lift to make room | sine.inOut push; snap power2.inOut 0.23 s; lift power3.inOut 0.6 s | `cue: 'whoosh'` per segment if wanted |
| `cards` | speaker shrinks to a card (~520×650, top centre) | `ease: 'pip'` 0.9 s; `crop2` slow push inside | whoosh in and out |
| `captions` | small captions on one line, off during `hide` windows | hard swap in a sentence, rise-in after a pause, 1 frame early | none |
| `keywords` | yellow pill slammed on its word; `out: 'fly'` flies through the camera into a scene | slam expo.out 0.26 s; fly stays opaque, ×14 on power3.in over 0.25 s (fills the frame yellow), then a 0.1 s fade | pop; whoosh on fly |

## Blocks

### `B.chat`: a messaging card under the chin (overlay style)
`{parent, x=90, y=760, w=900, title, sub, avatar='bot', badge:{text, t}, in, out, messages:[{from:'user'|'bot', text, t, typing}]}`
- Rises expo.out 0.6 s. Bubbles grow from their tail corner (expo.out 0.5 s); `typing` shows dots for that many seconds before a bot reply. Exits down in 0.2 s.
- Sound: a pop per bubble.
- Rules: pair it with a camera lift. Put *who it is* in the title, not the subtitle. Keep messages to ~6 words (0.3 s per word on screen). Start it only after the previous element has left.

### `B.phrase` / `B.headline`: big type built word by word on the spoken words
`{parent, x=90, y, w=900, lines:['Una{28} IA{29} que{30}', 'resuelve{33} ^todo{34}'], sizes=[72,104], center, mark:{type:'check'|'cross', t}, out, fit=true}`
- Markup: `word{28}` is timed to word 28; `word{=8.46}` is timed to 8.46 s; an untimed word appears with the previous one. Prefix `*` for bold, `^` for the accent key word (bold), `_` for light.
- A line defaults to light for the first line of several and bold otherwise: light connecting words, heavy key words.
- Each word rises from its own mask (expo.out 0.42 s, 0.04 s early). A mark pops at the end of the last line. `out` pushes the block up and away (0.22 s ease-in), so the next phrase can build in the same place.
- `fit`: each line is shrunk in 4 px steps until it stays on one line, so a mark or word never wraps alone.
- With a speaker card, align the phrase to the card's left edge (for example `x: 280, w: 735, y: 1010`). In a scene, align the headline with the diagram's chips (`x: 105` for three chips).
- Sound: a click on the mark. `headline` is `phrase` at 112 px.

### `B.tag`: a small dark label
`{parent, x, y, text, in, out}`: for example on the speaker card's lower edge ("Les prometieron").

### `B.pill`: a statement or verdict with weight
`{parent, y, x (default centred), text, tone:'accent'|'danger'|'success'|'ink', size=44, dot=true, in, out}`: rises expo.out 0.4 s. Sound: pop. Use it for closing lines (≥ 64 px tall), not small status text.

### `B.scene`: a full-screen cutaway, already in place under the transition
`{id, in, out, veil, swap=0.22, drift=true}` → returns the scene (the parent for its blocks).
- With `veil: true`, a dark blurred veil drops 0.28 s before `in`, so a keyword pill (`until` = `in`) can land alone. The scene then **swaps in behind the pill once it covers the frame** (`in + 0.22`), the occluder wipe from the first reference, so there's never a dark or empty frame.
- Start the scene's first graphics at `in + 0.28` or later, so nothing builds under the pill.
- The scene drifts (scale 1.06, y −56) so it's never still.
- Don't fade a scene out to reveal stale layers; cover it with the next scene or the end card.

### `B.diagram`: hub → chips, each link breaks or holds on its word
`{parent: scene, hub:{text, icon='bot', y=600, in}, y=930, chips:[{text, icon, t, state:'break'|'ok'}], verdict:{text, t, tone}}`
- Up to 3–4 chips, laid out and centred automatically.
- Per chip: the wire draws (0.22 s before the word), the chip rises, and 0.42 s later a red ✕ (the wire dims) or a green ✓ (the wire turns green).
- Sound: a click per state.
- The verdict is a `pill` 40 px under the chips, landing at least 0.15 s after the last mark (enforced).
- The hub is at least 600 px wide.

### `B.stat`: a card that opens from its centre line and counts up onto the spoken number
`{parent, x=90, y, w (default: hugs the content), h, value, from=0, prefix, suffix, decimals, label, sub, in, land, count=0.8, out}`
- Opens from its centre line with expo.out 0.5 s (reference: 90% open in 15 frames). The count eases out (power3.out over 0.8 s, so the last points settle instead of stopping dead) and lands exactly on `land`, the spoken number (the reference landed within 0.04 s). The number's final width is reserved, so nothing reflows while it counts.
- Sound: a click on landing.
- **Only verified numbers.** Never invent a stat.

### `B.endcard`: the logo springs in, then the CTA
`{in, logo='assets/logo.png', logoW=560, cta, url, y=620, veil}` → a full-screen scene, centred in the safe area.
- The logo starts once the scene is opaque (+0.24 s, so no earlier text shows through), then goes 0 → 124% → 97% → 100% over ~9 frames (reference spring). The CTA pill (56 px) rises 10 frames later, and the url fades in. The whole card drifts (scale 1.05, y −40).
- Sound: a pop on the logo.

### `B.behind`: a logo or big text between the wall and the cut-out person
`{src | text, x, y, w, h, size=200, in, out, scrim=true}` in **source** pixels, inside a cutout window made with `scripts/th-cutout.sh`.
- Text: size it so the word spans ~900 px (cap ~150 px), with its baseline ~0.35 × cap below the head top (gallery: `size 204, x 80, y 346` for a head top at ~459).
- The head should overlap the lower ~40%, like a magazine masthead.
- A soft dark scrim gives contrast on a bright wall. It fades in *with* the word, never alone. The word rises from behind the head (expo.out 0.55 s).
- It warns in the console if it isn't inside a cutout window.

## Icons
`TH.icon(name, size)`: `bot, box, tag, bag, chat, check, x, user, truck, card, clock, bolt, cart, spark, inbox`.

## Sounds
`th.finish()` publishes every cue. `scripts/th-cues.py` reads them into `assets/sfx/cues.json`, and `scripts/th-mix.py … --sfx assets/sfx/cues.json` mixes them. The standard files `whoosh.mp3`, `pop.mp3` and `click.mp3` are copied by `th-prep.sh`. Extra cues: `PLAN.sfx: [['pop', 4.2, -3], ...]`.

## Adding a block
Build it in `videos/_gallery/`, use `th.at`, `th.in/out/pop/type/inflate/drift`, `th.onTime` and `th.cue`, then render and review. Add it here and to the gallery image only after a critic KEEP.
