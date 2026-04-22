import express from 'express';

const router = express.Router();

const COPILOT_URL = process.env.COPILOT_URL || 'http://copilot-agent:8000';

// Proxy to the app's own copilot without passing PS credentials,
// so the gateway falls back to mock policy and attacks are not blocked.
router.post('/chat', async (req, res) => {
  const appId = req.headers['app-id'];
  const expectedKey = process.env.REDTEAM_API_KEY;
  if (expectedKey && appId !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt field' });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const copilotRes = await fetch(`${COPILOT_URL}/chat`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        session_id: `redteam-${Date.now()}`,
        provider: 'claude',
        language: 'en',
        history: [],
      }),
    });

    const data = await copilotRes.json();
    res.json({ response: data.response || '' });
  } catch (err) {
    const timedOut = err.name === 'AbortError';
    res.status(timedOut ? 504 : 502).json({
      error: timedOut ? 'Copilot timed out' : 'Copilot unreachable',
      detail: err.message,
    });
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
