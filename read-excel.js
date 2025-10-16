const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('./file/info2.xlsx');

// Get all sheet names
const sheetNames = workbook.SheetNames;
console.log('Sheet names:', sheetNames);

// Process all sheets
const allData = {};
sheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    allData[sheetName] = jsonData;
    console.log(`\n${sheetName}:`, JSON.stringify(jsonData, null, 2));
});

// Save to JSON file for easier integration
fs.writeFileSync('./data.json', JSON.stringify(allData, null, 2));
console.log('\nData saved to data.json');
