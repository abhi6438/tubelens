import { useState } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOTS = [
  { label: 'Morning',   sub: '6am–12pm', icon: '🌅' },
  { label: 'Afternoon', sub: '12–5pm',   icon: '☀️'  },
  { label: 'Evening',   sub: '5–9pm',    icon: '🌆' },
  { label: 'Night',     sub: '9pm–12am', icon: '🌙' },
]

// Heat per [Mon,Tue,Wed,Thu,Fri,Sat,Sun] — 0=avoid 1=ok 2=good 3=best
const HEAT = {
  gaming:        [[1,1,1,1,1,2,2],[1,1,1,1,2,3,3],[2,2,2,2,3,3,3],[2,2,2,2,2,2,1]],
  education:     [[2,3,3,2,2,1,0],[3,3,3,2,2,1,0],[2,2,2,2,2,1,1],[1,1,1,1,1,0,0]],
  news:          [[3,3,3,2,2,1,1],[2,2,2,2,2,1,1],[1,1,1,1,1,0,0],[0,0,0,0,0,0,0]],
  entertainment: [[1,1,1,1,2,2,2],[1,1,2,2,2,2,2],[2,2,2,3,3,3,3],[1,1,1,2,2,2,1]],
  music:         [[1,1,1,1,2,2,1],[1,1,1,2,2,2,2],[2,2,2,2,3,3,2],[1,1,1,1,2,2,1]],
  howto:         [[2,2,2,2,2,1,1],[2,3,3,3,2,2,1],[2,2,2,2,2,2,1],[1,1,1,1,1,0,0]],
  sports:        [[1,1,1,1,1,2,2],[1,1,1,1,1,3,3],[2,2,2,2,2,3,3],[1,1,1,1,1,1,1]],
  default:       [[1,1,1,2,2,1,1],[1,2,2,2,2,2,1],[2,2,2,3,3,2,2],[1,1,1,1,1,1,1]],
}

const TIPS = {
  gaming:        { days: 'Fri – Sun', time: '5 PM – 9 PM',  emoji: '🎮', reason: 'Gamers go online after school/work and stay active all weekend.' },
  education:     { days: 'Mon – Wed', time: '2 PM – 5 PM',  emoji: '📚', reason: 'Learners watch educational content after school on weekdays.' },
  news:          { days: 'Mon – Wed', time: '8 AM – 11 AM', emoji: '📰', reason: 'News viewers check in first thing on weekday mornings.' },
  entertainment: { days: 'Thu – Sat', time: '7 PM – 10 PM', emoji: '🎬', reason: 'Entertainment peaks Thursday evening through the weekend.' },
  music:         { days: 'Fri – Sat', time: '5 PM – 9 PM',  emoji: '🎵', reason: 'Music listeners tune in on weekend evenings to relax.' },
  howto:         { days: 'Tue – Thu', time: '2 PM – 5 PM',  emoji: '🔧', reason: 'How-to viewers watch when they have time to follow along.' },
  sports:        { days: 'Sat – Sun', time: '12 PM – 4 PM', emoji: '⚽', reason: 'Sports fans are most active on weekends during game hours.' },
  default:       { days: 'Thu – Fri', time: '6 PM – 9 PM',  emoji: '📅', reason: 'General peak viewing is weekday evenings — Thursday and Friday drive the most watch time.' },
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

const CATEGORY_NAMES = {
  gaming: 'Gaming', education: 'Education', news: 'News',
  entertainment: 'Entertainment', music: 'Music', howto: 'How-to',
  sports: 'Sports', default: 'General',
}

const HEAT_COLORS = [
  'rgba(255,255,255,0.04)',
  'rgba(249,115,22,0.18)',
  'rgba(249,115,22,0.48)',
  'rgba(249,115,22,0.88)',
]
const HEAT_TEXT = ['#3a3a3a', 'var(--muted)', 'var(--text)', '#0a0f1e']

// ── Simple view helpers ──────────────────────────────────
// Best heat value for each day (max across all time slots)
function dayPeak(heat, di) { return Math.max(...heat.map(row => row[di])) }
// Average heat for each time slot across all days
function slotAvg(heat, si) { return heat[si].reduce((a, b) => a + b, 0) / 7 }

const DAY_CONFIG = [
  { bg: 'rgba(255,255,255,0.04)', border: 'var(--border)',           label: 'Skip',  labelColor: 'var(--muted)' },
  { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',   label: 'OK',    labelColor: 'var(--sub)'   },
  { bg: 'rgba(249,115,22,0.32)',  border: 'rgba(249,115,22,0.5)',    label: 'Good',  labelColor: 'var(--text)'  },
  { bg: 'rgba(249,115,22,0.85)',  border: 'rgba(249,115,22,0.9)',    label: 'Best',  labelColor: '#0a0f1e'      },
]

// ── Components ───────────────────────────────────────────
function HeatmapView({ heat, tip }) {
  return (
    <>
      <div className="btp-grid">
        <div className="btp-corner" />
        {DAYS.map(d => <div key={d} className="btp-day-label">{d}</div>)}
        {SLOTS.map((slot, si) => (
          <>
            <div key={slot.label} className="btp-slot-label">
              <span>{slot.label}</span>
              <span className="btp-slot-sub">{slot.sub}</span>
            </div>
            {heat[si].map((h, di) => (
              <div key={di} className="btp-cell"
                style={{ background: HEAT_COLORS[h], color: HEAT_TEXT[h] }}
                title={`${DAYS[di]} ${slot.label}: ${['Avoid','OK','Good','Best'][h]}`}
              >
                {h === 3 && <span className="btp-star">★</span>}
              </div>
            ))}
          </>
        ))}
      </div>
      <div className="btp-legend">
        {['Avoid','OK','Good','Best'].map((l, i) => (
          <div key={l} className="btp-legend-item">
            <div className="btp-legend-dot" style={{ background: HEAT_COLORS[i], border: i === 0 ? '1px solid var(--border)' : 'none' }} />
            <span>{l}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function SimpleView({ heat, tip }) {
  const bestSlotIdx = SLOTS.map((_, si) => slotAvg(heat, si)).reduce((best, v, i, arr) => v > arr[best] ? i : best, 0)

  return (
    <div className="btp-simple">

      {/* Day strip */}
      <div className="btp-simple-section-label">Best days to post</div>
      <div className="btp-day-strip">
        {DAYS.map((d, di) => {
          const peak = dayPeak(heat, di)
          const cfg  = DAY_CONFIG[peak]
          return (
            <div key={d} className="btp-day-box" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <span className="btp-day-name" style={{ color: peak >= 2 ? '#fff' : 'var(--sub)' }}>{d}</span>
              <span className="btp-day-status" style={{ color: cfg.labelColor }}>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Time slots */}
      <div className="btp-simple-section-label" style={{ marginTop: 14 }}>Best time of day</div>
      <div className="btp-time-list">
        {SLOTS.map((slot, si) => {
          const avg  = slotAvg(heat, si)
          const pct  = Math.round((avg / 3) * 100)
          const best = si === bestSlotIdx
          return (
            <div key={si} className={`btp-time-row${best ? ' btp-time-row--best' : ''}`}>
              <span className="btp-time-icon">{slot.icon}</span>
              <div className="btp-time-info">
                <div className="btp-time-name">
                  {slot.label}
                  <span className="btp-time-sub">{slot.sub}</span>
                  {best && <span className="btp-time-peak-badge">Peak</span>}
                </div>
                <div className="btp-bar-bg">
                  <div className="btp-bar-fill" style={{ width: `${pct}%`, background: best ? 'var(--accent)' : 'rgba(249,115,22,0.35)' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────
export default function BestTimeToPost({ videoData }) {
  const [view, setView] = useState('simple')
  const key  = getCategoryKey(videoData?.categoryId)
  const heat = HEAT[key]
  const tip  = TIPS[key]
  const name = CATEGORY_NAMES[key]

  return (
    <div className="btp-card">
      {/* Header */}
      <div className="btp-header">
        <div className="btp-header-left">
          <span className="btp-title">📅 Best Time to Post</span>
          <span className="btp-badge">{name}</span>
        </div>
        <div className="btp-view-toggle">
          <button className={`btp-toggle-btn${view === 'simple' ? ' active' : ''}`} onClick={() => setView('simple')}>
            Simple
          </button>
          <button className={`btp-toggle-btn${view === 'heatmap' ? ' active' : ''}`} onClick={() => setView('heatmap')}>
            Heatmap
          </button>
        </div>
      </div>

      {/* View */}
      {view === 'heatmap' ? <HeatmapView heat={heat} tip={tip} /> : <SimpleView heat={heat} tip={tip} />}

      {/* Recommendation — always shown */}
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
