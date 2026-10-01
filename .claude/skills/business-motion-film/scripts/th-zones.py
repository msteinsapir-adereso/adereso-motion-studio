#!/usr/bin/env python3
"""Measure where the speaker is in a vertical talking-head clip, so graphics and captions keep off the face.
Usage: scripts/th-zones.py clip.mp4 out.json [samples=6]
Samples frames across the clip, segments the person once (HyperFrames remove-background, one model load),
and writes head and body boxes (union over samples, in 1080x1920 pixels) plus the platform safe area and
the free regions inside it. Prints a one-line summary. Needs ffmpeg, numpy, PIL, npx."""
import json, subprocess, sys, tempfile, os
import numpy as np
from PIL import Image

clip, out = sys.argv[1], sys.argv[2]
n = int(sys.argv[3]) if len(sys.argv) > 3 else 6
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip],
                           capture_output=True, text=True).stdout)
W, H = 1080, 1920
tmp = tempfile.mkdtemp()
times = [dur * (i + 0.5) / n for i in range(n)]
for i, t in enumerate(times):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t:.2f}', '-i', clip, '-frames:v', '1',
                    '-vf', f'scale={W}:{H}', f'{tmp}/f{i:02d}.png'], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', '1', '-i', f'{tmp}/f%02d.png',
                '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '1', f'{tmp}/samples.mp4'], check=True)
subprocess.run(['npx', '--yes', 'hyperframes@0.8.98', 'remove-background', f'{tmp}/samples.mp4', '-o', f'{tmp}/cut.mov'],
               check=True, capture_output=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', f'{tmp}/cut.mov', '-vf', 'alphaextract', f'{tmp}/a%02d.png'], check=True)

heads, bodies = [], []
for i in range(n):
    p = f'{tmp}/a{i + 1:02d}.png'
    if not os.path.exists(p): continue
    a = np.array(Image.open(p).convert('L')) > 128
    ys, xs = np.where(a)
    if not len(ys): continue
    top = ys.min()
    cx = int(np.where(a[top:top + int(0.03 * H)])[1].mean())  # head centre column, from the crown

    def run(y, c):  # the contiguous run of the silhouette that contains column c (ignores raised hands beside the head)
        r = a[y]
        if not r[c]:
            idx = np.where(r)[0]
            if not len(idx) or abs(idx - c).min() > 0.05 * W: return (0, -1)
            c = int(idx[np.abs(idx - c).argmin()])
        x0 = c
        while x0 > 0 and r[x0 - 1]: x0 -= 1
        x1 = c
        while x1 < W - 1 and r[x1 + 1]: x1 += 1
        return (x0, x1)
    widths = [(y, *run(y, cx)) for y in range(top, H)]
    # head = crown down to the neck: the narrowest row between the widest part of the skull and the shoulders
    ref = max(x1 - x0 for y, x0, x1 in widths[:int(0.09 * H)])
    head_rows = [(y, x0, x1) for y, x0, x1 in widths if y < top + int(0.35 * H)]
    sh = next((k for k, (y, x0, x1) in enumerate(head_rows) if k > int(0.05 * H) and x1 - x0 > 1.3 * ref), len(head_rows) - 1)
    lo = int(0.06 * H)
    end = min(head_rows[lo:sh] or head_rows[-1:], key=lambda r: r[2] - r[1])[0]
    hr = [(y, x0, x1) for y, x0, x1 in head_rows if y < end and x1 >= x0]
    heads.append([min(r[1] for r in hr), top, max(r[2] for r in hr), end])
    bodies.append([int(xs.min()), int(top), int(xs.max()), int(ys.max())])

if not heads: sys.exit('no person found')
hb = [min(h[0] for h in heads), min(h[1] for h in heads), max(h[2] for h in heads), max(h[3] for h in heads)]
m = 0.06 * W
head = [int(max(0, hb[0] - m)), int(max(0, hb[1] - m)), int(min(W, hb[2] + m)), int(min(H, hb[3] + m))]
body = [min(b[0] for b in bodies), min(b[1] for b in bodies), max(b[2] for b in bodies), max(b[3] for b in bodies)]
# Meta Reels ads: keep 14% top, 35% bottom and 6% sides free of text and logos
safe = [round(0.06 * W), round(0.14 * H), round(0.94 * W), round(0.65 * H)]
free = {
    'headroom': [safe[0], safe[1], safe[2], head[1]],
    'left_of_head': [safe[0], safe[1], head[0], head[3]],
    'right_of_head': [head[2], safe[1], safe[2], head[3]],
    'below_head': [safe[0], head[3], safe[2], safe[3]],
}
free = {k: v for k, v in free.items() if v[2] - v[0] > 120 and v[3] - v[1] > 80}
res = {'size': [W, H], 'samples_s': [round(t, 2) for t in times], 'head_keepout': head, 'head_raw': [int(v) for v in hb],
       'person': [int(v) for v in body], 'safe_area': safe, 'free': free,
       'note': 'boxes are [x0, y0, x1, y1] in pixels; head_keepout has a 6% margin; safe_area follows Meta Reels ads guidance'}
json.dump(res, open(out, 'w'), indent=1)
print(f"head keep-out {head}  person {res['person']}  safe {safe}  free: " + ', '.join(f'{k} {v[2]-v[0]}x{v[3]-v[1]}' for k, v in free.items()))
