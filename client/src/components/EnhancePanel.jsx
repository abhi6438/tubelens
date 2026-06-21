import { useState, useEffect } from 'react'

function copyToClipboard(text, onDone) {
  navigator.clipboard.writeText(text).then(() => {
    onDone()
    setTimeout(onDone, 2200)
  })
}

export default function EnhancePanel({ videoData, suggestions, loading }) {
  const [title, setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags]         = useState([])
  const [tagInput, setTagInput] = useState('')
  const [copiedField, setCopiedField] = useState(null) // 'title'|'desc'|'tags'|'all'

  // Init with original video data immediately
  useEffect(() => {
    if (!videoData) return
    setTitle(videoData.title || '')
    setDescription(videoData.description?.substring(0, 800) || '')
    setTags(videoData.tags?.slice(0, 20) || [])
  }, [videoData])

  // When AI suggestions arrive, upgrade the fields
  useEffect(() => {
    if (!suggestions) return
    if (suggestions.titleOptions?.[0]) setTitle(suggestions.titleOptions[0])
    if (suggestions.descriptionOpening) setDescription(suggestions.descriptionOpening)
    if (suggestions.tags?.length) {
      const aiTags  = Array.isArray(suggestions.tags) ? suggestions.tags : []
      const origTags = videoData?.tags || []
      const merged   = [...new Set([...aiTags, ...origTags])].slice(0, 25)
      setTags(merged)
    }
  }, [suggestions])

  const markCopied = (field) => {
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2200)
  }

  const removeTag = (i) => setTags(tags.filter((_, idx) => idx !== i))
  const handleTagKey = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags(prev => [...new Set([...prev, tagInput.trim()])])
      setTagInput('')
    }
  }

  const copyAll = () => {
    const text = `TITLE:\n${title}\n\nDESCRIPTION:\n${description}\n\nTAGS:\n${tags.join(', ')}`
    copyToClipboard(text, () => markCopied('all'))
  }

  return (
    <div className="enhance-card">
      <div className="enhance-header">
        <span className="enhance-title">🚀 Enhance Your Video</span>
        <span className="ai-badge">{loading ? '⏳ AI enhancing…' : '✨ AI Pre-filled'}</span>
      </div>

      <div className="enhance-body">

        {/* ── Title ── */}
        <div className="enhance-section">
          <div className="enhance-label">Video Title</div>
          {videoData?.title && (
            <div className="enhance-current">Current: <em>{videoData.title}</em></div>
          )}
          <div className="enhance-field-row">
            <input
              className="enhance-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Improved title…"
            />
            <button
              className={`copy-btn${copiedField === 'title' ? ' copied' : ''}`}
              onClick={() => copyToClipboard(title, () => markCopied('title'))}
            >
              {copiedField === 'title' ? '✓' : 'Copy'}
            </button>
          </div>
          {/* Quick-pick AI title options */}
          {suggestions?.titleOptions?.length > 0 && (
            <div className="enhance-options">
              <span className="enhance-options-label">AI options — click to use:</span>
              {suggestions.titleOptions.map((t, i) => (
                <button
                  key={i}
                  className={`enhance-option-btn${title === t ? ' active' : ''}`}
                  onClick={() => setTitle(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Description ── */}
        <div className="enhance-section">
          <div className="enhance-label">Description Opening</div>
          <textarea
            className="enhance-textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            placeholder="Improved description…"
          />
          <button
            className={`copy-btn${copiedField === 'desc' ? ' copied' : ''}`}
            style={{ marginTop: 6 }}
            onClick={() => copyToClipboard(description, () => markCopied('desc'))}
          >
            {copiedField === 'desc' ? '✓ Copied!' : 'Copy description'}
          </button>
        </div>

        {/* ── Tags ── */}
        <div className="enhance-section">
          <div className="enhance-label">
            Tags
            <span className="enhance-label-sub"> — click × to remove</span>
          </div>
          <div className="enhance-tags">
            {tags.map((t, i) => (
              <span key={i} className="enhance-tag">
                {t}
                <button className="enhance-tag-remove" onClick={() => removeTag(i)}>×</button>
              </span>
            ))}
          </div>
          <input
            className="enhance-tag-input"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
            placeholder="Type a tag and press Enter to add…"
          />
          <button
            className={`copy-btn${copiedField === 'tags' ? ' copied' : ''}`}
            style={{ marginTop: 6 }}
            onClick={() => copyToClipboard(tags.join(', '), () => markCopied('tags'))}
          >
            {copiedField === 'tags' ? '✓ Copied!' : 'Copy all tags'}
          </button>
        </div>

        {/* ── CTA ── */}
        <div className="enhance-cta">
          <button
            className={`enhance-copy-all${copiedField === 'all' ? ' copied' : ''}`}
            onClick={copyAll}
          >
            {copiedField === 'all' ? '✓ Copied! Now paste in YouTube Studio' : '📋 Copy Everything'}
          </button>
          <a
            className="enhance-studio-btn"
            href={`https://studio.youtube.com/video/${videoData?.videoId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open YouTube Studio →
          </a>
        </div>

        <p className="enhance-hint">
          Edit the fields above, copy, then paste directly into YouTube Studio — no re-uploading needed.
        </p>
      </div>
    </div>
  )
}
