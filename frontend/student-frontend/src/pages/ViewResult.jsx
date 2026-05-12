import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import ResultSummary from '../components/ResultSummary'

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
          <ResultSummary result={submission} />
          <div className="mt-4">
            <h4 className="font-semibold">Answers</h4>
            <div className="mt-2 space-y-3">
              {submission.answers.map(a=> (
                <div key={a.question._id} className="p-3 border rounded-md">
                  <div className="font-medium">{a.question.questionText}</div>
                  <div className="text-sm text-gray-600">Your answer: <strong>{a.selected}</strong> | Correct: <strong>{a.correct}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}