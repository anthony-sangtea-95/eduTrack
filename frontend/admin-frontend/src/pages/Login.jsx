import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async event => {
    event.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-aside">
        <span className="admin-login-mark" aria-hidden="true">e</span>
        <p className="admin-eyebrow">EduTrack · Administration</p>
        <h1>Keep your learning community moving.</h1>
        <p>Sign in to manage access and maintain your subject catalog.</p>
      </div>
      <section className="admin-login-card">
        <p className="admin-eyebrow">Welcome back</p>
        <h2>Admin sign in</h2>
        <p className="admin-login-copy">Use your administrator account to continue.</p>
        {err && <div className="admin-login-error" role="alert">{err}</div>}
        <form onSubmit={submit}>
          <label htmlFor="admin-email">Email address</label>
          <input id="admin-email" type="email" className="input" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required />
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" className="input" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <button className="button admin-login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
