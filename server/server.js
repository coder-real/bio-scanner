const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let readings = [];
let clients  = [];

// ── Device state ─────────────────────────────────────────────────
let device = {
  id:       'BC-001',
  name:     'BioColour Dx Unit 1',
  type:     'Colour Diagnostic Sensor',
  ward:     'General Lab',
  firmware: 'v1.0.0',
  lastPing: null,
  status:   'offline'   // 'online' | 'offline'
};

const OFFLINE_TIMEOUT = 15000; // 15 seconds

function checkDeviceTimeout() {
  if (device.lastPing) {
    const elapsed = Date.now() - new Date(device.lastPing).getTime();
    if (elapsed > OFFLINE_TIMEOUT && device.status === 'online') {
      device.status = 'offline';
      console.log('[Device] Marked offline — no ping received');
      const payload = `data: ${JSON.stringify({ deviceUpdate: device })}\n\n`;
      clients.forEach(c => c.write(payload));
    }
  }
}

setInterval(checkDeviceTimeout, 5000);

// ── SSE ──────────────────────────────────────────────────────────
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  // Send current state immediately on connect
  res.write(`data: ${JSON.stringify({ deviceUpdate: device })}\n\n`);
  if (readings.length > 0) {
    res.write(`data: ${JSON.stringify(readings[readings.length - 1])}\n\n`);
  }

  clients.push(res);
  console.log(`[SSE] Client connected. Total: ${clients.length}`);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log(`[SSE] Client disconnected. Total: ${clients.length}`);
  });
});

// ── POST /api/reading — ESP-01S posts here ───────────────────────
app.post('/api/reading', (req, res) => {
  const { r, g, b, result, patientId } = req.body;

  if (r === undefined || g === undefined || b === undefined) {
    return res.status(400).json({ error: 'Missing RGB values' });
  }

  device.lastPing = new Date().toISOString();
  device.status   = 'online';

  const reading = {
    id:        Date.now(),
    r:         Number(r),
    g:         Number(g),
    b:         Number(b),
    result:    result || 'UNKNOWN',
    patientId: patientId || 'default',
    timestamp: new Date().toISOString()
  };

  readings.push(reading);
  if (readings.length > 100) readings = readings.slice(-100);

  console.log(`[Reading] R:${r} G:${g} B:${b} → ${result}`);

  const devicePayload  = `data: ${JSON.stringify({ deviceUpdate: device })}\n\n`;
  const readingPayload = `data: ${JSON.stringify(reading)}\n\n`;
  clients.forEach(c => { c.write(devicePayload); c.write(readingPayload); });

  res.json({ success: true, reading });
});

// ── GET /api/device ───────────────────────────────────────────────
app.get('/api/device', (req, res) => res.json(device));

// ── GET /api/readings ─────────────────────────────────────────────
app.get('/api/readings', (req, res) => res.json(readings));

// ── GET /api/latest ───────────────────────────────────────────────
app.get('/api/latest', (req, res) => {
  if (readings.length === 0) return res.json({ message: 'No readings yet' });
  res.json(readings[readings.length - 1]);
});

// ── DELETE /api/readings ──────────────────────────────────────────
app.delete('/api/readings', (req, res) => {
  readings = [];
  clients.forEach(c => c.write(`data: ${JSON.stringify({ cleared: true })}\n\n`));
  res.json({ success: true });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BioColour server on http://localhost:${PORT}`);
});
