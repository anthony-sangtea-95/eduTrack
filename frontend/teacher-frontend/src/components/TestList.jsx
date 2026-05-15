import React from 'react'
import { Link } from 'react-router-dom'
export default function TestList({ test, handleDelete }) {
    const statusColors = {
        'bg' : test.status === 'published' ? 'bg-green-100' :  'bg-red-100',
        'text' : test.status === 'published' ? 'text-green-800' : 'text-red-800'
    }
    const statusClassName = `text-xs ${statusColors.bg} ${statusColors.text} px-2 py-0.5 rounded`
    return (
            <li
              key={test._id}
              className="test-item"
            >
              <div className="test-info">
                <div className="flex items-center gap-3">
                  <strong>{test.title}</strong>
                  {test.status ? <span className={statusClassName}>{test.status}</span> : 'No Status'}
                </div>
                <div className="test-date">
                  Created: {new Date(test.createdAt).toLocaleDateString()}
                  {test.startTime ? <span className="ml-3">Starts: {new Date(test.startTime).toLocaleString()}</span> : null}
                  <div className="test-meta">
                    <span className="meta-item">Max attempts per student: <strong>{test.attemptRules?.maxAttempts ?? 1}</strong></span>
                    <span className="meta-item">Total submissions: <strong>{test.totalSubmissions ?? 0}</strong></span>
                    <span className="meta-item">Students submitted: <strong>{test.distinctStudentsSubmitted ?? 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="test-actions">
                <Link 
                  to={`/tests/manage/${test._id}`} 
                  className="btn-test btn-test-manage"
                >
                  Manage
                </Link>

                <Link 
                  to={`/tests/edit/${test._id}`} 
                  className="btn-test btn-test-edit"
                >
                  Edit
                </Link>

                <button 
                  onClick={() => handleDelete(test._id)} 
                  className="btn-test btn-test-delete"
                >
                  Delete
                </button>
              </div>
            </li>
    )
}