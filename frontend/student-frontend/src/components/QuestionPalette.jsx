import React from 'react'

export default function QuestionPalette({ questions, answers, currentIndex, onJump }){
  return (
    <div className="grid grid-cols-6 gap-2 p-2">
      {questions.map((q, idx) => {
        const qid = q._id || q.id || idx
        const answered = !!answers[qid]
        const isCurrent = idx === currentIndex
        const base = "w-10 h-10 flex items-center justify-center rounded-md font-medium cursor-pointer"
        const cls = isCurrent ? 'bg-indigo-600 text-white shadow-md' : answered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
        return (
          <div key={qid} className={`${base} ${cls}`} onClick={()=>onJump(idx)}>{idx+1}</div>
        )
      })}
    </div>
  )
}
