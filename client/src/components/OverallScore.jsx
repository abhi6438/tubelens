import { useEffect, useState } from 'react'

function getScoreClass(score) {
  if (score >= 7) return 'good'
  if (score >= 4) return 'ok'
  return 'bad'
}
function getScoreColor(score) {
  if (score >= 7) return '#22C55E'
  if (score >= 4) return '#EAB308'
  return '#EF4444'
}

const TEXTS = {
  good: '🎉 Great job! A few tweaks and you\'ll grow fast.',
  ok: '📈 Good start! Fix the issues below to get more views.',
  bad: '⚠ Needs work — follow the suggestions below.'
}

// Ring circumference for r=36: 2π×36 ≈ 226
const C = 226

export default function OverallScore({ overall }) {
  const [displayNum, setDisplayNum] = useState(0)
  const [offset, setOffset] = useState(C)
  const cls = getScoreClass(overall)
  const color = getScoreColor(overall)

  useEffect(() => {
    const t1 = setTimeout(() => setOffset(C - (overall / 10) * C), 120)
    let n = 0
    const step = overall / (900 / 16)
    const t2 = setInterval(() => {
      n = Math.min(n + step, overall)
      setDisplayNum(Math.round(n))
      if (n >= overall) clearInterval(t2)
    }, 16)
    return () => { clearTimeout(t1); clearInterval(t2) }
  }, [overall])

  return (
    <div className="overall-wrap">
      <div className="overall-ring">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle className="bg-circle" cx="45" cy="45" r="36" />
          <circle
            className="fg-circle"
            cx="45" cy="45" r="36"
            style={{ stroke: color, strokeDashoffset: offset }}
          />
        </svg>
        <div className="overall-number" style={{ color }}>{displayNum}</div>
      </div>
      <div className="overall-info">
        <div className="overall-label">Overall Score</div>
        <div className="overall-text">{TEXTS[cls]}</div>
      </div>
    </div>
  )
}
