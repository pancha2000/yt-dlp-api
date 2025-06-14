require('dotenv').config(); // Load environment variables from .env file

const express = require("express");
const { execFile } = require("child_process"); // Use execFile for security
const { URL } = require('url'); // For robust URL validation

const app = express();
const port = process.env.PORT || 3000;
const PROXY_URL = process.env.PROXY_URL; // Optional: Read proxy URL from .env

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
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Invalid URL protocol. Must be http or https." });
    }
    // You can add more specific YouTube URL validation here if needed
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  const args = ["-f", "bestaudio", "--get-url", url];

  // Add proxy arguments if PROXY_URL is set
  if (PROXY_URL) {
    args.unshift("--proxy", PROXY_URL);
    console.log(`Using proxy: ${PROXY_URL}`); // For debugging
  }

  execFile("yt-dlp", args, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error fetching audio URL for ${url}: ${stderr}`);
      // Return a more user-friendly error, but include details for debugging
      // Filter out some common non-fatal warnings from stderr for cleaner error messages
      const cleanStderr = stderr.split('\n').filter(line => !line.startsWith('WARNING:')).join('\n').trim();
      return res.status(500).json({
        error: "Failed to retrieve audio URL. Make sure the URL is valid, yt-dlp can access it, and it's not restricted by YouTube's bot detection.",
        details: cleanStderr || "No specific details available."
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
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return res.status(400).json({ error: "Invalid URL protocol. Must be http or https." });
    }
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  const args = ["-f", "bestvideo+bestaudio", "--get-url", url];

  // Add proxy arguments if PROXY_URL is set
  if (PROXY_URL) {
    args.unshift("--proxy", PROXY_URL);
    console.log(`Using proxy: ${PROXY_URL}`); // For debugging
  }

  execFile("yt-dlp", args, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error fetching video URL for ${url}: ${stderr}`);
      const cleanStderr = stderr.split('\n').filter(line => !line.startsWith('WARNING:')).join('\n').trim();
      return res.status(500).json({
        error: "Failed to retrieve video URL. Make sure the URL is valid, yt-dlp can access it, and it's not restricted by YouTube's bot detection.",
        details: cleanStderr || "No specific details available."
      });
    }
    if (stderr) {
        console.warn(`yt-dlp stderr for video (non-fatal): ${stderr}`);
    }
    res.json({ video_url: stdout.trim() });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});