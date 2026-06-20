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

function Step({ num, title, desc }) {
  return (
    <div className="modal-step">
      <div className="step-num">{num}</div>
      <div className="step-content">
        <strong>{title}</strong>
        <p dangerouslySetInnerHTML={{ __html: desc }} />
      </div>
    </div>
  )
}

function Platform({ name, emoji, instruction, template }) {
  return (
    <div>
      <div className="platform-label">{emoji} {name}</div>
      <p style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.6, marginBottom: 6 }}>{instruction}</p>
      <div className="copy-template">{template}</div>
      <div className="template-actions">
        <button className="copy-btn" onClick={e => copyText(template, e.currentTarget)}>Copy message</button>
      </div>
    </div>
  )
}

export default function HowToModal({ type, videoData, onClose }) {
  const title = videoData?.title || 'my video'
  const url = videoData ? `https://youtu.be/${videoData.videoId}` : '[your video link]'

  const fbMsg = `Hey everyone! 👋\n\nI just uploaded a new video — "${title}" — and would love some feedback from this community.\n\nWould mean a lot if you checked it out! 🙏\n${url}`
  const redditMsg = `I made a video on this topic and would love your honest thoughts.\n\n"${title}"\n\n${url}\n\nStill learning — any feedback welcome!`
  const waMsg = `Hey! 👋 I just posted a new YouTube video and it would really mean a lot if you watched it.\n\n"${title}"\n${url}\n\nEven a like or comment helps so much, thank you! 🙏`
  const twitterMsg = `New video just dropped! 🎬\n\n"${title}"\n\nWould love your thoughts 👇\n${url}`
  const igCaption = `New video is live! 🎬 "${title}" — link in bio to watch!\n\nDrop a comment if this was helpful 👇`

  return (
    <div
      className={`modal-overlay${type ? ' open' : ''}`}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <div className="modal-head-icon">{type === 'tags' ? '🏷' : '📣'}</div>
          <div className="modal-head-text">
            <h3>{type === 'tags' ? 'How to add tags to your video' : 'How to get more views by sharing'}</h3>
            <p>{type === 'tags' ? 'Takes about 3 minutes. Do this right now.' : 'Post templates ready to copy — just paste and send'}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {type === 'tags' && (
            <>
              <Step num={1} title="Open YouTube Studio" desc='Go to <a href="https://studio.youtube.com" target="_blank" style="color:var(--accent)">studio.youtube.com</a> — sign in with your YouTube account' />
              <Step num={2} title='Click "Content" in the left sidebar' desc="You'll see a list of all your uploaded videos" />
              <Step num={3} title="Find your video and click the pencil ✏️ icon" desc="This opens the video details editor" />
              <Step num={4} title='Scroll down to the "Tags" section' desc='If you don\'t see it, click "More options" — it\'s hidden there by default' />
              <Step num={5} title="Type each tag and press Enter or comma" desc="Add 15–20 tags. Mix short tags (your topic) with longer ones (questions people search)" />
              <Step num={6} title='Click "Save" at the top right' desc="Done! Tags take effect within a few minutes" />
              <div className="modal-tip">💡 <strong>Use the AI Suggestions below</strong> — it already generated 15 ready-made tags for your video. Just copy them all and paste one by one in the Tags field.</div>
            </>
          )}

          {type === 'sharing' && (
            <>
              <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>
                Share your video within the first <strong style={{ color: 'var(--text)' }}>24 hours</strong> of posting — early views tell YouTube's algorithm your video is worth recommending.
              </p>
              <Platform name="Facebook Groups" emoji="👥" instruction="Search Facebook for groups about your topic. Join 3–5 groups, read their rules, then post this:" template={fbMsg} />
              <div className="modal-divider" />
              <Platform name="Reddit" emoji="🤖" instruction="Find a subreddit for your niche (e.g. r/DIY, r/Cooking, r/fitness). Read the rules — most allow video posts with a genuine title:" template={redditMsg} />
              <div className="modal-divider" />
              <Platform name="WhatsApp / Telegram" emoji="💬" instruction="Send this to your personal contacts and group chats. People who know you are most likely to watch AND like:" template={waMsg} />
              <div className="modal-divider" />
              <Platform name="Twitter / X" emoji="🐦" instruction="Post this as a tweet. Add 2–3 hashtags about your topic after it:" template={twitterMsg} />
              <div className="modal-divider" />
              <Platform name="Instagram Caption" emoji="📸" instruction="Post a screenshot or short clip from your video. Add your YouTube link in your bio, then use this caption:" template={igCaption} />
              <div className="modal-tip">💡 <strong>Ask in the video too</strong> — at the 30-second mark say: <em>"If this helped, hit like — it takes 1 second and really helps me grow."</em></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
