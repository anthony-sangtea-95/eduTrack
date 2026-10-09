import React from 'react'
import { Link } from 'react-router-dom'
export default function TestList({ test, handleDelete }) {
    const statusClassName = `test-status-badge test-status-${test.status || 'draft'}`
    const createdDate = test.createdAt ? new Date(test.createdAt).toLocaleDateString() : '—'
    return (
      <li className="test-item">
        <div className="test-info">
          <div className="test-title-row">
            <strong className="test-title">{test.title}</strong>
            <span className={statusClassName}>{test.status || 'draft'}</span>
            {test.totalQuestions > 0
              ? <span className="test-question-count">{test.totalQuestions} questions</span>
              : <span className="test-question-count test-question-count-empty">No questions</span>}
          </div>
          <div className="test-date">
            <span>Created {createdDate}</span>
            {test.startTime && <span>Starts {new Date(test.startTime).toLocaleString()}</span>}
          </div>
          <div className="test-meta">
            <span className="meta-item">Attempts <strong>{test.attemptRules?.maxAttempts ?? 1}</strong></span>
            <span className="meta-item">Submissions <strong>{test.totalSubmissions ?? 0}</strong></span>
            <span className="meta-item">Students submitted <strong>{test.distinctStudentsSubmitted ?? 0}</strong></span>
          </div>
        </div>

        <div className="test-actions">
          <Link to={`/tests/manage/${test._id}`} className="btn-test btn-test-manage">Manage questions</Link>
          <Link to={`/tests/edit/${test._id}`} className="btn-test btn-test-edit">Edit test</Link>
          <button type="button" onClick={() => handleDelete(test._id)} className="btn-test btn-test-delete">Delete</button>
        </div>
      </li>
    )
}