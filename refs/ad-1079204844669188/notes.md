# Ad 1079204844669188 (ElevenLabs): motion study

## Summary
- 1280x720, 36.2 s, 30 fps. A presenter plus product-UI graphics in 10 shots, joined by hard cuts at 1.73, 4.47, 8.67, 12.97, 14.63, 23.27, 29.43 and 34.07.
- Order: globe hook, orb + code, logo, full-frame speaker (8.7–13.0), CRM panel, orb morph chain, voice picker, full-screen call demo without speaker (23.3–29.4), chat thread, speaker end card.
- Screen time: speaker as a PiP over graphics 65%, speaker full-frame 18%, graphics only 17%.
- PiP: a fixed rounded card at bottom right, 265x298 px (21% of width). In the CRM shot it moves left and grows to 306x368. It never animates; it is only re-laid out on cuts.

## Pacing
- Average shot 3.6 s (1.7–6.2). Graphic event every 1.2 s, caption change every 0.73 s: something changes about every 0.5 s.
- Longest static stretch: the logo hold, 6.7–8.6 s (2.0 s).
- Cuts come 0–6 frames (average about 3) before the new sentence.

## Typography and captions
- One style: heavy black uppercase sans in a white rounded pill, bottom centre. Pill 6.8% of frame height, cap height 3.2%, bottom margin 36 px. On white scenes the pill vanishes into the background.
- 41 chunks of 1–4 words (average 2.3), swapped by hard cut. No entrance animation and no word highlight. Sync: median 1-frame lead, 80% within ±4 frames.
- **No big kinetic type at all.** Graphics carry the emphasis. Our key-phrase type needs another reference.
- In the call UI and chat bubbles, words reveal one by one: each appears dim, then goes solid.

## Zooms and camera
- Speaker: linear slow push from 1.00 to 1.115 over 3.2 s. Then a **7-frame snap from 1.115 to 1.24** with an S-curve (per-frame +0.5, 1, 1.5, 3.5, 3, 2, 1%). It starts on "they're" and lands before "smart".
- End card: punch from 1.00 to 1.095 in 5 frames, then a slow push to 1.20 (about 5%/s).
- Opening: a planet crash-zooms 3.4× in 8 frames (expo-out) while the background flips black to white.

## Graphic mechanisms
1. **Orb and code (1.7–4.5).** Code fades in over 3 frames exactly on "ElevenLabs", drifting with parallax behind a swirling orb. Transfer: WhatsApp message payloads behind an Adereso orb.
2. **Logo (4.5–6.7).** Bars shrink 3.5× over 1.4 s (expo-out), then split with an ease-in (the gap grows 1→20 px per frame over 9 frames). The wordmark types out in 6 frames while sliding to centre.
3. **Panel rise (13.07).** A UI panel rises beside the PiP with motion blur: 514 px in 21 frames, expo-out, 73% of the travel in the first 8 frames. Transfer: a WhatsApp inbox or order panel.
4. **Absorb and recolour (14.6–16.7).** A "Server" pill slides in over 3 frames, becomes a circle and slides into the orb. The overlap recolours the orb like a lens (17 frames), with a background bloom, on "personalize". Transfer: "Pedidos"/"Historial" chips get absorbed.
5. **Orb becomes an avatar (17.2–18.3).** The orb shrinks 7× along a swooping arc (core move 14 frames) and becomes a chat bubble's avatar. The bubble sharpens from blur over 5 frames.
6. **Card becomes an orb (20.0–20.7).** A UI card narrows as its corner radius grows and its contents blur (6 frames), becomes a circle (3 frames), then fills with a gradient (5 frames).
7. **Picker (20.6–23.2).** A name wheel where each 4-frame step recolours the orb. Holds of 0.65 s shrink to 5 steps in 0.6 s, with a cursor. Transfer: a tone or language picker.
8. **Call demo (23.3–29.4).** A full-screen portrait phone UI with a transcript streaming in word by word.
9. **Chat thread (29.4–34.1).** Each bubble inflates from a 15 px pill to 443 px in 15 frames (expo-out). Its avatar pops 3 frames later, the text types in, and the stack pushes up about 100 px.
10. **End logo (34.07).** A spring: 0 → 124% → 97% → 100% in 9 frames, with horizontal motion blur.

## Transitions
Only hard cuts. Continuity comes from object morphs inside scenes (pill → circle → orb → avatar). Speaker/graphics switches are layout changes on a cut.

## Sound
- -14.5 LUFS integrated. The music is a low-end pulse (about 80 BPM) plus a synth pad, sitting about 8–12 dB under the voice for the whole ad.
- SFX are sparse:
  - a riser into 4.47
  - a two-tone "call connected" chime at 23.27 (553 + 830 Hz)
  - a ~2.6 kHz ding on the end logo
  - faint ticks during the fast picker scroll
- Captions and most morphs are silent.

## Top 3 transferable mechanisms
1. **One hero object that morphs across beats (4–6).** Flow without transitions, using only scale, radius, blur and colour.
2. **Chat-thread assembly plus streaming text (8–9).** Literally Adereso's product.
3. **Speaker zoom grammar plus side panel (3).** A slow push, a 7-frame snap of +11% on the key word, and an expo-out panel beside the PiP.

## Study files
In `study/`:
- `overview_contact_2fps_0-36s.jpg`
- `caption_chunks_at_each_change.png`
- `logo_bars-split-type-reveal_6.00-6.70s.jpg`
- `crm-panel-rise-beside-pip_12.90-13.90s.jpg`
- `morphs_card-to-orb_19.95s_and_orb-to-chat-avatar_17.6s.jpg`
