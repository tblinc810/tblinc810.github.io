#!/bin/bash
echo "Starting Cloudflare Tunnel..."
./cloudflared tunnel --url http://localhost:10000
