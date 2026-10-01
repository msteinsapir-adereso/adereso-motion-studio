# Talking-head template

Copy this folder into `videos/<name>/` per video, then follow `references/talking-head.md`.

- `lib/th.js`, `lib/th.css`: the engine. Camera (push, snap, lift), speaker-to-card, small captions and keyword pills are pure functions of time. It also handles word-based times (`th.at`), sound cues (`th.cue`, `th.finish`) and per-frame functions (`th.onTime`).
- `lib/blocks.js`, `lib/blocks.css`: the reviewed blocks (chat, phrase/headline, tag, pill, scene, diagram, stat, endcard, behind). See `BLOCKS.md`.
- `index.html`: the Adereso 15 s test built only from blocks. It's the starting point: replace `PLAN`, the block calls and the media, and keep the layer order and the last three lines.
- `blocks-gallery.jpg`: every block, one frame each.

Per-video files, made by the scripts:
- `words.js`, `zones.json` (`scripts/th-prep.sh`);
- `assets/cutout-*.webm` (`scripts/th-cutout.sh`);
- `assets/sfx/cues.json` (`scripts/th-cues.py`);
- `assets/mix.wav` (`scripts/th-mix.py`).

Layer order (bottom → top): `#stage-bg` → `#under` → `#card-shadow` → `#cam` (plate, `#behind`, cutouts) → `#card-frame` → `#over` (overlays, scenes) → `#veil` → `#kws` → `#caps`.
