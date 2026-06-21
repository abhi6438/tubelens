import { useRef, useEffect, useState } from 'react'

const W = 1280
const H = 720

const PRESETS = [
  { name: '🎮 Gaming',      bg1: '#0f0f0f', bg2: '#c0392b', text: '#ffffff', gradient: true  },
  { name: '📚 Education',   bg1: '#1a237e', bg2: '#1565c0', text: '#ffffff', gradient: true  },
  { name: '🔧 How-To',      bg1: '#1a1a1a', bg2: '#e67e22', text: '#ffffff', gradient: true  },
  { name: '🎬 Entertain',   bg1: '#4a0e8f', bg2: '#7b2ff7', text: '#ffffff', gradient: true  },
  { name: '⚡ Bold',        bg1: '#f39c12', bg2: '#e74c3c', text: '#ffffff', gradient: true  },
  { name: '🌊 Cool',        bg1: '#0652DD', bg2: '#12cbc4', text: '#ffffff', gradient: true  },
  { name: '🖤 Dark',        bg1: '#0a0a0a', bg2: '#0a0a0a', text: '#f5a623', gradient: false },
  { name: '🤍 Light',       bg1: '#f0f0f0', bg2: '#f0f0f0', text: '#1a1a1a', gradient: false },
]

const LAYOUTS = [
  { id: 'centered',  label: 'Centered'   },
  { id: 'left',      label: 'Text Left'  },
  { id: 'right',     label: 'Text Right' },
]

function drawCanvas(canvas, s) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  // ── Background ──────────────────────────────────────
  if (s.gradient && s.bg2 !== s.bg1) {
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, s.bg1)
    grad.addColorStop(1, s.bg2)
    ctx.fillStyle = grad
  } else {
    ctx.fillStyle = s.bg1
  }
  ctx.fillRect(0, 0, W, H)

  // ── Accent bar ──────────────────────────────────────
  if (s.accentBar) {
    ctx.fillStyle = s.accentColor
    if (s.layout === 'left')  ctx.fillRect(0, 0, 10, H)
    else if (s.layout === 'right') ctx.fillRect(W - 10, 0, 10, H)
    else { ctx.fillRect(0, H - 10, W, 10) }
  }

  // ── Text setup ──────────────────────────────────────
  let titleX, alignX
  const MARGIN = 90
  if (s.layout === 'left')       { titleX = MARGIN;     alignX = 'left'   }
  else if (s.layout === 'right') { titleX = W - MARGIN; alignX = 'right'  }
  else                           { titleX = W / 2;      alignX = 'center' }

  const maxW = s.layout === 'centered' ? W * 0.82 : W * 0.56

  ctx.textAlign  = alignX
  ctx.textBaseline = 'middle'
  ctx.fillStyle  = s.textColor

  // Shadow
  if (s.shadow) {
    ctx.shadowColor   = 'rgba(0,0,0,0.75)'
    ctx.shadowBlur    = 22
    ctx.shadowOffsetX = 4
    ctx.shadowOffsetY = 4
  } else {
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur  = 0
  }

  // ── Word-wrap title ──────────────────────────────────
  const title = s.titleText || 'Your Title Here'
  const rawSize = title.length > 45 ? 68 : title.length > 28 ? 84 : 104
  ctx.font = `900 ${rawSize}px Arial Black, Arial, sans-serif`

  const words = title.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w }
    else cur = test
  }
  lines.push(cur)

  const lh      = rawSize * 1.22
  const totalH  = lines.length * lh
  const hasSubt = !!s.subtitleText
  const titleCY = hasSubt ? H * 0.42 : H * 0.5
  const startY  = titleCY - totalH / 2 + lh / 2

  lines.forEach((line, i) => ctx.fillText(line, titleX, startY + i * lh))

  // ── Subtitle ─────────────────────────────────────────
  if (hasSubt) {
    ctx.shadowBlur  = s.shadow ? 10 : 0
    ctx.font        = `600 44px Arial, sans-serif`
    ctx.globalAlpha = 0.7
    ctx.fillText(s.subtitleText, titleX, H * 0.82)
    ctx.globalAlpha = 1
  }

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur  = 0
}

export default function ThumbnailBuilder({ videoData }) {
  const canvasRef = useRef(null)
  const [settings, setSettings] = useState({
    bg1:         '#0f0f0f',
    bg2:         '#c0392b',
    gradient:    true,
    titleText:   videoData?.title || '',
    subtitleText: videoData?.channelTitle || '',
    textColor:   '#ffffff',
    layout:      'centered',
    shadow:      true,
    accentBar:   false,
    accentColor: '#f5a623',
  })
  const [downloaded, setDownloaded] = useState(false)

  // Sync title when videoData arrives
  useEffect(() => {
    if (videoData?.title && !settings.titleText) {
      set('titleText', videoData.title)
    }
  }, [videoData])

  // Redraw on any setting change
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) drawCanvas(canvas, settings)
  }, [settings])

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const applyPreset = (p) => setSettings(prev => ({
    ...prev, bg1: p.bg1, bg2: p.bg2, textColor: p.text, gradient: p.gradient
  }))

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'thumbnail.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2500)
  }

  return (
    <div className="tb-card">
      <div className="tb-header">
        <span className="tb-title">🎨 Thumbnail Builder</span>
        <span className="tb-badge">1280 × 720 PNG</span>
      </div>

      <div className="tb-body">

        {/* ── Canvas preview ── */}
        <div className="tb-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="tb-canvas"
          />
        </div>

        {/* ── Preset themes ── */}
        <div className="tb-section">
          <div className="tb-label">Quick Themes</div>
          <div className="tb-presets">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                className="tb-preset-btn"
                style={{
                  background: p.gradient
                    ? `linear-gradient(135deg, ${p.bg1}, ${p.bg2})`
                    : p.bg1,
                  color: p.text,
                }}
                onClick={() => applyPreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Title text ── */}
        <div className="tb-section">
          <div className="tb-label">Title Text</div>
          <input
            className="tb-input"
            value={settings.titleText}
            onChange={e => set('titleText', e.target.value)}
            placeholder="e.g. 5 Mistakes Every Beginner Makes"
            maxLength={80}
          />
          <div className="tb-char-count">{settings.titleText.length}/80</div>
        </div>

        {/* ── Subtitle / channel name ── */}
        <div className="tb-section">
          <div className="tb-label">Subtitle / Channel Name <span className="tb-label-opt">(optional)</span></div>
          <input
            className="tb-input"
            value={settings.subtitleText}
            onChange={e => set('subtitleText', e.target.value)}
            placeholder="e.g. Your Channel Name"
            maxLength={50}
          />
        </div>

        {/* ── Layout ── */}
        <div className="tb-section">
          <div className="tb-label">Text Layout</div>
          <div className="tb-layout-row">
            {LAYOUTS.map(l => (
              <button
                key={l.id}
                className={`tb-layout-btn${settings.layout === l.id ? ' active' : ''}`}
                onClick={() => set('layout', l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Colors ── */}
        <div className="tb-section">
          <div className="tb-label">Colors</div>
          <div className="tb-colors-grid">
            <div className="tb-color-item">
              <label className="tb-color-label">Background</label>
              <input type="color" className="tb-color-input" value={settings.bg1}
                onChange={e => set('bg1', e.target.value)} />
            </div>
            <div className="tb-color-item">
              <label className="tb-color-label">Gradient end</label>
              <div className="tb-color-row">
                <input type="color" className="tb-color-input" value={settings.bg2}
                  onChange={e => set('bg2', e.target.value)} />
                <label className="tb-toggle-label">
                  <input type="checkbox" checked={settings.gradient}
                    onChange={e => set('gradient', e.target.checked)} />
                  Use gradient
                </label>
              </div>
            </div>
            <div className="tb-color-item">
              <label className="tb-color-label">Text color</label>
              <input type="color" className="tb-color-input" value={settings.textColor}
                onChange={e => set('textColor', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Options ── */}
        <div className="tb-section">
          <div className="tb-label">Options</div>
          <div className="tb-options-row">
            <label className="tb-toggle-label">
              <input type="checkbox" checked={settings.shadow}
                onChange={e => set('shadow', e.target.checked)} />
              Text shadow (recommended)
            </label>
            <label className="tb-toggle-label">
              <input type="checkbox" checked={settings.accentBar}
                onChange={e => set('accentBar', e.target.checked)} />
              Accent bar
              {settings.accentBar && (
                <input type="color" className="tb-color-input" value={settings.accentColor}
                  onChange={e => set('accentColor', e.target.value)}
                  style={{ marginLeft: 6 }} />
              )}
            </label>
          </div>
        </div>

        {/* ── Download ── */}
        <button className={`tb-download-btn${downloaded ? ' done' : ''}`} onClick={download}>
          {downloaded ? '✓ Downloaded! Upload to YouTube Studio' : '⬇ Download Thumbnail (PNG)'}
        </button>

        <p className="tb-hint">
          After downloading, go to YouTube Studio → your video → Details → Thumbnail → Upload
        </p>
      </div>
    </div>
  )
}
