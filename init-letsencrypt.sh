#!/bin/bash
# PromptAI — one-time Let's Encrypt setup
# Run this ONCE on the server to get your SSL certificate, then never again.
# Renewal is handled automatically by the certbot container.
set -e

# ── Load .env ──────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "ERROR: .env file not found. Copy .env.example to .env and fill in DOMAIN and LE_EMAIL."
  exit 1
fi

export $(grep -v '^#' .env | grep -v '^$' | xargs)

if [ -z "$DOMAIN" ] || [ -z "$LE_EMAIL" ]; then
  echo "ERROR: DOMAIN and LE_EMAIL must be set in .env"
  exit 1
fi

echo ""
echo "=== PromptAI Let's Encrypt Setup ==="
echo "Domain : $DOMAIN"
echo "Email  : $LE_EMAIL"
echo ""

# ── Create runtime config file if it doesn't exist ────────────────────────────
# Must exist before Docker bind-mounts it; owned by UID 1001 (non-root app user)
if [ ! -f backend/.runtime-config.json ]; then
  echo "{}" > backend/.runtime-config.json
  echo "Created backend/.runtime-config.json"
fi
# Ensure the app container's non-root user (UID 1001) can write the config
chmod 660 backend/.runtime-config.json
chown 1001:1001 backend/.runtime-config.json 2>/dev/null || true

# Restrict .env permissions — only the owner should read it
chmod 600 .env

# ── Check port 80 is free ──────────────────────────────────────────────────────
if lsof -i :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "ERROR: Port 80 is already in use. Stop whatever is using it and re-run."
  exit 1
fi

# ── Get Let's Encrypt certificate (certbot standalone uses port 80 directly) ──
echo "=== Step 1: Obtaining SSL certificate from Let's Encrypt ==="
echo "(This uses port 80 temporarily. Make sure your domain's A record points to this server's IP.)"
echo ""

docker run --rm \
  -v "$(pwd)/certbot-etc:/etc/letsencrypt" \
  -v "$(pwd)/certbot-www:/var/www/certbot" \
  -p 80:80 \
  certbot/certbot certonly \
    --standalone \
    --domain "$DOMAIN" \
    --email "$LE_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

echo ""
echo "=== Step 2: Certificate obtained. Starting all services ==="

docker compose up -d

echo ""
echo "=== Step 3: Downloading Ollama model (this takes a few minutes) ==="
echo "Waiting for Ollama to be ready..."
sleep 10

docker compose exec ollama ollama pull llama3.2:3b

echo ""
echo "=================================================================="
echo " DONE! PromptAI is live at https://$DOMAIN"
echo ""
echo " Next steps:"
echo "  1. Open https://$DOMAIN in your browser"
echo "  2. Click the config icon and enter your Prompt Security API key"
echo "  3. Run an attack scenario"
echo ""
echo " To stop:  docker compose down"
echo " To start: docker compose up -d"
echo "=================================================================="
