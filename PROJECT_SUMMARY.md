# TubeLens — Project Summary
> Give this file to Claude in VS Code (Cline) or Claude.ai and say:
> "Read PROJECT_SUMMARY.md and continue from here"

---

## What this project is
A free YouTube video analyzer tool for beginner creators.
Paste a YouTube video URL → get a score card showing exactly what's wrong → AI suggestions to fix it.

**Problem it solves:** New YouTubers (like a friend who posts videos and gets 50-100 views, 0 likes) don't know WHY they get no views. They don't know about titles, tags, descriptions, thumbnails.

**Competitor tools:** TubeBuddy ($9-50/month), VidIQ ($10-49/month) — too expensive and complex for beginners.

**Our advantage:** Free forever. Simple. Built specifically for complete beginners.

---

## Project structure
```
tubelens/
├── server.js           — Express server (YouTube API + AI proxy)
├── public/
│   └── index.html      — Full frontend UI (dark theme, score cards, AI suggestions)
├── package.json        — Dependencies: express, node-fetch, dotenv
├── .env                — API keys (NOT in zip — user creates this)
├── .env.example        — Template showing which keys to add
└── README.txt          — Setup instructions
```

---

## How to run
```bash
npm install       # first time only
npm start         # starts at http://localhost:3001
```

---

## How it works (pipeline)
1. User pastes YouTube URL (youtube.com, youtu.be, Shorts all supported)
2. Server extracts video ID from URL
3. Calls YouTube Data API v3 → fetches title, description, tags, thumbnail, views, likes, comments, duration
4. Scoring engine analyzes 5 categories (all pure code logic, no AI needed):
   - Title (length, capitalization, power punctuation)
   - Description (length, links, formatting)
   - Tags (count, length)
   - Thumbnail (presence check)
   - Engagement (views, likes, like ratio)
5. Each category scored 0-10 with specific issue list
6. Overall score calculated (average of 5)
7. UI renders animated score ring + color-coded cards
8. AI (Groq/Gemini/OpenAI/Anthropic) generates:
   - 2 better title options
   - 15 suggested tags
   - Better description opening (3 lines)
   - Top 1 tip for this creator

---

## API endpoints (server.js)
- `POST /api/fetch-video`   — fetches video data from YouTube API
  - body: { url }
  - returns: { videoId, title, description, tags, thumbnail, views, likes, comments, durationSeconds, publishedAt }

- `POST /api/analyze`       — scores the video (pure logic, no AI)
  - body: { videoData }
  - returns: { scores: { title, description, tags, thumbnail, engagement }, overall }

- `POST /api/suggestions`   — AI-powered fix suggestions
  - body: { videoData, scores }
  - returns: { titleOptions[], tags[], descriptionOpening, topTip }

- `GET  /api/status`        — returns { youtube: bool, ai: string }

---

## Environment variables needed (.env file)
```
YOUTUBE_API_KEY=   # From console.cloud.google.com → YouTube Data API v3 → Credentials
GROQ_API_KEY=      # From console.groq.com (FREE)

# Optional alternatives for AI:
# GEMINI_API_KEY=
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
```

---

## AI support (auto-detected from .env)
Priority: Groq → Gemini → OpenAI → Anthropic
Only ONE key needed.

| Provider | Key | Model | Cost |
|---|---|---|---|
| Groq | GROQ_API_KEY | llama-3.3-70b-versatile | FREE |
| Gemini | GEMINI_API_KEY | gemini-2.0-flash | Free tier |
| OpenAI | OPENAI_API_KEY | gpt-4o | Paid |
| Anthropic | ANTHROPIC_API_KEY | claude-sonnet-4-6 | Paid |

---

## Scoring logic (server.js — analyze endpoint)

### Title (0-10)
- Under 30 chars → -3
- Over 70 chars → -2
- All lowercase → -2
- No ?, !, : → -1
- 40-60 chars + proper case → +1 bonus

### Description (0-10)
- Under 50 chars → score = 2
- Under 200 chars → -3
- Under 500 chars → -1
- No links → -1
- Less than 3 line breaks → -1

### Tags (0-10)
- No tags → score = 0
- Under 5 tags → -4
- Under 10 tags → -2
- Tags over 30 chars → -1
- 15+ tags → +1 bonus

### Thumbnail (0-10)
- No thumbnail → score = 3
- Has thumbnail → score = 7 (can't fully analyze without vision AI)

### Engagement (0-10)
- Under 100 views → -3
- Zero likes → -3
- Like ratio under 2% → -2

---

## Current status
- ✅ YouTube API connection works
- ✅ Video data extraction works
- ✅ Scoring engine works (5 categories)
- ✅ Animated score ring + color coded cards
- ✅ AI suggestions (title, tags, description, tip)
- ✅ Copy to clipboard for all suggestions
- ✅ Dark theme UI with TubeLens branding
- ✅ Mobile responsive
- ✅ Multi-AI support (Groq/Gemini/OpenAI/Anthropic)
- ❌ Instagram analyzer (Phase 2)
- ❌ Facebook analyzer (Phase 2)
- ❌ Thumbnail visual analysis (needs vision AI)
- ❌ Channel health score (analyze full channel)
- ❌ Competitor analysis
- ❌ Best time to post suggestions

---

## Next improvements planned
1. **Thumbnail analyzer** — upload thumbnail image → AI scores contrast, text size, face presence
2. **Instagram Reels analyzer** — same concept using Meta Graph API
3. **Channel health score** — analyze entire channel not just one video
4. **Competitor comparison** — show top 5 similar videos and what they did right
5. **Best time to post** — based on video category/niche
6. **Progress tracker** — compare scores week over week

---

## Design notes
- Dark theme: `#0A0F1E` background, `#FF4500` YouTube red-orange accent
- Fonts: Space Grotesk (headings) + Inter (body)
- Signature element: Animated SVG score ring that fills on load
- Score colors: Green (#22C55E) = 7-10, Yellow (#EAB308) = 4-6, Red (#EF4444) = 0-3
- Cards have colored top border based on score

---

## How to continue in VS Code with Cline
1. Install **Cline** extension in VS Code
2. Add your Groq API key to Cline settings
3. Open the `tubelens` folder in VS Code
4. Give Cline access to the folder
5. Start chat and say:
   > "Read PROJECT_SUMMARY.md and continue improving TubeLens. I want to add [feature]."
