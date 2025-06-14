require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const { execFile } = require("child_process"); // Use execFile for security

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🎵 YouTube Download API is running.");
});

app.get("/audio", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL parameter." });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  // Using execFile to prevent command injection
  // The URL is passed as a separate argument, not as part of the command string
  execFile("yt-dlp", ["-f", "bestaudio", "--get-url", url], (err, stdout, stderr) => {
    if (err) {
      console.error(`Error fetching audio URL for ${url}: ${stderr}`);
      // Return a more user-friendly error, but include details for debugging
      return res.status(500).json({
        error: "Failed to retrieve audio URL. Make sure the URL is valid and yt-dlp can access it.",
        details: stderr.trim()
      });
    }
    // yt-dlp might output warnings to stderr even on success
    if (stderr) {
        console.warn(`yt-dlp stderr for audio (non-fatal): ${stderr}`);
    }
    res.json({ audio_url: stdout.trim() });
  });
});

app.get("/video", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL parameter." });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  // Using execFile to prevent command injection
  // The URL is passed as a separate argument, not as part of the command string
  execFile("yt-dlp", ["-f", "bestvideo+bestaudio", "--get-url", url], (err, stdout, stderr) => {
    if (err) {
      console.error(`Error fetching video URL for ${url}: ${stderr}`);
      // Return a more user-friendly error, but include details for debugging
      return res.status(500).json({
        error: "Failed to retrieve video URL. Make sure the URL is valid and yt-dlp can access it.",
        details: stderr.trim()
      });
    }
    // yt-dlp might output warnings to stderr even on success
    if (stderr) {
        console.warn(`yt-dlp stderr for video (non-fatal): ${stderr}`);
    }
    res.json({ video_url: stdout.trim() });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});