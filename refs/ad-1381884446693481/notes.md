# Ad 1381884446693481: motion study (Superside report ad)

**Summary.** 720×1280, 57.5 s, one presenter. Speaker 0–9.0; PiP over report UI 9.3–11.6; collage + counter 11.6–15.4; logo; kinetic type 16.6–20.65; speaker (logos behind from 25.2); document scroll 27.06–33.07; speaker; stat cards 36.84–41.3; kinetic type; speaker 43.91–50.25; end card. Body (0–50.25): speaker full-frame 51%, PiP 5%, graphics only 44%.

**Pacing.** 13 segments, mean 3.9 s. About 45 visual events in 50 s (one per 1.1 s), unevenly spread: a word every 0.2–0.6 s in type sections; speaker sections only swap captions (mean 1.2 s, 2–6 words) and zoom. Longest static stretch: end card, 6.9 s (1.8 s in the body).

**Captions.** Small: sentence-case regular grotesk, white, on a solid brand-green box (#2F5048) sized to the text. Font ≈2.3% of frame height; bottom edge fixed at 79.8% of height, and 2-line captions grow upward. Hard 1-frame swaps, 0–5 f before the word. **They turn off whenever on-screen type says the words** (10.5–11.6, 12.6–20.3, 36.8–43.7) and return 5–9 f before the cut back to the speaker.
Big type: light grotesk connectives (≈7.7% of frame height) plus a serif-italic key word at ~2× ("real", "shaved off", "costs"). The block spans 88% of the width, centred at 45–50% of height. Pink #F9A3EB on charcoal or blue #A7D6FC on green, swapped per phrase. Words pop in at full opacity, existing lines reflow (10–20 px, ease-out 5–8 f), and the block keeps drifting. Phrase change is a vertical push: the old line exits with ease-in over 6–8 f, the new one enters from below with ease-out over 10–12 f. Sync: −0.3…+0.2 s from the spoken word (median −0.05 s). "didn't" gets a 6-f strikethrough.

**Zooms.** (1) Breathing pull-out: every return to the speaker cuts into a 1.12× crop that eases to 1.0 over 2.4–3.8 s (0, 20.65, 33.1, 43.9). (2) Punch-in staircase on the list "Use more AI / Ship faster / Spend less": 3 hard cuts, +10% each (to 1.33×), within ±0.1 s of each item. (3) Punch-out cut (−11%) at 47.78, then a +6% ease-in push into the end card.

**Graphic mechanisms**
1. **Speaker→PiP, 9.34.** Video scales to 44.7% width, anchored top-right, in 44 f. Asymmetric ease-in-out: velocity peaks at f12 and 75% of travel is done by 45% of the time (≈cubic-bezier(.55,0,.15,1)). Behind it the UI builds with 3–5 f staggers (toolbar slides in, masked title rises ~10 f). → Speaker becomes a top card while a WhatsApp chat builds below.
2. **Tile collage + counter, 11.58.** ~10 rounded photos fly in with motion blur (91% covered in 19 f). They part radially (central void 11%→79% in 26 f, ease-out). The counter starts inside the opening and counts linearly to 5,000+ in 12 f; label words stack beneath, ~8 f before they are spoken. → Real chats/products, then "3,000 conversaciones/día".
3. **Logos behind speaker, 25.2.** 4 rows of white logos (12% pitch) fade in over 3 f behind the matted person, rows drifting in alternate directions (~30 px/s). → Client logos or chat bubbles behind the speaker.
4. **Sheet slide-over, 27.06.** A long page rises over the speaker (covers in 5 f, motion blur) and decelerates over 10 f to a constant scroll (42% of frame height/s). After 5 s it accelerates off the top (13 f), revealing the speaker. → A scrolling WhatsApp conversation.
5. **Stat cards, 36.84.** In a vertical photo stack, a pastel card opens from its centre line (0→42% of frame height; 90% in 15 f, expo-out). Its number counts up linearly (12–18 f) and lands on the spoken number (37.44 vs "40%" at 37.40). The stack then whips up one slot in 6 f. → KPI cards ("+38% ventas").
6. **Whip pan, 41.2.** The canvas pans left over 30 f (14 f ease-in, 16 f ease-out). Peak velocity lands on the empty gap between scenes, replacing a cut.
7. **End card, 50.25.** Hard cut; CTA pill scales in after 10 f.

**Transitions.** Seven hard cuts on sentence boundaries; the rest are layer moves (PiP shrink, tile cover, sheet over/off, whip pan). No dissolves.

**Sound.** Voice-only mix: no measurable music bed under speech (pauses are room tone, no persistent tonal peaks) and no SFX spike at any of the 15 cut/graphic events. After the last word a soft pad with a descending glide plays at ≈−49 dB, ~30 dB under the voice.

**Top 3 transferable**
1. **Caption/type hand-off.** Boxed captions run by default and switch off when a key phrase becomes two-font kinetic type (pop, reflow, push).
2. **Breathing zoom + list staircase.** A 1.12× crop that eases out after each cutaway, plus +10% cuts per list item.
3. **PiP shrink into a UI build + count-ups landing on the spoken number.** Product (chat, KPIs) takes over while the face stays visible.

**Study files** (`study/`): `contact_sheet_2fps_0-57.5s_10cols_0.5s_per_tile.png`, `speaker_shrinks_to_pip_card_report_ui_9.0-11.0s.png`, `kinetic_type_word_build_and_chunk_push_16.5-20.8s.png`, `logos_behind_speaker_then_doc_slide_over_24.5-28.0s.png`, `stat_card_feed_countup_to_whip_pan_type_36.8-44.0s.png`
