# Build checklist

Every rule here is a defect that an independent critic or a paying client caught in an earlier project (see `gauntlet.md`, `quality-bar.md`, `case-study-alder.md`, `case-study-duo.md`). Those projects spent dozens of review rounds finding them. Apply the rules while building, and the one critic pass only has to catch what slipped through.

## Storyboard

- A first-time viewer with the sound off can say what the business does, and the one next action, by the end.
- Every claim is true, or the film is labelled "Concept film · AI-generated imagery". No invented testimonials, ratings, jobs, savings, warranties or confirmed appointments.
- Every beat has its own composition and a business job. Never two "heading above three cards" beats in a row.
- One persistent actor (a cursor, card, photo or shape) carries through the main sequence. Unrelated reveal after unrelated reveal reads as a slideshow.
- Every animated action produces a visible result: a click changes a state, a scan produces a finding.
- Keep imagery bright and clear for consumer and home-service buyers. Dark, moody openers were rejected.
- The CTA is readable at phone size for at least 1.5 s. The end card holds 1.5–2 s with a gentle drift.

## Layout and type

- Frame 0 is a finished composition, not a half-entered word.
- In feature beats, the lead subject fills 60–85% of the usable frame. No small card floating in a big empty field.
- One or two reading targets at a time.
- Lists and rows have identical row heights, shared left edges and equal gaps. Clients notice immediately.
- Headline, image and supporting rows share their left edges.
- All type sits inside title-safe (at least 5% margin). If the end card scales up, counter-scale its small print.
- Settled text passes WCAG AA. Text never sits over busy footage without a backing.
- Each tween targets exactly one element. A shared selector once put the wrong caption on a photo.
- An overlay on a parent with a slow scale push gets the same push, or it drifts (12 px in one film).

## Motion and transitions

- No motionless stretch over 0.6 s except the final CTA. Reading holds get a slow 3–5% push.
- Anything that starts from rest uses smootherstep or ease-in-out, never a cubic ease-out (it makes a one-frame pop). Stagger parts by at most 5 ms each.
- Readable landing, then a fast exit. Don't drift at a constant speed.
- On a wipe, the outgoing title leaves completely before the wipe and the incoming title enters after it; otherwise two titles splice into one word. Keep one wipe direction and one title position through a sequence.
- Text never moves through other text: fade out, then fade in at the destination.
- When content inside a card changes, crossfade it in place. No blank state in between.
- A carried object hands off at exact pixel coordinates: the last frame of scene A equals the first frame of scene B.
- No black or blank frames at scene changes. Crossfade the next scene in with a small scale settle.
- Use hard cuts only when subject, scale, direction or material match, and motion continues through the cut.
- Every state is a pure function of timeline time: no `requestAnimationFrame` loops, `Date.now()` or unseeded randomness.

## 3D (only if the film uses it)

- It explains something physical or spatial. Type and UI stay in HTML/SVG.
- Use stylized "architectural model" materials rather than fake photorealism.
- Camera pitch 35–55°, a minimum distance, no roll, never top-down on a textured plane (tiling shows and it reads as a flat slab).
- Measure the rendered background against the brand colour, because ACES tone mapping shifts it.
- No floating parts, gaps or visible texture tiling. Labels sit on the thing they name and are evenly spaced.
- Only one piece moves through the air at a time. A slow breathing move keeps holds alive.
- Headless Chrome renders `-apple-system` as Times. Bind fonts with `@font-face` to a local font file.

## Audio

- Music matches the buyer's customer, not "tech launch": warm and acoustic for home services, a tighter pulse for software. No vocals, risers, trailer hits, EDM drops or ukulele stock music.
- The music starts on the first beat, keeps a pulse under fast cuts, resolves on the logo and never dies before it. Add a 5 ms fade-in so the first sample doesn't click.
- One soft, short (under 0.8 s), rumble-free whoosh per real transition. No synthesized sweeps or ticks.
- UI sounds only on real actions (click, pin, check, confirm). Soften sounds that land within 0.15 s of each other (×0.6).
- Repeated sounds play at a consistent level.
- Master at about −16 LUFS (−14 for energetic pieces), true peak ≤ −1 dBFS.

## Talking head (only in that mode)

- Nothing covers the face (the head keep-out from `th-zones.py`) except a speaker card or a full cutaway that replaces the frame.
- All text and logos stay inside the platform safe area (Meta Reels ads: x 65–1015, y 269–1248 on 1080×1920).
- No graphics in a narrow column beside the face; lift the camera and use the band under the chin, or shrink the speaker to a card.
- Captions stay on one fixed line and switch off whenever on-screen type says the same words.
- Every graphic lands on its spoken word, 1–2 frames early. Nothing reads as late.
- Behind-the-speaker elements sit between the original wall and the cutout, overlap the head like a masthead, stay readable, and stay inside the cutout window.
- A new text never lands on a readable old one: the old one exits first, or a veil drops behind the new one.
- Brand names are spelled correctly in captions (fix the transcript with the glossary first).
