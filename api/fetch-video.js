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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL — make sure it is a valid youtube.com or youtu.be link' });

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YouTube API key not configured');

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,statistics,contentDetails`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error?.message || 'YouTube API error');
    if (!data.items?.length) throw new Error('Video not found — make sure the video is public');

    const video = data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;
    const details = video.contentDetails;

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
}
