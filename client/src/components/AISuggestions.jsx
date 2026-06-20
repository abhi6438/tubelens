import { useCallback } from 'react'

function copyText(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent
    btn.textContent = 'Copied!'
    btn.style.background = 'var(--green)'
    btn.style.color = 'white'
    setTimeout(() => {
      btn.textContent = orig
      btn.style.background = ''
      btn.style.color = ''
    }, 2000)
  })
}

export default function AISuggestions({ loading, error, suggestions }) {
  const tags = suggestions?.tags
    ? (Array.isArray(suggestions.tags) ? suggestions.tags : String(suggestions.tags).split(',').map(t => t.trim()))
    : []

  return (
    <div className="suggestions-wrap" style={{ marginBottom: 20 }}>
      <div className="suggestions-header">
        <h2>AI Fix Suggestions</h2>
        <span className="ai-badge">✨ AI Generated</span>
      </div>
      <div className="suggestions-body">
        {loading && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 10px' }} />
            Generating suggestions...
          </div>
        )}

        {error && !loading && (
          <div style={{ color: 'var(--muted)', fontSize: 13, padding: '10px 0' }}>
            ⚠ AI suggestions unavailable: {error}
          </div>
        )}

        {suggestions && !loading && (
          <>
            {suggestions.titleOptions?.length > 0 && (
              <div className="suggestion-block">
                <div className="suggestion-label">✏️ Better Title Options</div>
                {suggestions.titleOptions.map((t, i) => (
                  <div key={i} className="title-option">
                    <span>{t}</span>
                    <button className="copy-btn" onClick={e => copyText(t, e.currentTarget)}>Copy</button>
                  </div>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <div className="suggestion-block">
                <div className="suggestion-label">
                  🏷 Suggested Tags{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(click to copy)</span>
                </div>
                <div className="tags-wrap">
                  {tags.map((t, i) => (
                    <div key={i} className="tag-chip" onClick={e => copyText(t, e.currentTarget)}>{t}</div>
                  ))}
                </div>
                <button className="copy-btn" style={{ marginTop: 10 }} onClick={e => copyText(tags.join(', '), e.currentTarget)}>
                  Copy all tags
                </button>
              </div>
            )}

            {suggestions.descriptionOpening && (
              <div className="suggestion-block">
                <div className="suggestion-label">📄 Better Description Opening</div>
                <div className="desc-block" id="desc-text">{suggestions.descriptionOpening}</div>
                <button className="copy-btn" style={{ marginTop: 8 }} onClick={e => copyText(suggestions.descriptionOpening, e.currentTarget)}>
                  Copy description
                </button>
              </div>
            )}

            {suggestions.topTip && (
              <div className="suggestion-block">
                <div className="suggestion-label">💡 Most Important Tip</div>
                <div className="tip-block">
                  <div className="tip-icon">🚀</div>
                  <div>{suggestions.topTip}</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
