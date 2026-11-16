#!/bin/bash
# Shahbaz bot auto-restart loop - bot band ho jaye to 5 second me dobara start ho jaye
cd "$(dirname "$0")"
while true; do
  node index.js
  echo "Bot band ho gaya, 5 second me dobara start ho raha hai..."
  sleep 5
done
