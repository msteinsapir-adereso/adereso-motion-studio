# Motion Film Suelto

Video work in this folder uses the **business-motion-film** skill (`.claude/skills/business-motion-film/`, from github.com/echris6/motion-video-kit) as the only playbook. Do not route through the global motion-film, saas-motion-video, motion-broll, media-use or other video-workflow skills here; the user wants this kit's approach on its own. The HyperFrames CLI is fine to use as the renderer (`npx hyperframes@0.8.98 ...`), and its bundled Pixabay sound effects are fine to use.

The installed `SKILL.md` is a **lean, time-budgeted** rewrite (1 checkpoint, 2 renders, 1 critic, 1 fix round). The user can't afford open-ended polish loops; stick to the budget unless they explicitly ask for premium. The original workflow is kept as `references/full-workflow.md` for escalating a single part.

**Talking-head mode** (the user's main use): vertical 9:16 Meta Reels ads for Adereso, from already-edited speaker footage; keyword kinetic type; all four graphic styles; code-built graphics only; voice + music + sparse effects. Follow `references/talking-head.md` and start from `templates/talking-head/`. The worked example is `videos/adereso-c0015-blocks/` (the approved 15 s test, built only from blocks); new videos go in `videos/<name>/`. Team setup and usage: `README.md`; machine check: `./setup-check.sh`.

Brand: `brand/brand.md` (Adereso tokens, Outfit font, logo, transcription glossary). Reference ads the user likes, with measured notes: `refs/*/notes.md`.

Local additions (not upstream): `SKILL.md` (lean), `references/build-checklist.md`, `references/full-workflow.md` (copy of upstream SKILL.md), `references/talking-head.md`, `scripts/review-pack.sh`, `scripts/th-zones.py`, `scripts/th-mix.py`, `templates/example-scene.js`, `templates/talking-head/`.

- Upstream clone: `motion-video-kit/`. To update without losing the local versions:
  `git -C motion-video-kit pull && rsync -a --exclude SKILL.md motion-video-kit/business-motion-film/ .claude/skills/business-motion-film/ && cp motion-video-kit/business-motion-film/SKILL.md .claude/skills/business-motion-film/references/full-workflow.md`
  Then check whether upstream changes add lessons that belong in `references/build-checklist.md`.
- Working component-lab example: `lab-demo/`.
- `scripts/offline-mix.py` is film-specific (hardcoded 40 s, cut times, project layout); for talking heads use `scripts/th-mix.py`.
- Music needs a download (none is bundled): ask the user before downloading any track.

## Talking-head toolkit (built after the first video)

- Blocks library: `templates/talking-head/BLOCKS.md` (chat, phrase/headline, tag, pill, scene, diagram, stat, endcard, behind). Validated by rebuilding the approved Adereso video from blocks only (`videos/adereso-c0015-blocks/`, which matches the approved final), plus a critic-reviewed gallery (`videos/_gallery/`).
- Scripts: `th-prep.sh` (transcript + glossary + zones + loudness + effects), `th-cutout.sh` (frame-accurate cutout), `th-cues.py` (sound cues from the blocks), `th-mix.py`.
- Brand glossary for transcripts: `brand/glossary.json`.

## Backlog (not built yet; offer when relevant)

- Assets to request from the user: SVG logo, real Adereso product UI screenshots/recordings (more truthful than invented UI), and 3–5 approved music tracks in `brand/music/`.
- New blocks as needs appear (for example a list staircase, a before/after split, a product screenshot frame). Build them in `videos/_gallery/`, get a critic KEEP, then add them to `BLOCKS.md`.
