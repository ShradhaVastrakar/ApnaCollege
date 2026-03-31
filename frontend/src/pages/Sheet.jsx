import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { api } from '../api'

function levelClass(level) {
  if (level === 'Easy') return 'level-easy'
  if (level === 'Medium') return 'level-medium'
  return 'level-tough'
}

export default function Sheet() {
  const { user, logout } = useAuth()
  const [chapters, setChapters] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openChapter, setOpenChapter] = useState(0)
  const [openTopic, setOpenTopic] = useState({})

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [probRes, progRes] = await Promise.all([api.problems(), api.progress()])
      setChapters(probRes.chapters || [])
      setCompleted(new Set(progRes.completedProblemIds || []))
    } catch (e) {
      setError(e.message || 'Failed to load sheet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const totals = useMemo(() => {
    let total = 0
    let done = 0
    for (const ch of chapters) {
      for (const t of ch.topics) {
        for (const p of t.problems) {
          total += 1
          if (completed.has(p.id)) done += 1
        }
      }
    }
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
  }, [chapters, completed])

  async function toggleProblem(problemId, next) {
    const prev = completed.has(problemId)
    if (next === prev) return
    setCompleted((s) => {
      const n = new Set(s)
      if (next) n.add(problemId)
      else n.delete(problemId)
      return n
    })
    try {
      await api.setProgress(problemId, next)
    } catch {
      setCompleted((s) => {
        const n = new Set(s)
        if (prev) n.add(problemId)
        else n.delete(problemId)
        return n
      })
      setError('Could not save progress. Try again.')
    }
  }

  function toggleTopic(chIdx, tKey) {
    setOpenTopic((o) => ({ ...o, [tKey]: !o[tKey] }))
  }

  if (loading) {
    return (
      <div className="sheet-wrap">
        <p className="muted">Loading your DSA sheet…</p>
      </div>
    )
  }

  if (error && !chapters.length) {
    return (
      <div className="sheet-wrap">
        <p className="form-error">{error}</p>
        <button type="button" className="btn-secondary" onClick={load}>
          Retry
        </button>
      </div>
    )
  }

  

  return (
    <div className="sheet-wrap">
      <header className="sheet-header">
        <div>
          <h1>DSA Sheet</h1>
          <p className="sheet-tagline">Chapters, topics, and problems — with your progress saved.</p>
        </div>
        <div className="sheet-header-actions">
          <span className="user-pill">
            {user?.name || user?.email}
            <span className="progress-mini">
              {totals.done}/{totals.total} ({totals.pct}%)
            </span>
          </span>
          <button type="button" className="btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {error && <p className="banner-warn">{error}</p>}

      <div className="progress-bar-outer" aria-hidden>
        <div className="progress-bar-inner" style={{ width: `${totals.pct}%` }} />
      </div>

      <div className="chapters">
        {chapters.map((ch, ci) => {
          const chProblems = ch.topics.reduce((acc, t) => acc + t.problems.length, 0)
          const chDone = ch.topics.reduce(
            (acc, t) =>
              acc + t.problems.filter((p) => completed.has(p.id)).length,
            0
          )
          const isOpen = openChapter === ci
          return (
            <section key={ch.chapter} className="chapter">
              <button
                type="button"
                className="chapter-head"
                onClick={() => setOpenChapter(isOpen ? -1 : ci)}
                aria-expanded={isOpen}
              >
                <span className="chapter-title">{ch.chapter}</span>
                <span className="chapter-meta">
                  {chDone}/{chProblems} solved
                </span>
              </button>
              {isOpen && (
                <div className="chapter-body">
                  {ch.topics.map((topic) => {
                    const tKey = `${ch.chapter}::${topic.topic}`
                    const topicOpen = openTopic[tKey] !== false
                    return (
                      <div key={tKey} className="topic">
                        <button
                          type="button"
                          className="topic-head"
                          onClick={() => toggleTopic(ci, tKey)}
                          aria-expanded={topicOpen}
                        >
                          {topic.topic}
                          <span className="topic-count">{topic.problems.length} problems</span>
                        </button>
                        {topicOpen && (
                          <ul className="problem-list">
                            {topic.problems.map((p) => (
                              <li key={p.id} className="problem-row">
                                <label className="done-check">
                                  <input
                                    type="checkbox"
                                    checked={completed.has(p.id)}
                                    onChange={(e) => toggleProblem(p.id, e.target.checked)}
                                  />
                                  <span className="sr-only">Mark {p.title} done</span>
                                </label>
                                <div className="problem-main">
                                  <span className="problem-title">{p.title}</span>
                                  <span className={`level-pill ${levelClass(p.level)}`}>
                                    {p.level}
                                  </span>
                                </div>
                                <div className="problem-links">
                                  {p.youtubeUrl ? (
                                    <a href={p.youtubeUrl} target="_blank" rel="noreferrer">
                                      YouTube
                                    </a>
                                  ) : null}
                                  {p.leetcodeUrl ? (
                                    <a href={p.leetcodeUrl} target="_blank" rel="noreferrer">
                                      LeetCode
                                    </a>
                                  ) : null}
                                  {p.codeforcesUrl ? (
                                    <a href={p.codeforcesUrl} target="_blank" rel="noreferrer">
                                      Codeforces
                                    </a>
                                  ) : null}
                                  {p.articleUrl ? (
                                    <a href={p.articleUrl} target="_blank" rel="noreferrer">
                                      Article
                                    </a>
                                  ) : null}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <footer className="sheet-footer">
        <Link to="/login">Switch account</Link>
      </footer>
    </div>
  )
}
