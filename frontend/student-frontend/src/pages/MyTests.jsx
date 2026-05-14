import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import TestCard from '../components/TestCard'

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
        <div className="header"><h1>Available Tests</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tests.length===0 ? <div className="card">No tests available</div> : tests.map(t=> (
            <TestCard key={t._id} test={t} testAccess={t.testAccess} />
          ))}
        </div>
      </main>
    </div>
  )
}