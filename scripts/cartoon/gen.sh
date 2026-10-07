#!/bin/zsh
# usage: gen.sh <name> <prompt>   -> raw/<name>.png
name=$1; shift
prompt="Use your image generation tool (gpt-image 2.5) to create exactly ONE image, then copy the generated PNG file to ./raw/$name.png (overwrite if present) and reply with just the path. Do not write code or create any other files.

Image request:
$*"
codex exec --skip-git-repo-check -s workspace-write -c model_reasoning_effort=low -C "$PWD" "$prompt" </dev/null
