import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import ResultSummary from '../components/ResultSummary'

export default function ViewResult(){
  const { testId, submittedID } = useParams()
  const [submission, setSubmission] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const load = async () => {
      const res = await API.get(`/student/tests/${testId}/${submittedID}/result`).catch(()=>({data:null}))
      setSubmission(res.data)
    }
    load()
  }, [testId])

  if (!submission) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">No result found</div></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <button className="text-slate-600 text-sm hover:underline" onClick={() => navigate("/tests")}>
          ← Back
        </button>
        {/* <div className="header">
          <h1>Result</h1>
        </div> */}
        <div className="card mt-2">
          <ResultSummary result={submission} />
          <div className="mt-4">
            <h4 className="font-semibold">Answers</h4>
            <div className="mt-2 space-y-3">
              {submission.answers.map(a=> (
                // <div key={a.question._id} className="p-3 border rounded-md">
                <div key={a.question._id} className={`p-3 border rounded-md ${a.selected === a.question.correctOption ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="font-medium">{a.question.questionText}</div>
                  {/* <div className="text-sm text-gray-600">Your answer: <strong>{a.selected}</strong> | Correct: <strong>{a.question.correctOption}</strong></div> */}
                  <div className="text-sm text-gray-600">
                    Your answer: <strong>{`${a.selected}.${a.question.options?.[a.selected]}` ?? 'No option text'}</strong> | 
                    Correct: <strong>{`${a.question.correctOption}.${a.question.options?.[a.question.correctOption]}` ?? 'No correct option text'}</strong></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}