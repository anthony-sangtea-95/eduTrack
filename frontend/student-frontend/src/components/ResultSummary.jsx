import React from 'react'
import ProgressCircle from './ProgressCircle'

export default function ResultSummary({ result }){
  const correct = result.correct || 0
  const wrong = result.wrong || 0
  const total = result.test?.totalMarks || (correct + wrong) || 0
  const percent = total? Math.round((result.score / total) * 100):0
  const pass = percent >= (result.passPercentage || 50)

  const timeTaken = (result) => {
    const timeSeconds = result.timeTakenInSeconds || 0
    if (timeSeconds === 0) return '-'
    if (timeSeconds >= 3600) {
      const hours = Math.floor(timeSeconds / 3600)
      const mins = Math.floor((timeSeconds % 3600) / 60)
      const secs = Math.floor((timeSeconds % 3600) % 60)
      return `${hours}h ${mins}m ${secs}s`
    }
    if (timeSeconds >= 60) {
      const mins = Math.floor(timeSeconds / 60)
      const secs = timeSeconds % 60
      return `${mins}m ${secs}s`
    }
    return `${timeSeconds}s`
  }

  return (
    <div className="student-result-summary">
      <div className="student-result-visual">
        <ProgressCircle size={160} percent={percent} />
      </div>
      <div className="student-result-summary-copy">
        <p className="student-dashboard-eyebrow">Assessment complete</p>
        <h1>Your result</h1>
        <p className="student-result-summary-score">Score <strong>{result.score ?? '-'} <span>/ {total}</span></strong></p>
        <div className="student-result-summary-stats">
          <span><strong>{correct}</strong> correct</span>
          <span><strong>{wrong}</strong> wrong</span>
          <span><strong>{total}</strong> total</span>
        </div>
        <span className={`student-result-outcome ${pass ? 'passed' : 'failed'}`}>{pass ? 'Passed' : 'Not passed'}</span>
        <p className="student-result-time">Time taken <strong>{timeTaken(result)}</strong></p>
      </div>
    </div>
  )
}
