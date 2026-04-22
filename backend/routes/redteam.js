import express from 'express';

const router = express.Router();

const COPILOT_URL = process.env.COPILOT_URL || 'http://localhost:8000';

router.post('/chat', async (req, res) => {
  const appId = req.headers['app-id'];
  const expectedKey = process.env.REDTEAM_API_KEY;
  if (expectedKey && appId !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt field' });

  try {
    const copilotRes = await fetch(`${COPILOT_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-anthropic-api-key': process.env.ANTHROPIC_API_KEY || '',
      },
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
    res.status(502).json({ error: 'Copilot unreachable', detail: err.message });
  }
});

export default router;
