export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { videoData } = req.body;
  if (!videoData) return res.status(400).json({ error: 'Video data required' });

  const { title, description, tags, thumbnail, views, likes } = videoData;
  const scores = {};

  // TITLE
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

  // DESCRIPTION
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

  // TAGS
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

  // THUMBNAIL
  let thumbScore = 10;
  const thumbIssues = [];
  if (!thumbnail) { thumbScore = 3; thumbIssues.push('No custom thumbnail — add a custom thumbnail for 3x more clicks'); }
  else { thumbIssues.push('Thumbnail found ✓ — make sure it has bold text and a clear face/image'); thumbScore = 7; }
  scores.thumbnail = { score: thumbScore, issues: thumbIssues };

  // ENGAGEMENT
  let engScore = 10;
  const engIssues = [];
  const likeRatio = views > 0 ? (likes / views) * 100 : 0;
  if (views < 100) { engScore -= 3; engIssues.push(`Only ${views} views — focus on sharing in communities and groups`); }
  if (likes === 0) { engScore -= 3; engIssues.push('No likes — ask viewers to like at the start and end of video'); }
  if (likeRatio < 2 && views > 100) { engScore -= 2; engIssues.push(`Like ratio is ${likeRatio.toFixed(1)}% — good videos get 3-5%+ likes`); }
  if (views > 0 && likes > 0) engIssues.push(`Like ratio: ${likeRatio.toFixed(1)}%`);
  scores.engagement = { score: Math.max(engScore, 0), issues: engIssues };

  const overall = Math.round(Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.keys(scores).length);
  res.json({ scores, overall, videoData });
}
