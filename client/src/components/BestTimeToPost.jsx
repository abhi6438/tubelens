const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = [
  { label: 'Morning',   sub: '6am–12pm' },
  { label: 'Afternoon', sub: '12–5pm'   },
  { label: 'Evening',   sub: '5–9pm'    },
  { label: 'Night',     sub: '9pm–12am' },
]

// Heat per [Mon,Tue,Wed,Thu,Fri,Sat,Sun] — 0=avoid 1=ok 2=good 3=best
const HEAT = {
  gaming: [
    [1, 1, 1, 1, 1, 2, 2],
    [1, 1, 1, 1, 2, 3, 3],
    [2, 2, 2, 2, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 1],
  ],
  education: [
    [2, 3, 3, 2, 2, 1, 0],
    [3, 3, 3, 2, 2, 1, 0],
    [2, 2, 2, 2, 2, 1, 1],
    [1, 1, 1, 1, 1, 0, 0],
  ],
  news: [
    [3, 3, 3, 2, 2, 1, 1],
    [2, 2, 2, 2, 2, 1, 1],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
  entertainment: [
    [1, 1, 1, 1, 2, 2, 2],
    [1, 1, 2, 2, 2, 2, 2],
    [2, 2, 2, 3, 3, 3, 3],
    [1, 1, 1, 2, 2, 2, 1],
  ],
  music: [
    [1, 1, 1, 1, 2, 2, 1],
    [1, 1, 1, 2, 2, 2, 2],
    [2, 2, 2, 2, 3, 3, 2],
    [1, 1, 1, 1, 2, 2, 1],
  ],
  howto: [
    [2, 2, 2, 2, 2, 1, 1],
    [2, 3, 3, 3, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 0, 0],
  ],
  sports: [
    [1, 1, 1, 1, 1, 2, 2],
    [1, 1, 1, 1, 1, 3, 3],
    [2, 2, 2, 2, 2, 3, 3],
    [1, 1, 1, 1, 1, 1, 1],
  ],
  default: [
    [1, 1, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 3, 3, 2, 2],
    [1, 1, 1, 1, 1, 1, 1],
  ],
}

const TIPS = {
  gaming:        { days: 'Fri – Sun', time: '5 PM – 9 PM',    emoji: '🎮', reason: 'Gamers go online after school/work and stay active all weekend.' },
  education:     { days: 'Mon – Wed', time: '2 PM – 5 PM',    emoji: '📚', reason: 'Learners watch educational content after school on weekdays.' },
  news:          { days: 'Mon – Wed', time: '8 AM – 11 AM',   emoji: '📰', reason: 'News viewers check in first thing on weekday mornings.' },
  entertainment: { days: 'Thu – Sat', time: '7 PM – 10 PM',   emoji: '🎬', reason: 'Entertainment peaks Thursday evening through the weekend.' },
  music:         { days: 'Fri – Sat', time: '5 PM – 9 PM',    emoji: '🎵', reason: 'Music listeners tune in on weekend evenings to relax.' },
  howto:         { days: 'Tue – Thu', time: '2 PM – 5 PM',    emoji: '🔧', reason: 'How-to viewers watch when they have time to follow along.' },
  sports:        { days: 'Sat – Sun', time: '12 PM – 4 PM',   emoji: '⚽', reason: 'Sports fans are most active on weekends during game hours.' },
  default:       { days: 'Thu – Fri', time: '6 PM – 9 PM',    emoji: '📅', reason: 'General peak viewing is weekday evenings — Thursday and Friday drive the most watch time.' },
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

const HEAT_COLORS = [
  'rgba(255,255,255,0.04)',   // 0 — avoid
  'rgba(249,115,22,0.18)',    // 1 — ok
  'rgba(249,115,22,0.48)',    // 2 — good
  'rgba(249,115,22,0.88)',    // 3 — best
]
const HEAT_TEXT = ['#3a3a3a', 'var(--muted)', 'var(--text)', '#0a0f1e']

const CATEGORY_NAMES = {
  gaming: 'Gaming', education: 'Education', news: 'News',
  entertainment: 'Entertainment', music: 'Music', howto: 'How-to',
  sports: 'Sports', default: 'General',
}

export default function BestTimeToPost({ videoData }) {
  const key = getCategoryKey(videoData?.categoryId)
  const heat = HEAT[key]
  const tip  = TIPS[key]
  const name = CATEGORY_NAMES[key]

  return (
    <div className="btp-card">
      <div className="btp-header">
        <span className="btp-title">📅 Best Time to Post</span>
        <span className="btp-badge">{name}</span>
      </div>

      {/* Heatmap grid */}
      <div className="btp-grid">
        {/* Corner */}
        <div className="btp-corner" />
        {/* Day headers */}
        {DAYS.map(d => (
          <div key={d} className="btp-day-label">{d}</div>
        ))}

        {/* Rows */}
        {SLOTS.map((slot, si) => (
          <>
            <div key={slot.label} className="btp-slot-label">
              <span>{slot.label}</span>
              <span className="btp-slot-sub">{slot.sub}</span>
            </div>
            {heat[si].map((h, di) => (
              <div
                key={di}
                className="btp-cell"
                style={{ background: HEAT_COLORS[h], color: HEAT_TEXT[h] }}
                title={`${DAYS[di]} ${slot.label}: ${['Avoid','OK','Good','Best'][h]}`}
              >
                {h === 3 && <span className="btp-star">★</span>}
              </div>
            ))}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="btp-legend">
        {['Avoid','OK','Good','Best'].map((l, i) => (
          <div key={l} className="btp-legend-item">
            <div className="btp-legend-dot" style={{ background: HEAT_COLORS[i], border: i === 0 ? '1px solid var(--border)' : 'none' }} />
            <span>{l}</span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="btp-tip">
        <div className="btp-tip-main">
          <span className="btp-tip-emoji">{tip.emoji}</span>
          <div>
            <div className="btp-tip-highlight">Post on {tip.days} between {tip.time}</div>
            <div className="btp-tip-reason">{tip.reason}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
