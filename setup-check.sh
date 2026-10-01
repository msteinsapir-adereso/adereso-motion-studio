#!/usr/bin/env bash
# Checks this machine for everything the motion studio needs, and prints the fix for anything missing.
# Usage: ./setup-check.sh   (safe to re-run; the first run downloads HyperFrames and its headless Chrome)
ok=0; bad=0
pass() { printf "  \033[32mOK\033[0m  %s\n" "$1"; ok=$((ok+1)); }
fail() { printf "  \033[31mNO\033[0m  %s\n      fix: %s\n" "$1" "$2"; bad=$((bad+1)); }

echo "Motion studio setup check"
echo "== tools"
command -v git >/dev/null && pass "git" || fail "git missing" "xcode-select --install"
command -v brew >/dev/null && pass "Homebrew" || fail "Homebrew missing (used for the installs below)" "see https://brew.sh"
if command -v ffmpeg >/dev/null; then
  if ffmpeg -hide_banner -filters 2>/dev/null | grep -q ebur128 && ffmpeg -hide_banner -encoders 2>/dev/null | grep -q libx264; then
    pass "ffmpeg (ebur128, libx264)"
  else fail "ffmpeg lacks ebur128 or libx264" "brew reinstall ffmpeg"; fi
else fail "ffmpeg missing" "brew install ffmpeg"; fi
if command -v node >/dev/null; then
  v=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$v" -ge 22 ]; then pass "Node $(node -v)"; else fail "Node $(node -v) is older than 22" "brew install node@22 (or: nvm install 22)"; fi
else fail "Node missing" "brew install node"; fi
command -v whisper-cli >/dev/null && pass "whisper-cpp (word-level transcripts)" || fail "whisper-cpp missing" "brew install whisper-cpp"
if command -v python3 >/dev/null; then
  missing=$(python3 -c "import importlib.util as u; print(' '.join(p for m, p in [('numpy','numpy'),('scipy','scipy'),('PIL','pillow')] if not u.find_spec(m)))")
  if [ -z "$missing" ]; then pass "Python 3 (numpy, scipy, pillow)"; else fail "Python packages missing: $missing" "python3 -m pip install --user $missing"; fi
else fail "python3 missing" "xcode-select --install"; fi

echo "== HyperFrames (renderer, pinned to 0.8.98)"
if npx --yes hyperframes@0.8.98 --version >/dev/null 2>&1; then
  pass "hyperframes 0.8.98"
  npx --yes hyperframes@0.8.98 doctor 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E "Chrome |FFmpeg |Memory |whisper" | sed 's/^/      /'
  if ls -d ~/.npm/_npx/*/node_modules/hyperframes/dist/skills/media-use/audio/assets/sfx >/dev/null 2>&1; then
    pass "bundled sound effects (whoosh, pop, click)"
  else fail "bundled sound effects not found" "re-run this script once npx has finished downloading"; fi
else fail "could not run hyperframes" "check the network connection, then re-run"; fi

echo "== this project"
[ -f .claude/skills/business-motion-film/SKILL.md ] && pass "skill installed (.claude/skills/business-motion-film)" || fail "skill not found" "run this from the repo root"
[ -f brand/brand.md ] && pass "brand kit (brand/)" || fail "brand/ missing" "git pull"

echo
if [ "$bad" -eq 0 ]; then
  echo "All $ok checks passed. Confirm end to end by rendering the example:"
  echo "  cd videos/adereso-c0015-blocks && npx hyperframes@0.8.98 render . --quality draft --fps 30 -o renders/check.mp4"
else
  echo "$bad check(s) failed: apply the fixes above and re-run."
  exit 1
fi
