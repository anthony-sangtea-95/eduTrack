import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../services/api'

export default function TakeTest(){
  const { testId } = useParams()
  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const timerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const load = async () => {
      try{
        const res = await API.get(`/student/tests/${testId}`)
        setTest(res.data.test)
        setQuestions(res.data.questions)
        // default 30 minutes if not provided
        const minutes = res.data.test?.durationMinutes || 30
        setTimeLeft(minutes * 60)
      }catch(err){
        console.error(err)
      }
    }
    load()
  }, [testId])

  useEffect(()=>{
    if (timeLeft == null) return
    if (timeLeft <= 0) {
      // auto-submit
      submit()
      return
    }
    timerRef.current = setInterval(()=>{
      setTimeLeft(t => t-1)
    }, 1000)
    return ()=> clearInterval(timerRef.current)
  }, [timeLeft])

  const selectAnswer = (qId, option) => {
    setAnswers(a => ({ ...a, [qId]: option }))
  }

  const submit = async () => {
    try{
      const payload = { answers: Object.keys(answers).map(q=>({ question: q, selected: answers[q] })) }
      const res = await API.post(`/student/tests/${testId}/submit`, payload)
      navigate(`/tests/${testId}/result`, { replace: true })
    }catch(err){
      console.error(err)
    }
  }

  if (!test) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">Loading test...</div></main></div>

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="header">
          <h1>{test.title}</h1>
          <div className="timer">Time left: {timeLeft != null ? `${Math.floor(timeLeft/60)}m ${timeLeft%60}s` : '-'}</div>
        </div>

        <div className="card">
          {questions.map(q => (
            <div key={q._id} style={{marginBottom:12}}>
              <div><strong>{q.questionText}</strong></div>
              <div className="small">A: <label><input type="radio" name={q._id} checked={answers[q._id]==='a'} onChange={()=>selectAnswer(q._id,'a')} /> {q.options?.a}</label></div>
              <div className="small">B: <label><input type="radio" name={q._id} checked={answers[q._id]==='b'} onChange={()=>selectAnswer(q._id,'b')} /> {q.options?.b}</label></div>
              <div className="small">C: <label><input type="radio" name={q._id} checked={answers[q._id]==='c'} onChange={()=>selectAnswer(q._id,'c')} /> {q.options?.c}</label></div>
              <div className="small">D: <label><input type="radio" name={q._id} checked={answers[q._id]==='d'} onChange={()=>selectAnswer(q._id,'d')} /> {q.options?.d}</label></div>
            </div>
          ))}

          <div style={{marginTop:12}}>
            <button className="button" onClick={submit}>Submit Test</button>
          </div>
        </div>
      </main>
    </div>
  )
}