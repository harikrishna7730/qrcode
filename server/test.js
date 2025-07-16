// const express = require("express");
// const XLSX = require("xlsx");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// app.set('trust proxy', true);
// app.use(express.json());

// const filePath = path.join(__dirname, "output.xlsx");

// function appendUserData(newUserData) {
//   let data = [];

//   // Load existing data if file exists
//   if (fs.existsSync(filePath)) {
//     const workbook = XLSX.readFile(filePath);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     data = XLSX.utils.sheet_to_json(worksheet);
//   }

//   // 🔍 Check if name already exists (case-insensitive)
//   const nameExists = data.some(
//     (user) => user.ip.replace(/^.*:/, '') === newUserData.ip
//   );

//   if (nameExists) {
//     console.log("❌ User with this name already exists:", newUserData.ip);
//     return false;
//   }

//   // ✅ Append new user with timestamp
//   newUserData.timestamp = new Date().toISOString();
//   data.push(newUserData);

//   // Re-create sheet and write to file
//   const newWorksheet = XLSX.utils.json_to_sheet(data);
//   const newWorkbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
//   XLSX.writeFile(newWorkbook, filePath);

//   console.log("✅ User data appended:", newUserData.ip);
//   return true;
// }
//  app.use('/image', express.static(path.join(__dirname, 'image')));

// // API endpoint
// app.get("/scan", (req, res) => {
// //   const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
// //  const ip = rawIP.replace(/^.*:/, ''); // Normalize IP (remove "::ffff:")
//  const ip = req.ip.replace(/^.*:/, ''); // ✅ safer, proxy-compatible
//  const ua = req.get("user-agent") || "";
//   const success = appendUserData({ip,ua});
//   if (!success) {
//     return res.send(
//     `<div style="
//     display:flex;
//     flex-direction:column;
//     justify-content:center;
//     align-items:center;
//     min-height:100vh;
//     text-align:center;
//     padding:0 1rem;
//        background:#EDEDED;

//   ">
//     <h1 style="
//       font-family:Roboto;
//       color:red;
//       font-size:clamp(1.4rem,6vw,2rem);
//       margin:0;
//     ">
//       Sorry – this device has already scanned.
//     </h1>
//   </div>  `)
// // return res.send('⚠️ You already scanned.');
//   }

//    res.send(
//    `<div style="
//     display:flex;
//     flex-direction:column;
//     justify-content:center;
//     align-items:center;
//     min-height:100vh;
//     text-align:center;
//     background:#EDEDED;
//     padding:0 1rem;
//   ">
//     <h1 style="
//     font-size:40px;
//       font-family:sans-serif;
//       color:green;
//       font-size:clamp(1.4rem,6vw,2rem);
//       margin:0;
//     ">
//      Hurry you got a ice gola🎉
//     </h1>
//         <img src="/image/cola_img.jpg" alt="Gola" width="200" height="300" style="padding-top:10px"/>
//   </div>  `
//   );

// //  return res.send('✅ Thank you for scanning!');
// });

// app.get('/download-excel', (req, res) => {
//   const filePath = path.join(__dirname, 'output.xlsx');  // File in root
//   res.download(filePath, 'output.xlsx', (err) => {
//     if (err) {
//       console.error('Error downloading file:', err);
//       res.status(500).send('Failed to download the file.');
//     }
//   });
// })

// // Start server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

const express = require("express");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose"); // ✅ NEW
require('dotenv').config();

const app = express();
app.set("trust proxy", true);
app.use(express.json());

// ✅ MongoDB Setup (Add your own URI)
const mongoURI = process.env.MONGO_URI; // ← change to your MongoDB URI
mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ MongoDB Schema & Model
const scanSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  ua: String,
  timestamp: { type: Date, default: Date.now },
});

const Scan = mongoose.model("Scan", scanSchema);

// ✅ Excel Setup
const filePath = path.join(__dirname, "output.xlsx");

function initializeWorkbookIfMissing() {
  if (!fs.existsSync(filePath)) {
    const headers = [{ ip: "", ua: "", timestamp: "" }];
    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filePath);
    console.log("📄 Created new output.xlsx with headers.");
  }
}

function appendUserData(newUserData) {
  initializeWorkbookIfMissing();

  let data = [];
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  data = XLSX.utils.sheet_to_json(worksheet);

  data = data.filter((row) => row.ip); // Remove any empty row

  const normalizedIP = newUserData.ip;
  const nameExists = data.some((user) => user.ip === normalizedIP);

  if (nameExists) {
    console.log("❌ IP already exists (Excel):", normalizedIP);
    return false;
  }

  newUserData.timestamp = new Date().toISOString();
  data.push(newUserData);

  const newWorksheet = XLSX.utils.json_to_sheet(data);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
  XLSX.writeFile(newWorkbook, filePath);

  console.log("✅ Added to Excel:", normalizedIP);
  return true;
}

// ✅ Serve image
app.use("/image", express.static(path.join(__dirname, "image")));

// ✅ Endpoint
app.get("/scan", async (req, res) => {
  const ip = req.ip.replace(/^.*:/, ""); // Normalize IPv6/IPv4
  const ua = req.get("user-agent") || "";

  const success = appendUserData({ ip, ua });

  // if (!success) {
  //   return res.send(`
  //     <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;text-align:center;padding:0 1rem;background:#EDEDED;">
  //       <h1 style="font-family:Roboto;color:red;font-size:clamp(1.4rem,6vw,2rem);margin:0;">
  //         Sorry – this device has already scanned.
  //       </h1>
  //     </div>
  //   `);
  // }

  // ✅ MongoDB insert (always, even if Excel passes)
  try {
    const exists = await Scan.exists({ ip });
    console.log(exists,"ghkhkjh")
    if (exists || !success) {
      console.log("⚠️ Already in MongoDB:", ip);
       return res.send(`
      <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;text-align:center;padding:0 1rem;background:#EDEDED;">
        <h1 style="font-family:Roboto;color:red;font-size:clamp(1.4rem,6vw,2rem);margin:0;">
          Sorry – this device has already scanned.
        </h1>
      </div>
    `);
    } else {
      await new Scan({ ip, ua }).save();
      console.log("✅ Added to MongoDB:", ip);
    }
  } catch (error) {
    console.error("❌ MongoDB Save Error:", error);
  }

  return res.send(`
    <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;text-align:center;background:#EDEDED;padding:0 1rem;">
      <h1 style="font-family:sans-serif;color:green;font-size:clamp(1.4rem,6vw,2rem);margin:0;">
        Hurry you got an ice gola 🎉
      </h1>
      <img src="/image/cola_img.jpg" alt="Gola" width="200" height="300" style="padding-top:10px"/>
    </div>
  `);
});

app.get('/download-excel', (req, res) => {
  const filePath = path.join(__dirname, 'output.xlsx');  // File in root
  res.download(filePath, 'output.xlsx', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res.status(500).send('Failed to download the file.');
    }
  });
})

// ✅ Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
