# YT Analyzer — Setup

## One-time setup

### Step 1 — Install Node.js
Download from https://nodejs.org (LTS version)

### Step 2 — Get YouTube Data API key (FREE)
1. Go to https://console.cloud.google.com
2. Create a new project
3. Search "YouTube Data API v3" → Enable it
4. Go to Credentials → Create API Key
5. Copy the key

### Step 3 — Get Groq API key (FREE AI suggestions)
1. Go to https://console.groq.com
2. Sign up free → API Keys → Create Key
3. Copy the key

### Step 4 — Install dependencies
Open Terminal in this folder:
    npm install

### Step 5 — Add your keys
Copy .env.example → rename to .env
Add your keys:
    YOUTUBE_API_KEY=your_key_here
    GROQ_API_KEY=your_key_here

## Every time you use it
    npm start
Open: http://localhost:3001
