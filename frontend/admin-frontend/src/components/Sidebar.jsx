import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
const { logout, user } = useAuth()
return (
<aside className="sidebar">
<h3>eduTrack</h3>
<p style={{opacity:0.8}}>{user?.name || 'Admin'}</p>
<nav style={{marginTop:20}}>
<NavLink to="/dashboard" className={({isActive}) => `side-link ${isActive? 'active':''}`}>Dashboard</NavLink>
<NavLink to="/manage-users" className={({isActive}) => `side-link ${isActive? 'active':''}`}>Manage Users</NavLink>
<NavLink to="/test-types" className={({isActive}) => `side-link ${isActive? 'active':''}`}>Test Types</NavLink>
</nav>
<div style={{marginTop:20}}>
<button onClick={logout} className="button">Logout</button>
</div>
</aside>
)
}