FROM node:20-alpine

# Install Python 3 and pip for the MCP agent
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Install Node deps for backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Install Node deps for mcp-server
COPY mcp-server/package*.json ./mcp-server/
RUN cd mcp-server && npm ci --omit=dev

# Install Python deps for agent (no venv needed in Docker)
COPY agent/requirements.txt ./agent/
RUN pip3 install --no-cache-dir -r agent/requirements.txt --break-system-packages

# Copy all source code
COPY backend/ ./backend/
COPY mcp-server/ ./mcp-server/
COPY agent/ ./agent/

# Entry point
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Run as non-root for container security
RUN addgroup -g 1001 -S appgroup && \
    adduser  -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 3001
CMD ["./docker-entrypoint.sh"]
