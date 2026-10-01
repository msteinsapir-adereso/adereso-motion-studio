#!/usr/bin/env bash
# Frame-accurate person cutout for a behind-the-speaker window (the person only, with alpha).
# Usage: scripts/th-cutout.sh assets/clip.mp4 <t0> <t1> assets/cutout-<name>.webm
# Cuts the exact source frames covering t0..t1, removes the background (~0.6 s/frame on an M1), and prints the
# <video> tag to paste inside #cam-inner, after #behind. Keep the id starting with "cutout" (blocks.behind checks it).
# Render with --fps equal to the source frame rate so the cutout stays frame-locked to the plate.
set -euo pipefail
clip="$1"; t0="$2"; t1="$3"; out="$4"
fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$clip")
read -r k0 k1 start dur < <(python3 -c "
from fractions import Fraction as F; import math
f = F('$fps'); k0 = math.ceil(F('$t0') * f); k1 = math.floor(F('$t1') * f)
print(k0, k1, float(k0 / f), float((k1 - k0 + 1) / f))")
seg="${out%.*}.seg.mp4"
ffmpeg -loglevel error -y -i "$clip" -vf "select='between(n\,$k0\,$k1)',setpts=N/($fps)/TB" -r "$fps" -an \
  -c:v libx264 -crf 8 -pix_fmt yuv420p "$seg"
npx --yes hyperframes@0.8.98 remove-background "$seg" -o "$out" --quality best >/dev/null 2>&1
rm -f "$seg"
id=$(basename "$out" .webm)
printf '<video id="%s" class="clip" src="%s" data-start="%.4f" data-duration="%.4f" muted playsinline></video>\n' "$id" "$out" "$start" "$dur"
echo "frames $k0-$k1 of $clip; render with --fps $fps"
