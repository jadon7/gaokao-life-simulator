#!/bin/bash
# Regenerate served card webp at device-needed size + convert big card_interaction pngs to webp.
# NON-DESTRUCTIVE: only writes .webp; never deletes originals. (bash 3.2 compatible)
set -uo pipefail
ROOT="/Users/jadon7/Documents/SynologyDrive/code/gaokao-life-simulator-20260616"
DL="/Users/jadon7/Downloads/0622题目图"
GA="$ROOT/assets/character_scenes/neutral/glass_avatar"
CARD_W=720; Q=80

srcwidth() { sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth/{print $2}'; }
webp_resize() { # src target capW q
  local src="$1" tgt="$2" cap="$3" q="$4" sw tw
  sw=$(srcwidth "$src"); [ -z "$sw" ] && sw=$cap
  tw=$cap; [ "$sw" -lt "$cap" ] && tw=$sw
  cwebp -quiet -q "$q" -m 6 -mt -resize "$tw" 0 "$src" -o "$tgt"
}
find_dl() { # year scene -> path or empty
  local y="$1" s="$2" f b dy ds
  for f in "$DL"/*; do
    [ -f "$f" ] || continue
    b=$(basename "$f")
    dy=$(echo "$b" | sed -E 's/.*[Yy]ear_?0*([0-9]+).*/\1/')
    ds=$(echo "$b" | sed -E 's/.*scene_0*([0-9]+).*/\1/')
    [ "$dy" = "$y" ] && [ "$ds" = "$s" ] && { echo "$f"; return; }
  done
}

before=$(find "$GA" -name '*.webp' -exec du -k {} + | awk '{s+=$1}END{print s}')
replaced=0; regen=0
for y in $(seq 1 18); do
  yy=$(printf "%02d" "$y")
  for s in 1 2 3; do
    ss=$(printf "%02d" "$s")
    tgt="$GA/year_$yy/scene_$ss.webp"
    [ -f "$tgt" ] || continue
    src=$(find_dl "$y" "$s")
    if [ -n "$src" ]; then replaced=$((replaced+1)); echo "  replace $yy/$ss <- $(basename "$src")"; else src="$GA/year_$yy/scene_$ss.png"; regen=$((regen+1)); fi
    [ -f "$src" ] || { echo "  !! no source for $yy/$ss"; continue; }
    webp_resize "$src" "$tgt" "$CARD_W" "$Q"
  done
done
after=$(find "$GA" -name '*.webp' -exec du -k {} + | awk '{s+=$1}END{print s}')
echo "cards: replaced=$replaced, regen=$regen; webp total ${before}KB -> ${after}KB"

CI="$ROOT/assets/card_interaction"
webp_resize "$CI/profile_avatar.png"     "$CI/profile_avatar.webp"     480 82
webp_resize "$CI/final_role_creator.png" "$CI/final_role_creator.webp" 800 82
for f in profile_avatar final_role_creator; do
  echo "  $f: png $(du -h "$CI/$f.png"|cut -f1) -> webp $(du -h "$CI/$f.webp"|cut -f1) (w=$(srcwidth "$CI/$f.webp"))"
done