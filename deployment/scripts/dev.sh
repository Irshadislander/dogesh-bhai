#!/usr/bin/env bash
set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required. Install via corepack enable pnpm." >&2
  exit 1
fi

pnpm install --recursive

trap "pkill -P $$" EXIT

pnpm --filter backend dev &
pnpm --filter frontend dev -- --host 0.0.0.0 --port 5173
