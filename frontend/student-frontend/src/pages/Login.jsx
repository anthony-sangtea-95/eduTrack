import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async e => {
    e.preventDefault()
    setErr(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="form card student-login-card">
      <p className="student-login-eyebrow">eduTrack · Student learning</p>
      <h2>Welcome back</h2>
      <p className="student-login-description">Sign in to see your assigned tests and learning progress.</p>
      {err && <div className="student-login-error" role="alert">{err}</div>}
      <form onSubmit={submit}>
        <label htmlFor="student-email">Email</label>
        <input id="student-email" type="email" autoComplete="username" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label htmlFor="student-password">Password</label>
        <input id="student-password" type="password" autoComplete="current-password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required />
        <div className="student-login-submit">
          <button className="button" type="submit">Sign in</button>
        </div>
      </form>
    </div>
  )
}