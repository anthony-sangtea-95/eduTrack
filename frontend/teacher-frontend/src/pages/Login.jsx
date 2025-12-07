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
<div className="form card">
<h2>Teacher Login</h2>
{err && <div style={{color:'red'}}>{err}</div>}
<form onSubmit={submit}>
<label>Email</label>
<input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
<label>Password</label>
<input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} />
<div style={{marginTop:12}}>
<button className="button" type="submit">Login</button>
</div>
</form>
</div>
)
}