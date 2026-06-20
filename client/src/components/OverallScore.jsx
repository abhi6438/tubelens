import { useEffect, useRef, useState } from 'react'

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
  bad: '⚠ Needs work — follow the suggestions to improve your reach.'
}

export default function OverallScore({ overall }) {
  const circumference = 314
  const [displayNum, setDisplayNum] = useState(0)
  const [offset, setOffset] = useState(circumference)
  const cls = getScoreClass(overall)
  const color = getScoreColor(overall)

  useEffect(() => {
    // Animate ring
    const timer1 = setTimeout(() => {
      setOffset(circumference - (overall / 10) * circumference)
    }, 100)

    // Animate number
    let start = 0
    const step = overall / (1000 / 16)
    const timer2 = setInterval(() => {
      start = Math.min(start + step, overall)
      setDisplayNum(Math.round(start))
      if (start >= overall) clearInterval(timer2)
    }, 16)

    return () => { clearTimeout(timer1); clearInterval(timer2) }
  }, [overall])

  return (
    <div className="overall-wrap">
      <div className="overall-label">Overall Score</div>
      <div className="overall-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle className="bg-circle" cx="60" cy="60" r="50" />
          <circle
            className="fg-circle"
            cx="60" cy="60" r="50"
            style={{ stroke: color, strokeDashoffset: offset }}
          />
        </svg>
        <div className="overall-number" style={{ color }}>{displayNum}</div>
      </div>
      <div className="overall-text">{TEXTS[cls]}</div>
    </div>
  )
}
