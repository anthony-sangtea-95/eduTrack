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
<div className="form card teacher-login-card">
<p className="page-eyebrow">eduTrack · Teaching workspace</p>
<h2>Welcome back</h2>
<p className="login-description">Sign in to manage your tests and question bank.</p>
{err && <div className="login-error" role="alert">{err}</div>}
<form onSubmit={submit}>
<label htmlFor="teacher-email">Email</label>
<input id="teacher-email" type="email" autoComplete="username" className="input" value={email} onChange={e=>setEmail(e.target.value)} required />
<label htmlFor="teacher-password">Password</label>
<input id="teacher-password" type="password" autoComplete="current-password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required />
<div style={{marginTop:12}}>
<button className="button" type="submit">Sign in</button>
</div>
</form>
</div>
)
}