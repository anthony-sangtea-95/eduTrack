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
          <p className="brand-role">Administration</p>
        </div>
      </div>
      <div className="sidebar-user">
        <p className="sidebar-user-label">Signed in as</p>
        <p className="sidebar-user-name">{user?.name || 'Admin'}</p>
      </div>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        <NavLink to="/dashboard" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        <NavLink to="/manage-users" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>Manage Users</NavLink>
        <NavLink to="/subjects" className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}>Subjects</NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="button">Log out</button>
      </div>
    </aside>
  )
}