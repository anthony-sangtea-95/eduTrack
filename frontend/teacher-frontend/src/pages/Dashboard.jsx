import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <main className="main">
      <section className="welcome-panel">
        <h1>Plan your next assessment.</h1>
        <p>Create tests, shape your question bank, and keep your teaching materials in one place.</p>
      </section>
      <section aria-label="Teaching shortcuts">
        <div className="header">
          <div>
            <h2>Quick actions</h2>
            <p>Pick up where your assessment workflow begins.</p>
          </div>
        </div>
        <div className="quick-link-grid">
          <Link className="quick-link-card" to="/tests/create">
            <div>
              <strong>Create a test</strong>
              <span>Set up a new assessment and choose its questions.</span>
            </div>
            <span className="quick-link-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="quick-link-card" to="/questions">
            <div>
              <strong>Question bank</strong>
              <span>Browse and maintain your saved questions.</span>
            </div>
            <span className="quick-link-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}