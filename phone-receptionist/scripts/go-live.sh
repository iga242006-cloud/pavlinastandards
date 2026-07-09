#!/usr/bin/env bash
# One-command bootstrap: install deps, start the server, tunnel it publicly
# (via ngrok if installed), provision the Vapi assistant, and tell you what
# to do next. Run this from a machine/environment that can actually reach
# api.vapi.ai — it will NOT work from a network-restricted sandbox.
#
# Usage: ./scripts/go-live.sh <practiceId>
# Example: ./scripts/go-live.sh example-practice

set -euo pipefail
cd "$(dirname "$0")/.."

PRACTICE_ID="${1:-}"
if [ -z "$PRACTICE_ID" ]; then
  echo "Usage: ./scripts/go-live.sh <practiceId>"
  echo "Example: ./scripts/go-live.sh example-practice"
  exit 1
fi

if [ ! -f "config/practices/${PRACTICE_ID}.json" ]; then
  echo "No config found at config/practices/${PRACTICE_ID}.json"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
  echo "Open phone-receptionist/.env and set VAPI_API_KEY, then re-run this script."
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

if [ -z "${VAPI_API_KEY:-}" ]; then
  echo "VAPI_API_KEY is not set in .env — get one from the Vapi dashboard under API Keys."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install --silent
fi

PORT="${PORT:-3000}"

echo "Starting server on port ${PORT}..."
node server.js > /tmp/aria-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

for _ in $(seq 1 20); do
  if curl -s "http://localhost:${PORT}/health" > /dev/null 2>&1; then break; fi
  sleep 0.5
done

PUBLIC_URL="${PUBLIC_SERVER_URL:-}"

if [ -z "$PUBLIC_URL" ] || [[ "$PUBLIC_URL" == *"your-deployed-domain"* ]]; then
  if command -v ngrok > /dev/null 2>&1; then
    echo "No PUBLIC_SERVER_URL set — starting an ngrok tunnel..."
    ngrok http "$PORT" --log=stdout > /tmp/aria-ngrok.log 2>&1 &
    NGROK_PID=$!
    trap 'kill $SERVER_PID $NGROK_PID 2>/dev/null || true' EXIT
    sleep 3
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | node -e "process.stdin.on('data',d=>{try{const j=JSON.parse(d);const t=j.tunnels.find(t=>t.proto==='https');if(t)console.log(t.public_url)}catch(e){}})")
    if [ -z "$PUBLIC_URL" ]; then
      echo "Could not read the ngrok public URL from http://127.0.0.1:4040/api/tunnels — check /tmp/aria-ngrok.log."
      exit 1
    fi
    echo "Tunnel is live at: ${PUBLIC_URL}"
    echo "NOTE: this URL only lasts as long as this script keeps running. For a permanent"
    echo "number, deploy this server (Render/Railway/Fly) and set PUBLIC_SERVER_URL in .env."
  else
    echo "PUBLIC_SERVER_URL isn't set and ngrok isn't installed."
    echo "Either install ngrok (https://ngrok.com/download) and re-run, or deploy this server"
    echo "somewhere public and set PUBLIC_SERVER_URL in .env, then re-run."
    exit 1
  fi
fi

echo ""
echo "Provisioning the assistant for '${PRACTICE_ID}'..."
PUBLIC_SERVER_URL="$PUBLIC_URL" node scripts/create-assistant.js "$PRACTICE_ID"

echo ""
echo "Server is still running (PID $SERVER_PID) so tool calls (availability/booking) keep working."
echo "Go assign a phone number to the assistant in the Vapi dashboard, then call it to test."
echo "Press Ctrl+C here to stop the local server and tunnel when you're done testing."
wait $SERVER_PID
