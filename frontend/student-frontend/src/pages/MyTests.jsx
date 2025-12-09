import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import { Link } from 'react-router-dom'

export default function MyTests(){
  const [tests, setTests] = useState([])

  const load = async () => {
    const res = await API.get('/student/tests')
    setTests(res.data || [])
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="header"><h1>My Tests</h1></div>
        <div className="card">
          <table className="table">
            <thead><tr><th>Title</th><th>Due</th><th>Actions</th></tr></thead>
            <tbody>
              {tests.map(t => (
                <tr key={t._id}>
                  <td>{t.title}</td>
                  <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <Link to={`/tests/${t._id}/take`}>Take</Link> |{' '}
                    <Link to={`/tests/${t._id}/result`}>Result</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}