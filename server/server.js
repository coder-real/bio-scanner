const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let readings = [];
let clients  = [];

// ================================================================
//  DEVICE STATE
// ================================================================
let device = {
  id:         'BC-001',
  name:       'BioColour Dx Unit 1',
  type:       'Colour Diagnostic Sensor',
  ward:       'General Lab',
  firmware:   'v1.0.0',
  lastPing:   null,
  lastReading: null,
  status:     'offline',
  totalReadings: 0,
  upSince:    null
};

const OFFLINE_TIMEOUT = 25000; // 25 seconds (ESP pings every 10s)

// ================================================================
//  LOGGING HELPER
// ================================================================
function log(category, message, data = null) {
  const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const prefix = `[${time}] [${category}]`;
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ================================================================
//  DEVICE TIMEOUT CHECKER
// ================================================================
function checkDeviceTimeout() {
  if (!device.lastPing) return;

  const elapsed = Date.now() - new Date(device.lastPing).getTime();

  if (elapsed > OFFLINE_TIMEOUT && device.status === 'online') {
    device.status = 'offline';
    device.upSince = null;
    log('DEVICE', `Marked OFFLINE — last ping was ${Math.round(elapsed / 1000)}s ago`);

    pushToClients({ deviceUpdate: device });
  }
}

setInterval(checkDeviceTimeout, 5000);

// ================================================================
//  SSE PUSH HELPER
// ================================================================
function pushToClients(payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  let dead = [];

  clients.forEach((client, index) => {
    try {
      client.write(data);
    } catch (e) {
      log('SSE', `Dead client detected at index ${index} — removing`);
      dead.push(index);
    }
  });

  // Remove dead clients
  dead.reverse().forEach(i => clients.splice(i, 1));
}

// ================================================================
//  SSE ENDPOINT
// ================================================================
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  // Send current state immediately
  res.write(`data: ${JSON.stringify({ deviceUpdate: device })}\n\n`);
  if (readings.length > 0) {
    res.write(`data: ${JSON.stringify(readings[readings.length - 1])}\n\n`);
  }

  clients.push(res);
  log('SSE', `Client connected — total clients: ${clients.length}`);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    log('SSE', `Client disconnected — total clients: ${clients.length}`);
  });
});

// ================================================================
//  HEARTBEAT — ESP pings this every 10s even with no sample
// ================================================================
app.post('/api/heartbeat', (req, res) => {
  const wasOffline = device.status === 'offline';

  device.lastPing = new Date().toISOString();

  if (wasOffline) {
    device.status  = 'online';
    device.upSince = new Date().toISOString();
    log('DEVICE', 'Came ONLINE via heartbeat');
    pushToClients({ deviceUpdate: device });
  } else {
    device.status = 'online';
    log('HEARTBEAT', `Ping received — device alive`);
    // Push update to dashboard to show last ping time
    pushToClients({ deviceUpdate: device });
  }

  res.json({ success: true, serverTime: new Date().toISOString() });
});

// ================================================================
//  POST READING
// ================================================================
app.post('/api/reading', (req, res) => {
  const { r, g, b, result, patientId } = req.body;

  if (r === undefined || g === undefined || b === undefined) {
    log('READING', 'Rejected — missing RGB values', req.body);
    return res.status(400).json({ error: 'Missing RGB values' });
  }

  const wasOffline = device.status === 'offline';

  device.lastPing    = new Date().toISOString();
  device.lastReading = new Date().toISOString();
  device.status      = 'online';
  device.totalReadings++;

  if (wasOffline) {
    device.upSince = new Date().toISOString();
    log('DEVICE', 'Came ONLINE via reading');
  }

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

  log('READING', `R:${r} G:${g} B:${b} → ${result} (total: ${device.totalReadings})`);

  pushToClients({ deviceUpdate: device });
  pushToClients(reading);

  res.json({ success: true, reading });
});

// ================================================================
//  GET DEVICE STATUS
// ================================================================
app.get('/api/device', (req, res) => {
  const elapsed = device.lastPing
    ? Math.round((Date.now() - new Date(device.lastPing).getTime()) / 1000)
    : null;

  log('API', `Device status requested — status: ${device.status}, last ping: ${elapsed}s ago`);
  res.json({ ...device, secondsSinceLastPing: elapsed });
});

// ================================================================
//  GET READINGS
// ================================================================
app.get('/api/readings', (req, res) => {
  log('API', `Readings requested — returning ${readings.length} records`);
  res.json(readings);
});

// ================================================================
//  GET LATEST
// ================================================================
app.get('/api/latest', (req, res) => {
  if (readings.length === 0) return res.json({ message: 'No readings yet' });
  res.json(readings[readings.length - 1]);
});

// ================================================================
//  DELETE READINGS
// ================================================================
app.delete('/api/readings', (req, res) => {
  const count = readings.length;
  readings = [];
  log('API', `Readings cleared — deleted ${count} records`);
  pushToClients({ cleared: true });
  res.json({ success: true });
});

// ================================================================
//  HEALTH CHECK — Keep-alive
// ================================================================
app.get('/health', (req, res) => {
  res.json({
    status:      'running',
    uptime:      process.uptime(),
    deviceStatus: device.status,
    totalReadings: device.totalReadings,
    clients:     clients.length,
    memory:      process.memoryUsage()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  log('SERVER', `Running on port ${PORT}`);
  log('SERVER', `Health check: http://localhost:${PORT}/health`);
});
