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
  const [timeLeft, setTimeLeft] = useState(null)
  const submittingRef = useRef(false);
  const [submitted, setSubmitted] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const attemptCreated = useRef(false)
  const timerRef = useRef(null)
  const isRetake = searchParams.get('retake') === '1'
  const endTime = useRef(null);
  const [timerReady, setTimerReady] = useState(false);
  const [loading, setLoading] = useState(true);

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
        const durationMinutes = res.data.test?.durationMinutes || 30
        const saved = isRetake ? {} : JSON.parse(localStorage.getItem(`test:${testId}:answers`)||'{}')

        if (isRetake) {
          localStorage.removeItem(`test:${testId}:answers`)
        }

        setAnswers(saved || {})
        setCurrent(0)
        setSubmitted(false)

        const saveEndTime = localStorage.getItem(`test:${testId}:endTime`);
        if (saveEndTime) {
          endTime.current = parseInt(saveEndTime, 10);
        } else {
          const newEndTime = Date.now() + durationMinutes * 60 * 1000;
          endTime.current = newEndTime;
          localStorage.setItem(
              `test:${testId}:endTime`,
              String(newEndTime)
          );
        }
        setTimeLeft(
            Math.max(
                0,
                Math.ceil((endTime.current - Date.now()) / 1000)
            )
        );
        setTimerReady(true);
      }catch(err){
        console.error(err)
      } finally {
        setLoading(false)
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
    if (!timerReady) return;
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
  }, [timerReady]);

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
    if (submittingRef.current) return
    submittingRef.current = true
    try{
      const payload = { answers: Object.keys(answers).map(q=>({ question: q, selected: answers[q] })) , auto,
        submissionId: attemptId}
      const res = await API.post(`/student/tests/${testId}/submit`, payload)
      const submittedID = res.data.submittedId;
      setSubmitted(true)
      localStorage.removeItem(`test:${testId}:answers`)
      localStorage.removeItem(`test:${testId}:endTime`)
      // small delay for UX
      setTimeout(()=> navigate(`/tests/${testId}/${submittedID}/result`, { replace:true }), 800)
    }catch(err){
      console.error(err)
      submittingRef.current = false
      alert('Submit failed. Please try again.')
    }
  },[answers, testId, submittingRef, navigate])

  if (loading) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">Loading test…</div></main></div>
  if (!test) return <div className="app-shell"><Sidebar /><main className="main"><div className="card">Test not found</div></main></div>

  const currentQuestion = questions[current]
  const answeredCount = Object.keys(answers).length

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main student-take-page">
        <div className="student-test-topbar">
          <div className="student-test-topbar-inner">
            <div className="student-test-heading">
              <p className="student-test-eyebrow">Assessment in progress</p>
              <h1>{test.title}</h1>
              <p>{test.subject?.subjectName || 'No subject'}</p>
            </div>
            <div className="student-test-controls">
              <div className="student-test-progress">
                <span>Progress</span>
                <strong>{answeredCount}<span> / {questions.length}</span></strong>
              </div>
              <Timer timeLeft={timeLeft} onExpire={()=>doSubmit(true)} />
              <button className="student-submit-button" onClick={()=>setShowModal(true)} disabled={submitted}>Submit test</button>
            </div>
          </div>
        </div>

        <div className="student-exam-layout">
          <div className="student-exam-main">
            <div className="card student-question-panel">
              <div className="student-question-meta">
                <span>Question <strong>{current+1}</strong> of {questions.length}</span>
                <span className={answers[currentQuestion?._id] ? 'student-answer-state answered' : 'student-answer-state'}>
                  {answers[currentQuestion?._id] ? 'Answered' : 'Not answered'}
                </span>
              </div>
              {currentQuestion ? <QuestionCard question={currentQuestion} selected={answers[currentQuestion._id]} onSelect={onSelect} disabled={submitted} /> : <div>No question</div>}
              <div className="student-question-navigation">
                {current !== 0
                  ? <button className="student-nav-button secondary" onClick={()=>setCurrent(c=>Math.max(0,c-1))}>← Previous</button>
                  : <span />}
                {current !== questions.length-1
                  ? <button className="student-nav-button primary" onClick={()=>setCurrent(c=>Math.min(questions.length-1,c+1))}>Next question →</button>
                  : <span />}
              </div>
            </div>

            <div className="student-autosave-note"><span aria-hidden="true">✓</span> Your answers are saved automatically on this device.</div>
          </div>

          <aside className="student-exam-aside">
            <div className="card student-navigation-card">
              <div className="student-side-heading">
                <div>
                  <h2>Question navigator</h2>
                  <p>Select a question to jump to it.</p>
                </div>
              </div>
              <QuestionPalette questions={questions} answers={answers} currentIndex={current} onJump={jumpTo} />
              <div className="student-palette-legend">
                <span><i className="current" />Current</span>
                <span><i className="complete" />Answered</span>
                <span><i />Unanswered</span>
              </div>
            </div>

            <div className="card student-answer-summary">
              <h2>Answer summary</h2>
              <div><span>Answered</span><strong>{answeredCount}</strong></div>
              <div><span>Remaining</span><strong>{questions.length - answeredCount}</strong></div>
            </div>
          </aside>
        </div>

        <SubmitModal open={showModal} onClose={()=>setShowModal(false)} onConfirm={()=>doSubmit(false)} loading={submittingRef.current} />
      </main>
    </div>
  )
}