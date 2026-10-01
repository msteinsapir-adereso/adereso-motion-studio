#!/usr/bin/env python3
"""Read the sound cues a talking-head composition registers (blocks + engine) and write them for th-mix.py.
Usage (inside the video folder): scripts/th-cues.py [index.html] [assets/sfx/cues.json] [--sfx-dir assets/sfx]
Loads the page in HyperFrames' cached headless Chrome, reads <script id="th-cues">, maps each cue name to
<sfx-dir>/<name>.mp3 (whoosh, pop, click, ...) and prints the list. No model or network cost beyond the GSAP CDN."""
import glob, json, os, re, subprocess, sys

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = lambda k, d: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d
page = os.path.abspath(args[0] if args else 'index.html')
out = args[1] if len(args) > 1 else 'assets/sfx/cues.json'
sfx_dir = opt('--sfx-dir', 'assets/sfx')
if len(args) > 1 and args[1] == sfx_dir: out = 'assets/sfx/cues.json'

cands = sorted(glob.glob(os.path.expanduser('~/.cache/hyperframes/chrome/**/chrome-headless-shell'), recursive=True))
cands = [c for c in cands if os.path.isfile(c) and os.access(c, os.X_OK)] + ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
chrome = next((c for c in cands if os.path.exists(c)), None)
if not chrome: sys.exit('no headless Chrome found (run `npx hyperframes doctor` once)')

dom = subprocess.run([chrome, '--headless', '--disable-gpu', '--mute-audio', '--allow-file-access-from-files',
                      '--virtual-time-budget=10000', '--dump-dom', 'file://' + page],
                     capture_output=True, text=True, timeout=120).stdout
m = re.search(r'<script type="application/json" id="th-cues">(.*?)</script>', dom, re.S)
if not m: sys.exit('no cues found: does index.html call th.finish() before registering the timeline?')
cues = json.loads(m.group(1))
rows, missing = [], set()
for name, t, db in cues:
    f = name if os.path.splitext(name)[1] else os.path.join(sfx_dir, name + '.mp3')
    if not os.path.exists(f): missing.add(f)
    rows.append([f, t, db])
if missing: sys.exit('missing effect files: ' + ', '.join(sorted(missing)))
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
json.dump(rows, open(out, 'w'), indent=0)
print(f'{len(rows)} cues -> {out}')
for f, t, db in rows: print(f'  {t:6.2f}s  {os.path.basename(f):16s} {db:+.0f} dB')
