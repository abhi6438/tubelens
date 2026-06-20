function detectAI() {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { videoData, scores } = req.body;
  const ai = detectAI();
  if (!ai) return res.status(400).json({ error: 'No AI key configured — add GROQ_API_KEY to Vercel environment variables' });

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
    let text = '';

    if (ai === 'groq') {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 1000, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || 'Groq error');
      text = d.choices?.[0]?.message?.content;
    } else if (ai === 'gemini') {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1000 } })
      });
      const d = await r.json();
      text = d.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (ai === 'openai') {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
        body: JSON.stringify({ model: 'gpt-4o', max_tokens: 1000, messages: [{ role: 'user', content: prompt }], response_format: { type: 'json_object' } })
      });
      const d = await r.json();
      text = d.choices?.[0]?.message?.content;
    } else if (ai === 'anthropic') {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      });
      const d = await r.json();
      text = d.content?.[0]?.text;
    }

    const clean = text.replace(/```json\n?/g, '').replace(/\n?```/g, '').trim();
    const suggestions = JSON.parse(clean);
    if (typeof suggestions.tags === 'string') {
      suggestions.tags = suggestions.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
