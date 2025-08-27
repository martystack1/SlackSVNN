function postLatestToSlackCanvas() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("SLACK_BOT_TOKEN");
  const canvasId = props.getProperty("SLACK_CANVAS_ID");
  const channelId = props.getProperty("SLACK_CHANNEL_ID");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName("Formatted_Logs"); // <- keep this name consistent
  if (!logSheet) throw new Error('Sheet "Formatted_Logs" not found');

  // newest entry lives at row 2 under headers: A:Timestamp, B:Location, C:Name, D:Dock, E:Parking
  const row = logSheet.getRange(2, 1, 1, 5).getValues()[0];
  const [timestamp, location, name, dockTable, psTable] = row;

  const ts = new Date(timestamp);
  const formattedTimestamp = Utilities.formatDate(ts, "America/New_York", "EEE MM/dd/yyyy h:mm a 'EST'");

  // Turn your ASCII tables into "DD02 — ABC123" / "PS01 — XYZ789" lines
  function parseAsciiTable(tbl) {
    const lines = String(tbl || "").split("\n").slice(2); // skip header + separator
    return lines.map(line => {
      const parts = line.split("|");
      if (parts.length >= 2) {
        const label = parts[0].trim(); // e.g., "DD02"
        const id = parts[1].trim();    // e.g., "ABC123"
        return `${label} — ${id}`;
      }
      return line.trim();
    }).filter(Boolean);
  }

  const dockRows = parseAsciiTable(dockTable);
  const psRows = parseAsciiTable(psTable);
  const maxLen = Math.max(dockRows.length, psRows.length);

  // Build a 2-column Markdown table (supported by Canvas API)
  const tableLines = [];
  tableLines.push("| Dock Doors | Parking Slips |");
  tableLines.push("|---|---|");
  for (let i = 0; i < maxLen; i++) {
    const left = dockRows[i] || "";
    const right = psRows[i] || "";
    // Escape pipes in cell content just in case
    tableLines.push(`| ${left.replace(/\|/g, "\\|")} | ${right.replace(/\|/g, "\\|")} |`);
  }
  const twoColTable = tableLines.join("\n");

  // Full markdown document for Canvas
  const markdown =
    `# ${location} Yard Check\n` +
    `## ${name}, ${formattedTimestamp}\n\n` +
    `${twoColTable}\n\n` +
    "---";

  // Prepend to Canvas
  const canvasPayload = {
    canvas_id: canvasId,
    changes: [{
      operation: "insert_at_start",
      document_content: { type: "markdown", markdown }
    }]
  };

  const canvasResp = UrlFetchApp.fetch("https://slack.com/api/canvases.edit", {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify(canvasPayload),
    muteHttpExceptions: true
  });
  Logger.log("Canvas response: " + canvasResp.getContentText());

  // Post the channel notification
  const msgPayload = {
    channel: channelId,
    text: `${name} just Submitted ${location} Yard Check. (${formattedTimestamp})`
  };
  const msgResp = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", {
    method: "post",
    contentType: "application/json; charset=utf-8",
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify(msgPayload),
    muteHttpExceptions: true
  });
  Logger.log("Message response: " + msgResp.getContentText());
}
