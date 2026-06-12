require('dotenv').config();
const express = require('express');
const cors = require('cors');
const wiz = require('./wiz');
const nefit = require('./nefit');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── WiZ routes ────────────────────────────────────────────────

// POST /wiz/command  { ip, params: { state, dimming?, temp? } }
app.post('/wiz/command', async (req, res) => {
  const { ip, params } = req.body;
  if (!ip || !params) return res.status(400).json({ error: 'ip en params zijn vereist' });

  try {
    const result = await wiz.setPilot(ip, params);
    res.json(result);
  } catch (err) {
    console.error('[WiZ] setPilot error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// POST /wiz/state  { ip }
app.post('/wiz/state', async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'ip is vereist' });

  try {
    const result = await wiz.getPilot(ip);
    res.json(result);
  } catch (err) {
    console.error('[WiZ] getPilot error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Nefit routes ──────────────────────────────────────────────

// GET /nefit/status
app.get('/nefit/status', async (req, res) => {
  try {
    const status = await nefit.getStatus();
    res.json(status);
  } catch (err) {
    console.error('[Nefit] status error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// GET /nefit/humidity  (niet beschikbaar via Nefit, geeft null terug)
app.get('/nefit/humidity', async (req, res) => {
  res.json({ humidity: null });
});

// POST /nefit/setpoint  { value: 20.5 }
app.post('/nefit/setpoint', async (req, res) => {
  const { value } = req.body;
  if (value == null) return res.status(400).json({ error: 'value is vereist' });

  try {
    await nefit.setTemperature(value);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Nefit] setpoint error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// POST /nefit/usermode  { value: 'clock' | 'manual' }
app.post('/nefit/usermode', async (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'value is vereist' });

  try {
    await nefit.setUserMode(value);
    res.json({ ok: true });
  } catch (err) {
    console.error('[Nefit] usermode error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Home dashboard proxy draait op http://0.0.0.0:${PORT}`);
  console.log('Druk Ctrl+C om te stoppen');
});
