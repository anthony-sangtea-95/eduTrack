import React, { createContext, useContext, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'


const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
const [user, setUser] = useState(() => {
const raw = localStorage.getItem('edu_user')
return raw ? JSON.parse(raw) : null
})
const navigate = useNavigate()


const login = async (email, password) => {
const res = await API.post('/auth/login', { email, password })
const payload = res.data
// expected { token, role, id, name }
localStorage.setItem('token', payload.token)
localStorage.setItem('edu_user', JSON.stringify(payload))
setUser(payload)
return payload
}


const logout = () => {
localStorage.removeItem('token')
localStorage.removeItem('edu_user')
setUser(null)
navigate('/login')
}


return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}


export const useAuth = () => useContext(AuthContext)