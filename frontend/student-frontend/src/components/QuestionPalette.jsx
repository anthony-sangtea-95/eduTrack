import React from 'react'

export default function QuestionPalette({ questions, answers, currentIndex, onJump }){
  return (
    <div className="student-question-palette">
      {questions.map((q, idx) => {
        const qid = q._id || q.id || idx
        const answered = !!answers[qid]
        const isCurrent = idx === currentIndex
        const cls = isCurrent ? 'current' : answered ? 'answered' : ''
        return <button key={qid} type="button" className={`student-question-jump ${cls}`} onClick={()=>onJump(idx)} aria-label={`Go to question ${idx + 1}${answered ? ', answered' : ', unanswered'}${isCurrent ? ', current question' : ''}`} aria-current={isCurrent ? 'step' : undefined}>{idx+1}</button>
      })}
    </div>
  )
}
