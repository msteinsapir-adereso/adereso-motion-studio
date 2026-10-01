#!/usr/bin/env bash
# One-command prep for a talking-head video folder. Run inside videos/<name>/ with the clip in assets/.
# Usage: scripts/th-prep.sh assets/clip.mp4 [language=es] [glossary=../../brand/glossary.json]
# Does: word-level transcript → brand glossary fixes → words.json + words.js → th-zones.py (head keep-out, safe area,
# free regions, focus) → voice loudness → the standard effects (whoosh, pop, click) into assets/sfx/.
# Prints the numbered word list: that's what the edit plan references ({w: index} or {word: 'text'}).
set -euo pipefail
clip="$1"; lang="${2:-es}"; gl="${3:-../../brand/glossary.json}"
here="$(cd "$(dirname "$0")" && pwd)"

echo "== transcript"
npx --yes hyperframes@0.8.98 transcribe "$clip" --dir . --language "$lang" >/dev/null 2>&1
python3 - "$gl" <<'EOF'
import json, os, re, sys
gl = json.load(open(sys.argv[1])) if os.path.exists(sys.argv[1]) else {}
out = []
for x in json.load(open('transcript.json')):
    t = x['text']
    for a, b in gl.items(): t = re.sub(r'\b' + re.escape(a) + r'\b', b, t)
    out.append({'t': t, 's': round(x['start'], 2), 'e': round(x['end'], 2)})
json.dump(out, open('words.json', 'w'), ensure_ascii=False)
open('words.js', 'w').write('window.WORDS = ' + json.dumps(out, ensure_ascii=False) + ';\n')
print(f'{len(out)} words, glossary {len(gl)} rules ({sys.argv[1] if gl else "none found"})')
print(' '.join(f'{i}:{o["t"]}@{o["s"]}' for i, o in enumerate(out)))
EOF

echo "== zones"
"$here/th-zones.py" "$clip" zones.json
python3 -c "import json; z=json.load(open('zones.json')); h=z['head_raw']; print('focus', [round((h[0]+h[2])/2), round((h[1]+h[3])/2)])"

echo "== voice loudness"
"$here/loudness.sh" "$clip" | sed -n 1,3p

echo "== effects"
sfx=$(ls -d ~/.npm/_npx/*/node_modules/hyperframes/dist/skills/media-use/audio/assets/sfx 2>/dev/null | head -1 || true)
mkdir -p assets/sfx
if [ -n "$sfx" ]; then
  cp "$sfx/whoosh.mp3" "$sfx/pop.mp3" "$sfx/CREDITS.md" assets/sfx/ && cp "$sfx/click-soft.mp3" assets/sfx/click.mp3
  echo "whoosh, pop, click → assets/sfx (Pixabay licence, see CREDITS.md)"
else
  echo "HyperFrames effects not in the npx cache; run any npx hyperframes command once, then re-run"
fi
