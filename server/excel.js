// server/excel.js
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

const FILE = path.join(__dirname, 'scans.xlsx');
const SHEET = 'scans';

function loadWorkbook() {
  if (!fs.existsSync(FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, SHEET);
    XLSX.writeFile(wb, FILE);
  }
  return XLSX.readFile(FILE);
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
}

module.exports = { getAllRows, appendRow };
