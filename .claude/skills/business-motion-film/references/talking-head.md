# Talking-head mode (vertical 9:16)

Use this when the input is an **already-edited talking-head video** and the job is to add motion graphics: zooms, captions and kinetic type, overlays, the speaker shrinking to a card, full-screen cutaways, and graphics behind the speaker. The kit's motion rules still apply. This file translates them to a real speaker and adds what a real face and real speech demand.

The engine and the blocks live in `templates/talking-head/` (`lib/th.js`, `lib/blocks.js`, their CSS, `BLOCKS.md`, and an example `index.html` built only from blocks). The reference study it's built on: three client-chosen ads, measured frame by frame (notes in the project's `refs/*/notes.md` when present).

## Process rules (learned the hard way on the first video)

1. **Read the references before designing anything.** The first layout was built before the vertical reference was studied, put graphics in a narrow column beside the face, and had to be redone. The project's `refs/*/notes.md` already hold the measured study of the client's three reference ads, so read them; don't re-run the study unless the user brings new references (then give each study agent its own scratch subfolder and study only what's comparable: vertical, with a speaker).
2. **Never skip the edit-plan checkpoint, even when the user has already given direction.** Show the timed plan plus 2–3 snapshot style frames of the key beats (built quickly with the engine), and wait for OK. Layout and clarity problems (the side column, a "bad bot" that could read as the brand's) are cheapest to catch here.
3. **Debug in this order: snapshot → render → review pack.** Don't debug in the Studio preview. It doesn't paint video frames, and it rewrites `index.html` with `data-hf-id` stamps.
4. **Sound follows the graphics.** Blocks and engine features register their own cues. After any retime, re-run `scripts/th-cues.py` and `scripts/th-mix.py`. Put extra sounds in `PLAN.sfx`, never in a hand-kept list (a hand-kept list drifted in the first video).
5. **Measurements aren't listening.** Before calling a video done, ask the user to listen once on a phone speaker, and state in `NOTES.md` that nobody else has listened.
6. **One project folder per video** (`videos/<name>/`, copied from `templates/talking-head/`), with `BRIEF.md`, `NOTES.md`, `renders/` and `review/` inside. Brand assets stay in `brand/` and references in `refs/`.

## Budget (same lean rules)

One checkpoint: the **edit plan** (step 3). Two renders (a draft, then the final), one independent critic, one fix round. Snapshots are cheap; use them at every beat and every seam while building.

## Workflow

1. **Set up.** Create `videos/<name>/` and copy `templates/talking-head/` into it (`lib/`, `index.html` as the starting example, `BLOCKS.md` for reference). Put the clip in `assets/`, plus the brand font and logo (`brand/`).
2. **Prep, in one command** (about 30 s, no model cost): `scripts/th-prep.sh assets/clip.mp4 es ../../brand/glossary.json`. It writes:
   - the word timings, with the brand glossary applied (Whisper hears "Adereso" as "Ereso");
   - `words.js`;
   - `zones.json` (head keep-out, safe area, free regions, and `focus` for the plan);
   - the voice loudness;
   - the standard effects (whoosh, pop, click).
   It prints the numbered word list the plan refers to.
3. **Edit plan, then get the user's OK** (see the process rules). Write one table: time → spoken words → style (speaker / overlay / card / cutaway / behind) → block → transition in and out. Add 2–3 snapshot style frames.
4. **Build with blocks.** Fill `PLAN` (camera, cards, captions, keywords) and place blocks (`BLOCKS.md`): `B.chat`, `B.phrase`, `B.headline`, `B.tag`, `B.pill`, `B.scene`, `B.diagram`, `B.stat`, `B.endcard`, `B.behind`. Times come from words (`{w: 28}` or `{word: 'stock'}`). Write custom HTML only for a genuinely new graphic, and turn it into a block afterwards.
   - After each beat, snapshot it: `npx hyperframes snapshot . --at <landing>,<mid>,<seams> --no-end`.
   - Then run `npx hyperframes lint .` and `npx hyperframes check . --at-transitions`.
5. **Behind-the-speaker windows:** `scripts/th-cutout.sh assets/clip.mp4 <t0> <t1> assets/cutout-<name>.webm` cuts the exact frames, removes the background and prints the `<video>` tag to paste.
6. **Audio:**
   - `scripts/th-cues.py` reads the cues every block registered;
   - `scripts/th-mix.py assets/clip.mp4 assets/mix.wav --sfx assets/sfx/cues.json [--music track.mp3]` mixes them.
   Retiming a block moves its sound; re-run both after any retime.
7. **Draft, critic, fix, final.**
   - Draft: `npx hyperframes render . --quality draft --fps 30 -o renders/draft.mp4`.
   - Review: `scripts/review-pack.sh` with the plan's transition times, then one critic (the SKILL.md prompt plus the talking-head checks at the end of this file), then one fix round.
   - Final: `--quality delivery --fps <source rate, e.g. 30000/1001>`, so cutouts stay frame-locked.

## Layout grammar for 9:16

The speaker is centred and large, so **there is no room beside the face**. A 346 px side column put chat text at about 9 pt on a phone. Instead, use four bands, measured per clip with `th-zones.py`:

| Band | Where (this clip) | Use |
|---|---|---|
| Headroom | above the head, inside the safe area | logos, a short label, type that sits behind the head |
| Face | the head keep-out | nothing, ever (except the speaker card and cutaways, which replace the frame) |
| Graphics | under the chin, above the captions | overlays: cards, chats, chips |
| Captions | a fixed line at the bottom of the safe area (y ≈ 1185 of 1920) | small captions, in one position for the whole video |

- **Safe area (Meta Reels ads):** keep 14% top, 35% bottom and 6% of each side free of text and logos, so x 65–1015, y 269–1248 on a 1080×1920 frame. Organic Reels allow lower captions (the vertical reference sat at 80% of height), but ads don't.
- **Make room by moving the camera, in the same direction as the graphic.** A *lift* (`{s: 1.1, y: -130}`) raises the face and frees ~350 px under the chin. The overlay rises from below while the camera moves up, so the cause and the effect share one direction.
- **Bigger graphic moments shrink the speaker to a card** (top centre, about 48% of the width) and give the rest of the frame to big type or a product UI.
- **Full-screen cutaways** are for the turns of the story and moments where type is the whole message.

## The four styles

**1. Overlay (the speaker stays full-frame).** Lift the camera, and the card rises under the chin with an expo-out (73% of the travel in the first 8 frames; 0.5–0.7 s). Chat bubbles grow from a small pill at their tail corner (`th.inflate`, about 15 frames expo-out); a typing indicator for ~0.4 s before a bot reply. The overlay leaves fast the way it came (0.2 s ease-in). Keep overlay text ≥ 30 px on 1080 wide.

**2. Speaker → card.** `PLAN.cards`: rect about 520×650 at the top centre (about 48% of the width), a 4:5 crop around head and shoulders, and a `crop2` for a slow push inside the card while it's held. Use `ease: 'pip'` (the measured reference curve: 75% of the travel by 45% of the time, then a long soft landing) over 0.9 s. A short tag on the card's lower edge can name the beat ("Les prometieron"), and the big type builds below it. The graphics sit on the `#under` layer and are revealed as the camera shrinks. The card keeps the face alive, so the viewer never loses the person.

**3. Full-screen cutaway.** Best entrance: a dark blurred veil drops, a keyword pill slams in alone, then it **flies through the camera**. It stays opaque, grows ×14 on power3.in and fills the frame yellow for ~2 frames. The scene **swaps in behind it** (`B.scene({veil: true})`) and is revealed as the pill fades (0.1 s). Never fade a growing pill (it turns muddy), and never reveal a dark scene around a small pill (the frame reads as near-black). Return to the speaker with the reference's **breathing pull-out**: cut to a 1.12× crop that eases to 1.0 over 2.4–3.8 s.

**4. Behind the speaker.** Layer order inside the camera: plate → `#behind` → cutout video (person only, alpha). Put the element **between the original wall and the person, never on a new background**, so the matte's imperfect edges blend into the real wall. Treat it like a magazine masthead: the head overlaps the lower ~40% of the logo or type, and the letters stay readable. A soft dark scrim (radial, ~0.7 in the centre) behind the element gives contrast on a bright wall. The element can rise from behind the head (expo-out 0.55 s). Keep it strictly inside the cutout window.

Making the cutout:
- Cut the **exact source frames**: `ffmpeg -i clip.mp4 -vf "select='between(n\,K0\,K1)',setpts=N/(30000/1001)/TB" -r 30000/1001 -an -crf 8 seg.mp4`.
- Then `npx hyperframes remove-background seg.mp4 -o cutout.webm --quality best`. It runs at about 0.6 s per frame on an M1, so a 1.5 s window takes ~40 s.
- Place it with `data-start = K0 / 29.97` and `data-duration = (K1 - K0 + 1) / 29.97`.
- Alpha survives the **render** (verified). The Studio preview pane doesn't paint video, so judge this effect in snapshots, not in the preview.

## Captions and kinetic type

- **Small captions** (engine): 2–4 words, a hard swap inside a sentence and a short rise-in after a pause, one fixed line, a dark backing (busy footage behind), 48 px Outfit 500. Spoken words are white; upcoming words are 40% (a grey-to-white fill, synced 1 frame early; lag reads as out of sync on a face). Brand terms turn accent yellow when spoken.
- **Captions switch off whenever on-screen type says the words** (`captions.hide` windows), and come back 5–9 frames before the cut back to the speaker. Never two versions of the same words on screen.
- **Keyword pill** (`PLAN.keywords`): a brand-style yellow pill with dark text, slammed in on its word (scale 1.28→1 with blur 14→0, expo-out 0.26 s), a slow 3% drift while held, a fast exit (0.18 s ease-in). Use one every ~5–8 s at most.
- **Big type** (`th.type`): every word rises out of its own mask on its spoken word (expo-out 0.42 s, 0.04 s early). Pair **light connecting words with heavy key words** (Outfit 300 / 600), key word in accent. Change phrases with a **vertical push**: the old block leaves upward with an ease-in (6–8 frames); the new words rise from below. Never place a new text on top of a readable old one; exit first or veil.

## Camera grammar

- **Frame 0 is the plain shot at scale 1**, with captions already set.
- **Slow push** during speaker stretches: about 5% over 2–3 s (sine.inOut). Never a dead hold.
- **Snap zoom** onto a key word: +10–12% in 7 frames on an S-curve (power2.inOut), starting ~2 frames before the word. It looks crafted where a hard cut looks like a jump. A **staircase** of +10% steps works for spoken lists.
- **Lift/reframe** to make room (power3.inOut, 0.6 s). Stay within ~1.25× on 1080p sources to keep them sharp. The engine clamps so the plate always covers the frame.

## Motion rules from the kit, as they apply here

- Anything visible that starts moving uses in-out easing (camera moves, the card); entrances from invisible can use expo-out or power3-out because opacity hides the start.
- Readable landing, fast exit: entrances 0.4–0.6 s, exits 0.18–0.22 s.
- One element carries across shots: the speaker (as the card), a keyword (its caption word turns yellow, then the pill), the agent node.
- Cause produces effect: a question gets a (bad) reply; a promise gets a check; a connection draws, then breaks on its word.
- **Keep graphic scenes moving:** in dark graphic scenes, a 3% drift is too slow for the freeze detector (about 0.15 px per frame). The reference kept 75% of frames moving at 1–2 px per frame. Give held graphics a combined drift (scale ~4% plus y −40 px over the hold).

## Sync

- Graphics land **on** their word: start 0.02–0.05 s early, so the landing coincides with the syllable. The references' medians were 1 frame early, 80% within ±4 frames.
- Captions: 1 frame early. Keyword pill: 1 frame early.

## Audio (voice first)

- `scripts/th-mix.py clip.mp4 mix.wav --music track.mp3 --sfx sfx.json` does this in one step:
  - rumble cut and gentle compression on the voice;
  - music at −12 LU relative to the voice before ducking, then ducked ~7 dB under speech (about −19 LU under the words; the references measured music 8–16 dB under the voice);
  - effects peaking ~9 dB under the voice peak;
  - a two-pass loudnorm to −14 LUFS with true peak −1.
- **Sparse effects:** soft whooshes only on the real transitions (lift, card, fly-through), and small pops on real UI actions (a bubble, a check, a chip). The vertical reference used none, and the others used 1–4 in 30–36 s.
- Screen candidates with `scripts/sfx-candidates.py`. Deliver a voice + music-only version as well.

## Pitfalls hit while building this

- **Preview seeks don't fire GSAP `onUpdate`.** The engine also listens for `hf-seek`; keep that line.
- **`npx hyperframes lint` needs `window.__timelines['root'] = tl` written in `index.html` itself**, not only inside the library.
- **The Studio preview stamps `data-hf-id` attributes into `index.html`.** Harmless; strip them with `sed -E 's/ data-hf-id="[^"]*"//g'` if they get in the way.
- The preview pane in the browser doesn't show video frames, so judge video and cutouts in snapshots or renders.
- A zoom on the camera moves everything inside it, including behind-the-speaker elements (correct: they're in the scene). Overlays belong outside the camera.
- Parallel helper agents need their own scratch subfolders.

## Lessons from the first critic round (Adereso test, 15 s)

- **Don't start an overlay while the previous element is still leaving.** The chat sat empty under a fading logo for 1.1 s; start it after the exit.
- **Give readable UI text reading time:** about 0.3 s per word on screen, so keep bot or chat lines to ~6 words.
- **Make "who is this" the title, not subtext.** "Otro proveedor" as small grey text right after the brand logo made a muted viewer think the bad bot was the brand's.
- **Captions must end before a hide window's transition starts,** or the next line flashes for a few frames.
- **Fade overlays out completely before the camera or card moves.** A half-transparent card over a moving plate shows the footage through it.
- **Speaker card:** ~520×650 (about 48% of the width, top centre), with a slow push inside it (`crop` → `crop2`) so the face keeps growing while held. At 420 px wide, the face read as too small.
- **A closing line needs weight:** at least a 64 px pill (`--danger` or `--accent`), not a status subtitle.
- **Drift:** a combined drift in graphic scenes (y −48…−56 px plus scale 1.06 over the hold) took near-still time from 2.0 s to 0.0 s.

## Lessons from the blocks review (gallery critic)

- **Occluder transitions stay opaque while they grow.** Swap scenes behind the occluder, not around it.
- **Behind-the-speaker text must really overlap:** ~35% of the cap height behind the hair. At 10% it reads as sitting *on* the head.
- **Counters ease out and land on the spoken number;** a linear count stops dead.
- **Cards hug their content;** a wide card with left-aligned content reads as half empty.
- **Share left edges:** a phrase under a speaker card aligns with the card, and a headline aligns with the diagram's chips.
- **Space by structure:** a verdict 11 px under its chips after a 270 px link drop looked cramped; tighten the drop and give the verdict 40 px.
- **One line means one line:** shrink to fit rather than let a mark wrap alone.

## Talking-head checks for the critic (add to the SKILL.md prompt)

- Does any graphic or caption cover the face (the head keep-out) or leave the safe area?
- Do graphics land on their spoken words (compare with `words.js`)?
- Behind-the-speaker moments: does it read as behind? Is it readable? Any halo or misalignment?
- Transitions: any pop, jump, blank or doubled frame, collision, or abrupt start or stop?
- Is the speaker on screen enough? Anything dead or overloaded?
- The mute test.
