import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import API from '../services/api'

export default function Dashboard(){
  const [stats, setStats] = useState({ assigned: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async () => {
      try {
        const res = await API.get('/student/tests')
        const tests = res.data || []
        const pending = tests.filter(t => !t.completed).length
        setStats({ assigned: tests.length, pending })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="header"><h1>Student Dashboard</h1></div>
          <div className="row">
            <div className="col card mb-2">
              <h3>Assigned Tests</h3>
              { loading ? 
                <div className="animate-pulse h-12 w-8 bg-gray-100 rounded"></div> : <div style={{fontSize:28, marginTop:8}}>{stats.assigned}</div> }
            </div>
            <div className="col card mb-2">
              <h3>Pending</h3>
              { loading ? <div className="animate-pulse h-12 w-8 bg-gray-100 rounded"></div> : <div style={{fontSize:28, marginTop:8}}>{stats.pending}</div> }
            </div>
          </div>
      </main>
    </div>
  )
}