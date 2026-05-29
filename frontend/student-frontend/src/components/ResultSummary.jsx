import React from 'react'
import ProgressCircle from './ProgressCircle'

export default function ResultSummary({ result }){
  console.log("ResultSummary", result)
  const correct = result.correct || 0
  const wrong = result.wrong || 0
  const total = correct + wrong
  const percent = total? Math.round((correct/total)*100):0
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
    <div className="grid md:grid-cols-2 gap-6 items-center">
      <div className="flex items-center justify-center">
        <ProgressCircle size={160} percent={percent} />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Your Result</h2>
        <div className="text-lg">Score: <span className="font-medium">{result.score ?? '-'} </span></div>
        <div className="text-sm text-gray-600">Correct: <strong>{correct}</strong> | Wrong: <strong>{wrong}</strong> | Total: <strong>{total}</strong></div>
        <div className="mt-2">
          <span className={`px-3 py-1 rounded-full ${pass? 'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{pass? 'Pass':'Fail'}</span>
        </div>
        <div className="text-sm text-gray-500 mt-2">Time taken: <strong>{timeTaken(result)}</strong></div>
      </div>
    </div>
  )
}
