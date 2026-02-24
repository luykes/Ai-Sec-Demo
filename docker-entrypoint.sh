#!/bin/sh
set -e

echo "[ENTRYPOINT] Starting MCP server (VULNERABLE) on port 8787..."
PORT=8787 SECURITY_ENABLED=false node /app/mcp-server/server.js &

echo "[ENTRYPOINT] Starting MCP server (PROTECTED) on port 8788..."
PORT=8788 SECURITY_ENABLED=true node /app/mcp-server/server.js &

echo "[ENTRYPOINT] Starting backend API on port 3001..."
exec node /app/backend/index.js
