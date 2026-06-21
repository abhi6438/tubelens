import { useState } from 'react'

// Category-specific thumbnail checklist rules
const CATEGORY_RULES = {
  gaming: {
    emoji: '🎮',
    name: 'Gaming',
    rules: [
      { icon: '😮', text: 'Show a big reaction face (shocked, excited, scared)' },
      { icon: '🔴', text: 'Use bright colors — red, yellow, orange pop the most' },
      { icon: '✏️', text: 'Add 2–4 bold words on the thumbnail' },
      { icon: '🎯', text: 'Show the game or a key moment in the background' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  education: {
    emoji: '📚',
    name: 'Education',
    rules: [
      { icon: '❓', text: 'Use a question or number — "5 Ways to..." or "Why does...?"' },
      { icon: '🧑', text: 'Show your face looking directly at the viewer' },
      { icon: '🔵', text: 'Use clean, simple backgrounds — blue or white works well' },
      { icon: '✏️', text: 'Add 3–5 bold words that explain the benefit' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  howto: {
    emoji: '🔧',
    name: 'How-To',
    rules: [
      { icon: '✅', text: 'Show the finished result — the "after" not the "before"' },
      { icon: '🔢', text: 'Use numbers — "3 Steps", "In 10 Minutes" gets more clicks' },
      { icon: '🟡', text: 'Warm colors (orange, yellow) feel helpful and approachable' },
      { icon: '📸', text: 'Close-up shot of the result works better than wide shots' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  cooking: {
    emoji: '🍳',
    name: 'Cooking',
    rules: [
      { icon: '🍽️', text: 'Show the finished dish in the best light possible' },
      { icon: '🌡️', text: 'Warm, bright colors — steam, golden crust, vibrant garnish' },
      { icon: '😋', text: 'Your reaction face beside the dish increases clicks' },
      { icon: '✏️', text: 'Add the dish name in bold text — make it mouth-watering' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  entertainment: {
    emoji: '🎬',
    name: 'Entertainment',
    rules: [
      { icon: '😲', text: 'Extreme emotion on your face — surprised, laughing, shocked' },
      { icon: '🔴', text: 'Bold red/yellow text with a dark background for contrast' },
      { icon: '⭐', text: 'If featuring someone, show their face clearly' },
      { icon: '💥', text: 'Use arrows or circles to highlight the key thing' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  music: {
    emoji: '🎵',
    name: 'Music',
    rules: [
      { icon: '🎤', text: 'Show the artist or performer as the main focus' },
      { icon: '🌆', text: 'Moody or vibrant backgrounds that match the song feel' },
      { icon: '✨', text: 'Use the song title in a stylish font' },
      { icon: '🎨', text: 'Match thumbnail colors to the mood — dark for emotional, bright for upbeat' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  news: {
    emoji: '📰',
    name: 'News',
    rules: [
      { icon: '📢', text: 'Use a bold headline-style text — short and direct' },
      { icon: '😐', text: 'Serious, authoritative face expression builds trust' },
      { icon: '🔵', text: 'Clean, professional look — blue or red for urgency' },
      { icon: '🖼️', text: 'Use a relevant image or graphic behind the text' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  sports: {
    emoji: '⚽',
    name: 'Sports',
    rules: [
      { icon: '📸', text: 'Use an action shot — movement and energy grab attention' },
      { icon: '🏆', text: 'Show the result or score if it is exciting' },
      { icon: '🔴', text: 'Team colors in the background create instant recognition' },
      { icon: '✏️', text: 'Add 2–3 power words — "UNBELIEVABLE", "INSANE GOAL"' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
  default: {
    emoji: '🖼️',
    name: 'General',
    rules: [
      { icon: '😮', text: 'Show an expressive face — emotion drives clicks' },
      { icon: '✏️', text: 'Add 3–5 bold words that create curiosity' },
      { icon: '🎨', text: 'Use high contrast — bright text on dark background or vice versa' },
      { icon: '📐', text: 'Keep it simple — one main subject, not a cluttered scene' },
    ],
    canvaTemplate: 'https://www.canva.com/create/youtube-thumbnails/',
  },
}

function getCategoryKey(categoryId) {
  const id = String(categoryId)
  if (id === '20') return 'gaming'
  if (id === '27' || id === '28') return 'education'
  if (id === '25') return 'news'
  if (id === '24' || id === '23' || id === '1') return 'entertainment'
  if (id === '10') return 'music'
  if (id === '26' || id === '19' || id === '15' || id === '2') return 'howto'
  if (id === '17') return 'sports'
  return 'default'
}

function copyText(text, setCopied, key) {
  navigator.clipboard.writeText(text).then(() => {
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  })
}

export default function ThumbnailCard({ videoData, suggestions, loading }) {
  const [copied, setCopied] = useState(null)
  const [imgError, setImgError] = useState(false)

  const catKey  = getCategoryKey(videoData?.categoryId)
  const cat     = CATEGORY_RULES[catKey]
  const hasThumbnail = videoData?.thumbnail && !imgError
  const textOptions  = suggestions?.thumbnailTextOptions || []
  const designTip    = suggestions?.thumbnailDesignTip || ''

  return (
    <div className="thumb-card">
      {/* Header */}
      <div className="thumb-header">
        <span className="thumb-title">🖼️ Thumbnail Enhancer</span>
        <span className="thumb-badge">{cat.emoji} {cat.name}</span>
      </div>

      <div className="thumb-body">

        {/* Current thumbnail */}
        <div className="thumb-section">
          <div className="thumb-section-label">Your Current Thumbnail</div>
          <div className="thumb-preview-wrap">
            {hasThumbnail ? (
              <img
                src={videoData.thumbnail}
                alt="Current thumbnail"
                className="thumb-preview-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="thumb-preview-empty">
                <span>No custom thumbnail set</span>
                <span className="thumb-preview-sub">Adding one can get 3× more clicks</span>
              </div>
            )}
            {hasThumbnail && (
              <div className="thumb-preview-label">
                ↑ This is what viewers see on YouTube
              </div>
            )}
          </div>
        </div>

        {/* AI design tip */}
        {(loading || designTip) && (
          <div className="thumb-design-tip">
            <span className="thumb-design-tip-icon">💡</span>
            <span>{loading && !designTip ? 'AI is analyzing your thumbnail style…' : designTip}</span>
          </div>
        )}

        {/* AI text overlay ideas */}
        <div className="thumb-section">
          <div className="thumb-section-label">
            AI Text Overlay Ideas
            <span className="thumb-section-sub"> — add this text on your thumbnail in Canva</span>
          </div>
          {loading && textOptions.length === 0 ? (
            <div className="thumb-loading">
              <div className="spinner" style={{ width: 16, height: 16 }} />
              Generating catchy text ideas…
            </div>
          ) : textOptions.length > 0 ? (
            <div className="thumb-text-options">
              {textOptions.map((text, i) => (
                <div key={i} className="thumb-text-row">
                  <span className="thumb-text-preview">{text}</span>
                  <button
                    className={`copy-btn${copied === i ? ' copied' : ''}`}
                    onClick={() => copyText(text, setCopied, i)}
                  >
                    {copied === i ? '✓' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="thumb-text-options">
              <div className="thumb-placeholder-row">Text ideas will appear after analysis</div>
            </div>
          )}
        </div>

        {/* Category checklist */}
        <div className="thumb-section">
          <div className="thumb-section-label">
            {cat.emoji} {cat.name} Thumbnail Checklist
          </div>
          <div className="thumb-checklist">
            {cat.rules.map((rule, i) => (
              <div key={i} className="thumb-check-item">
                <span className="thumb-check-icon">{rule.icon}</span>
                <span className="thumb-check-text">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — Canva */}
        <a
          className="thumb-canva-btn"
          href={cat.canvaTemplate}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>🎨 Design New Thumbnail in Canva</span>
          <span className="thumb-canva-sub">Free · 1280×720 YouTube template →</span>
        </a>

        <p className="thumb-hint">
          After designing, upload your new thumbnail in YouTube Studio → your video → Details → Thumbnail — no re-uploading the video needed.
        </p>
      </div>
    </div>
  )
}
