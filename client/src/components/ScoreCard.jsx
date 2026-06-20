const ICONS = { title: '📝', description: '📄', tags: '🏷', thumbnail: '🖼', engagement: '📊' }
const NAMES = { title: 'Title', description: 'Description', tags: 'Tags', thumbnail: 'Thumbnail', engagement: 'Engagement' }

function getScoreClass(score) {
  if (score >= 7) return 'good'
  if (score >= 4) return 'ok'
  return 'bad'
}

export default function ScoreCard({ cardKey, data, onHowTo }) {
  const cls = getScoreClass(data.score)
  const showTagsHowTo = cardKey === 'tags' && data.score === 0
  const showSharingHowTo = cardKey === 'engagement' && data.issues.some(i => i.includes('views'))

  return (
    <div className={`score-card ${cls}`}>
      <div className="score-icon">{ICONS[cardKey]}</div>
      <div className="score-name">{NAMES[cardKey]}</div>
      <div className={`score-number ${cls}`}>
        {data.score}
        <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--muted)' }}>/10</span>
      </div>
      <div className="score-bar-bg">
        <div className={`score-bar-fill ${cls}`} style={{ width: `${data.score * 10}%` }} />
      </div>
      <ul className="score-issues">
        {data.issues.slice(0, 3).map((issue, i) => <li key={i}>{issue}</li>)}
      </ul>
      {showTagsHowTo && (
        <button className="howto-btn" onClick={() => onHowTo('tags')}>
          📖 How to add tags — step by step
        </button>
      )}
      {showSharingHowTo && (
        <button className="howto-btn" onClick={() => onHowTo('sharing')}>
          📣 How to get more views — copy-paste templates
        </button>
      )}
    </div>
  )
}
