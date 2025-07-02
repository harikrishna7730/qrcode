// server/server.js
const express = require('express');
const cors = require('cors');
const requestIp = require('request-ip');
const path = require('path');
const { getAllRows, appendRow } = require('./excel');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(requestIp.mw());

// 1️⃣  Route shown inside the QR code
app.get('/scan', (req, res) => {
  const ip = req.clientIp;
  const ua = req.get('user-agent') || '';
  const rows = getAllRows();

  const already = rows.find(r => r.ip === ip);
  if (already) {
    return res.send(`
      <h1 style="font-family:sans-serif;color:#d33">Sorry – this device has already scanned.</h1>
    `);
  }

  // first‑time visitor → store + greet
  appendRow({ ip, ua, time: new Date().toISOString() });
  res.send(`
    <h1 style="font-family:sans-serif;color:#32a852">Welcome 🎉</h1>
  `);
});

// 2️⃣  Optional health/info route
app.get('/stats', (req, res) => {
  res.json(getAllRows());
});

app.listen(PORT, () =>
  console.log(`QR‑Once backend running on http://localhost:${PORT}`)
);
