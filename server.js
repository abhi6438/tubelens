require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
// Serve React build in production
app.use(express.static(path.join(__dirname, 'dist')));

// Extract video ID from any YouTube URL format
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch video data from YouTube API
app.post('/api/fetch-video', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL — make sure it is a valid youtube.com or youtu.be link' });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YouTube API key not configured — add YOUTUBE_API_KEY to .env');

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');
    if (!data.items?.length) throw new Error('Video not found — make sure the video is public');

    const video = data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;
    const details = video.contentDetails;

    // Parse duration (PT4M13S → seconds)
    const durationMatch = details.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const durationSeconds = (parseInt(durationMatch[1] || 0) * 3600) +
                           (parseInt(durationMatch[2] || 0) * 60) +
                           (parseInt(durationMatch[3] || 0));

    res.json({
      videoId,
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags || [],
      thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url,
      channelTitle: snippet.channelTitle,
      publishedAt: snippet.publishedAt,
      categoryId: snippet.categoryId,
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0),
      comments: parseInt(stats.commentCount || 0),
      durationSeconds,
      defaultLanguage: snippet.defaultLanguage || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze video and return scores
app.post('/api/analyze', async (req, res) => {
  const { videoData } = req.body;
  if (!videoData) return res.status(400).json({ error: 'Video data required' });

  const { title, description, tags, durationSeconds, thumbnail, views, likes } = videoData;

  const issues = [];
  const scores = {};

  // --- TITLE SCORE ---
  let titleScore = 10;
  const titleIssues = [];
  if (!title) { titleScore = 0; titleIssues.push('No title found'); }
  else {
    if (title.length < 30) { titleScore -= 3; titleIssues.push('Title is too short (under 30 characters) — add more keywords'); }
    if (title.length > 70) { titleScore -= 2; titleIssues.push('Title is too long (over 70 characters) — YouTube cuts it off in search'); }
    if (title === title.toLowerCase()) { titleScore -= 2; titleIssues.push('Title has no capital letters — use Title Case for more clicks'); }
    if (!/[?!:]/.test(title)) { titleScore -= 1; titleIssues.push('No power punctuation (?, !, :) — these increase click rate'); }
    if (title.length >= 40 && title.length <= 60 && title !== title.toLowerCase()) titleScore = Math.min(titleScore + 1, 10);
  }
  scores.title = { score: Math.max(titleScore, 0), issues: titleIssues };

  // --- DESCRIPTION SCORE ---
  let descScore = 10;
  const descIssues = [];
  if (!description || description.length < 50) { descScore = 2; descIssues.push('Description is too short or missing — YouTube uses this to understand your video'); }
  else {
    if (description.length < 200) { descScore -= 3; descIssues.push('Description is too short (under 200 words) — add more detail about the video'); }
    if (description.length < 500) { descScore -= 1; descIssues.push('Description under 500 characters — longer descriptions rank better'); }
    if (!description.includes('http') && !description.includes('www')) { descScore -= 1; descIssues.push('No links in description — add your social media or website links'); }
    if (description.split('\n').length < 3) { descScore -= 1; descIssues.push('Description has no line breaks — use formatting to make it readable'); }
  }
  scores.description = { score: Math.max(descScore, 0), issues: descIssues };

  // --- TAGS SCORE ---
  let tagsScore = 10;
  const tagsIssues = [];
  if (!tags || tags.length === 0) { tagsScore = 0; tagsIssues.push('No tags added — tags help YouTube understand your video topic'); }
  else {
    if (tags.length < 5) { tagsScore -= 4; tagsIssues.push(`Only ${tags.length} tags — add at least 10-15 tags for better reach`); }
    if (tags.length < 10) { tagsScore -= 2; tagsIssues.push('Add more tags — aim for 15-20 relevant tags'); }
    if (tags.some(t => t.length > 30)) { tagsScore -= 1; tagsIssues.push('Some tags are too long — keep tags short and specific'); }
    if (tags.length >= 15) tagsScore = Math.min(tagsScore + 1, 10);
  }
  scores.tags = { score: Math.max(tagsScore, 0), issues: tagsIssues };

  // --- THUMBNAIL SCORE (basic check) ---
  let thumbScore = 10;
  const thumbIssues = [];
  if (!thumbnail) { thumbScore = 3; thumbIssues.push('No custom thumbnail — add a custom thumbnail for 3x more clicks'); }
  else {
    thumbIssues.push('Thumbnail found ✓ — make sure it has bold text and a clear face/image');
    thumbScore = 7; // Can't fully analyze without vision AI
  }
  scores.thumbnail = { score: thumbScore, issues: thumbIssues };

  // --- ENGAGEMENT SCORE ---
  let engScore = 10;
  const engIssues = [];
  const likeRatio = views > 0 ? (likes / views) * 100 : 0;
  if (views < 100) { engScore -= 3; engIssues.push(`Only ${views} views — focus on sharing in communities and groups`); }
  if (likes === 0) { engScore -= 3; engIssues.push('No likes — ask viewers to like at the start and end of video'); }
  if (likeRatio < 2 && views > 100) { engScore -= 2; engIssues.push(`Like ratio is ${likeRatio.toFixed(1)}% — good videos get 3-5%+ likes`); }
  if (views > 0 && likes > 0) engIssues.push(`Like ratio: ${likeRatio.toFixed(1)}%`);
  scores.engagement = { score: Math.max(engScore, 0), issues: engIssues };

  // Overall score
  const overall = Math.round(Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.keys(scores).length);

  res.json({ scores, overall, videoData });
});

// AI suggestions
function detectAI() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

app.post('/api/suggestions', async (req, res) => {
  const { videoData, scores } = req.body;
  const ai = detectAI();
  if (!ai) return res.status(400).json({ error: 'No AI key configured — add GROQ_API_KEY to .env for free suggestions' });

  const prompt = `You are a YouTube growth expert helping a beginner creator. Analyze this video data and give specific, actionable suggestions.

VIDEO DATA:
Title: "${videoData.title}"
Description (first 300 chars): "${videoData.description?.substring(0, 300)}"
Tags: ${JSON.stringify(videoData.tags?.slice(0, 10))}
Views: ${videoData.views}
Likes: ${videoData.likes}

SCORES:
Title: ${scores.title.score}/10
Description: ${scores.description.score}/10  
Tags: ${scores.tags.score}/10
Engagement: ${scores.engagement.score}/10

Give me:
1. A better title (2 options)
2. Better tags (15 tags as comma separated list)
3. A better description opening (first 3 lines only)
4. One most important tip for this creator

Keep language simple — this is a beginner creator. Be specific, not generic.
Respond in JSON format:
{
  "titleOptions": ["title1", "title2"],
  "tags": ["tag1", "tag2", ...],
  "descriptionOpening": "...",
  "topTip": "..."
}`;

  try {
    let html = '';

    if (ai === 'groq') {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || 'Groq error');
      html = d.choices?.[0]?.message?.content;
    } else if (ai === 'gemini') {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1000 } })
      });
      const d = await r.json();
      html = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (ai === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o', max_tokens: 1000, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
      });
      const d = await r.json();
      html = d.choices?.[0]?.message?.content;
    } else if (ai === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      html = d.content?.[0]?.text;
    }

    const clean = html.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    const suggestions = JSON.parse(clean);
    // Normalize tags — some AIs return a comma-separated string instead of an array
    if (typeof suggestions.tags === 'string') {
      suggestions.tags = suggestions.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    youtube: !!process.env.YOUTUBE_API_KEY,
    ai: detectAI()
  });
});

// SPA fallback — serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n✅ TubeLens running at http://localhost:${PORT}`);
  console.log(`🎬 YouTube API: ${process.env.YOUTUBE_API_KEY ? '✅' : '❌ Missing'}`);
  console.log(`🤖 AI: ${detectAI() || '❌ Missing — add GROQ_API_KEY for free AI'}\n`);
});
