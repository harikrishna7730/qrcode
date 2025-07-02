// // server/excel.js
// const fs = require('fs');
// const XLSX = require('xlsx');
// const path = require('path');

// const FILE = path.join(__dirname, 'scans.xlsx');
// const SHEET = 'scans';

// function loadWorkbook() {
//   if (!fs.existsSync(FILE)) {
//     const wb = XLSX.utils.book_new();
//     const ws = XLSX.utils.json_to_sheet([]);
//     XLSX.utils.book_append_sheet(wb, ws, SHEET);
//     XLSX.writeFile(wb, FILE);
//   }
//   return XLSX.readFile(FILE);
// }

// function getAllRows() {
//   const wb = loadWorkbook();
//   const ws = wb.Sheets[SHEET];
//   return XLSX.utils.sheet_to_json(ws) || [];
// }

// function appendRow(rowObj) {
//   const wb = loadWorkbook();
//   const ws = wb.Sheets[SHEET];
//   const data = XLSX.utils.sheet_to_json(ws) || [];
//   data.push(rowObj);
//   wb.Sheets[SHEET] = XLSX.utils.json_to_sheet(data, { origin: 'A1' });
//   XLSX.writeFile(wb, FILE);
// }

// module.exports = { getAllRows, appendRow };


// server/excel.js
/**
 * Tiny wrapper around SheetJS (xlsx) that
 *  • creates scans.xlsx the first time you call appendRow / getAllRows
 *  • never crashes your server – it throws detailed errors you’ll see in logs
 */

const fs   = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// const FILE  = path.join(__dirname, 'scans.xlsx'); // change to '/var/data/…' on Render + disk
const FILE  = path.join('/var/data',  'scans.xlsx');
const SHEET = 'scans';

function ensureWorkbookExists() {
  if (!fs.existsSync(FILE)) {
    console.log('[excel] Creating new workbook at', FILE);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([], { header: ['ip', 'ua', 'time'] }), SHEET);
    XLSX.writeFile(wb, FILE);
  }
}

function loadWorkbook() {
  ensureWorkbookExists();
  return XLSX.readFile(FILE, { cellDates: true });
}

function getAllRows() {
  const wb = loadWorkbook();
  const ws = wb.Sheets[SHEET];
  return XLSX.utils.sheet_to_json(ws) || [];
}

function appendRow(rowObj) {
  const wb = loadWorkbook();
  const ws = wb.Sheets[SHEET];
  const data = XLSX.utils.sheet_to_json(ws) || [];
  data.push(rowObj);

  wb.Sheets[SHEET] = XLSX.utils.json_to_sheet(data, { origin: 'A1' });
  XLSX.writeFile(wb, FILE);
  console.log('[excel] Appended row for IP', rowObj.ip);
}

module.exports = { getAllRows, appendRow };
