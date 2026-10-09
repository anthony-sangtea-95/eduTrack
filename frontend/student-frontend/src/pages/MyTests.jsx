import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import TestCard from '../components/TestCard'

export default function MyTests(){
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await API.get('/student/tests')
      setTests(res.data || [])
    } catch (err) {
      console.error(err)
      setError('We could not load your tests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <section className="tests-intro">
          <div>
            <p className="tests-eyebrow">Your learning space</p>
            <h1>My tests</h1>
            <p className="tests-description">See what’s coming up, start an available assessment, or review a previous result.</p>
          </div>
          {!loading && !error && (
            <div className="tests-count" aria-live="polite">
              <span className="tests-count-number">{tests.length}</span>
              <span>{tests.length === 1 ? 'test assigned' : 'tests assigned'}</span>
            </div>
          )}
        </section>

        <div className="tests-section-heading">
          <div>
            <h2>Assigned to you</h2>
            <p>Test access and available actions are shown on each card.</p>
          </div>
        </div>

        {error ? (
          <section className="tests-message tests-error" role="alert">
            <span className="tests-message-icon" aria-hidden="true">!</span>
            <div>
              <h3>Tests aren’t available right now</h3>
              <p>{error}</p>
            </div>
            <button className="button" type="button" onClick={load}>Try again</button>
          </section>
        ) : (
          <div className="tests-grid" aria-busy={loading}>
            {loading && <span className="sr-only" role="status">Loading assigned tests</span>}
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="test-card-skeleton" aria-hidden="true">
                  <span className="skeleton-line skeleton-title" />
                  <span className="skeleton-line skeleton-subtitle" />
                  <span className="skeleton-rule" />
                  <span className="skeleton-line skeleton-detail" />
                  <span className="skeleton-line skeleton-action" />
                </div>
              ))
            ) : tests.length === 0 ? (
              <section className="tests-message tests-empty">
                <span className="tests-message-icon" aria-hidden="true">✓</span>
                <div>
                  <h3>You’re all caught up</h3>
                  <p>There are no tests assigned to you at the moment. New assessments will appear here.</p>
                </div>
              </section>
            ) : (
              tests.map(t => (
                <TestCard key={t._id} test={t} testStatus={t.testStatus} testAccess={t.testAccess} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}