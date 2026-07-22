#!/bin/bash
TARGET_PORT="${PORT:-10000}"
echo "Starting Cloudflare Tunnel for port ${TARGET_PORT}..."
cloudflared tunnel --url "http://localhost:${TARGET_PORT}"
