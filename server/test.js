const express = require("express");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
 
const app = express();
app.use(express.json());
 
const filePath = path.join(__dirname, "output.xlsx");
 
function appendUserData(newUserData) {
  let data = [];
 
  // Load existing data if file exists
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = XLSX.utils.sheet_to_json(worksheet);
  }
 
  // 🔍 Check if name already exists (case-insensitive)
  const nameExists = data.some(
    (user) => user.ip.replace(/^.*:/, '') === newUserData.ip
  );
 
  if (nameExists) {
    console.log("❌ User with this name already exists:", newUserData.ip);
    return false;
  }
 
  // ✅ Append new user with timestamp
  newUserData.timestamp = new Date().toISOString();
  data.push(newUserData);
 
  // Re-create sheet and write to file
  const newWorksheet = XLSX.utils.json_to_sheet(data);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
  XLSX.writeFile(newWorkbook, filePath);
 
  console.log("✅ User data appended:", newUserData.ip);
  return true;
}
 
// API endpoint
app.get("/scan", (req, res) => {
  const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
 const ip = rawIP.replace(/^.*:/, ''); // Normalize IP (remove "::ffff:")
 const ua = req.get("user-agent") || "";
  const success = appendUserData({ip,ua});
  if (!success) {
    return res.send(
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
      color:red;
      font-size:clamp(1.4rem,6vw,2rem);
      margin:0;
    ">
      Sorry – this device has already scanned.
    </h1>
  </div>  `)
// return res.send('⚠️ You already scanned.');
  }
 
   res.send(
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
      color:green;
      font-size:clamp(1.4rem,6vw,2rem);
      margin:0;
    ">
     Hurry you got a ice gola🎉
    </h1>
  </div>  `
  );

//  return res.send('✅ Thank you for scanning!');
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

 
// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
 