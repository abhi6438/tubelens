export default function VideoCard({ videoData }) {
  const publishDate = new Date(videoData.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="video-card">
      {videoData.thumbnail
        ? <img className="video-thumb" src={videoData.thumbnail} alt="thumbnail" />
        : <div className="video-thumb" />}
      <div className="video-info">
        <div className="video-title" title={videoData.title}>{videoData.title}</div>
        <div className="video-meta">
          <div className="meta-item">👁 <strong>{videoData.views.toLocaleString()}</strong> views</div>
          <div className="meta-item">👍 <strong>{videoData.likes.toLocaleString()}</strong> likes</div>
          <div className="meta-item">💬 <strong>{videoData.comments.toLocaleString()}</strong> comments</div>
          <div className="meta-item">📅 {publishDate}</div>
          <div className="meta-item">🏷 <strong>{videoData.tags?.length || 0}</strong> tags</div>
        </div>
      </div>
    </div>
  )
}
