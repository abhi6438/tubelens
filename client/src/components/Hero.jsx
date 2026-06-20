export default function Hero({ url, setUrl, loading, status, onAnalyze, compact }) {
  return (
    <div className={`hero${compact ? ' hero--compact' : ''}`}>
      {compact ? (
        <div className="hero-compact-bar">
          <div className="hero-compact-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
            </div>
            TubeLens
          </div>
          <div className="input-wrap input-wrap--compact">
            <input
              type="text"
              className="url-input"
              placeholder="Paste another YouTube URL..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAnalyze()}
              disabled={loading}
            />
            <button className="analyze-btn" onClick={onAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
            </div>
            TubeLens
          </div>
          <h1>Know exactly why your<br />video isn't <span>getting views</span></h1>
          <p className="hero-sub">
            Paste your YouTube video link. Get a score card, fix list, and AI-powered suggestions — completely free.
          </p>
          <div className="input-wrap">
            <input
              type="text"
              className="url-input"
              placeholder="Paste your YouTube video URL here..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAnalyze()}
              disabled={loading}
            />
            <button className="analyze-btn" onClick={onAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Video'}
            </button>
          </div>
          <p className="hint-text">Works with youtube.com, youtu.be, and YouTube Shorts</p>
        </>
      )}
      <div className={`status-bar${status.error ? ' error' : ''}`}>
        {status.spinner && <div className="spinner" />}
        {status.msg}
      </div>
    </div>
  )
}
