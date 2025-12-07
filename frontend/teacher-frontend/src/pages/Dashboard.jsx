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
<p>Welcome to the teacher dashboard. Use the sidebar to manage students and tests.</p>
</div>
</main>
</div>
)
}