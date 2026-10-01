# Ad 1839128747462053: motion study

## Summary
Square 720×720, 30 s. A faceless voiceover ad: **no speaker at any point (0%).** Bright blue/lilac scenes take 39% of the time (0–4.3, 13.3–20.8), near-black UI scenes 61%. There are no hard cuts (scene>0.3 found 0); it is one continuous virtual camera.
Flow: glass "minutes" lens (0) → template dropdown (4.5) → icon hub (6.7) → wire-follow (8.5) → carousel (9.5) → portal to chat demo (12.9) → branch cards (17.2) → iris (20.7) → "24/7" ring (23.7) → logo and CTA (26.9).

## Pacing
- 19 beats: an average of **1.6 s** per beat, with a change every ~0.5–0.8 s.
- 75% of frames move (constant 1–2 px/f drift).
- Longest static stretch: end card, 1.4 s; mid-video holds 0.4–0.8 s.

## Typography
- **No VO captions.** All text is UI: neo-grotesk sans, sentence case, ~2.5% of frame height.
- **Word fill:** chat text is pre-set in grey and each word turns white in ≤3 f, **10–20 f after** it is spoken.
- "24/7" types on at ~3 f per character, starting +4 f after "never".
- Sync is loose elsewhere: the logo mark leads "11" by 16 f; one card lags its words by 2.7 s.

## Camera
No punch-ins; every move is smooth:
- Opening lens rises ~300 px (2 s ease-out), then recedes −27% over 3 s.
- Wire-follow tilt covers ~1 frame-height in 0.8 s, ease-in-out.
- A ring contracts from >720 to 270 px over 1.4 s, decelerating.
- Depth of field throughout: only the midground is sharp.

## Graphic mechanisms
1. **Occluder wipe, 4.10–4.47 (11 f).** A giant blurred pill sweeps past the camera; the scene swaps under it. Transfer: a huge blurred WhatsApp bubble hides the speaker-to-graphic cut.
2. **Stepping highlight, then fly-out, 4.50–6.63.** The highlight hops rows at 4/6/8/6 f, lands, holds 0.5 s. The exit is ease-in (2→52 px/f, +13% scale, blur, 25 f). Transfer: an inbox overlay that hops to the chat the speaker mentions.
3. **Swarm → hub → branches, 6.7–8.5.** Icons float up, one scales 2× into the hub, and a line grows and forks to each icon. Transfer: many customer chats converge on one agent.
4. **Accelerating carousel, 9.5–12.9.** Nodes scroll past a sphere at 7→33 px/f, crossing at 24→12→8-f intervals during a music break, then burst. Transfer: a use-case list that speeds up before a reveal.
5. **Orb portal, 12.93–13.40.** The orb lights in 1 f, then grows ×1.13–1.17 per frame (143→719 px in 12 f), next scene inside.
6. **Line-draw branch, 17.17–18.9.** A 1 px line draws in (6 f) and forks (8 f). Its tips become cards that widen (14 f) and type their text (0.9 s).
7. **Morph + flash, 19.6–20.3.** Two cards merge into one, which flashes teal for 8 f.
8. **Iris from anchor, 20.73–20.97.** A black disc grows from behind the card, 189→731 px in 3 f (ease-out, 6 f total). The card persists and restyles to dark.
9. **Ring + key phrase, 23.7–25.9.** The ring contracts in, "24/7" types on, and the ring then fills into an orb in 6 f.
10. **Bars crush → logo, 26.87–28.55.** Bars slide in from the edges in 16 f (13→65→6 px/f) and pinch the orb. A 0.5 s near-silent hold; on the hit the wordmark unfolds (8 f) and a dot grows into the CTA pill.

## Transitions
Every transition is object-driven (occluder, accelerating exit, wire-follow, portal, iris, ring): 5–25 f, alternating bright and dark, with the circle as a motif.

## Sound
- Loudness: −14.1 LUFS, LRA 3.6 LU.
- Music is a dark, sub-heavy electronic bed and carries the transitions:
  - the sub enters on the first wipe (4.03, +15 dB);
  - breaks before the demo (10.4–12.5, −20 LUFS);
  - a swell as the portal fills (13.3);
  - a swell that pre-laps the ring by 13 f;
  - near-silence 27.46–27.82, then a hit on the logo.
- SFX are sparse (one clear shimmer at 24.06 on "24/7").
- The voice sits 8–16 dB above the music in 300 Hz–3 kHz while the sub stays full: the music is carved around the voice, not ducked.

## Top 3 transferable mechanisms
1. **Orb portal / iris from an anchor.** Seamless speaker ↔ full-screen cutaways with measured curves; they can open beside the speaker's head or behind a background-removed speaker.
2. **Grey→white word fill.** One mechanism covers both the captions and the WhatsApp bubbles. Set the lag to 0–2 f; the ad's 10–20 f would read as out of sync on a face.
3. **Line-draw branch / wire-follow.** It draws Adereso's routing story (message → agent → resolved or handed to a human) and links overlays to graphics without cuts.

## Study files
- `study/overview_2fps_0-30s.png`
- `study/occluder-wipe_3.80-4.77s_30fps.png`
- `study/orb-portal-expand_12.80-13.97s_30fps.png`
- `study/chat-word-highlight_13.5-16.3s_10fps.png`
- `study/line-branch_card-morph_iris-wipe_17.0-21.1s.png`
