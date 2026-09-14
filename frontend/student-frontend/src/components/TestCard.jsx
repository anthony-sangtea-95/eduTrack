import React from 'react'
import { Link } from 'react-router-dom'

export default function TestCard({ test, testStatus, testAccess }){
  const attemptText = `${testAccess?.attemptCount ?? 0}/${testAccess?.maxAttempts ?? 1} used`;
  const canStart = testAccess && testAccess.canStart
  const canView = testAccess && testAccess.canViewResult
  const canRetake = testAccess && testAccess.canRetake
  const statusColors = {
    'bg': testStatus === 'published' ? 'bg-green-100' :
          testStatus === 'upcoming' ? 'bg-yellow-100':'bg-gray-100',
    'text': testStatus === 'published' ? 'text-green-800' :
            testStatus === 'upcoming' ? 'text-yellow-800' :'text-gray-800'
  }
  const testDateTime = testStatus === 'upcoming' ?
                       'Available at: ' + new Date(test.startTime).toLocaleString() :
                       testStatus === 'published' ?
                       'Expires at: ' + new Date(test.dueDate).toLocaleString() : '';
  const statusClassName = `text-xs ${statusColors.bg} ${statusColors.text} px-2 py-0.5 rounded`
  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">{test.title}</div> 
            {testStatus ? <span className={statusClassName}>{testStatus === 'published' ? 'active' : testStatus}</span> : 'No Status'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Subject: {test.subject?.subjectName || 'General'} {testDateTime && <span>| {testDateTime}</span>} </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
        <div>Total Questions: <span className="font-medium">{test.totalQuestions}</span></div>
        <div>Duration: <span className="font-medium">{test.durationMinutes}m</span></div>
        <div>Attempts: <span className="font-medium">{attemptText}</span></div>
      </div>
      <div className="mt-4 flex gap-2">
        {canStart ? <Link to={`/tests/${test._id}/take`} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Start</Link> : <button className="px-3 py-2 border rounded-md text-gray-400 cursor-not-allowed" disabled>Start</button>}
        {canView ? <Link to={`/tests/${test._id}/results`} className="px-3 py-2 border rounded-md">Results</Link> : <button className="px-3 py-2 border rounded-md text-gray-400 cursor-not-allowed" disabled>Result</button>}
        {canRetake ? <Link to={`/tests/${test._id}/take?retake=1`} className="px-3 py-2 border rounded-md">Retake</Link>: <button className="px-3 py-2 border rounded-md text-gray-400 cursor-not-allowed" disabled>Retake</button>}
      </div>
    </div>
  )
}
