# Gallery critique

## Per block
- **STAT: FIX.** Linear count, dead stop at 1.5 s. Text fills only the left half of a 906 px card.
- **BEHIND: FIX.** Hair covers only 12 of 120 px of cap height; the word sits on his head. A shadow cloud shows alone at 2.97–3.10 s.
- **CARD + TAG: KEEP.** Smooth shrink, legible tag.
- **PHRASE: FIX.** Left edge x 92; the card is centred (280–800).
- **VEIL: KEEP.** Clean blur and dim.
- **PILL: FIX.** Good slam, but the fly-through peaks as a khaki bar (#8A772E, 7.67 s) and never fills the frame.
- **HEADLINE: KEEP.** Crisp mask rise.
- **DIAGRAM + VERDICT: FIX.** 11 px between the chips (bottom 1127) and the verdict (top 1138), against a 270 px hub drop.
- **END CARD: KEEP.** On-brand CTA, readable 1.5 s.

## Blocking
1. **7.55–7.77 s, PILL.** Opacity drops while it scales, so the pill turns muddy. Fix: opacity stays 1; scale 1 to 12 over 0.25 s with `power3.in` so yellow fills the frame for 2 frames, then a 0.1 s fade to the scene. Headline starts at 7.75 s or later.
2. **2.97–4.4 s, BEHIND.** Word is 750 px wide, baseline on the hairline. Fix: width about 900 px (cap about 150 px); baseline at head top + 0.35 × cap (about y 545). Make the halo a child of the word (shared opacity tween) or use `text-shadow`.
3. **9.35–10 s, DIAGRAM.** Cut the link drop by about 70 px (chips at about y 900–1055). Verdict top = chips bottom + 40 px. Start the verdict at least 0.15 s after the last check (now 1 frame early).
4. **0.72–1.5 s, STAT.** Counter `power3.out` over 0.8 s (snap 1), so the last 4 points take about 0.25 s. Card hugs content (padding 48/56 px). Source line at least 28 px (now about 24 px).
5. **5.0–7.2 s, PHRASE.** Align it to the card's left edge (x 280), or centre both. About 20 px more gap below the tag (972 to 1010).

## Optional
- **10.10–10.17 s:** the logo lands at about 80% opacity on top of the fading "Agente Adereso" (doubled text). Finish the fade before the logo starts.
- Headline edge x 78 vs chips x 92: share one edge.
- End card: scale the logo (496 px) to about 600 px, the CTA's width.
