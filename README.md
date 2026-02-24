# PromptAI — MCP Attack & Defense Demo

A live, side-by-side demonstration of how an LLM agent can attack an MCP (Model Context Protocol) server — and how Prompt Security stops it in real time.

The left pane runs a **vulnerable** MCP server with zero guardrails. The right pane runs an identical server with **Prompt Security** enforcement. Watch the same 6 attacks succeed on the left while being blocked on the right.

A second category — **Employee GenAI Protection** — demonstrates how Prompt Security's browser extension intercepts sensitive data (credentials, PII, proprietary code) that employees accidentally paste into public AI tools like ChatGPT, Gemini, Copilot, and Claude.

---

## What This Demo Shows

### Category 1: Homegrown App Protection (MCP Tool Abuse)

| | Vulnerable Pane (left) | Protected Pane (right) |
|---|---|---|
| MCP Port | `:8787` | `:8788` |
| Prompt Security | ❌ Disabled | ✅ Enabled |
| Tool calls | Execute directly | Pre + post-scanned |
| Result | Attacker gets secrets | Blocked or sanitized |

The Python agent uses **Ollama (llama3.2)** to generate authentic attacker commentary, but tool execution is **fully scripted** — Ollama never decides what to call. This ensures consistent, reproducible demos.

### Category 2: Employee GenAI Protection

Demonstrates 9 risk scenarios — 6 policy-violating prompts and 3 safe prompts. Each scenario can be launched directly into ChatGPT, Gemini, Copilot, or Claude with one click. The Prompt Security browser extension intercepts the submission in real time.

---

## Attack Scenarios

| # | Scenario | Tools Used | What the Attack Does |
|---|----------|-----------|----------------------|
| 1 | Secret Exfiltration | `read_file` | Reads `.env` to steal API keys, DB passwords, AWS credentials |
| 2 | Internal System Probe | `read_file`, `search_docs` | Maps VPN config, SSH hosts, internal URLs |
| 3 | PII Data Export | `db_export` | Dumps customer CSV with SSNs, credit cards, emails |
| 4 | Unauthorized HTTP Fetch | `http_fetch` | Reaches external attacker-controlled URLs to exfiltrate data |
| 5 | Email Exfiltration | `read_file`, `db_export`, `send_email` | Collects credentials + PII and emails them to attacker |
| 6 | Shell Command Injection | `run_shell` | Runs `env`, `whoami`, `ls /etc` on the server |

---

## Architecture

```
Browser (React + Vite)
    │
    └── Express Backend :3001
            │
            ├── Spawn: Python Agent (mcp_agent.py)
            │       └── Ollama :11434  (llama3.2 — attacker commentary)
            │
            ├── MCP Raw Server :8787   SECURITY_ENABLED=false  ← vulnerable
            └── MCP Safe Server :8788  SECURITY_ENABLED=true   ← Prompt Security enforced
                    └── Prompt Security API (cloud — requires API key)
```

Real-time telemetry streams from backend → browser over **Server-Sent Events (SSE)**.

---

## Option A: Local Development

### Prerequisites

| Tool | Min Version | Notes |
|------|------------|-------|
| Node.js | 18+ | JavaScript runtime |
| Python | 3.10+ | For the attack agent |
| Ollama | Latest | Local LLM runtime |
| llama3.2 model | — | ~2 GB via `ollama pull llama3.2` |
| Prompt Security API key | Optional | Required for right-pane blocking — enter in the UI |

---

### macOS

**1. Install Node.js**

```bash
# Option A: Homebrew
brew install node

# Option B: Download LTS installer from https://nodejs.org
```

Verify: `node --version` (should be 18+)

**2. Install Python 3.10+**

```bash
# Option A: Homebrew
brew install python@3.12

# Option B: Download from https://python.org/downloads
```

**3. Install and start Ollama**

Download from https://ollama.com, drag to Applications, launch it (appears in menu bar), then pull the model:

```bash
ollama pull llama3.2
```

**4. Clone and install**

```bash
git clone https://github.com/luykes/PromptAI_MCP_Attack.git
cd PromptAI_MCP_Attack
npm run install:all
python3 -m venv agent/venv
agent/venv/bin/pip install -r agent/requirements.txt
```

**5. Start**

```bash
npm run dev
```

Open **http://localhost:5173**

---

### Windows

**1. Install Node.js** — download LTS `.msi` from https://nodejs.org, run the installer.

**2. Install Python 3.10+** — download from https://python.org/downloads. **Check "Add Python to PATH"** on the first screen.

**3. Install Ollama** — download from https://ollama.com, run the installer, then:

```cmd
ollama pull llama3.2
```

**4. Clone and install**

```cmd
git clone https://github.com/luykes/PromptAI_MCP_Attack.git
cd PromptAI_MCP_Attack
npm run install:all
python -m venv agent\venv
agent\venv\Scripts\pip install -r agent\requirements.txt
```

**5. Start**

```cmd
npm run dev
```

Open **http://localhost:5173**

> **Windows note:** If you see an error about `concurrently` not being found, run `npm install -g concurrently` first.

---

## Option B: VPS Deployment (Docker + Let's Encrypt)

Deploy to any Linux VPS (Hetzner, Vultr, DigitalOcean, etc.) with full HTTPS, automatic SSL renewal, and all services running in Docker containers.

### Requirements

- A Linux VPS with **8 GB RAM** (needed for Ollama — Hetzner CX31 at ~AUD $14/month is recommended)
- Ubuntu 22.04 LTS
- A domain name pointed at the server's IP (free: [DuckDNS](https://www.duckdns.org) — takes 2 minutes)
- Docker installed on the server

### Architecture (Production)

```
Internet
    │  443 (HTTPS)
    ▼
 nginx container          ← TLS termination, security headers, rate limiting
    │
    ├── /              → React app (static files, built into nginx image)
    └── /api/*         → app container :3001
                              │
                              ├── Express API
                              ├── MCP Raw server  :8787 (internal only)
                              ├── MCP Safe server :8788 (internal only)
                              └── Python agent → ollama container :11434
```

Ports 3001, 8787, 8788, and 11434 are **never exposed to the internet** — Docker internal network only.

### Deploy Steps

**1. Provision the server**

Spin up Ubuntu 22.04 LTS on your VPS provider. SSH in as root.

**2. Install Docker**

```bash
curl -fsSL https://get.docker.com | sh
```

**3. Clone the repository**

```bash
git clone https://github.com/luykes/PromptAI_MCP_Attack.git /opt/promptai
cd /opt/promptai
```

**4. Configure environment**

```bash
cp .env.example .env
nano .env
```

Fill in these two required fields:

```env
DOMAIN=yourname.duckdns.org
LE_EMAIL=your@email.com
```

The Prompt Security API key can be left blank here — it can be entered via the web UI after deployment.

**5. Set up the firewall**

```bash
sudo bash setup-firewall.sh
```

This blocks everything except SSH (22), HTTP (80), and HTTPS (443).

**6. Run the one-time setup script**

```bash
bash init-letsencrypt.sh
```

This script:
- Obtains a Let's Encrypt SSL certificate for your domain
- Starts all 4 Docker containers (nginx, certbot, app, ollama)
- Downloads the `llama3.2:3b` model into Ollama (~2 GB)

The app will be live at `https://yourdomain.com` when it finishes.

---

### What's Inside the Containers

| Container | Base Image | What it runs |
|-----------|-----------|-------------|
| `nginx` | nginx:alpine + React build | Serves React app, terminates SSL, proxies `/api/` |
| `certbot` | certbot/certbot | Renews Let's Encrypt cert automatically every 12 hours |
| `app` | node:20-alpine + Python | Express API + MCP servers (8787/8788) + Python agent |
| `ollama` | ollama/ollama | Local LLM (llama3.2:3b) |

### Managing the Deployment

```bash
# Check all containers are healthy
docker compose ps

# View live logs
docker compose logs -f

# Stop everything
docker compose down

# Start (after a server reboot)
docker compose up -d

# Rebuild after a code change
docker compose build && docker compose up -d
```

### SSL Certificate

SSL renewal is **fully automatic**. The `certbot` container checks every 12 hours and renews if the certificate is within 30 days of expiry. No manual action ever needed.

---

### Security Measures Applied

| Layer | Measure |
|-------|---------|
| OS | ufw firewall — only ports 22/80/443 open |
| nginx | HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| nginx | `server_tokens off` — nginx version hidden |
| nginx | Rate limiting — 30 req/min general, 2 req/min on attack runner |
| nginx | TLS 1.2/1.3 only, OCSP stapling |
| Docker | All containers run with `no-new-privileges` |
| Docker | App container drops all capabilities (`cap_drop: ALL`) |
| Docker | Internal ports (3001, 8787, 8788, 11434) not exposed |
| App | Express runs as non-root user (UID 1001) |
| App | CORS restricted to `https://<DOMAIN>` only |
| App | Request body capped at 1 MB |
| Secrets | `.env` permissions set to 600 (owner read only) |
| Build | `.dockerignore` prevents secrets from entering Docker images |

---

## Running the Demo

1. Open the app URL (local: `http://localhost:5173` / VPS: `https://yourdomain.com`)
2. From the landing page, click **Enter**
3. Choose a category:
   - **Homegrown App Protection** — side-by-side MCP attack demo
   - **Employee GenAI Protection** — browser-based AI tool risk scenarios
4. Click **⚙ Config** in the top bar → enter your Prompt Security API key and your username → Save
5. For the MCP demo: click **Launch All 6 Attacks** and watch both panes in real time

<img width="1802" height="688" alt="image" src="https://github.com/user-attachments/assets/46658744-b051-408c-a256-ff1e937935fc" />

---

## Optional: Prompt Security API Key

Without an API key the demo still runs — the protected pane defaults to "allow".

To see real blocking:
1. Get an API key from https://prompt.security
2. Click **⚙ Config** in the top bar
3. Paste your key and click **Save**

The key is stored in `backend/.runtime-config.json` (gitignored — never committed).

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'httpx'"

The agent venv wasn't set up. Run:
```bash
# macOS/Linux
agent/venv/bin/pip install -r agent/requirements.txt

# Windows
agent\venv\Scripts\pip install -r agent\requirements.txt
```

### "Is the MCP server running on port 8787?"

`npm run dev` isn't running, or a port is already in use:
```bash
# macOS — free the ports
kill -9 $(lsof -ti:8787) 2>/dev/null
kill -9 $(lsof -ti:8788) 2>/dev/null
kill -9 $(lsof -ti:3001) 2>/dev/null
```

### Ollama commentary is blank

Ollama's built-in filters may refuse attacker-framing prompts. The demo still works — tool results are what matter visually.

### VPS — nginx container won't start

The SSL cert may not exist yet. Run `init-letsencrypt.sh` first. If already run, check:
```bash
docker compose logs nginx
```

### VPS — "Port 80 is already in use" during init

Something else is on port 80. Stop it first:
```bash
sudo systemctl stop apache2   # or nginx, if system nginx is installed
```

### Port already in use (local)

```bash
kill -9 $(lsof -ti:8787) 2>/dev/null
kill -9 $(lsof -ti:8788) 2>/dev/null
kill -9 $(lsof -ti:3001) 2>/dev/null
```

### Windows — 'concurrently' not found

```cmd
npm install -g concurrently cross-env
npm run dev
```

---

## Project Structure

```
PromptAI_MCP_Attack/
├── package.json              # Root — npm run dev starts everything locally
├── .env.example              # Template — copy to .env and fill in values
│
├── docker-compose.yml        # Production: 4 containers (nginx, certbot, app, ollama)
├── Dockerfile.nginx          # Multi-stage: builds React, then nginx serves it
├── Dockerfile.app            # Node 20 + Python: Express + MCP servers + agent
├── docker-entrypoint.sh      # Starts MCP servers in background, then Express
├── init-letsencrypt.sh       # One-time setup: get cert + start all containers
├── setup-firewall.sh         # ufw rules: allow only 22/80/443
│
├── nginx/
│   └── app.conf.template     # nginx config (HTTPS, rate limiting, security headers)
│
├── mcp-server/               # Node.js MCP server (6 vulnerable tools)
│   ├── server.js             # Express + MCP SDK, Prompt Security enforcement
│   └── assets/               # Mock sensitive data (ALL FAKE — safe to commit)
│       ├── .env              # Fake API keys / credentials
│       ├── customers.csv     # Fake PII (names, SSNs, credit cards)
│       └── handbook.md       # Fake internal docs (VPN, SSH, passwords)
│
├── agent/                    # Python attacker agent
│   ├── mcp_agent.py          # Scripted tool calls + Ollama commentary
│   ├── requirements.txt      # mcp, httpx, ollama
│   └── venv/                 # Python virtual environment (gitignored)
│
├── backend/                  # Express API bridge
│   ├── index.js              # Server entry point + CORS config
│   └── routes/
│       ├── agent.js          # POST /api/agent/run — spawns Python agent
│       ├── telemetry.js      # GET /api/stream/:target — SSE log stream
│       └── config.js         # GET/POST /api/config — Prompt Security key
│
└── web/                      # React + Vite frontend
    └── src/
        ├── App.jsx
        ├── data/
        │   └── attackCategories.js    # Scenario definitions for both categories
        └── components/
            ├── LandingPage.jsx        # Entry screen with Matrix rain animation
            ├── CategoryPage.jsx       # Category selection grid
            ├── AttackPanel.jsx        # MCP scenario cards + launch button
            ├── SplitScreen.jsx        # Side-by-side telemetry display
            ├── TelemetryPane.jsx      # SSE log display with color-coded levels
            ├── EmployeeProtectionPanel.jsx  # Employee risk scenario cards
            ├── MatrixRain.jsx         # Canvas animation
            ├── Header.jsx             # Top bar with config toggle
            └── ConfigPanel.jsx        # Prompt Security API key input
```

---

## Security Note

All data in `mcp-server/assets/` is **intentionally fake demo data**:
- `.env` — fictional API keys with `DEMO` placeholders
- `customers.csv` — fictional names/SSNs/cards, no real people
- `handbook.md` — fictional company "ACME Corp"

None of these are real credentials. The `run_shell` tool has a safety filter that blocks destructive commands (`rm`, `shutdown`, etc.) even in vulnerable mode.

Your real Prompt Security API key is stored in `backend/.runtime-config.json`, which is gitignored and never committed.
