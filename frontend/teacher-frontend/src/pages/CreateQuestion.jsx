import React from 'react'
import QuestionForm from '../components/QuestionForm'
import { useAuth } from '../context/AuthContext'

export default function CreateQuestion() {
  const { user } = useAuth()

  const handleSubmit = async (questionData) => {
    const payload = {
      ...questionData,
      teacherId: user.id, // 🔐 important
    }

    await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
    alert('Question created!')
  }

  return (
    <div className="page">
      <h2>Create Question</h2>
      <QuestionForm onSubmit={handleSubmit} />
    </div>
  )
}
