import React from 'react'
import ProgressCircle from './ProgressCircle'

export default function ResultSummary({ result }){
  const correct = result.correct || 0
  const wrong = result.wrong || 0
  const total = correct + wrong
  const percent = total? Math.round((correct/total)*100):0
  const pass = percent >= (result.passPercentage || 50)

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
        <div className="text-sm text-gray-500 mt-2">Time taken: <strong>{result.timeTaken ?? '-'}</strong></div>
      </div>
    </div>
  )
}
