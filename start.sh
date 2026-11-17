#!/bin/bash
# Shahbaz bot auto-restart loop v12.4 — self-healing Chrome reinstall
cd "$(dirname "$0")"
while true; do
  CHROME_BIN=$(ls -d "$HOME"/.cache/puppeteer/chrome/*/chrome-linux/chrome 2>/dev/null | head -n 1)
  if [ -z "$CHROME_BIN" ] || [ ! -x "$CHROME_BIN" ]; then
    echo "Chrome missing after Replit restart — reinstalling..."
    npx puppeteer browsers install chrome || { echo "Chrome install failed, retry in 60s..."; sleep 60; continue; }
  fi
  node index.js
  echo "Bot band ho gaya, 5 second me dobara start ho raha hai..."
  sleep 5
done
