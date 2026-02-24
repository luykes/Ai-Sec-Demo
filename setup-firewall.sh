#!/bin/bash
# PromptAI — VPS firewall setup (ufw)
# Run this ONCE after provisioning the server, before running init-letsencrypt.sh.
# Requires: sudo / root
set -e

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: Run this as root or with sudo."
  exit 1
fi

echo "=== Configuring firewall (ufw) ==="

# Start clean
ufw --force reset

# Default: block all inbound, allow all outbound
ufw default deny incoming
ufw default allow outgoing

# Allow SSH — MUST be first to avoid locking yourself out
ufw allow 22/tcp   comment 'SSH'

# Allow HTTP (needed for Let'\''s Encrypt cert challenges + redirect to HTTPS)
ufw allow 80/tcp   comment 'HTTP (certbot + HTTPS redirect)'

# Allow HTTPS
ufw allow 443/tcp  comment 'HTTPS'

# Block Docker internal ports from the internet
# (8787, 8788, 3001, 11434 are internal — never exposed via docker-compose ports:)
# ufw automatically blocks them because default deny incoming covers it.

# Enable the firewall
ufw --force enable
ufw status verbose

echo ""
echo "=== Firewall active ==="
echo "Allowed: SSH (22), HTTP (80), HTTPS (443)"
echo "Blocked: everything else"
