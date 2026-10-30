import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'

const statCards = [
  ['students', 'Students'],
  ['teachers', 'Teachers'],
  ['tests', 'Tests'],
  ['submissions', 'Submissions'],
  ['subjects', 'Subjects'],
]

function TrendChart({ title, values }) {
  const maxCount = Math.max(...values.map(item => item.count), 1)
  return (
    <section className="admin-data-card analytics-chart">
      <div className="admin-data-toolbar">
        <div><h2>{title}</h2><p>Last six months</p></div>
      </div>
      <div className="analytics-chart-bars" role="img" aria-label={`${title} over the last six months`}>
        {values.map(item => (
          <div className="analytics-chart-column" key={item.month} title={`${item.month}: ${item.count}`}>
            <strong>{item.count}</strong>
            <div className="analytics-chart-track">
              <span style={{ height: `${Math.max(item.count ? (item.count / maxCount) * 100 : 0, item.count ? 5 : 0)}%` }} />
            </div>
            <small>{item.month.split(' ')[0]}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function OversightList({ title, tests, emptyMessage }) {
  return (
    <section className="admin-data-card analytics-oversight-card">
      <div className="admin-data-toolbar">
        <div><h2>{title}</h2><p>{tests.length} {tests.length === 1 ? 'test' : 'tests'}</p></div>
      </div>
      {tests.length ? (
        <ul className="analytics-oversight-list">
          {tests.map(test => (
            <li key={test._id}>
              <div><strong>{test.title}</strong><span>{test.subject} · {test.teacher}</span></div>
              <span className={test.questionCount === 0 ? 'analytics-warning' : ''}>
                {test.questionCount} questions · {test.submissionCount} submissions
              </span>
            </li>
          ))}
        </ul>
      ) : <p className="analytics-empty">{emptyMessage}</p>}
    </section>
  )
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await API.get('/admin/analytics')
      setAnalytics(response.data)
    } catch (requestError) {
      console.error('Failed to load admin analytics', requestError)
      setError('Analytics could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAnalytics() }, [])

  if (loading) return <main className="main"><p className="admin-loading-message">Loading analytics…</p></main>
  if (error) {
    return (
      <main className="main">
        <section className="admin-state-card admin-error-card" role="alert">
          <span className="admin-state-icon" aria-hidden="true">!</span>
          <div><h2>Analytics unavailable</h2><p>{error}</p></div>
          <button className="button" type="button" onClick={loadAnalytics}>Try again</button>
        </section>
      </main>
    )
  }

  const { totals, trends, subjectPerformance, testOversight } = analytics
  const needsQuestions = testOversight.filter(test => test.questionCount === 0)
  const drafts = testOversight.filter(test => test.availability === 'draft')
  const upcoming = testOversight.filter(test => test.availability === 'upcoming')
  const closed = testOversight.filter(test => test.availability === 'closed')

  return (
    <main className="main">
      <div className="admin-page">
        <section className="welcome-panel">
          <h1>Learning community overview</h1>
          <p>Monitor account growth, assessment activity, and learning outcomes across eduTrack.</p>
        </section>

        <section aria-label="Platform totals">
          <div className="admin-analytics-stat-grid">
            {statCards.map(([key, label]) => (
              <article className="admin-analytics-stat" key={key}>
                <span>{label}</span><strong>{totals[key].toLocaleString()}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-analytics-chart-grid" aria-label="Platform trends">
          <TrendChart title="New user accounts" values={trends.users} />
          <TrendChart title="Tests created" values={trends.tests} />
          <TrendChart title="Submissions" values={trends.submissions} />
        </section>

        <section className="admin-data-card">
          <div className="admin-data-toolbar">
            <div><h2>Performance by subject</h2><p>Average score and completion are based on submitted attempts and assigned students.</p></div>
            <Link className="button" to="/reports">View reports</Link>
          </div>
          <div className="admin-table-scroll">
            <table className="table">
              <thead><tr><th>Subject</th><th>Tests</th><th>Questions</th><th>Submissions</th><th>Average score</th><th>Completion</th></tr></thead>
              <tbody>
                {subjectPerformance.map(subject => (
                  <tr key={subject._id}>
                    <td>{subject.subjectName}</td><td>{subject.tests}</td><td>{subject.questions}</td><td>{subject.submissions}</td>
                    <td>{subject.averageScore === null ? '—' : `${subject.averageScore}%`}</td>
                    <td>{subject.completionRate === null ? '—' : `${subject.completionRate}%`}</td>
                  </tr>
                ))}
                {!subjectPerformance.length && <tr><td colSpan="6">No subject data is available yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-data-card">
          <div className="admin-data-toolbar">
            <div><h2>Test oversight</h2><p>Identify assessments that may need attention.</p></div>
            <Link className="admin-secondary-link" to="/reports">Open reports →</Link>
          </div>
          <div className="admin-oversight-grid">
            <OversightList title="Tests with no questions" tests={needsQuestions} emptyMessage="No tests need questions." />
            <OversightList title="Drafts" tests={drafts} emptyMessage="No unpublished drafts." />
            <OversightList title="Upcoming" tests={upcoming} emptyMessage="No upcoming tests." />
            <OversightList title="Closed" tests={closed} emptyMessage="No closed tests." />
          </div>
        </section>

        <section aria-label="Administration shortcuts">
          <div className="header"><div><h2>Quick actions</h2><p>Go straight to the areas you manage most.</p></div></div>
          <div className="quick-link-grid">
            <Link className="quick-link-card" to="/manage-users"><div><strong>Manage users</strong><span>Review accounts, roles, and contact details.</span></div><span className="quick-link-arrow" aria-hidden="true">→</span></Link>
            <Link className="quick-link-card" to="/subjects"><div><strong>Organize subjects</strong><span>Maintain the subjects used across assessments.</span></div><span className="quick-link-arrow" aria-hidden="true">→</span></Link>
            <Link className="quick-link-card" to="/reports"><div><strong>Reports</strong><span>Filter assessment activity and export CSV files.</span></div><span className="quick-link-arrow" aria-hidden="true">→</span></Link>
          </div>
        </section>
      </div>
    </main>
  )
}
