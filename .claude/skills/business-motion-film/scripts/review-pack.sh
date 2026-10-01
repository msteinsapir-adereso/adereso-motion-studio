#!/usr/bin/env bash
# Review pack: everything a critic needs from one render, produced by machines in one command.
# Usage: scripts/review-pack.sh film.mp4 outdir [transition_times, e.g. 2.75,6.05,10.4]
# Without transition times, cuts are auto-detected (hard cuts only; pass wipe/morph times explicitly).
# Writes to outdir:
#   measurements.txt              frozen stretches, black frames, loudness
#   overview.jpg                  whole film, 1 frame per second (6 per row)
#   sheet-<start>-<end>s.jpg      detail sheets, 4x4 frames 0.5 s apart, left to right, top to bottom
#   transition-<t>s.jpg           7 frames from t-0.3 to t+0.3 s, 0.1 s apart
set -euo pipefail
f="$1"; o="$2"; trans="${3:-}"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$o"; rm -f "$o"/overview.jpg "$o"/sheet-*.jpg "$o"/transition-*.jpg
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
vinfo=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 "$f")
audio=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$f" | head -1)

if [ -z "$trans" ]; then
  trans=$(ffmpeg -hide_banner -i "$f" -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 \
    | { grep -o "pts_time:[0-9.]*" || true; } | cut -d: -f2 | awk '{printf "%s%.2f", (NR>1?",":""), $1}' | cut -d, -f1-12)
  auto=" (auto-detected hard cuts)"
else auto=""; fi

{
  echo "file: $f"
  echo "duration: ${dur}s   video (w,h,fps): $vinfo"
  echo "transitions${auto}: ${trans:-none}"
  echo
  echo "== Frozen stretches (bar: about 1 s total per 30 s, no single hold over 0.6 s except the end card)"
  "$here/frozen-time.sh" "$f" | awk '
    function flush(){ if(s!=""){ d=p-s+0.1; printf "  %.1f-%.1fs (%.1fs)%s\n", s, p, d, (d>0.6?"  <- over 0.6 s":""); s="" } }
    NR==1{ n=split($0,a," "); for(i=1;i<=n;i++){ t=a[i]+0; if(s!="" && t-p>0.15) flush(); if(s=="") s=t; p=t } flush() }
    NR==2{ print "  " $0 }'
  echo
  echo "== Black frames (a problem unless the stage is meant to be dark)"
  ffmpeg -hide_banner -i "$f" -vf "blackdetect=d=0.03:pix_th=0.08" -an -f null - 2>&1 \
    | grep -o "black_start:[0-9.]* black_end:[0-9.]*" | sed 's/^/  /' || echo "  none"
  echo
  echo "== Loudness (bar: about -16 LUFS calm, -14 energetic; true peak -1 dBFS or lower)"
  if [ -n "$audio" ]; then "$here/loudness.sh" "$f" | sed 's/^/  /'; else echo "  no audio stream"; fi
} > "$o/measurements.txt"

rows=$(awk -v d="$dur" 'BEGIN{r=int((d+5.999)/6); print (r<1?1:r)}')
ffmpeg -loglevel error -y -i "$f" -vf "fps=1,scale=320:-2,tile=6x${rows}" -frames:v 1 "$o/overview.jpg"

n=$(awk -v d="$dur" 'BEGIN{print int((d-0.05)/8)+1}')
for i in $(seq 0 $((n - 1))); do
  s=$(awk -v i="$i" 'BEGIN{printf "%04.1f", i*8}'); e=$(awk -v i="$i" -v d="$dur" 'BEGIN{x=(i+1)*8; if(x>d)x=d; printf "%04.1f", x}')
  ffmpeg -loglevel error -y -ss "$s" -t 8 -i "$f" -vf "fps=2,scale=480:-2,tile=4x4" -frames:v 1 "$o/sheet-${s}-${e}s.jpg"
done

if [ -n "$trans" ]; then
  for t in $(echo "$trans" | tr ',' ' '); do
    st=$(awk -v t="$t" 'BEGIN{s=t-0.3; if(s<0)s=0; print s}')
    ffmpeg -loglevel error -y -ss "$st" -t 0.7 -i "$f" -vf "fps=10,scale=384:-2,tile=7x1" -frames:v 1 "$o/transition-${t}s.jpg"
  done
fi

cat "$o/measurements.txt"
echo; ls "$o"
