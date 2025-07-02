// // // server/server.js
// // const express = require('express');
// // const cors = require('cors');
// // const requestIp = require('request-ip');
// // const path = require('path');
// // const { getAllRows, appendRow } = require('./excel');

// // const app = express();
// // const PORT = process.env.PORT || 3000;
// // app.use(cors());
// // app.use(requestIp.mw());

// // // 1️⃣  Route shown inside the QR code
// // app.get('/scan', (req, res) => {
// //   const ip = req.clientIp;
// //   const ua = req.get('user-agent') || '';
// //   const rows = getAllRows();

// //   const already = rows.find(r => r.ip === ip);
// //   if (already) {
// //     return res.send(`
// //       <h1 style="font-family:sans-serif;color:#d33">Sorry – this device has already scanned.</h1>
// //     `);
// //   }

// //   // first‑time visitor → store + greet
// //   appendRow({ ip, ua, time: new Date().toISOString() });
// //   res.send(`
// //     <h1 style="font-family:sans-serif;color:#32a852">Welcome 🎉</h1>
// //   `);
// // });

// // // 2️⃣  Optional health/info route
// // app.get('/stats', (req, res) => {
// //   res.json(getAllRows());
// // });

// // app.listen(PORT, () =>
// //   console.log(`QR‑Once backend running on http://localhost:${PORT}`)
// // );
// // server/server.js
// const express    = require('express');
// const cors       = require('cors');
// const requestIp  = require('request-ip');
// const path       = require('path');
// const { getAllRows, appendRow } = require('./excel');

// const app  = express();
// const PORT = process.env.PORT || 3000;

// app.enable('trust proxy');          // ⭐  see §1
// app.use(cors());                    // TODO: tighten in prod
// app.use(requestIp.mw());

// // Route encoded in the QR code
// app.get('/scan', (req, res) => {
//   const ip  = req.clientIp;
//   const ua  = req.get('user-agent') || '';
//   const rows = getAllRows();

//   if (rows.some(r => r.ip === ip)) {
//     return res.send(`
//        <div style="
      // display:flex;
      // flex-direction:column;
      // justify-content:center;
      // align-items:center;
      // min-height:100vh;
      // text-align:center;
      // padding:0 1rem;
//     ">
//       <h1 style="
//         font-family:sans-serif;
//         color:#d33;
//         font-size:clamp(1.4rem,6vw,2rem);
//         margin:0;
//       ">
//         Sorry – this device has already scanned.
//       </h1>
//     </div>
//     `);
//   }

//   appendRow({ ip, ua, time: new Date().toISOString() });
//   res.send(`
{/* <div style="
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    min-height:100vh;
    text-align:center;
    padding:0 1rem;
  ">
    <h1 style="
      font-family:sans-serif;
      color:#32a852;
      font-size:clamp(1.4rem,6vw,2rem);
      margin:0;
    ">
      Hurry you got a ice gola🎉
    </h1>
  </div>  `); */}
// });

// // Optional health/info route
// app.get('/stats', (_req, res) => res.json(getAllRows()));

// // simple download endpoint (optional)
// app.get('/download', (_req, res) => {
//   res.download(require('path').join(__dirname, 'scans.xlsx'), 'scans.xlsx');
// });

// // Optional error handler ─ see what goes wrong instead of silent 500
// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(500).send('Server error – check logs.');
// });

// app.listen(PORT, () =>
//   console.log(`QR‑Once backend running on http://localhost:${PORT}`)
// );

// server/server.js
const express = require("express");
const cors = require("cors");
const requestIp = require("request-ip");
const { getAllRows, appendRow } = require("./excel");

const app = express();
const PORT = process.env.PORT || 3000;

app.enable("trust proxy"); // ★ keeps real client IP behind Render / Nginx
app.use(cors()); // tighten origin in production
app.use(requestIp.mw());

// → URL encoded in the QR
app.get("/scan", (req, res) => {
  const ip = req.clientIp;
  const ua = req.get("user-agent") || "";
  const rows = getAllRows();

  if (rows.some((r) => r.ip === ip)) {
    return res.send(
    //   `<h1 style="font-family:sans-serif;color:#d33">
    //   Sorry – this device has already scanned.
    // </h1>`);
    `<div style="
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    min-height:100vh;
    text-align:center;
    padding:0 1rem;
  ">
    <h1 style="
      font-family:sans-serif;
      color:#32a852;
      font-size:clamp(1.4rem,6vw,2rem);
      margin:0;
    ">
      Sorry – this device has already scanned.
    </h1>
  </div>  `)
  }

  appendRow({ ip, ua, time: new Date().toISOString() });
  res.send(`<h1 style="font-family:sans-serif;color:#32a852
     display:flex;
    flex-direction:column;   justify-content:center;
    align-items:center;     min-height:100vh;
   text-align:center;
    padding:0 1rem;
    ">Hurry you got a ice gola🎉</h1>`);
});

// quick JSON view
app.get("/stats", (_req, res) => res.json(getAllRows()));

// simple download endpoint (optional)
app.get("/download", (_req, res) => {
  res.download(require("path").join(__dirname, "scans.xlsx"), "scans.xlsx");
});

// error handler (see SheetJS issues, etc.)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Server error – check logs.");
});

app.listen(PORT, () => {
  console.log(`QR‑Once backend on http://localhost:${PORT}`);
});
