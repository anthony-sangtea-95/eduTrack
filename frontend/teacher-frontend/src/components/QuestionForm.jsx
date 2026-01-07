import React, { useState } from 'react'

export default function QuestionForm({ onSubmit }) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)

  const handleOptionChange = (value, index) => {
    const updated = [...options]
    updated[index] = value
    setOptions(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    onSubmit({
      question,
      options,
      correctIndex,
    })

    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrectIndex(0)
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <label>Question</label>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        required
      />

      <label>Options</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <input
            type="radio"
            name="correct"
            checked={correctIndex === i}
            onChange={() => setCorrectIndex(i)}
          />
          <input
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, i)}
            placeholder={`Option ${i + 1}`}
            required
          />
        </div>
      ))}

      <button className="button" type="submit">
        Save Question
      </button>
    </form>
  )
}
