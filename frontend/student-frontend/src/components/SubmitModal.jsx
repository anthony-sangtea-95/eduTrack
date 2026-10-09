import React from 'react'

export default function SubmitModal({ open, onClose, onConfirm, loading }){
  if (!open) return null
  return (
    <div className="student-modal-backdrop">
      <div className="student-submit-modal" role="dialog" aria-modal="true" aria-labelledby="submit-test-title" aria-describedby="submit-test-description">
        <span className="student-modal-icon" aria-hidden="true">?</span>
        <h2 id="submit-test-title">Submit this test?</h2>
        <p id="submit-test-description">Once submitted, you can’t change your answers. Make sure you’re ready to finish.</p>
        <div className="student-modal-actions">
          <button className="student-nav-button secondary" onClick={onClose} disabled={loading}>Keep working</button>
          <button className="student-nav-button primary" onClick={onConfirm} disabled={loading}>{loading? 'Submitting…':'Submit test'}</button>
        </div>
      </div>
    </div>
  )
}
