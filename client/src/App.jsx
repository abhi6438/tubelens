import { useState, useCallback } from 'react'
import Hero from './components/Hero'
import VideoCard from './components/VideoCard'
import OverallScore from './components/OverallScore'
import ScoreCard from './components/ScoreCard'
import AISuggestions from './components/AISuggestions'
import HowToModal from './components/HowToModal'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ msg: '', error: false, spinner: false })
  const [videoData, setVideoData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [suggestions, setSuggestions] = useState(null)
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState(null)
  const [modalType, setModalType] = useState(null)

  const startAnalysis = useCallback(async () => {
    if (!url.trim()) return setStatus({ msg: '⚠ Please paste a YouTube video URL', error: true })
    setLoading(true)
    setVideoData(null)
    setAnalysis(null)
    setSuggestions(null)
    setSuggestionsError(null)

    try {
      setStatus({ msg: 'Fetching video data from YouTube...', spinner: true })
      const r1 = await fetch('/api/fetch-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      })
      const vd = await r1.json()
      if (vd.error) throw new Error(vd.error)

      setStatus({ msg: 'Analyzing your video...', spinner: true })
      const r2 = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoData: vd })
      })
      const anal = await r2.json()
      if (anal.error) throw new Error(anal.error)

      setVideoData(vd)
      setAnalysis(anal)
      setStatus({ msg: '' })

      setSuggestionsLoading(true)
      fetch('/api/suggestions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoData: vd, scores: anal.scores })
      })
        .then(r => r.json())
        .then(data => {
          if (data.error) throw new Error(data.error)
          if (typeof data.tags === 'string') data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean)
          setSuggestions(data)
        })
        .catch(err => setSuggestionsError(err.message))
        .finally(() => setSuggestionsLoading(false))

    } catch (err) {
      setStatus({ msg: '⚠ ' + err.message, error: true })
    }
    setLoading(false)
  }, [url])

  const reset = () => {
    setUrl('')
    setVideoData(null)
    setAnalysis(null)
    setSuggestions(null)
    setSuggestionsError(null)
    setStatus({ msg: '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasResults = videoData && analysis

  return (
    <>
      <Hero
        url={url}
        setUrl={setUrl}
        loading={loading}
        status={status}
        onAnalyze={startAnalysis}
        compact={hasResults}
      />

      {hasResults && (
        <div className="page-results">
          {/* LEFT SIDEBAR — sticky on desktop */}
          <aside className="results-sidebar">
            <VideoCard videoData={videoData} />
            <OverallScore overall={analysis.overall} />
            <button className="again-btn" onClick={reset}>↩ Analyze another video</button>
          </aside>

          {/* RIGHT MAIN — scores + AI */}
          <main className="results-main">
            <div className="score-grid">
              {Object.entries(analysis.scores).map(([key, data]) => (
                <ScoreCard key={key} cardKey={key} data={data} onHowTo={setModalType} />
              ))}
            </div>
            <AISuggestions
              loading={suggestionsLoading}
              error={suggestionsError}
              suggestions={suggestions}
            />
          </main>
        </div>
      )}

      <HowToModal
        type={modalType}
        videoData={videoData}
        onClose={() => setModalType(null)}
      />
    </>
  )
}
