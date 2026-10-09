import React from 'react'

export default function QuestionCard({ question, selected, onSelect, disabled }){
  const opts = question.options || {}
  const letters = ['a','b','c','d']

  return (
    <div className="student-question-content">
      <h2 className="student-question-prompt">{question.questionText}</h2>
      <div className="student-answer-options">
        {letters.map(l => (
          opts[l] ? (
            <label key={l} className={`student-answer-option ${selected===l ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}>
              <input type="radio" name={question._id} checked={selected===l} onChange={()=>onSelect(l)} disabled={disabled} />
              <span className="student-answer-letter">{l.toUpperCase()}</span>
              <span className="student-answer-text">{opts[l]}</span>
            </label>
          ) : null
        ))}
      </div>
    </div>
  )
}
