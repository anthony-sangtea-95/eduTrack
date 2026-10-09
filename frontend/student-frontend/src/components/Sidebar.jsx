import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { logout, user } = useAuth()

  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">e</span>
        <div>
          <p className="brand-name">eduTrack</p>
          <p className="brand-role">Student learning</p>
        </div>
      </div>
      <div className="sidebar-user">
        <p className="sidebar-user-label">Signed in as</p>
        <p className="sidebar-user-name">{user?.name || 'Student'}</p>
      </div>
      <nav className="sidebar-nav" aria-label="Student navigation">
        <NavLink to="/dashboard" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/tests" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>My Tests</NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="button">Log out</button>
      </div>
    </aside>
  )
}