# Adereso motion studio

A Claude Code setup for adding premium motion graphics to vertical talking-head ads (9:16, Meta Reels):
- zooms;
- captions and kinetic type;
- overlays;
- the speaker shrinking to a card;
- full-screen cutaways;
- graphics behind the speaker.

Everything is code-built and rendered with HyperFrames, on a fixed time budget, with an independent AI critic checking each video before it ships.

It started from the open-source [motion-video-kit](https://github.com/echris6/motion-video-kit) and was extended with:
- a lean workflow;
- a talking-head mode;
- a library of reviewed graphic blocks;
- the Adereso brand kit.

## Set up (once, ~10 minutes)

1. **Clone** and open a terminal in the folder:
   ```bash
   git clone https://github.com/msteinsapir-adereso/adereso-motion-studio.git && cd adereso-motion-studio
   ```
2. **Install the tools** (macOS with Homebrew):
   ```bash
   brew install ffmpeg node whisper-cpp && python3 -m pip install --user numpy scipy pillow
   ```
3. **Check everything.** The first run downloads the HyperFrames renderer and its headless Chrome:
   ```bash
   ./setup-check.sh
   ```
4. **Render the example** to confirm it works end to end. You should get the same 15 s video as `videos/adereso-c0015-blocks`:
   ```bash
   cd videos/adereso-c0015-blocks && npx hyperframes@0.8.98 render . --quality draft --fps 30 -o renders/check.mp4
   ```
5. **Open Claude Code in this folder.** The skill (`.claude/skills/business-motion-film/`) and the project rules (`CLAUDE.md`) load automatically, but only inside this folder.

## Make a video

Put your already-edited vertical clip in the folder, then ask Claude, for example:

> /business-motion-film talking head: make a video from founder-q4.mp4, CTA "Hablar con un experto"

What happens:
1. Claude creates `videos/<name>/` and runs the prep (transcript with brand names fixed, where the speaker is, voice level).
2. **Claude shows you a timed plan with 2–3 style frames, and waits for your OK.** This is the cheapest moment to change direction.
3. Claude builds it from blocks, renders a draft, gets one independent critic review, fixes the blocking issues once, and renders the final.
4. You get `renders/final.mp4`, the critic's report and `NOTES.md` (what was measured, known limits).
   **Listen to it once on a phone speaker:** nobody else has.

Rendering is ~45 s per 15 s of video on an M1. Close heavy apps on 8 GB machines.

## What's where

| Path | What |
|---|---|
| `.claude/skills/business-motion-film/` | The skill. `SKILL.md` is the lean workflow; `references/talking-head.md` is the talking-head playbook; `references/build-checklist.md` lists the rules |
| `…/templates/talking-head/` | The engine plus the blocks (`BLOCKS.md` and `blocks-gallery.jpg` catalog them), and the example to copy for each video |
| `…/scripts/` | `th-prep.sh`, `th-cutout.sh`, `th-cues.py`, `th-mix.py`, `review-pack.sh`, and the original kit's measurement scripts |
| `brand/` | Adereso colours, font (Outfit, OFL), logo, transcription glossary |
| `refs/` | Measured notes on the three reference ads the style is based on |
| `videos/adereso-c0015-blocks/` | Worked example: the approved 15 s test, built only from blocks |
| `videos/_gallery/` | Test bench for blocks (sample content, not for publishing) |
| `CLAUDE.md` | Project rules Claude follows here (which skill to use, the budget, the asset rules) |

## Rules that matter

- **Lean budget:** one plan checkpoint, two renders, one critic, one fix round. Ask explicitly for "premium" if you want more rounds on one part.
- **Truth:** no invented numbers, testimonials or results. Stats must be verified; competitors stay unnamed.
- **Music:** none is bundled. Claude asks before downloading a track. Once approved, tracks should go in `brand/music/` and be committed.
- **Sound effects:** the HyperFrames bundled set (Pixabay licence, commercial use allowed), applied automatically by the blocks.

## Licenses

- **Code, scripts, templates and docs:** MIT (`LICENSE`).
- **Not covered by MIT:** the Adereso name, logo and brand assets, and the example footage in `videos/` (© Adereso, included to demonstrate the system).
- **Third-party material:** the original kit (MIT), the Outfit font (OFL) and the sound effects, which aren't redistributed here. See `THIRD_PARTY_NOTICES.md`.

## Changing the system

- **New graphic needed?** Build it as a block in `videos/_gallery/`, render it, and get a critic review. Add it to `BLOCKS.md` and the gallery only after a KEEP. Open a pull request so the team sees the change.
- **Lessons from a client or critic** go into `references/talking-head.md` ("Lessons" sections) or `build-checklist.md`, so the next video gets them for free.
- **Updating from the original kit:** clone it as `motion-video-kit/` in this folder, then follow the update command in `CLAUDE.md` (it preserves our local changes).
- **Your own videos:** commit their source (`index.html`, `words.js`, `zones.json`, `BRIEF.md`, `NOTES.md`). `.gitignore` keeps footage and renders out, so share those through Drive.
