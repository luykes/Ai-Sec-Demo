import express from 'express';
import cors from 'cors';
import configRouter from './routes/config.js';
import agentRouter from './routes/agent.js';
import telemetryRouter from './routes/telemetry.js';

const app = express();
const PORT = 3001;

// Restrict CORS to the frontend origin only.
// ALLOWED_ORIGIN is set in docker-compose (https://<DOMAIN>).
// Falls back to localhost for local dev.
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST'],
  credentials: false,
}));

app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/config', configRouter);
app.use('/api/agent', agentRouter);  // POST /api/agent/run, POST /api/agent/stop
app.use('/api/stream', telemetryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[BACKEND] API server running on http://localhost:${PORT}`);
});
