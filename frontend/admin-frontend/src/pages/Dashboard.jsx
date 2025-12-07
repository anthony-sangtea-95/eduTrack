import React from 'react'
import Sidebar from '../components/Sidebar'


export default function Dashboard(){
return (
<div className="app-shell">
<Sidebar />
<main className="main">
<div className="header">
<h1>Dashboard</h1>
</div>
<div className="card">
<p>Welcome to the admin dashboard. Use the sidebar to manage users.</p>
</div>
</main>
</div>
)
}