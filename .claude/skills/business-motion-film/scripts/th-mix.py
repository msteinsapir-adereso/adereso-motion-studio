#!/usr/bin/env python3
"""Voice-first mix for a talking-head video: the speaker leads, music ducks under speech, effects sit under the voice.
Usage: scripts/th-mix.py clip.mp4 out.wav [--music track.mp3] [--music-offset 0] [--sfx sfx.json]
                          [--music-lu -12] [--duck 7] [--sfx-under -9] [--target -14]
  --music-lu   music loudness relative to the voice before ducking (LU). Default -12.
  --duck       extra reduction while the voice is active (dB). Default 7, so music sits ~19 LU under speech.
  --sfx-under  where effects peak relative to the voice's peak (dB). Default -9: audible, never louder than the words.
  --target     master integrated loudness (LUFS). Default -14 for social, true peak -1 dBFS.
sfx.json: [["assets/sfx/whoosh.wav", 2.33, 0], ["assets/sfx/pop.wav", 6.1, -3], ...]   (file, time s, per-event dB offset)
Prints the measured voice, music and master loudness. Needs ffmpeg with ebur128/loudnorm."""
import json, re, subprocess, sys

a = sys.argv[1:]
clip, out = a[0], a[1]
opt = lambda k, d: a[a.index(k) + 1] if k in a else d
music, sfx_path = opt('--music', None), opt('--sfx', None)
moff, music_lu, duck = float(opt('--music-offset', 0)), float(opt('--music-lu', -12)), float(opt('--duck', 7))
sfx_under, target = float(opt('--sfx-under', -9)), float(opt('--target', -14))
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip],
                           capture_output=True, text=True).stdout)

def measure(args):
    e = subprocess.run(['ffmpeg', '-hide_banner', *args, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    i = float((re.findall(r'I:\s+(-?[\d.]+) LUFS', e) or ['-70'])[-1]); p = float((re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e) or ['-99'])[-1])
    return i, p

def peak(f):  # sample peak in dBFS; works for effects too short for integrated loudness
    e = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'max_volume:\s+(-?[\d.]+) dB', e)[-1])

voice_i, voice_p = measure(['-i', clip, '-vn'])
inputs, chains, mixes = ['-i', clip], [], []
n_in = 1
# voice: rumble cut + gentle compression, no level change yet
chains.append('[0:a]highpass=f=80,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=160:makeup=1[vox]')
chains.append('[vox]asplit=2[voxmix][voxkey]')
mixes.append('[voxmix]')
if music:
    m_i, _ = measure(['-ss', str(moff), '-t', str(dur), '-i', music])
    g = voice_i + music_lu - m_i
    inputs += ['-ss', str(moff), '-t', str(dur), '-i', music]; n_in += 1
    chains.append(f'[1:a]aresample=48000,volume={g:.2f}dB,afade=t=in:d=0.005,afade=t=out:st={max(0, dur - 1.0):.2f}:d=1.0[mus]')
    # duck: sidechain on the voice; ratio chosen so speech pulls the bed down by about `duck` dB
    chains.append(f'[mus][voxkey]sidechaincompress=threshold=0.02:ratio={1 + duck / 3:.2f}:attack=25:release=350:knee=4[musd]')
    mixes.append('[musd]')
else:
    chains.append('[voxkey]anullsink')
if sfx_path:
    base = voice_p + sfx_under
    for k, (f, t, off) in enumerate(json.load(open(sfx_path))):
        sp = peak(f)
        idx = n_in
        inputs += ['-i', f]; n_in += 1
        g = base + off - sp
        ms = int(round(t * 1000))
        chains.append(f'[{idx}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g:.2f}dB,adelay={ms}|{ms}[fx{k}]')
        mixes.append(f'[fx{k}]')
chains.append(f"{''.join(mixes)}amix=inputs={len(mixes)}:normalize=0:duration=first,atrim=0:{dur:.3f}[pre]")
graph = ';'.join(chains)
tmp = out + '.pre.wav'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', graph, '-map', '[pre]', '-ar', '48000', '-ac', '2', tmp], check=True)
# two-pass loudnorm to the target, true peak -1
e = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', f'loudnorm=I={target}:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                   capture_output=True, text=True).stderr
js = json.loads(e[e.rindex('{'):e.rindex('}') + 1])
ln = (f"loudnorm=I={target}:TP=-1:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
      f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af', ln, '-ar', '48000', out], check=True)
subprocess.run(['rm', '-f', tmp])
mi, mp = measure(['-i', out])
print(f'voice {voice_i:.1f} LUFS (peak {voice_p:.1f}); master {mi:.1f} LUFS, true peak {mp:.1f} dBFS; '
      f"music {'on' if music else 'off'}; {len(mixes) - 1 - (1 if music else 0)} effects -> {out}")
