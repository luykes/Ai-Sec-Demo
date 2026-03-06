FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ ./shared/
COPY mcp-devops/ ./mcp_devops/
COPY mcp-soc/ ./mcp_soc/
COPY mcp-external-malicious/ ./mcp_external_malicious/
COPY gateway/ ./gateway/
COPY agent/ ./agent/

RUN mkdir -p /app/data

ENV PYTHONPATH=/app
