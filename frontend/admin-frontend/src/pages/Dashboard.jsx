import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <main className="main">
      <section className="welcome-panel">
        <h1>Keep your learning community organized.</h1>
        <p>Manage account access and keep the subject catalog ready for teachers and students.</p>
      </section>
      <section aria-label="Administration shortcuts">
        <div className="header">
          <div>
            <h2>Quick actions</h2>
            <p>Go straight to the areas you manage most.</p>
          </div>
        </div>
        <div className="quick-link-grid">
          <Link className="quick-link-card" to="/manage-users">
            <div>
              <strong>Manage users</strong>
              <span>Review accounts, roles, and contact details.</span>
            </div>
            <span className="quick-link-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="quick-link-card" to="/subjects">
            <div>
              <strong>Organize subjects</strong>
              <span>Maintain the subjects used across assessments.</span>
            </div>
            <span className="quick-link-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  )
}