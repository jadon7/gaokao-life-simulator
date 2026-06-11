#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env"
  set +a
fi

python3 /Users/meet/.codex/skills/.system/imagegen/scripts/image_gen.py edit \
  --model gpt-image-2 \
  --image "/var/folders/2m/rwfk7zkj6ls41k0w3v7jfdz00000gp/T/codex-clipboard-6642da1a-aebd-4781-b536-1204b19e8d13.png" \
  --prompt-file "prompts/talent-lab-hardboiled-character-sheet.md" \
  --size 1024x1024 \
  --quality high \
  --output-format png \
  --out "assets/generated/talent-lab-characters.png" \
  --force \
  "$@"
