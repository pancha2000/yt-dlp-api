const express = require("express");
const { exec } = require("child_process");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🎵 YouTube Download API is running.");
});

app.get("/audio", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

  exec(`yt-dlp -f bestaudio --get-url "${url}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ audio_url: stdout.trim() });
  });
});

app.get("/video", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing YouTube URL" });

  exec(`yt-dlp -f bestvideo+bestaudio --get-url "${url}"`, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr });
    res.json({ video_url: stdout.trim() });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});