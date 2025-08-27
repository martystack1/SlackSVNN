function onFormSubmit(e) {
  const sheet = e.range.getSheet();
  const sheetName = sheet.getName(); // "MGEY", "ZEWR", or "ZACY"
  formatAndCopy(e, sheetName);
}

function formatAndCopy(e, location) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName("Formatted_Logs") || ss.insertSheet("Formatted_Logs");

  // Ensure headers exist
  ensureHeaders(logSheet);

  const row = e.values;  
  const timestamp = row[0];
  const user = row[1];           // Q1 = Name
  const slackUsername = row[2];  // Q2 = Slack Username (new column)
  const answers = row.slice(3);  // Then DD02..DD54, then PS01..PS41

  // Build labels
  const dockDoors = [];
  for (let i = 2; i <= 54; i++) dockDoors.push("DD" + (i < 10 ? "0" + i : i));
  const parking = [];
  for (let j = 1; j <= 41; j++) parking.push("PS" + (j < 10 ? "0" + j : j));

  // Helpers
  function padRight(s, n) {
    s = String(s == null ? "" : s);
    if (s.padEnd) return s.padEnd(n, " ");
    while (s.length < n) s += " ";
    return s;
  }
  function norm(v) {
    return String(v == null ? "" : v).trim().toUpperCase();
  }

  // Build Dock Doors table
  const dockLines = ["Dock    | ID", "--------|----------------"];
  for (let k = 0; k < dockDoors.length; k++) {
    const id = norm(answers[k] || "");
    dockLines.push(padRight(dockDoors[k], 7) + " | " + id);
  }
  const dockTable = dockLines.join("\n");

  // Build Parking Slips table
  const psLines = ["Slip    | ID", "--------|----------------"];
  for (let m = 0; m < parking.length; m++) {
    const id2 = norm(answers[dockDoors.length + m] || "");
    psLines.push(padRight(parking[m], 7) + " | " + id2);
  }
  const psTable = psLines.join("\n");

  // Insert new log at row 2 (newest on top)
  logSheet.insertRowBefore(2);
  logSheet.getRange(2, 1, 1, 6).setValues([
    [timestamp, location, user, slackUsername, dockTable, psTable]
  ]);
}

function ensureHeaders(sheet) {
  const headers = [
    "Timestamp",
    "Location",
    "Name",
    "Slack Username",
    "Dock Doors",
    "Parking Slips"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const headersMatch = headers.every((h, i) => firstRow[i] === h);
    if (!headersMatch) {
      sheet.insertRowBefore(1);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
}
