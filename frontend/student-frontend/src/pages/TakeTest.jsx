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
  const [attemptId, setAttemptId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  // const [loadingSubmit, setLoadingSubmit] = useState(false)
  const submittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const attemptCreated = useRef(false)
  const timerRef = useRef(null)
  const isRetake = searchParams.get('retake') === '1'
  const endTime = useRef(null);

  // load test and attempt
  useEffect(() => {
    if (attemptCreated.current) return;
    attemptCreated.current = true;
    const loadAttempt = async () => {
      try {
        const attempt = await API.post(`/student/tests/${testId}/attempt`)
        setAttemptId(attempt.data.submissionId || null)
      } catch (err) {
        console.error(err)
      }
    }

    loadAttempt()
  }, [testId])

  useEffect(()=>{
    const loadTest = async ()=>{
      try{
        const res = await API.get(`/student/tests/${testId}`)
        setTest(res.data.test)
        setQuestions(res.data.questions || [])
        const minutes = res.data.test?.durationMinutes || 30
        const saved = isRetake ? {} : JSON.parse(localStorage.getItem(`test:${testId}:answers`)||'{}')
        // const rawSavedTime = isRetake ? '' : localStorage.getItem(`test:${testId}:timeLeft`)||''
        // const parsedSavedTime = parseInt(rawSavedTime, 10)
        // const initialTime = Number.isFinite(parsedSavedTime) ? parsedSavedTime : minutes * 60

        if (isRetake) {
          localStorage.removeItem(`test:${testId}:answers`)
          // localStorage.removeItem(`test:${testId}:timeLeft`)
        }

        setTotalTime(minutes * 60)
        setAnswers(saved || {})
        setCurrent(0)
        setSubmitted(false)

        const saveEndTime = localStorage.getItem(`test:${testId}:endTime`);
        if (saveEndTime) {
          endTime.current = parseInt(saveEndTime, 10);
        } else {
          const newEndTime = Date.now() + totalTime * 1000;
          endTime.current = newEndTime;
          localStorage.setItem(
              `test:${testId}:endTime`,
              String(newEndTime)
          );
        }
        setTimeLeft(totalTime)
      }catch(err){
        console.error(err)
      }
    }
    loadTest()
  }, [testId, searchParams.toString()])

  // warn before unload
  useEffect(()=>{
    const handler = (e)=>{ if (!submitted) { e.preventDefault(); e.returnValue='Are you sure you want to leave? Your answers will be saved.' } }
    window.addEventListener('beforeunload', handler)
    return ()=> window.removeEventListener('beforeunload', handler)
  }, [submitted])

  useEffect(() => {
    if (!endTime.current) return;
    const id = setInterval(() => {
        const left = Math.max(
            0,
            Math.ceil((endTime.current - Date.now()) / 1000)
        );
        setTimeLeft(left);
        if (left === 0) {
            clearInterval(id);
            doSubmit(true);
        }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // autosave answers
  useEffect(()=>{
    localStorage.setItem(`test:${testId}:answers`, JSON.stringify(answers))
  }, [answers, testId])

  const onSelect = (opt)=>{
    if (submitted) return
    const q = questions[current]
    if (!q) return
    setAnswers(a=> ({...a, [q._id]: opt}))
  }

  const jumpTo = (idx)=>{ setCurrent(idx) }

  const doSubmit = useCallback(async (auto=false)=>{
    // if (loadingSubmit) return
    // setLoadingSubmit(true)
    if (submittingRef.current) return
    submittingRef.current = true
    try{
      const payload = { answers: Object.keys(answers).map(q=>({ question: q, selected: answers[q] })) , auto,
        submissionId: attemptId}
      const res = await API.post(`/student/tests/${testId}/submit`, payload)
      const submittedID = res.data.submittedId;
      setSubmitted(true)
      localStorage.removeItem(`test:${testId}:answers`)
      localStorage.removeItem(`test:${testId}:timeLeft`)
      // small delay for UX
      setTimeout(()=> navigate(`/tests/${testId}/${submittedID}/result`, { replace:true }), 800)
    }catch(err){
      console.error(err)
      alert('Submit failed. Please try again.')
    }finally{
      submittingRef.current = false
      // setLoadingSubmit(false)
    }
  },[answers, testId, submittingRef, navigate, totalTime, timeLeft])

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

        <SubmitModal open={showModal} onClose={()=>setShowModal(false)} onConfirm={()=>doSubmit(false)} loading={submittingRef.current} />
      </main>
    </div>
  )
}