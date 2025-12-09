import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../services/api'

export default function ViewResult(){
  const { testId } = useParams()
  const [submission, setSubmission] = useState(null)

  useEffect(()=>{
    const load = async () => {
      const res = await API.get(`/student/tests/${testId}/result`).catch(()=>({data:null}))
      setSubmission(res.data)
    }
    load()
  }, [testId])

  if (!submission) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">No result found</div></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="header"><h1>Result</h1></div>
        <div className="card">
          <div><strong>Score:</strong> {submission.score?.toFixed?.(2) ?? submission.score}</div>
          <div style={{marginTop:12}}>
            <h4>Answers</h4>
            {submission.answers.map(a => (
              <div key={a.question}><div className="small">Question: {a.question}</div><div className="small">Selected: {a.selected}</div></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}