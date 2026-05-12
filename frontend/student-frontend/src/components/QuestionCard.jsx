import React from 'react'

export default function QuestionCard({ question, selected, onSelect, disabled }){
  const opts = question.options || {}
  const letters = ['a','b','c','d']

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">{question.questionText}</div>
      <div className="grid gap-3">
        {letters.map(l => (
          opts[l] ? (
            <label key={l} className={`p-3 border rounded-lg cursor-pointer transition ${selected===l? 'border-indigo-500 bg-indigo-50':'bg-white hover:shadow-sm'}`}>
              <input type="radio" name={question._id} checked={selected===l} onChange={()=>onSelect(l)} disabled={disabled} className="mr-2" />
              <span className="font-medium">{l.toUpperCase()}.</span> <span className="ml-2">{opts[l]}</span>
            </label>
          ) : null
        ))}
      </div>
    </div>
  )
}
