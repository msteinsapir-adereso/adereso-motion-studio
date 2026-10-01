# Brief: Adereso talking-head test (15 s)

**Business:** Adereso (adereso.ai), AI agents for sales and support on WhatsApp for e-commerce (LatAm, Spanish).
**Source:** `assets/C0015.mp4`, 1080×1920, 29.97 fps, 15.35 s, one continuous static shot of a founder talking. It's a 15 s clip from a longer ad, so it ends mid-story on the problem.
**What he says:** "Muchos de los e-commerce con los que trabajamos hoy llegaron a Adereso después de haber probado otro proveedor de agentes de IA para WhatsApp. A muchos les prometieron una IA que iba a resolver todo y iba a ayudarlos a vender mucho más. Pero no estaba conectado al stock, los precios ni a los pedidos de su tienda." (Word timings: `words.json`.)
**Goal of this test:** prove that code-built motion graphics on a real speaker meet the kit's motion quality bar: smooth transitions, no pops, no collisions, no dead holds, graphics landing on the spoken words.

**Style decisions (from the client):**
- Vertical 9:16 for Meta Reels ads.
- Captions: small, with key phrases turning into big kinetic type.
- All four graphic relationships: overlays beside the speaker, the speaker shrinking to a card, full-screen cutaways, and graphics behind the speaker.
- Something new every 4–6 s; the speaker carries the rest.
- Brand: dark `#0C0C0D`, white Outfit, yellow `#FFD540` accent, green `#52CE5E`.

**Truth:** the "other provider" is generic and never named. The chat shown is illustrative. No numbers or results are claimed.
**Safe area:** Meta Reels ads, x 65–1015, y 269–1248 (text and logos stay inside). The speaker's head keep-out is in `zones.json`.

## Plan

| Time | Style | Beat |
|---|---|---|
| 0–3.6 | Speaker + behind | Slow push; "e-commerce" yellow pill; 7-frame snap zoom on "llegaron"; the Adereso logo rises from behind his head (2.86–3.9, person cut out on 2.60–4.10) |
| 3.5–6.4 | Overlay | Camera lifts him up; a chat card rises under his chin. A customer asks for a size, the other provider's bot gives a generic reply; a WhatsApp badge on "WhatsApp" |
| 6.45–11.2 | Speaker card | He shrinks to a card top-right. "Les prometieron", then "Una IA que resuelve todo ✓", pushed out by "Vender mucho más ✓" with a rising line |
| 11.2–15.35 | Full cutaway | Dark veil, then a "Pero" pill flies through the camera into a full-screen scene. "No estaba conectado a:" and an agent node; Stock / Precios / Pedidos connect and each connection breaks on its word; "Sin conexión a tu tienda" on "tienda" |

**Audio in this draft:** the original voice only. Music and effects are not added yet, so don't judge the mix beyond the voice level.
