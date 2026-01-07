import React, { createContext, useContext, useEffect, useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const TOKEN_KEY = 'ADMIN_TOKEN'
    const USER_KEY = 'ADMIN_USER'
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
    })
    const navigate = useNavigate()

    useEffect(()=>{
        user?.role != 'admin' ? logout() : ''
    }, [])

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password, role: "admin" })
        const payload = res.data
        localStorage.setItem(TOKEN_KEY, payload.token)
        localStorage.setItem('role', payload.role)
        localStorage.setItem(USER_KEY, JSON.stringify(payload))
        setUser(payload)
        return payload
    }

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('role')
        localStorage.removeItem(USER_KEY)
        setUser(null)
        navigate('/login')
    }
    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)