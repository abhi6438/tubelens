function detectAI() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

export default function handler(req, res) {
  res.json({
    youtube: !!process.env.YOUTUBE_API_KEY,
    ai: detectAI()
  });
}
