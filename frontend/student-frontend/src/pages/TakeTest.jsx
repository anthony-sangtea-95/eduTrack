import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import API from '../services/api'
import Timer from '../components/Timer'
import QuestionPalette from '../components/QuestionPalette'
import QuestionCard from '../components/QuestionCard'
import SubmitModal from '../components/SubmitModal'

export default function TakeTest(){
  const { testId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [test, setTest] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const timerRef = useRef(null)

  // load test and attempt
  useEffect(()=>{
    const load = async ()=>{
      try{
        const res = await API.get(`/student/tests/${testId}`)
        setTest(res.data.test)
        setQuestions(res.data.questions || [])
        const minutes = res.data.test?.durationMinutes || 30
        const saved = JSON.parse(localStorage.getItem(`test:${testId}:answers`)||'{}')
        const savedTime = parseInt(localStorage.getItem(`test:${testId}:timeLeft`)||'')
        setAnswers(saved || {})
        setTimeLeft(savedTime || (minutes*60))
      }catch(err){
        console.error(err)
      }
    }
    load()
  }, [testId])

  // warn before unload
  useEffect(()=>{
    const handler = (e)=>{ if (!submitted) { e.preventDefault(); e.returnValue='Are you sure you want to leave? Your answers will be saved.' } }
    window.addEventListener('beforeunload', handler)
    return ()=> window.removeEventListener('beforeunload', handler)
  }, [submitted])

  // timer
  useEffect(()=>{
    if (timeLeft == null) return
    if (timeLeft <= 0){
      doSubmit(true)
      return
    }
    timerRef.current = setInterval(()=>{
      setTimeLeft(t=>t-1)
    }, 1000)
    return ()=> clearInterval(timerRef.current)
  }, [timeLeft])

  // autosave answers
  useEffect(()=>{
    localStorage.setItem(`test:${testId}:answers`, JSON.stringify(answers))
  }, [answers, testId])
  useEffect(()=>{
    if (timeLeft!=null) localStorage.setItem(`test:${testId}:timeLeft`, String(timeLeft))
  }, [timeLeft, testId])

  const onSelect = (opt)=>{
    if (submitted) return
    const q = questions[current]
    if (!q) return
    setAnswers(a=> ({...a, [q._id]: opt}))
  }

  const jumpTo = (idx)=>{ setCurrent(idx) }

  const doSubmit = useCallback(async (auto=false)=>{
    if (submitted) return
    setLoadingSubmit(true)
    try{
      const payload = { answers: Object.keys(answers).map(q=>({ question: q, selected: answers[q] })) , auto }
      await API.post(`/student/tests/${testId}/submit`, payload)
      setSubmitted(true)
      localStorage.removeItem(`test:${testId}:answers`)
      localStorage.removeItem(`test:${testId}:timeLeft`)
      // small delay for UX
      setTimeout(()=> navigate(`/tests/${testId}/result`, { replace:true }), 800)
    }catch(err){
      console.error(err)
      alert('Submit failed. Please try again.')
    }finally{
      setLoadingSubmit(false)
    }
  },[answers, testId, submitted, navigate])

  if (!test) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">Loading...</div></main></div>

  const now = new Date()
  const startsAt = test.startTime ? new Date(test.startTime) : null
  const allowedToTake = test.isPublished && (!test.status || test.status === 'published') && (!startsAt || startsAt <= now)

  if (!allowedToTake) {
    let message = 'This test is not available.'
    if (startsAt && startsAt > now) message = `Test will start at ${startsAt.toLocaleString()}`
    else if (!test.isPublished) message = 'Test is not published yet.'
    else if (test.status === 'closed') message = 'This test is closed.'

    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <div className="card">
            <h2 className="text-xl font-semibold">{test.title}</h2>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
            <div className="mt-4"><button className="px-3 py-2 border rounded-md" onClick={()=>window.history.back()}>Back</button></div>
          </div>
        </main>
      </div>
    )
  }

  const currentQuestion = questions[current]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <div>
              <div className="text-lg font-semibold">{test.title}</div>
              <div className="text-sm text-gray-500">{test.subject?.subjectName || 'No subject'}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">Progress: {answeredCount}/{questions.length}</div>
              <Timer timeLeft={timeLeft} onExpire={()=>doSubmit(true)} />
              <button className="px-3 py-2 bg-red-500 text-white rounded-md" onClick={()=>setShowModal(true)} disabled={submitted}>Submit</button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">Question {current+1} of {questions.length}</div>
                <div className="text-sm text-gray-600">Mark for review</div>
              </div>
              {currentQuestion ? <QuestionCard question={currentQuestion} selected={answers[currentQuestion._id]} onSelect={onSelect} disabled={submitted} /> : <div>No question</div>}
              <div className="mt-4 flex justify-between">
                <div>
                  { current !== 0 ? <button className="px-3 py-2 border rounded-md" onClick={()=>setCurrent(c=>Math.max(0,c-1))}>Previous</button> : '' }
                </div>
                <div>
                  { current !== questions.length-1 ? <button className="px-3 py-2 border rounded-md" onClick={()=>setCurrent(c=>Math.min(questions.length-1,c+1))}>Next</button> : '' }
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500">Autosave enabled. Answers saved locally.</div>
          </div>

          <aside className="space-y-4">
            <div className="card">
              <h4 className="font-semibold mb-2">Navigation</h4>
              <QuestionPalette questions={questions} answers={answers} currentIndex={current} onJump={jumpTo} />
            </div>

            <div className="card">
              <h4 className="font-semibold mb-2">Summary</h4>
              <div className="text-sm">Answered: <strong>{answeredCount}</strong></div>
              <div className="text-sm">Remaining: <strong>{questions.length - answeredCount}</strong></div>
            </div>
          </aside>
        </div>

        <SubmitModal open={showModal} onClose={()=>setShowModal(false)} onConfirm={()=>doSubmit(false)} loading={loadingSubmit} />
      </main>
    </div>
  )
}