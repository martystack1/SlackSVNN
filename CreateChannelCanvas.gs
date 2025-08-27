function createChannelCanvas() {
  const token = PropertiesService.getScriptProperties().getProperty("SLACK_BOT_TOKEN");
  if (!token) throw new Error("Missing SLACK_BOT_TOKEN");

  const channelId = "C099R6FBN56"; // 

  const body = {
    channel_id: channelId,
    document_content: { type: "markdown", markdown: "# Yard Check Logs\n\n" }
  };

  const resp = UrlFetchApp.fetch("https://slack.com/api/conversations.canvases.create", {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify(body)
  });

  const data = JSON.parse(resp.getContentText());
  if (!data.ok) throw new Error("Slack error: " + data.error);
  Logger.log("Canvas created for channel. ID: " + data.canvas_id);
}
