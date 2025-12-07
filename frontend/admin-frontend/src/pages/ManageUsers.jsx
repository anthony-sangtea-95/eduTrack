import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import API from '../services/api'


export default function ManageUsers(){
const [users, setUsers] = useState([])


const load = async () => {
const res = await API.get('/admin/users')
setUsers(res.data)
}


useEffect(()=>{ load() }, [])


return (
<div className="app-shell">
<Sidebar />
<main className="main">
<div className="header"><h1>Manage Users</h1></div>
<div className="card">
<table className="table">
<thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
<tbody>
{users.map(u => (
<tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>
))}
</tbody>
</table>
</div>
</main>
</div>
)
}