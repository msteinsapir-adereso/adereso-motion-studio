---
name: business-motion-film
description: Plan, build and check a short (15–30 s) commercial or explainer for a real business (home services, property, ecommerce, B2B software) with code-built motion (HTML/GSAP on HyperFrames), optional selective Three.js and optional AI footage, on a fixed time budget. Also adds premium motion graphics to an already-edited vertical talking-head video (zooms, captions and kinetic type, overlays, speaker-to-card, cutaways, graphics behind the speaker). Prevents known defects up front with a build checklist distilled from 28 launch films and dozens of past critic rounds, then runs one automated review pack and one independent critic pass. Use when asked to make a launch-style or SaaS-style video, business ad, explainer, sample reel or pitch video, or to review one. The full multi-round Gauntlet (references/full-workflow.md) is only for when the user asks for premium polish.
---

# Business motion film (lean)

Make a clean, professional 15–30 s film in one build pass, one review and one fix round.

The original kit reached its quality through dozens of critic rounds, and most of those rounds found the same kinds of defects again and again. Those defects are now rules in `references/build-checklist.md`. Prevent them while building instead of paying to find them later.

Paths below are relative to this skill's folder unless they start with the project root.

## Two modes

- **Code-built film** (no footage of a person): the workflow below.
- **Talking head** (an already-edited video of someone speaking, to which you add zooms, captions and kinetic type, overlays, a speaker card, cutaways or graphics behind the speaker): follow `references/talking-head.md` with the engine in `templates/talking-head/`. It uses the same budget and the same checklist; the one checkpoint is the timed edit plan.

## Budget (hard limits unless the user raises them)

| Item | Limit |
|---|---|
| User checkpoints | 1: the storyboard |
| Full renders | 2: a draft cut for review, then the final cut |
| Independent critics | 1, on the draft cut |
| Fix rounds | 1, covering blocking issues only |
| 3D scenes | At most 1, stylized, and only where it explains something physical |
| Music | 1 library track cut to picture, with no alternates |
| AI-generated shots | At most 2 attempts per shot, then replace it with a code-built shot |

Snapshots (`npx hyperframes snapshot`) take seconds, so use them freely while building. Full renders and critics are where the time goes.

## Non-negotiables

1. **Truth.** Never invent testimonials, ratings, completed jobs, savings, warranties or confirmed appointments. A concept film says so ("Fictional brand · Concept film · AI-generated imagery").
2. **Business purpose on mute.** A first-time viewer can say what the business does and what to do next, with the sound off.
3. **Builder ≠ judge.** The one critic is a fresh agent that sees only the render's review pack, the brief and the storyboard.
4. **Deterministic motion.** Every state is a pure function of timeline time, so any frame can be snapshotted on its own.

## Workflow

### 1. Brief
Write `BRIEF.md`, keeping it short:
- the business, the buyer, and the viewer's problem;
- the single CTA;
- what is provably true, and what must never be claimed;
- real assets available;
- length, aspect ratio, palette and typeface.

With no real assets, the film is a labelled concept.

### 2. Storyboard, then get the user's OK (the one checkpoint)
Read `references/motion-grammar.md`. Only open `references/launch-film-notes.md` if you are stuck for a mechanism. Write one table with these columns: time, what's on screen, the beat's business job, and the transition out (including which object carries across).
- Use about one composition per 2–2.5 s, and vary the scale: macro, wide, overhead, UI close-up, type impact.
- Pick at most 3 mechanisms from the catalog and reuse them. Name 1–2 signature transformations.
- Check the table against the Storyboard section of `references/build-checklist.md`, then show it to the user and wait for OK. Direction problems like "too basic" or the wrong mood are the most expensive thing to discover after a render.

### 3. Build with the checklist open
- If the project root has a `blocks/` folder, check it first for proven scenes to reuse.
- Use one root timeline, with each scene as a sub-composition.
- After finishing each scene, snapshot its landing, its midpoint and both transition seams (`npx hyperframes snapshot . --at …`). Check them against `references/build-checklist.md` and fix problems before moving on.
- For 3D, build it first in a component lab: copy `templates/component-lab.html`, `templates/projected-overlays.js` and `templates/example-scene.js` (a working exploded-layers scene with projected callouts; see `references/three-js-patterns.md`). Snapshot it, then integrate it. There is no separate component critic.
- Finish with `npx hyperframes check . --at-transitions` and fix every error. It catches text collisions at transition seams, overflow and contrast failures at no model cost.

### 4. Audio (one pass, no listening rounds)
Follow the Audio section of `references/build-checklist.md`.
- Screen sound-effect candidates with `scripts/sfx-candidates.py` and drop every REJECT. Soften a library sound with `scripts/soften-sfx.sh` if needed.
- Solve the effect levels once with `scripts/solve-sfx-gains.py` against the music track. No effect peaks above the music's local peak.
- Only read `references/audio.md` if something specific goes wrong.

### 5. Draft render and review pack (machines first)
```sh
npx hyperframes render . --quality draft --fps 30 -o renders/draft.mp4
<skill>/scripts/review-pack.sh renders/draft.mp4 review/draft <transition times from the storyboard, comma-separated>
```
The pack writes `measurements.txt` (frozen stretches, black frames, loudness), `overview.jpg` (1 frame/s), 8-second detail sheets (0.5 s apart) and a 7-frame strip around every transition. It costs no model tokens.

### 6. One independent critic
Spawn one fresh agent that did not build the film. Give it the prompt below and nothing else, not your reasoning and not a list of what you think works.

```
You are an independent critic; you did not build this video. Judge only what you can see and measure.

Film: <duration>s, <what the business is and what the film sells>. CTA: <cta>.
Review pack: <path to review/draft>. Brief: <path to BRIEF.md>. Storyboard: <path>.
Checklist: <skill>/references/build-checklist.md

Start with measurements.txt, overview.jpg and the transition-*.jpg strips. Open a detail sheet only for a
section you question. Extract at most 5 extra frames with ffmpeg, and only if something is ambiguous.
Also do the mute test: could a first-time viewer say what the business does and the one next action?

Write at most 300 words to <path to review/draft/critic.md>:
- Verdict: SHIP, FIX, or REJECT. REJECT means the direction is wrong, not that it needs polish.
- Up to 5 blocking issues, ranked by impact: timestamp, what is wrong, and a concrete fix.
- Up to 3 nice-to-haves, marked optional.
Ignore sub-frame and cosmetic issues.
```

### 7. One fix round, then ship
- Fix the critic's blocking items and every machine flag (a hold over 0.6 s outside the end card, black frames, loudness off target). Fix nothing else.
- **REJECT:** stop and show the user the critic's summary before rebuilding. Don't silently start over.
- Render the final cut (`--quality delivery --fps 60`) and run the review pack again. Confirm the flagged items are gone by checking their strips and the measurements yourself. There is no second critic.
- Ship even if nice-to-haves remain, and list them.

### 8. Deliver
Deliver the final MP4, `overview.jpg`, `BRIEF.md` with the storyboard, and the `review/` folder (the critic report plus draft and final measurements). Add a short `NOTES.md` covering what was fixed, known limits, and the nice-to-haves that were skipped. If a scene is worth reusing, copy it into `blocks/<name>/` at the project root with a one-line note.

## When to go beyond lean

Go beyond lean only when the user asks ("premium", "polish", "go harder") or a client rejects a specific part. Then escalate **only that part** with `references/full-workflow.md`: for example, a component Gauntlet for one 3D scene (`references/gauntlet.md`, `references/critic-prompts.md`), or audio rounds (`references/audio.md`). A 3D product that must move like the real device (`references/product-hero-realism.md`) is premium work; flag the cost before starting.

## Other references (read only if needed)

| Need | File |
|---|---|
| Pricing, verticals or a pilot offer | `references/business-offers.md` |
| Measured ship criteria in full | `references/quality-bar.md` |
| Worked examples | `references/case-study-alder.md` (calm service film), `references/case-study-duo.md` (Three.js product film) |
