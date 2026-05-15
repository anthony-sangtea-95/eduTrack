import React from 'react'
import { Link } from 'react-router-dom'

export default function TestCard({ test, testAccess }){
  const attemptText = `${testAccess?.attemptCount ?? 0}/${testAccess?.maxAttempts ?? 1} used`;
  const canView = testAccess && testAccess.canViewResult
  const canRetake = testAccess && testAccess.canRetake
  const statusColors = {
    'bg' : test.status === 'published' ? 'bg-green-100' :  'bg-red-100',
    'text' : test.status === 'published' ? 'text-green-800' : 'text-red-800'
  }
  const statusClassName = `text-xs ${statusColors.bg} ${statusColors.text} px-2 py-0.5 rounded`

  const startDisabled = !test.isPublished || (test.startTime && new Date(test.startTime) > new Date()) || (testAccess && testAccess.attempted)

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">{test.title}</div> 
            {test.status ? <span className={statusClassName}>{test.status === 'published' ? 'open' : test.status}</span> : 'No Status'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Subject: {test.subject?.subjectName || 'General'}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
        <div>Total Questions: <span className="font-medium">{test.totalQuestions}</span></div>
        <div>Duration: <span className="font-medium">{test.durationMinutes}m</span></div>
        <div>Attempts: <span className="font-medium">{attemptText}</span></div>
      </div>
      <div className="mt-4 flex gap-2">
        {startDisabled ? (
          <button className="px-3 py-2 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed" disabled>Start</button>
        ) : (
          <Link to={`/tests/${test._id}/take`} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Start</Link>
        )}

        {canView ? <Link to={`/tests/${test._id}/result`} className="px-3 py-2 border rounded-md">View Result</Link> : <button className="px-3 py-2 border rounded-md text-gray-400 cursor-not-allowed" disabled>View Result</button>}
        {canRetake ? <Link to={`/tests/${test._id}/take?retake=1`} className="px-3 py-2 border rounded-md">Retake</Link>: <button className="px-3 py-2 border rounded-md text-gray-400 cursor-not-allowed" disabled>Retake</button>}
      </div>
    </div>
  )
}
